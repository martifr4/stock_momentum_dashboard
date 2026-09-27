"""Offline tests for the prediction-market monitor.

    python -m unittest discover -s backend/markets -t backend
"""
from __future__ import annotations

import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config  # noqa: E402
from markets.classify import classify  # noqa: E402


def mk(question, outcome="", event_title="", source="polymarket", tags=(), **kw):
    base = {"id": f"{source}:{abs(hash((question, outcome)))}", "source": source,
            "event_id": f"{source}:ev-{abs(hash(event_title or question))}", "event_title": event_title or question,
            "question": question, "outcome": outcome, "url": "", "category": "", "tags": list(tags),
            "created_ts": None, "end_ts": None, "prob": 0.5, "volume": 1e6, "volume24h": 1e4,
            "volume1wk": None, "liquidity": 0, "src_chg_1d": None, "src_chg_1w": None, "src_chg_1m": None}
    base.update(kw)
    return base


class ClassifyTests(unittest.TestCase):
    def pol(self, market, topic):
        return classify(market)["topics"].get(topic)

    def test_fed_directions(self):
        self.assertEqual(self.pol(mk("Will the Fed decrease interest rates by 50+ bps after the October meeting?"), "monetary"), 1.0)
        self.assertEqual(self.pol(mk("Another Fed rate hike in 2026?"), "monetary"), -1.0)
        self.assertEqual(self.pol(mk("Fed decision in October?", "No change"), "monetary"), -0.3)
        # "Rate above X" means tighter policy -> generic wording is inverted.
        self.assertEqual(self.pol(mk("Will the upper bound of the target federal funds rate be above 4.5%?", "≥ 4.5%"), "monetary"), -1.0)

    def test_labor_inversion(self):
        self.assertEqual(self.pol(mk("Will the unemployment rate be above 4.5% in October?", "Above 4.5%", source="kalshi"), "labor"), -1.0)
        self.assertEqual(self.pol(mk("How many jobs added in September? Payrolls", "Above 200k", source="kalshi"), "labor"), 1.0)

    def test_bucket_is_directionless(self):
        self.assertEqual(self.pol(mk("Will CPI inflation be between 2.9% and 3.0%?", "2.9-3.0%"), "inflation"), 0.0)

    def test_recession_is_negative_growth(self):
        self.assertEqual(self.pol(mk("US recession by end of 2026?"), "growth"), -1.0)

    def test_middle_east(self):
        self.assertEqual(self.pol(mk("Strait of Hormuz traffic returns to normal by December 31?"), "middle_east"), -1.0)
        self.assertEqual(self.pol(mk("Will Iran target the United Arab Emirates by September 30?"), "middle_east"), 1.0)

    def test_elections(self):
        self.assertEqual(self.pol(mk("Will the Democrats win the 2028 US Presidential Election?", "Democratic"), "us_elections"), -1.0)
        self.assertEqual(self.pol(mk("Will the Republican Party win the KS-03 House seat?", "Eric Jenkins (R)"), "us_elections"), 1.0)
        # Vote-share thresholds say nothing about party.
        self.assertEqual(self.pol(mk("Will Jacob Gottfredson receive at least 3% of the popular vote in the UT-04 race?", "At least 3%", source="kalshi"), "us_elections"), 0.0)
        c = classify(mk("Will Lula win the 2026 Brazil presidential election?", "Lula"))
        self.assertNotIn("us_elections", c["topics"])
        self.assertIn("intl_politics", c["topics"])
        self.assertIn("brazil", c["regions"])
        self.assertLess(c["us_weight"], 1.0)

    def test_false_positive_guards(self):
        # "warships" must not read as Kevin Warsh; "commodities" not as Modi.
        c = classify(mk("Will the United States send warships through the Strait of Hormuz?"))
        self.assertNotIn("monetary", c["topics"])
        c = classify(mk("What will Gold (GC) hit by end of December?", "↑ $8,000", tags=["commodities"]))
        self.assertNotIn("india", c["regions"])
        self.assertEqual(c["topics"].get("metals"), 1.0)
        self.assertEqual(classify(mk("Will Messi score in the final?"))["topics"], {})


class PipelineTests(unittest.TestCase):
    """End-to-end: process() -> alerts, snapshots, impact."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self._orig = config.MARKETS_DB_PATH
        config.MARKETS_DB_PATH = Path(self.tmp.name) / "t.db"

    def tearDown(self):
        config.MARKETS_DB_PATH = self._orig
        self.tmp.cleanup()

    def test_move_new_and_impact(self):
        from markets import analytics, ingest
        t0 = 1_800_000_000
        cut = mk("Will the Fed cut rates by 25 bps in December?", event_title="Fed decision in December?",
                 prob=0.30, end_ts=t0 + 90 * 86400)
        war = mk("Will Iran strike Saudi oil facilities by December 31?", prob=0.10, end_ts=t0 + 90 * 86400)
        ingest.process([cut, war], now=t0)
        cut2 = {**cut, "prob": 0.55}
        war2 = {**war, "prob": 0.30}
        fresh = mk("Will the ECB cut rates in January?", prob=0.4, created_ts=t0 + 86400 - 3600)
        s = ingest.process([cut2, war2, fresh], now=t0 + 86400)
        self.assertEqual(s["new_events"], 1)

        al = analytics.alerts("7d", now=t0 + 86400)
        kinds = sorted(a["kind"] for a in al)
        self.assertEqual(kinds, ["new_market", "prob_move", "prob_move"])

        imp = analytics.impact("24h", now=t0 + 86400)
        net = {s["id"]: s["net"] for s in imp["sectors"]}
        ind = {i["id"]: i["net"] for i in imp["industries"]}
        self.assertGreater(net["real_estate"], 0)       # more cuts priced
        self.assertGreater(net["energy"], 0)            # escalation
        self.assertGreater(ind["defense"], 0)
        self.assertLess(ind["airlines"], 0)
        bull = [x["ticker"] for x in imp["stocks"]["bullish"]]
        self.assertIn("DHI", bull)                      # homebuilders: rate cuts

        d = analytics.market_detail(cut["id"], now=t0 + 86400)
        self.assertEqual(len(d["series"]), 2)
        self.assertAlmostEqual(d["change"], 0.25)


if __name__ == "__main__":
    unittest.main()
