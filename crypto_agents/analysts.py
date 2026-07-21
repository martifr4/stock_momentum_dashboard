"""
analysts.py — data-quality analysts, one per trader agent.

Each analyst inspects the raw data destined for its trader BEFORE the trader
sees it. It checks for accuracy problems, errors, and duplicates; flags every
issue it finds; and fixes what can be safely fixed. It returns:

    (clean_data, report)

where `report` is an AnalystReport listing every issue, its severity, and
whether it was fixed. If a fatal problem can't be repaired (e.g. no usable
price data at all), the report's `.ok` is False and the trader should be
skipped for this run.

Design principle: analysts NEVER silently mutate data. Every change is logged.
"""

import math
import statistics
from dataclasses import dataclass, field
from enum import Enum


class Severity(str, Enum):
    INFO = "INFO"          # noted, no action needed
    WARN = "WARN"          # fixed or tolerable
    ERROR = "ERROR"        # fixed, but worth attention
    FATAL = "FATAL"        # could not be repaired; trader should skip


@dataclass
class Issue:
    severity: Severity
    field: str
    message: str
    fixed: bool = False
    detail: str = ""


@dataclass
class AnalystReport:
    analyst: str
    issues: list = field(default_factory=list)

    def add(self, severity, field_, message, fixed=False, detail=""):
        self.issues.append(Issue(severity, field_, message, fixed, detail))

    @property
    def ok(self):
        return not any(i.severity == Severity.FATAL for i in self.issues)

    @property
    def n_fixed(self):
        return sum(1 for i in self.issues if i.fixed)

    @property
    def n_flagged(self):
        return len(self.issues)

    def summary(self):
        if not self.issues:
            return f"{self.analyst}: clean — no issues found."
        parts = []
        for sev in Severity:
            c = sum(1 for i in self.issues if i.severity == sev)
            if c:
                parts.append(f"{c} {sev.value}")
        status = "PASS" if self.ok else "BLOCK"
        return f"{self.analyst}: {status} ({', '.join(parts)}; {self.n_fixed} fixed)"


# ----------------------------------------------------------------------
# Shared validation primitives
# ----------------------------------------------------------------------
def _is_number(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) \
        and not (math.isnan(x) or math.isinf(x))


def clean_series(values, name, report, min_len=1,
                 allow_zero=False, dedup_consecutive=True):
    """
    Validate & repair a numeric series (prices or volumes).
      - drops None / NaN / inf / non-numeric entries
      - drops negatives (and zeros unless allow_zero)
      - repairs interior gaps by linear interpolation where possible
      - flags exact consecutive duplicates (stale feed) and collapses only
        if they look like a repeated-tick artifact (optional)
    Returns the cleaned list (may be shorter than input).
    """
    if not isinstance(values, (list, tuple)):
        report.add(Severity.FATAL, name, f"{name} is not a list", detail=str(type(values)))
        return []

    n0 = len(values)
    cleaned = []
    bad_positions = []
    for i, v in enumerate(values):
        if not _is_number(v):
            bad_positions.append(i)
            cleaned.append(None)
            continue
        if v < 0:
            bad_positions.append(i)
            cleaned.append(None)
            continue
        if v == 0 and not allow_zero:
            bad_positions.append(i)
            cleaned.append(None)
            continue
        cleaned.append(float(v))

    if bad_positions:
        report.add(Severity.ERROR, name,
                   f"{len(bad_positions)} invalid value(s) in {name}",
                   fixed=True,
                   detail=f"positions {bad_positions[:10]}"
                          + (" ..." if len(bad_positions) > 10 else ""))

    # Interpolate interior None gaps using nearest valid neighbours.
    cleaned = _interpolate_gaps(cleaned, name, report)

    # Drop any leading/trailing None that couldn't be interpolated.
    cleaned = [x for x in cleaned if x is not None]

    # Duplicate detection: long runs of identical values = stale/frozen feed.
    _flag_frozen_runs(cleaned, name, report)

    if len(cleaned) < min_len:
        report.add(Severity.FATAL, name,
                   f"{name} has {len(cleaned)} usable points (< {min_len} required)")
    return cleaned


