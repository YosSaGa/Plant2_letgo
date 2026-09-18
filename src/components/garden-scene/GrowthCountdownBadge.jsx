import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sprout, Trophy } from 'lucide-react';
import { normalizeStage, STAGE_CONFIG } from './gardenSceneUtils';

export default function GrowthCountdownBadge({ daysUntilNextStage, stage, readyToHarvest = false }) {
  const normStage = normalizeStage(stage);

  if (normStage === 'seed' && (daysUntilNextStage === null || daysUntilNextStage === undefined)) {
    return null;
  }

  if (normStage === 'fruiting') {
    return (
      <motion.div
        className="gs-countdown-badge gs-badge-harvest"
        initial={{ opacity: 0, scale: 0.85, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4 }}
      >
        <span className="gs-badge-icon">🧺</span>
        <span className="gs-badge-text">
          <b>พร้อมเก็บเกี่ยว</b>
          <small>ผลผลิตโตสมบูรณ์แล้ว</small>
        </span>
      </motion.div>
    );
  }

  if (daysUntilNextStage === 0) {
    return (
      <motion.div
        className="gs-countdown-badge gs-badge-ready"
        initial={{ opacity: 0, scale: 0.85, y: -8 }}
        animate={{
          opacity: 1,
          scale: [1, 1.04, 1],
          y: 0,
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Sparkles size={16} className="gs-badge-star" />
        <span className="gs-badge-text">
          <b>พร้อมโตวันนี้! ✨</b>
          <small>เตรียมเข้าสู่{STAGE_CONFIG[normStage]?.nextLabel || 'ขั้นถัดไป'}</small>
        </span>
      </motion.div>
    );
  }

  if (typeof daysUntilNextStage === 'number' && daysUntilNextStage > 0) {
    return (
      <motion.div
        className="gs-countdown-badge gs-badge-counting"
        initial={{ opacity: 0, scale: 0.9, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <Sprout size={16} className="gs-badge-sprout" />
        <span className="gs-badge-text">
          <span>อีก <b>{daysUntilNextStage}</b> วันจะโต</span>
          <small>สู่ระยะ{STAGE_CONFIG[normStage]?.nextLabel || 'ถัดไป'}</small>
        </span>
      </motion.div>
    );
  }

  return null;
}
