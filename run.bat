@echo off
cd /d "%~dp0farmlink-nextjs"
echo Clearing any background Node processes...
taskkill /F /IM node.exe >nul 2>&1
echo Starting FarmLink Next.js server...
echo Access it at: http://localhost:3000
call node "%~dp0farmlink-nextjs\node_modules\next\dist\bin\next" dev -p 3000
pause
