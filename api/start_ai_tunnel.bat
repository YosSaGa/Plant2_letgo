@echo off
title PlookPloen Dedicated AI Server (RTX 3050)
cd /d "%~dp0"

echo =====================================================================
echo       Starting PlookPloen Dedicated AI Server...
echo =====================================================================
echo.

if exist "%LocalAppData%\Programs\Python\Python311\python.exe" (
    "%LocalAppData%\Programs\Python\Python311\python.exe" start_laptop.py
    pause
    exit /b
)

py -3.11 start_laptop.py
if %errorlevel% equ 0 (
    pause
    exit /b
)

python start_laptop.py
if %errorlevel% equ 0 (
    pause
    exit /b
)

py start_laptop.py
pause
