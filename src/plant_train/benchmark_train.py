import argparse
import copy
import json
import os
import random
import shutil
import sys
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms, models
from PIL import Image
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from tqdm import tqdm
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Windows Unicode & Console Encoding Fix
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

DEFAULT_DATA_DIR = r"C:\Users\yossa\Downloads\5Plant_200"
ONEDRIVE_SAVE_DIR = r"C:\Users\yossa\OneDrive\เอกสาร\result_plant"
BACKUP_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "benchmark_results")
os.makedirs(ONEDRIVE_SAVE_DIR, exist_ok=True)
os.makedirs(BACKUP_OUTPUT_DIR, exist_ok=True)
OUTPUT_DIR = ONEDRIVE_SAVE_DIR

# THAI TRANSLATIONS FOR DISEASES
DISEASE_THAI_MAP = {
    # Chili
    "chili_leaf_spot": "โรคใบจุด (Leaf Spot)",
    "chili_leaf_curl": "โรคใบหงิกเหลือง (Leaf Curl)",
    "chili_healthy": "ใบปกติ สมบูรณ์ (Healthy)",
    # Tomato
    "tomato_early_blight": "โรคใบไหม้ (Early Blight)",
    "tomato_septoria_leaf_spot": "โรคใบจุดเซปทอเรีย (Septoria Leaf Spot)",
    "tomato_healthy": "ใบปกติ สมบูรณ์ (Healthy)",
    # Basil
    "basil_downy_mildew": "โรคราน้ำค้าง (Downy Mildew)",
    "basil_leaf_spot_fungal": "โรคใบจุดจากเชื้อรา (Fungal Leaf Spot)",
    "basil_healthy": "ใบปกติ สมบูรณ์ (Healthy)",
    # Krapao
    "krapao_insect_bite": "รอยแมลงกัดแทะ (Insect Bite)",
    "krapao_white_spots": "โรคจุดขาวบนใบ (White Spots)",
    "krapao_healthy": "ใบปกติ สมบูรณ์ (Healthy)",
    # Lettuce
    "lettuce_bacterial": "โรคจากแบคทีเรีย (Bacterial Disease)",
    "lettuce_fungal": "โรคจากเชื้อรา (Fungal Disease)",
    "lettuce_healthy": "ใบปกติ สมบูรณ์ (Healthy)"
}

PLANT_THAI_MAP = {
    "Chili": "พริก (Chili)",
    "Tomato": "มะเขือเทศ (Tomato)",
    "Basil": "โหระพา (Thai Basil)",
    "Krapao": "กะเพรา (Holy Basil)",
    "Lettuce": "ผักกาดหอม (Lettuce)"
}

# -------------------------------------------------------------
# 1. DATASET LOADER
# -------------------------------------------------------------
class PlantDataset(Dataset):
    def __init__(self, samples, transform=None):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, label

def get_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    return train_transform, val_transform

def load_plant_data(data_dir, plant_name, train_ratio=0.8):
    plant_path = os.path.join(data_dir, plant_name)
    if not os.path.exists(plant_path):
        raise FileNotFoundError(f"Plant folder not found: {plant_path}")

    class_names = sorted([d for d in os.listdir(plant_path) if os.path.isdir(os.path.join(plant_path, d))])
    class_to_idx = {cls_name: i for i, cls_name in enumerate(class_names)}

    train_samples, val_samples = [], []
    valid_exts = ('.jpg', '.jpeg', '.png', '.webp', '.bmp', '.JPG', '.JPEG', '.PNG')

    print(f"\n📁 [ชุดข้อมูล] กำลังโหลดภาพของ '{PLANT_THAI_MAP.get(plant_name, plant_name)}' (ทั้งหมด {len(class_names)} คลาส):", flush=True)
    for cls_name in class_names:
        cls_dir = os.path.join(plant_path, cls_name)
        images = [
            os.path.join(cls_dir, f) for f in os.listdir(cls_dir) 
            if f.lower().endswith(valid_exts)
        ]
        random.shuffle(images)
        split_idx = int(len(images) * train_ratio)
        train_imgs = images[:split_idx]
        val_imgs = images[split_idx:]

        for img in train_imgs:
            train_samples.append((img, class_to_idx[cls_name]))
        for img in val_imgs:
            val_samples.append((img, class_to_idx[cls_name]))

        thai_desc = DISEASE_THAI_MAP.get(cls_name, cls_name)
        print(f"   ├─ {thai_desc:<36}: รวม {len(images)} ภาพ (Train: {len(train_imgs)}, Val: {len(val_imgs)})", flush=True)

    train_t, val_t = get_transforms()
    train_dataset = PlantDataset(train_samples, transform=train_t)
    val_dataset = PlantDataset(val_samples, transform=val_t)

    return train_dataset, val_dataset, class_names

