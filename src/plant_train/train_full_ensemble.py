import os
import sys
import time
import json
import zipfile
import shutil
import random
import numpy as np
from tqdm import tqdm
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.models as models
from torchvision import transforms

# Ensure proper Unicode display on Windows console
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
        sys.stderr.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

ZIP_SOURCE_DIR = r"C:\Users\yossa\Downloads\5Plant"
EXTRACTED_DATA_DIR = r"C:\Users\yossa\Downloads\5Plant_Full_Extracted"
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TRAINED_MODELS_DIR = os.path.join(PROJECT_ROOT, "src", "plant_train", "trained_models")
API_DIR = os.path.join(PROJECT_ROOT, "api")
ONEDRIVE_DIR = r"C:\Users\yossa\OneDrive\เอกสาร\result_plant"

os.makedirs(TRAINED_MODELS_DIR, exist_ok=True)
os.makedirs(API_DIR, exist_ok=True)
if os.path.exists(r"C:\Users\yossa\OneDrive\เอกสาร"):
    os.makedirs(ONEDRIVE_DIR, exist_ok=True)

# 15 Classes mapping
MAPPING = {
    'Chili.zip': {
        'Cercospora Leaf Spot': 'chili_leaf_spot',
        'Leaf Curl Disease': 'chili_leaf_curl',
        'healthy leaf': 'chili_healthy',
    },
    'Tomato.zip': {
        'Early_blight': 'tomato_early_blight',
        'Septoria_leaf_spot': 'tomato_septoria_leaf_spot',
        'healthy': 'tomato_healthy',
    },
    'Basil.zip': {
        'Downy_Mildew': 'basil_downy_mildew',
        'Leaf_Spot_Fungal': 'basil_leaf_spot_fungal',
        'Healthy': 'basil_healthy',
    },
    'krapao.zip': {
        'white_spots': 'krapao_white_spots',
        'insect_bite': 'krapao_insect_bite',
        'healthy': 'krapao_healthy',
    },
    'Lettuce.zip': {
        'Bacterial': 'lettuce_bacterial',
        'Fungal': 'lettuce_fungal',
        'Healthy': 'lettuce_healthy',
    }
}

CLASSES = sorted([
    "basil_downy_mildew", "basil_healthy", "basil_leaf_spot_fungal",
    "chili_healthy", "chili_leaf_curl", "chili_leaf_spot",
    "krapao_healthy", "krapao_insect_bite", "krapao_white_spots",
    "lettuce_bacterial", "lettuce_fungal", "lettuce_healthy",
    "tomato_early_blight", "tomato_healthy", "tomato_septoria_leaf_spot"
])
CLASS_TO_IDX = {c: i for i, c in enumerate(CLASSES)}


