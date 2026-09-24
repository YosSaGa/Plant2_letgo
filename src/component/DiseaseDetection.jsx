import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, CloudUpload, Leaf, ScanLine, ShieldCheck, Sparkles, Stethoscope, Upload, X, Cpu, AlertTriangle } from 'lucide-react';
import './disease.css';
import { supabase } from '../lib/supabaseClient';
import { AnimatedLoadingModal } from './AnimatedLoadingModal';

const diseaseDatabase = {
  'Chili Pepper': {
    thai: 'พริก', emoji: '🌶️',
    diseases: [
      {
        name: 'โรคใบจุด (Leaf Spot)',
        class_key: 'chili_leaf_spot',
        confidence: 99.1,
        severity: 'Medium',
        symptoms: ['ปรากฏจุดสีน้ำตาลหรือสีดำบนผิวใบ บริเวณรอบแผลอาจมีสีเหลืองล้อมรอบ', 'เมื่อโรครุนแรงขึ้น แผลจะขยายตัวและเชื่อมต่อกันจนใบแห้งและร่วง'],
        treatment: ['ตัดใบที่เป็นโรคและนำไปเผาทำลายนอกแปลงปลูก', 'ฉีดพ่นเชื้อราไตรโคเดอร์มา หรือสารประกอบทองแดง', 'หลีกเลี่ยงการให้น้ำกระเด็นถูกใบ รดน้ำเฉพาะโคนต้น']
      },
      {
        name: 'โรคใบหงิกเหลือง (Leaf Curl)',
        class_key: 'chili_leaf_curl',
        confidence: 98.8,
        severity: 'High',
        symptoms: ['ใบอ่อนมีลักษณะหงิกงอ ม้วนตัว และมีสีเหลืองซีด ขนาดใบเล็กลง', 'ยอดชะงักการเจริญเติบโต ต้นมีลักษณะแคระแกร็น (มีแมลงหวี่ขาวเป็นพาหะ)'],
        treatment: ['ติดตั้งกับดักกาวสีเหลืองในแปลงเพื่อดักจับแมลงหวี่ขาว', 'ฉีดพ่นสารชีวภัณฑ์กำจัดแมลง เช่น บิวเวอเรีย หรือน้ำมันสะเดา', 'ถอนต้นที่เป็นโรครุนแรงทิ้งเพื่อสกัดการแพร่ระบาด']
      },
      {
        name: 'ใบปกติ สมบูรณ์ (Healthy)',
        class_key: 'chili_healthy',
        confidence: 99.5,
        severity: 'None',
        symptoms: ['ใบมีสีเขียวสดใส แผ่นใบเรียบสมบูรณ์ ไม่พบลักษณะหงิกงอหรือจุดด่างดำ', 'พืชเจริญเติบโตแข็งแรงตามปกติ'],
        treatment: ['ดูแลรดน้ำสม่ำเสมอตามคำแนะนำสภาพอากาศ', 'ใส่ปุ๋ยบำรุงตามระยะ และหมั่นตรวจแปลงสม่ำเสมอ']
      }
    ],
  },
  'Thai Basil': {
    thai: 'โหระพา', emoji: '🌱',
    diseases: [
      {
        name: 'โรคราน้ำค้าง (Downy Mildew)',
        class_key: 'basil_downy_mildew',
        confidence: 98.9,
        severity: 'High',
        symptoms: ['ด้านบนของใบปรากฏอาการเหลืองซีดเป็นหย่อมๆ', 'ด้านล่างของใบพบเส้นใยและสปอร์เชื้อราสีน้ำตาลเข้มปกคลุม', 'ใบจะเหลืองทั้งใบและแห้งตาย'],
        treatment: ['ตัดแต่งกิ่งและใบที่เป็นโรคออกจากแปลงทันที', 'ปรับระยะปลูกให้อากาศถ่ายเทสะดวก ลดความชื้นสะสม', 'หลีกเลี่ยงการรดน้ำช่วงเย็นที่ทำให้ใบชื้นค้างคืน']
      },
      {
        name: 'โรคใบจุดจากเชื้อรา (Fungal Leaf Spot)',
        class_key: 'basil_leaf_spot_fungal',
        confidence: 98.5,
        severity: 'Medium',
        symptoms: ['จุดขนาดเล็กสีน้ำตาลเข้มหรือสีดำบนผิวใบ อาจพบขอบแผลสีเหลืองล้อมรอบ', 'แผลขยายตัวเชื่อมต่อกันเป็นบริเวณกว้าง ใบเหลืองและร่วงก่อนกำหนด'],
        treatment: ['เด็ดใบที่เป็นจุดแผลทิ้งเพื่อหยุดการแพร่กระจาย', 'รดน้ำที่โคนต้น หลีกเลี่ยงการฉีดพ่นน้ำสัมผัสใบ', 'ฉีดพ่นน้ำส้มควันไม้หรือสารชีวภัณฑ์ควบคุมเชื้อรา']
      },
      {
        name: 'ใบปกติ สมบูรณ์ (Healthy)',
        class_key: 'basil_healthy',
        confidence: 99.4,
        severity: 'None',
        symptoms: ['ใบเดี่ยวรูปไข่สีเขียวสด ขอบใบหยักเล็กน้อย แผ่นใบสมบูรณ์', 'มีกลิ่นหอมเฉพาะตัวชัดเจน ไม่มีรอยโรค'],
        treatment: ['ให้น้ำสม่ำเสมอโดยรักษาความชื้นในดินอย่างพอเหมาะ ไม่แฉะขัง', 'ให้ต้นได้รับแสงแดดอย่างน้อยวันละ 6 ชั่วโมง']
      }
    ],
  },
  'Holy Basil': {
    thai: 'กะเพรา', emoji: '🍃',
    diseases: [
      {
        name: 'รอยแผลจากแมลงกัดแทะ (Insect Bite)',
        class_key: 'krapao_insect_bite',
        confidence: 99.3,
        severity: 'Medium',
        symptoms: ['ใบมีรอยแหว่ง รูพรุน หรือขอบใบขาดเป็นหยักไม่สม่ำเสมอ', 'เกิดจากแมลงศัตรูพืชเข้าทำลาย เช่น หนอนกระทู้ ตั๊กแตน หนอนเจาะใบ', 'พื้นที่สังเคราะห์แสงลดลง ต้นชะงักการเจริญเติบโต'],
        treatment: ['ตรวจดูใต้ใบและกำจัดหนอนหรือแมลงในเวลาเช้า', 'ฉีดพ่นสารชีวภาพ เช่น แบคทีเรียบีที (Bt) หรือน้ำสกัดสะเดา', 'หมั่นกำจัดวัชพืชรอบแปลงเพื่อทำลายแหล่งหลบซ่อน']
      },
      {
        name: 'อาการจุดสีขาวบนใบ (White Spots)',
        class_key: 'krapao_white_spots',
        confidence: 98.7,
        severity: 'Low',
        symptoms: ['ผิวใบปรากฏจุดสีขาวหรือสีเทาอ่อนกระจายตามแผ่นใบ', 'เกิดจากการดูดกินน้ำเลี้ยงของแมลงขนาดเล็ก เช่น เพลี้ย', 'หากรุนแรงใบอาจเหลือง แห้ง และร่วงก่อนกำหนด'],
        treatment: ['ฉีดพ่นน้ำสบู่เจือจางหรือน้ำมันสะเดาบริเวณใต้ใบ', 'ตัดแต่งใบที่มีจุดขาวหนาแน่นออก', 'จัดระยะปลูกให้มีแสงแดดส่องถึงและระบายอากาศได้ดี']
      },
      {
        name: 'ใบปกติ สมบูรณ์ (Healthy)',
        class_key: 'krapao_healthy',
        confidence: 99.6,
        severity: 'None',
        symptoms: ['ใบเดี่ยวสีเขียวสดธรรมชาติ มีขนอ่อนปกคลุมทั่วลำต้นและใบ', 'แผ่นใบเรียบ ไม่มีรอยแมลงกัดหรือจุดด่างขาว'],
        treatment: ['รดน้ำสม่ำเสมอช่วงเช้า-เย็น ระบายน้ำได้ดี', 'หมั่นเด็ดยอดดอกเพื่อส่งเสริมการแตกกิ่งก้านใบใหม่']
      }
    ],
  },
  Tomato: {
    thai: 'มะเขือเทศ', emoji: '🍅',
    diseases: [
      {
        name: 'โรคใบไหม้ระยะต้น (Early Blight)',
        class_key: 'tomato_early_blight',
        confidence: 99.2,
        severity: 'High',
        symptoms: ['จุดแผลสีน้ำตาลเข้มเป็นวงแหวนซ้อนกันหลายชั้น (Concentric Rings)', 'มักเริ่มปรากฏที่ใบล่างก่อน แล้วค่อยลุกลามขึ้นสู่ใบบน', 'เนื้อเยื่อรอบแผลเปลี่ยนเป็นสีเหลือง ใบแห้งและร่วงหล่น'],
        treatment: ['เด็ดใบล่างที่เป็นโรคออกและนำไปเผาทำลายนอกแปลง', 'ทำค้างพยุงต้นเพื่อไม่ให้ใบสัมผัสกับผิวดิน', 'งดการให้น้ำแบบพ่นเหนือทรงพุ่ม ให้รดน้ำเฉพาะโคนต้น']
      },
      {
        name: 'โรคใบจุดเซปทอเรีย (Septoria Leaf Spot)',
        class_key: 'tomato_septoria_leaf_spot',
        confidence: 99.0,
        severity: 'Medium',
        symptoms: ['จุดกลมขนาดเล็กสีเทาอ่อน ขอบแผลสีน้ำตาลเข้มหรือดำ', 'กึ่งกลางแผลอาจพบจุดสีดำขนาดเล็กซึ่งเป็นสปอร์เชื้อรา', 'ใบเหลืองและร่วงหล่นจากโคนต้นขึ้นไป'],
        treatment: ['คลุมโคนต้นด้วยฟางเพื่อลดละอองน้ำกระเด็นพาเชื้อจากดิน', 'ตัดแต่งกิ่งล่างเพื่อให้ลมพัดผ่านได้สะดวก', 'ฉีดพ่นสารชีวภัณฑ์ไตรโคเดอร์มา']
      },
      {
        name: 'ใบปกติ สมบูรณ์ (Healthy)',
        class_key: 'tomato_healthy',
        confidence: 99.4,
        severity: 'None',
        symptoms: ['ใบประกอบแบบขนนก ขอบใบหยักแฉกสีเขียวสดใส', 'ผิวใบมีขนอ่อนปกคลุมสม่ำเสมอ ไม่มีแผลไหม้หรือจุดเชื้อรา'],
        treatment: ['ให้น้ำสม่ำเสมอเพื่อป้องกันอาการผลแตก', 'ใส่ปุ๋ยบำรุงตามระยะการออกดอกและติดผล']
      }
    ],
  },
  Lettuce: {
    thai: 'ผักกาดหอม', emoji: '🥬',
    diseases: [
      {
        name: 'โรคจากแบคทีเรีย (Bacterial Disease)',
        class_key: 'lettuce_bacterial',
        confidence: 98.6,
        severity: 'High',
        symptoms: ['แผลจุดฉ่ำน้ำ (Water-soaked spots) บนแผ่นใบ แผลเน่าเละ ขอบแผลดำ', 'เกิดอาการใบเน่าไหม้ตามขอบใบ แพร่ระบาดรวดเร็วในสภาพอากาศชื้น', 'ต้นผักเหี่ยวเฉาและเน่าเสียทั้งต้นในเวลาอันสั้น'],
        treatment: ['ถอนต้นที่เป็นโรคออกจากแปลงทันทีเพื่อยับยั้งการระบาด', 'ลดความชื้นในโรงเรือนและรักษาความสะอาดของระบบน้ำ', 'หลีกเลี่ยงการรดน้ำที่ทำให้ผักเปียกชื้นตลอดเวลา']
      },
      {
        name: 'โรคจากเชื้อรา (Fungal Disease)',
        class_key: 'lettuce_fungal',
        confidence: 98.9,
        severity: 'Medium',
        symptoms: ['จุดแผลแห้งสีน้ำตาลหรือเทาบนผิวใบ ขอบแผลสีเหลือง', 'แผลขยายตัวเชื่อมต่อกัน ใบแห้ง กรอบ ไหม้ และร่วงก่อนกำหนด', 'พืชชะงักการเจริญเติบโต สูญเสียคุณภาพผลผลิต'],
        treatment: ['ปรับระยะห่างระหว่างต้นผักเพื่อให้อากาศถ่ายเทสะดวก', 'ควบคุมค่า EC (0.8-1.0) และ pH (6.0-6.8) ให้เหมาะสม', 'เก็บซากใบแก่ที่ร่วงหล่นออกจากแปลงสม่ำเสมอ']
      },
      {
        name: 'ใบปกติ สมบูรณ์ (Healthy)',
        class_key: 'lettuce_healthy',
        confidence: 99.3,
        severity: 'None',
        symptoms: ['ทรงพุ่มเรียงตัวสวยงาม ขอบใบหยักละเอียด สีเขียวสดใส', 'ใบกรอบ ไม่มีรอยเน่าฉ่ำน้ำหรือจุดแห้งกรอบ'],
        treatment: ['รักษาอุณหภูมิให้อยู่ในช่วง 18-25°C', 'ให้น้ำสม่ำเสมอแต่ดินไม่แฉะเกินไป']
      }
    ],
  },
};

