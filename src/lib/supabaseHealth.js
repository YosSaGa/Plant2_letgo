import { supabase, isSupabaseConfigured } from './supabaseClient';

export async function checkSupabaseHealth() {
  if (!supabase || !isSupabaseConfigured) {
    return {
      connected: false,
      status: 'NOT_CONFIGURED',
      latencyMs: 0,
      latencySec: '0.00',
      plantMasterCount: 0,
      userPlantsCount: 0,
      samplePlants: 'โหมดจำลอง (Local Mock)',
      message: 'ยังไม่ได้ตั้งค่า Supabase URL หรือ Key ในโปรเจกต์',
      timestamp: new Date().toLocaleString('th-TH'),
    };
  }

  const t0 = performance.now();
  try {
    const { data: pmData, error: pmErr } = await supabase
      .from('plant_master')
      .select('*')
      .order('plant_id', { ascending: true })
      .limit(10);

    const t1 = performance.now();
    const latencyMs = Math.max(1, Math.round(t1 - t0));
    const latencySec = (latencyMs / 1000).toFixed(2);

    if (pmErr) {
      return {
        connected: false,
        status: 'ERROR',
        error: pmErr.message,
        latencyMs,
        latencySec,
        plantMasterCount: 0,
        userPlantsCount: 0,
        samplePlants: '-',
        message: `เชื่อมต่อฐานข้อมูลล้มเหลว: ${pmErr.message}`,
        timestamp: new Date().toLocaleString('th-TH'),
      };
    }

    let userPlantsCount = 0;
    try {
      const { count } = await supabase
        .from('user_plants')
        .select('*', { count: 'exact', head: true });
      userPlantsCount = count || 0;
    } catch (_) {}

    const plantNames = pmData?.map((p) => p.name_th).filter(Boolean) || [];
    const samplePlants = plantNames.length > 0 ? plantNames.join(', ') : 'พริก, โหระพา, กะเพรา, มะเขือเทศ, ผักกาดหอม';

    return {
      connected: true,
      status: 'CONNECTED',
      latencyMs,
      latencySec,
      plantMasterCount: pmData?.length || 0,
      userPlantsCount,
      samplePlants,
      rawPlants: pmData || [],
      message: `เชื่อมต่อ Supabase สำเร็จ (ดึง plant_master ได้ ${pmData?.length || 0} ชนิด)`,
      timestamp: new Date().toLocaleString('th-TH'),
    };
  } catch (err) {
    const latencyMs = Math.max(1, Math.round(performance.now() - t0));
    const latencySec = (latencyMs / 1000).toFixed(2);
    return {
      connected: false,
      status: 'EXCEPTION',
      error: err.message,
      latencyMs,
      latencySec,
      plantMasterCount: 0,
      userPlantsCount: 0,
      samplePlants: '-',
      message: `เกิดข้อผิดพลาดในการเรียกใช้ Supabase: ${err.message}`,
      timestamp: new Date().toLocaleString('th-TH'),
    };
  }
}
