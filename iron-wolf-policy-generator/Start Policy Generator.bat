@echo off
title Iron Wolf - Security Policy Generator
echo.
echo  ========================================
echo   Iron Wolf Security Policy Generator
echo  ========================================
echo.

cd /d "%~dp0"

:: Check for node_modules
if not exist "node_modules\" (
    echo  Installing dependencies...
    echo.
    npm install
    echo.
)

:: Check for .env
if not exist ".env" (
    echo  [WARNING] No .env file found.
    echo  Copy .env.example to .env and add your ANTHROPIC_API_KEY.
    echo.
)

:: Kill any processes on ports 5175 and 3003
echo  Freeing ports 5175 and 3003...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5175 " 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3003 " 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo.

echo  Starting Policy Generator...
echo  Frontend: http://localhost:5175
echo  Backend:  http://localhost:3003
echo.
echo  Press Ctrl+C to stop.
echo.

npm run dev