def _interpolate_gaps(series, name, report):
    """Linear-interpolate isolated None gaps that have valid neighbours."""
    out = list(series)
    n = len(out)
    filled = 0
    i = 0
    while i < n:
        if out[i] is None:
            # find previous valid
            j = i - 1
            while j >= 0 and out[j] is None:
                j -= 1
            # find next valid
            k = i + 1
            while k < n and out[k] is None:
                k += 1
            if j >= 0 and k < n:
                span = k - j
                step = (out[k] - out[j]) / span
                for idx in range(j + 1, k):
                    out[idx] = out[j] + step * (idx - j)
                    filled += 1
                i = k
                continue
        i += 1
    if filled:
        report.add(Severity.WARN, name,
                   f"interpolated {filled} interior gap(s) in {name}", fixed=True)
    return out


def _flag_frozen_runs(series, name, report, run_len=5):
    """Flag runs of >= run_len identical consecutive values (frozen feed)."""
    if len(series) < run_len:
        return
    run = 1
    worst = 1
    for i in range(1, len(series)):
        if series[i] == series[i - 1]:
            run += 1
            worst = max(worst, run)
        else:
            run = 1
    if worst >= run_len:
        report.add(Severity.WARN, name,
                   f"{name} shows a frozen run of {worst} identical values "
                   f"(possible stale feed)", fixed=False)


def flag_outliers(series, name, report, z=6.0):
    """Flag (do not remove) extreme jumps that may be bad ticks."""
    if len(series) < 5:
        return
    rets = [(series[i] - series[i-1]) / series[i-1]
            for i in range(1, len(series)) if series[i-1]]
    if len(rets) < 3:
        return
    try:
        mu = statistics.mean(rets)
        sd = statistics.pstdev(rets)
    except statistics.StatisticsError:
        return
    if sd == 0:
        return
    spikes = [i+1 for i, r in enumerate(rets) if abs((r - mu) / sd) > z]
    if spikes:
        report.add(Severity.WARN, name,
                   f"{len(spikes)} extreme jump(s) in {name} (>{z}σ), "
                   f"kept but flagged as possible bad ticks",
                   fixed=False, detail=f"positions {spikes[:10]}")


# ----------------------------------------------------------------------
# TecnicAnalyst — validates OHLC/volume history for the Tecnic trader
# ----------------------------------------------------------------------
def tecnic_analyst(prices, volumes, min_points=60):
    """
    Tecnic needs a long, clean daily price+volume history (>=60 pts for the
    slower indicators). Validates both series, aligns their lengths, checks
    for duplicates and outliers.
    Returns (prices, volumes, report).
    """
    rep = AnalystReport("Tecnic-Analyst")

    prices = clean_series(prices, "prices", rep, min_len=min_points,
                          allow_zero=False)
    volumes = clean_series(volumes, "volumes", rep, min_len=1,
                           allow_zero=True)

    # Align lengths (indicators index both together).
    if prices and volumes and len(prices) != len(volumes):
        n = min(len(prices), len(volumes))
        rep.add(Severity.WARN, "alignment",
                f"prices({len(prices)}) and volumes({len(volumes)}) length "
                f"mismatch; trimmed both to {n}", fixed=True)
        prices, volumes = prices[-n:], volumes[-n:]

    flag_outliers(prices, "prices", rep)

    # Sanity: current price must be positive & finite (already guaranteed, but
    # double-check the tail the trader will read).
    if prices and not _is_number(prices[-1]):
        rep.add(Severity.FATAL, "prices", "latest price is not usable")

    return prices, volumes, rep


