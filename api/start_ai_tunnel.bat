@echo off
title PlookPloen Dedicated AI Server (RTX 3050)
cd /d "%~dp0"

echo =====================================================================
echo       Starting PlookPloen Dedicated AI Server...
echo =====================================================================
echo.

set "PY_EXE="

:: 1. Check Python 3.11 in LocalAppData
if exist "%LocalAppData%\Programs\Python\Python311\python.exe" (
    set "PY_EXE="%LocalAppData%\Programs\Python\Python311\python.exe""
    goto :found
)

:: 2. Check py -3.11
py -3.11 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXE=py -3.11"
    goto :found
)

:: 3. If Python 3.11 is not found, auto-download and install silently
echo [*] Python 3.11 not found. Downloading and installing Python 3.11 automatically...
echo [*] Please wait, downloading Python 3.11.9 (~25 MB)...

if not exist "python-3.11.9-amd64.exe" (
    curl.exe -L -o "python-3.11.9-amd64.exe" "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe"
)

if not exist "python-3.11.9-amd64.exe" (
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile 'python-3.11.9-amd64.exe' -UseBasicParsing"
)

if exist "python-3.11.9-amd64.exe" (
    echo [*] Installing Python 3.11 silently with PATH enabled...
    "python-3.11.9-amd64.exe" /quiet InstallAllUsers=0 PrependPath=1 Include_test=0
    timeout /t 5 /nobreak >nul
)

:: 4. Re-check after installation
if exist "%LocalAppData%\Programs\Python\Python311\python.exe" (
    set "PY_EXE="%LocalAppData%\Programs\Python\Python311\python.exe""
    echo [OK] Python 3.11 installed successfully!
    goto :found
)

py -3.11 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXE=py -3.11"
    echo [OK] Python 3.11 installed successfully!
    goto :found
)

:: 5. Fallbacks
if exist "%LocalAppData%\Programs\Python\Python312\python.exe" (
    set "PY_EXE="%LocalAppData%\Programs\Python\Python312\python.exe""
    goto :found
)

py -3.12 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXE=py -3.12"
    goto :found
)

python --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXE=python"
    goto :found
)

:found
if defined PY_EXE (
    echo [*] Running AI Server with: %PY_EXE%
    echo.
    %PY_EXE% start_laptop.py
    echo.
    echo Server session ended.
    pause
    exit /b
)

echo =====================================================================
echo [ERROR] Failed to start Python.
echo Please run python-3.11.9-amd64.exe manually and check 'Add to PATH'.
echo =====================================================================
pause
