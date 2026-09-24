@echo off
title PlookPloen Dedicated AI Server
cd /d "%~dp0"

echo =====================================================================
echo       Starting PlookPloen Dedicated AI Server...
echo =====================================================================
echo.

python start_laptop.py
if %errorlevel% neq 0 (
    py start_laptop.py
)

if %errorlevel% neq 0 (
    echo.
    echo =====================================================================
    echo [ERROR] Python was not found or failed to start!
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add python.exe to PATH" during installation.
    echo =====================================================================
    echo.
    pause
)
