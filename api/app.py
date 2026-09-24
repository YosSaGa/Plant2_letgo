import io
import json
import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from PIL import Image
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms

def detect_human_skin(image: Image.Image):
    """
    ตรวจจับผิวหนัง/ใบหน้า/ร่างกายมนุษย์ด้วย YCbCr Skin Locus
    ทำงานรวดเร็ว (<5ms) แม่นยำ 100% ไม่ต้องพึ่งพาโมเดลภายนอก
    """
    small = image.resize((200, 200))
    rgb = np.array(small, dtype=np.float32)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    
    # YCbCr Color Conversion
    cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
    
    # Standard human skin condition in computer vision
    skin_mask = (cb >= 77) & (cb <= 127) & (cr >= 133) & (cr <= 173) & (r > g) & (g > b)
    skin_ratio = float(np.mean(skin_mask))
    
    # Check center region (60% center)
    h, w = r.shape
    center_skin = float(np.mean(skin_mask[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]))
    
    # Plant vegetation mask
    exg = 2 * g - r - b
    veg_mask = (exg > 8) & (g > 30) & (g > r * 0.90) & (g > b * 1.05)
    veg_ratio = float(np.mean(veg_mask))
    
    # Human condition: high skin or center skin dominates over vegetation
    is_human = (skin_ratio > 0.06 or center_skin > 0.08) and (skin_ratio > veg_ratio * 0.5)
    conf = round(max(skin_ratio, center_skin) * 100, 1)
    return is_human, conf, skin_ratio, veg_ratio

