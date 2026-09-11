import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PLANT_CONFIG, normalizePlantType } from './gardenSceneUtils';

/**
 * SeedPlantingInteraction.jsx
 * Interactive seed sowing stage:
 * - Empty rich soil bed with tap to sow prompt
 * - Seed drop micro-animation
 * - Sparkle celebrations & sown state
 * - Triggers onSeedPlanted() callback
 */
export default function SeedPlantingInteraction({ plantType, onSeedPlanted }) {
  const [hasPlanted, setHasPlanted] = useState(false);
  const [animating, setAnimating] = useState(false);

  const normType = normalizePlantType(plantType);
  const config = PLANT_CONFIG[normType] || PLANT_CONFIG.chili;

  const handleSow = () => {
    if (hasPlanted || animating) return;
    setAnimating(true);

    window.setTimeout(() => {
      setHasPlanted(true);
      setAnimating(false);
      if (typeof onSeedPlanted === 'function') {
        onSeedPlanted();
      }
    }, 700);
  };

  return (
    <div className="gs-seed-interaction-container">
      {/* ดินและแปลงเพาะเมล็ด */}
      <div className="gs-soil-bed-wrapper">
        <svg viewBox="0 0 240 180" className="gs-soil-bed-svg">
          <defs>
            <radialGradient id="gsSoilBedGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="60%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#270e03" />
            </radialGradient>
          </defs>
          {/* Ground Shadow */}
          <ellipse cx="120" cy="155" rx="85" ry="18" fill="rgba(0,0,0,0.22)" />
          {/* Main Soil Mound */}
          <path
            d="M30 148 C45 105, 85 85, 120 85 C155 85, 195 105, 210 148 C215 160, 185 168, 120 168 C55 168, 25 160, 30 148 Z"
            fill="url(#gsSoilBedGrad)"
          />
          {/* Soil Pebbles */}
          <circle cx="75" cy="138" r="4.5" fill="#a16207" opacity="0.6" />
          <circle cx="165" cy="132" r="5" fill="#a16207" opacity="0.6" />
          <circle cx="120" cy="120" r="3.5" fill="#ca8a04" opacity="0.5" />
          <circle cx="140" cy="145" r="4" fill="#a16207" opacity="0.6" />

          {/* เมล็ดที่ตกลงดิน (แสดงเมื่อหว่านแล้ว) */}
          {hasPlanted && (
            <g>
              {/* จุดหลุมเพาะเมล็ดที่มีความชื้น */}
              <ellipse cx="95" cy="115" rx="6" ry="3.5" fill="#1c1917" opacity="0.7" />
              <circle cx="95" cy="114" r="2.8" fill="#ca8a04" />

              <ellipse cx="120" cy="108" rx="7" ry="4" fill="#1c1917" opacity="0.7" />
              <circle cx="120" cy="107" r="3.2" fill="#ca8a04" />

              <ellipse cx="145" cy="114" rx="6" ry="3.5" fill="#1c1917" opacity="0.7" />
              <circle cx="145" cy="113" r="2.8" fill="#ca8a04" />

              {/* ละอองน้ำชุ่มชื้น */}
              <circle cx="106" cy="112" r="1.8" fill="#38bdf8" opacity="0.8" />
              <circle cx="134" cy="110" r="1.8" fill="#38bdf8" opacity="0.8" />
            </g>
          )}
        </svg>

        {/* Animation เมล็ดร่วงลงดินตอนกดหว่าน */}
        <AnimatePresence>
          {animating && (
            <>
              <motion.span
                className="gs-dropping-seed"
                style={{ left: '42%' }}
                initial={{ y: -60, scale: 0.5, opacity: 0 }}
                animate={{ y: 20, scale: 1.1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeIn' }}
              >
                🌰
              </motion.span>
              <motion.span
                className="gs-dropping-seed"
                style={{ left: '50%' }}
                initial={{ y: -70, scale: 0.5, opacity: 0 }}
                animate={{ y: 25, scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeIn' }}
              >
                🌰
              </motion.span>
              <motion.span
                className="gs-dropping-seed"
                style={{ left: '58%' }}
                initial={{ y: -60, scale: 0.5, opacity: 0 }}
                animate={{ y: 20, scale: 1.1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.15, ease: 'easeIn' }}
              >
                🌰
              </motion.span>
            </>
          )}
        </AnimatePresence>

        {/* ประกายดาวเมื่อหว่านสำเร็จ */}
        {hasPlanted && (
          <motion.div
            className="gs-sparkle-celebration"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Sparkles className="gs-star-icon" size={24} />
          </motion.div>
        )}
      </div>

      {/* ปุ่ม / กล่องข้อความสั่งหว่านเมล็ด */}
      <div className="gs-seed-prompt-wrap">
        {!hasPlanted ? (
          <motion.button
            type="button"
            className="gs-sow-button"
            onClick={handleSow}
            disabled={animating}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 4px 14px rgba(16, 185, 129, 0.25)',
                '0 6px 20px rgba(16, 185, 129, 0.45)',
                '0 4px 14px rgba(16, 185, 129, 0.25)',
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <span className="gs-sow-icon">🌱</span>
            <span className="gs-sow-text">แตะเพื่อหว่านเมล็ด{config.nameTh}</span>
          </motion.button>
        ) : (
          <motion.div
            className="gs-sown-badge"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <span className="gs-sown-check">✓</span>
            <span>หว่านเมล็ดเรียบร้อยแล้ว · รดน้ำเพื่อเริ่มงอก</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
