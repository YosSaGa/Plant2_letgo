import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import './component/first.css';
import LandingPage from './component/LandingPage';
import ActionLoader from './component/ActionLoader';
import Login from './component/auth/Login';
import Register from './component/auth/Register';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { LogOut } from 'lucide-react';
import './component/dashboard.css';

// Code Splitting (Lazy Loading) for ultra-fast initial bundle
const Weather = lazy(() => import("./component/Weather"));
const PlantAdvice = lazy(() => import("./component/PlantAdvice"));
const DiseaseDetection = lazy(() => import("./component/DiseaseDetection"));
const FigmaExport = lazy(() => import('./FigmaExport'));
const PlantInfoPage = lazy(() => import('./component/PlantInfoPage'));
const AdminDashboard = lazy(() => import('./component/admin/AdminDashboard'));
const AdminUserMap = lazy(() => import('./component/admin/AdminUserMap'));
const AdminDetails = lazy(() => import('./component/admin/AdminDetails'));
const AdminPlantMaster = lazy(() => import('./component/admin/AdminPlantMaster'));
const ForgotPassword = lazy(() => import('./component/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./component/auth/ResetPassword'));
const AdminLogin = lazy(() => import('./component/admin/AdminLogin'));
const SystemTestingSuite = lazy(() => import('./component/testing/SystemTestingSuite'));
const OurCreativeTeamPage = lazy(() => import('./components/OurCreativeTeamPage'));
import LiveTestOverlay, { globalTestRunner } from './component/testing/LiveTestOverlay';

const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

