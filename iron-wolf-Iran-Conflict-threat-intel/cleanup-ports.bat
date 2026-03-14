@echo off
:: Helper script: kills Node.js processes listening on ports 3004 or 5176
:: Only kills node.exe processes to avoid terminating unrelated services

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3004 " ^| findstr "LISTENING" 2^>nul') do (
    for /f "tokens=1" %%n in ('tasklist /fi "PID eq %%a" /nh 2^>nul ^| findstr /i "node.exe"') do (
        echo  Stopping stale node process on port 3004, PID %%a
        taskkill /F /PID %%a >nul 2>nul
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5176 " ^| findstr "LISTENING" 2^>nul') do (
    for /f "tokens=1" %%n in ('tasklist /fi "PID eq %%a" /nh 2^>nul ^| findstr /i "node.exe"') do (
        echo  Stopping stale node process on port 5176, PID %%a
        taskkill /F /PID %%a >nul 2>nul
    )
)
