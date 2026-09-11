/**
 * gardenSceneUtils.js
 * Helpers and config lookups for the Garden Scene component.
 */

/**
 * Returns 'morning' | 'afternoon' | 'evening' based on user's current clock.
 * - 05:00 - 11:59 => morning
 * - 12:00 - 16:59 => afternoon
 * - 17:00 - 04:59 => evening
 */
export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Normalizes any Thai/English plant name to canonical PlantType:
 * 'chili' | 'basil' | 'holyBasil' | 'tomato' | 'lettuce'
 */
export function normalizePlantType(rawType) {
  if (!rawType) return 'chili';
  const str = String(rawType).trim().toLowerCase();
  
  if (str.includes('พริก') || str.includes('chili') || str.includes('pepper')) return 'chili';
  if (str.includes('กะเพรา') || str.includes('holy') || str.includes('holybasil')) return 'holyBasil';
  if (str.includes('โหระพา') || str.includes('basil') || str.includes('sweetbasil')) return 'basil';
  if (str.includes('มะเขือเทศ') || str.includes('tomato')) return 'tomato';
  if (str.includes('ผักกาด') || str.includes('หอม') || str.includes('lettuce') || str.includes('สลัด')) return 'lettuce';
  
  return 'chili';
}

/**
 * Normalizes any Thai/English growth stage to canonical GrowthStage:
 * 'seed' | 'seedling' | 'mature' | 'fruiting'
 */
export function normalizeStage(rawStage) {
  if (!rawStage) return 'seedling';
  const str = String(rawStage).trim().toLowerCase();
  
  if (str.includes('เมล็ด') || str === 'seed') return 'seed';
  if (str.includes('กล้า') || str === 'seedling') return 'seedling';
  if (str.includes('ออกผล') || str.includes('ติดผล') || str.includes('ดอก') || str === 'fruiting' || str === 'harvest') return 'fruiting';
  if (str.includes('โต') || str.includes('วัย') || str === 'mature') return 'mature';
  
  return 'seedling';
}

/**
 * Thai labels and meta for each plant
 */
export const PLANT_CONFIG = {
  chili: {
    nameTh: 'พริก',
    nameEn: 'Chili Pepper',
    emoji: '🌶️',
    stageDays: { seed: 7, seedling: 25, mature: 35, fruiting: 0 },
    color: '#ef4444',
  },
  basil: {
    nameTh: 'โหระพา',
    nameEn: 'Sweet Basil',
    emoji: '🌱',
    stageDays: { seed: 5, seedling: 20, mature: 25, fruiting: 0 },
    color: '#10b981',
  },
  holyBasil: {
    nameTh: 'กะเพรา',
    nameEn: 'Holy Basil',
    emoji: '🌿',
    stageDays: { seed: 5, seedling: 20, mature: 25, fruiting: 0 },
    color: '#059669',
  },
  tomato: {
    nameTh: 'มะเขือเทศ',
    nameEn: 'Tomato',
    emoji: '🍅',
    stageDays: { seed: 8, seedling: 30, mature: 40, fruiting: 0 },
    color: '#f97316',
  },
  lettuce: {
    nameTh: 'ผักกาดหอม',
    nameEn: 'Lettuce',
    emoji: '🥬',
    stageDays: { seed: 4, seedling: 15, mature: 25, fruiting: 0 },
    color: '#84cc16',
  },
};

/**
 * Stage labels in Thai
 */
export const STAGE_CONFIG = {
  seed: { label: 'ระยะเมล็ด', nextLabel: 'ต้นกล้า' },
  seedling: { label: 'ระยะต้นกล้า', nextLabel: 'โตเต็มวัย' },
  mature: { label: 'ระยะโตเต็มวัย', nextLabel: 'ออกดอก/ผล' },
  fruiting: { label: 'ระยะออกผล', nextLabel: 'พร้อมเก็บเกี่ยว' },
};

/**
 * Calculates estimated days until next stage if not provided directly.
 */
export function calcDefaultDaysUntilNext(plantType, stage, plantedDate) {
  const normType = normalizePlantType(plantType);
  const normStage = normalizeStage(stage);
  
  if (normStage === 'fruiting') return 0;
  if (normStage === 'seed') return 5;
  
  const config = PLANT_CONFIG[normType] || PLANT_CONFIG.chili;
  const targetDays = config.stageDays[normStage] || 15;
  
  if (!plantedDate) return targetDays;
  
  const start = new Date(plantedDate).getTime();
  const now = Date.now();
  const elapsedDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  
  return Math.max(1, targetDays - elapsedDays);
}
