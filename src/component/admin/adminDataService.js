import { supabase } from '../../lib/supabaseClient';

const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export function formatThaiDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export async function fetchAdminSummary() {
  if (!supabase) {
    return { totalUsers: 0, userGrowth: '0%', totalPlants: 0, totalDetections: 0 };
  }

  try {
    const [usersRes, plantsRes, detectionsRes] = await Promise.all([
      supabase.from('profiles').select('id, created_at', { count: 'exact' }),
      supabase.from('user_plants').select('amount'),
      supabase.from('disease_checks').select('check_id', { count: 'exact', head: true }),
    ]);

    const totalUsers = usersRes.count || usersRes.data?.length || 0;
    const totalPlants = (plantsRes.data || []).reduce((sum, item) => sum + Number(item.amount || 1), 0);
    const totalDetections = detectionsRes.count || 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = (usersRes.data || []).filter((u) => new Date(u.created_at) >= thirtyDaysAgo).length;
    const userGrowth = totalUsers > 0 ? `+${Math.round((recentUsers / totalUsers) * 100)}%` : '0%';

    return {
      totalUsers,
      userGrowth,
      totalPlants,
      totalDetections,
    };
  } catch (error) {
    console.error('fetchAdminSummary error:', error);
    return { totalUsers: 0, userGrowth: '0%', totalPlants: 0, totalDetections: 0 };
  }
}

export async function fetchRegistrationSeries() {
  const defaultSeries = {
    '7 วัน': [
      { label: 'จ.', total: 0 }, { label: 'อ.', total: 0 }, { label: 'พ.', total: 0 },
      { label: 'พฤ.', total: 0 }, { label: 'ศ.', total: 0 }, { label: 'ส.', total: 0 }, { label: 'อา.', total: 0 },
    ],
    '30 วัน': [
      { label: '1-5', total: 0 }, { label: '6-10', total: 0 }, { label: '11-15', total: 0 },
      { label: '16-20', total: 0 }, { label: '21-25', total: 0 }, { label: '26-30', total: 0 },
    ],
    รายเดือน: thaiMonths.slice(-6).map((m) => ({ label: m, total: 0 })),
  };

  if (!supabase) return defaultSeries;

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error || !users || users.length === 0) return defaultSeries;

    const now = new Date();

    const weekMap = { 'จ.': 0, 'อ.': 0, 'พ.': 0, 'พฤ.': 0, 'ศ.': 0, 'ส.': 0, 'อา.': 0 };
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const monthBins = [
      { label: '1-5 วัน', min: 0, max: 5, total: 0 },
      { label: '6-10 วัน', min: 6, max: 10, total: 0 },
      { label: '11-15 วัน', min: 11, max: 15, total: 0 },
      { label: '16-20 วัน', min: 16, max: 20, total: 0 },
      { label: '21-25 วัน', min: 21, max: 25, total: 0 },
      { label: '26-30 วัน', min: 26, max: 30, total: 0 },
    ];

    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = thaiMonths[d.getMonth()];
      monthlyMap[mLabel] = 0;
    }

    users.forEach((user) => {
      if (!user.created_at) return;
      const uDate = new Date(user.created_at);

      if (uDate >= sevenDaysAgo) {
        const dayName = thaiDays[uDate.getDay()];
        if (weekMap[dayName] !== undefined) weekMap[dayName]++;
      }

      const diffDays = Math.floor((now.getTime() - uDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 0 && diffDays <= 30) {
        const bin = monthBins.find((b) => diffDays >= b.min && diffDays <= b.max);
        if (bin) bin.total++;
      }

      const monthLabel = thaiMonths[uDate.getMonth()];
      if (monthlyMap[monthLabel] !== undefined) {
        monthlyMap[monthLabel]++;
      }
    });

    return {
      '7 วัน': Object.keys(weekMap).map((label) => ({ label, total: weekMap[label] })),
      '30 วัน': monthBins.map((b) => ({ label: b.label, total: b.total })),
      รายเดือน: Object.keys(monthlyMap).map((label) => ({ label, total: monthlyMap[label] })),
    };
  } catch (err) {
    console.error('fetchRegistrationSeries error:', err);
    return defaultSeries;
  }
}

export const defaultDiseaseRankings = [
  { name: 'โรคใบจุด (Leaf Spot)', total: 6 },
  { name: 'โรคใบหงิกเหลือง (Leaf Curl)', total: 4 },
  { name: 'โรคราน้ำค้าง (Downy Mildew)', total: 3 },
  { name: 'รอยแผลจากแมลงกัดแทะ (Insect Bite)', total: 3 },
  { name: 'โรคใบจุดจากเชื้อรา (Fungal Leaf Spot)', total: 2 },
  { name: 'โรคใบไหม้ระยะต้น (Early Blight)', total: 2 },
  { name: 'โรคจากแบคทีเรีย (Bacterial Disease)', total: 2 },
];

