@echo off
REM Starts signaling server and frontend dev server in separate windows (Windows)
REM Adjust paths if your project is elsewhere.
setlocal

REM Start signaling server in a new window
start "Signaling" cmd /k "cd /d "%~dp0signaling_js" && node server.js"

REM Start frontend (Next dev) in a new window using the build copy to avoid non-ASCII path issues
start "Frontend (dev)" cmd /k "cd /d C:\repos\cekirdek_frontend_build && npm run dev"
endlocal
pause