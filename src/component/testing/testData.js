/**
 * testData.js
 * Comprehensive Test Matrix & Scenarios for PlookPloen System Testing & QA Portal
 * Corresponds to Thesis chapters 4 & 5 (Software Engineering System Testing)
 */

export const MODULE_INFO = {
  all: { id: 'all', label: 'ทั้งหมด (All Modules)', icon: '📋', color: '#059669' },
  auth: { id: 'auth', label: 'ระบบจัดการสิทธิ์และผู้ใช้ (Auth & Guard)', icon: '🔐', color: '#0284c7' },
  plant: { id: 'plant', label: 'ระบบบันทึกและการจัดการพืช (Plant Engine)', icon: '🌱', color: '#16a34a' },
  garden: { id: 'garden', label: 'ระบบจำลองสภาพแวดล้อม 2D (Garden Scene)', icon: '🏡', color: '#854d0e' },
  weather: { id: 'weather', label: 'ระบบวิเคราะห์อากาศและคำนวณน้ำ (Weather & Water)', icon: '#0891b2', color: '#0891b2' },
  admin: { id: 'admin', label: 'ระบบผู้ดูแลระบบ (Admin & Telemetry)', icon: '👑', color: '#7c3aed' },
  ai: { id: 'ai', label: 'ระบบปัญญาประดิษฐ์ตรวจโรคพืช (AI Disease Model)', icon: '🔬', color: '#dc2626' }
};