# -------------------------------------------------------------
# 2. MODEL FACTORY
# -------------------------------------------------------------
def build_model(model_name, num_classes):
    if model_name == "MobileNetV3-Large":
        m = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
        in_feat = m.classifier[3].in_features
        m.classifier[3] = nn.Linear(in_feat, num_classes)
    elif model_name == "EfficientNet-B0":
        m = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        in_feat = m.classifier[1].in_features
        m.classifier[1] = nn.Linear(in_feat, num_classes)
    elif model_name == "ResNet-50":
        m = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        in_feat = m.fc.in_features
        m.fc = nn.Linear(in_feat, num_classes)
    elif model_name == "DenseNet-121":
        m = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
        in_feat = m.classifier.in_features
        m.classifier = nn.Linear(in_feat, num_classes)
    else:
        raise ValueError(f"Unknown model name: {model_name}")
    return m

# -------------------------------------------------------------
# 3. TRAINING & EVALUATION ENGINE
# -------------------------------------------------------------
def train_and_eval(model_name, class_names, train_loader, val_loader, device, epochs=15):
    print(f"\n" + "="*70, flush=True)
    print(f"🔥 กำลังเทรนโมเดล: [{model_name}] บน {device}", flush=True)
    print("="*70, flush=True)

    num_classes = len(class_names)
    model = build_model(model_name, num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=0.0003, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
    best_acc = 0.0
    best_loss = float('inf')
    best_weights = copy.deepcopy(model.state_dict())

    for epoch in range(epochs):
        # Training Phase with live progress bar
        model.train()
        running_loss, running_correct, total_train = 0.0, 0, 0
        pbar = tqdm(train_loader, desc=f"Epoch [{epoch+1:2d}/{epochs:2d}]", leave=False, dynamic_ncols=True)
        for inputs, labels in pbar:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            _, preds = torch.max(outputs, 1)
            running_loss += loss.item() * inputs.size(0)
            running_correct += torch.sum(preds == labels.data).item()
            total_train += labels.size(0)
            pbar.set_postfix(loss=f"{loss.item():.4f}")

        scheduler.step()
        epoch_train_loss = running_loss / total_train
        epoch_train_acc = running_correct / total_train

        # Validation Phase
        model.eval()
        val_loss, val_correct, total_val = 0.0, 0, 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)

                _, preds = torch.max(outputs, 1)
                val_loss += loss.item() * inputs.size(0)
                val_correct += torch.sum(preds == labels.data).item()
                total_val += labels.size(0)

        epoch_val_loss = val_loss / total_val
        epoch_val_acc = val_correct / total_val

        history['train_loss'].append(epoch_train_loss)
        history['train_acc'].append(epoch_train_acc)
        history['val_loss'].append(epoch_val_loss)
        history['val_acc'].append(epoch_val_acc)

        is_new_best = False
        if epoch_val_acc > best_acc:
            best_acc = epoch_val_acc
            best_loss = epoch_val_loss
            best_weights = copy.deepcopy(model.state_dict())
            is_new_best = True
        elif epoch_val_acc == best_acc and epoch_val_loss < best_loss:
            best_loss = epoch_val_loss
            best_weights = copy.deepcopy(model.state_dict())
            is_new_best = True

        star = " ⭐ [สถิติดีสุด]" if is_new_best else ""

        print(f"Epoch [{epoch+1:2d}/{epochs:2d}] "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc*100:6.2f}%  │  "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc*100:6.2f}%{star}", flush=True)

    # Benchmark with Best Weights
    model.load_state_dict(best_weights)
    model.eval()

    all_preds, all_labels = [], []
    latencies = []

    # Warmup
    dummy = torch.randn(1, 3, 224, 224).to(device)
    for _ in range(5):
        _ = model(dummy)
    if device.type == 'cuda':
        torch.cuda.synchronize()

    with torch.no_grad():
        for inputs, labels in val_loader:
            for i in range(inputs.size(0)):
                single_input = inputs[i:i+1].to(device)
                
                t0 = time.perf_counter()
                out = model(single_input)
                if device.type == 'cuda':
                    torch.cuda.synchronize()
                t1 = time.perf_counter()
                latencies.append((t1 - t0) * 1000.0) # ms

                pred = torch.argmax(out, dim=1).item()
                all_preds.append(pred)
                all_labels.append(labels[i].item())

    acc = accuracy_score(all_labels, all_preds) * 100.0
    prec, rec, f1, _ = precision_recall_fscore_support(all_labels, all_preds, average='macro', zero_division=0)
    prec, rec, f1 = prec * 100.0, rec * 100.0, f1 * 100.0
    avg_latency = float(np.median(latencies))

    # Per-disease accuracy calculation
    cm = confusion_matrix(all_labels, all_preds, labels=list(range(num_classes)))
    per_class_acc = {}
    for i, cname in enumerate(class_names):
        total_samples_for_class = np.sum(cm[i, :])
        correct_for_class = cm[i, i]
        c_acc = (correct_for_class / total_samples_for_class * 100.0) if total_samples_for_class > 0 else 0.0
        per_class_acc[cname] = round(c_acc, 2)

    # Calculate model parameters and disk size
    total_params = sum(p.numel() for p in model.parameters()) / 1e6
    temp_pth = os.path.join(OUTPUT_DIR, f"{model_name}.pth")
    torch.save(model.state_dict(), temp_pth)
    file_size_mb = os.path.getsize(temp_pth) / (1024 * 1024)

    return {
        "Model": model_name,
        "Accuracy (%)": round(acc, 2),
        "Precision (%)": round(prec, 2),
        "Recall (%)": round(rec, 2),
        "F1-Score (%)": round(f1, 2),
        "Latency (ms)": round(avg_latency, 2),
        "Size (MB)": round(file_size_mb, 2),
        "Params (M)": round(total_params, 2),
        "PerClassAcc": per_class_acc,
        "History": history,
        "ConfusionMatrix": cm,
        "ModelPath": temp_pth
    }

