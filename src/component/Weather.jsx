import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sun, 
  CloudRain, 
  Cloud, 
  Moon, 
  Flame, 
  Droplets, 
  Thermometer, 
  X, 
  Sprout, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info
} from 'lucide-react';
import GardenScene from '../components/garden-scene/GardenScene';
import { 
  getTimeOfDay, 
  normalizePlantType, 
  normalizeStage, 
  calcDefaultDaysUntilNext, 
  PLANT_CONFIG, 
  STAGE_CONFIG 
} from '../components/garden-scene/gardenSceneUtils';
import './weather.css';

const plantEmoji = {
  'กะเพรา': '🌿',
  'โหระพา': '🌱',
  'พริก': '🌶️',
  'มะเขือเทศ': '🍅',
  'ผักกาดหอม': '🥬',
};

function getSceneKey(weather) {
  if (!weather) return 'day';
  const { temp, condition } = weather;
  if (condition === 'Rain') return 'rain';
  if (condition === 'Clouds') return 'cloudy';
  if (temp <= 20) return 'evening';
  if (temp >= 33) return 'hot';
  return 'day';
}

const SCENES = {
  day: { 
    className: 'wx-scene-day', 
    icon: '☀️', 
    title: 'กลางวันแจ่มใส', 
    desc: 'แสงแดดอ่อนกำลังดี เหมาะกับการสังเคราะห์แสงและการเจริญเติบโต ควรรดน้ำตอนเช้าเพื่อรักษาความชื้นในดินตลอดวัน',
    badgeText: '☀️ แดดแจ่มใส',
    badgeColor: '#059669',
    bgColor: '#ecfdf5'
  },
  hot: { 
    className: 'wx-scene-hot', 
    icon: '🥵', 
    title: 'อากาศร้อนจัด', 
    desc: 'อุณหภูมิสูงและแดดจัด ผิวดินแห้งระเหยเร็วกว่าปกติ ควรรดน้ำเพิ่มและหลีกเลี่ยงการรดน้ำช่วงเที่ยงแดดจัด',
    badgeText: '🔥 อากาศร้อนจัด',
    badgeColor: '#dc2626',
    bgColor: '#fef2f2'
  },
  cloudy: { 
    className: 'wx-scene-cloudy', 
    icon: '☁️', 
    title: 'ฟ้าครึ้มมีเมฆมาก', 
    desc: 'ท้องฟ้ามีเมฆบดบัง แสงแดดรำไร อากาศเย็นสบาย อัตราการคายน้ำของพืชลดลง ดินจะยังคงรักษาความชื้นได้นาน',
    badgeText: '☁️ เมฆมาก',
    badgeColor: '#475569',
    bgColor: '#f1f5f9'
  },
  rain: { 
    className: 'wx-scene-rain', 
    icon: '🌧️', 
    title: 'ฝนกำลังตก', 
    desc: 'ฝนช่วยเติมน้ำตามธรรมชาติและความชื้นในอากาศสูง ควรงดการรดน้ำเพิ่มเติมเพื่อป้องกันปัญหาน้ำขังและรากเน่า',
    badgeText: '🌧️ ฝนโปรยปราย',
    badgeColor: '#0284c7',
    bgColor: '#f0f9ff'
  },
  evening: { 
    className: 'wx-scene-evening', 
    icon: '🌙', 
    title: 'อากาศเย็น ยามค่ำคืน', 
    desc: 'บรรยากาศยามค่ำคืนเงียบสงบ อุณหภูมิลดต่ำลง เหมาะสำหรับช่วงพักผ่อนสะสมอาหารของต้นไม้',
    badgeText: '✨ ค่ำคืนสดชื่น',
    badgeColor: '#6366f1',
    bgColor: '#eef2ff'
  },
};

const BASE_WATER_ML = { 'กะเพรา': 200, 'โหระพา': 180, 'ผักกาดหอม': 150, 'พริก': 300, 'มะเขือเทศ': 350 };
const WATER_FORMULA = { tempRef: 28, tempStep: 0.03, humidityRef: 50, humidityStep: 0.01, minFactor: 0.6, maxFactor: 1.6 };