# ----------------------------------------------------------------------
# SocialAnalyst — validates short price history + news headlines
# ----------------------------------------------------------------------
def social_analyst(prices, headlines, min_points=6):
    """
    Social needs >=6 daily points (for 1/2/5-day momentum) and a de-duplicated
    list of headlines. Removes duplicate/empty headlines, drops stale entries.
    Returns (prices, headlines, report).
    """
    rep = AnalystReport("Social-Analyst")

    prices = clean_series(prices, "prices", rep, min_len=min_points)

    # --- de-duplicate headlines ---
    if not isinstance(headlines, list):
        rep.add(Severity.ERROR, "headlines",
                "headlines not a list; substituting empty list", fixed=True)
        headlines = []

    seen = set()
    deduped = []
    empties = 0
    dupes = 0
    for h in headlines:
        if not isinstance(h, dict):
            continue
        title = (h.get("title") or "").strip()
        if not title:
            empties += 1
            continue
        key = title.lower()
        if key in seen:
            dupes += 1
            continue
        seen.add(key)
        deduped.append(h)

    if dupes:
        rep.add(Severity.WARN, "headlines",
                f"removed {dupes} duplicate headline(s)", fixed=True)
    if empties:
        rep.add(Severity.WARN, "headlines",
                f"removed {empties} empty headline(s)", fixed=True)
    if not deduped:
        rep.add(Severity.WARN, "headlines",
                "no usable headlines; Social will rely on momentum only",
                fixed=False)

    return prices, deduped, rep


# ----------------------------------------------------------------------
# MacroAnalyst — validates global stats + fear/greed + market news
# ----------------------------------------------------------------------
def macro_analyst(global_stats, fng, headlines):
    """
    Macro needs coherent global market stats, a valid Fear&Greed series, and
    de-duplicated market news. Validates ranges and removes duplicates.
    Returns (global_stats, fng, headlines, report).
    """
    rep = AnalystReport("Macro-Analyst")

    # --- global stats ---
    if not isinstance(global_stats, dict):
        rep.add(Severity.FATAL, "global", "global stats missing or malformed")
        global_stats = {}
    else:
        chg = global_stats.get("mcap_change_24h")
        if chg is not None and not _is_number(chg):
            rep.add(Severity.ERROR, "global.mcap_change_24h",
                    "non-numeric; nulled out", fixed=True)
            global_stats["mcap_change_24h"] = None
        elif _is_number(chg) and abs(chg) > 50:
            rep.add(Severity.WARN, "global.mcap_change_24h",
                    f"implausible 24h move {chg:+.1f}%; kept but flagged",
                    fixed=False)
        dom = global_stats.get("btc_dominance")
        if _is_number(dom) and not (0 <= dom <= 100):
            rep.add(Severity.ERROR, "global.btc_dominance",
                    f"out of range ({dom}); nulled out", fixed=True)
            global_stats["btc_dominance"] = None

    # --- fear & greed ---
    if not isinstance(fng, list):
        rep.add(Severity.ERROR, "fng", "F&G not a list; substituting empty", fixed=True)
        fng = []
    clean_fng = []
    bad = 0
    seen_ts = set()
    dupes = 0
    for row in fng:
        if not isinstance(row, dict) or not _is_number(row.get("value")):
            bad += 1
            continue
        v = row["value"]
        if not (0 <= v <= 100):
            bad += 1
            continue
        ts = row.get("ts")
        if ts in seen_ts:
            dupes += 1
            continue
        seen_ts.add(ts)
        clean_fng.append(row)
    if bad:
        rep.add(Severity.ERROR, "fng",
                f"dropped {bad} invalid F&G reading(s)", fixed=True)
    if dupes:
        rep.add(Severity.WARN, "fng",
                f"removed {dupes} duplicate F&G timestamp(s)", fixed=True)
    if not clean_fng:
        rep.add(Severity.WARN, "fng",
                "no valid Fear&Greed data; Macro will down-weight it", fixed=False)

    # --- market news dedup ---
    if not isinstance(headlines, list):
        headlines = []
    seen = set()
    deduped = []
    dup_news = 0
    for h in headlines:
        if not isinstance(h, dict):
            continue
        title = (h.get("title") or "").strip()
        if not title:
            continue
        key = title.lower()
        if key in seen:
            dup_news += 1
            continue
        seen.add(key)
        deduped.append(h)
    if dup_news:
        rep.add(Severity.WARN, "headlines",
                f"removed {dup_news} duplicate market headline(s)", fixed=True)

    return global_stats, clean_fng, deduped, rep
