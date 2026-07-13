# Start the dashboard web server.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
python backend/server.py