function clampFactor(f) {
  return Math.min(WATER_FORMULA.maxFactor, Math.max(WATER_FORMULA.minFactor, f));
}

function calcWateringAdvice(plantType, temp, humidity) {
  const baseMl = BASE_WATER_ML[plantType] || BASE_WATER_ML['กะเพรา'];
  const hasWeather = typeof temp === 'number' && typeof humidity === 'number';
  const t = hasWeather ? temp : WATER_FORMULA.tempRef;
  const h = hasWeather ? humidity : WATER_FORMULA.humidityRef;

  const rawTempFactor = 1 + (t - WATER_FORMULA.tempRef) * WATER_FORMULA.tempStep;
  const tempFactor = clampFactor(rawTempFactor);
  const rawHumidityFactor = 1 - (h - WATER_FORMULA.humidityRef) * WATER_FORMULA.humidityStep;
  const humidityFactor = clampFactor(rawHumidityFactor);
  
  const combinedFactor = tempFactor * humidityFactor;
  const finalMl = Math.round((baseMl * combinedFactor) / 10) * 10;

  let level = 'normal';
  let adviceText = 'สภาพอากาศอยู่ในเกณฑ์ปกติ รดน้ำตามรอบเวลาที่แนะนำได้เลย';
  if (combinedFactor >= 1.15) { 
    level = 'increase'; 
    adviceText = 'อากาศร้อนและ/หรือแห้งกว่าปกติ ควรรดน้ำเพิ่มขึ้นเพื่อป้องกันพืชเหี่ยวเฉา'; 
  } else if (combinedFactor <= 0.85) { 
    level = 'decrease'; 
    adviceText = 'ความชื้นในอากาศสูงหรืออากาศเย็นกว่าปกติ ควรลดปริมาณน้ำลงเพื่อป้องกันรากแฉะ'; 
  }

  return { hasWeather, baseMl, temp: t, humidity: h, tempFactor, humidityFactor, combinedFactor, finalMl, level, adviceText };
}

