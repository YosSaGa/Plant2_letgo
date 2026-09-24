@echo off
chcp 65001 >nul
title PlookPloen AI Inference Server (RTX 3050 + Cloudflare Tunnel)
color 0A

echo ===============================================================================
echo       🌱 PlookPloen Dedicated AI Server (RTX 3050 + Cloudflare Tunnel) 🌱
echo ===============================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] ไม่พบ Python ในเครื่อง หรือยังไม่ได้เพิ่มลงใน PATH!
    echo กรุณาติดตั้ง Python (แนะนำ 3.10 หรือ 3.11) และติ๊กถูกที่ "Add python.exe to PATH"
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo [OK] ตรวจพบ: %%v

:: 2. Check cloudflared.exe
if not exist "cloudflared.exe" (
    echo [*] ยังไม่พบ cloudflared.exe ในโฟลเดอร์ กำลังดาวน์โหลดอัตโนมัติจาก Cloudflare...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe', 'cloudflared.exe')"
    if not exist "cloudflared.exe" (
        color 0C
        echo [ERROR] ดาวน์โหลด cloudflared.exe ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
        echo หรือดาวน์โหลดด้วยตนเองจาก: https://github.com/cloudflare/cloudflared/releases
        echo.
        pause
        exit /b 1
    )
    echo [OK] ดาวน์โหลด cloudflared.exe สำเร็จเรียบร้อย!
) else (
    echo [OK] ตรวจพบ cloudflared.exe พร้อมใช้งาน
)

:: 3. Check Dependencies & Install
echo [*] กำลังตรวจสอบแพ็กเกจ Python (PyTorch, FastAPI, ฯลฯ)...
python -c "import fastapi, uvicorn, PIL, numpy, torch, torchvision" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] ตรวจพบว่ายังไม่ได้ติดตั้งแพ็กเกจที่จำเป็น กำลังติดตั้งให้โดยอัตโนมัติ...
    echo [*] กำลังตรวจสอบการ์ดจอ NVIDIA สำหรับเร่งความเร็วโมเดล...
    nvidia-smi >nul 2>&1
    if %errorlevel% equ 0 (
        echo [GPU DETECTED] พบการ์ดจอ NVIDIA! กำลังติดตั้ง PyTorch แบบเปิดใช้งาน CUDA เพื่อความเร็วสูงสุด...
        pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
    ) else (
        echo [CPU ONLY] กำลังติดตั้ง PyTorch แบบมาตรฐาน...
        pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu
    )
    pip install fastapi "uvicorn[standard]" python-multipart pillow numpy
    echo [OK] ติดตั้งแพ็กเกจทั้งหมดเรียบร้อยแล้ว!
) else (
    echo [OK] แพ็กเกจ Python ครบถ้วนพร้อมรัน
)

:: 4. Start FastAPI server in separate window
echo.
echo [*] กำลังเปิดเซิร์ฟเวอร์ AI FastAPI (พอร์ต 8000)...
start "🌱 PlookPloen AI Engine (FastAPI Console)" /high cmd /k "python app.py"

:: Wait 3 seconds for server boot
timeout /t 3 /nobreak >nul

echo.
echo ===============================================================================
echo  🚀 กำลังเปิดอุโมงค์ Cloudflare Tunnel เชื่อมต่อเซิร์ฟเวอร์สู่โลกภายนอก...
echo  📌 สังเกตลิงก์ HTTPS ด้านล่างที่ลงท้ายด้วย '.trycloudflare.com'
echo  👉 นำลิงก์นั้นไปใส่ที่หน้าเว็บ Vercel (หรือไฟล์ DiseaseDetection.jsx) ได้ทันที!
echo ===============================================================================
echo.

cloudflared.exe tunnel --url http://127.0.0.1:8000

pause
