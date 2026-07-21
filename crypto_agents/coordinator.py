"""
coordinator.py — orchestrates the three-agent committee.

Runs Tecnic, Social, and Macro; each returns a probability of UP / DOWN.
A trade is only greenlit when ALL THREE agree on the same direction AND
each one's confidence in that direction exceeds the threshold (default 70%).

Writes a dated markdown report and prints the verdict.

Usage:
    pip install requests
    python coordinator.py BTC
    python coordinator.py ETH --threshold 0.75
"""

import sys
import argparse
import datetime as dt
from pathlib import Path

import agent_tecnic
import agent_social
import agent_macro

REPORT_DIR = Path("reports")
THRESHOLD = 0.70


def decide(tec, soc, mac, threshold=THRESHOLD):
    agents = [tec, soc, mac]

    # A trader whose analyst raised a FATAL data issue cannot be trusted.
    blocked = [a["agent"] for a in agents
               if a.get("audit") is not None and not a["audit"].ok]
    if blocked:
        return {
            "unanimous": False, "direction": None,
            "all_above_threshold": False, "min_confidence": None,
            "confidences": [], "trade": False,
            "action": "NO TRADE",
            "data_blocked": blocked,
        }

    dirs = {a["direction"] for a in agents}
    unanimous = len(dirs) == 1
    direction = dirs.pop() if unanimous else None

    # confidence in the agreed direction for each agent
    if unanimous:
        confs = [a["p_up"] if direction == "UP" else a["p_down"] for a in agents]
        all_above = all(c > threshold for c in confs)
        min_conf = min(confs)
    else:
        confs, all_above, min_conf = [], False, None

    trade = unanimous and all_above
    return {
        "unanimous": unanimous,
        "direction": direction,
        "all_above_threshold": all_above,
        "min_confidence": min_conf,
        "confidences": confs,
        "trade": trade,
        "action": (f"{direction} {tec['pair']}" if trade else "NO TRADE"),
    }


