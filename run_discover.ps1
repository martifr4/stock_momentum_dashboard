# Show tickers trending outside your watchlist (add --promote to auto-add them).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
python backend/discovery.py $args