export async function fetchDiseaseRankings() {
  if (!supabase) return defaultDiseaseRankings;

  try {
    const { data, error } = await supabase
      .from('disease_checks')
      .select('detected_disease');

    if (error || !data || data.length === 0) return defaultDiseaseRankings;

    const frequencyMap = {};
    data.forEach((row) => {
      const disease = row.detected_disease?.trim() || '';
      if (!disease) return;
      if (
        disease.includes('ปกติ') ||
        disease.includes('Healthy') ||
        disease.includes('ไม่พบโรค') ||
        disease.includes('ไม่ระบุ') ||
        disease.includes('ไม่ใช่ใบพืช')
      ) {
        return;
      }
      frequencyMap[disease] = (frequencyMap[disease] || 0) + 1;
    });

    const list = Object.entries(frequencyMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    return list.length > 0 ? list : defaultDiseaseRankings;
  } catch (err) {
    console.error('fetchDiseaseRankings error:', err);
    return defaultDiseaseRankings;
  }
}

export async function fetchPlantStatistics() {
  const defaultResult = {
    plantTotals: [],
    plantingMethods: [
      { name: 'กระถาง', value: 0, total: 0, color: '#10b981' },
      { name: 'ลงดิน', value: 0, total: 0, color: '#84cc16' },
    ],
  };

  if (!supabase) return defaultResult;

  try {
    const [userPlantsRes, mastersRes] = await Promise.all([
      supabase.from('user_plants').select('amount, planting_method, plant_id, plant_master(name_th)'),
      supabase.from('plant_master').select('plant_id, name_th'),
    ]);

    const userPlants = userPlantsRes.data || [];
    const masters = mastersRes.data || [];

    const masterMap = {};
    masters.forEach((m) => {
      masterMap[m.plant_id] = m.name_th;
    });

    const typeCounts = {};
    masters.forEach((m) => {
      typeCounts[m.name_th] = 0;
    });

    let potCount = 0;
    let groundCount = 0;

    userPlants.forEach((item) => {
      const name = item.plant_master?.name_th || masterMap[item.plant_id] || 'พืชอื่น ๆ';
      const amt = Number(item.amount || 1);
      typeCounts[name] = (typeCounts[name] || 0) + amt;

      if (item.planting_method === 'ลงดิน') {
        groundCount += amt;
      } else {
        potCount += amt;
      }
    });

    const plantTotals = Object.entries(typeCounts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const totalMethods = potCount + groundCount;
    const potPercent = totalMethods > 0 ? Math.round((potCount / totalMethods) * 100) : 0;
    const groundPercent = totalMethods > 0 ? 100 - potPercent : 0;

    const plantingMethods = [
      { name: 'กระถาง', value: potPercent, total: potCount, color: '#10b981' },
      { name: 'ลงดิน', value: groundPercent, total: groundCount, color: '#84cc16' },
    ];

    return { plantTotals, plantingMethods };
  } catch (err) {
    console.error('fetchPlantStatistics error:', err);
    return defaultResult;
  }
}

export async function fetchAdminUsersList() {
  if (!supabase) return [];

  try {
    const [usersRes, plantsRes, checksRes] = await Promise.all([
      supabase.from('profiles').select('id, display_name, email, role, province, district, created_at').order('created_at', { ascending: false }),
      supabase.from('user_plants').select('user_id, amount'),
      supabase.from('disease_checks').select('user_id'),
    ]);

    const users = usersRes.data || [];
    const plants = plantsRes.data || [];
    const checks = checksRes.data || [];

    const plantCountMap = {};
    plants.forEach((p) => {
      if (p.user_id) plantCountMap[p.user_id] = (plantCountMap[p.user_id] || 0) + Number(p.amount || 1);
    });

    const checkCountMap = {};
    checks.forEach((c) => {
      if (c.user_id) checkCountMap[c.user_id] = (checkCountMap[c.user_id] || 0) + 1;
    });

    return users.map((u) => [
      u.display_name || u.email?.split('@')[0] || 'ผู้ใช้งาน',
      u.email || '-',
      formatThaiDate(u.created_at),
      `${plantCountMap[u.id] || 0} ต้น`,
      `${checkCountMap[u.id] || 0} ครั้ง`,
    ]);
  } catch (err) {
    console.error('fetchAdminUsersList error:', err);
    return [];
  }
}

export async function fetchAdminPlantsList() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('user_plants')
      .select('user_plant_id, growth_stage, planting_method, pot_size, amount, planted_date, plant_master(name_th, icon), profiles(display_name, email)')
      .order('planted_date', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => {
      const plantName = item.plant_master?.name_th ? `${item.plant_master.icon || '🌱'} ${item.plant_master.name_th}` : 'พืชไม่ระบุ';
      const ownerName = item.profiles?.display_name || item.profiles?.email || 'ผู้ใช้ทั่วไป';
      const method = item.planting_method === 'กระถาง' && item.pot_size ? `กระถาง ${item.pot_size}` : (item.planting_method || 'กระถาง');
      return [
        plantName,
        ownerName,
        method,
        item.growth_stage || 'ต้นกล้า',
        formatThaiDate(item.planted_date),
      ];
    });
  } catch (err) {
    console.error('fetchAdminPlantsList error:', err);
    return [];
  }
}

