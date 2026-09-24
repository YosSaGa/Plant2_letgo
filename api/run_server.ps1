[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "PlookPloen AI Inference Server (RTX 3050 + Cloudflare Tunnel)"

Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "      🌱 PlookPloen Dedicated AI Server (RTX 3050 + Cloudflare Tunnel) 🌱" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""

# 1. Check Python
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
$pythonExe = "python"
if (-not $pythonCmd) {
    $pyCmd = Get-Command py -ErrorAction SilentlyContinue
    if ($pyCmd) {
        $pythonExe = "py"
    } else {
        Write-Host "[ERROR] ไม่พบ Python ในเครื่อง หรือยังไม่ได้เพิ่มลงใน PATH!" -ForegroundColor Red
        Write-Host "กรุณาติดตั้ง Python (แนะนำ 3.10 หรือ 3.11) และอย่าลืมติ๊ก 'Add python.exe to PATH'" -ForegroundColor Yellow
        Write-Host "ดาวน์โหลดได้ที่: https://www.python.org/downloads/" -ForegroundColor Cyan
        Read-Host "กด Enter เพื่อปิด..."
        exit 1
    }
}
$pyVer = & $pythonExe --version 2>&1
Write-Host "[OK] ตรวจพบ Python: $pyVer" -ForegroundColor Cyan

# 2. Check and Setup Directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
Set-Location $scriptDir
$cloudflaredPath = Join-Path $scriptDir "cloudflared.exe"

# Download cloudflared.exe if missing
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "[*] ยังไม่พบ cloudflared.exe กำลังดาวน์โหลดอัตโนมัติจาก Cloudflare..." -ForegroundColor Yellow
    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    $downloadSuccess = $false
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $downloadUrl -OutFile $cloudflaredPath -UseBasicParsing
        $downloadSuccess = (Test-Path $cloudflaredPath)
    } catch {
        try {
            $webClient = New-Object System.Net.WebClient
            $webClient.DownloadFile($downloadUrl, $cloudflaredPath)
            $downloadSuccess = (Test-Path $cloudflaredPath)
        } catch {
            $downloadSuccess = $false
        }
    }

    if ($downloadSuccess) {
        Write-Host "[OK] ดาวน์โหลด cloudflared.exe สำเร็จเรียบร้อย!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] ดาวน์โหลด cloudflared.exe อัตโนมัติไม่สำเร็จ" -ForegroundColor Red
        Write-Host "กรุณาดาวน์โหลด cloudflared-windows-amd64.exe ด้วยตนเองจาก:" -ForegroundColor Yellow
        Write-Host "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -ForegroundColor Cyan
        Write-Host "แล้วนำมาวางในโฟลเดอร์ api และเปลี่ยนชื่อเป็น cloudflared.exe" -ForegroundColor Yellow
        Read-Host "กด Enter เพื่อปิด..."
        exit 1
    }
} else {
    Write-Host "[OK] ตรวจพบ cloudflared.exe พร้อมใช้งาน" -ForegroundColor Green
}

# 3. Check Dependencies & Install
Write-Host "[*] กำลังตรวจสอบแพ็กเกจ Python (PyTorch, FastAPI, ฯลฯ)..." -ForegroundColor Yellow
$checkPkgs = & $pythonExe -c "import fastapi, uvicorn, PIL, numpy, torch, torchvision" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] ยังไม่ได้ติดตั้งแพ็กเกจที่จำเป็น กำลังติดตั้งให้โดยอัตโนมัติ..." -ForegroundColor Yellow
    $nvidiaSmi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
    if ($nvidiaSmi) {
        Write-Host "[GPU DETECTED] พบการ์ดจอ NVIDIA! กำลังติดตั้ง PyTorch แบบเปิดใช้งาน CUDA 12.1 (สำหรับ RTX 3050)..." -ForegroundColor Green
        & $pythonExe -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
    } else {
        Write-Host "[CPU ONLY] กำลังติดตั้ง PyTorch แบบมาตรฐาน..." -ForegroundColor Cyan
        & $pythonExe -m pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu
    }
    & $pythonExe -m pip install fastapi "uvicorn[standard]" python-multipart pillow numpy
    Write-Host "[OK] ติดตั้งแพ็กเกจทั้งหมดเรียบร้อยแล้ว!" -ForegroundColor Green
} else {
    Write-Host "[OK] แพ็กเกจ Python ครบถ้วนพร้อมรัน" -ForegroundColor Green
}

# 4. Start FastAPI server in separate window
Write-Host ""
Write-Host "[*] กำลังเปิดเซิร์ฟเวอร์ AI FastAPI (พอร์ต 8000)..." -ForegroundColor Cyan
$appProcess = Start-Process cmd -ArgumentList "/k", "$pythonExe app.py" -WorkingDirectory $scriptDir -PassThru -WindowStyle Normal
if ($appProcess) {
    try { $appProcess.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High } catch {}
}

Start-Sleep -Seconds 4

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host " 🚀 กำลังเปิดอุโมงค์ Cloudflare Tunnel เชื่อมต่อเซิร์ฟเวอร์สู่โลกภายนอก..." -ForegroundColor Green
Write-Host " 📌 มองหาบรรทัดลิงก์ HTTPS ที่ลงท้ายด้วย '.trycloudflare.com'" -ForegroundColor Yellow
Write-Host " 👉 เช่น: https://xxxx-xxxx-xxxx.trycloudflare.com" -ForegroundColor Cyan
Write-Host " 👉 ก๊อปปี้ลิงก์นั้นมาแจ้งผม หรือนำไปใส่ในเว็บ Vercel ได้ทันที!" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""

& $cloudflaredPath tunnel --url http://127.0.0.1:8000
