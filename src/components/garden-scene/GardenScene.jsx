import React, { useState } from 'react';
import SceneBackground from './SceneBackground';
import PlantRenderer from './PlantRenderer';
import SeedPlantingInteraction from './SeedPlantingInteraction';
import GrowthCountdownBadge from './GrowthCountdownBadge';
import { getTimeOfDay, normalizePlantType, normalizeStage } from './gardenSceneUtils';
import './GardenScene.css';

export default function GardenScene({
  plantType = 'chili',
  stage = 'seedling',
  daysUntilNextStage = null,
  timeOfDay,
  onSeedPlanted,
  potSize,
  method = 'pot',
  showControls = false,
  showPlant = true,
  className = '',
  style = {},
}) {
  const defaultTime = timeOfDay || getTimeOfDay();
  const [activeTime, setActiveTime] = useState(defaultTime);

  const currentTime = timeOfDay || activeTime;
  const normType = normalizePlantType(plantType);
  const normStage = normalizeStage(stage);

  return (
    <section className={`gs-scene-root ${className}`} style={style}>
      <SceneBackground timeOfDay={currentTime} />

      {showPlant && (
        <div className="gs-hud-top-right">
          <GrowthCountdownBadge
            daysUntilNextStage={daysUntilNextStage}
            stage={normStage}
          />
        </div>
      )}

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
