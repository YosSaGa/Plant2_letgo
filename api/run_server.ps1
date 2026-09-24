$Host.UI.RawUI.WindowTitle = "PlookPloen AI Inference Server (RTX 3050 + Cloudflare Tunnel)"

Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "      PlookPloen Dedicated AI Server (RTX 3050 + Cloudflare Tunnel)" -ForegroundColor Green
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
        Write-Host "[ERROR] Python is not installed or not added to PATH!" -ForegroundColor Red
        Write-Host "Please install Python (3.10 or 3.11 recommended) and check 'Add python.exe to PATH'." -ForegroundColor Yellow
        Write-Host "Download: https://www.python.org/downloads/" -ForegroundColor Cyan
        Read-Host "Press Enter to exit..."
        exit 1
    }
}
$pyVer = & $pythonExe --version 2>&1
Write-Host "[OK] Detected Python: $pyVer" -ForegroundColor Cyan

# 2. Check and Setup Directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
Set-Location $scriptDir
$cloudflaredPath = Join-Path $scriptDir "cloudflared.exe"

# Download cloudflared.exe if missing
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "[*] cloudflared.exe not found. Downloading automatically from Cloudflare..." -ForegroundColor Yellow
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
        Write-Host "[OK] cloudflared.exe downloaded successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Automatic download of cloudflared.exe failed." -ForegroundColor Red
        Write-Host "Please download cloudflared-windows-amd64.exe manually from:" -ForegroundColor Yellow
        Write-Host "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -ForegroundColor Cyan
        Write-Host "Place it inside the 'api' folder and rename it to 'cloudflared.exe'." -ForegroundColor Yellow
        Read-Host "Press Enter to exit..."
        exit 1
    }
} else {
    Write-Host "[OK] cloudflared.exe is ready." -ForegroundColor Green
}

# 3. Check Dependencies & Install
Write-Host "[*] Checking Python packages (PyTorch, FastAPI, etc.)..." -ForegroundColor Yellow
$checkPkgs = & $pythonExe -c "import fastapi, uvicorn, PIL, numpy, torch, torchvision" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Missing required packages. Installing automatically..." -ForegroundColor Yellow
    $nvidiaSmi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
    if ($nvidiaSmi) {
        Write-Host "[GPU DETECTED] NVIDIA GPU detected! Installing PyTorch with CUDA 12.1 for RTX 3050..." -ForegroundColor Green
        & $pythonExe -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
    } else {
        Write-Host "[CPU ONLY] Installing standard CPU PyTorch..." -ForegroundColor Cyan
        & $pythonExe -m pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu
    }
    & $pythonExe -m pip install fastapi "uvicorn[standard]" python-multipart pillow numpy
    Write-Host "[OK] All dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "[OK] All required packages are installed." -ForegroundColor Green
}

# 4. Start FastAPI server in separate window
Write-Host ""
Write-Host "[*] Starting FastAPI AI Server on port 8000..." -ForegroundColor Cyan
$appProcess = Start-Process cmd -ArgumentList "/k", "$pythonExe app.py" -WorkingDirectory $scriptDir -PassThru -WindowStyle Normal
if ($appProcess) {
    try { $appProcess.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High } catch {}
}

Start-Sleep -Seconds 4

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "  Starting Cloudflare Tunnel to expose your server to the internet..." -ForegroundColor Green
Write-Host "  LOOK FOR THE HTTPS LINK ENDING WITH: .trycloudflare.com" -ForegroundColor Yellow
Write-Host "  Example: https://xxxx-xxxx-xxxx.trycloudflare.com" -ForegroundColor Cyan
Write-Host "  Copy that link and share it or paste it into your web app!" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""

& $cloudflaredPath tunnel --url http://127.0.0.1:8000
