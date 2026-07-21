"""Walk-forward / out-of-sample split.

The evaluation reserves a holdout period (``oos_start`` onward) that strategy
parameters must never be tuned on. We report in-sample (IS) and out-of-sample
(OOS) metrics *separately* so the reader can see whether any edge survives on
data the design never saw.

This module does not tune anything itself — it simply partitions a return series
by date. The discipline (not peeking at OOS while choosing weights/thresholds)
is a process rule, stated plainly in HONEST_ASSESSMENT.md.
"""
from __future__ import annotations

import pandas as pd


def split_is_oos(series: pd.Series, oos_start: str) -> tuple[pd.Series, pd.Series]:
    """Split a date-indexed series into (in_sample, out_of_sample)."""
    cutoff = pd.Timestamp(oos_start)
    if cutoff.tzinfo is None and series.index.tz is not None:
        cutoff = cutoff.tz_localize(series.index.tz)
    is_mask = series.index < cutoff
    return series[is_mask], series[~is_mask]