def extract_and_prepare_dataset():
    """Extract zip archives into structured class directories if not already done."""
    print("=" * 75)
    print(" 📦 1. CHECKING & PREPARING 24,000+ IMAGE DATASET...")
    print("=" * 75)

    if not os.path.exists(ZIP_SOURCE_DIR):
        raise FileNotFoundError(f"Source folder not found: {ZIP_SOURCE_DIR}")

    os.makedirs(EXTRACTED_DATA_DIR, exist_ok=True)
    
    # Check if already extracted
    existing_imgs = 0
    for c in CLASSES:
        cdir = os.path.join(EXTRACTED_DATA_DIR, c)
        if os.path.exists(cdir):
            existing_imgs += len([f for f in os.listdir(cdir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

    if existing_imgs >= 20000:
        print(f"[OK] Full dataset already extracted ({existing_imgs:,} images found in {EXTRACTED_DATA_DIR})!")
        return

    print(f"[*] Extracting all images from {ZIP_SOURCE_DIR} to {EXTRACTED_DATA_DIR}...")
    for c in CLASSES:
        os.makedirs(os.path.join(EXTRACTED_DATA_DIR, c), exist_ok=True)

    total_extracted = 0
    for zf_name, sub in MAPPING.items():
        zf_path = os.path.join(ZIP_SOURCE_DIR, zf_name)
        if not os.path.exists(zf_path):
            print(f"⚠️ Warning: {zf_name} not found, skipping.")
            continue

        print(f"[*] Unpacking {zf_name}...")
        with zipfile.ZipFile(zf_path, 'r') as zf:
            namelist = [n for n in zf.namelist() if n.lower().endswith(('.jpg', '.jpeg', '.png'))]
            for name in tqdm(namelist, desc=f"   {zf_name}", leave=False):
                parts = name.strip('/').split('/')
                folder = parts[0]
                if folder in sub:
                    target_class = sub[folder]
                    fname = f"{target_class}_{os.path.basename(name)}"
                    target_file = os.path.join(EXTRACTED_DATA_DIR, target_class, fname)
                    if not os.path.exists(target_file):
                        with zf.open(name) as src, open(target_file, 'wb') as dst:
                            shutil.copyfileobj(src, dst)
                        total_extracted += 1

    print(f"[OK] Extraction complete! Total extracted: {total_extracted:,} images.")


class FastPlantDataset(Dataset):
    def __init__(self, samples, transform=None):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            with open(path, 'rb') as f:
                img = Image.open(f).convert('RGB')
        except Exception:
            # Fallback to empty image if corrupted
            img = Image.new('RGB', (256, 256), color=(0, 0, 0))
            
        if self.transform:
            img = self.transform(img)
        return img, label


def create_dataloaders(img_size=256, batch_size=64):
    """Scan dataset, balance splits, compute class weights, and build DataLoaders."""
    all_samples = []
    class_counts = {c: 0 for c in CLASSES}

    for c in CLASSES:
        cdir = os.path.join(EXTRACTED_DATA_DIR, c)
        if os.path.exists(cdir):
            fnames = [os.path.join(cdir, f) for f in os.listdir(cdir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            class_counts[c] = len(fnames)
            for fp in fnames:
                all_samples.append((fp, CLASS_TO_IDX[c]))

    print("\n" + "=" * 75)
    print(" 📊 2. DATASET SUMMARY ACROSS 15 CLASSES:")
    print("=" * 75)
    for c in CLASSES:
        print(f" • {c:28s}: {class_counts[c]:5d} images")
    print(f" 🌟 TOTAL IMAGES: {len(all_samples):,} images")
    print("=" * 75)

    # Stratified Train/Val split (80% / 20%)
    train_samples = []
    val_samples = []

    for c in CLASSES:
        c_samples = [s for s in all_samples if s[1] == CLASS_TO_IDX[c]]
        random.shuffle(c_samples)
        split_idx = int(len(c_samples) * 0.8)
        train_samples.extend(c_samples[:split_idx])
        val_samples.extend(c_samples[split_idx:])

    random.shuffle(train_samples)
    random.shuffle(val_samples)

    # Compute Inverse Class Weights for balanced loss
    total_train = len(train_samples)
    weights = []
    for c in CLASSES:
        count = max(1, int(class_counts[c] * 0.8))
        # Smooth inverse frequency
        w = total_train / (len(CLASSES) * count)
        weights.append(w)
    weights_tensor = torch.tensor(weights, dtype=torch.float32).to(DEVICE)
    print("\n[*] Computed Balanced Class Weights to eliminate class bias (Basil vs Krapao).")

    # High-performance transforms
    train_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    train_loader = DataLoader(
        FastPlantDataset(train_samples, train_transform),
        batch_size=batch_size,
        shuffle=True,
        num_workers=4,
        pin_memory=True
    )

    val_loader = DataLoader(
        FastPlantDataset(val_samples, val_transform),
        batch_size=batch_size,
        shuffle=False,
        num_workers=4,
        pin_memory=True
    )

    return train_loader, val_loader, weights_tensor, len(train_samples), len(val_samples)


def build_model(arch="mobilenet_v3"):
    """Instantiate and adapt neural network architecture."""
    if arch == "mobilenet_v3":
        m = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
        in_features = m.classifier[3].in_features
        m.classifier[3] = nn.Linear(in_features, len(CLASSES))
        name = "MobileNetV3-Large"
    elif arch == "efficientnet_v2":
        m = models.efficientnet_v2_s(weights=models.EfficientNet_V2_S_Weights.DEFAULT)
        in_features = m.classifier[1].in_features
        m.classifier[1] = nn.Linear(in_features, len(CLASSES))
        name = "EfficientNet-V2-S"
    elif arch == "densenet_121":
        m = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
        in_features = m.classifier.in_features
        m.classifier = nn.Linear(in_features, len(CLASSES))
        name = "DenseNet-121"
    elif arch == "resnet_50":
        m = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        in_features = m.fc.in_features
        m.fc = nn.Linear(in_features, len(CLASSES))
        name = "ResNet-50"
    else:
        raise ValueError(f"Unknown architecture: {arch}")

    m.to(DEVICE)
    param_count = sum(p.numel() for p in m.parameters() if p.requires_grad)
    print(f"\n[*] Initialized {name} ({param_count:,} trainable parameters) on {DEVICE} ({torch.cuda.get_device_name(0)})")
    return m, name


def train_single_model(arch="mobilenet_v3", epochs=15, img_size=256, batch_size=64):
    """Execute high-speed training loop with Mixed Precision and Cosine Annealing."""
    train_loader, val_loader, class_weights, n_train, n_val = create_dataloaders(img_size=img_size, batch_size=batch_size)
    model, model_name = build_model(arch)

    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)
    scaler = torch.amp.GradScaler('cuda')

    print("\n" + "=" * 75)
    print(f" 🚀 3. TRAINING {model_name.upper()} ({epochs} EPOCHS, {n_train:,} TRAIN / {n_val:,} VAL)")
    print(f" ⚡ Hardware Acceleration: {torch.cuda.get_device_name(0)} (Tensor Cores Mixed Precision FP16)")
    print("=" * 75)

    best_val_acc = 0.0
    best_weights = None
    history = []

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        pbar = tqdm(train_loader, desc=f"Epoch {epoch:02d}/{epochs:02d} [Train]", leave=False)
        for images, labels in pbar:
            images = images.to(DEVICE, non_blocking=True)
            labels = labels.to(DEVICE, non_blocking=True)

            optimizer.zero_grad(set_to_none=True)
            with torch.amp.autocast('cuda', dtype=torch.float16):
                outputs = model(images)
                loss = criterion(outputs, labels)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct_train += torch.sum(preds == labels.data).item()
            total_train += images.size(0)
            pbar.set_postfix({"loss": f"{loss.item():.3f}"})

        scheduler.step()
        epoch_train_loss = running_loss / total_train
        epoch_train_acc = (correct_train / total_train) * 100.0

        # Validation phase
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.inference_mode():
            for images, labels in val_loader:
                images = images.to(DEVICE, non_blocking=True)
                labels = labels.to(DEVICE, non_blocking=True)

                with torch.amp.autocast('cuda', dtype=torch.float16):
                    outputs = model(images)
                    loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                correct_val += torch.sum(preds == labels.data).item()
                total_val += images.size(0)

        epoch_val_loss = val_loss / total_val
        epoch_val_acc = (correct_val / total_val) * 100.0
        elapsed = time.time() - t0

        is_best = epoch_val_acc > best_val_acc
        if is_best:
            best_val_acc = epoch_val_acc
            best_weights = model.state_dict()

        star = "🌟 BEST!" if is_best else ""
        print(f" Epoch {epoch:02d}/{epochs:02d} [{elapsed:.1f}s] - Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc:.2f}% | Val Loss: {epoch_val_loss:.4f} Val Acc: {epoch_val_acc:.2f}% {star}")
        history.append({
            "epoch": epoch,
            "train_loss": epoch_train_loss,
            "train_acc": epoch_train_acc,
            "val_loss": epoch_val_loss,
            "val_acc": epoch_val_acc
        })

    print("\n" + "=" * 75)
    print(f" 🏆 TRAINING FINISHED! Best Validation Accuracy: {best_val_acc:.2f}%")
    print("=" * 75)

    # Save best checkpoint
    save_filename = f"{arch}_full24k_acc{int(best_val_acc*100)}.pth"
    save_path = os.path.join(TRAINED_MODELS_DIR, save_filename)
    torch.save(best_weights, save_path)
    print(f" [OK] Saved Model Checkpoint: {save_path}")

    # If MobileNetV3, update live API model
    if arch == "mobilenet_v3":
        api_target = os.path.join(API_DIR, "plant_disease_model.pth")
        torch.save(best_weights, api_target)
        print(f" [OK] Deployed to Live API: {api_target}")

    # Copy to OneDrive if accessible
    if os.path.exists(ONEDRIVE_DIR):
        try:
            shutil.copy2(save_path, os.path.join(ONEDRIVE_DIR, save_filename))
            print(f" [OK] Backup saved to OneDrive: {ONEDRIVE_DIR}")
        except Exception:
            pass

    return best_val_acc, save_path


def main():
    print("""
===========================================================================
      🌱 PLOOKPLOEN DEEP LEARNING MODEL TRAINER (24,333 IMAGES) 🌱
   Powered by NVIDIA GeForce RTX 5060 (Blackwell) & PyTorch Tensor Cores
===========================================================================
    """)
    extract_and_prepare_dataset()

    print("\nโปรดเลือกโหมดการเทรนที่ต้องการ:")
    print(" 1) [แนะนำสุด - เร็ว & ตรงสเปก] MobileNetV3-Large (~7-9 นาที, 17 MB)")
    print(" 2) [ความแม่นยำสูงสุด State-of-the-Art] EfficientNet-V2-S (~15 นาที, 85 MB)")
    print(" 3) [ชุดรวม Ensemble 4 โมเดลรวดเดียว] MobileNet + EfficientNet + DenseNet + ResNet (~45 นาที)")
    
    choice = input("\nพิมพ์ตัวเลข (1, 2 หรือ 3) แล้วกด Enter [ค่าเริ่มต้น 1]: ").strip()
    if choice == "2":
        train_single_model(arch="efficientnet_v2", epochs=15, img_size=256, batch_size=48)
    elif choice == "3":
        print("\n🚀 เริ่มต้นฝึกฝนระบบ Ensemble 4 โมเดลอย่างต่อเนื่อง...")
        for a in ["mobilenet_v3", "efficientnet_v2", "densenet_121", "resnet_50"]:
            train_single_model(arch=a, epochs=12, img_size=256, batch_size=48)
    else:
        train_single_model(arch="mobilenet_v3", epochs=15, img_size=256, batch_size=64)

    print("\n" + "=" * 75)
    print(" 🎉 การฝึกฝนโมเดล AI เสร็จสมบูรณ์เรียบร้อยแล้ว!")
    print(" นำไฟล์ .pth ที่ได้ไปวางในโน้ตบุ๊กเพื่อเริ่มใช้งานได้ทันทีครับ")
    print("=" * 75 + "\n")
    input("กด Enter เพื่อปิดหน้าต่างนี้...")

if __name__ == "__main__":
    main()