function App() {
  const { user, profile, loading, logout, requestLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plants, setPlants] = useState([]);
  const [weather, setWeather] = useState(() => {
    try {
      const cached = sessionStorage.getItem('plookploen_cached_weather');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.temp === 'number') return parsed;
      }
    } catch (_) {}
    return { temp: 29, humidity: 65, condition: 'Clear', location: 'กำลังค้นหา...' };
  });
  const [formData, setFormData] = useState({
    type: '',
    stage: 'เมล็ด',
    method: 'กระถาง',
    potSize: '8',
    customPotSize: '',
    amount: 1,
  });
  const [justAdded, setJustAdded] = useState(false);
  const [isPlanting, setIsPlanting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const showLoginPrompt = false;
  const [currentSeed, setCurrentSeed] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantFilter, setPlantFilter] = useState({ type: 'all', stage: 'all', method: 'all', sort: 'newest' });
  const pageByPath = {
    '/': 'landing',
    '/add-plant': 'add',
    '/summary': 'stats',
    '/disease-detection': 'disease',
    '/plant-details': 'detail',
    '/care-guide': 'advice',
    '/plant-info': 'info',
    '/login': 'login',
    '/register': 'register',
    '/forgot-password': 'forgotPassword',
    '/reset-password': 'resetPassword',
    '/admin/login': 'adminLogin',
    '/admin/dashboard': 'adminDashboard',
    '/admin/dashboard/user-map': 'adminUserMap',
    '/admin/users': 'adminUsers',
    '/admin/plants': 'adminPlants',
    '/admin/disease-reports': 'adminReports',
    '/system-test': 'systemTest',
    '/qa': 'systemTest',
    '/live-test': 'landing',
    '/team': 'team',
    '/our-team': 'team',
  };
  const [liveTestActive, setLiveTestActive] = useState(() => {
    try {
      return (
        location.pathname === '/live-test' ||
        Boolean(sessionStorage.getItem('plookploen_autorun')) ||
        localStorage.getItem('plookploen_livetest_active') === 'true'
      );
    } catch (_) {
      return false;
    }
  });

  const [, setAppTestTick] = useState(0);
  useEffect(() => {
    return globalTestRunner.subscribe(() => {
      setAppTestTick((t) => t + 1);
    });
  }, []);

  useEffect(() => {
    try {
      if (location.pathname === '/live-test' || sessionStorage.getItem('plookploen_autorun')) {
        setLiveTestActive(true);
        localStorage.setItem('plookploen_livetest_active', 'true');
      }
    } catch (_) {}
  }, [location.pathname]);

  const cleanPath = location.pathname.endsWith('/') && location.pathname !== '/'
    ? location.pathname.slice(0, -1)
    : location.pathname;
  const page = pageByPath[cleanPath] || pageByPath[location.pathname] || 'landing';
  const goTo = (nextPage) => navigate({
    home: '/',
    add: '/add-plant',
    stats: '/summary',
    disease: '/disease-detection',
    detail: '/plant-details',
    advice: '/care-guide',
    info: '/plant-info',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    team: '/team',
  }[nextPage]);

  const plantOptions = [
    { name: 'พริก', emoji: '🌶️', group: 'ผักสวนครัวยอดนิยม' },
    { name: 'โหระพา', emoji: '🌱', group: 'ผักสวนครัวยอดนิยม' },
    { name: 'กะเพรา', emoji: '🌿', group: 'ผักสวนครัวยอดนิยม' },
    { name: 'มะเขือเทศ', emoji: '🍅', group: 'พืชเศรษฐกิจ' },
    { name: 'ผักกาดหอม', emoji: '🥬', group: 'พืชเศรษฐกิจ' },
  ];
  const plantGroups = [
    { name: 'ผักสวนครัวยอดนิยม', icon: '🌿', description: 'ปลูกง่าย ใช้ประกอบอาหารได้ทุกวัน' },
    { name: 'พืชเศรษฐกิจ', icon: '📈', description: 'เหมาะสำหรับปลูกเพื่อสร้างรายได้' },
  ];

  const stageOptions = ['เมล็ด', 'ต้นกล้า', 'โตเต็มวัย'];
  const methodOptions = [
    { name: 'กระถาง', label: 'ปลูกในกระถาง' },
    { name: 'ลงดิน', label: 'ปลูกลงดิน' },
  ];
  const potSizeOptions = ['4', '6', '8', '10', '12', '14', '16', '20'];

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const API_KEY = 'd1c9079abd3e388a18f5dbbabafd5e52'; 
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=th`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        let mainCondition = data.weather[0].main; 
        if (['Thunderstorm', 'Drizzle'].includes(mainCondition)) {
          mainCondition = 'Rain';
        } else if (!['Clear', 'Rain', 'Clouds'].includes(mainCondition)) {
          mainCondition = 'Clear'; 
        }

        const newWeather = { 
          temp: Math.round(data.main.temp), 
          humidity: data.main.humidity,
          condition: mainCondition, 
          location: data.name 
        };
        setWeather(newWeather);
        try {
          sessionStorage.setItem('plookploen_cached_weather', JSON.stringify(newWeather));
        } catch (_) {}
      } catch (error) {
        console.error("Error fetching weather: ", error);
        setWeather((prev) => ({ ...prev, location: 'ดึงข้อมูลไม่สำเร็จ' }));
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        () => {
          setWeather((prev) => ({ ...prev, location: 'ไม่ได้อนุญาตตำแหน่ง' }));
        }
      );
    } else {
      setWeather((prev) => ({ ...prev, location: 'เบราว์เซอร์ไม่รองรับ GPS' }));
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('user_plants')
      .select('*, plant_master(*)')
      .order('planted_date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setPlants(
            data.map((item) => ({
              id: item.user_plant_id,
              user_id: item.user_id,
              type: item.plant_master?.name_th || 'พืชทั่วไป',
              stage: item.growth_stage,
              method: item.planting_method,
              amount: Number(item.amount || 1),
              potSize: item.pot_size,
              plantedAt: new Date(item.planted_date || item.updated_at),
            }))
          );
        }
      });
  }, []);

  const weatherTheme = {
    Clear: { icon: '☀️', label: 'แดดจัด เหมาะแก่การรดน้ำตอนเช้า' },
    Rain: { icon: '🌧️', label: 'ฝนตก งดรดน้ำเพิ่มวันนี้' },
    Clouds: { icon: '☁️', label: 'มีเมฆมาก อากาศเย็นสบาย' },
  };
  const currentWeather = weatherTheme[weather.condition] || weatherTheme.Clear;

  const effectiveUser = user;

  const sampleChili = useMemo(() => ({
    id: 'live-test-chili',
    user_id: user?.id || 'live-tester-id',
    type: 'พริก',
    stage: 'ต้นกล้า',
    method: 'กระถาง',
    potSize: '8',
    amount: 1,
    plantedAt: new Date(),
  }), [user]);

  const activePlants = useMemo(() => {
    if (Array.isArray(plants) && plants.length > 0) return plants;
    if (liveTestActive || location.pathname === '/live-test') return [sampleChili];
    return [];
  }, [plants, liveTestActive, location.pathname, sampleChili]);

  // React Hook Rules: All useMemo hooks must execute unconditionally before any early return!
  const totalPlantAmount = useMemo(
    () => (Array.isArray(activePlants) ? activePlants.reduce((sum, p) => sum + Number(p.amount || 0), 0) : 0),
    [activePlants]
  );
  const recentPlants = useMemo(() => (Array.isArray(activePlants) ? activePlants.slice(0, 3) : []), [activePlants]);
  const uniqueTypeCount = useMemo(
    () => (Array.isArray(activePlants) ? new Set(activePlants.map((p) => p.type)).size : 0),
    [activePlants]
  );
  const filterOptions = useMemo(
    () => ({
      types: Array.isArray(activePlants) ? [...new Set(activePlants.map((plant) => plant.type))] : [],
      stages: Array.isArray(activePlants) ? [...new Set(activePlants.map((plant) => plant.stage))] : [],
      methods: Array.isArray(activePlants) ? [...new Set(activePlants.map((plant) => plant.method))] : [],
    }),
    [activePlants]
  );

  const filteredPlants = useMemo(() => {
    if (!Array.isArray(activePlants)) return [];
    return activePlants
      .filter(
        (plant) =>
          (plantFilter.type === 'all' || plant.type === plantFilter.type) &&
          (plantFilter.stage === 'all' || plant.stage === plantFilter.stage) &&
          (plantFilter.method === 'all' || plant.method === plantFilter.method)
      )
      .sort((a, b) =>
        plantFilter.sort === 'amount'
          ? Number(b.amount || 0) - Number(a.amount || 0)
          : new Date(b.plantedAt) - new Date(a.plantedAt)
      );
  }, [activePlants, plantFilter]);

  const plantChartData = useMemo(() => {
    if (!Array.isArray(activePlants)) return [];
    return Object.values(
      activePlants.reduce((groups, plant) => {
        if (!groups[plant.type]) groups[plant.type] = { name: plant.type, value: 0 };
        groups[plant.type].value += Number(plant.amount || 0);
        return groups;
      }, {})
    );
  }, [activePlants]);

  const chartColors = ['#059669', '#84cc16', '#f59e0b', '#0ea5e9', '#ec4899'];
  const latestPlant = Array.isArray(activePlants) && activePlants.length ? activePlants[0] : null;
  const pottedAmount = useMemo(
    () =>
      Array.isArray(activePlants)
        ? activePlants.filter((plant) => plant.potSize).reduce((sum, plant) => sum + Number(plant.amount || 0), 0)
        : 0,
    [activePlants]
  );

  const renderLiveOverlay = () => {
    if (location.pathname === '/system-test' || location.pathname === '/qa') return null;
    if (!liveTestActive && location.pathname !== '/live-test' && !globalTestRunner.isRunning && !globalTestRunner.isManualRecording) return null;
    return (
      <LiveTestOverlay
        page={page}
        goTo={goTo}
        user={effectiveUser}
        plants={activePlants}
        setSelectedPlant={setSelectedPlant}
        weather={weather}
        onClose={() => {
          setLiveTestActive(false);
          try {
            localStorage.removeItem('plookploen_livetest_active');
            sessionStorage.removeItem('plookploen_autorun');
          } catch (_) {}
          globalTestRunner.stop('ปิดแถบควบคุม');
          if (location.pathname === '/live-test') goTo('home');
        }}
        onOpenPortal={() => navigate('/system-test')}
      />
    );
  };

  // รอเช็กสถานะการล็อกอินก่อนเรนเดอร์ เพื่อป้องกันหน้ากะพริบหรือจอดำ
  if (loading) {
    return (
      <div className="sg-root" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <ActionLoader title="กำลังเตรียมระบบ..." detail="กรุณารอสักครู่" />
      </div>
    );
  }

  if (location.pathname === '/figma-export') return <Suspense fallback={<ActionLoader title="กำลังเปิด..." />}><FigmaExport />{renderLiveOverlay()}</Suspense>;
  if (page === 'login') return (user && !globalTestRunner.isRunning) ? <Navigate to="/" replace /> : <><Login onNavigate={navigate} />{renderLiveOverlay()}</>;
  if (page === 'register') return (user && !globalTestRunner.isRunning) ? <Navigate to="/" replace /> : <><Register onNavigate={navigate} />{renderLiveOverlay()}</>;
  if (page === 'forgotPassword') return <Suspense fallback={<ActionLoader title="กำลังเตรียมหน้ากู้รหัสผ่าน..." />}><ForgotPassword onNavigate={navigate} />{renderLiveOverlay()}</Suspense>;
  if (page === 'resetPassword') return <Suspense fallback={<ActionLoader title="กำลังเตรียมหน้ารีเซ็ตรหัส..." />}><ResetPassword onNavigate={navigate} />{renderLiveOverlay()}</Suspense>;
  if (page === 'add' && !user && !globalTestRunner.isRunning && !liveTestActive) return <><Login onNavigate={navigate} />{renderLiveOverlay()}</>;
  if (page === 'adminLogin') return <Suspense fallback={<ActionLoader title="กำลังเปิดหน้าแอดมิน..." />}><AdminLogin onNavigate={navigate} />{renderLiveOverlay()}</Suspense>;
  if (page === 'adminDashboard') return <Suspense fallback={<ActionLoader title="กำลังโหลดแดชบอร์ด..." />}><AdminDashboard />{renderLiveOverlay()}</Suspense>;
  if (page === 'adminUserMap') return <Suspense fallback={<ActionLoader title="กำลังโหลดแผนที่..." />}><AdminUserMap />{renderLiveOverlay()}</Suspense>;
  if (page === 'adminUsers') return <Suspense fallback={<ActionLoader title="กำลังโหลดรายชื่อผู้ใช้..." />}><AdminDetails type="users" />{renderLiveOverlay()}</Suspense>;
  if (page === 'adminPlants') return <Suspense fallback={<ActionLoader title="กำลังโหลดข้อมูลพืช..." />}><AdminPlantMaster />{renderLiveOverlay()}</Suspense>;
  if (page === 'adminReports') return <Suspense fallback={<ActionLoader title="กำลังโหลดรายงานโรคพืช..." />}><AdminDetails type="reports" />{renderLiveOverlay()}</Suspense>;
  if (page === 'systemTest') return <Suspense fallback={<ActionLoader title="กำลังเปิดศูนย์ทดสอบระบบ..." />}><SystemTestingSuite onBack={() => goTo('home')} />{renderLiveOverlay()}</Suspense>;
  if (page === 'team') return (
    <Suspense fallback={<ActionLoader title="กำลังเปิดข้อมูลทีมผู้พัฒนา..." />}>
      <OurCreativeTeamPage 
        onBack={() => goTo('home')} 
        onStart={() => user ? goTo('add') : goTo('login')} 
      />
      {renderLiveOverlay()}
    </Suspense>
  );
  // หน้าแรกเริ่มด้วยการเข้าสู่ระบบตาม flow หลักของแอป
  if (page === 'landing') return (
    <>
      <LandingPage 
        isLoggedIn={Boolean(user)} 
        onStart={() => user ? goTo('add') : goTo('login')} 
        onPlantInfo={() => goTo('info')} 
        onLogin={() => user ? goTo('add') : goTo('login')} 
        onAdmin={() => navigate('/admin/login')} 
        onOpenTeam={() => goTo('team')}
        onLogout={async () => {
          await logout();
          goTo('home');
        }}
      />
      {renderLiveOverlay()}
    </>
  );
  if (page === 'info') return (
    <Suspense fallback={<ActionLoader title="กำลังเปิดคลังข้อมูลพืช..." />}>
      <PlantInfoPage 
        onBack={() => goTo('home')} 
        onStart={(type) => { setFormData((current) => ({ ...current, type })); goTo('add'); }} 
      />
      {renderLiveOverlay()}
    </Suspense>
  );

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const toggleChoice = (name, value) => setFormData((prev) => ({ ...prev, [name]: prev[name] === value ? '' : value }));
  const togglePotSize = (size) => setFormData((prev) => ({
    ...prev,
    potSize: prev.potSize === size ? '' : size,
    customPotSize: prev.potSize === size ? '' : prev.customPotSize,
  }));
  const adjustAmount = (delta) => setFormData((prev) => ({ ...prev, amount: Math.max(1, Number(prev.amount) + delta) }));
  const getPotSizeLabel = (plant) => plant.method === 'กระถาง' && plant.potSize ? `กระถาง ${plant.potSize} นิ้ว` : 'ปลูกลงดิน';
  const isFormReady = formData.type && formData.stage && formData.method
    && (formData.method !== 'กระถาง' || (formData.potSize && (formData.potSize !== 'custom' || formData.customPotSize)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormReady || isPlanting) return;
    const potSize = formData.method === 'กระถาง'
      ? (formData.potSize === 'custom' ? formData.customPotSize : formData.potSize)
      : null;
    let newPlant = { ...formData, potSize, id: Date.now(), plantedAt: new Date() };

    setIsPlanting(true);
    window.setTimeout(() => setIsPlanting(false), 1300);

    if (supabase) {
      try {
        let plantId = 1;
        const { data: pm } = await supabase
          .from('plant_master')
          .select('plant_id')
          .eq('name_th', formData.type)
          .maybeSingle();

        if (pm?.plant_id) {
          plantId = pm.plant_id;
        }

        const { data, error } = await supabase
          .from('user_plants')
          .insert({
            user_id: user?.id || null,
            plant_id: plantId,
            growth_stage: formData.stage,
            planting_method: formData.method,
            pot_size: potSize,
            amount: Number(formData.amount) || 1,
          })
          .select('*, plant_master(*)')
          .single();

        if (!error && data) {
          newPlant = {
            id: data.user_plant_id,
            user_id: data.user_id,
            type: data.plant_master?.name_th || formData.type,
            stage: data.growth_stage,
            method: data.planting_method,
            potSize: data.pot_size,
            amount: Number(data.amount || 1),
            plantedAt: new Date(data.planted_date || data.updated_at),
          };
        }
      } catch (err) {
        console.warn('user_plants insert error:', err);
      }
    }
    setPlants((prev) => [newPlant, ...prev]);

    if (formData.stage === 'เมล็ด') {
      setCurrentSeed(newPlant);
      window.setTimeout(() => setShowPopup(true), 1300);
    } else {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2200);
    }
  };

  const handleViewAdvice = (plant) => {
    setSelectedPlant(plant);
    goTo('advice');
  };

  const handleGoToGuide = () => {
    setShowPopup(false);
    handleViewAdvice(currentSeed);
  };

  const handleViewPlant = (plant) => {
    setSelectedPlant(plant);
    goTo('detail');
  };

  const formatPlantedTime = (date) => {
    try {
      return thaiDateFormatter.format(date instanceof Date ? date : new Date(date));
    } catch (_) {
      return '';
    }
  };

  // (useMemo hooks moved above early returns to strictly adhere to React Rules of Hooks)

  const renderPlantCard = (plant) => {
    const plantInfo = plantOptions.find((p) => p.name === plant.type);
    return (
      <motion.div 
        key={plant.id} 
        className="sg-plant-card"
        layout
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }}
        onClick={() => handleViewPlant(plant)} /* 🟢 กดที่กล่องการ์ด ไปหน้า Weather (detail) */
        style={{ cursor: 'pointer' }}
      >
        <div className="sg-plant-icon">{plantInfo ? plantInfo.emoji : '🌱'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3>{plant.type}</h3>
          <p>ระยะ: {plant.stage} · {getPotSizeLabel(plant)}</p>
          <p className="sg-plant-time">🕒 เริ่มปลูก: {formatPlantedTime(plant.plantedAt)}</p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();   /* 🟢 เบรก Event ไม่ให้ไปทริกเกอร์แท็ก Form/Link (ถ้ามี) */
              e.stopPropagation();  /* 🟢 เบรก Event Bubbling ไม่ให้มันทะลุไปโดน onClick ของการ์ดด้านบน */
              handleViewAdvice(plant); /* 🟢 ไปหน้า Advice */
            }}
          >
            👁️ ดูคำแนะนำการดูแล
          </motion.button>
        </div>
        <span className="sg-plant-count">{plant.amount} ต้น</span>
      </motion.div>
    );
  };

  return (
    <div className="sg-root">
      <AnimatePresence>
        {isPlanting && <ActionLoader title="กำลังเพิ่มลงแปลงปลูก" detail="บันทึกข้อมูลและเตรียมแผนดูแลให้คุณ" />}
      </AnimatePresence>
      
      {createPortal(
        <AnimatePresence>
          {showPopup && (
            <motion.div 
              className="sg-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="sg-modal"
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 30 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <div className="sg-modal-icon">🌱</div>
                <h3>เพาะเมล็ด {currentSeed?.type} หรอ?</h3>
                <p>
                  การเริ่มปลูกจากเมล็ดต้องใช้ความใส่ใจเป็นพิเศษ<br />
                  ต้องการไปดู <strong>คำแนะนำการดูแล</strong> เลยไหม?
                </p>
                <div className="sg-modal-actions">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="sg-btn-cancel" onClick={() => setShowPopup(false)}>ไว้ทีหลัง</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="sg-btn-confirm" onClick={handleGoToGuide}>ไปเลย!</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {showLoginPrompt && (
            <motion.div className="sg-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="sg-modal" initial={{ scale: 0.8, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 30 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <div className="sg-modal-icon">🔐</div>
                <h3>กรุณาเข้าสู่ระบบก่อนเพิ่มพืช</h3>
                <p>เข้าสู่ระบบเพื่อบันทึกข้อมูลสวนของคุณและกลับมาดูได้ทุกครั้ง</p>
                <div className="sg-modal-actions">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="sg-btn-cancel" onClick={() => {}}>ไว้ทีหลัง</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="sg-btn-confirm" onClick={() => goTo('login')}>เข้าสู่ระบบ</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>, document.body
      )}

      <motion.div className="sg-blob sg-blob1" animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}></motion.div>
      <motion.div className="sg-blob sg-blob2" animate={{ y: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}></motion.div>
      <motion.div className="sg-blob sg-blob3" animate={{ x: [0, 15, 0], y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}></motion.div>

      <div className="sg-wrap">
        <motion.header 
          className="sg-card sg-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
              <motion.button
                type="button"
                className="sg-brand sg-brand-home"
                onClick={() => goTo('home')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="กลับหน้าแรก"
              >
            <motion.div 
              className="sg-logo"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
            >🌿</motion.div>
            <div>
              <h1 className="sg-display sg-title">PlookPloen</h1>
              <p className="sg-location">📍 {weather.location}</p>
            </div>
              </motion.button>
          <div className="sg-header-right">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="sg-disease-nav"
              onClick={() => goTo('disease')}
            >
              🔬 ตรวจโรคพืช
            </motion.button>
            <div className="sg-weather">
              <div className="sg-weather-icon">{currentWeather.icon}</div>
              <div className="sg-weather-info">
                <span className="sg-temp">{weather.temp}°C</span>
                <span className="sg-weather-label">{currentWeather.label}</span>
              </div>
            </div>
            {user ? (
              <div className="sg-user-badge">
                <div className="sg-user-pill" title={user.email}>
                  <div className="sg-user-avatar">
                    {profile?.display_name ? profile.display_name.slice(0, 1).toUpperCase() : '🌱'}
                  </div>
                  <div className="sg-user-meta">
                    <span className="sg-user-name">{profile?.display_name || user.email?.split('@')[0] || 'ผู้ใช้งาน'}</span>
                    <span className="sg-user-loc">📍 {profile?.province || 'สุราษฎร์ธานี'}</span>
                  </div>
                </div>
                <div className="sg-user-divider" />
                <motion.button
                  type="button"
                  className="sg-logout-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (typeof requestLogout === 'function') {
                      requestLogout(() => goTo('home'));
                    } else {
                      logout().then(() => goTo('home'));
                    }
                  }}
                  title="ออกจากระบบ"
                >
                  <LogOut size={14} />
                  <span>ออกจากระบบ</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                type="button"
                className="sg-btn-login-nav"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goTo('login')}
                title="เข้าสู่ระบบ"
              >
                เข้าสู่ระบบ
              </motion.button>
            )}

          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {page === 'add' ? (
            <motion.div 
              key="home" 
              className="sg-main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="sg-main-left">
                <section className="sg-card">
                  <h2 className="sg-display sg-section-title">🌱 เพิ่มพืชชนิดใหม่</h2>

                  <form onSubmit={handleSubmit}>
                    <div>
                      <label className="sg-label">ชนิดพืช</label>
                      <div className="sg-plant-groups">
                      {plantGroups.map((group) => (
                        <div className="sg-plant-group" key={group.name}>
                          <div className="sg-plant-group-header">
                            <span className="sg-plant-group-icon">{group.icon}</span>
                            <div><p className="sg-plant-group-title">{group.name}</p><span>{group.description}</span></div>
                          </div>
                          <div className="sg-plant-grid">
                        {plantOptions.filter((plant) => plant.group === group.name).map((plant) => (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            key={plant.name}
                            onClick={(event) => {
                              // This selector lives inside the add-plant form. Keep its click
                              // local so it never acts like a form submit or parent navigation.
                              event.preventDefault();
                              event.stopPropagation();
                              toggleChoice('type', plant.name);
                            }}
                            className={`sg-plant-btn ${formData.type === plant.name ? 'active' : ''}`}
                          >
                            <span className="sg-plant-emoji">{plant.emoji}</span>
                            <span className="sg-plant-name">{plant.name}</span>
                          </motion.button>
                        ))}
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>

                    <div className="sg-row">
                      <div>
                        <label className="sg-label">ระยะการเจริญเติบโต</label>
                        <div className="sg-chip-group">
                          {stageOptions.map((stage) => (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              key={stage}
                              onClick={() => toggleChoice('stage', stage)}
                              className={`sg-chip ${formData.stage === stage ? 'active' : ''}`}
                            >
                              {stage}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="sg-label">วิธีการปลูก</label>
                        <div className="sg-chip-group">
                          {methodOptions.map((m) => (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              key={m.name}
                              onClick={() => toggleChoice('method', m.name)}
                              className={`sg-chip ${formData.method === m.name ? 'active' : ''}`}
                            >
                              {m.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {formData.method === 'กระถาง' && (
                      <motion.div
                        className="sg-pot-size"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="sg-pot-size-heading"><span>🪴</span><div><label className="sg-label">ขนาดกระถาง</label><small>เลือกเส้นผ่านศูนย์กลางปากกระถาง</small></div></div>
                        <div className="sg-pot-size-options">
                          {potSizeOptions.map((size) => (
                            <button type="button" key={size} onClick={() => togglePotSize(size)} className={`sg-pot-size-btn ${formData.potSize === size ? 'active' : ''}`}>{size}&quot;</button>
                          ))}
                          <button type="button" onClick={() => togglePotSize('custom')} className={`sg-pot-size-btn sg-pot-size-custom ${formData.potSize === 'custom' ? 'active' : ''}`}>กำหนดเอง</button>
                        </div>
                        {formData.potSize === 'custom' && <div className="sg-custom-pot"><input type="number" name="customPotSize" min="1" max="100" step="0.5" inputMode="decimal" required value={formData.customPotSize} onChange={handleChange} placeholder="เช่น 9" /><span>นิ้ว</span></div>}
                      </motion.div>
                    )}

                    <div>
                      <label className="sg-label">จำนวนต้น</label>
                      <div className="sg-stepper">
                        <motion.button whileTap={{ scale: 0.9 }} type="button" className="sg-step-btn" onClick={() => adjustAmount(-1)}>−</motion.button>
                        <input
                          type="number"
                          name="amount"
                          min="1"
                          value={formData.amount}
                          onChange={handleChange}
                          className="sg-amount-input"
                        />
                        <motion.button whileTap={{ scale: 0.9 }} type="button" className="sg-step-btn" onClick={() => adjustAmount(1)}>+</motion.button>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: '#34d399' }} 
                      whileTap={{ scale: 0.98 }} 
                      type="submit" 
                      className="sg-display sg-submit"
                      disabled={!isFormReady}
                    >
                      + เพิ่มลงแปลงปลูก
                    </motion.button>

                    <AnimatePresence>
                      {justAdded && (
                        <motion.div 
                          className="sg-toast"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          ✨ เพิ่มพืชเรียบร้อยแล้ว!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </section>
              </div>

              <div className="sg-main-right">
                <section>
                  <h2 className="sg-display sg-section-title">
                    🪴 พืชล่าสุด <motion.span key={totalPlantAmount} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="sg-badge">{totalPlantAmount}</motion.span>
                  </h2>

                  {plants.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sg-empty">
                      <span className="sg-empty-emoji">👩‍🌾</span>
                      ยังไม่มีพืชในแปลงปลูก ลองเพิ่มพืชด้านบนดูสิ!
                    </motion.div>
                  ) : (
                    <>
                      <div className="sg-plant-list">
                        <AnimatePresence>
                          {recentPlants.map(renderPlantCard)}
                        </AnimatePresence>
                      </div>
                      <motion.button 
                        whileHover={{ x: 5 }}
                        className="sg-view-all-btn" 
                        onClick={() => goTo('stats')}
                      >
                        ดูสรุปทั้งหมด ({uniqueTypeCount} ชนิด) →
                      </motion.button>
                    </>
                  )}
                </section>
              </div>
            </motion.div>
          ) : page === 'stats' ? (
            <motion.div 
              key="stats" 
              className="sg-stats-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button whileHover={{ x: -5 }} className="sg-back-btn" onClick={() => goTo('home')}>← กลับหน้าหลัก</motion.button>

              <section className="sg-dashboard-heading">
                <div><p>GARDEN OVERVIEW</p><h1 className="sg-display">สรุปสวนของฉัน</h1><span>ภาพรวมพืชที่คุณบันทึกไว้ทั้งหมด</span></div>
                <div className="sg-dashboard-total"><b>{totalPlantAmount}</b><span>ต้นในสวน</span></div>
              </section>

              <section className="sg-dashboard-grid">
                <article className="sg-dashboard-stat sg-dashboard-stat-primary"><span>🌱</span><div><small>พืชทั้งหมด</small><strong>{totalPlantAmount} <em>ต้น</em></strong></div></article>
                <article className="sg-dashboard-stat"><span>🪴</span><div><small>ชนิดพืช</small><strong>{uniqueTypeCount} <em>ชนิด</em></strong></div></article>
                <article className="sg-dashboard-stat"><span>🏺</span><div><small>ปลูกในกระถาง</small><strong>{pottedAmount} <em>ต้น</em></strong></div></article>
                <article className="sg-dashboard-stat"><span>🗓️</span><div><small>เพิ่มล่าสุด</small><strong className="sg-dashboard-latest">{latestPlant ? latestPlant.type : 'ยังไม่มีข้อมูล'}</strong></div></article>
              </section>

              <section className="sg-dashboard-insight">
                <div className="sg-dashboard-chart"><div><p>สัดส่วนพืชในสวน</p><h2>แยกตามชนิดพืช</h2></div>{plantChartData.length ? <ResponsiveContainer width="100%" height={230}><PieChart><Pie data={plantChartData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86} paddingAngle={3}>{plantChartData.map((item, index) => <Cell key={item.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value) => [`${value} ต้น`, 'จำนวน']} /></PieChart></ResponsiveContainer> : <p className="sg-dashboard-empty">เพิ่มพืชเพื่อดูกราฟสรุป</p>}<div className="sg-dashboard-legend">{plantChartData.map((item, index) => <span key={item.name}><i style={{ background: chartColors[index % chartColors.length] }} />{item.name} <b>{item.value}</b></span>)}</div></div>
                <div className="sg-dashboard-note"><span>💡</span><p>เริ่มต้นง่าย ๆ</p><h2>{latestPlant ? `พืชล่าสุดของคุณคือ ${latestPlant.type}` : 'เพิ่มพืชต้นแรกของคุณ'}</h2><small>{latestPlant ? `บันทึกเมื่อ ${formatPlantedTime(latestPlant.plantedAt)}` : 'เมื่อบันทึกพืชแล้ว สรุปสวนจะอัปเดตที่นี่ทันที'}</small><button onClick={() => goTo('add')}>+ เพิ่มพืชในสวน</button></div>
              </section>

              <section className="sg-dashboard-list-section">
                <div className="sg-dashboard-list-heading"><div><p>PLANT LIBRARY</p><h2 className="sg-display">รายการพืช</h2></div><span>{filteredPlants.length} รายการ</span></div>
                <div className="sg-dashboard-filters">
                  <select value={plantFilter.type} onChange={(event) => setPlantFilter({ ...plantFilter, type: event.target.value })}><option value="all">ทุกชนิดพืช</option>{filterOptions.types.map((item) => <option key={item}>{item}</option>)}</select>
                  <select value={plantFilter.stage} onChange={(event) => setPlantFilter({ ...plantFilter, stage: event.target.value })}><option value="all">ทุกระยะ</option>{filterOptions.stages.map((item) => <option key={item}>{item}</option>)}</select>
                  <select value={plantFilter.method} onChange={(event) => setPlantFilter({ ...plantFilter, method: event.target.value })}><option value="all">ทุกวิธีปลูก</option>{filterOptions.methods.map((item) => <option key={item}>{item}</option>)}</select>
                  <select value={plantFilter.sort} onChange={(event) => setPlantFilter({ ...plantFilter, sort: event.target.value })}><option value="newest">เรียง: ล่าสุด</option><option value="amount">เรียง: จำนวนมากสุด</option></select>
                </div>
                {filteredPlants.length ? <div className="sg-plant-list sg-plant-list-full"><AnimatePresence>{filteredPlants.map(renderPlantCard)}</AnimatePresence></div> : <div className="sg-dashboard-no-results">ไม่พบพืชตามตัวกรองที่เลือก</div>}
              </section>
            </motion.div>
          ) : page === 'disease' ? (
            <motion.div
              key="disease"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<ActionLoader title="กำลังเปิดระบบตรวจโรคพืช..." />}>
                <DiseaseDetection onBack={() => (user ? goTo('stats') : goTo('home'))} />
              </Suspense>
            </motion.div>
          ) : page === 'detail' ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<ActionLoader title="กำลังโหลดข้อมูลพืชและสภาพอากาศ..." />}>
                <Weather
                  plant={selectedPlant || (liveTestActive ? sampleChili : null)}
                  weather={weather}
                  onBack={() => (user ? goTo('stats') : goTo('home'))}
                />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="advice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<ActionLoader title="กำลังเปิดคำแนะนำการดูแล..." />}>
                <PlantAdvice
                  plant={selectedPlant || (liveTestActive ? sampleChili : null)}
                  weather={weather}
                  onBack={() => (user ? goTo('stats') : goTo('home'))}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {renderLiveOverlay()}
    </div>
  );
}

export default App;
