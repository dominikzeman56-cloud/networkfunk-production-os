# NPOS Startup Script
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host "Starting Neurofunk Production OS..." -ForegroundColor Cyan

# Start API Server (folder is Server/ with capital S)
Write-Host "[1/2] Starting API Server on port 3099..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\Server'; node api.js"

# Start Web Frontend (folder is Web/ with capital W)
Write-Host "[2/2] Starting Web Frontend on port 4321..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\Web'; npm run dev"

Write-Host ""
Write-Host "NPOS services started!" -ForegroundColor Green
Write-Host "  API: http://localhost:3099" -ForegroundColor White
Write-Host "  Web: http://localhost:4321" -ForegroundColor White
Write-Host ""
Write-Host "Tip: from root you can also run  npm run dev" -ForegroundColor DarkGray
