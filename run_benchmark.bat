@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Plant Disease Model Benchmark (RTX 5060)
cls
.\.venv\Scripts\python.exe -u src\plant_train\benchmark_train.py
echo.
pause
