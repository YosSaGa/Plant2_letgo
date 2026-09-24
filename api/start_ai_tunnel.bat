@echo off
title PlookPloen AI Server Launcher
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_server.ps1"
echo.
echo =======================================================
echo Process finished (Exit code: %errorlevel%).
echo =======================================================
pause
