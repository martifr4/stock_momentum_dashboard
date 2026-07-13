# Pull the latest Reddit data into the database.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
python backend/ingest.py
