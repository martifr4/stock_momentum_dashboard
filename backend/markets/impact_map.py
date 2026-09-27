"""Taxonomy: which prediction markets matter for which parts of the economy.

Three layers:

1. EXPOSURES   - the 11 GICS sectors plus thematic industries (defense,
                 homebuilders, semis, ...). Each has a proxy ETF and a few
                 representative stocks. Industries roll up into a sector.
2. TOPICS      - macro / political / geopolitical themes. Each topic has:
                   * `match`     regex that assigns a market to the topic
                   * `direction` what "+1" means (e.g. "easier monetary policy")
                   * `rules`     ordered (regex, polarity) rules applied to the
                                 outcome text; the first hit wins
                   * `invert`    regex that flips generic above/below wording
                                 (e.g. "unemployment above 5%" is labor-WEAK)
                   * `betas`     exposure -> sensitivity to a +1 move
                 A market whose probability rises by dp pushes exposure `e` by
                 dp * polarity * betas[e] (then weighted by market volume).
3. REGIONS     - country / bloc detection, each with a country ETF.

The betas are deliberately simple, hand-set, and signed "rule of thumb"
sensitivities (-1 .. +1) - a transparent starting point to tune, not a
fitted model. Edit freely.
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Exposures: sectors (GICS) and thematic industries
# ---------------------------------------------------------------------------
SECTORS = {
    "energy":       {"label": "Energy",                 "etf": "XLE",  "stocks": ["XOM", "CVX", "COP", "OXY", "SLB"]},
    "materials":    {"label": "Materials",              "etf": "XLB",  "stocks": ["LIN", "FCX", "NEM", "DOW", "NUE"]},
    "industrials":  {"label": "Industrials",            "etf": "XLI",  "stocks": ["CAT", "GE", "HON", "UNP", "DE"]},
    "cons_disc":    {"label": "Consumer Discretionary", "etf": "XLY",  "stocks": ["AMZN", "TSLA", "HD", "NKE", "MCD"]},
    "cons_staples": {"label": "Consumer Staples",       "etf": "XLP",  "stocks": ["PG", "KO", "WMT", "COST", "PEP"]},
    "health":       {"label": "Health Care",            "etf": "XLV",  "stocks": ["LLY", "UNH", "JNJ", "PFE", "ABBV"]},
    "financials":   {"label": "Financials",             "etf": "XLF",  "stocks": ["JPM", "BAC", "GS", "MS", "WFC"]},
    "tech":         {"label": "Information Technology", "etf": "XLK",  "stocks": ["AAPL", "MSFT", "NVDA", "ORCL", "CRM"]},
    "comm":         {"label": "Communication Services", "etf": "XLC",  "stocks": ["GOOGL", "META", "NFLX", "DIS", "T"]},
    "utilities":    {"label": "Utilities",              "etf": "XLU",  "stocks": ["NEE", "DUK", "SO", "AEP", "CEG"]},
    "real_estate":  {"label": "Real Estate",            "etf": "XLRE", "stocks": ["PLD", "AMT", "EQIX", "O", "SPG"]},
}

INDUSTRIES = {
    "defense":        {"label": "Aerospace & Defense",   "sector": "industrials",  "etf": "ITA",  "stocks": ["LMT", "RTX", "NOC", "GD", "LHX"]},
    "airlines":       {"label": "Airlines",              "sector": "industrials",  "etf": "JETS", "stocks": ["DAL", "UAL", "AAL", "LUV"]},
    "transports":     {"label": "Transports & Shipping", "sector": "industrials",  "etf": "IYT",  "stocks": ["UPS", "FDX", "ZIM", "MATX"]},
    "homebuilders":   {"label": "Homebuilders",          "sector": "cons_disc",    "etf": "XHB",  "stocks": ["DHI", "LEN", "PHM", "NVR"]},
    "autos":          {"label": "Autos",                 "sector": "cons_disc",    "etf": "CARZ", "stocks": ["F", "GM", "TSLA", "STLA"]},
    "retail":         {"label": "Retail",                "sector": "cons_disc",    "etf": "XRT",  "stocks": ["TGT", "BBY", "DG", "DLTR"]},
    "semis":          {"label": "Semiconductors",        "sector": "tech",         "etf": "SMH",  "stocks": ["NVDA", "TSM", "AMD", "AVGO", "ASML"]},
    "platforms":      {"label": "Mega-cap Platforms",    "sector": "comm",         "etf": "FDN",  "stocks": ["GOOGL", "META", "AMZN", "AAPL"]},
    "regional_banks": {"label": "Regional Banks",        "sector": "financials",   "etf": "KRE",  "stocks": ["ZION", "KEY", "CFG", "FITB"]},
    "crypto":         {"label": "Crypto-linked",         "sector": "financials",   "etf": "IBIT", "stocks": ["COIN", "MSTR", "HOOD", "MARA"]},
    "gold":           {"label": "Gold & Miners",         "sector": "materials",    "etf": "GDX",  "stocks": ["NEM", "AEM", "GOLD", "GLD"]},
    "steel":          {"label": "Steel & Metals",        "sector": "materials",    "etf": "SLX",  "stocks": ["NUE", "STLD", "CLF", "FCX"]},
    "agriculture":    {"label": "Agriculture",           "sector": "cons_staples", "etf": "MOO",  "stocks": ["ADM", "BG", "CF", "MOS", "NTR"]},
    "pharma":         {"label": "Pharma",                "sector": "health",       "etf": "PPH",  "stocks": ["PFE", "MRK", "LLY", "NVO", "BMY"]},
    "managed_care":   {"label": "Managed Care",          "sector": "health",       "etf": "IHF",  "stocks": ["UNH", "HUM", "CVS", "ELV"]},
    "clean_energy":   {"label": "Clean Energy",          "sector": "utilities",    "etf": "ICLN", "stocks": ["FSLR", "ENPH", "NEE", "PLUG"]},
}

# How much an industry's pressure counts toward its parent sector's total.
INDUSTRY_ROLLUP = 0.5
# Non-US markets (ECB, China GDP, UK election...) spill over to US-listed
# sector proxies at this reduced weight; their full weight lands on regions.
NON_US_SPILLOVER = 0.4


def exposure(eid: str) -> dict:
    return SECTORS.get(eid) or INDUSTRIES[eid]


def exposure_sector(eid: str) -> str:
    return eid if eid in SECTORS else INDUSTRIES[eid]["sector"]


# ---------------------------------------------------------------------------
# Generic directional wording (used when no topic rule matched)
# ---------------------------------------------------------------------------
UP_WORDS = (r"\babove\b|\bover\b|\bmore than\b|\bat least\b|\bhigher\b|\bexceed|"
            r"\bor more\b|\bor higher\b|\bor above\b|[↑>≥]|\d\s*\+(?!\s*bps)|\brise|\bincrease|\bup\b")
DOWN_WORDS = (r"\bbelow\b|\bunder\b|\bless than\b|\blower\b|\bor less\b|\bor lower\b|"
              r"\bor below\b|[↓<≤]|\bfall|\bdecrease|\bdecline|\bdown\b|\bdrop")

# ---------------------------------------------------------------------------
# Topics
# ---------------------------------------------------------------------------
# group: macro | politics | geopolitics
TOPICS: dict[str, dict] = {
    # ---------------- Macro ----------------
    "monetary": {
        "label": "Central banks & rates", "group": "macro",
        "direction": "easier policy (rate cuts)",
        "match": r"\bfed\b|fomc|federal reserve|fed(eral)? funds|rate cut|rate hike|interest rate|\bbps\b|basis points|"
                 r"\becb\b|european central bank|bank of england|\bboe\b|bank of japan|\bboj\b|\brba\b|reserve bank|"
                 r"bank of canada|\bsnb\b|\bpboc\b|central bank|powell|\bwarsh\b|lagarde|monetary policy|\bbanxico\b|\bcopom\b",
        "rules": [
            (r"no change|unchanged|\bhold|\bpause|maintain", -0.3),
            (r"\bcut|decrease|lower|reduc|\bease|easing", 1.0),
            (r"\bhike|increase|\braise|tighten", -1.0),
        ],
        # "fed funds rate above 4.5%" = TIGHTER, so generic above/below flips.
        "invert": r".",
        "betas": {"real_estate": 0.8, "homebuilders": 1.0, "utilities": 0.5, "cons_disc": 0.6, "tech": 0.5,
                  "semis": 0.4, "regional_banks": 0.4, "financials": -0.2, "gold": 0.5, "crypto": 0.6,
                  "cons_staples": 0.1, "industrials": 0.3, "autos": 0.4},
    },
    "inflation": {
        "label": "Inflation", "group": "macro",
        "direction": "hotter inflation",
        "match": r"\bcpi\b|\bpce\b|\bppi\b|inflation|consumer price|price index|deflation",
        "rules": [(r"deflation", -1.0)],
        "betas": {"energy": 0.5, "materials": 0.4, "gold": 0.5, "agriculture": 0.3, "financials": 0.1,
                  "real_estate": -0.6, "homebuilders": -0.7, "utilities": -0.4, "tech": -0.5, "semis": -0.3,
                  "cons_disc": -0.5, "retail": -0.5, "cons_staples": -0.2},
    },
    "labor": {
        "label": "Jobs & labor", "group": "macro",
        "direction": "stronger labor market",
        "match": r"payroll|\bnfp\b|jobs (added|report)|jobs? growth|unemployment|jobless|job openings|jolts|labor force|"
                 r"initial claims|wage growth|employment",
        "invert": r"unemployment|jobless|initial claims|layoff",
        "rules": [],
        "betas": {"cons_disc": 0.5, "retail": 0.4, "financials": 0.4, "industrials": 0.4, "transports": 0.3,
                  "real_estate": -0.3, "utilities": -0.2, "homebuilders": -0.2, "gold": -0.2},
    },
    "growth": {
        "label": "Growth & recession", "group": "macro",
        "direction": "stronger growth",
        "match": r"\bgdp\b|recession|economic growth|\bpmi\b|retail sales|economy (grow|shrink|contract)|"
                 r"industrial production|soft landing|hard landing|contraction",
        "rules": [(r"recession|contraction|negative|hard landing|shrink", -1.0), (r"soft landing", 1.0)],
        "betas": {"industrials": 0.7, "materials": 0.6, "financials": 0.6, "regional_banks": 0.6, "cons_disc": 0.7,
                  "energy": 0.5, "tech": 0.4, "semis": 0.6, "airlines": 0.6, "transports": 0.6, "steel": 0.5,
                  "cons_staples": -0.3, "utilities": -0.4, "health": -0.2, "gold": -0.3},
    },
    "yields": {
        "label": "Treasury yields", "group": "macro",
        "direction": "higher long-term yields",
        "match": r"treasury|10-year|10 year|30-year|30 year|2-year yield|bond yield|\byield\b|mortgage rate",
        "rules": [],
        "betas": {"real_estate": -0.8, "utilities": -0.7, "homebuilders": -0.9, "tech": -0.5, "semis": -0.3,
                  "cons_disc": -0.3, "financials": 0.4, "regional_banks": 0.2, "gold": -0.4, "crypto": -0.3},
    },
    "housing": {
        "label": "Housing", "group": "macro",
        "direction": "stronger housing",
        "match": r"home (value|price|sales)|housing|case-shiller|existing home|new home|housing starts|\brent\b|real estate",
        "rules": [],
        "betas": {"homebuilders": 0.9, "real_estate": 0.5, "materials": 0.3, "financials": 0.2, "cons_disc": 0.3},
    },
    "oil": {
        "label": "Oil & energy supply", "group": "macro",
        "direction": "higher oil / gas prices",
        "match": r"\boil\b|crude|\bwti\b|brent|opec|gasoline|gas price|natural gas|\blng\b|hormuz|barrel",
        "rules": [(r"returns? to normal|reopen|normali[sz]", -1.0), (r"clos|block|disrupt|halt", 1.0),
                  (r"opec.*(increase|boost|raise).*(output|production)", -1.0)],
        "betas": {"energy": 1.0, "airlines": -0.9, "transports": -0.5, "cons_disc": -0.4, "autos": -0.3,
                  "retail": -0.3, "industrials": -0.2, "materials": 0.2, "clean_energy": 0.3},
    },
    "trade": {
        "label": "Tariffs & trade", "group": "macro",
        "direction": "trade escalation (more tariffs)",
        "match": r"tariff|trade war|trade deal|trade agreement|import dut|export ban|\bwto\b|section 232|section 301|"
                 r"de minimis|trade deficit|trade talks|economic deal",
        "rules": [(r"\bdeal|agreement|truce|lower|remov|lift|pause|exempt|reduc|suspend|struck down|strike down|illegal", -1.0),
                  (r"impose|raise|increase|new tariff|hike|retaliat", 1.0)],
        "default": 1.0,
        "betas": {"cons_disc": -0.7, "retail": -0.7, "autos": -0.8, "tech": -0.5, "semis": -0.6, "platforms": -0.3,
                  "industrials": -0.5, "transports": -0.4, "agriculture": -0.6, "cons_staples": -0.3,
                  "steel": 0.5, "materials": -0.2},
    },
    "fiscal": {
        "label": "Fiscal & shutdown risk", "group": "macro",
        "direction": "fiscal stress (shutdown / default risk)",
        "match": r"shutdown|debt ceiling|debt limit|default on|budget|deficit|spending bill|appropriation|"
                 r"continuing resolution|reconciliation|tax (cut|bill)|stimulus|downgrade",
        "rules": [(r"avoid|end|pass|raise|suspend|resolve|reopen|tax cut|stimulus", -1.0),
                  (r"shutdown|default|breach|downgrade|fail", 1.0)],
        "betas": {"gold": 0.5, "financials": -0.3, "defense": -0.4, "industrials": -0.3, "cons_disc": -0.3,
                  "managed_care": -0.2, "cons_staples": 0.2, "utilities": 0.2},
    },
    "fx": {
        "label": "Dollar & FX", "group": "macro",
        "direction": "stronger US dollar",
        "match": r"\bdollar\b|\bdxy\b|\busd\b|eur/usd|usd/jpy|\byen\b|\byuan\b|\brenminbi\b|\beuro\b|currency|exchange rate|peso|\brupee\b",
        "invert": r"eur/usd|gbp/usd|\beuro\b.*(above|higher)|\byen\b.*(strength)",
        "rules": [(r"(dollar|dxy).*(weak|fall|below)", -1.0)],
        "betas": {"gold": -0.6, "materials": -0.4, "energy": -0.3, "tech": -0.3, "semis": -0.3, "cons_staples": -0.2,
                  "agriculture": -0.3, "retail": 0.1},
    },
    "metals": {
        "label": "Gold & metals", "group": "macro",
        "direction": "higher metal prices",
        "match": r"\bgold\b|silver|copper|platinum|lithium|rare earth|\bmetals?\b",
        "rules": [],
        "betas": {"gold": 1.0, "materials": 0.6, "steel": 0.4},
    },
    "crypto_policy": {
        "label": "Crypto policy", "group": "politics",
        "direction": "crypto-friendly policy",
        "match": r"bitcoin reserve|strategic bitcoin|stablecoin|crypto (bill|act|regulation|market structure)|clarity act|"
                 r"genius act|\bsec\b.*(crypto|etf|bitcoin)|crypto etf|bitcoin etf|cbdc",
        "rules": [(r"\bban|crackdown|lawsuit|sue|reject|deny", -1.0)],
        "default": 1.0,
        "betas": {"crypto": 1.0, "financials": 0.15, "tech": 0.05},
    },
    # ---------------- Politics ----------------
    "us_elections": {
        "label": "US elections & control", "group": "politics",
        "direction": "Republican / GOP outcome",
        "match": r"presidential (election|race|nominee|nomination|primary|debate)|president(ial)? election|\bsenate\b|(?<!white )\bhouse\b|congress|midterm|electoral|popular vote|"
                 r"nominee|nomination|\bprimary\b|governor|\bgop\b|republican|democrat",
        "rules": [(r"democrat|\bdem\b|\bdems\b|harris|newsom|ocasio|\baoc\b|buttigieg|shapiro|whitmer|pritzker|"
                   r"beshear|mamdani|walz|booker|ossoff|warnock|fetterman|gallego|\(d\)|\bblue\b", -1.0),
                  (r"republican|\bgop\b|\btrump\b|vance|rubio|desantis|haley|ramaswamy|burgum|youngkin|"
                   r"\bcruz\b|hawley|\bnoem\b|\bkemp\b|abbott|\(r\)|\bred\b", 1.0)],
        "us_only": True,
        "no_generic": True,  # "at least 3% of the vote" says nothing about party
        "betas": {"energy": 0.5, "financials": 0.5, "regional_banks": 0.4, "defense": 0.4, "crypto": 0.4,
                  "managed_care": 0.2, "industrials": 0.2, "steel": 0.2, "clean_energy": -0.7, "autos": -0.1,
                  "utilities": -0.1},
    },
    "intl_politics": {
        "label": "International elections & leaders", "group": "politics",
        "direction": "(attention only)",
        "attention_only": True,
        "match": r"prime minister|chancellor|parliament|general election|snap election|coalition|premier\b|"
                 r"leader of|\bpresident of\b|out as|leave office|no-confidence|no confidence|impeach|resign",
        "rules": [],
        "default": 0.0,
        "betas": {},
    },
    "regulation": {
        "label": "Antitrust & regulation", "group": "politics",
        "direction": "tougher enforcement",
        "match": r"antitrust|monopoly|break ?up|\bftc\b|\bdoj\b.*(google|apple|meta|amazon)|lina khan|"
                 r"digital markets act|\bdma\b|\bfine[sd]?\b|section 230|sec chair|\bcfpb\b|bank regulation|basel",
        "rules": [(r"dismiss|drop|settle|overturn|win appeal|reject", -1.0)],
        "default": 1.0,
        "betas": {"platforms": -0.8, "comm": -0.5, "tech": -0.3, "financials": -0.2, "regional_banks": -0.2},
    },
    "health_policy": {
        "label": "Healthcare policy", "group": "politics",
        "direction": "drug-price / payer pressure",
        "match": r"drug pric|medicare|medicaid|obamacare|affordable care|\baca\b|fda commissioner|\bhhs\b|rfk|kennedy.*health|"
                 r"pharma tariff|most favored nation|vaccine|health insurance",
        "rules": [(r"repeal|approve|delay|block", -1.0), (r"negotiat|cap|cut|tariff|most favored", 1.0)],
        "default": 0.0,
        "betas": {"pharma": -0.8, "health": -0.5, "managed_care": -0.5},
    },
    "tech_policy": {
        "label": "Tech, AI & chip controls", "group": "politics",
        "direction": "more restriction on tech / chips",
        "match": r"export control|chip (ban|export)|nvidia.*china|\bai (act|regulation|bill|safety)|tiktok|"
                 r"chips act|semiconductor tariff|entity list|\bh20\b|huawei",
        "rules": [(r"lift|ease|allow|approve|resume|sale|deal", -1.0), (r"\bban|restrict|block|tighten", 1.0)],
        "default": 1.0,
        "betas": {"semis": -0.8, "tech": -0.5, "platforms": -0.3, "comm": -0.2},
    },
    "energy_policy": {
        "label": "Energy & climate policy", "group": "politics",
        "direction": "pro-fossil / anti-green policy",
        "match": r"\bira\b|inflation reduction act|ev (tax )?credit|drilling|climate (bill|policy|agreement)|"
                 r"paris agreement|offshore wind|keystone|\bepa\b|emission|carbon tax|renewable",
        "rules": [(r"repeal|withdraw|cut|end|drill|rollback|revoke", 1.0), (r"extend|expand|rejoin|pass|tax", -1.0)],
        "default": 0.0,
        "betas": {"energy": 0.5, "clean_energy": -0.9, "autos": -0.3, "utilities": -0.2},
    },
    "immigration": {
        "label": "Immigration", "group": "politics",
        "direction": "stricter immigration",
        "match": r"deport|immigra|border (wall|crossing)|asylum|\bice\b|h-1b|h1b|visa",
        "rules": [(r"amnesty|increase.*visa|expand", -1.0)],
        "default": 1.0,
        "betas": {"homebuilders": -0.4, "agriculture": -0.3, "industrials": -0.2, "cons_disc": -0.2, "tech": -0.1},
    },
    # ---------------- Geopolitics ----------------
    "middle_east": {
        "label": "Middle East conflict", "group": "geopolitics",
        "direction": "escalation",
        "match": r"\biran\b|israel|gaza|hamas|hezbollah|houthi|hormuz|\byemen\b|lebanon|\bsyria|saudi|netanyahu|"
                 r"khamenei|tehran|red sea",
        "rules": [(r"ceasefire|cease-fire|peace|\bdeal|agreement|normal|reopen|truce|talks|hostage|diplomat|recogni[sz]", -1.0),
                  (r"target|seize|drone|clash|strike|attack|\bwar\b|invade|invasion|military|bomb|clos|blockade|nuclear|missile|escalat|regime", 1.0)],
        "default": 0.0,
        "betas": {"energy": 0.8, "defense": 0.8, "gold": 0.7, "transports": 0.3, "airlines": -0.7,
                  "cons_disc": -0.3, "tech": -0.2, "semis": -0.2},
    },
    "russia_ukraine": {
        "label": "Russia–Ukraine", "group": "geopolitics",
        "direction": "escalation",
        "match": r"russia|ukrain|putin|zelensk|kremlin|crimea|donbas|kyiv|moscow",
        "rules": [(r"ceasefire|cease-fire|peace|\bdeal|agreement|truce|talks|meet|summit|sanctions? (lift|eas|remov)", -1.0),
                  (r"strike|attack|\bwar\b|invade|invasion|military|nato|nuclear|mobili[sz]|escalat|sanction", 1.0)],
        "default": 0.0,
        "betas": {"defense": 0.8, "energy": 0.5, "agriculture": 0.5, "gold": 0.5, "materials": 0.3,
                  "airlines": -0.3, "cons_disc": -0.2},
    },
    "china_taiwan": {
        "label": "China–Taiwan / US–China", "group": "geopolitics",
        "direction": "escalation",
        "match": r"\bchina\b.*(taiwan|invade|blockade|military|sanction)|taiwan|south china sea|\bxi\b.*(meet|trump)|"
                 r"pla\b|us-china|u\.s\.-china|beijing",
        "rules": [(r"\bmeet|summit|\bdeal|agreement|talks|visit|truce", -1.0),
                  (r"invade|invasion|blockade|military|attack|strike|clash|sanction|escalat", 1.0)],
        "default": 0.0,
        "betas": {"semis": -1.0, "tech": -0.7, "platforms": -0.3, "cons_disc": -0.4, "retail": -0.3,
                  "defense": 0.7, "gold": 0.5, "autos": -0.3},
    },
    "geopolitics_other": {
        "label": "Other geopolitics", "group": "geopolitics",
        "direction": "escalation",
        "match": r"\bnato\b|north korea|kim jong|venezuela|maduro|\bcuba\b|india.*pakistan|pakistan.*india|"
                 r"coup|martial law|\bwar\b|sanction|military (action|strike)|nuclear (test|weapon)",
        "rules": [(r"ceasefire|peace|\bdeal|agreement|truce|talks|lift", -1.0),
                  (r"strike|attack|\bwar\b|invade|invasion|coup|martial|nuclear|sanction|escalat", 1.0)],
        "default": 0.0,
        "betas": {"defense": 0.5, "gold": 0.4, "energy": 0.2},
    },
}

GROUPS = {"macro": "Macro", "politics": "Politics & policy", "geopolitics": "Geopolitics"}

# ---------------------------------------------------------------------------
# Regions
# ---------------------------------------------------------------------------
REGIONS = {
    "us":          {"label": "United States",  "etf": "SPY",  "match": r"\bus\b|\bu\.s\.|united states|america|\b[a-z]{2}-(\d{1,2}|al)\b|\bfed\b|fomc|federal reserve|trump|congress|senate|white house|treasury|\bnfp\b|payroll|\bcpi\b|nasdaq|s&p|dow jones|washington"},
    "canada":      {"label": "Canada",         "etf": "EWC",  "match": r"canad|bank of canada|carney|ottawa"},
    "mexico":      {"label": "Mexico",         "etf": "EWW",  "match": r"(?<!new )mexic|banxico|sheinbaum"},
    "brazil":      {"label": "Brazil",         "etf": "EWZ",  "match": r"brazil|lula|bolsonaro|copom|s[aã]o paulo|minas gerais|rio de janeiro|para[ií]ba|bahia|pernambuco|cear[aá]|paran[aá]|goi[aá]s|rio grande"},
    "argentina":   {"label": "Argentina",      "etf": "ARGT", "match": r"argentin|milei"},
    "latam_other": {"label": "LatAm (other)",  "etf": "ILF",  "match": r"venezuela|maduro|colombia|chile|peru|\bcuba\b|ecuador|bolivia"},
    "uk":          {"label": "United Kingdom", "etf": "EWU",  "match": r"\buk\b|united kingdom|britain|british|bank of england|\bboe\b|starmer|farage|reform uk|sterling|\bgbp\b"},
    "eurozone":    {"label": "Eurozone / EU",  "etf": "EZU",  "match": r"\becb\b|eurozone|euro area|european union|\beu\b|lagarde|\beuro\b|brussels"},
    "germany":     {"label": "Germany",        "etf": "EWG",  "match": r"german|merz|bundestag|\bafd\b|\bcdu\b|\bspd\b|die linke|bavaria|mecklenburg|saxony|berlin"},
    "france":      {"label": "France",         "etf": "EWQ",  "match": r"\bfrance\b|french|macron|le pen|bardella|elys"},
    "europe_other":{"label": "Europe (other)", "etf": "VGK",  "match": r"\bital|riksbank|sverige|swed|meloni|spain|spanish|poland|polish|romania|hungar|orb[aá]n|netherlands|dutch|sweden|norway|switzerland|\bsnb\b|portugal|greece|czech|nato secretary"},
    "russia_ukr":  {"label": "Russia / Ukraine", "etf": None, "match": r"russia|ukrain|putin|zelensk|kremlin|kyiv|moscow"},
    "middle_east": {"label": "Middle East",    "etf": "KSA",  "match": r"\biran|israel|gaza|saudi|hormuz|houthi|yemen|lebanon|syria|qatar|\buae\b|netanyahu|opec"},
    "turkey":      {"label": "Turkey",         "etf": "TUR",  "match": r"turkey|t[uü]rkiye|erdo[gğ]an"},
    "china":       {"label": "China",          "etf": "MCHI", "match": r"china|chinese|beijing|\bxi\b|pboc|yuan|renminbi|hong kong"},
    "taiwan":      {"label": "Taiwan",         "etf": "EWT",  "match": r"taiwan|tsmc|taipei"},
    "japan":       {"label": "Japan",          "etf": "EWJ",  "match": r"japan|bank of japan|\bboj\b|\byen\b|nikkei|takaichi|ishiba|tokyo"},
    "korea":       {"label": "South Korea",    "etf": "EWY",  "match": r"korea|seoul|kospi"},
    "india":       {"label": "India",          "etf": "INDA", "match": r"\bindia|\bmodi\b|\brbi\b|rupee|pakistan"},
    "australia":   {"label": "Australia",      "etf": "EWA",  "match": r"australia|\brba\b|reserve bank of australia|albanese"},
    "africa":      {"label": "Africa",         "etf": "AFK",  "match": r"africa|nigeria|kenya|egypt|ethiopia|guinea|senegal|ghana|c[oô]te d|cameroon|tanzania|uganda|malawi|zambia|zimbabwe|gabon|\bmali\b|niger\b|benin|togo"},
    "global":      {"label": "Global",         "etf": "ACWI", "match": r"\bworld\b|global|\bimf\b|g7|g20|\bun\b|united nations|largest company"},
}

# Regions for which a market's sector betas apply at full (US-listed) weight.
FULL_WEIGHT_REGIONS = {"us", "global"}