function Weather({ 
  plant, 
  weather, 
  onBack, 
  onPlantUpdate,
  plantType: propPlantType,
  stage: propStage,
  daysUntilNextStage: propDaysUntilNext,
  timeOfDay: propTimeOfDay,
  onSeedPlanted: propOnSeedPlanted,
  potSize: propPotSize
}) {
  const rawPlantType = propPlantType || plant?.type || 'chili';
  const rawStage = propStage || plant?.stage || 'seedling';
  
  const normPlantType = normalizePlantType(rawPlantType);
  const initialStage = normalizeStage(rawStage);

  const [currentStage, setCurrentStage] = useState(initialStage);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState(propTimeOfDay || null);
  const [showFormula, setShowFormula] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [showPlantedToast, setShowPlantedToast] = useState(false);

  useEffect(() => {
    setCurrentStage(normalizeStage(rawStage));
  }, [rawStage]);

  const effectiveTimeOfDay = selectedTimeOfDay || propTimeOfDay || getTimeOfDay();

  const computedDays = useMemo(() => {
    if (propDaysUntilNext !== undefined && propDaysUntilNext !== null) {
      return propDaysUntilNext;
    }
    return calcDefaultDaysUntilNext(normPlantType, currentStage, plant?.plantedAt);
  }, [propDaysUntilNext, normPlantType, currentStage, plant?.plantedAt]);

  const sceneKey = getSceneKey(weather);
  const scene = SCENES[sceneKey] || SCENES.day;
  const plantCfg = PLANT_CONFIG[normPlantType] || PLANT_CONFIG.chili;
  const emoji = plantEmoji[plant?.type] || plantCfg.emoji || '🌱';

  const wateringAdvice = useMemo(
    () => calcWateringAdvice(plant?.type || plantCfg.nameTh, weather?.temp, weather?.humidity), 
    [plant?.type, plantCfg.nameTh, weather?.temp, weather?.humidity]
  );

  const handleSeedPlanted = () => {
    setCurrentStage('seedling');
    setShowPlantedToast(true);
    setTimeout(() => setShowPlantedToast(false), 4000);

    if (typeof propOnSeedPlanted === 'function') {
      propOnSeedPlanted();
    }
    if (typeof onPlantUpdate === 'function') {
      onPlantUpdate({
        ...plant,
        stage: 'ต้นกล้า',
        plantedAt: new Date().toISOString()
      });
    }
  };

  const STAGE_STEPS = [
    { key: 'seed', label: 'เมล็ด', icon: '🌰' },
    { key: 'seedling', label: 'ต้นกล้า', icon: '🌱' },
    { key: 'mature', label: 'โตเต็มวัย', icon: '🌿' },
    { key: 'fruiting', label: 'ออกผล', icon: normPlantType === 'tomato' ? '🍅' : normPlantType === 'chili' ? '🌶️' : '🥬' }
  ];

  return (
    <motion.div 
      className="wx-garden-page"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4 }}
    >
      <header className="wx-top-header">
        <div className="wx-header-left">
          {onBack && (
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="wx-back-button" 
              onClick={onBack}
              aria-label="ย้อนกลับ"
            >
              <ArrowLeft size={18} strokeWidth={2.4} />
              <span>กลับสู่สวน</span>
            </motion.button>
          )}

          <div className="wx-plant-title-badge">
            <span className="wx-plant-emoji">{emoji}</span>
            <div className="wx-plant-name-group">
              <h1 className="wx-plant-name">{plant?.type || plantCfg.nameTh}</h1>
              <span className="wx-stage-sub">
                {STAGE_CONFIG[currentStage]?.label || currentStage}
                {plant?.potSize ? ` · กระถาง ${plant.potSize}"` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="wx-header-right">
          <div className="wx-time-switcher">
            <button
              type="button"
              className={`wx-time-pill-btn ${selectedTimeOfDay === 'morning' ? 'active' : ''}`}
              onClick={() => setSelectedTimeOfDay('morning')}
              title="ยามเช้า (05:00–11:59)"
            >
              🌅 เช้า
            </button>
            <button
              type="button"
              className={`wx-time-pill-btn ${selectedTimeOfDay === 'afternoon' ? 'active' : ''}`}
              onClick={() => setSelectedTimeOfDay('afternoon')}
              title="ยามบ่าย (12:00–16:59)"
            >
              ☀️ เที่ยง
            </button>
            <button
              type="button"
              className={`wx-time-pill-btn ${selectedTimeOfDay === 'evening' ? 'active' : ''}`}
              onClick={() => setSelectedTimeOfDay('evening')}
              title="ยามเย็น (17:00–04:59)"
            >
              🌇 เย็น
            </button>
            <button
              type="button"
              className={`wx-time-pill-btn ${selectedTimeOfDay === null ? 'active auto' : ''}`}
              onClick={() => setSelectedTimeOfDay(null)}
              title="ตามเวลาเครื่องจริงอัตโนมัติ"
            >
              <Clock size={13} style={{ marginRight: 3 }} /> ออโต้
            </button>
          </div>

          <motion.div 
            className="wx-weather-hud-pill"
            whileHover={{ scale: 1.03 }}
            onClick={() => setShowInfoCard(true)}
            title="กดเพื่อดูข้อมูลสภาพแวดล้อมและการรดน้ำ"
          >
            <div className="wx-hud-icon-wrap" style={{ background: scene.bgColor, color: scene.badgeColor }}>
              {sceneKey === 'day' && <Sun size={17} />}
              {sceneKey === 'hot' && <Flame size={17} />}
              {sceneKey === 'cloudy' && <Cloud size={17} />}
              {sceneKey === 'rain' && <CloudRain size={17} />}
              {sceneKey === 'evening' && <Moon size={17} />}
            </div>
            <div className="wx-hud-text">
              <span className="wx-hud-title">{scene.title}</span>
              <span className="wx-hud-meta">
                {typeof weather?.temp === 'number' ? `${weather.temp}°C` : '--'} · {weather?.location || 'สภาพแวดล้อม'}
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="wx-garden-canvas-area">
        <div className="wx-garden-scene-container">
          <GardenScene
            plantType={normPlantType}
            stage={currentStage}
            daysUntilNextStage={computedDays}
            timeOfDay={effectiveTimeOfDay}
            onSeedPlanted={handleSeedPlanted}
            potSize={propPotSize || plant?.potSize}
            method={plant?.method || 'pot'}
            showPlant={true}
          />
        </div>

        <AnimatePresence>
          {showPlantedToast && (
            <motion.div 
              className="wx-toast-planted"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
            >
              <span className="wx-toast-icon">🎉</span>
              <div>
                <b>หว่านเมล็ด{plantCfg.nameTh}เรียบร้อยแล้ว!</b>
                <p>ต้นไม้เริ่มเข้าสู่ระยะเตรียมงอกเป็นต้นกล้า หมั่นรดน้ำตามคำแนะนำนะ</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="wx-bottom-controls">
        <div className="wx-stage-stepper">
          <span className="wx-stepper-label">พัฒนาการ:</span>
          <div className="wx-stepper-steps">
            {STAGE_STEPS.map((st, idx) => {
              const isCurrent = currentStage === st.key;
              const isPassed = STAGE_STEPS.findIndex(s => s.key === currentStage) >= idx;
              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setCurrentStage(st.key)}
                  className={`wx-step-node ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}`}
                  title={`ดูภาพจำลองระยะ ${st.label}`}
                >
                  <span className="wx-step-icon">{st.icon}</span>
                  <span className="wx-step-text">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.button
          className="wx-view-info-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowInfoCard(true)}
        >
          <div className="wx-pulse-dot" />
          <Droplets size={18} className="text-emerald-500" />
          <span>ข้อมูลต้นไม้ & คำแนะนำรดน้ำ ({wateringAdvice.finalMl} มล.)</span>
        </motion.button>
      </footer>

      <AnimatePresence>
        {showInfoCard && (
          <motion.div
            className="wx-info-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfoCard(false)}
          >
            <motion.div
              className="wx-info-card"
              initial={{ y: 70, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 70, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="wx-info-header">
                <div className="wx-info-title-group">
                  <div className="wx-info-emoji-badge">{emoji}</div>
                  <div className="wx-info-names">
                    <h2>{plant?.type || plantCfg.nameTh}</h2>
                    <div className="wx-info-badge-row">
                      <span className="wx-scene-badge" style={{ background: scene.bgColor, color: scene.badgeColor }}>
                        {scene.icon} {scene.title}
                      </span>
                      <span className="wx-scene-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                        🌱 {STAGE_CONFIG[currentStage]?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="wx-close-card-btn" 
                  onClick={() => setShowInfoCard(false)}
                  aria-label="ปิด"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="wx-info-desc">{scene.desc}</p>

              <div className="wx-stats-grid">
                <div className="wx-stat-card">
                  <div className="wx-stat-icon-wrapper wx-stat-icon-temp">
                    <Thermometer size={20} />
                  </div>
                  <div className="wx-stat-content">
                    <div className="wx-stat-title">อุณหภูมิปัจจุบัน</div>
                    <div className="wx-stat-number">{weather?.temp ?? '--'}°C</div>
                  </div>
                </div>

                <div className="wx-stat-card">
                  <div className="wx-stat-icon-wrapper wx-stat-icon-humidity">
                    <Droplets size={20} />
                  </div>
                  <div className="wx-stat-content">
                    <div className="wx-stat-title">ความชื้นในอากาศ</div>
                    <div className="wx-stat-number">{weather?.humidity ?? '--'}%</div>
                    <div className="wx-humidity-track">
                      <motion.div
                        className="wx-humidity-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, weather?.humidity ?? 0))}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`wx-water-card wx-water-${wateringAdvice.level}`}>
                <div className="wx-water-card-top">
                  <span className="wx-water-card-heading">
                    <Droplets size={16} className="text-sky-500" />
                    <span>ปริมาณน้ำที่แนะนำวันนี้</span>
                  </span>
                  <button
                    type="button"
                    className="wx-formula-trigger-btn"
                    onClick={() => setShowFormula(true)}
                    title="ดูวิธีและสูตรคำนวณ"
                  >
                    ?
                  </button>
                </div>

                <div className="wx-water-metric-row">
                  <span className="wx-water-amount">{wateringAdvice.finalMl}</span>
                  <span className="wx-water-unit">มล. / ครั้ง</span>
                </div>

                <div className={`wx-water-advice-badge wx-advice-${wateringAdvice.level}`}>
                  {wateringAdvice.level === 'normal' && <CheckCircle2 size={16} />}
                  {wateringAdvice.level === 'increase' && <AlertCircle size={16} />}
                  {wateringAdvice.level === 'decrease' && <AlertCircle size={16} />}
                  <span>{wateringAdvice.adviceText}</span>
                </div>
              </div>

              <div className="wx-meta-tags-row">
                <span className="wx-meta-tag">🌱 ระยะ: {STAGE_CONFIG[currentStage]?.label || currentStage}</span>
                <span className="wx-meta-tag">
                  🪴 {plant?.method === 'กระถาง' ? `กระถาง ${plant?.potSize || '-'} นิ้ว` : 'แปลงลงดิน'}
                </span>
                <span className="wx-meta-tag">🔢 จำนวน {plant?.amount || 1} ต้น</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFormula && (
          <motion.div
            className="wx-formula-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFormula(false)}
          >
            <motion.div
              className="wx-formula-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', bounce: 0.35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="wx-formula-icon-wrap">🧮</div>
              <h3 className="wx-formula-title wx-display">สูตรคำนวณปริมาณน้ำอัจฉริยะ</h3>
              <p className="wx-formula-desc">
                ประมวลผลจากปริมาณน้ำฐานของ {plant?.type || plantCfg.nameTh} ร่วมกับค่าอุณหภูมิและความชื้นสัมพัทธ์จริงจากสภาพแวดล้อม
              </p>

              <div className="wx-steps-list">
                <div className="wx-step-card">
                  <div className="wx-step-name">1. ปริมาณน้ำมาตรฐาน (อากาศปกติ 28°C / ความชื้น 50%)</div>
                  <div className="wx-step-calc">{wateringAdvice.baseMl} มล. / ครั้ง</div>
                </div>

                <div className="wx-step-card">
                  <div className="wx-step-name">2. ตัวคูณอุณหภูมิ (สูตร: 1 + (อุณหภูมิ - 28) × 0.03)</div>
                  <div className="wx-step-calc">
                    1 + ({wateringAdvice.temp}°C - 28) × 0.03 = {wateringAdvice.tempFactor.toFixed(2)} เท่า
                  </div>
                </div>

                <div className="wx-step-card">
                  <div className="wx-step-name">3. ตัวคูณความชื้น (สูตร: 1 - (ความชื้น - 50) × 0.01)</div>
                  <div className="wx-step-calc">
                    1 - ({wateringAdvice.humidity}% - 50) × 0.01 = {wateringAdvice.humidityFactor.toFixed(2)} เท่า
                  </div>
                </div>

                <div className="wx-step-card wx-step-highlight">
                  <div className="wx-step-name">4. ปริมาณน้ำสุทธิที่พืชต้องการ</div>
                  <div className="wx-step-calc">
                    {wateringAdvice.baseMl} × {wateringAdvice.tempFactor.toFixed(2)} × {wateringAdvice.humidityFactor.toFixed(2)} ≈ {wateringAdvice.finalMl} มล.
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="wx-formula-confirm-btn"
                onClick={() => setShowFormula(false)}
              >
                เข้าใจแล้ว
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export { GardenScene };
export default Weather;