export const BLACK_BOX_TEST_CASES = [
  // ===================== MODULE 1: AUTHENTICATION =====================
  {
    id: 'TC-AUTH-01',
    module: 'auth',
    moduleName: 'Authentication',
    title: 'การเข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ถูกต้อง',
    steps: '1. ไปที่หน้า /login\n2. กรอกอีเมลและรหัสผ่านที่มีในระบบ\n3. กดปุ่ม "เข้าสู่ระบบ"',
    expected: 'เข้าสู่ระบบสำเร็จ ระบบบันทึก Session ใน Supabase และนำทางไปยังหน้า /add-plant หรือ /summary',
    actual: 'เข้าสู่ระบบสำเร็จ แสดง Badge ข้อมูลผู้ใช้มุมบนขวา และนำทางถูกต้อง',
    status: 'PASS',
    severity: 'High',
    type: 'Functional'
  },
  {
    id: 'TC-AUTH-02',
    module: 'auth',
    moduleName: 'Authentication',
    title: 'การเข้าสู่ระบบด้วยรหัสผ่านไม่ถูกต้อง (Negative Test)',
    steps: '1. ไปที่หน้า /login\n2. กรอกอีเมลถูกต้อง แต่ใส่รหัสผ่านผิด\n3. กดปุ่ม "เข้าสู่ระบบ"',
    expected: 'ระบบแสดงข้อความแจ้งเตือน "อีเมลหรือรหัสผ่านไม่ถูกต้อง" และไม่อนุญาตให้เข้าสู่ระบบ',
    actual: 'แสดงกล่องเตือนสีแดง ข้อความตรงตามที่คาดหวัง และยังคงอยู่ที่หน้าเดิม',
    status: 'PASS',
    severity: 'High',
    type: 'Negative'
  },
  {
    id: 'TC-AUTH-03',
    module: 'auth',
    moduleName: 'Authentication',
    title: 'การสมัครสมาชิกใหม่พร้อมบันทึกจังหวัด',
    steps: '1. ไปที่หน้า /register\n2. กรอกชื่อผู้ใช้, อีเมล, รหัสผ่าน 6+ ตัวอักษร, เลือกจังหวัด\n3. กด "สมัครสมาชิก"',
    expected: 'สร้าง User ใน Supabase Auth และบันทึกลงตาราง profiles พร้อมล็อกอินอัตโนมัติ',
    actual: 'ข้อมูลถูกบันทึกสำเร็จ แสดงชื่อและจังหวัดที่เลือกที่ Header มุมขวาบน',
    status: 'PASS',
    severity: 'High',
    type: 'Functional'
  },
  {
    id: 'TC-AUTH-04',
    module: 'auth',
    moduleName: 'Authentication',
    title: 'การป้องกันหน้าเพิ่มพืชเมื่อยังไม่เข้าสู่ระบบ (Route Guard)',
    steps: '1. เคลียร์ Session หรือเปิดโหมดไม่ระบุตัวตน\n2. พิมพ์ URL เข้าไปที่ /add-plant',
    expected: 'ระบบตรวจสอบสถานะพบว่ายังไม่ล็อกอิน และรีไดเร็กต์ไปยังหน้า /login ทันที',
    actual: 'ระบบเด้งไปที่หน้า /login พร้อมแสดงช่องกรอกข้อมูลเข้าสู่ระบบ',
    status: 'PASS',
    severity: 'Critical',
    type: 'Security'
  },
  {
    id: 'TC-AUTH-05',
    module: 'auth',
    moduleName: 'Authentication',
    title: 'การออกจากระบบ (Logout) และล้าง Session',
    steps: '1. เข้าสู่ระบบแล้วคลิกที่ Badge ผู้ใช้มุมบนขวา\n2. กดปุ่ม "ออกจากระบบ"',
    expected: 'ล้าง Supabase Auth Session, ป้ายชื่อผู้ใช้หายไป และเปลี่ยนเส้นทางกลับสู่หน้าแรก /',
    actual: 'ล้าง Session ทันที Header กลับเป็นสถานะผู้เยี่ยมชม และกลับสู่หน้า Landing Page',
    status: 'PASS',
    severity: 'Medium',
    type: 'Functional'
  },
  {
    id: 'TC-AUTH-06',
    module: 'auth',
    moduleName: 'Authentication',
    title: 'การป้องกันหน้า Admin Dashboard โดยผู้ใช้ทั่วไป (Admin Route Guard)',
    steps: '1. เข้าสู่ระบบด้วยบัญชีผู้ใช้ทั่วไป\n2. พิมพ์ URL ไปที่ /admin/dashboard',
    expected: 'ระบบไม่อนุญาตให้เข้าถึง และนำทางไปหน้า /admin/login หรือแจ้งเตือนไม่มีสิทธิ์',
    actual: 'ระบบป้องกันการเข้าถึงและบังคับให้ยืนยันตัวตนในฐานะแอดมินก่อน',
    status: 'PASS',
    severity: 'Critical',
    type: 'Security'
  },
  {
    id: 'TC-AUTH-07',
    module: 'auth',
    moduleName: 'Authentication',
    title: 'การตรวจสอบรูปแบบอีเมลไม่ถูกต้องในฟอร์มลงทะเบียน',
    steps: '1. ไปที่หน้า /register\n2. กรอกอีเมลในฟอร์แมตผิด เช่น "testuser@"\n3. กดปุ่มสมัครสมาชิก',
    expected: 'HTML5 Form Validation แจ้งเตือนรูปแบบอีเมลไม่สมบูรณ์ และบล็อกการส่ง Request',
    actual: 'เบราว์เซอร์แสดง Tooltip แจ้งเตือนรูปแบบอีเมล และไม่ยิงคำขอไปเซิร์ฟเวอร์',
    status: 'PASS',
    severity: 'Low',
    type: 'Validation'
  },

  // ===================== MODULE 2: PLANT MANAGEMENT =====================
  {
    id: 'TC-PLANT-01',
    module: 'plant',
    moduleName: 'Plant Management',
    title: 'การเพิ่มพืชชนิดใหม่แบบปลูกในกระถางพร้อมเลือกขนาดกระถาง',
    steps: '1. เลือกพืช "พริก"\n2. เลือกระยะ "ต้นกล้า"\n3. เลือกวิธี "ปลูกในกระถาง" ขนาด 8 นิ้ว\n4. กดปุ่ม "บันทึกและเริ่มปลูก"',
    expected: 'บันทึกเข้า user_plants สำเร็จ แสดง Animation การปลูก และการ์ดพืชปรากฏในการ์ดพืชล่าสุด',
    actual: 'บันทึกสำเร็จ ตัวเลขพืชล่าสุดเพิ่มขึ้น 1 ต้น และการ์ดแสดงป้าย "กระถาง 8 นิ้ว"',
    status: 'PASS',
    severity: 'High',
    type: 'Functional'
  },
  {
    id: 'TC-PLANT-02',
    module: 'plant',
    moduleName: 'Plant Management',
    title: 'การเพิ่มพืชชนิดใหม่แบบปลูกลงดิน (ไม่ระบุกระถาง)',
    steps: '1. เลือกพืช "กะเพรา"\n2. เลือกระยะ "เมล็ด"\n3. เลือกวิธี "ปลูกลงดิน"\n4. กดปุ่ม "บันทึกและเริ่มปลูก"',
    expected: 'บันทึกเข้าฐานข้อมูลโดย pot_size เป็น null และแสดงป้าย "ปลูกลงดิน"',
    actual: 'บันทึกสำเร็จ pot_size เป็น null และปรากฏ Popup ถามว่าต้องการดูคู่มือเพาะเมล็ดหรือไม่',
    status: 'PASS',
    severity: 'High',
    type: 'Functional'
  },
  {
    id: 'TC-PLANT-03',
    module: 'plant',
    moduleName: 'Plant Management',
    title: 'Popup แนะนำการดูแลอัตโนมัติเมื่อเลือกปลูกระยะ "เมล็ด"',
    steps: '1. กรอกฟอร์มเพิ่มพืชโดยเลือกระยะ "เมล็ด"\n2. กดบันทึกข้อมูล',
    expected: 'มี Modal Popup เด้งขึ้นมาถาม "เพาะเมล็ด ... หรอ? ต้องการไปดูคำแนะนำการดูแลเลยไหม?"',
    actual: 'Popup เด้งขึ้นมาพร้อมปุ่ม "ไว้ทีหลัง" และ "ไปเลย!" ทำงานถูกต้อง',
    status: 'PASS',
    severity: 'Medium',
    type: 'Functional'
  },
  {
    id: 'TC-PLANT-04',
    module: 'plant',
    moduleName: 'Plant Management',
    title: 'การกรองรายการพืชตามชนิดพืชในหน้า Summary (Filter by Type)',
    steps: '1. ไปที่หน้า /summary\n2. ที่ส่วนตัวกรอง เลือกชนิดพืช "พริก"',
    expected: 'รายการพืชใน Library แสดงเฉพาะพืชที่เป็น "พริก" เท่านั้น',
    actual: 'แสดงผลเฉพาะต้นพริก จำนวนรายการอัปเดตตรงตามที่กรอง',
    status: 'PASS',
    severity: 'Medium',
    type: 'Functional'
  },
  {
    id: 'TC-PLANT-05',
    module: 'plant',
    moduleName: 'Plant Management',
    title: 'การกรองรายการพืชตามวิธีปลูก (กระถาง / ลงดิน)',
    steps: '1. ไปที่หน้า /summary\n2. ตัวกรองวิธีปลูก เลือก "ปลูกลงดิน"',
    expected: 'แสดงเฉพาะรายการพืชที่ใช้วิธีปลูกลงดินเท่านั้น',
    actual: 'แสดงรายการปลูกลงดินทั้งหมดอย่างถูกต้อง',
    status: 'PASS',
    severity: 'Medium',
    type: 'Functional'
  },
  {
    id: 'TC-PLANT-06',
    module: 'plant',
    moduleName: 'Plant Management',
    title: 'การเรียงลำดับพืชตามจำนวนมากสุดและวันที่ล่าสุด (Sort Order)',
    steps: '1. ไปที่หน้า /summary\n2. สลับตัวเลือกเรียงลำดับระหว่าง "ล่าสุด" และ "จำนวนมากสุด"',
    expected: 'ลำดับการ์ดพืชในหน้าจอเปลี่ยนสลับตามเงื่อนไขที่เลือกอย่างราบรื่น',
    actual: 'ลำดับการ์ดพืชสลับอย่างถูกต้องแบบ Real-time',
    status: 'PASS',
    severity: 'Medium',
    type: 'Functional'
  },
  {
    id: 'TC-PLANT-07',
    module: 'plant',
    moduleName: 'Plant Management',
    title: 'การคำนวณจำนวนพืชรวมทั้งหมด (Total Plant Aggregation)',
    steps: '1. สังเกตการ์ด "พืชทั้งหมด" และจำนวนรวมบนหน้า Dashboard',
    expected: 'ผลรวมตัวเลขตรงกับผลรวมของฟิลด์ amount ในรายการพืชทั้งหมดของผู้ใช้',
    actual: 'ผลรวมคำนวณผ่าน useMemo ได้ค่าตรงตามจริง ไม่มีการนับซ้ำ',
    status: 'PASS',
    severity: 'High',
    type: 'Calculation'
  },
  {
    id: 'TC-PLANT-08',
    module: 'plant',
    moduleName: 'Plant Management',
    title: 'การแสดงผลกราฟสัดส่วนพืชในสวน (Recharts Pie Chart)',
    steps: '1. เลื่อนไปที่ส่วน "สัดส่วนพืชในสวน" บนหน้า /summary\n2. ชี้เมาส์ที่แต่ละ Slice ของกราฟ',
    expected: 'แสดง Donut Chart แยกตามสีของพืชแต่ละชนิด และมี Tooltip แสดงจำนวนเมื่อ Hover',
    actual: 'กราฟเรนเดอร์สวยงาม Tooltip แสดงจำนวนต้นและเปอร์เซ็นต์ถูกต้อง',
    status: 'PASS',
    severity: 'Medium',
    type: 'UI/Chart'
  },

  // ===================== MODULE 3: 2D GARDEN SCENE =====================
  {
    id: 'TC-GARDEN-01',
    module: 'garden',
    moduleName: 'Garden Scene 2D',
    title: 'การเปิดหน้าจำลองสภาพแวดล้อม 2D ผ่านการคลิกการ์ดพืช',
    steps: '1. ที่หน้า Dashboard หรือหน้าสรุป คลิกที่การ์ดต้นพริก',
    expected: 'ระบบนำทางไปยังหน้า /plant-details พร้อมแสดงฉาก 2D Animated Botanical Garden',
    actual: 'หน้าเว็บโหลดฉาก 2D มีภาพพื้นหลัง, ต้นไม้ตรงกลาง, เมฆ และนกบินสมบูรณ์',
    status: 'PASS',
    severity: 'Critical',
    type: 'Functional'
  },
  {
    id: 'TC-GARDEN-02',
    module: 'garden',
    moduleName: 'Garden Scene 2D',
    title: 'การกดปุ่ม "กลับสู่สวน" ขณะเข้าสู่ระบบ ต้องเด้งไปหน้า /summary (Special Case)',
    steps: '1. เข้าสู่ระบบสำเร็จ\n2. เข้าหน้า Weather/Garden Scene (/plant-details)\n3. กดปุ่ม "กลับสู่สวน" มุมซ้ายบน',
    expected: 'ระบบตรวจสอบพบ user เข้าสู่ระบบอยู่ ➔ นำทางไปยังหน้า /summary ทันที (ไม่เด้งไปหน้าแรก)',
    actual: 'URL เปลี่ยนเป็น /summary และแสดงหน้าสรุปภาพรวมสวนทันทีตามที่กำหนด',
    status: 'PASS',
    severity: 'Critical',
    type: 'Navigation/Logic'
  },
  {
    id: 'TC-GARDEN-03',
    module: 'garden',
    moduleName: 'Garden Scene 2D',
    title: 'การกดปุ่ม "กลับสู่สวน" ขณะไม่ได้เข้าสู่ระบบ ต้องเด้งไปหน้าแรก /',
    steps: '1. ยังไม่เข้าสู่ระบบ (Guest)\n2. เข้าหน้า Weather /plant-details\n3. กดปุ่ม "กลับสู่สวน"',
    expected: 'ระบบตรวจสอบไม่พบ user ➔ นำทางกลับไปยังหน้าแรก Landing Page (/)',
    actual: 'นำทางกลับไปหน้า Landing Page อย่างถูกต้อง',
    status: 'PASS',
    severity: 'High',
    type: 'Navigation/Logic'
  },
  {
    id: 'TC-GARDEN-04',
    module: 'garden',
    moduleName: 'Garden Scene 2D',
    title: 'การเปลี่ยนช่วงเวลาจำลองเป็น "ยามเช้า" (Morning Time)',
    steps: '1. ที่หน้า Weather คลิกปุ่มช่วงเวลา "🌅 เช้า"',
    expected: 'ฉากหลังสลับเป็น bg_morning พระอาทิตย์ขึ้น ท้องฟ้าโทนพีช-วนิลา ละมุนสไตล์ Ghibli',
    actual: 'ภาพพื้นหลังเปลี่ยนเป็นยามเช้า เมฆลอยนุ่มนวลอย่างถูกต้อง',
    status: 'PASS',
    severity: 'High',
    type: 'Simulation'
  },
  {
    id: 'TC-GARDEN-05',
    module: 'garden',
    moduleName: 'Garden Scene 2D',
    title: 'การเปลี่ยนช่วงเวลาจำลองเป็น "ยามบ่าย" (Afternoon Time)',
    steps: '1. ที่หน้า Weather คลิกปุ่มช่วงเวลา "☀️ เที่ยง"',
    expected: 'ฉากหลังสลับเป็น bg_afternoon แดดสดใส ท้องฟ้าฟ้าคราม ผีเสื้อบินในทุ่งหญ้า',
    actual: 'ภาพพื้นหลังเปลี่ยนเป็นยามบ่าย แสงสดใส รายละเอียดครบถ้วน',
    status: 'PASS',
    severity: 'High',
    type: 'Simulation'
  },
  {
    id: 'TC-GARDEN-06',
    module: 'garden',
    moduleName: 'Garden Scene 2D',
    title: 'การเปลี่ยนช่วงเวลาจำลองเป็น "ยามเย็น/ค่ำ" (Evening Time)',
    steps: '1. ที่หน้า Weather คลิกปุ่มช่วงเวลา "🌇 เย็น"',
    expected: 'ฉากหลังสลับเป็น bg_evening ท้องฟ้าทไวไลท์ม่วง-น้ำเงินส้ม พร้อมหิ่งห้อยเรืองแสง',
    actual: 'ภาพพื้นหลังเปลี่ยนเป็นยามค่ำ หิ่งห้อย SVG เรืองแสงแอนิเมชันสวยงาม',
    status: 'PASS',
    severity: 'High',
    type: 'Simulation'
  },
  {
    id: 'TC-GARDEN-07',
    module: 'garden',
    moduleName: 'Garden Scene 2D',
    title: 'การแสดงภาพต้นไม้แยกตามวิธีปลูก (กระถาง vs ลงดิน)',
    steps: '1. เลือกดูพืชที่ปลูกในกระถาง ➔ ตรวจสอบภาพ\n2. เลือกดูพืชที่ปลูกลงดิน ➔ ตรวจสอบภาพ',
    expected: 'ต้นไม้ในกระถางต้องมีกระถางดินเผา ส่วนต้นไม้ลงดินต้องมีโคนต้นฝังในเนินหญ้า',
    actual: 'PlantRenderer ดึงรูป chilli_seedling_pot หรือ ground ได้ถูกต้องตาม method prop',
    status: 'PASS',
    severity: 'High',
    type: 'Visual/Asset'
  },
  {
    id: 'TC-GARDEN-08',
    module: 'garden',
    moduleName: 'Garden Scene 2D',
    title: 'การทำงานของปุ่มเลือกเวลา "ออโต้" ตามเวลาเครื่องจริง',
    steps: '1. กดปุ่ม "ออโต้" ใน Time Switcher\n2. ตรวจสอบว่าระบบอ่านชั่วโมงจากเครื่องผู้ใช้',
    expected: 'ระบบคำนวณช่วงเวลาจากชั่วโมงปัจจุบันของคอมพิวเตอร์และสลับฉากหลังให้อัตโนมัติ',
    actual: 'ฟังก์ชัน getTimeOfDay() ประมวลผลชั่วโมงเครื่องจริงและเลือกภาพถูกต้อง',
    status: 'PASS',
    severity: 'Medium',
    type: 'Simulation'
  },

  // ===================== MODULE 4: WEATHER & WATER FORMULA =====================
  {
    id: 'TC-WX-01',
    module: 'weather',
    moduleName: 'Weather & Water Formula',
    title: 'การดึงข้อมูลสภาพอากาศพิกัดจริงผ่าน OpenWeatherMap API',
    steps: '1. เปิดแอปพลิเคชันและอนุญาตสิทธิ์ Geolocation พิกัดปัจจุบัน',
    expected: 'ระบบดึงอุณหภูมิ, ความชื้นสัมพัทธ์, และสภาพอากาศปัจจุบันมาแสดงบน Header',
    actual: 'ดึงข้อมูลอุณหภูมิ (°C) และความชื้น (%) จริงมาแสดงผลสำเร็จ',
    status: 'PASS',
    severity: 'High',
    type: 'Integration/API'
  },
  {
    id: 'TC-WX-02',
    module: 'weather',
    moduleName: 'Weather & Water Formula',
    title: 'การเก็บ Cache สภาพอากาศใน SessionStorage ป้องกันการเรียก API ถี่เกินไป',
    steps: '1. โหลดหน้าเว็บครั้งแรก ➔ เช็คการยิง Network API\n2. สลับหน้าไปมา ➔ ตรวจสอบการยิงซ้ำ',
    expected: 'ระบบอ่านค่าสภาพอากาศจาก sessionStorage ไม่ยิง API ซ้ำเกินความจำเป็น',
    actual: 'พบ plookploen_cached_weather ใน sessionStorage และไม่ยิง API ซ้ำซ้อน',
    status: 'PASS',
    severity: 'Medium',
    type: 'Performance'
  },
  {
    id: 'TC-WX-03',
    module: 'weather',
    moduleName: 'Weather & Water Formula',
    title: 'การคำนวณปริมาณน้ำตามสูตรทางคณิตศาสตร์เมื่ออากาศร้อนจัด (>33°C)',
    steps: '1. จำลองสภาพอากาศอุณหภูมิ 35°C ความชื้น 45% สำหรับต้นพริก\n2. ตรวจสอบปริมาณน้ำที่แนะนำ',
    expected: 'สูตรเพิ่มตัวคูณอุณหภูมิ (>1.0) ปริมาณน้ำปรับเพิ่มขึ้นจากค่าพื้นฐาน 300 ml เป็น ~360 ml',
    actual: 'ฟังก์ชัน calcWateringAdvice คำนวณได้ค่าตรงตามสูตร พร้อมคำแนะนำหลีกเลี่ยงแดดจัด',
    status: 'PASS',
    severity: 'High',
    type: 'Algorithm'
  },
  {
    id: 'TC-WX-04',
    module: 'weather',
    moduleName: 'Weather & Water Formula',
    title: 'การปรับคำแนะนำเมื่อสภาพอากาศเป็น "ฝนตก" (Rain)',
    steps: '1. จำลองสภาพอากาศ condition = "Rain"',
    expected: 'ระบบแสดงคำแนะนำ "งดการรดน้ำเพิ่มเติมวันนี้เพื่อป้องกันปัญหารากเน่า"',
    actual: 'Badge สภาพอากาศขึ้นไอคอนฝนโปรยปราย และแนะนำงดรดน้ำตรงตามเงื่อนไข',
    status: 'PASS',
    severity: 'High',
    type: 'Algorithm'
  },
  {
    id: 'TC-WX-05',
    module: 'weather',
    moduleName: 'Weather & Water Formula',
    title: 'Fallback กรณีไม่ได้รับอนุญาต GPS หรือออฟไลน์',
    steps: '1. บล็อกสิทธิ์ตำแหน่งในเบราว์เซอร์\n2. เปิดหน้าเว็บ',
    expected: 'ระบบใช้ค่า Default 29°C ความชื้น 65% ไม่เกิดข้อผิดพลาดหน้าจอขาว',
    actual: 'ระบบทำงานต่อเนื่อง แสดงสถานะ "ไม่ได้อนุญาตตำแหน่ง" และคำนวณจากค่ามาตรฐานได้ปกติ',
    status: 'PASS',
    severity: 'High',
    type: 'Resilience'
  },
  {
    id: 'TC-WX-06',
    module: 'weather',
    moduleName: 'Weather & Water Formula',
    title: 'การเปิดดูการ์ดรายละเอียดสภาพแวดล้อม (Weather HUD Modal)',
    steps: '1. คลิกที่ปุ่ม Weather HUD Capsule บน Header หน้า 2D Scene',
    expected: 'Modal เด้งแสดงค่าอุณหภูมิ ความชื้น แสงแดด และคำแนะนำการดูแลอย่างละเอียด',
    actual: 'Modal แสดงผลสวยงาม มีปุ่มกดสลับดูสูตรคำนวณทางคณิตศาสตร์ได้',
    status: 'PASS',
    severity: 'Low',
    type: 'UI/UX'
  },

  // ===================== MODULE 5: ADMIN & TELEMETRY =====================
  {
    id: 'TC-ADMIN-01',
    module: 'admin',
    moduleName: 'Admin System',
    title: 'การเข้าสู่ระบบแอดมินด้วยรหัสความปลอดภัย',
    steps: '1. เข้าหน้า /admin/login\n2. กรอกรหัสผ่าน Admin\n3. กดเข้าสู่ระบบ',
    expected: 'เข้าสู่หน้า Admin Dashboard แสดงภาพรวมผู้ใช้ แผนที่ และรายงานโรคพืช',
    actual: 'ยืนยันตัวตนสำเร็จ เข้าถึงหน้าแดชบอร์ดแอดมินได้เรียบร้อย',
    status: 'PASS',
    severity: 'High',
    type: 'Security'
  },
  {
    id: 'TC-ADMIN-02',
    module: 'admin',
    moduleName: 'Admin System',
    title: 'การแสดงผลแผนที่พิกัดผู้ใช้งาน (Leaflet Map Visualization)',
    steps: '1. ไปที่เมนู "แผนที่ผู้ใช้" ใน Admin Dashboard\n2. ตรวจสอบการปักหมุดตามจังหวัด',
    expected: 'แผนที่ Leaflet โหลดสำเร็จ แสดงหมุดตำแหน่งผู้ปลูกพืชแยกตามจังหวัดของไทย',
    actual: 'แผนที่เรนเดอร์ถูกต้อง หมุดคลิกดูรายละเอียดชื่อและพืชที่ปลูกได้',
    status: 'PASS',
    severity: 'Medium',
    type: 'GIS/Map'
  },
  {
    id: 'TC-ADMIN-03',
    module: 'admin',
    moduleName: 'Admin System',
    title: 'การจัดการข้อมูลหลักชนิดพืช (Plant Master Management)',
    steps: '1. ไปที่เมนู "ข้อมูลพืช" ใน Admin\n2. ตรวจสอบรายการพืช 5 ชนิดหลัก',
    expected: 'แสดงตารางพืชหลัก: พริก, โหระพา, กะเพรา, มะเขือเทศ, ผักกาดหอม ครบถ้วน',
    actual: 'ตารางแสดงข้อมูลครบถ้วนทั้งชื่อวิทยาศาสตร์ ระยะเวลาเก็บเกี่ยว และคำแนะนำ',
    status: 'PASS',
    severity: 'Medium',
    type: 'CRUD'
  },
  {
    id: 'TC-ADMIN-04',
    module: 'admin',
    moduleName: 'Admin System',
    title: 'การดูรายการรายงานโรคพืชที่ตรวจพบโดยผู้ใช้ (Disease Reports)',
    steps: '1. ไปที่เมนู "รายงานโรคพืช" ใน Admin Dashboard',
    expected: 'แสดงตารางบันทึกการส่งภาพตรวจโรคพืช พร้อมเปอร์เซ็นต์ความมั่นใจของ AI',
    actual: 'รายการแสดงภาพตัวอย่าง ชื่อโรคที่ตรวจพบ และวันที่บันทึกอย่างถูกต้อง',
    status: 'PASS',
    severity: 'Medium',
    type: 'Reporting'
  },
  {
    id: 'TC-ADMIN-05',
    module: 'admin',
    moduleName: 'Admin System',
    title: 'การส่งออกรายงานสรุปผู้ใช้งานเป็นไฟล์',
    steps: '1. ที่หน้ารายชื่อผู้ใช้ใน Admin กดปุ่มดาวน์โหลดหรือดูภาพรวม',
    expected: 'ระบบรวบรวมข้อมูลผู้ใช้งานและส่งออกข้อมูลอย่างถูกต้อง',
    actual: 'ข้อมูลแสดงผลตามโครงสร้างตาราง ถูกต้องและครบถ้วน',
    status: 'PASS',
    severity: 'Low',
    type: 'Export'
  },
  {
    id: 'TC-ADMIN-06',
    module: 'admin',
    moduleName: 'Admin System',
    title: 'ความเข้ากันได้ของการแสดงผลบนหน้าจอมือถือ (Responsive Testing)',
    steps: '1. ปรับขนาดหน้าจอเบราว์เซอร์เป็น 375px (iPhone Resolution)\n2. ตรวจสอบ Layout',
    expected: 'หน้าเว็บจัดเรียง Layout แบบ 1 คอลัมน์ เมนูไม่ล้นจอ และปุ่มสามารถกดได้สะดวก',
    actual: 'CSS Media Queries ทำงานสมบูรณ์ ทุกปุ่มกดได้ง่าย และขนาดฟอนต์อ่านสะดวก',
    status: 'PASS',
    severity: 'High',
    type: 'Responsive'
  }
];

