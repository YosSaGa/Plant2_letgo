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

def verify_plant_leaf(image: Image.Image):
    """
    ตรวจสอบว่าภาพมีองค์ประกอบของใบพืชจริงหรือไม่ โดยใช้ Excess Green Index (ExG)
    ExG = 2*G - R - B (ดัชนีพืชพรรณทางการเกษตรมาตรฐานสากล)
    """
    small = image.resize((150, 150))
    arr = np.array(small, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    exg = 2 * g - r - b
    veg_mask = (exg > 6) & (g > 30)
    veg_ratio = float(np.mean(veg_mask))
    return (veg_ratio >= 0.12), veg_ratio


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

# Load models on startup
load_ml_model()
load_object_detector()

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
                f"ตรวจไม่พบลักษณะของใบพืชในภาพ (ดัชนีพืชพรรณ ExG ตรวจพบเพียง {veg_ratio*100:.1f}%) "
                "ระบบตรวจพบว่าภาพนี้น่าจะเป็นภาพบุคคล สิ่งของ หรือพื้นหลังที่ไม่มีใบพืช กรุณาถ่ายภาพใบพืชจริงๆ"
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

    with torch.no_grad():
        outputs = model(input_tensor)
        raw_probs = torch.softmax(outputs, dim=1)[0]

    # Map selected plant to prefix
    plant_prefix_map = {
        "Chili Pepper": "chili",
        "Thai Basil": "basil",
        "Holy Basil": "krapao",
        "Tomato": "tomato",
        "Lettuce": "lettuce"
    }

    prefix = plant_prefix_map.get(selected_plant)
    
    if prefix:
        # Filter only classes that belong to this plant
        plant_indices = [i for i, c in enumerate(classes) if c.startswith(prefix)]
        if plant_indices:
            # Softmax specifically within the selected plant's classes
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
    else:
        conf, pred_idx = torch.max(raw_probs, dim=0)
        predicted_class = classes[pred_idx.item()]
        confidence = round(conf.item() * 100, 1)

    # -------------------------------------------------------------
    # CONFIDENCE THRESHOLD & ANOMALY DETECTION (ตรวจจับภาพแปลกปลอม)
    # -------------------------------------------------------------
    raw_global_max = torch.max(raw_probs).item() * 100
    
    # ถ้าความมั่นใจต่ำกว่า 60% หรือโมเดลสับสนมาก แสดงว่าภาพอาจไม่ใช่ใบพืช
    is_uncertain = False
    uncertainty_reason = ""
    
    if confidence < 60.0 or raw_global_max < 40.0:
        is_uncertain = True
        uncertainty_reason = (
            f"ความมั่นใจต่ำ ({confidence}%) ระบบตรวจพบว่าภาพนี้อาจไม่ใช่ใบพืช หรือภาพไม่ชัดเจนเพียงพอ "
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
    print(f">>> Starting PlookPloen ML API Server on port {port} ...")
    uvicorn.run(app, host="0.0.0.0", port=port)
