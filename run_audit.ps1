# Validate stored mentions (legitimacy + sentiment agreement) and print a report.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
python backend/audit.py --flags
