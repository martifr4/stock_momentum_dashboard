"""Stock ticker extraction from free text.

Two detection paths:
  1. Cashtags ($AAPL) -- high precision, catches the long tail.
  2. Bare uppercase tokens (AAPL) -- only accepted if in a known-ticker set,
     to avoid false positives on common words / acronyms.
"""
from __future__ import annotations

import re

# Curated universe of frequently-discussed US tickers. Bare (non-$) mentions are
# only counted if they appear here. Cashtags ($XYZ) are always counted, so the
# long tail is still captured even if a symbol isn't listed.
KNOWN_TICKERS = {
    # Mega / large cap tech
    "AAPL", "MSFT", "GOOG", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "AMD",
    "INTC", "NFLX", "CRM", "ORCL", "ADBE", "CSCO", "AVGO", "QCOM", "TXN",
    "MU", "AMAT", "ASML", "ARM", "SMCI", "PLTR", "SNOW", "NET", "DDOG",
    "CRWD", "PANW", "ZS", "SHOP", "UBER", "ABNB", "PYPL", "SQ", "COIN",
    "HOOD", "SOFI", "AFRM", "RBLX", "U", "DOCN", "TWLO", "OKTA", "MDB",
    # Semis / hardware
    "TSM", "MRVL", "ON", "WOLF", "LRCX", "KLAC", "ADI", "MCHP", "STM",
    # Autos / EV
    "F", "GM", "RIVN", "LCID", "NIO", "XPEV", "LI", "FSR", "STLA", "TM",
    # Finance / banks
    "JPM", "BAC", "WFC", "C", "GS", "MS", "SCHW", "BLK", "AXP", "V", "MA",
    "BRK.A", "BRK.B", "BRKB", "COF", "USB", "PNC", "TFC", "ALLY",
    # Healthcare / pharma
    "JNJ", "PFE", "MRK", "ABBV", "LLY", "UNH", "CVS", "TMO", "ABT", "BMY",
    "GILD", "AMGN", "MRNA", "BNTX", "REGN", "VRTX", "HIMS", "ISRG", "DXCM",
    # Consumer / retail
    "WMT", "COST", "TGT", "HD", "LOW", "NKE", "SBUX", "MCD", "KO", "PEP",
    "PG", "CL", "DIS", "CMG", "LULU", "ULTA", "DKNG", "ELF", "CROX",
    # Energy
    "XOM", "CVX", "COP", "SLB", "OXY", "PSX", "MPC", "VLO", "DVN", "FANG",
    "ENPH", "SEDG", "FSLR", "PLUG", "RUN", "NEE", "KMI", "LNG",
    # Industrials / aero / defense
    "BA", "CAT", "DE", "GE", "HON", "LMT", "RTX", "NOC", "GD", "MMM", "UPS",
    "FDX", "UNP", "CSX", "EMR", "ETN", "PH",
    # Communication / media
    "T", "VZ", "TMUS", "CMCSA", "CHTR", "WBD", "PARA", "SPOT", "ROKU", "SNAP",
    "PINS", "MTCH", "BABA", "PDD", "JD", "SE", "MELI",
    # Meme / high-retail-interest
    "GME", "AMC", "BB", "BBBY", "NOK", "WISH", "CLOV", "SNDL", "TLRY", "MULN",
    "GENI", "DWAC", "PHUN", "BBIG", "ATER", "SPRT", "IRNT", "PROG", "SOUN",
    # Crypto-adjacent equities
    "MSTR", "MARA", "RIOT", "CLSK", "HUT", "BITF", "CIFR", "WULF", "IREN",
    # China / intl ADRs
    "NTES", "BILI", "TCEHY", "BIDU", "GRAB", "STLA",
    # Popular ETFs / indices
    "SPY", "QQQ", "IWM", "DIA", "VOO", "VTI", "VXX", "UVXY", "SQQQ", "TQQQ",
    "SOXL", "SOXS", "TSLL", "SPXL", "SPXU", "ARKK", "XLE", "XLF", "XLK",
    "XLV", "XLY", "XLI", "GLD", "SLV", "USO", "TLT", "HYG", "SMH", "SCHD",
    "JEPI", "JEPQ", "VIG", "VYM", "GDX",
}

# Uppercase tokens that look like tickers but are almost never meant as one.
STOPWORDS = {
    "A", "I", "AI", "AN", "AND", "ARE", "AS", "AT", "BE", "BY", "CEO", "CFO",
    "DD", "DO", "EDIT", "EPS", "ER", "ETF", "EU", "FDA", "FED", "FOR", "FROM",
    "FYI", "GDP", "GO", "IF", "IMO", "IN", "IPO", "IRA", "IRS", "IS", "IT",
    "ITM", "OTM", "LOL", "MOON", "NO", "NOT", "OF", "OK", "ON", "OR", "OTC",
    "PE", "PM", "PR", "PSA", "PT", "RH", "RIP", "ROI", "SEC", "SO", "TA",
    "THE", "TO", "TOS", "UK", "US", "USA", "USD", "WSB", "YOLO", "YOU", "YOUR",
    "ATH", "ATL", "EOD", "EOW", "EOY", "GG", "HODL", "IV", "OP", "TL", "DR",
    "TLDR", "CPI", "PPI", "QE", "QT", "AH", "PMKT", "AMA", "IMHO", "TIL",
    "WTF", "OMG", "FOMO", "TLDW", "ELI", "AF", "IK", "IDK", "NGL", "SP", "YTD",
}

_CASHTAG_RE = re.compile(r"\$([A-Za-z]{1,5}(?:\.[A-Za-z])?)\b")
_BARE_RE = re.compile(r"\b([A-Z]{1,5}(?:\.[A-Z])?)\b")


def extract_tickers(text: str) -> set[str]:
    """Return the set of tickers mentioned in `text`."""
    if not text:
        return set()
    found: set[str] = set()

    # 1. Cashtags -- always trusted.
    for m in _CASHTAG_RE.finditer(text):
        sym = m.group(1).upper()
        if sym not in STOPWORDS:
            found.add(sym)

    # 2. Bare uppercase tokens -- only if in the known universe.
    for m in _BARE_RE.finditer(text):
        sym = m.group(1)
        if sym in STOPWORDS:
            continue
        if sym in KNOWN_TICKERS:
            found.add(sym)

    return found


if __name__ == "__main__":
    sample = "I'm long $NVDA and AAPL but TSLA looks weak. The FED and CEO say IT is fine. $tsm too."
    print(sorted(extract_tickers(sample)))