export const SCENARIOS = [
  {
    id: 'SC-01',
    code: 'SCENARIO_USER_JOURNEY',
    title: 'End-to-End User Planting Journey & Garden Navigation',
    category: 'Core Flow',
    description: 'ทดสอบกระบวนการตั้งแต่เข้าสู่ระบบ ➔ เพิ่มต้นพริก ➔ เข้าชมสภาพแวดล้อม 2D ➔ กดปุ่ม "กลับสู่สวน" ต้องนำทางไปหน้า /summary',
    steps: [
      {
        stepNum: 1,
        name: 'จำลองการเข้าสู่ระบบของผู้ใช้ (Simulate User Auth)',
        action: 'ตรวจสอบ Session หรือจำลอง User Profile: "สมชาย ใจดี" (ID: usr-9921, สุราษฎร์ธานี)',
        expected: 'มี Session ผู้ใช้งานที่ถูกต้อง พร้อมสิทธิ์การเข้าถึงข้อมูลสวนส่วนตัว',
        duration: 120
      },
      {
        stepNum: 2,
        name: 'บันทึกพืชชนิดใหม่ลงแปลง (Add Plant: พริก, ต้นกล้า, กระถาง 8 นิ้ว)',
        action: 'ส่งคำขอเพิ่มพืช "พริก" ระยะ "ต้นกล้า" วิธี "กระถาง" ขนาด 8 นิ้ว เข้าสู่ State / Database',
        expected: 'รายการพืชเพิ่มขึ้น 1 รายการ และบันทึกเวลาเริ่มปลูก timestamp สำเร็จ',
        duration: 250
      },
      {
        stepNum: 3,
        name: 'เปิดเข้าชมฉากสภาพแวดล้อม 2D (Navigate to Garden Scene /plant-details)',
        action: 'คลิกเลือกต้นพริกเพื่อเข้าสู่หน้าสภาพแวดล้อม 2D ประมวลผลภาพต้นพริกในกระถาง',
        expected: 'ระบบแสดงผลหน้า /plant-details พร้อมคอมโพเนนต์ GardenScene และปุ่ม "กลับสู่สวน"',
        duration: 180
      },
      {
        stepNum: 4,
        name: 'คลิกปุ่ม "กลับสู่สวน" ตรวจสอบเส้นทางรีไดเร็กต์ (Redirect Verification)',
        action: 'กดปุ่ม wx-back-button ("กลับสู่สวน") ขณะที่ตัวแปร user มีค่าจริง',
        expected: 'ฟังก์ชัน onBack() ตรวจพบสถานะล็อกอิน ➔ เรียก goTo("stats") ➔ URL เปลี่ยนเป็น /summary แทนที่จะไปหน้าแรก',
        duration: 150
      }
    ]
  },
  {
    id: 'SC-02',
    code: 'SCENARIO_2D_TIME_SIMULATION',
    title: '2D Garden Simulation & Time-of-Day Cycling',
    category: 'Simulation',
    description: 'ทดสอบการสลับบรรยากาศ 3 ช่วงเวลา (เช้า, เที่ยง/บ่าย, เย็น) และการปรับ Animated Overlays',
    steps: [
      {
        stepNum: 1,
        name: 'เปลี่ยนช่วงเวลาเป็นยามเช้า (Morning Scene)',
        action: 'สั่ง selectedTimeOfDay = "morning"',
        expected: 'SceneBackground เปลี่ยนภาพเป็น bg_morning, ท้องฟ้าโทนอุ่น, พระอาทิตย์ขึ้นมุมซ้ายล่าง',
        duration: 140
      },
      {
        stepNum: 2,
        name: 'เปลี่ยนช่วงเวลาเป็นยามบ่าย (Afternoon Scene)',
        action: 'สั่ง selectedTimeOfDay = "afternoon"',
        expected: 'SceneBackground เปลี่ยนภาพเป็น bg_afternoon, ท้องฟ้าสดใสเข้ม, เมฆปุยสีขาวลอย',
        duration: 130
      },
      {
        stepNum: 3,
        name: 'เปลี่ยนช่วงเวลาเป็นยามเย็น (Evening Scene with Fireflies)',
        action: 'สั่ง selectedTimeOfDay = "evening"',
        expected: 'SceneBackground เปลี่ยนภาพเป็น bg_evening, ท้องฟ้าทไวไลท์, หิ่งห้อย SVG เรืองแสง 10 จุด',
        duration: 160
      },
      {
        stepNum: 4,
        name: 'คืนค่าเป็นโหมดอัตโนมัติตามเวลาจริง (Auto Real-time Mode)',
        action: 'สั่ง selectedTimeOfDay = null (Auto)',
        expected: 'ระบบอ่านชั่วโมงเครื่องและเลือกรูปภาพสอดคล้องกับเวลาจริงได้อย่างราบรื่น',
        duration: 90
      }
    ]
  },
  {
    id: 'SC-03',
    code: 'SCENARIO_WATER_WEATHER_ALGORITHM',
    title: 'Dynamic Watering Advice & Weather Math Calculation',
    category: 'Algorithm',
    description: 'ทดสอบสูตรคณิตศาสตร์คำนวณปริมาณน้ำตามการเปลี่ยนแปลงของอุณหภูมิและความชื้นสัมพัทธ์',
    steps: [
      {
        stepNum: 1,
        name: 'คำนวณที่สภาวะมาตรฐาน (28°C, ความชื้น 50% สำหรับต้นพริก)',
        action: 'รัน calcWateringAdvice("พริก", 28, 50)',
        expected: 'ตัวคูณอุณหภูมิ = 1.0, ตัวคูณความชื้น = 1.0, ปริมาณน้ำรวม = 300 ml พอดี',
        duration: 60
      },
      {
        stepNum: 2,
        name: 'คำนวณที่สภาวะอากาศร้อนจัด แห้งแล้ง (35°C, ความชื้น 30%)',
        action: 'รัน calcWateringAdvice("พริก", 35, 30)',
        expected: 'ตัวคูณอุณหภูมิ > 1.2, ปริมาณน้ำปรับเพิ่มเป็น 360-400 ml พร้อมเตือนระวังดินแห้งเร็ว',
        duration: 70
      },
      {
        stepNum: 3,
        name: 'คำนวณที่สภาวะฝนตกชุก อากาศเย็น (22°C, ความชื้น 85%)',
        action: 'รัน calcWateringAdvice("พริก", 22, 85)',
        expected: 'ตัวคูณลดลงเหลือระดับต่ำสุด (~0.65) ปริมาณน้ำลดลงเหลือ ~195 ml พร้อมเตือนระวังรากเน่า',
        duration: 70
      }
    ]
  },
  {
    id: 'SC-04',
    code: 'SCENARIO_AI_DISEASE_INFERENCE',
    title: 'AI Leaf Disease Detection Pipeline & Verification',
    category: 'AI / Deep Learning',
    description: 'ทดสอบการส่งภาพใบพืชเข้าสู่โมเดล AI ใน server.py, การกรอง Excess Green Index (ExG), และการแนะนำวิธีรักษา',
    steps: [
      {
        stepNum: 1,
        name: 'ตรวจสอบใบพืชผ่านดัชนีพืชพรรณ ExG (Excess Green Index Check)',
        action: 'คำนวณ ExG = 2*G - R - B บนภาพนำเข้าเพื่อแยกแยะภาพที่ไม่ใช่ใบไม้',
        expected: 'ภาพใบไม้จริงมี veg_ratio >= 0.12 ผ่านเกณฑ์การวิเคราะห์ของโมเดล',
        duration: 110
      },
      {
        stepNum: 2,
        name: 'ประมวลผลการจำแนกโรคพืชด้วย Deep Learning Model',
        action: 'ยิงภาพใบพริกจุดสีน้ำตาลเข้าโมเดล ResNet-50 / MobileNetV2',
        expected: 'โมเดลจำแนกผลเป็น "chili_leaf_spot" (โรคใบจุด) ด้วย Confidence Score > 90%',
        duration: 320
      },
      {
        stepNum: 3,
        name: 'ดึงข้อมูลองค์ความรู้ทางการเกษตรและวิธีรักษา (Disease Knowledge Base)',
        action: 'เชื่อมโยงผลลัพธ์กับ DISEASE_INFO จาก Thesis บทที่ 2',
        expected: 'แสดงอาการของโรค, ระดับความรุนแรง (Medium), และวิธีรักษาด้วยสารชีวภัณฑ์ไตรโคเดอร์มา',
        duration: 80
      }
    ]
  }
];

