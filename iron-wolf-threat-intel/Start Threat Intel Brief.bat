@echo off
title Iron Wolf Threat Intel Brief Generator
echo.
echo  ===================================================
echo   Iron Wolf Threat Intel Brief Generator
echo   Starting servers...
echo  ===================================================
echo.

:: Kill any processes on our ports first
echo  Clearing ports 5176 and 3004...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5176 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3004 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1

cd /d "%~dp0"

:: Install dependencies on first run
if not exist "node_modules" (
  echo  Installing dependencies (first run)...
  npm install
  echo.
)

echo  Starting Vite (5176) + Express (3004)...
echo  Open http://localhost:5176 in your browser.
echo.

npm run dev
