@echo off
cd /d C:\wamp64\www\farmlink\farmlink-nextjs
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-dev.ps1"
echo Exit code %ERRORLEVEL%
pause
