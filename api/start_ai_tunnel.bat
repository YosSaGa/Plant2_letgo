@echo off
title PlookPloen AI Server Launcher
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_server.ps1"
if %errorlevel% neq 0 (
    echo.
    echo =======================================================
    echo [ERROR] Process stopped with code %errorlevel%.
    echo =======================================================
    pause
)
