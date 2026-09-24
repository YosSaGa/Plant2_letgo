import os
import sys
import subprocess
import time
import urllib.request
import json
import re
import threading
from datetime import datetime, timezone

# Ensure UTF-8 stdout/stderr on Windows Thai locale (cp874)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

SUPABASE_URL = "https://akutwibjlxmqoohhqvob.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdXR3aWJqbHhtcW9vaGhxdm9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDY2MTIsImV4cCI6MjEwNDYyMjYxMn0.kjRu7Ks4fOKSRwGpsxKfKnZyq6ij6cMt3iXgRKk9cwY"

def sync_supabase_status(tunnel_url, status="online"):
    try:
        now_str = datetime.now(timezone.utc).isoformat()
        payload = json.dumps({
            "id": "active",
            "url": tunnel_url,
            "status": status,
            "device": "NVIDIA RTX 3050",
            "updated_at": now_str
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/ai_server_status?on_conflict=id",
            data=payload,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            pass
        return True
    except Exception as e:
        print(f"[SYNC NOTICE] Could not sync with Supabase: {e}")
        return False

def start_heartbeat_loop(tunnel_url, stop_event):
    while not stop_event.is_set():
        time.sleep(15)
        if not stop_event.is_set():
            sync_supabase_status(tunnel_url, "online")

def main():
    dir_path = os.path.dirname(os.path.abspath(__file__))
    os.chdir(dir_path)
    
    print("=" * 75)
    print("      🌱 PlookPloen Dedicated AI Server (RTX 3050 + Cloudflare) 🌱")
    print("=" * 75)
    print(f"Current Python: {sys.version.split()[0]}")
    
    # Check Python version compatibility for PyTorch (PyTorch supports Python 3.9 - 3.12)
    if sys.version_info >= (3, 13):
        # Attempt to auto-switch if user has Python 3.11 or 3.12 installed via 'py'
        for candidate in [["py", "-3.11"], ["py", "-3.12"], ["py", "-3.10"]]:
            try:
                chk = subprocess.run(candidate + ["--version"], capture_output=True, text=True)
                if chk.returncode == 0:
                    print(f"[*] Auto-switching to compatible Python: {chk.stdout.strip()}...")
                    subprocess.run(candidate + ["start_laptop.py"])
                    return
            except Exception:
                pass
                
        print("\n" + "!" * 75)
        print(" [คำเตือนสำคัญ / CRITICAL WARNING]")
        print(f" ตรวจพบ Python เวอร์ชัน {sys.version.split()[0]} ซึ่งเป็นเวอร์ชันใหม่เกินไป!")
        print(" โมเดล AI และ PyTorch ยังไม่รองรับ Python 3.13 หรือ 3.14 ครับ")
        print(" แนะนำให้ติดตั้ง Python 3.11 หรือ 3.12 (เสถียรที่สุดสำหรับงาน AI):")
        print(" 👉 ลิงก์ดาวน์โหลด Python 3.11.9 (64-bit):")
        print("    https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe")
        print(" ⚠️ อย่าลืมติ๊กถูกช่อง 'Add python.exe to PATH' ตอนติดตั้งด้วยนะครับ")
        print("!" * 75 + "\n")
        input("กด Enter เพื่อปิด...")
        return

    # 1. Check cloudflared.exe
    cloudflared_path = os.path.join(dir_path, "cloudflared.exe")
    is_valid_cloudflared = False
    if os.path.exists(cloudflared_path):
        try:
            chk = subprocess.run([cloudflared_path, "--version"], capture_output=True, text=True, timeout=5)
            if chk.returncode == 0:
                is_valid_cloudflared = True
        except Exception:
            is_valid_cloudflared = False

    if not is_valid_cloudflared:
        if os.path.exists(cloudflared_path):
            print("\n[!] Existing cloudflared.exe is incomplete or invalid. Deleting and re-downloading...")
            try:
                os.remove(cloudflared_path)
            except Exception:
                pass
        print("\n[*] Downloading clean cloudflared.exe (~55MB, please wait)...")
        url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        try:
            opener = urllib.request.build_opener()
            opener.addheaders = [('User-Agent', 'Mozilla/5.0')]
            urllib.request.install_opener(opener)
            urllib.request.urlretrieve(url, cloudflared_path)
            chk = subprocess.run([cloudflared_path, "--version"], capture_output=True, text=True, timeout=5)
            if chk.returncode == 0:
                print(f"[OK] Downloaded and verified cloudflared.exe successfully! ({chk.stdout.strip()})")
            else:
                raise Exception("Downloaded cloudflared.exe failed verification")
        except Exception as e:
            print(f"[ERROR] Failed to download cloudflared.exe: {e}")
            print("Please download cloudflared-windows-amd64.exe manually and place it in the api folder as cloudflared.exe.")
            input("Press Enter to exit...")
            return
    else:
        print("[OK] cloudflared.exe is valid and ready.")
        
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
    server_cmd = [sys.executable, "-u", "app.py"]
    server_proc = subprocess.Popen(server_cmd, cwd=dir_path)
    
    # Wait for FastAPI server to initialize
    print("[*] Waiting 3 seconds for AI model to load...")
    time.sleep(3)
    if server_proc.poll() is not None:
        print(f"\n[ERROR] FastAPI Server stopped unexpectedly with code {server_proc.returncode}!")
        input("Press Enter to exit...")
        return
    
    # 4. Start Cloudflare Tunnel
    print("\n" + "=" * 75)
    print(" 🚀 STARTING CLOUDFLARE TUNNEL (Connecting to internet)...")
    print(" 📌 Look for your public HTTPS link ending in: .trycloudflare.com")
    print(" 👉 Example: https://xxxx-xxxx-xxxx.trycloudflare.com")
    print(" 🔄 Auto-Sync: The tunnel URL will be synced to Supabase automatically!")
    print("=" * 75 + "\n")
    
    tunnel_cmd = [cloudflared_path, "tunnel", "--url", "http://127.0.0.1:8000"]
    tunnel_proc = subprocess.Popen(
        tunnel_cmd,
        cwd=dir_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1
    )
    
    tunnel_url = None
    stop_heartbeat = threading.Event()
    
    try:
        while True:
            line = tunnel_proc.stdout.readline()
            if not line:
                break
            try:
                sys.stdout.write(line)
                sys.stdout.flush()
            except Exception:
                pass
            
            if not tunnel_url and "trycloudflare.com" in line:
                m = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
                if m:
                    tunnel_url = m.group(0)
                    print("\n" + "=" * 75)
                    print(f" 🚀 [AUTO-SYNC ACTIVE] Live URL synced to Supabase!")
                    print(f" 👉 URL: {tunnel_url}")
                    print(" 👉 Website (Vercel) will connect automatically within 5 seconds!")
                    print("=" * 75 + "\n")
                    sync_supabase_status(tunnel_url, "online")
                    hb_thread = threading.Thread(target=start_heartbeat_loop, args=(tunnel_url, stop_heartbeat), daemon=True)
                    hb_thread.start()
                    
        tunnel_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down AI Server...")
    except Exception as e:
        print(f"\n[STREAM NOTICE] {e}")
    finally:
        stop_heartbeat.set()
        if tunnel_url:
            print("[SYNC] Updating status to offline in Supabase...")
            sync_supabase_status(tunnel_url, "offline")
        try:
            tunnel_proc.terminate()
            server_proc.terminate()
        except Exception:
            pass

if __name__ == "__main__":
    main()
