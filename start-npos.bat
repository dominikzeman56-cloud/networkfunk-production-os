@echo off
setlocal
cd /d "%~dp0"

echo Starting Neurofunk Production OS...
echo [1/2] Starting API Server...
start "NPOS API" cmd /k "cd /d "%~dp0Server" && node api.js"
echo [2/2] Starting Web Frontend...
start "NPOS Web" cmd /k "cd /d "%~dp0Web" && npm run dev"
echo.
echo NPOS services started!
echo   API: http://localhost:3099
echo   Web: http://localhost:4321
echo.
echo Tip: from root you can also run  npm run dev
endlocal
