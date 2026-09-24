@echo off
chcp 65001 >nul
title PlookPloen AI Master Training (NVIDIA GeForce RTX 5060)
cd /d "%~dp0"

echo ===========================================================================
echo       🌱 PLOOKPLOEN DEEP LEARNING MODEL TRAINER (24,333 IMAGES) 🌱
echo       Acceleration: NVIDIA GeForce RTX 5060 (Blackwell 8GB VRAM)
echo ===========================================================================
echo.

if exist ".\.venv\Scripts\python.exe" (
    .\.venv\Scripts\python.exe -u src\plant_train\train_full_ensemble.py
) else (
    python -u src\plant_train\train_full_ensemble.py
)

echo.
pause