const severityClass = { None: 'dd-low', Low: 'dd-low', Medium: 'dd-medium', High: 'dd-high' };
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const PLANT_TO_ID = {
  'Chili Pepper': 1,
  'Thai Basil': 2,
  'Holy Basil': 3,
  'Tomato': 4,
  'Lettuce': 5,
};

export default function DiseaseDetection({ onBack }) {
  const inputRef = useRef(null);
  const [plant, setPlant] = useState('Chili Pepper');
  const [image, setImage] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'online' && data.model_loaded) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => {
        setBackendStatus('offline');
      });
  }, []);

  const chooseFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setFileObj(file);
    const reader = new FileReader();
    reader.onload = (event) => { setImage(event.target.result); setResult(null); };
    reader.readAsDataURL(file);
  };

  const saveDiseaseCheck = async (detectedDisease, confidenceScore) => {
    if (!supabase) return;
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || null;
      const plantId = PLANT_TO_ID[plant] || 1;
      const score = typeof confidenceScore === 'number' ? confidenceScore : 95.0;

      const { error } = await supabase.from('disease_checks').insert({
        user_id: userId,
        plant_id: plantId,
        image_url: null,
        detected_disease: detectedDisease,
        confidence_score: score,
        checked_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error saving disease check to Supabase:', error);
      }
    } catch (err) {
      console.error('saveDiseaseCheck error:', err);
    }
  };

  const analyze = async () => {
    setAnalyzing(true);
    setResult(null);

    const minWait = new Promise((resolve) => setTimeout(resolve, 2500));

    if (fileObj) {
      try {
        const formData = new FormData();
        formData.append('file', fileObj);
        formData.append('selected_plant', plant);

        const fetchPromise = fetch(`${API_URL}/predict`, {
          method: 'POST',
          body: formData,
        }).then((res) => (res.ok ? res.json() : null));

        const [data] = await Promise.all([fetchPromise, minWait]);

        if (data && data.success) {
          setBackendStatus('online');

          if (data.is_uncertain) {
            setResult({
              is_uncertain: true,
              uncertainty_reason: data.uncertainty_reason,
              confidence: data.confidence,
              plant_thai: data.plant_thai,
              name: data.disease_name || 'ไม่สามารถระบุได้อย่างชัดเจน (ภาพอาจไม่ใช่ใบพืช)',
              severity: 'Low',
              is_real_ai: true,
              predicted_class: data.predicted_class,
              emoji: data.emoji || '⚠️',
            });
          } else {
            const finalResult = {
              name: data.disease_name,
              confidence: data.confidence,
              severity: data.severity,
              symptoms: data.symptoms,
              treatment: data.treatment,
              is_healthy: data.is_healthy,
              plant_thai: data.plant_thai,
              emoji: data.emoji,
              is_real_ai: true,
              is_uncertain: false,
            };
            setResult(finalResult);

            saveDiseaseCheck(data.disease_name, data.confidence);
          }

          setAnalyzing(false);
          return;
        }
      } catch {
      }
    }

    await minWait;
    setBackendStatus('offline');
    setResult({
      is_uncertain: true,
      uncertainty_reason: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ AI ได้ในขณะนี้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือรอสักครู่แล้วลองใหม่อีกครั้ง',
      confidence: 0,
      name: 'การเชื่อมต่อเซิร์ฟเวอร์ AI ขัดข้อง',
      severity: 'Low',
      is_real_ai: false,
      predicted_class: 'server_offline',
      emoji: '🔌',
    });
    setAnalyzing(false);
  };

  const currentPlant = diseaseDatabase[plant];

  return (
    <main className="dd-root">
      <div className="dd-orb dd-orb-one" /><div className="dd-orb dd-orb-two" />
      <div className="dd-wrap">
        <motion.button className="dd-back" onClick={onBack} whileHover={{ x: -4 }} whileTap={{ scale: .97 }}>
          <ArrowLeft size={18} /> กลับหน้าหลัก
        </motion.button>
        <motion.header className="dd-hero" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="dd-hero-icon"><Stethoscope size={28} /></div>
          <div>
            <p className="dd-eyebrow"><Sparkles size={14} /> PlookPloen AI care · MobileNetV3 (CNN)</p>
            <h1>Plant Disease Detection</h1>
            <h2>ระบบตรวจสอบโรคพืชด้วยปัญญาประดิษฐ์ (AI)</h2>
            <p>อัปโหลดภาพใบพืชเพื่อตรวจจับและวิเคราะห์โรคทางใบ 15 คลาส (พริก, โหระพา, กะเพรา, มะเขือเทศ, ผักกาดหอม) พร้อมรับคำแนะนำการดูแลรักษา</p>
          </div>
        </motion.header>

        <div className="dd-layout">
          <section className="dd-panel dd-upload-panel">
            <div className="dd-panel-heading">
              <div>
                <p className="dd-kicker">STEP 01</p>
                <h3>เลือกชนิดพืชและภาพใบเพื่อตรวจสอบ</h3>
              </div>
              {backendStatus === 'online' ? (
                <span className="dd-secure" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                  <Cpu size={16} /> Real AI Active (99.12% Acc)
                </span>
              ) : (
                <span className="dd-secure" title="เปิด python src/plant_train/server.py เพื่อใช้งานโมเดลจริง">
                  <ShieldCheck size={16} /> Ready
                </span>
              )}
            </div>

            <div className="dd-plant-picker" aria-label="Select plant">
              {Object.entries(diseaseDatabase).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => { setPlant(key); setResult(null); }}
                  className={plant === key ? 'active' : ''}
                >
                  <span>{value.emoji}</span>
                  <small>{value.thai}</small>
                </button>
              ))}
            </div>

            <div
              className={`dd-dropzone ${isDragging ? 'dragging' : ''} ${image ? 'has-image' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                chooseFile(e.dataTransfer.files[0]);
              }}
              onClick={() => !image && inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" onChange={(e) => chooseFile(e.target.files[0])} />
              {image ? (
                <>
                  <img src={image} alt="Selected plant" />
                  {analyzing && (
                    <motion.div
                      className="dd-scan-line"
                      animate={{ top: ['8%', '89%', '8%'] }}
                      transition={{ repeat: Infinity, duration: 1.35, ease: 'linear' }}
                    />
                  )}
                  <button
                    className="dd-remove"
                    onClick={(e) => { e.stopPropagation(); setImage(null); setFileObj(null); setResult(null); }}
                    aria-label="Remove image"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <div className="dd-upload-empty">
                  <span className="dd-upload-icon"><CloudUpload size={32} /></span>
                  <strong>ลากและวางภาพใบพืชที่นี่</strong>
                  <p>หรือคลิกเลือกไฟล์ภาพจากอุปกรณ์ของคุณ</p>
                  <button type="button"><Upload size={16} /> อัปโหลดภาพใบพืช</button>
                  <small>รองรับ PNG, JPG, JPEG หรือ WEBP</small>
                </div>
              )}
            </div>

            <motion.button
              className="dd-analyze"
              onClick={analyze}
              disabled={!image || analyzing}
              whileTap={{ scale: .98 }}
            >
              <ScanLine size={19} /> {analyzing ? 'กำลังวิเคราะห์ด้วยโมเดล AI...' : 'วิเคราะห์ภาพพืช (Analyze Image)'}
            </motion.button>
          </section>

          <section className="dd-panel dd-result-panel">
            <div className="dd-panel-heading">
              <div>
                <p className="dd-kicker">STEP 02</p>
                <h3>ผลการวิเคราะห์โรคพืช</h3>
              </div>
              <Leaf size={22} className="dd-leaf" />
            </div>

            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div className="dd-analysis-state" key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="dd-spinner" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <ScanLine size={24} />
                  </motion.div>
                  <strong>กำลังประมวลผลภาพใบพืช...</strong>
                  <p>วิเคราะห์ลวดลาย สี และความผิดปกติผ่านโครงข่ายประสาทเทียม CNN (MobileNetV3)</p>
                  <div className="dd-progress">
                    <motion.i initial={{ width: '4%' }} animate={{ width: '92%' }} transition={{ duration: 1.4 }} />
                  </div>
                </motion.div>
              ) : result ? (
                result.is_uncertain ? (
                  <motion.div key="uncertain" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '10px 4px' }}>
                    <div style={{ width: '64px', height: '64px', margin: '0 auto 12px', borderRadius: '20px', background: result.predicted_class === 'person' ? '#eff6ff' : '#fff7ed', display: 'grid', placeItems: 'center', color: result.predicted_class === 'person' ? '#2563eb' : '#ea580c', border: result.predicted_class === 'person' ? '1.5px solid #bfdbfe' : '1.5px solid #fed7aa', boxShadow: '0 8px 20px -8px rgba(0,0,0,0.1)', fontSize: '30px' }}>
                      {result.emoji ? result.emoji : <AlertTriangle size={34} />}
                    </div>
                    <span style={{ display: 'inline-block', background: result.predicted_class === 'person' ? '#dbeafe' : '#ffedd5', color: result.predicted_class === 'person' ? '#1d4ed8' : '#c2410c', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>
                      {result.predicted_class === 'person'
                        ? `🎯 ตรวจพบบุคคลด้วย AI (ความมั่นใจ ${result.confidence}%)`
                        : result.confidence < 60
                          ? `Confidence: ${result.confidence}% (ต่ำกว่าเกณฑ์ 60%)`
                          : `AI Pre-filter: ${result.confidence}%`}
                    </span>
                    <h4 style={{ color: result.predicted_class === 'person' ? '#1e3a8a' : '#9a3412', fontFamily: 'Prompt, sans-serif', fontSize: '19px', margin: '0 0 8px' }}>
                      {result.name || 'ไม่สามารถวินิจฉัยได้อย่างมั่นใจ'}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#7c2d12', background: '#fffbeb', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fef3c7', lineHeight: '1.55', margin: '0 0 16px', textAlign: 'left' }}>
                      {result.uncertainty_reason}
                    </p>

                    <div style={{ textAlign: 'left', background: '#f8fafc', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }}>
                      <strong style={{ display: 'block', color: '#0f172a', marginBottom: '6px' }}>💡 คำแนะนำในการถ่ายภาพให้โมเดล AI:</strong>
                      <p style={{ margin: '4px 0' }}>• 📸 ถ่ายระยะใกล้ ให้เห็นตัวใบพืชชัดเจนอย่างน้อย 70% ของภาพ</p>
                      <p style={{ margin: '4px 0' }}>• ☀️ ถ่ายในที่ที่มีแสงสว่างเพียงพอ หลีกเลี่ยงเงามืด</p>
                      <p style={{ margin: '4px 0' }}>• 🌿 หลีกเลี่ยงการถ่ายติดนิ้วมือ ดิน หรือสิ่งของอื่นๆ นอกเหนือจากใบพืช</p>
                    </div>

                    <button className="dd-new-scan" style={{ marginTop: '16px' }} onClick={() => { setResult(null); inputRef.current?.click(); }}>
                      ถ่ายภาพหรือเลือกไฟล์ใหม่
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="dd-result-plant">
                      <span>{result.emoji || currentPlant.emoji}</span>
                      <div>
                        <small>ชนิดพืชที่ตรวจสอบ</small>
                        <strong>{plant} <em>({currentPlant.thai})</em></strong>
                      </div>
                      <span className="dd-health" style={result.is_real_ai ? { background: '#dcfce7', color: '#15803d' } : {}}>
                        <CheckCircle2 size={15} /> {result.is_real_ai ? 'CNN Model 99.12%' : 'ผลวิเคราะห์สมบูรณ์'}
                      </span>
                    </div>

                    <div className="dd-disease-name">
                      <div className="dd-disease-icon">{result.severity === 'None' ? '🌿' : '🩺'}</div>
                      <div>
                        <small>ผลการตรวจวินิจฉัย</small>
                        <h4 style={result.severity === 'None' ? { color: '#15803d' } : {}}>{result.name}</h4>
                      </div>
                    </div>

                    <div className="dd-metrics">
                      <div>
                        <span>ค่าความมั่นใจ (Confidence)</span>
                        <strong>{result.confidence}%</strong>
                        <i><b style={{ width: `${Math.min(100, result.confidence)}%` }} /></i>
                      </div>
                      <div>
                        <span>ระดับความรุนแรง (Severity)</span>
                        <strong className={severityClass[result.severity] || 'dd-low'}>
                          {result.severity === 'None' ? 'ปกติ (Healthy)' : result.severity}
                        </strong>
                        <small className={severityClass[result.severity] || 'dd-low'}>
                          {result.severity === 'None' ? 'พืชแข็งแรงสมบูรณ์' : result.severity === 'High' ? 'ต้องรีบรักษาด่วน' : 'ควรเฝ้าระวัง'}
                        </small>
                      </div>
                    </div>

                    <div className="dd-detail">
                      <h5>อาการที่สังเกตได้ (Observed symptoms)</h5>
                      {result.symptoms.map((item) => <p key={item}>• {item}</p>)}
                    </div>

                    <div className="dd-treatment">
                      <div><Sparkles size={17} /><h5>คำแนะนำการดูแลรักษา (Recommended Care)</h5></div>
                      {result.treatment.map((item) => (
                        <p key={item}><CheckCircle2 size={15} /> {item}</p>
                      ))}
                    </div>

                    <button className="dd-new-scan" onClick={() => { setResult(null); inputRef.current?.click(); }}>
                      ตรวจสอบภาพอื่นเพิ่มเติม
                    </button>
                  </motion.div>
                )
              ) : (
                <motion.div className="dd-result-empty" key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div>🌿<span><ScanLine size={22} /></span></div>
                  <h4>พร้อมตรวจสอบโรคพืชด้วย AI</h4>
                  <p>เลือกชนิดพืช 5 ชนิด อัปโหลดภาพถ่ายใบพืชที่ชัดเจน แล้วกดปุ่มวิเคราะห์ภาพ</p>
                  <small>แบบจำลอง CNN (MobileNetV3) ความแม่นยำ 99.12% พร้อมบันทึกลงฐานข้อมูล Supabase</small>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
        <p className="dd-disclaimer">
          <Sparkles size={14} /> ระบบวิเคราะห์โรคพืชโครงการปลูกเพลิน (PlookPloen) พัฒนาโดย มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตสุราษฎร์ธานี
        </p>
      </div>

      <AnimatedLoadingModal isOpen={analyzing} plantName={currentPlant.thai} />
    </main>
  );
}