# -------------------------------------------------------------
# 4. PLOTTING & REPORT GENERATION
# -------------------------------------------------------------
def plot_results(results, class_names, plant_name):
    clean_labels = [DISEASE_THAI_MAP.get(c, c).split(" (")[0] for c in class_names]

    # 1. Confusion Matrices
    fig, axes = plt.subplots(1, len(results), figsize=(5.5 * len(results), 5))
    if len(results) == 1:
        axes = [axes]

    for idx, r in enumerate(results):
        sns.heatmap(
            r["ConfusionMatrix"], annot=True, fmt="d", cmap="Blues",
            xticklabels=clean_labels, yticklabels=clean_labels,
            ax=axes[idx], cbar=False
        )
        axes[idx].set_title(f"{r['Model']}\n(Acc: {r['Accuracy (%)']}%)", fontsize=11, fontweight='bold')
        axes[idx].set_xlabel("ทำนาย (Predicted)")
        axes[idx].set_ylabel("ความจริง (True Label)")

    plt.tight_layout()
    cm_path = os.path.join(OUTPUT_DIR, f"confusion_matrices_{plant_name}.png")
    plt.savefig(cm_path, dpi=300)
    plt.close()

    # 2. Training Curves
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5))
    for r in results:
        hist = r["History"]
        epochs = range(1, len(hist['train_acc']) + 1)
        ax1.plot(epochs, [a * 100 for a in hist['val_acc']], marker='o', label=f"{r['Model']} (Val)")
        ax2.plot(epochs, hist['val_loss'], marker='s', label=f"{r['Model']} (Val Loss)")

    ax1.set_title(f"Validation Accuracy over Epochs ({plant_name})", fontweight='bold')
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Accuracy (%)")
    ax1.grid(True, linestyle='--', alpha=0.6)
    ax1.legend()

    ax2.set_title(f"Validation Loss over Epochs ({plant_name})", fontweight='bold')
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Loss")
    ax2.grid(True, linestyle='--', alpha=0.6)
    ax2.legend()

    plt.tight_layout()
    curve_path = os.path.join(OUTPUT_DIR, f"training_curves_{plant_name}.png")
    plt.savefig(curve_path, dpi=300)
    plt.close()

    return cm_path, curve_path