def build_report(pair, tec, soc, mac, verdict, threshold):
    today = dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    L = []
    L.append(f"# Committee Trade Report — {pair}")
    L.append(f"_Generated {today}_")
    L.append("")
    L.append("> Deterministic multi-agent signal system. Not financial advice. "
             "Backtest before risking capital.")
    L.append("")

    # ---- Verdict banner ----
    L.append("## Verdict")
    L.append("")
    if verdict["trade"]:
        L.append(f"### ✅ TRADE: **{verdict['action']}**")
        L.append(f"All three agents agree **{verdict['direction']}** with "
                 f"minimum confidence {verdict['min_confidence']*100:.1f}% "
                 f"(threshold {threshold*100:.0f}%).")
    else:
        L.append("### ⛔ NO TRADE")
        if verdict.get("data_blocked"):
            L.append(f"Blocked on data quality — analyst(s) for "
                     f"**{', '.join(verdict['data_blocked'])}** raised a fatal "
                     f"issue. See the Data Quality section below.")
        elif not verdict["unanimous"]:
            L.append("Agents disagree on direction — no consensus.")
        elif not verdict["all_above_threshold"]:
            L.append(f"Agents agree on **{verdict['direction']}** but at least one "
                     f"is below the {threshold*100:.0f}% confidence bar "
                     f"(min was {verdict['min_confidence']*100:.1f}%).")
    L.append("")

    # ---- Agent scorecard ----
    L.append("## Agent Scorecard")
    L.append("")
    L.append("| Agent | Direction | P(up) | P(down) | Confidence |")
    L.append("|-------|:---------:|------:|--------:|-----------:|")
    for a in (tec, soc, mac):
        L.append(f"| {a['agent']} | {a['direction']} | {a['p_up']*100:.1f}% | "
                 f"{a['p_down']*100:.1f}% | {a['confidence']*100:.1f}% |")
    L.append("")

    # ---- Data quality (analyst layer) ----
    L.append("## 🔎 Data Quality — analyst audit")
    L.append("")
    L.append("| Analyst | Status | Flagged | Fixed |")
    L.append("|---------|:------:|:-------:|:-----:|")
    for a in (tec, soc, mac):
        au = a.get("audit")
        if au is None:
            L.append(f"| {a['agent']}-Analyst | — | — | — |")
            continue
        status = "✅ PASS" if au.ok else "⛔ BLOCK"
        L.append(f"| {au.analyst} | {status} | {au.n_flagged} | {au.n_fixed} |")
    L.append("")
    for a in (tec, soc, mac):
        au = a.get("audit")
        if au is None or not au.issues:
            continue
        L.append(f"**{au.analyst}** — {au.summary()}")
        L.append("")
        for iss in au.issues:
            mark = "🔧 fixed" if iss.fixed else "⚠️ flagged"
            det = f" — {iss.detail}" if iss.detail else ""
            L.append(f"- `{iss.severity.value}` [{iss.field}] {iss.message} "
                     f"({mark}){det}")
        L.append("")
    L.append("---")
    L.append("")

    # ---- Tecnic detail ----
    L.append(f"## 🧮 Tecnic — technical read on {tec['pair']}")
    L.append("")
    L.append(f"- Current price: ${tec['price']:,.2f}")
    L.append(f"- Net technical score: {tec['score']:+.2f}")
    L.append(f"- **P(up): {tec['p_up']*100:.1f}%  |  P(down): {tec['p_down']*100:.1f}%**")
    L.append("")
    L.append("**Signals:**")
    L.append("")
    for k, v in tec["signals"].items():
        L.append(f"- {k}: {v}")
    L.append("")
    L.append("---")
    L.append("")

    # ---- Social detail ----
    L.append(f"## 💬 Social — sentiment & 1/2/5-day shape")
    L.append("")
    L.append(f"- Net social score: {soc['score']:+.2f}")
    L.append(f"- Matching headlines scanned: {soc['matched_headlines']}")
    L.append(f"- **P(up): {soc['p_up']*100:.1f}%  |  P(down): {soc['p_down']*100:.1f}%**")
    L.append("")
    L.append("**Signals:**")
    L.append("")
    for k, v in soc["signals"].items():
        L.append(f"- {k}: {v}")
    if soc.get("headline_samples"):
        L.append("")
        L.append("**Sample headlines:**")
        L.append("")
        for title, s in soc["headline_samples"]:
            tag = "🟢" if s > 0 else ("🔴" if s < 0 else "⚪")
            L.append(f"- {tag} {title} ({s:+d})")
    L.append("")
    L.append("---")
    L.append("")

    # ---- Macro detail ----
    L.append(f"## 🌐 Macro — whole-market regime: **{mac['regime']}**")
    L.append("")
    g = mac["global"]
    if g.get("total_mcap_usd"):
        L.append(f"- Total market cap: ${g['total_mcap_usd']:,.0f}")
    if g.get("btc_dominance") is not None:
        L.append(f"- BTC dominance: {g['btc_dominance']:.1f}%")
    L.append(f"- Net macro score: {mac['score']:+.2f}")
    L.append(f"- **P(up): {mac['p_up']*100:.1f}%  |  P(down): {mac['p_down']*100:.1f}%**")
    L.append("")
    L.append("**Signals:**")
    L.append("")
    for k, v in mac["signals"].items():
        L.append(f"- {k}: {v}")
    L.append("")
    L.append("---")
    L.append("")
    L.append("### How the decision rule works")
    L.append("")
    L.append(f"A trade fires only if **all three agents point the same way** "
             f"*and* each reports **>{threshold*100:.0f}%** confidence in that "
             f"direction. Any disagreement, or any agent below the bar, results "
             f"in NO TRADE. This is intentionally strict — it trades rarely but "
             f"only on strong multi-factor alignment.")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser(description="Three-agent crypto trade committee")
    ap.add_argument("pair", nargs="?", default="BTC",
                    help="Base symbol, e.g. BTC, ETH, SOL (quote assumed USD)")
    ap.add_argument("--quote", default="USD")
    ap.add_argument("--threshold", type=float, default=THRESHOLD,
                    help="Confidence bar each agent must clear (default 0.70)")
    args = ap.parse_args()
    base = args.pair.upper()

    print(f"Running committee on {base}/{args.quote} "
          f"(threshold {args.threshold*100:.0f}%)...\n")

    print("  [Tecnic] technical analysis...")
    tec = agent_tecnic.run(base, args.quote)
    print(f"           -> {tec['direction']} @ {tec['confidence']*100:.1f}%")

    print("  [Social] sentiment + momentum...")
    soc = agent_social.run(base, args.quote)
    print(f"           -> {soc['direction']} @ {soc['confidence']*100:.1f}%")

    print("  [Macro]  market regime...")
    mac = agent_macro.run()
    print(f"           -> {mac['direction']} @ {mac['confidence']*100:.1f}%")

    verdict = decide(tec, soc, mac, args.threshold)

    REPORT_DIR.mkdir(exist_ok=True)
    report = build_report(f"{base}/{args.quote}", tec, soc, mac,
                          verdict, args.threshold)
    out = REPORT_DIR / f"committee_{base}_{dt.date.today().isoformat()}.md"
    out.write_text(report, encoding="utf-8")

    print("\n" + "=" * 55)
    if verdict["trade"]:
        print(f"  ✅ TRADE: {verdict['action']}  "
              f"(min conf {verdict['min_confidence']*100:.1f}%)")
    elif verdict.get("data_blocked"):
        print(f"  ⛔ NO TRADE — data quality block: {', '.join(verdict['data_blocked'])}")
    else:
        print(f"  ⛔ NO TRADE — {'disagreement' if not verdict['unanimous'] else 'below threshold'}")
    print("=" * 55)
    print(f"\nReport: {out.resolve()}")


if __name__ == "__main__":
    main()
