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

// Map of which plant images are available (will grow as more are generated)
const AVAILABLE_PLANTS = {
  chili: ['seed', 'seedling', 'mature'],
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
    return `/assets/garden/plants/${plantType}/${method}/${imgStage}.jpg`;
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
      className={`gs-plant-wrapper ${className}`}
      key={`${normType}-${normStage}-${plantMethod}`}
      initial={{ scale: 0.92, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Living Sway Animation on Plant */}
      <motion.div
        className="gs-plant-sway"
        animate={{
          rotate: [-1.4, 1.4, -1.4],
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: 'bottom center' }}
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