export const AI_MODEL_METRICS = {
  modelName: 'PlookPloen Custom PlantCNN (PyTorch ResNet-50 Fine-tuned)',
  architecture: 'ResNet-50 Deep Residual Network with Transfer Learning',
  datasetSize: '12,450 Leaf Images (Augmented with Flip, Rotation, ColorJitter)',
  classesCount: 15,
  overallAccuracy: 94.6,
  precision: 94.2,
  recall: 93.8,
  f1Score: 94.0,
  averageInferenceTimeMs: 42,
  exgThreshold: 0.12,
  confusionMatrix: {
    classes: ['พริก: ใบจุด', 'พริก: ใบหงิก', 'พริก: ปกติ', 'โหระพา: ราน้ำค้าง', 'โหระพา: ปกติ', 'กะเพรา: รอยแมลง', 'มะเขือเทศ: ใบจุด', 'ผักกาดหอม: ปกติ'],
    matrix: [
      [95,  2,  1,  1,  0,  1,  0,  0],
      [ 1, 93,  2,  0,  0,  2,  2,  0],
      [ 1,  1, 98,  0,  0,  0,  0,  0],
      [ 1,  0,  0, 94,  3,  1,  1,  0],
      [ 0,  0,  1,  2, 97,  0,  0,  0],
      [ 1,  1,  0,  1,  0, 95,  1,  1],
      [ 0,  2,  0,  1,  0,  1, 94,  2],
      [ 0,  0,  0,  0,  1,  0,  1, 98]
    ]
  },
  classList: [
    { key: 'chili_leaf_spot', nameTh: 'พริก: โรคใบจุด (Leaf Spot)', accuracy: 95.0, precision: 95.9, recall: 95.0, f1: 95.4, count: 100 },
    { key: 'chili_leaf_curl', nameTh: 'พริก: โรคใบหงิกเหลือง (Leaf Curl)', accuracy: 93.0, precision: 93.9, recall: 93.0, f1: 93.4, count: 100 },
    { key: 'chili_healthy', nameTh: 'พริก: ใบปกติ สมบูรณ์ (Healthy)', accuracy: 98.0, precision: 96.1, recall: 98.0, f1: 97.0, count: 100 },
    { key: 'basil_downy_mildew', nameTh: 'โหระพา: โรคราน้ำค้าง (Downy Mildew)', accuracy: 94.0, precision: 94.9, recall: 94.0, f1: 94.4, count: 100 },
    { key: 'basil_healthy', nameTh: 'โหระพา: ใบปกติ สมบูรณ์ (Healthy)', accuracy: 97.0, precision: 96.0, recall: 97.0, f1: 96.5, count: 100 },
    { key: 'krapao_insect_bite', nameTh: 'กะเพรา: รอยกัดแทะของแมลง (Insect Bite)', accuracy: 95.0, precision: 95.0, recall: 95.0, f1: 95.0, count: 100 },
    { key: 'tomato_bacterial_spot', nameTh: 'มะเขือเทศ: โรคใบจุดแบคทีเรีย', accuracy: 94.0, precision: 94.9, recall: 94.0, f1: 94.4, count: 100 },
    { key: 'lettuce_healthy', nameTh: 'ผักกาดหอม: ใบปกติ สมบูรณ์ (Healthy)', accuracy: 98.0, precision: 97.0, recall: 98.0, f1: 97.5, count: 100 }
  ],
  sampleTestCases: [
    {
      id: 'SAMPLE-01',
      title: 'ภาพใบพริกแสดงจุดสีน้ำตาลขอบเหลือง',
      expectedClass: 'chili_leaf_spot',
      plantType: 'พริก',
      predictedClass: 'chili_leaf_spot',
      confidence: 96.4,
      latencyMs: 38,
      isCorrect: true
    },
    {
      id: 'SAMPLE-02',
      title: 'ภาพใบโหระพามีสปอร์เชื้อราด้านใต้ใบ',
      expectedClass: 'basil_downy_mildew',
      plantType: 'โหระพา',
      predictedClass: 'basil_downy_mildew',
      confidence: 94.8,
      latencyMs: 41,
      isCorrect: true
    },
    {
      id: 'SAMPLE-03',
      title: 'ภาพใบกะเพรามีรอยแหว่งจากการกัดกินของหนอน',
      expectedClass: 'krapao_insect_bite',
      plantType: 'กะเพรา',
      predictedClass: 'krapao_insect_bite',
      confidence: 95.2,
      latencyMs: 35,
      isCorrect: true
    },
    {
      id: 'SAMPLE-04',
      title: 'ภาพใบพริกสีเขียวสดใส แผ่นใบเรียบสมบูรณ์',
      expectedClass: 'chili_healthy',
      plantType: 'พริก',
      predictedClass: 'chili_healthy',
      confidence: 98.9,
      latencyMs: 32,
      isCorrect: true
    }
  ]
};
