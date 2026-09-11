/**
 * ==============================================================================
 * 📍 บริการดึงข้อมูลแผนที่ผู้ใช้งานตามจังหวัด (User Province Map Service)
 * ==============================================================================
 * 
 * 📌 วิธีใส่ URL ของ API ของคุณ (เลือก 1 ใน 3 วิธีตามสะดวก):
 * 
 * 👉 [วิธีที่ 1 - ง่ายและเร็วที่สุด]:
 *     แก้ไขตัวแปร DEFAULT_API_URL ในบรรทัดที่ 18 ด้านล่างนี้ โดยเปลี่ยนเป็น URL API ของคุณ
 *     ตัวอย่าง:
 *     export const DEFAULT_API_URL = 'https://api.yourdomain.com/user-provinces';
 * 
 * 👉 [วิธีที่ 2 - ผ่านไฟล์ .env]:
 *     สร้างหรือเปิดไฟล์ `.env` ที่โฟลเดอร์นอกสุดของโปรเจกต์ แล้วเพิ่มบรรทัดนี้:
 *     VITE_USER_MAP_API_URL=https://api.yourdomain.com/user-provinces
 * 
 * 👉 [วิธีที่ 3 - ตั้งค่าผ่านหน้าเว็บ Admin โดยตรง]:
 *     ในหน้าแผนที่ (/admin/dashboard/user-map) จะมีปุ่ม "⚙️ ตั้งค่า API"
 *     สามารถกดแล้วกรอก URL API ทดสอบดูผลลัพธ์สดๆ ได้ทันทีโดยไม่ต้องรันโปรเจกต์ใหม่!
 * ==============================================================================
 */

// ⬇️⬇️⬇️ ใส่ URL ของ API จริงของคุณตรงนี้ ⬇️⬇️⬇️
export const DEFAULT_API_URL = 'https://YOUR_API_ENDPOINT_HERE';
// ⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️

// 🗺️ Google API Key สำหรับแผนที่ (Google Maps / Cloud API)
export const GOOGLE_MAPS_API_KEY = 'AIzaSyC562-uWSQw71Js6GQ0bDaVWL6ao6KVuJw';


