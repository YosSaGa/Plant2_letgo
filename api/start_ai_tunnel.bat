@echo off
title PlookPloen Dedicated AI Server (RTX 3050)
cd /d "%~dp0"

echo =====================================================================
echo       Starting PlookPloen Dedicated AI Server...
echo =====================================================================
echo.

set "PY_EXE="

:: 1. Prioritize Python 3.11 installation (Best for PyTorch & RTX 3050)
if exist "%LocalAppData%\Programs\Python\Python311\python.exe" (
    set "PY_EXE="%LocalAppData%\Programs\Python\Python311\python.exe""
    goto :found
)

:: 2. Try py -3.11 launcher
py -3.11 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXE=py -3.11"
    goto :found
)

:: 3. Check Python 3.12 installation
if exist "%LocalAppData%\Programs\Python\Python312\python.exe" (
    set "PY_EXE="%LocalAppData%\Programs\Python\Python312\python.exe""
    goto :found
)

:: 4. Try py -3.12 launcher
py -3.12 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXE=py -3.12"
    goto :found
)

:: 5. Try default python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXE=python"
    goto :found
)

:: 6. Fallback to py
py --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXE=py"
    goto :found
)

:found
if defined PY_EXE (
    echo [*] Selected Python Engine: %PY_EXE%
    %PY_EXE% start_laptop.py
    echo.
    echo Server session ended.
    pause
    exit /b
)

echo =====================================================================
echo [ERROR] Python 3.11 was not found!
echo Please install Python 3.11 from:
echo https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
echo =====================================================================
pause