def generate_html_report(df_overall, df_disease, plant_name, cm_img, curve_img):
    html_path = os.path.join(OUTPUT_DIR, f"report_{plant_name}.html")
    table_overall_html = df_overall.to_html(classes="table table-bordered table-hover", index=False)
    table_disease_html = df_disease.to_html(classes="table table-bordered table-hover", index=False)
    
    html_content = f"""<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>Plant Disease Benchmark - {plant_name}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; padding: 30px; }}
        .card {{ border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 25px; }}
        .header {{ background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; }}
        th {{ background: #f1f5f9 !important; font-weight: 600; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header shadow-sm">
            <h1 class="h3 mb-1">🌿 ผลการทดสอบเปรียบเทียบโมเดลตรวจโรคพืช: {PLANT_THAI_MAP.get(plant_name, plant_name)}</h1>
            <p class="mb-0 opacity-90">Dataset: ประมาณ 200 รูปต่อโรค (80:20 Train/Val Split) | การ์ดจอ NVIDIA GeForce RTX 5060</p>
        </div>

        <div class="card p-4">
            <h4 class="mb-3">📊 1. ผลความแม่นยำเจาะลึกแยกตามรายโรค (Per-Disease Breakdown)</h4>
            <div class="table-responsive">
                {table_disease_html}
            </div>
        </div>

        <div class="card p-4">
            <h4 class="mb-3">🏆 2. ตารางเปรียบเทียบประสิทธิภาพภาพรวม 4 โมเดล (Benchmark Table)</h4>
            <div class="table-responsive">
                {table_overall_html}
            </div>
        </div>

        <div class="card p-4">
            <h4 class="mb-3">🎯 3. Confusion Matrix (เปรียบเทียบทุกโมเดล)</h4>
            <img src="{os.path.basename(cm_img)}" class="img-fluid rounded border" alt="Confusion Matrix">
        </div>

        <div class="card p-4">
            <h4 class="mb-3">📈 4. กราฟการเรียนรู้ (Accuracy & Loss Curves)</h4>
            <img src="{os.path.basename(curve_img)}" class="img-fluid rounded border" alt="Learning Curves">
        </div>
    </div>
</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    return html_path

# -------------------------------------------------------------
# 5. EXCEL EXPORTER WITH RICH FORMATTING
# -------------------------------------------------------------
def format_excel_sheet(ws):
    """ฟังก์ชันจัดความกว้างคอลัมน์และสไตล์ตาราง Excel ให้อ่านง่าย สวยงาม สำหรับใส่เล่มปริญญานิพนธ์"""
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid") # Deep Navy
    header_font = Font(name="Tahoma", size=10, bold=True, color="FFFFFF")
    section_font = Font(name="Tahoma", size=11, bold=True, color="0F172A")
    data_font = Font(name="Tahoma", size=10)
    
    for row in ws.iter_rows():
        first_val = str(row[0].value or '') if len(row) > 0 else ''
        is_table_header = first_val in ['Model', 'ชื่อโรค / อาการ (Class)', 'ชนิดพืช (Plant)']
        
        for cell in row:
            if cell.value is not None:
                val_str = str(cell.value)
                if any(val_str.startswith(p) for p in ['1.', '2.', '3.', 'บทสรุป', '📌', '⭐']):
                    cell.font = section_font
                elif is_table_header:
                    cell.fill = header_fill
                    cell.font = header_font
                    cell.alignment = Alignment(horizontal='center', vertical='center')
                else:
                    cell.font = data_font

    # Auto-adjust column width
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            if cell.value is not None:
                v = str(cell.value)
                # ละเว้นข้อความสรุปยาวๆ ในคอลัมน์ A ไม่ให้คอลัมน์กว้างเกินไป
                if col[0].column == 1 and (len(v) > 35 or v.startswith('=')):
                    continue
                w = sum(1.5 if ord(c) > 127 else 1 for c in v)
                if w > max_len:
                    max_len = w
        ws.column_dimensions[col_letter].width = max(int(max_len) + 4, 14)

def export_to_excel(df_overall, df_disease, summary_text, plant_name):
    excel_path = os.path.join(ONEDRIVE_SAVE_DIR, f"benchmark_{plant_name}.xlsx")
    backup_path = os.path.join(BACKUP_OUTPUT_DIR, f"benchmark_{plant_name}.xlsx")
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        df_overall.to_excel(writer, sheet_name='สรุปผลภาพรวม', index=False)
        df_disease.to_excel(writer, sheet_name='เจาะลึกรายโรค', index=False)

        # Add text notes in sheet 1
        ws1 = writer.sheets['สรุปผลภาพรวม']
        start_row = len(df_overall) + 4
        ws1.cell(row=start_row, column=1, value="บทสรุปผลการทดลอง (Thesis Summary):")
        for i, line in enumerate(summary_text.split("\n")):
            ws1.cell(row=start_row + 1 + i, column=1, value=line)

        ws2 = writer.sheets['เจาะลึกรายโรค']
        format_excel_sheet(ws1)
        format_excel_sheet(ws2)

    try:
        shutil.copy2(excel_path, backup_path)
    except Exception:
        pass
    return excel_path

def export_all_plants_excel(all_plants_data):
    excel_path = os.path.join(ONEDRIVE_SAVE_DIR, "Plant_Disease_Benchmark_All_Plants.xlsx")
    backup_path = os.path.join(BACKUP_OUTPUT_DIR, "Plant_Disease_Benchmark_All_Plants.xlsx")
    
    # 1. Grand Overview Table
    overview_records = []
    for plant, data in all_plants_data.items():
        thai_p = PLANT_THAI_MAP.get(plant, plant)
        results = data['results']
        best_acc_m = max(results, key=lambda x: (x["Accuracy (%)"], x["F1-Score (%)"]))
        fastest_m = min(results, key=lambda x: x["Latency (ms)"])
        smallest_m = min(results, key=lambda x: x["Size (MB)"])
        
        row = {
            "ชนิดพืช (Plant)": thai_p,
            "จำนวนโรค (Classes)": len(results[0]["PerClassAcc"]),
            "โมเดลแม่นยำสูงสุด": f"{best_acc_m['Model']} ({best_acc_m['Accuracy (%)']:.2f}%)",
            "โมเดลเร็วที่สุด": f"{fastest_m['Model']} ({fastest_m['Latency (ms)']:.2f} ms)",
            "โมเดลขนาดเล็กสุด": f"{smallest_m['Model']} ({smallest_m['Size (MB)']:.2f} MB)"
        }
        for r in results:
            row[f"Acc: {r['Model']}"] = f"{r['Accuracy (%)']:.2f}%"
        overview_records.append(row)
    
    df_grand_overview = pd.DataFrame(overview_records)

    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        # Sheet 1: Grand Overview
        df_grand_overview.to_excel(writer, sheet_name='สรุปภาพรวมทุกพืช', index=False)
        format_excel_sheet(writer.sheets['สรุปภาพรวมทุกพืช'])
        
        # Subsequent Sheets: 1 Sheet per Plant (5 Sheets)
        for plant, data in all_plants_data.items():
            thai_sheet_name = PLANT_THAI_MAP.get(plant, plant).split(" (")[0]
            df_overall = data['df_overall']
            df_disease = data['df_disease']
            summary_text = data['summary_text']
            
            ws_name = f"{thai_sheet_name} ({plant})"
            df_disease.to_excel(writer, sheet_name=ws_name, index=False, startrow=1)
            ws = writer.sheets[ws_name]
            ws.cell(row=1, column=1, value="1. ผลความแม่นยำเจาะลึกแยกตามรายโรค (Per-Disease Breakdown):")
            
            start_row_overall = len(df_disease) + 4
            ws.cell(row=start_row_overall, column=1, value="2. ตารางเปรียบเทียบประสิทธิภาพ 4 โมเดล (Benchmark Table):")
            df_overall.to_excel(writer, sheet_name=ws_name, index=False, startrow=start_row_overall)
            
            start_row_summary = start_row_overall + len(df_overall) + 4
            ws.cell(row=start_row_summary, column=1, value="3. บทสรุปผลการทดลอง (Thesis Summary):")
            for i, line in enumerate(summary_text.split("\n")):
                ws.cell(row=start_row_summary + 1 + i, column=1, value=line)

            format_excel_sheet(ws)

    try:
        shutil.copy2(excel_path, backup_path)
    except Exception:
        pass

    return excel_path, df_grand_overview

# -------------------------------------------------------------
# 6. MAIN BENCHMARK RUNNER
# -------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Plant Disease Model Benchmark")
    parser.add_argument("--plant", type=str, default=None, 
                        choices=["Chili", "Tomato", "Basil", "Krapao", "Lettuce", "all"],
                        help="Target plant to benchmark")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs per model")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--data-dir", type=str, default=DEFAULT_DATA_DIR, help="Dataset directory")
    args = parser.parse_args()

    # Interactive Plant Selection
    if not args.plant:
        print("\n" + "="*72, flush=True)
        print("   🌱 เครื่องมือเทรนและเปรียบเทียบโมเดลตรวจโรคพืช (Thesis Benchmark)   ", flush=True)
        print("="*72, flush=True)
        print("เลือกชนิดพืชที่ต้องการทดสอบ:", flush=True)
        print("  [1] พริก (Chili) - โรคใบจุด, ใบหงิกเหลือง, ใบสมบูรณ์", flush=True)
        print("  [2] มะเขือเทศ (Tomato) - โรคใบไหม้, ใบจุดเซปทอเรีย, ใบสมบูรณ์", flush=True)
        print("  [3] โหระพา (Basil) - โรคราน้ำค้าง, ใบจุดจากเชื้อรา, ใบสมบูรณ์", flush=True)
        print("  [4] กะเพรา (Krapao) - รอยแมลงกัด, โรคจุดขาว, ใบสมบูรณ์", flush=True)
        print("  [5] ผักกาดหอม (Lettuce) - โรคจากแบคทีเรีย, เชื้อรา, ใบสมบูรณ์", flush=True)
        print("  [6] เทรนเปรียบเทียบครบทั้ง 5 ชนิดพืช (Run All - รันทีละพืชจนครบ)", flush=True)
        print("="*72, flush=True)
        try:
            user_choice = input("กรุณาใส่หมายเลข [1-6] (กด Enter เลือก [1] พริก): ").strip()
        except EOFError:
            user_choice = "1"
        menu_map = {
            "1": "Chili",
            "2": "Tomato",
            "3": "Basil",
            "4": "Krapao",
            "5": "Lettuce",
            "6": "all"
        }
        selected_plant = menu_map.get(user_choice, "Chili")
    else:
        selected_plant = args.plant

    plants_to_run = ["Chili", "Tomato", "Basil", "Krapao", "Lettuce"] if selected_plant == "all" else [selected_plant]

    # Confirmation Prompt
    print("\n" + "-"*72, flush=True)
    if selected_plant == "all":
        print("👉 คุณเลือก: [เทรนเปรียบเทียบครบทั้ง 5 ชนิดพืช (Run All)]", flush=True)
        print("   ระบบจะทำการเทรนทีละชนิดพืชเรียงต่อกันไปจนครบทั้ง 5 ชนิดพืช", flush=True)
    else:
        thai_p = PLANT_THAI_MAP.get(selected_plant, selected_plant)
        print(f"👉 คุณเลือก: [{thai_p}]", flush=True)
        print("   ระบบจะทำการเทรนและเปรียบเทียบ 4 สถาปัตยกรรมโมเดลสำหรับพืชชนิดนี้", flush=True)
    print("-"*72, flush=True)
    
    try:
        confirm = input("กดยืนยันเพื่อเริ่มเทรน [กด Enter หรือพิมพ์ Y เพื่อเริ่ม]: ").strip().lower()
        if confirm not in ("", "y", "yes"):
            print("ยกเลิกการทำงานเรียบร้อยครับ", flush=True)
            return
    except EOFError:
        pass

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    print("\n" + "="*75, flush=True)
    print("      🌱 SYSTEMATIC PLANT DISEASE ARCHITECTURE BENCHMARK PIPELINE      ", flush=True)
    print("="*75, flush=True)
    print(f"💻 Device in use       : {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})", flush=True)
    print(f"🎯 Target Plant(s)     : {', '.join(plants_to_run)}", flush=True)
    print(f"📦 Epochs per model    : {args.epochs}", flush=True)
    print(f"📁 Dataset Directory   : {args.data_dir}", flush=True)
    print(f"💾 Results Directory   : {OUTPUT_DIR}", flush=True)
    print("="*75, flush=True)

    candidate_models = ["MobileNetV3-Large", "EfficientNet-B0", "ResNet-50", "DenseNet-121"]
    all_plants_data = {}

    for plant in plants_to_run:
        thai_plant_name = PLANT_THAI_MAP.get(plant, plant)
        print(f"\n▶ กำลังเริ่มต้น Benchmark สำหรับ [{thai_plant_name}]...", flush=True)
        train_set, val_set, class_names = load_plant_data(args.data_dir, plant)
        train_loader = DataLoader(train_set, batch_size=args.batch_size, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_set, batch_size=args.batch_size, shuffle=False, num_workers=0)

        plant_results = []
        for model_name in candidate_models:
            res = train_and_eval(model_name, class_names, train_loader, val_loader, device, epochs=args.epochs)
            plant_results.append(res)

        # 1. Overall Summary Table
        summary_records = []
        for r in plant_results:
            summary_records.append({
                "Model": r["Model"],
                "Accuracy (%)": f"{r['Accuracy (%)']:.2f}%",
                "Precision (%)": f"{r['Precision (%)']:.2f}%",
                "Recall (%)": f"{r['Recall (%)']:.2f}%",
                "Macro F1 (%)": f"{r['F1-Score (%)']:.2f}%",
                "Latency (ms)": f"{r['Latency (ms)']:.2f} ms",
                "Size (MB)": f"{r['Size (MB)']:.2f} MB",
                "Params (M)": f"{r['Params (M)']:.2f}M"
            })
        df_overall = pd.DataFrame(summary_records)

        # 2. Per-Disease Breakdown Table
        disease_records = []
        for cname in class_names:
            c_thai = DISEASE_THAI_MAP.get(cname, cname)
            row = {"ชื่อโรค / อาการ (Class)": c_thai}
            for r in plant_results:
                m_name = r["Model"]
                row[m_name] = f"{r['PerClassAcc'].get(cname, 0.0):.2f}%"
            disease_records.append(row)
        df_disease = pd.DataFrame(disease_records)

        # Plot charts
        cm_path, curve_path = plot_results(plant_results, class_names, plant)

        # Save Markdown and CSV
        csv_path = os.path.join(OUTPUT_DIR, f"benchmark_{plant}.csv")
        df_overall.to_csv(csv_path, index=False, encoding='utf-8-sig')
        html_path = generate_html_report(df_overall, df_disease, plant, cm_path, curve_path)

        # 3. PRINT PER-DISEASE BREAKDOWN TABLE
        print("\n" + "="*85, flush=True)
        print(f"       📊 ผลความแม่นยำเจาะลึกแยกตามรายโรค (Per-Disease Breakdown): [{plant.upper()}]       ", flush=True)
        print("="*85, flush=True)
        try:
            print(df_disease.to_markdown(index=False), flush=True)
        except Exception:
            print(df_disease.to_string(index=False), flush=True)
        print("="*85, flush=True)

        # 4. PRINT OVERALL BENCHMARK TABLE
        print("\n" + "="*85, flush=True)
        print(f"       🏆 FINAL BENCHMARK SUMMARY: [{plant.upper()}] (200 Images/Class)       ", flush=True)
        print("="*85, flush=True)
        try:
            print(df_overall.to_markdown(index=False), flush=True)
        except Exception:
            print(df_overall.to_string(index=False), flush=True)
        print("="*85, flush=True)

        # 5. SORTED 2-POINT SUMMARY DISCUSSION (Strictly points 1 & 2 as requested)
        models_by_acc = sorted(plant_results, key=lambda x: (x["Accuracy (%)"], x["F1-Score (%)"]), reverse=True)
        models_by_speed = sorted(plant_results, key=lambda x: x["Latency (ms)"])

        best_acc_m = models_by_acc[0]
        fastest_m = models_by_speed[0]
        smallest_m = min(plant_results, key=lambda x: x["Size (MB)"])

        summary_lines = [
            "="*85,
            f"                  📝 บทสรุปผลการทดลอง: [{plant.upper()}] (Thesis Benchmark Summary)                 ",
            "="*85,
            f"📌 ผลเทสจากพืช 5 ชนิด ใช้ภาพชุดละประมาณ 200 รูป (Train 80% : Val 20%)",
            f"   ผลการเทรนและการเปรียบเทียบจากตารางข้างต้น สรุปได้ดังนี้:\n",
            f"1. ด้านความแม่นยำ (เรียงลำดับจากแม่นยำมากที่สุดไปน้อยที่สุด):"
        ]
        for idx, m in enumerate(models_by_acc):
            summary_lines.append(f"   • อันดับ {idx+1} : {m['Model']:<18} (Accuracy {m['Accuracy (%)']:.2f}% | F1-Score {m['F1-Score (%)']:.2f}%)")

        summary_lines.append(f"\n2. ด้านความเร็วในการประมวลผล (เรียงลำดับจากเร็วที่สุดไปช้าที่สุด):")
        for idx, m in enumerate(models_by_speed):
            summary_lines.append(f"   • อันดับ {idx+1} : {m['Model']:<18} (ใช้เวลา {m['Latency (ms)']:.2f} ms ต่อภาพ | ขนาดไฟล์ {m['Size (MB)']:.2f} MB)")

        summary_lines.append(f"\n⭐ สรุปผลการประเมิน:")
        summary_lines.append(f"   - โมเดลที่แม่นยำที่สุด คือ: [{best_acc_m['Model']}] ({best_acc_m['Accuracy (%)']:.2f}%)")
        summary_lines.append(f"   - โมเดลที่เร็วและประหยัดทรัพยากรที่สุด คือ: [{fastest_m['Model']}] ({fastest_m['Latency (ms)']:.2f} ms / {fastest_m['Size (MB)']:.2f} MB)")
        summary_lines.append("="*85)

        summary_text = "\n".join(summary_lines)
        print(summary_text, flush=True)

        # Save Markdown Report with full text
        md_path = os.path.join(OUTPUT_DIR, f"benchmark_{plant}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(f"# Benchmark Report: {plant}\n\n")
            f.write("## 1. ผลความแม่นยำแยกรายโรค\n\n")
            f.write(df_disease.to_markdown(index=False) + "\n\n")
            f.write("## 2. ผลการเปรียบเทียบภาพรวม\n\n")
            f.write(df_overall.to_markdown(index=False) + "\n\n")
            f.write(summary_text + "\n")

        print(f"\n📸 [คำแนะนำ]: สามารถกดแคปหน้าจอ Terminal นี้ (Win + Shift + S) เพื่อนำตารางไปใส่ในเล่มได้เลย!", flush=True)
        print(f"📁 บันทึกตาราง Word/MD : {md_path}", flush=True)
        print(f"📁 รูป Confusion Matrix : {cm_path}", flush=True)
        print(f"📁 รูปรัน Loss/Acc Curve : {curve_path}", flush=True)
        print(f"🌐 เปิดดู Visual Report : {html_path}", flush=True)

        # เก็บผลการทดลองของพืชนี้ไว้ใน dict
        all_plants_data[plant] = {
            'df_overall': df_overall,
            'df_disease': df_disease,
            'summary_text': summary_text,
            'results': plant_results
        }

        # 6. EXCEL DOWNLOAD PROMPT (กรณีเลือก 1 พืช ให้ถามบันทึกทันที)
        if selected_plant != "all":
            print("\n" + "-"*72, flush=True)
            try:
                dl_choice = input(f"📥 ต้องการบันทึกผลการทดลองของ [{thai_plant_name}] เป็นไฟล์ Excel (.xlsx) ไหม? [กด Enter หรือพิมพ์ Y เพื่อบันทึก]: ").strip().lower()
                if dl_choice in ("", "y", "yes"):
                    excel_file = export_to_excel(df_overall, df_disease, summary_text, plant)
                    print(f"✅ บันทึกไฟล์ Excel สำเร็จที่: {excel_file}", flush=True)
                    print(f"📁 สำรองไฟล์ไว้ที่: {os.path.join(BACKUP_OUTPUT_DIR, f'benchmark_{plant}.xlsx')}", flush=True)
                    if sys.platform.startswith('win'):
                        try:
                            os.startfile(excel_file)
                        except Exception:
                            pass
            except EOFError:
                export_to_excel(df_overall, df_disease, summary_text, plant)
            print("-"*72 + "\n", flush=True)
        else:
            print(f"✅ ทำการทดสอบ [{thai_plant_name}] สำเร็จแล้ว (ระบบกำลังเทรนพืชลำดับถัดไปต่อทันที...)\n", flush=True)

    # 7. GRAND OVERVIEW & SINGLE EXCEL PROMPT FOR [6] RUN ALL
    if selected_plant == "all":
        print("\n" + "="*95, flush=True)
        print("   🌟🌟 ตารางสรุปภาพรวมผลการเปรียบเทียบโมเดลครบทั้ง 5 ชนิดพืช (Grand Overview Benchmark) 🌟🌟   ", flush=True)
        print("="*95, flush=True)
        
        overview_records = []
        for p, data in all_plants_data.items():
            thai_p = PLANT_THAI_MAP.get(p, p)
            results = data['results']
            best_acc_m = max(results, key=lambda x: (x["Accuracy (%)"], x["F1-Score (%)"]))
            fastest_m = min(results, key=lambda x: x["Latency (ms)"])
            smallest_m = min(results, key=lambda x: x["Size (MB)"])
            
            row = {
                "ชนิดพืช (Plant)": thai_p,
                "โมเดลแม่นยำสูงสุด": f"{best_acc_m['Model']} ({best_acc_m['Accuracy (%)']:.2f}%)",
                "โมเดลเร็วที่สุด": f"{fastest_m['Model']} ({fastest_m['Latency (ms)']:.2f} ms)",
                "โมเดลขนาดเล็กสุด": f"{smallest_m['Model']} ({smallest_m['Size (MB)']:.2f} MB)"
            }
            for r in results:
                row[f"Acc: {r['Model']}"] = f"{r['Accuracy (%)']:.2f}%"
            overview_records.append(row)
            
        df_overview_display = pd.DataFrame(overview_records)
        try:
            print(df_overview_display.to_markdown(index=False), flush=True)
        except Exception:
            print(df_overview_display.to_string(index=False), flush=True)
        print("="*95, flush=True)

        print("\n" + "-"*75, flush=True)
        print("🎉🎉 การเทรนเปรียบเทียบครบทั้ง 5 ชนิดพืช (Run All) เสร็จสิ้นสมบูรณ์ครบถ้วน! 🎉🎉", flush=True)
        try:
            dl_choice = input("📥 ต้องการบันทึกรายงาน Excel รวมทั้ง 5 ชนิดพืช (5 Sheet แยกตามพืช + 1 Sheet ภาพรวม) (.xlsx) ไหม?\n[กด Enter หรือพิมพ์ Y เพื่อบันทึก]: ").strip().lower()
            if dl_choice in ("", "y", "yes"):
                excel_file, df_grand = export_all_plants_excel(all_plants_data)
                print(f"✅ บันทึกไฟล์ Excel รวมทุกพืชสำเร็จที่: {excel_file}", flush=True)
                print(f"📁 สำรองไฟล์ไว้ที่: {os.path.join(BACKUP_OUTPUT_DIR, 'Plant_Disease_Benchmark_All_Plants.xlsx')}", flush=True)
                if sys.platform.startswith('win'):
                    try:
                        os.startfile(excel_file)
                    except Exception:
                        pass
        except EOFError:
            export_all_plants_excel(all_plants_data)
        print("-"*75 + "\n", flush=True)

if __name__ == "__main__":
    main()
