import os
import sys
import subprocess
import time
import urllib.request

def main():
    dir_path = os.path.dirname(os.path.abspath(__file__))
    os.chdir(dir_path)
    
    print("=" * 75)
    print("      🌱 PlookPloen Dedicated AI Server (RTX 3050 + Cloudflare) 🌱")
    print("=" * 75)
    print(f"Python Version: {sys.version.split()[0]}")
    
    # 1. Check cloudflared.exe
    cloudflared_path = os.path.join(dir_path, "cloudflared.exe")
    if not os.path.exists(cloudflared_path):
        print("\n[*] cloudflared.exe not found. Downloading automatically...")
        url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        try:
            urllib.request.urlretrieve(url, cloudflared_path)
            print("[OK] Downloaded cloudflared.exe successfully!")
        except Exception as e:
            print(f"[ERROR] Failed to download cloudflared.exe: {e}")
            print("Please download cloudflared-windows-amd64.exe manually and put it here.")
            input("Press Enter to exit...")
            return
    else:
        print("[OK] cloudflared.exe is ready.")
        
    # 2. Check dependencies
    print("\n[*] Checking required packages (PyTorch, FastAPI, etc.)...")
    needs_install = False
    try:
        import fastapi
        import uvicorn
        import PIL
        import numpy
        import torch
        import torchvision
    except ImportError:
        needs_install = True
        
    if needs_install:
        print("[!] Installing missing dependencies...")
        has_gpu = False
        try:
            res = subprocess.run(["nvidia-smi"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if res.returncode == 0:
                has_gpu = True
        except Exception:
            pass
            
        if has_gpu:
            print("[GPU DETECTED] NVIDIA GPU found! Installing PyTorch with CUDA 12.1 for RTX 3050...")
            subprocess.run([sys.executable, "-m", "pip", "install", "torch", "torchvision", "--index-url", "https://download.pytorch.org/whl/cu121"])
        else:
            print("[CPU ONLY] Installing standard CPU PyTorch...")
            subprocess.run([sys.executable, "-m", "pip", "install", "torch", "torchvision", "--extra-index-url", "https://download.pytorch.org/whl/cpu"])
            
        subprocess.run([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn[standard]", "python-multipart", "pillow", "numpy"])
        print("[OK] All packages installed successfully!")
    else:
        print("[OK] All required packages are installed.")
        
    # 3. Start FastAPI server in a separate process
    print("\n[*] Starting FastAPI AI Server (port 8000)...")
    server_cmd = [sys.executable, "app.py"]
    server_proc = subprocess.Popen(server_cmd, cwd=dir_path)
    
    # Wait for FastAPI server to initialize
    print("[*] Waiting 4 seconds for AI model to load...")
    time.sleep(4)
    
    # 4. Start Cloudflare Tunnel
    print("\n" + "=" * 75)
    print(" 🚀 STARTING CLOUDFLARE TUNNEL (Connecting to internet)...")
    print(" 📌 Look for your public HTTPS link ending in: .trycloudflare.com")
    print(" 👉 Example: https://xxxx-xxxx-xxxx.trycloudflare.com")
    print(" 👉 Copy that link and send it to connect to the website!")
    print("=" * 75 + "\n")
    
    tunnel_cmd = [cloudflared_path, "tunnel", "--url", "http://127.0.0.1:8000"]
    tunnel_proc = subprocess.Popen(tunnel_cmd, cwd=dir_path)
    
    try:
        tunnel_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        tunnel_proc.terminate()
        server_proc.terminate()

if __name__ == "__main__":
    main()
