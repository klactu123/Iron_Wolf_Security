@echo off
REM Launch the Interactive Python Trainer with auto-save to student folders.
REM The tutor's key comes from the ANTHROPIC_API_KEY environment variable, OR from a
REM .env file you create by entering the key in the browser (the API Key button).
cd /d "%~dp0"
if "%ANTHROPIC_API_KEY%"=="" if not exist ".env" (
  echo.
  echo Note: no API key is configured yet. Once the app opens, click the API Key
  echo   button and enter your Anthropic key -- it will be saved to a local .env file.
  echo   ^(Alternatively set ANTHROPIC_API_KEY as an environment variable.^)
  echo.
)
python server.py
if errorlevel 1 py server.py
pause
