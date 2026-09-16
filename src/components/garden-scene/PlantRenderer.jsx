import React from 'react';
import { motion } from 'framer-motion';
import { normalizePlantType, normalizeStage } from './gardenSceneUtils';

/**
 * PlantRenderer.jsx
 * Renders 2D cartoon plant images from generated JPG assets.
 *
 * Image paths follow:  /assets/garden/plants/{type}/{method}/{stage}.jpg
 * e.g.,  /assets/garden/plants/chili/pot/seedling.jpg
 *
 * If an image is not yet generated (quota limit), falls back to
 * a placeholder gradient box with emoji.
 */

// Map of which plant images are available (all 5 plants 100% complete)
const AVAILABLE_PLANTS = {
  chili: ['seed', 'seedling', 'mature'],
  tomato: ['seed', 'seedling', 'mature'],
  basil: ['seed', 'seedling', 'mature'],
  holyBasil: ['seed', 'seedling', 'mature'],
  lettuce: ['seed', 'seedling', 'mature'],
};

const PLANT_EMOJI = {
  chili: '🌶️',
  basil: '🌱',
  holyBasil: '🌿',
  tomato: '🍅',
  lettuce: '🥬',
};

const PLANT_NAMES = {
  chili: 'พริก',
  basil: 'โหระพา',
  holyBasil: 'กะเพรา',
  tomato: 'มะเขือเทศ',
  lettuce: 'ผักกาดหอม',
};

/**
 * Get the image path for a plant, or null if not available
 */
function getPlantImagePath(plantType, stage, method) {
  const available = AVAILABLE_PLANTS[plantType];
  // Map 'fruiting' to 'mature' for image lookup
  const imgStage = stage === 'fruiting' ? 'mature' : stage;
  
  if (available && available.includes(imgStage)) {
    return `/assets/garden/plants/${plantType}/${method}/${imgStage}.png`;
  }
  return null;
}

/**
 * Fallback placeholder when plant image is not yet generated
 */
function PlantPlaceholder({ plantType, stage }) {
  const emoji = PLANT_EMOJI[plantType] || '🌱';
  const name = PLANT_NAMES[plantType] || plantType;
  
  const sizeByStage = {
    seed: { width: 100, height: 80 },
    seedling: { width: 140, height: 130 },
    mature: { width: 200, height: 200 },
    fruiting: { width: 220, height: 220 },
  };
  const size = sizeByStage[stage] || sizeByStage.seedling;

  return (
    <div
      className="gs-plant-placeholder"
      style={{
        width: size.width,
        height: size.height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(34,197,94,0.1))',
        borderRadius: '16px',
        border: '2px dashed rgba(34,197,94,0.3)',
        gap: 6,
      }}
    >
      <span style={{ fontSize: stage === 'seed' ? 28 : 42 }}>{emoji}</span>
      <span style={{ 
        fontSize: 11, 
        color: '#6b7280', 
        fontWeight: 500,
        textAlign: 'center',
        lineHeight: 1.3 
      }}>
        {name}
        <br />
        <span style={{ fontSize: 10, opacity: 0.7 }}>
          (กำลังสร้างภาพ...)
        </span>
      </span>
    </div>
  );
}

export default function PlantRenderer({ plantType, stage, potSize, method = 'pot', className = '' }) {
  const normType = normalizePlantType(plantType);
  const normStage = normalizeStage(stage);
  
  // Determine method: 'pot' (กระถาง) or 'ground' (ลงดิน)
  const plantMethod = method === 'ลงดิน' || method === 'ground' ? 'ground' : 'pot';
  
  const imgPath = getPlantImagePath(normType, normStage, plantMethod);

  return (
    <motion.div
      className={`gs-plant-wrapper ${plantMethod} ${className}`}
      key={`${normType}-${normStage}-${plantMethod}`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Ground Contact Shadow - locks base firmly to terrain */}
      <div className={`gs-ground-shadow-wrap ${plantMethod}`} aria-hidden="true">
        <div className="gs-ground-shadow-ambient" />
        <div className="gs-ground-shadow-core" />
      </div>

      {/* Living Sway Animation on Plant - Pivots at base without lifting off ground */}
      <motion.div
        className="gs-plant-sway"
        animate={{
          rotate: [-0.9, 0.9, -0.9],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '50% 92%' }}
      >
        {imgPath ? (
          <img
            src={imgPath}
            alt={`${PLANT_NAMES[normType] || normType} - ${normStage}`}
            className="gs-plant-image"
            draggable={false}
          />
        ) : (
          <PlantPlaceholder plantType={normType} stage={normStage} />
        )}
      </motion.div>
    </motion.div>
  );
}
