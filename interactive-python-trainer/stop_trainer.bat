@echo off
REM Stop the Interactive Python Trainer server (windowless or not).
cd /d "%~dp0"
if not exist ".server.pid" (
  echo The trainer server does not appear to be running.
  echo (No .server.pid file found.)
  pause
  exit /b
)
set /p PID=<.server.pid
taskkill /PID %PID% /F >nul 2>&1
if errorlevel 1 (
  echo Could not stop process %PID% ^(it may have already exited^).
) else (
  echo Stopped the trainer server ^(PID %PID%^).
)
del ".server.pid" >nul 2>&1
pause
