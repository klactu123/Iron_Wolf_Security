@echo off
echo Killing processes on ports 5176 and 3004...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5176 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3004 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
echo Done.
pause