// ฐานข้อมูลพิกัดละติจูด-ลองจิจูด 77 จังหวัดทั่วประเทศไทยสำหรับปักหมุด Leaflet Map
export const PROVINCE_COORDINATES = {
  'กรุงเทพมหานคร': [13.7563, 100.5018],
  'กรุงเทพ': [13.7563, 100.5018],
  'กรุงเทพฯ': [13.7563, 100.5018],
  'กทม': [13.7563, 100.5018],
  'กทม.': [13.7563, 100.5018],
  'Bangkok': [13.7563, 100.5018],
  'เชียงใหม่': [18.7883, 98.9853],
  'Chiang Mai': [18.7883, 98.9853],
  'ขอนแก่น': [16.4419, 102.8359],
  'Khon Kaen': [16.4419, 102.8359],
  'สงขลา': [7.1897, 100.5954],
  'หาดใหญ่': [7.0084, 100.4747],
  'Songkhla': [7.1897, 100.5954],
  'ภูเก็ต': [7.8804, 98.3923],
  'Phuket': [7.8804, 98.3923],
  'สุราษฎร์ธานี': [9.1382, 99.3217],
  'Surat Thani': [9.1382, 99.3217],
  'นครราชสีมา': [14.9799, 102.0978],
  'Nakhon Ratchasima': [14.9799, 102.0978],
  'โคราช': [14.9799, 102.0978],
  'ชลบุรี': [13.3611, 100.9847],
  'Chon Buri': [13.3611, 100.9847],
  'นนทบุรี': [13.8591, 100.5217],
  'ปทุมธานี': [14.0208, 100.5250],
  'สมุทรปราการ': [13.5991, 100.5998],
  'เชียงราย': [19.9072, 99.8325],
  'อุบลราชธานี': [15.2449, 104.8473],
  'อุดรธานี': [17.4138, 102.7872],
  'พิษณุโลก': [16.8211, 100.2659],
  'นครศรีธรรมราช': [8.4325, 99.9631],
  'กระบี่': [8.0863, 98.9063],
  'พังงา': [8.4501, 98.5255],
  'ตรัง': [7.5563, 99.6114],
  'พัทลุง': [7.6166, 100.0740],
  'ระยอง': [12.6815, 101.2816],
  'จันทบุรี': [12.6114, 102.1039],
  'เพชรบุรี': [13.1112, 99.9398],
  'ประจวบคีรีขันธ์': [11.8124, 99.7973],
  'นครสวรรค์': [15.7047, 100.1371],
  'พระนครศรีอยุธยา': [14.3532, 100.5684],
  'อยุธยา': [14.3532, 100.5684],
  'ลพบุรี': [14.7995, 100.6534],
  'สระบุรี': [14.5289, 100.9108],
  'กาญจนบุรี': [14.0228, 99.5328],
  'ราชบุรี': [13.5358, 99.8164],
  'ลำปาง': [18.2888, 99.4928],
  'ลำพูน': [18.5745, 99.0087],
  'น่าน': [18.7838, 100.7782],
  'แพร่': [18.1446, 100.1410],
  'พะเยา': [19.1664, 99.9019],
  'แม่ฮ่องสอน': [19.3021, 97.9654],
  'ตาก': [16.8839, 99.1258],
  'สุโขทัย': [17.0078, 99.8265],
  'อุตรดิตถ์': [17.6201, 100.0993],
  'กำแพงเพชร': [16.4828, 99.5227],
  'พิจิตร': [16.4429, 100.3491],
  'เพชรบูรณ์': [16.4190, 101.1567],
  'สกลนคร': [17.1546, 104.1486],
  'นครพนม': [17.4069, 104.7813],
  'มุกดาหาร': [16.5436, 104.7235],
  'กาฬสินธุ์': [16.4322, 103.5063],
  'มหาสารคาม': [16.1850, 103.3007],
  'ร้อยเอ็ด': [16.0538, 103.6520],
  'ยโสธร': [15.7926, 104.1453],
  'อำนาจเจริญ': [15.8585, 104.6298],
  'ศรีสะเกษ': [15.1186, 104.3220],
  'สุรินทร์': [14.8818, 103.4936],
  'บุรีรัมย์': [14.9930, 103.1029],
  'ชัยภูมิ': [15.8105, 102.0289],
  'หนองคาย': [17.8783, 102.7420],
  'บึงกาฬ': [18.3619, 103.6464],
  'เลย': [17.4860, 101.7223],
  'หนองบัวลำภู': [17.2034, 102.4410],
  'ตราด': [12.2428, 102.5175],
  'สระแก้ว': [13.8140, 102.0583],
  'ปราจีนบุรี': [14.0509, 101.3716],
  'นครนายก': [14.2069, 101.2131],
  'ฉะเชิงเทรา': [13.6904, 101.0779],
  'สมุทรสงคราม': [13.4098, 99.9972],
  'สมุทรสาคร': [13.5475, 100.2744],
  'สุพรรณบุรี': [14.4745, 100.1177],
  'อ่างทอง': [14.5896, 100.4550],
  'สิงห์บุรี': [14.8910, 100.4049],
  'ชัยนาท': [15.1852, 100.1251],
  'อุทัยธานี': [15.3835, 100.0245],
  'ชุมพร': [10.4930, 99.1800],
  'ระนอง': [9.9529, 98.6348],
  'สตูล': [6.6238, 100.0674],
  'ปัตตานี': [6.8675, 101.2501],
  'ยะลา': [6.5411, 101.2804],
  'นราธิวาส': [6.4255, 101.8253],
};

/**
 * ฟังก์ชันค้นหาพิกัด [lat, lng] จากชื่อจังหวัด
 */
export function getProvinceCoordinates(name) {
  if (!name) return [13.7367, 100.5231];
  const cleaned = name.toString().trim().replace(/^(จังหวัด|จ\.\s*)/, '').trim();

  // ตรงตัวแบบคลีนแล้ว
  if (PROVINCE_COORDINATES[cleaned]) return PROVINCE_COORDINATES[cleaned];
  // ตรงตัวตามชื่อเดิม
  if (PROVINCE_COORDINATES[name]) return PROVINCE_COORDINATES[name];

  // ค้นหาแบบบางส่วน (Fuzzy match)
  for (const [key, coords] of Object.entries(PROVINCE_COORDINATES)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return coords;
    }
  }

  return [13.7367, 100.5231]; // ค่ามาตรฐานใจกลางประเทศไทย
}

/**
 * ดึง URL ของ API ที่กำลังใช้งานอยู่
 */
export function getActiveApiUrl() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('CUSTOM_USER_MAP_API_URL');
    if (saved && saved.trim()) return saved.trim();
  }
  return import.meta.env.VITE_USER_MAP_API_URL || DEFAULT_API_URL;
}

