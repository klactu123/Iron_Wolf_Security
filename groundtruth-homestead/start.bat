@echo off
REM GroundTruth Homestead launcher.
REM Double-click to install (if needed), start the dev server, and open the app.

setlocal EnableDelayedExpansion
cd /d "%~dp0"

title GroundTruth Homestead

echo.
echo === GroundTruth Homestead ===
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not on PATH.
    echo Install Node.js 20 or newer from https://nodejs.org/ then re-run this file.
    echo.
    pause
    exit /b 1
)

REM --- Free port 3000 if a previous run left a Next dev server behind ---
set PORT_PID=
set PORT_FREE=1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":3000 "') do (
    set PORT_PID=%%a
)
if defined PORT_PID (
    set PORT_FREE=0
    REM Pipes inside parenthesized blocks: use plain "|", not "^|".
    tasklist /FI "PID eq !PORT_PID!" /FO csv | findstr /I "node.exe" >nul
    if not errorlevel 1 (
        echo Found a leftover Node process on port 3000 ^(PID !PORT_PID!^). Stopping it...
        taskkill /F /PID !PORT_PID! >nul 2>&1
        REM Give Windows a moment to actually release the port + file handles.
        ping -n 2 127.0.0.1 >nul
        set PORT_FREE=1
    ) else (
        echo WARNING: Port 3000 is in use by PID !PORT_PID! ^(not Node^).
        echo The server will pick a different port and you'll need to open it manually.
        echo.
    )
)

REM --- Clear stale build cache only if port 3000 is free.
REM     Wiping .next while another dev server is still running breaks that server.
if "!PORT_FREE!"=="1" (
    if exist ".next" (
        rmdir /s /q ".next" >nul 2>&1
    )
)

if not exist "node_modules" (
    echo Installing dependencies. This only happens once and may take a minute...
    echo.
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed. See messages above.
        pause
        exit /b 1
    )
    echo.
)

echo Starting server at http://localhost:3000 ...
echo The browser will open automatically once it is ready.
echo Press Ctrl+C in this window to stop the server.
echo.

REM Open the browser after a short delay so the server has time to bind.
start "" /b cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"

call npm run dev

REM If the server exits, leave the window open so the user can read any errors.
echo.
echo Server stopped.
pause
endlocal