export async function fetchAdminDiseaseReports() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('disease_checks')
      .select('check_id, detected_disease, confidence_score, checked_at, plant_master(name_th), profiles(display_name, email)')
      .order('checked_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => {
      const plantName = item.plant_master?.name_th || 'พืชที่ตรวจ';
      const diseaseName = item.detected_disease || 'ไม่พบโรค/ปกติ';
      const confidence = item.confidence_score ? `${Math.round(item.confidence_score * (item.confidence_score <= 1 ? 100 : 1))}%` : '85%';
      const severity = item.confidence_score > 0.8 ? 'สูง' : item.confidence_score > 0.5 ? 'ปานกลาง' : 'ต่ำ';
      return [
        plantName,
        diseaseName,
        severity,
        confidence,
        formatThaiDate(item.checked_at),
      ];
    });
  } catch (err) {
    console.error('fetchAdminDiseaseReports error:', err);
    return [];
  }
}

export async function fetchPlantMasterList() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('plant_master')
    .select('*')
    .order('plant_id', { ascending: true });

  if (error) {
    console.error('fetchPlantMasterList error:', error);
    return [];
  }

  return (data || []).map((p) => {
    const isHidden = p.is_active === false || p.status === 'ซ่อนไว้' || p.status === 'ปิดใช้งาน' || p.category?.includes('(ซ่อนไว้)') || p.category?.includes('[HIDDEN]');
    const cleanCategory = (p.category || 'พืชผักสวนครัวยอดนิยม').replace(' (ซ่อนไว้)', '').replace('(ซ่อนไว้)', '').trim();

    return {
      id: p.plant_id,
      emoji: p.icon || '🌱',
      name: p.name_th,
      nameEn: p.name_en,
      category: cleanCategory,
      scientificName: p.scientific_name || '',
      status: isHidden ? 'ซ่อนไว้' : 'เปิดใช้งาน',
    };
  });
}

export async function insertPlantMaster(plant) {
  if (!supabase) return null;

  // 1. หาค่า plant_id สูงสุดในตาราง เพื่อป้องกัน duplicate key error จาก sequence ไม่ตรงกับข้อมูลเริ่มต้น
  const { data: maxRow } = await supabase
    .from('plant_master')
    .select('plant_id')
    .order('plant_id', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextId = (maxRow?.plant_id ? Number(maxRow.plant_id) : 0) + 1;
  const isHidden = plant.status === 'ซ่อนไว้' || plant.status === 'ปิดใช้งาน';
  let category = plant.category || 'พืชผักสวนครัวยอดนิยม';
  if (isHidden && !category.includes('(ซ่อนไว้)')) {
    category = `${category} (ซ่อนไว้)`;
  }

  const basePayload = {
    plant_id: nextId,
    name_th: plant.name,
    name_en: plant.nameEn || plant.name,
    scientific_name: plant.scientificName || '-',
    category: category,
    icon: plant.emoji || '🌱',
  };

  try {
    const { data, error } = await supabase
      .from('plant_master')
      .insert({
        ...basePayload,
        is_active: !isHidden,
        status: isHidden ? 'ซ่อนไว้' : 'เปิดใช้งาน',
      })
      .select()
      .single();

    if (!error && data) return data;
  } catch (_) {
    // Fallback if is_active or status columns do not exist yet
  }

  const { data, error } = await supabase
    .from('plant_master')
    .insert(basePayload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlantMaster(id, plant) {
  if (!supabase) return null;

  const isHidden = plant.status === 'ซ่อนไว้' || plant.status === 'ปิดใช้งาน';
  let category = plant.category || 'พืชผักสวนครัวยอดนิยม';
  if (isHidden) {
    if (!category.includes('(ซ่อนไว้)')) {
      category = `${category} (ซ่อนไว้)`;
    }
  } else {
    category = category.replace(' (ซ่อนไว้)', '').replace('(ซ่อนไว้)', '').trim();
  }

  const basePayload = {
    name_th: plant.name,
    name_en: plant.nameEn || plant.name,
    scientific_name: plant.scientificName || '-',
    category: category,
    icon: plant.emoji,
  };

  try {
    const { data, error } = await supabase
      .from('plant_master')
      .update({
        ...basePayload,
        is_active: !isHidden,
        status: isHidden ? 'ซ่อนไว้' : 'เปิดใช้งาน',
      })
      .eq('plant_id', id)
      .select()
      .single();

    if (!error && data) return data;
  } catch (_) {
    // Fallback if is_active or status columns do not exist yet
  }

  const { data, error } = await supabase
    .from('plant_master')
    .update(basePayload)
    .eq('plant_id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePlantMaster(id) {
  if (!supabase) return;
  const { error } = await supabase
    .from('plant_master')
    .delete()
    .eq('plant_id', id);

  if (error) throw error;
}
