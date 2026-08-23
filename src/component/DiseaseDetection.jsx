import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, CloudUpload, Leaf, ScanLine, ShieldCheck, Sparkles, Stethoscope, Upload, X } from 'lucide-react';
import './disease.css';
import { supabase } from '../lib/supabaseClient';

const diseaseDatabase = {
  'Chili Pepper': {
    thai: 'พริก', emoji: '🌶️',
    diseases: [
      { name: 'Root and Crown Rot', confidence: 94, severity: 'High', symptoms: ['Wilting plants', 'Darkened roots or stem base'], treatment: ['Improve drainage', 'Remove severely affected plants and avoid waterlogging'] },
      { name: 'Chili Thrips', confidence: 91, severity: 'Medium', symptoms: ['Curled young leaves', 'Distorted flowers or fruits'], treatment: ['Remove weeds around the plot', 'Inspect young leaves and maintain adequate moisture'] },
      { name: 'Fruit Fly Damage', confidence: 88, severity: 'Medium', symptoms: ['Puncture marks on fruit', 'Fruit rot and premature drop'], treatment: ['Collect damaged and fallen fruits', 'Use appropriate fruit-fly traps'] },
    ],
  },
  Tomato: {
    thai: 'มะเขือเทศ', emoji: '🍅',
    diseases: [
      { name: 'Bacterial Wilt', confidence: 92, severity: 'High', symptoms: ['Lower leaves wilt first', 'Whole plant wilts permanently'], treatment: ['Remove diseased plants promptly', 'Use well-drained soil and avoid spreading contaminated water'] },
      { name: 'Blossom End Rot', confidence: 89, severity: 'Medium', symptoms: ['Dark sunken patch at fruit bottom', 'Dry fruit decay'], treatment: ['Keep watering consistent', 'Provide calcium when fruits begin to set'] },
      { name: 'Whitefly Infestation', confidence: 86, severity: 'Low', symptoms: ['Sticky leaves', 'Yellowing and weak growth'], treatment: ['Use yellow sticky traps', 'Inspect plants regularly'] },
    ],
  },
  'Thai Basil': {
    thai: 'โหระพา', emoji: '🌱',
    diseases: [
      { name: 'Downy Mildew', confidence: 93, severity: 'High', symptoms: ['Yellow patches on leaves', 'Leaf discoloration'], treatment: ['Improve ventilation', 'Avoid overwatering'] },
      { name: 'Leaf Spot', confidence: 90, severity: 'Medium', symptoms: ['Brown circular spots'], treatment: ['Remove infected leaves'] },
      { name: 'Aphid Infestation', confidence: 87, severity: 'Medium', symptoms: ['Sticky leaves', 'Curled leaves'], treatment: ['Remove pests', 'Apply insect control'] },
    ],
  },
  'Holy Basil': {
    thai: 'กะเพรา', emoji: '🍃',
    diseases: [
      { name: 'Fungal Leaf Spot', confidence: 93, severity: 'Medium', symptoms: ['Dark spots on leaves', 'Weak plant growth'], treatment: ['Keep leaves dry', 'Remove infected parts'] },
      { name: 'Root Rot', confidence: 90, severity: 'High', symptoms: ['Yellow leaves', 'Root damage'], treatment: ['Reduce watering', 'Improve soil drainage'] },
      { name: 'Whitefly Infestation', confidence: 86, severity: 'Low', symptoms: ['Small insects under leaves', 'Leaves become weak'], treatment: ['Control insects', 'Clean leaves'] },
    ],
  },
  Lettuce: {
    thai: 'ผักกาดหอม', emoji: '🥬',
    diseases: [
      { name: 'Downy Mildew', confidence: 91, severity: 'Medium', symptoms: ['Yellow angular leaf spots', 'Gray growth beneath leaves'], treatment: ['Remove affected leaves', 'Improve spacing and ventilation'] },
      { name: 'Bottom Rot', confidence: 88, severity: 'Medium', symptoms: ['Outer leaves wilt', 'Brown decay near the soil line'], treatment: ['Improve drainage', 'Keep leaves off wet soil'] },
      { name: 'Aphid Infestation', confidence: 85, severity: 'Low', symptoms: ['Curled leaves', 'Sticky leaf surface'], treatment: ['Rinse pests off early', 'Inspect plants regularly'] },
    ],
  },
};

const severityClass = { Low: 'dd-low', Medium: 'dd-medium', High: 'dd-high' };

