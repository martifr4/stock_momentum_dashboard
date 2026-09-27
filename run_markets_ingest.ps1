# Pull the latest Polymarket + Kalshi macro/politics markets into data/markets.db.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
python backend/markets/ingest.py
