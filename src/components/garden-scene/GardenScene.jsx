import React, { useState } from 'react';
import SceneBackground from './SceneBackground';
import PlantRenderer from './PlantRenderer';
import SeedPlantingInteraction from './SeedPlantingInteraction';
import GrowthCountdownBadge from './GrowthCountdownBadge';
import { getTimeOfDay, normalizePlantType, normalizeStage } from './gardenSceneUtils';
import './GardenScene.css';

/**
 * GardenScene.jsx
 * Master Garden Simulation View Component for PlookPloen
 *
 * @param {Object} props
 * @param {"chili" | "basil" | "holyBasil" | "tomato" | "lettuce" | string} props.plantType - ชนิดพืช
 * @param {"seed" | "seedling" | "mature" | "fruiting" | string} props.stage - ระยะการเจริญเติบโต
 * @param {number | null} props.daysUntilNextStage - จำนวนวันที่เหลือก่อนโตขั้นถัดไป
 * @param {"morning" | "afternoon" | "evening"} [props.timeOfDay] - ช่วงเวลาของวัน (optional, auto-detect)
 * @param {() => void} [props.onSeedPlanted] - Callback เมื่อหว่านเมล็ดสำเร็จ
 * @param {string} [props.potSize] - ขนาดกระถาง (optional)
 * @param {boolean} [props.showControls] - แสดงปุ่มเปลี่ยนช่วงเวลาสำหรับทดสอบ (optional)
 * @param {string} [props.className] - คลาสเพิ่มเติม
 * @param {React.CSSProperties} [props.style] - สไตล์เพิ่มเติม
 */
export default function GardenScene({
  plantType = 'chili',
  stage = 'seedling',
  daysUntilNextStage = null,
  timeOfDay,
  onSeedPlanted,
  potSize,
  method = 'pot',
  showControls = false,
  showPlant = true, // เปิดแสดงรูปภาพพืชในสวน
  className = '',
  style = {},
}) {
  // หากไม่ระบุ timeOfDay ให้ตรวจจับอัตโนมัติตามเวลาเครื่อง
  const defaultTime = timeOfDay || getTimeOfDay();
  const [activeTime, setActiveTime] = useState(defaultTime);

  const currentTime = timeOfDay || activeTime;
  const normType = normalizePlantType(plantType);
  const normStage = normalizeStage(stage);

  return (
    <section className={`gs-scene-root ${className}`} style={style}>
      {/* 1. ฉากหลังตามช่วงเวลา (เช้า/เที่ยง/เย็น) */}
      <SceneBackground timeOfDay={currentTime} />

      {/* 2. ป้ายนับถอยหลังการเจริญเติบโต (มุมขวาบนของฉาก) */}
      {showPlant && (
        <div className="gs-hud-top-right">
          <GrowthCountdownBadge
            daysUntilNextStage={daysUntilNextStage}
            stage={normStage}
          />
        </div>
      )}

      {/* 3. ปุ่มเปลี่ยนช่วงเวลา (เปิดใช้งานเมื่อ showControls = true) */}
      {showControls && (
        <div className="gs-hud-top-left">
          <div className="gs-time-toggle-pill">
            <button
              type="button"
              className={`gs-time-btn ${currentTime === 'morning' ? 'active' : ''}`}
              onClick={() => setActiveTime('morning')}
            >
              🌅 เช้า
            </button>
            <button
              type="button"
              className={`gs-time-btn ${currentTime === 'afternoon' ? 'active' : ''}`}
              onClick={() => setActiveTime('afternoon')}
            >
              ☀️ เที่ยง
            </button>
            <button
              type="button"
              className={`gs-time-btn ${currentTime === 'evening' ? 'active' : ''}`}
              onClick={() => setActiveTime('evening')}
            >
              🌇 เย็น
            </button>
          </div>
        </div>
      )}

      {/* 4. ต้นไม้หรือแปลงเพาะเมล็ด กลางจอ (ซ่อนไว้ชั่วคราว แสดงเฉพาะฉากสภาพแวดล้อม) */}
      {showPlant && (
        <div className="gs-stage-hero">
          {normStage === 'seed' ? (
            <SeedPlantingInteraction
              plantType={normType}
              onSeedPlanted={onSeedPlanted}
            />
          ) : (
            <PlantRenderer
              plantType={normType}
              stage={normStage}
              potSize={potSize}
              method={method}
            />
          )}
        </div>
      )}
    </section>
  );
}