export default function DiseaseDetection({ onBack }) {
  const inputRef = useRef(null);
  const [plant, setPlant] = useState('Chili Pepper');
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const chooseFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => { setImage(event.target.result); setResult(null); };
    reader.readAsDataURL(file);
  };

  const analyze = () => {
    setAnalyzing(true);
    setResult(null);
    window.setTimeout(() => {
      const entries = diseaseDatabase[plant].diseases;
      const nextResult = entries[Math.floor(Math.random() * entries.length)];
      setResult(nextResult);
      if (supabase) supabase.from('disease_detections').insert({ user_id: null, plant_type: plant, disease_name: nextResult.name, severity: nextResult.severity, confidence: nextResult.confidence });
      setAnalyzing(false);
    }, 1800);
  };

  const currentPlant = diseaseDatabase[plant];

  return (
    <main className="dd-root">
      <div className="dd-orb dd-orb-one" /><div className="dd-orb dd-orb-two" />
      <div className="dd-wrap">
        <motion.button className="dd-back" onClick={onBack} whileHover={{ x: -4 }} whileTap={{ scale: .97 }}><ArrowLeft size={18} /> กลับหน้าหลัก</motion.button>
        <motion.header className="dd-hero" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="dd-hero-icon"><Stethoscope size={28} /></div>
          <div><p className="dd-eyebrow"><Sparkles size={14} /> PlookPloen AI care</p><h1>Plant Disease Detection</h1><h2>ระบบตรวจสอบโรคพืชด้วย AI</h2><p>Upload a plant image to detect possible diseases and get plant care recommendations.</p></div>
        </motion.header>

        <div className="dd-layout">
          <section className="dd-panel dd-upload-panel">
            <div className="dd-panel-heading"><div><p className="dd-kicker">STEP 01</p><h3>เลือกภาพพืชเพื่อตรวจสอบ</h3></div><span className="dd-secure"><ShieldCheck size={16} /> Mock AI</span></div>
            <div className="dd-plant-picker" aria-label="Select plant">
              {Object.entries(diseaseDatabase).map(([key, value]) => <button key={key} onClick={() => { setPlant(key); setResult(null); }} className={plant === key ? 'active' : ''}><span>{value.emoji}</span><small>{value.thai}</small></button>)}
            </div>
            <div className={`dd-dropzone ${isDragging ? 'dragging' : ''} ${image ? 'has-image' : ''}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); chooseFile(e.dataTransfer.files[0]); }} onClick={() => !image && inputRef.current?.click()}>
              <input ref={inputRef} type="file" accept="image/*" onChange={(e) => chooseFile(e.target.files[0])} />
              {image ? <><img src={image} alt="Selected plant" />{analyzing && <motion.div className="dd-scan-line" animate={{ top: ['8%', '89%', '8%'] }} transition={{ repeat: Infinity, duration: 1.35, ease: 'linear' }} />}<button className="dd-remove" onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }} aria-label="Remove image"><X size={18} /></button></> : <div className="dd-upload-empty"><span className="dd-upload-icon"><CloudUpload size={32} /></span><strong>Drag & drop your plant image here</strong><p>or select a photo from your device</p><button type="button"><Upload size={16} /> Upload image</button><small>PNG, JPG or WEBP · image stays in this browser</small></div>}
            </div>
            <motion.button className="dd-analyze" onClick={analyze} disabled={!image || analyzing} whileTap={{ scale: .98 }}><ScanLine size={19} /> {analyzing ? 'Analyzing plant image...' : 'Analyze plant image'}</motion.button>
          </section>

          <section className="dd-panel dd-result-panel">
            <div className="dd-panel-heading"><div><p className="dd-kicker">STEP 02</p><h3>ผลการวิเคราะห์</h3></div><Leaf size={22} className="dd-leaf" /></div>
            <AnimatePresence mode="wait">
              {analyzing ? <motion.div className="dd-analysis-state" key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="dd-spinner" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><ScanLine size={24} /></motion.div><strong>Analyzing plant image...</strong><p>Comparing visual patterns with our mock disease library</p><div className="dd-progress"><motion.i initial={{ width: '4%' }} animate={{ width: '92%' }} transition={{ duration: 1.65 }} /></div></motion.div> : result ? <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="dd-result-plant"><span>{currentPlant.emoji}</span><div><small>Selected plant</small><strong>{plant} <em>({currentPlant.thai})</em></strong></div><span className="dd-health"><CheckCircle2 size={15} /> Analysis complete</span></div>
                <div className="dd-disease-name"><div className="dd-disease-icon">🩺</div><div><small>Disease detected</small><h4>{result.name}</h4></div></div>
                <div className="dd-metrics"><div><span>Confidence</span><strong>{result.confidence}%</strong><i><b style={{ width: `${result.confidence}%` }} /></i></div><div><span>Severity</span><strong className={severityClass[result.severity]}>{result.severity}</strong><small className={severityClass[result.severity]}>Needs attention</small></div></div>
                <div className="dd-detail"><h5>Observed symptoms</h5>{result.symptoms.map((item) => <p key={item}>• {item}</p>)}</div>
                <div className="dd-treatment"><div><Sparkles size={17} /><h5>Recommended care</h5></div>{result.treatment.map((item) => <p key={item}><CheckCircle2 size={15} /> {item}</p>)}</div>
                <button className="dd-new-scan" onClick={() => { setResult(null); inputRef.current?.click(); }}>Scan another image</button>
              </motion.div> : <motion.div className="dd-result-empty" key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div>🌿<span><ScanLine size={22} /></span></div><h4>Ready to check your plant</h4><p>Select a plant, upload a clear photo, then start the mock AI scan.</p><small>This demonstration uses pre-defined plant disease data.</small></motion.div>}
            </AnimatePresence>
          </section>
        </div>
        <p className="dd-disclaimer"><Sparkles size={14} /> This is a simulated AI result for demonstration purposes only. For persistent symptoms, consult a local plant specialist.</p>
      </div>
    </main>
  );
}
