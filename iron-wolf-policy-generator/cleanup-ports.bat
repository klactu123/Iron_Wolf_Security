@echo off
title Cleanup Ports - Policy Generator
echo.
echo  Cleaning up ports 5175 and 3003...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5175 "') do (
    echo  Killing PID %%a on port 5175
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3003 "') do (
    echo  Killing PID %%a on port 3003
    taskkill /F /PID %%a 2>nul
)

echo.
echo  Done. Ports 5175 and 3003 are now free.
echo.
pause
