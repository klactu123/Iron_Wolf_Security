@echo off
REM Kill any processes on ports 5174 and 3002
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