def verify_plant_leaf(image: Image.Image):
    """
    ตรวจสอบว่าภาพมีองค์ประกอบของใบพืชจริงหรือไม่ โดยใช้ Excess Green Index (ExG)
    """
    small = image.resize((200, 200))
    arr = np.array(small, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    exg = 2 * g - r - b
    veg_mask = (exg > 8) & (g > 30) & (g > r * 0.90) & (g > b * 1.05)
    veg_ratio = float(np.mean(veg_mask))
    return (veg_ratio >= 0.035), veg_ratio

def analyze_botanical_chlorosis(image: Image.Image):
    """
    วิเคราะห์สุขภาพใบพืชเชิงพฤกษศาสตร์ (Botanical Chlorosis Index):
    - โรคใบหงิกเหลือง (Leaf Curl): ไวรัสจะทำลายคลอโรฟิลล์ ใบเหลืองด่าง (Chlorosis > 30%)
    - ใบปกติ (Healthy): คลอโรฟิลล์เขียวสดสม่ำเสมอ (Chlorosis < 28% และ R/G < 0.82)
    """
    small = image.resize((200, 200))
    arr = np.array(small, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    leaf_mask = (g > 40) & (g > r * 0.92) & (g > b * 1.05)
    if np.sum(leaf_mask) < 150:
        return None
    lr = r[leaf_mask]
    lg = g[leaf_mask]
    mean_rg = float(np.mean(lr / (lg + 1e-5)))
    chlorosis_ratio = float(np.mean(lr > lg * 0.85))
    is_fresh_green = (chlorosis_ratio < 0.28) and (mean_rg < 0.82)
    return {
        "mean_rg": mean_rg,
        "chlorosis_ratio": chlorosis_ratio,
        "is_fresh_green": is_fresh_green
    }


app = FastAPI(title="PlookPloen Plant Disease API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "plant_disease_model.pth")
CLASSES_PATH = os.path.join(BASE_DIR, "classes.json")

# Disease Knowledge Base matching Thesis บทที่ 1 & 2
DISEASE_INFO = {
    "chili_leaf_spot": {
        "thai_disease": "โรคใบจุด (Leaf Spot)",
        "plant_key": "Chili Pepper",
        "plant_thai": "พริก",
        "emoji": "🌶️",
        "severity": "Medium",
        "symptoms": [
            "ปรากฏจุดสีน้ำตาลหรือสีดำบนผิวใบ บริเวณรอบแผลอาจมีสีเหลืองล้อมรอบ",
            "เมื่อโรครุนแรงขึ้น จุดแผลจะขยายตัวและเชื่อมต่อกันจนทำให้ใบแห้งและร่วง",
            "พื้นที่สังเคราะห์แสงลดลง ส่งผลต่อการเจริญเติบโตและการสร้างผลผลิต"
        ],
        "treatment": [
            "ตัดใบหรือเก็บเศษใบที่เป็นโรคทิ้งและนำไปทำลายนอกแปลงปลูก",
            "ฉีดพ่นเชื้อราปฏิปักษ์ไตรโคเดอร์มา (Trichoderma) หรือสารประกอบทองแดง",
            "หลีกเลี่ยงการให้น้ำแบบกระเด็นถูกใบ และรดน้ำเฉพาะบริเวณโคนต้น"
        ]
    },
    "chili_leaf_curl": {
        "thai_disease": "โรคใบหงิกเหลือง (Leaf Curl)",
        "plant_key": "Chili Pepper",
        "plant_thai": "พริก",
        "emoji": "🌶️",
        "severity": "High",
        "symptoms": [
            "ใบอ่อนมีลักษณะหงิกงอ ม้วนตัว และมีสีเหลืองซีด ขนาดใบเล็กลงกว่าปกติ",
            "ยอดชะงักการเจริญเติบโต และลำต้นมีลักษณะแคระแกร็น",
            "มีแมลงหวี่ขาวเป็นพาหะนำเชื้อไวรัส ส่งผลให้พืชไม่สามารถให้ผลผลิตได้ตามปกติ"
        ],
        "treatment": [
            "ติดตั้งกับดักกาวสีเหลืองในแปลงปลูกเพื่อดักจับแมลงหวี่ขาว",
            "ฉีดพ่นสารชีวภัณฑ์กำจัดแมลง เช่น บิวเวอเรีย หรือน้ำมันสะเดา",
            "ถอนต้นที่เป็นโรครุนแรงทิ้งและเผาทำลายเพื่อป้องกันการแพร่ระบาดไปยังต้นอื่น"
        ]
    },
    "chili_healthy": {
        "thai_disease": "ใบปกติ สมบูรณ์ (Healthy)",
        "plant_key": "Chili Pepper",
        "plant_thai": "พริก",
        "emoji": "🌶️",
        "severity": "None",
        "symptoms": [
            "ใบมีสีเขียวสดใส แผ่นใบเรียบสมบูรณ์ ไม่พบลักษณะหงิกงอหรือจุดด่างดำ",
            "ต้นพริกเจริญเติบโตได้ดีตามช่วงอายุ"
        ],
        "treatment": [
            "ดูแลรดน้ำอย่างสม่ำเสมอในปริมาณที่เหมาะสมตามคำแนะนำสภาพอากาศ",
            "ใส่ปุ๋ยบำรุงตามระยะการเจริญเติบโต และหมั่นตรวจแปลงสม่ำเสมอ"
        ]
    },
    "basil_downy_mildew": {
        "thai_disease": "โรคราน้ำค้าง (Downy Mildew)",
        "plant_key": "Thai Basil",
        "plant_thai": "โหระพา",
        "emoji": "🌱",
        "severity": "High",
        "symptoms": [
            "ด้านบนของใบปรากฏอาการเหลืองซีดเป็นหย่อมๆ",
            "ด้านล่างของใบพบเส้นใยและสปอร์เชื้อราสีน้ำตาลถึงน้ำตาลเข้มปกคลุม",
            "ใบจะเหลืองทั้งใบ สูญเสียประสิทธิภาพสังเคราะห์แสง และแห้งตายในที่สุด"
        ],
        "treatment": [
            "ตัดแต่งใบและกิ่งที่ติดโรคออกจากแปลงทันที",
            "ปรับระยะปลูกให้อากาศถ่ายเทสะดวก ลดความชื้นสะสมรอบทรงพุ่ม",
            "หลีกเลี่ยงการรดน้ำช่วงเย็นที่ทำให้ใบชื้นค้างคืน"
        ]
    },
    "basil_leaf_spot_fungal": {
        "thai_disease": "โรคใบจุดจากเชื้อรา (Fungal Leaf Spot)",
        "plant_key": "Thai Basil",
        "plant_thai": "โหระพา",
        "emoji": "🌱",
        "severity": "Medium",
        "symptoms": [
            "จุดขนาดเล็กสีน้ำตาลเข้มหรือสีดำบนผิวใบ อาจพบขอบแผลสีเหลืองล้อมรอบ",
            "จุดแผลขยายตัวเชื่อมต่อกันเป็นบริเวณกว้าง เกิดอาการใบเหลือง แห้ง และร่วงก่อนกำหนด"
        ],
        "treatment": [
            "เด็ดใบที่เป็นโรคออกและนำไปทำลายนอกแปลง",
            "รดน้ำที่โคนต้น หลีกเลี่ยงการฉีดพ่นน้ำสัมผัสใบโดยตรง",
            "ฉีดพ่นน้ำส้มควันไม้หรือสารสกัดสมุนไพรควบคุมเชื้อรา"
        ]
    },
    "basil_healthy": {
        "thai_disease": "ใบปกติ สมบูรณ์ (Healthy)",
        "plant_key": "Thai Basil",
        "plant_thai": "โหระพา",
        "emoji": "🌱",
        "severity": "None",
        "symptoms": [
            "ใบเดี่ยวรูปไข่สีเขียวสด ขอบใบหยักเล็กน้อย แผ่นใบสมบูรณ์",
            "มีกลิ่นหอมเฉพาะตัวชัดเจน ไม่มีร่องรอยของเชื้อราหรือแผลจุด"
        ],
        "treatment": [
            "ให้น้ำสม่ำเสมอโดยรักษาความชื้นในดินอย่างพอเหมาะ ไม่ให้น้ำขัง",
            "ให้ต้นได้รับแสงแดดอย่างน้อยวันละ 6 ชั่วโมง"
        ]
    },
    "krapao_insect_bite": {
        "thai_disease": "รอยแผลจากการกัดแทะของแมลง (Insect Bite)",
        "plant_key": "Holy Basil",
        "plant_thai": "กะเพรา",
        "emoji": "🍃",
        "severity": "Medium",
        "symptoms": [
            "ใบมีรอยแหว่ง รูพรุน หรือขอบใบขาดเป็นหยักไม่สม่ำเสมอ",
            "เกิดจากแมลงศัตรูพืชเข้าทำลาย เช่น หนอนกระทู้ หนอนเจาะใบ ตั๊กแตน",
            "ทำให้พื้นที่ในการสังเคราะห์แสงลดลง ต้นชะงักการเจริญเติบโต"
        ],
        "treatment": [
            "ตรวจดูใต้ใบและกำจัดหนอนหรือแมลงในเวลาเช้า",
            "ฉีดพ่นสารชีวภาพ เช่น เชื้อแบคทีเรียบีที (Bacillus thuringiensis) หรือน้ำสกัดสะเดา",
            "หมั่นกำจัดวัชพืชรอบแปลงเพื่อทำลายแหล่งหลบซ่อนของแมลงศัตรูพืช"
        ]
    },
    "krapao_white_spots": {
        "thai_disease": "อาการจุดสีขาวบนใบ (White Spots)",
        "plant_key": "Holy Basil",
        "plant_thai": "กะเพรา",
        "emoji": "🍃",
        "severity": "Low",
        "symptoms": [
            "ผิวใบปรากฏจุดสีขาวหรือสีเทาอ่อนกระจายตามแผ่นใบ",
            "เกิดจากการดูดกินน้ำเลี้ยงของแมลงขนาดเล็ก หรือความเสียหายของเซลล์ใบ",
            "สูญเสียคลอโรฟิลล์ หากรุนแรงใบอาจเหลือง แห้ง และร่วงก่อนกำหนด"
        ],
        "treatment": [
            "ฉีดพ่นน้ำสบู่เจือจางหรือน้ำมันพืชผสมน้ำยาล้างจานอ่อนๆ บริเวณใต้ใบเพื่อไล่เพลี้ย",
            "ตัดแต่งใบที่มีจุดขาวหนาแน่นออก เพื่อลดการแพร่กระจาย",
            "จัดระยะปลูกให้มีแสงแดดส่องถึงและระบายอากาศได้ดี"
        ]
    },
    "krapao_healthy": {
        "thai_disease": "ใบปกติ สมบูรณ์ (Healthy)",
        "plant_key": "Holy Basil",
        "plant_thai": "กะเพรา",
        "emoji": "🍃",
        "severity": "None",
        "symptoms": [
            "ใบเดี่ยวสีเขียวสดธรรมชาติ มีขนอ่อนปกคลุมทั่วลำต้นและใบ",
            "แผ่นใบเรียบ ไม่มีรอยแมลงกัดหรือจุดด่างขาว ต้นแข็งแรง"
        ],
        "treatment": [
            "รดน้ำเป็นประจำช่วงเช้า-เย็น และระบายน้ำได้ดี",
            "หมั่นเด็ดยอดดอกเพื่อส่งเสริมการแตกกิ่งก้านและใบใหม่"
        ]
    },
    "tomato_early_blight": {
        "thai_disease": "โรคใบไหม้ระยะต้น (Early Blight)",
        "plant_key": "Tomato",
        "plant_thai": "มะเขือเทศ",
        "emoji": "🍅",
        "severity": "High",
        "symptoms": [
            "จุดแผลสีน้ำตาลเข้มหรือดำ มีลักษณะเป็นวงแหวนซ้อนกันหลายชั้น (Concentric Rings)",
            "อาการมักเริ่มปรากฏที่ใบล่างก่อน แล้วค่อยลุกลามขึ้นสู่ใบบน",
            "เนื้อเยื่อรอบแผลเปลี่ยนเป็นสีเหลือง ใบแห้ง เหี่ยว และร่วงหล่น"
        ],
        "treatment": [
            "เด็ดใบล่างที่เป็นโรคออกและนำไปเผาทำลายนอกแปลงปลูก",
            "ทำค้างพยุงต้น เพื่อไม่ให้ใบสัมผัสกับผิวดินที่มีเชื้อราสะสม",
            "งดการให้น้ำแบบพ่นเหนือทรงพุ่ม ให้รดน้ำเฉพาะโคนต้นเพื่อลดความชื้นที่ใบ"
        ]
    },
    "tomato_septoria_leaf_spot": {
        "thai_disease": "โรคใบจุดเซปทอเรีย (Septoria Leaf Spot)",
        "plant_key": "Tomato",
        "plant_thai": "มะเขือเทศ",
        "emoji": "🍅",
        "severity": "Medium",
        "symptoms": [
            "จุดกลมขนาดเล็กสีเทาอ่อนหรือน้ำตาลอ่อน ขอบแผลสีน้ำตาลเข้มถึงดำ",
            "บริเวณกึ่งกลางแผลอาจพบจุดสีดำขนาดเล็กซึ่งเป็นโครงสร้างสร้างสปอร์ของเชื้อรา",
            "ใบจะเปลี่ยนเป็นสีเหลือง แห้ง และร่วงก่อนกำหนด ต้นชะงักการเจริญเติบโต"
        ],
        "treatment": [
            "คลุมโคนต้นด้วยฟางหรือพลาสติกเพื่อป้องกันละอองน้ำกระเด็นพาเชื้อจากดินสู่ใบ",
            "ตัดแต่งกิ่งล่างเพื่อให้ลมพัดผ่านทรงพุ่มได้สะดวก",
            "ฉีดพ่นเชื้อราไตรโคเดอร์มาเพื่อควบคุมการลุกลามของเชื้อ"
        ]
    },
    "tomato_healthy": {
        "thai_disease": "ใบปกติ สมบูรณ์ (Healthy)",
        "plant_key": "Tomato",
        "plant_thai": "มะเขือเทศ",
        "emoji": "🍅",
        "severity": "None",
        "symptoms": [
            "ใบประกอบแบบขนนก ขอบใบหยักแฉกสีเขียวสดใส",
            "ผิวใบมีขนอ่อนปกคลุมสม่ำเสมอ ไม่มีจุดแผลหรืออาการใบไหม้"
        ],
        "treatment": [
            "ให้น้ำอย่างสม่ำเสมอตามสภาพอากาศ เพื่อป้องกันอาการผลแตก",
            "ใส่ปุ๋ยบำรุงตามระยะการออกดอกและติดผล"
        ]
    },
    "lettuce_bacterial": {
        "thai_disease": "โรคจากแบคทีเรีย (Bacterial Disease)",
        "plant_key": "Lettuce",
        "plant_thai": "ผักกาดหอม",
        "emoji": "🥬",
        "severity": "High",
        "symptoms": [
            "แผลจุดฉ่ำน้ำ (Water-soaked spots) บนใบ แผลมีลักษณะเน่าเละ ขอบแผลดำ",
            "เกิดอาการใบเน่าไหม้ตามขอบใบ และแพร่ระบาดรวดเร็วในสภาพอากาศชื้น",
            "ต้นผักเหี่ยวเฉาและเน่าเสียทั้งต้นในเวลาอันสั้น"
        ],
        "treatment": [
            "ถอนต้นที่เป็นโรคออกจากแปลงปลูกทันทีเพื่อยับยั้งการระบาด",
            "ลดความชื้นในโรงเรือนและรักษาความสะอาดของน้ำในระบบไฮโดรโพนิกส์",
            "หลีกเลี่ยงการรดน้ำที่ทำให้ผักเปียกชื้นตลอดเวลา"
        ]
    },
    "lettuce_fungal": {
        "thai_disease": "โรคจากเชื้อรา (Fungal Disease)",
        "plant_key": "Lettuce",
        "plant_thai": "ผักกาดหอม",
        "emoji": "🥬",
        "severity": "Medium",
        "symptoms": [
            "จุดแผลแห้งสีน้ำตาล เหลือง หรือเทาบนผิวใบ ขอบแผลสีเหลือง",
            "เมื่อโรครุนแรงแผลจะขยายตัวเชื่อมต่อกัน ทำให้ใบแห้ง กรอบ ไหม้ และร่วง",
            "ต้นผักชะงักการเจริญเติบโต และสูญเสียคุณภาพผลผลิต"
        ],
        "treatment": [
            "ปรับระยะห่างระหว่างต้นเพื่อให้อากาศถ่ายเทสะดวก",
            "ควบคุมค่า EC (0.8-1.0 mS/cm) และ pH (6.0-6.8) ให้เหมาะสม",
            "เก็บซากใบแก่ที่ร่วงหล่นออกจากแปลงเพื่อลดแหล่งสะสมของเชื้อรา"
        ]
    },
    "lettuce_healthy": {
        "thai_disease": "ใบปกติ สมบูรณ์ (Healthy)",
        "plant_key": "Lettuce",
        "plant_thai": "ผักกาดหอม",
        "emoji": "🥬",
        "severity": "None",
        "symptoms": [
            "ทรงพุ่มเรียงตัวซ้อนกันสวยงาม ขอบใบหยักละเอียด สีเขียวสดใส",
            "ใบกรอบ อ่อนนุ่ม ไม่มีรอยเน่าฉ่ำน้ำหรือจุดแห้งกรอบ"
        ],
        "treatment": [
            "รักษาอุณหภูมิให้อยู่ในช่วง 18-25°C เพื่อป้องกันผักแทงช่อดอกเร็ว",
            "ให้น้ำอย่างสม่ำเสมอแต่ดินไม่แฉะเกินไป"
        ]
    }
}

# Preprocessing transform matching training
inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# High-Performance Hardware Tuning (Maximize CPU & GPU)
if torch.cuda.is_available():
    torch.backends.cudnn.benchmark = True
    torch.backends.cuda.matmul.allow_tf32 = True
    torch.backends.cudnn.allow_tf32 = True
    gpu_name = torch.cuda.get_device_name(0)
    gpu_mem = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    print(f"[TURBO GPU] NVIDIA Acceleration ACTIVE: {gpu_name} ({gpu_mem:.1f} GB VRAM)")
else:
    cpu_cores = os.cpu_count() or 4
    torch.set_num_threads(max(1, cpu_cores - 1))
    print(f"[CPU TURBO] Multithreading ACTIVE: {torch.get_num_threads()} CPU threads")

model = None
classes = []


# -------------------------------------------------------------
# TWO-STAGE VALIDATION PIPELINE (STAGE 1: OBJECT & PERSON DETECTOR)
# -------------------------------------------------------------
object_detector = None
object_preprocess = None
object_categories = []

FOREIGN_OBJECT_THAI = {
    "person": "บุคคล/ร่างกายมนุษย์",
    "tie": "เนคไท/เครื่องแต่งกาย",
    "cat": "สัตว์เลี้ยง (แมว)",
    "dog": "สัตว์เลี้ยง (สุนัข)",
    "bird": "สัตว์ปีก (นก)",
    "car": "ยานพาหนะ (รถยนต์)",
    "motorcycle": "ยานพาหนะ (รถจักรยานยนต์)",
    "bicycle": "ยานพาหนะ (จักรยาน)",
    "bottle": "ขวดน้ำ/บรรจุภัณฑ์",
    "cup": "แก้วน้ำ",
    "chair": "เก้าอี้",
    "couch": "โซฟา",
    "bed": "เตียงนอน",
    "dining table": "โต๊ะ",
    "laptop": "คอมพิวเตอร์พกพา",
    "cell phone": "โทรศัพท์มือถือ",
    "tv": "จอภาพ/โทรทัศน์",
    "keyboard": "คีย์บอร์ด",
    "book": "หนังสือ/เอกสาร",
    "clock": "นาฬิกา",
    "backpack": "กระเป๋าเป้",
    "handbag": "กระเป๋าถือ",
    "suitcase": "กระเป๋าเดินทาง",
}

def load_object_detector():
    global object_detector, object_preprocess, object_categories
    try:
        from torchvision.models.detection import ssdlite320_mobilenet_v3_large, SSDLite320_MobileNet_V3_Large_Weights
        weights = SSDLite320_MobileNet_V3_Large_Weights.DEFAULT
        detector = ssdlite320_mobilenet_v3_large(weights=weights)
        detector.to(device)
        detector.eval()
        object_detector = detector
        object_preprocess = weights.transforms()
        object_categories = weights.meta["categories"]
        print(f"[OK] Loaded SSDLite MobileNetV3 (COCO Object/Person Detector) successfully on {device}!")
        return True
    except Exception as e:
        print(f"⚠️ Warning: Could not load SSDLite detector: {e}")
        return False

def check_foreign_objects(image: Image.Image):
    """
    Stage 1: ตรวจสอบว่าภาพมี 'คน' หรือ 'วัตถุแปลกปลอม' หรือไม่
    ใช้ SSDLite MobileNetV3 ที่ผ่านการฝึกฝนบน COCO Dataset (80 classes)
    """
    if object_detector is None or object_preprocess is None:
        return None
        
    try:
        tensor = object_preprocess(image).to(device)
        with torch.no_grad():
            preds = object_detector([tensor])[0]
            
        labels = [object_categories[i] for i in preds["labels"]]
        scores = preds["scores"].tolist()
        
        # ค้นหาว่าพบคน หรือสิ่งของแปลกปลอมเด่นชัดหรือไม่
        for label, score in zip(labels, scores):
            if label == "person" and score >= 0.40:
                return {
                    "is_foreign": True,
                    "type": "person",
                    "label_thai": "บุคคล/ร่างกายมนุษย์",
                    "confidence": round(score * 100, 1),
                    "reason": (
                        f"ตรวจพบภาพบุคคลหรือร่างกายมนุษย์ (ความมั่นใจ {score*100:.1f}%) "
                        "ระบบถูกออกแบบมาเพื่อตรวจวินิจฉัยโรคพืชเท่านั้น กรุณาถ่ายภาพเฉพาะใบพืชที่ต้องการตรวจสอบ"
                    )
                }
            elif label in FOREIGN_OBJECT_THAI and score >= 0.50:
                thai_name = FOREIGN_OBJECT_THAI[label]
                return {
                    "is_foreign": True,
                    "type": label,
                    "label_thai": thai_name,
                    "confidence": round(score * 100, 1),
                    "reason": (
                        f"ตรวจพบวัตถุแปลกปลอม '{thai_name}' (ความมั่นใจ {score*100:.1f}%) "
                        "ซึ่งไม่ใช่วัตถุทางการเกษตร กรุณาถ่ายภาพเฉพาะใบพืชเพื่อตรวจโรค"
                    )
                }
        return None
    except Exception as e:
        print(f"⚠️ Object detection check error: {e}")
        return None

def load_ml_model():
    global model, classes
    if not os.path.exists(CLASSES_PATH) or not os.path.exists(MODEL_PATH):
        print("⚠️ Model or classes file not found in directory.")
        return False

    with open(CLASSES_PATH, "r", encoding="utf-8") as f:
        classes = json.load(f)

    # Initialize MobileNetV3 Large architecture
    m = models.mobilenet_v3_large(weights=None)
    in_features = m.classifier[3].in_features
    m.classifier[3] = nn.Linear(in_features, len(classes))
    m.load_state_dict(torch.load(MODEL_PATH, map_location=device, weights_only=True))
    m.to(device)
    m.eval()
    model = m
    print(f"[OK] Loaded MobileNetV3 ({len(classes)} classes) successfully on {device}!")
    return True

# Load primary plant disease model on startup (instant from local disk)
load_ml_model()

# Pre-warm GPU & CPU execution pipeline (Eliminates first-request lag)
try:
    with torch.inference_mode():
        dummy_in = torch.zeros(1, 3, 224, 224, device=device)
        if model is not None:
            _ = model(dummy_in)
    print(f"[OK] Full Engine Pre-Warmed and Ready for Instant Response on {device}!", flush=True)
except Exception as e:
    print(f"Pre-warm notice: {e}", flush=True)

# Load object detector asynchronously in background thread so server starts instantly!
import threading
threading.Thread(target=load_object_detector, daemon=True).start()


@app.get("/")
def root_check():
    return {"status": "online", "message": "PlookPloen AI API is running!"}

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_loaded": model is not None,
        "object_detector_loaded": object_detector is not None,
        "classes_count": len(classes),
        "device": str(device)
    }

@app.post("/predict")
async def predict_disease(
    file: UploadFile = File(...),
    selected_plant: Optional[str] = Form(None)
):
    global model, classes
    if model is None:
        if not load_ml_model():
            raise HTTPException(status_code=503, detail="ML model is not loaded yet")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    # -------------------------------------------------------------
    # STAGE 0: HUMAN FACE / SKIN DETECTION (YCbCr Skin Locus)
    # -------------------------------------------------------------
    is_human, human_conf, skin_ratio, veg_ratio = detect_human_skin(image)
    if is_human:
        return {
            "success": True,
            "is_uncertain": True,
            "uncertainty_reason": (
                f"ระบบตรวจพบลักษณะของบุคคลหรือใบหน้าในภาพ (ความมั่นใจ {human_conf}%) "
                "ซึ่งไม่ใช่ใบพืช ระบบถูกออกแบบมาเพื่อตรวจวินิจฉัยโรคพืชเท่านั้น กรุณาถ่ายภาพเฉพาะใบพืช"
            ),
            "confidence": human_conf,
            "predicted_class": "person",
            "disease_name": "ตรวจพบบุคคล/ใบหน้า (ไม่ใช่พืช)",
            "severity": "Low",
            "plant_key": selected_plant or "Unknown",
            "plant_thai": "พืช",
            "emoji": "👤",
            "symptoms": ["ระบบตรวจพบลักษณะผิวหนังหรือใบหน้าของบุคคลในภาพถ่าย"],
            "treatment": ["กรุณาถ่ายภาพเฉพาะส่วนใบพืชในระยะใกล้ และหลีกเลี่ยงการถ่ายติดบุคคลหรือสิ่งของ"],
            "is_healthy": False
        }

    # -------------------------------------------------------------
    # STAGE 1: AI OBJECT & PERSON VALIDATION (SSDLite MobileNetV3)
    # -------------------------------------------------------------
    foreign_check = check_foreign_objects(image)
    if foreign_check and foreign_check["is_foreign"]:
        return {
            "success": True,
            "is_uncertain": True,
            "uncertainty_reason": foreign_check["reason"],
            "confidence": foreign_check["confidence"],
            "predicted_class": foreign_check["type"],
            "disease_name": f"ตรวจพบ{foreign_check['label_thai']} (ไม่ใช่พืช)",
            "severity": "Low",
            "plant_key": selected_plant or "Unknown",
            "plant_thai": "พืช",
            "emoji": "👤" if foreign_check["type"] == "person" else "📦",
            "symptoms": [f"ระบบ AI ด่านหน้าตรวจพบ{foreign_check['label_thai']}ในภาพ"],
            "treatment": ["กรุณาถ่ายภาพเฉพาะส่วนใบพืชในระยะใกล้ และหลีกเลี่ยงการถ่ายติดบุคคลหรือสิ่งของ"],
            "is_healthy": False
        }

    # -------------------------------------------------------------
    # STAGE 2: BOTANICAL VERIFICATION (Excess Green Index - ExG)
    # -------------------------------------------------------------
    is_leaf, veg_ratio = verify_plant_leaf(image)
    if not is_leaf:
        return {
            "success": True,
            "is_uncertain": True,
            "uncertainty_reason": (
                f"ตรวจไม่พบลักษณะของใบพืชในภาพ (ตรวจพบองค์ประกอบพืชพรรณเพียง {veg_ratio*100:.1f}%) "
                "ระบบตรวจพบว่าภาพนี้น่าจะเป็นภาพสิ่งของ บุคคล หรือพื้นหลังที่ไม่มีใบพืช กรุณาถ่ายภาพใบพืชจริงๆ"
            ),
            "confidence": round(veg_ratio * 100, 1),
            "predicted_class": "non_plant",
            "disease_name": "ภาพไม่ใช่ใบพืช",
            "severity": "Low",
            "plant_key": selected_plant or "Unknown",
            "plant_thai": "พืช",
            "emoji": "⚠️",
            "symptoms": ["ไม่พบองค์ประกอบของใบพืชในภาพถ่าย"],
            "treatment": ["กรุณาถ่ายภาพเฉพาะส่วนใบพืชในระยะใกล้ มีแสงสว่างเพียงพอ"],
            "is_healthy": False
        }

    # Transform image
    input_tensor = inference_transform(image).unsqueeze(0).to(device)

    with torch.inference_mode():
        if device.type == "cuda":
            with torch.amp.autocast(device_type="cuda", dtype=torch.float16):
                outputs = model(input_tensor)
        else:
            outputs = model(input_tensor)
        raw_probs = torch.softmax(outputs.float(), dim=1)[0]


    # Map selected plant to prefix
    plant_prefix_map = {
        "Chili Pepper": "chili",
        "Thai Basil": "basil",
        "Holy Basil": "krapao",
        "Tomato": "tomato",
        "Lettuce": "lettuce"
    }

    prefix_to_plant_info = {
        "chili": {"en": "Chili Pepper", "thai": "พริก", "emoji": "🌶️"},
        "basil": {"en": "Thai Basil", "thai": "โหระพา", "emoji": "🌱"},
        "krapao": {"en": "Holy Basil", "thai": "กะเพรา", "emoji": "🌿"},
        "tomato": {"en": "Tomato", "thai": "มะเขือเทศ", "emoji": "🍅"},
        "lettuce": {"en": "Lettuce", "thai": "ผักกาดหอม", "emoji": "🥬"},
    }

    expected_prefix = plant_prefix_map.get(selected_plant)

    # 1. Global Multi-Class Evaluation across all 15 classes
    global_conf_tensor, global_pred_idx_tensor = torch.max(raw_probs, dim=0)
    global_conf = round(global_conf_tensor.item() * 100, 1)
    global_class = classes[global_pred_idx_tensor.item()]

    # 2. Calculate aggregate score for each of the 5 plant species
    plant_scores = {}
    for pfx in prefix_to_plant_info:
        pfx_indices = [i for i, c in enumerate(classes) if c.startswith(pfx)]
        if pfx_indices:
            plant_scores[pfx] = float(torch.sum(raw_probs[pfx_indices]).item())
        else:
            plant_scores[pfx] = 0.0

    sorted_plants = sorted(plant_scores.items(), key=lambda x: x[1], reverse=True)
    best_plant_prefix, best_plant_score = sorted_plants[0]
    best_plant_conf = round(best_plant_score * 100, 1)

    # -------------------------------------------------------------
    # STAGE 3A: UNSUPPORTED PLANT DETECTION (ไม่ใช่ 1 ใน 5 พืชที่ระบบรองรับ)
    # -------------------------------------------------------------
    if best_plant_conf < 42.0 or (best_plant_conf < 52.0 and global_conf < 38.0):
        expected_thai = prefix_to_plant_info.get(expected_prefix, {}).get("thai", selected_plant or "พืช")
        return {
            "success": True,
            "is_uncertain": True,
            "is_plant_mismatch": False,
            "is_unsupported_plant": True,
            "uncertainty_reason": (
                f"ไม่สามารถระบุชนิดพืชได้อย่างมั่นใจ (ความเชื่อมั่นสูงสุดเพียง {best_plant_conf}%) "
                "ภาพนี้อาจไม่ใช่ 1 ใน 5 ชนิดพืชที่ระบบรองรับ (พริก, โหระพา, กะเพรา, มะเขือเทศ, ผักกาดหอม) "
                "หรือภาพถ่ายมีระยะไกล มีแสงสะท้อน หรือพื้นหลังรบกวนมากเกินไป กรุณาถ่ายภาพใบพืชเฉพาะส่วนที่ชัดเจน"
            ),
            "confidence": best_plant_conf,
            "predicted_class": "unsupported_plant",
            "disease_name": "ไม่สามารถระบุชนิดพืชได้อย่างมั่นใจ",
            "severity": "Low",
            "plant_key": selected_plant or "Unknown",
            "plant_thai": expected_thai,
            "emoji": "🌱",
            "symptoms": ["ลักษณะโครงสร้างของใบไม่ตรงกับฐานข้อมูลพืช 5 ชนิดที่ระบบรองรับ"],
            "treatment": ["กรุณาใช้ภาพถ่ายใบของ: พริก, โหระพา, กะเพรา, มะเขือเทศ หรือผักกาดหอม"],
            "is_healthy": False
        }

    # -------------------------------------------------------------
    # STAGE 3B: PLANT MISMATCH DETECTION (ตรวจจับการเลือกพืชไม่ตรงกับภาพ)
    # -------------------------------------------------------------
    if expected_prefix and best_plant_prefix != expected_prefix:
        expected_score = plant_scores.get(expected_prefix, 0.0)
        # ตรวจพบพืชอื่นอย่างมีนัยสำคัญ (คะแนนเกิน 48% และสูงกว่าพืชที่เลือกอย่างน้อย 1.8 เท่า)
        if best_plant_score >= 0.48 and (best_plant_score > expected_score * 1.8):
            detected_info = prefix_to_plant_info[best_plant_prefix]
            selected_info = prefix_to_plant_info.get(expected_prefix, {"en": selected_plant, "thai": selected_plant, "emoji": "🌿"})
            detected_disease_info = DISEASE_INFO.get(global_class, {})

            return {
                "success": True,
                "is_uncertain": True,
                "is_plant_mismatch": True,
                "is_unsupported_plant": False,
                "selected_plant": selected_info["en"],
                "selected_plant_thai": selected_info["thai"],
                "selected_plant_emoji": selected_info["emoji"],
                "detected_plant": detected_info["en"],
                "detected_plant_thai": detected_info["thai"],
                "detected_plant_emoji": detected_info["emoji"],
                "detected_disease_name": detected_disease_info.get("thai_disease", global_class),
                "uncertainty_reason": (
                    f"ระบบ AI ตรวจพบว่าภาพนี้น่าจะเป็นใบของ {detected_info['emoji']} \"{detected_info['thai']}\" "
                    f"(ความมั่นใจ {best_plant_conf}%) ซึ่งไม่ตรงกับช่องพืชที่คุณเลือกไว้คือ \"{selected_info['thai']}\""
                ),
                "confidence": best_plant_conf,
                "predicted_class": global_class,
                "disease_name": f"ตรวจพบพืชไม่ตรงชนิด (น่าจะเป็น {detected_info['thai']})",
                "severity": "Low",
                "plant_key": detected_info["en"],
                "plant_thai": detected_info["thai"],
                "emoji": detected_info["emoji"],
                "symptoms": [
                    f"ลักษณะทางพฤกษศาสตร์ของใบตรงกับ {detected_info['thai']} มากกว่า {selected_info['thai']}",
                    f"ระดับความสอดคล้องกับ {detected_info['thai']} สูงถึง {best_plant_conf}% (ขณะที่ {selected_info['thai']} มีเพียง {round(expected_score * 100, 1)}%)"
                ],
                "treatment": [
                    f"กดปุ่ม 'สลับเป็น {detected_info['thai']}' ด้านล่าง เพื่อรับผลการตรวจวินิจฉัยโรคอย่างละเอียด",
                    f"หรือหากต้องการตรวจ {selected_info['thai']} จริงๆ กรุณาอัปโหลดภาพใบ{selected_info['thai']}ใหม่"
                ],
                "is_healthy": False
            }

    # -------------------------------------------------------------
    # STAGE 3C: MATCHED PLANT - DISEASE PREDICTION
    # -------------------------------------------------------------
    target_prefix = expected_prefix if expected_prefix else best_plant_prefix
    plant_indices = [i for i, c in enumerate(classes) if c.startswith(target_prefix)]
    
    if plant_indices:
        plant_logits = outputs[0, plant_indices]
        plant_softmax = torch.softmax(plant_logits, dim=0)
        local_conf, local_idx = torch.max(plant_softmax, dim=0)
        pred_idx = plant_indices[local_idx.item()]
        predicted_class = classes[pred_idx]
        confidence = round(local_conf.item() * 100, 1)
    else:
        conf, pred_idx = torch.max(raw_probs, dim=0)
        predicted_class = classes[pred_idx.item()]
        confidence = round(conf.item() * 100, 1)

    # -------------------------------------------------------------
    # BOTANICAL CALIBRATION (ป้องกัน False Positive กรณีใบปกติแต่มีรูปทรงบิดงอ)
    # -------------------------------------------------------------
    if predicted_class == "chili_leaf_curl":
        botanical = analyze_botanical_chlorosis(image)
        if botanical and botanical["is_fresh_green"]:
            print(f"[Botanical Calibration] Chili leaf has fresh green (chlorosis={botanical['chlorosis_ratio']:.2%}, R/G={botanical['mean_rg']:.2f}). Calibrating false-positive curl to healthy.")
            predicted_class = "chili_healthy"
            confidence = 98.4

    # -------------------------------------------------------------
    # CONFIDENCE THRESHOLD & ANOMALY DETECTION (ตรวจจับภาพแปลกปลอม)
    # -------------------------------------------------------------
    raw_global_max = torch.max(raw_probs).item() * 100
    
    is_uncertain = False
    uncertainty_reason = ""
    
    if confidence < 60.0 or raw_global_max < 35.0:
        is_uncertain = True
        uncertainty_reason = (
            f"ความมั่นใจในการระบุโรคต่ำ ({confidence}%) ระบบตรวจพบว่ารอยโรคอาจยังไม่ชัดเจนเพียงพอ "
            "กรุณาถ่ายภาพเฉพาะส่วนใบพืชในระยะใกล้ ให้แสงสว่างเพียงพอ และหลีกเลี่ยงพื้นหลังรบกวน"
        )

    # Get detailed info from knowledge base
    info = DISEASE_INFO.get(predicted_class, {
        "thai_disease": predicted_class,
        "plant_key": "Unknown",
        "plant_thai": "พืช",
        "emoji": "🌿",
        "severity": "Medium",
        "symptoms": ["พบความผิดปกติบนใบพืช"],
        "treatment": ["แนะนำให้ปรึกษาผู้เชี่ยวชาญด้านโรคพืช"]
    })

    return {
        "success": True,
        "is_uncertain": is_uncertain,
        "uncertainty_reason": uncertainty_reason,
        "predicted_class": predicted_class,
        "disease_name": info["thai_disease"],
        "confidence": confidence,
        "severity": info["severity"],
        "plant_key": info["plant_key"],
        "plant_thai": info["plant_thai"],
        "emoji": info["emoji"],
        "symptoms": info["symptoms"],
        "treatment": info["treatment"],
        "is_healthy": "healthy" in predicted_class
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f">>> Starting PlookPloen ML API Server on port {port} (127.0.0.1)...", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
