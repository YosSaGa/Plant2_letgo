export const dashboardStats = {
  totalUsers: 2847,
  userGrowth: '+12%',
  totalPlants: 12640,
  totalDetections: 938,
};

export const registrationSeries = {
  '7 วัน': [
    { label: 'จ.', total: 42 }, { label: 'อ.', total: 51 }, { label: 'พ.', total: 37 },
    { label: 'พฤ.', total: 68 }, { label: 'ศ.', total: 59 }, { label: 'ส.', total: 75 }, { label: 'อา.', total: 63 },
  ],
  '30 วัน': [
    { label: '1 ส.ค.', total: 31 }, { label: '5 ส.ค.', total: 49 }, { label: '10 ส.ค.', total: 42 },
    { label: '15 ส.ค.', total: 66 }, { label: '20 ส.ค.', total: 59 }, { label: '25 ส.ค.', total: 81 }, { label: '30 ส.ค.', total: 74 },
  ],
  รายเดือน: [
    { label: 'มี.ค.', total: 560 }, { label: 'เม.ย.', total: 638 }, { label: 'พ.ค.', total: 714 },
    { label: 'มิ.ย.', total: 801 }, { label: 'ก.ค.', total: 878 }, { label: 'ส.ค.', total: 952 },
  ],
};

export const diseaseRanks = [
  { name: 'Downy Mildew', total: 214 }, { name: 'Root Rot', total: 186 },
  { name: 'Leaf Spot', total: 153 }, { name: 'Whitefly Infestation', total: 127 },
  { name: 'Bacterial Wilt', total: 98 },
];

export const plantTotals = [
  { name: 'พริก', total: 3420 }, { name: 'โหระพา', total: 2870 }, { name: 'กะเพรา', total: 2540 },
  { name: 'มะเขือเทศ', total: 2120 }, { name: 'ผักกาดหอม', total: 1690 },
];

export const plantingMethods = [
  { name: 'กระถาง', value: 65, color: '#10b981' },
  { name: 'ลงดิน', value: 35, color: '#84cc16' },
];

export const userLocations = [
  { name: 'กรุงเทพมหานคร', position: [13.7563, 100.5018], users: 920, trend: [112, 119, 126, 121, 138, 146, 158] },
  { name: 'เชียงใหม่', position: [18.7883, 98.9853], users: 505, trend: [64, 61, 72, 76, 69, 82, 81] },
  { name: 'ขอนแก่น', position: [16.4419, 102.8359], users: 382, trend: [43, 48, 45, 51, 57, 54, 61] },
  { name: 'หาดใหญ่', position: [7.0084, 100.4747], users: 275, trend: [29, 33, 36, 32, 41, 45, 43] },
  { name: 'ภูเก็ต', position: [7.8804, 98.3923], users: 201, trend: [21, 19, 24, 28, 31, 27, 34] },
];