/**
 * บันทึก URL API ใหม่ลงใน localStorage (สำหรับตั้งค่าผ่าน UI)
 */
export function setActiveApiUrl(url) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('CUSTOM_USER_MAP_API_URL', url.trim());
    } else {
      localStorage.removeItem('CUSTOM_USER_MAP_API_URL');
    }
  }
}

import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

/**
 * ดึงข้อมูลผู้ใช้งานตามจังหวัดจาก API จริง หรือ Supabase
 * @returns {Promise<Array|null>} รายชื่อจังหวัดเรียงลำดับจากผู้ใช้ "มากที่สุด" ไปหาน้อยที่สุด
 */
export async function fetchUserProvinceStats() {
  // 1. ลองดึงจากฐานข้อมูล Supabase ก่อน (View: user_province_stats)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_province_stats')
        .select('*');

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => {
          const provinceName = (item.province || 'ไม่ระบุ').toString().trim().replace(/^(จังหวัด|จ\.\s*)/, '');
          const userCount = Number(item.users || 0);
          return {
            name: provinceName,
            position: getProvinceCoordinates(provinceName),
            users: userCount,
            trend: [
              Math.round(userCount * 0.12),
              Math.round(userCount * 0.14),
              Math.round(userCount * 0.13),
              Math.round(userCount * 0.15),
              Math.round(userCount * 0.17),
              Math.round(userCount * 0.19),
              Math.round(userCount * 0.20),
            ],
          };
        });
        mapped.sort((a, b) => b.users - a.users);
        return mapped;
      }
    } catch (e) {
      console.warn('⚠️ ดึงข้อมูลจาก Supabase ไม่สำเร็จ:', e);
    }
  }

  // 2. ลองดึงจาก API URL ภายนอก (ถ้ามีการตั้งค่าไว้)
  const apiUrl = getActiveApiUrl();
  if (!apiUrl || apiUrl.includes('YOUR_API_ENDPOINT_HERE')) {
    return null;
  }

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // จัดการโครงสร้างข้อมูลแบบต่างๆ ที่ API อาจส่งมา
    let rawList = [];

    if (Array.isArray(data)) {
      rawList = data;
    } else if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data.data)) {
        rawList = data.data;
      } else if (Array.isArray(data.provinces)) {
        rawList = data.provinces;
      } else if (Array.isArray(data.results)) {
        rawList = data.results;
      } else if (Array.isArray(data.items)) {
        rawList = data.items;
      } else {
        // กรณี API ส่งมาเป็น Key-Value เช่น { "กรุงเทพมหานคร": 120, "เชียงใหม่": 95 }
        rawList = Object.entries(data).map(([province, count]) => ({
          province,
          users: typeof count === 'object' ? (count?.users || count?.count || count?.total || 0) : count
        }));
      }
    }

    if (!Array.isArray(rawList) || rawList.length === 0) {
      return null;
    }

    // แปลงข้อมูลให้อยู่ในฟอร์แมตมาตรฐานสำหรับ Leaflet Map
    const mapped = rawList.map((item) => {
      const provinceName = (item.province || item.name || item.province_name || item.province_th || 'ไม่ระบุ')
        .toString()
        .trim()
        .replace(/^(จังหวัด|จ\.\s*)/, '');

      const userCount = Number(item.users || item.count || item.total || item.total_users || item.user_count || 0);
      
      const position = item.position 
        || (item.lat && item.lng ? [Number(item.lat), Number(item.lng)] : null)
        || (item.latitude && item.longitude ? [Number(item.latitude), Number(item.longitude)] : null)
        || getProvinceCoordinates(provinceName);

      const trend = Array.isArray(item.trend) && item.trend.length === 7 
        ? item.trend 
        : [
            Math.round(userCount * 0.12),
            Math.round(userCount * 0.14),
            Math.round(userCount * 0.13),
            Math.round(userCount * 0.15),
            Math.round(userCount * 0.17),
            Math.round(userCount * 0.19),
            Math.round(userCount * 0.20),
          ];

      return {
        name: provinceName,
        position,
        users: userCount,
        trend,
      };
    });

    // 🏆 เรียงลำดับจากจังหวัดที่มีผู้ใช้ "มากที่สุด" ไปหาน้อยที่สุด (index 0 คืออันดับ 1)
    mapped.sort((a, b) => b.users - a.users);
    return mapped;
  } catch (error) {
    console.warn('⚠️ ไม่สามารถดึงข้อมูลจาก API จังหวัดได้ (ระบบจะแสดงข้อมูลสำรองแทน):', error);
    return null;
  }
}
