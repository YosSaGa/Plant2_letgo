import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import './component/first.css';
import Weather from "./component/Weather";
import PlantAdvice from "./component/PlantAdvice";
import DiseaseDetection from "./component/DiseaseDetection";
import FigmaExport from './FigmaExport';
import LandingPage from './component/LandingPage';
import PlantInfoPage from './component/PlantInfoPage';
import ActionLoader from './component/ActionLoader';
import AdminDashboard from './component/admin/AdminDashboard';
import AdminUserMap from './component/admin/AdminUserMap';
import AdminDetails from './component/admin/AdminDetails';
import AdminPlantMaster from './component/admin/AdminPlantMaster';
import Login from './component/auth/Login';
import Register from './component/auth/Register';
import AdminLogin from './component/admin/AdminLogin';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import './component/dashboard.css';

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plants, setPlants] = useState([]);
  const [weather, setWeather] = useState({ temp: 0, humidity: 0, condition: 'Clear', location: 'กำลังค้นหา...' });
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
    '/admin/login': 'adminLogin',
    '/admin/dashboard': 'adminDashboard',
    '/admin/dashboard/user-map': 'adminUserMap',
    '/admin/users': 'adminUsers',
    '/admin/plants': 'adminPlants',
    '/admin/disease-reports': 'adminReports',
  };
  const page = pageByPath[location.pathname] || 'landing';
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

        setWeather({ 
          temp: Math.round(data.main.temp), 
          humidity: data.main.humidity,
          condition: mainCondition, 
          location: data.name 
        });
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
    supabase.from('plants').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) setPlants(data.map((plant) => ({ ...plant, plantedAt: new Date(plant.created_at), potSize: plant.pot_size })));
    });
  }, []);

  const weatherTheme = {
    Clear: { icon: '☀️', label: 'แดดจัด เหมาะแก่การรดน้ำตอนเช้า' },
    Rain: { icon: '🌧️', label: 'ฝนตก งดรดน้ำเพิ่มวันนี้' },
    Clouds: { icon: '☁️', label: 'มีเมฆมาก อากาศเย็นสบาย' },
  };
  const currentWeather = weatherTheme[weather.condition] || weatherTheme.Clear;

  if (location.pathname === '/figma-export') return <FigmaExport />;
  if (page === 'login') return <Login onNavigate={navigate} />;
  if (page === 'register') return <Register onNavigate={navigate} />;
  if (page === 'adminLogin') return <AdminLogin onNavigate={navigate} />;
  if (page === 'adminDashboard') return <AdminDashboard />;
  if (page === 'adminUserMap') return <AdminUserMap />;
  if (page === 'adminUsers') return <AdminDetails type="users" />;
  if (page === 'adminPlants') return <AdminPlantMaster />;
  if (page === 'adminReports') return <AdminDetails type="reports" />;
  // หน้าแรกเริ่มด้วยการเข้าสู่ระบบตาม flow หลักของแอป
  if (page === 'landing') return <LandingPage isLoggedIn={Boolean(user)} onStart={() => goTo('add')} onPlantInfo={() => goTo('info')} onLogin={() => user ? goTo('add') : goTo('login')} onAdmin={() => navigate('/admin/login')} />;
  if (page === 'info') return <PlantInfoPage onBack={() => goTo('home')} onStart={(type) => { setFormData((current) => ({ ...current, type })); goTo('add'); }} />;

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
      const { data, error } = await supabase.from('plants').insert({ user_id: null, type: formData.type, stage: formData.stage, method: formData.method, pot_size: potSize, amount: Number(formData.amount) }).select().single();
      if (!error && data) newPlant = { ...data, potSize: data.pot_size, plantedAt: new Date(data.created_at) };
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

  const formatPlantedTime = (date) =>
    new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  const totalPlantAmount = plants.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const recentPlants = plants.slice(0, 3);
  const uniqueTypeCount = new Set(plants.map((p) => p.type)).size;
  const filterOptions = {
    types: [...new Set(plants.map((plant) => plant.type))],
    stages: [...new Set(plants.map((plant) => plant.stage))],
    methods: [...new Set(plants.map((plant) => plant.method))],
  };
  const filteredPlants = plants
    .filter((plant) => (plantFilter.type === 'all' || plant.type === plantFilter.type)
      && (plantFilter.stage === 'all' || plant.stage === plantFilter.stage)
      && (plantFilter.method === 'all' || plant.method === plantFilter.method))
    .sort((a, b) => plantFilter.sort === 'amount' ? Number(b.amount || 0) - Number(a.amount || 0) : new Date(b.plantedAt) - new Date(a.plantedAt));
  const plantChartData = Object.values(plants.reduce((groups, plant) => {
    if (!groups[plant.type]) groups[plant.type] = { name: plant.type, value: 0 };
    groups[plant.type].value += Number(plant.amount || 0);
    return groups;
  }, {}));
  const chartColors = ['#059669', '#84cc16', '#f59e0b', '#0ea5e9', '#ec4899'];
  const latestPlant = plants[0];
  const pottedAmount = plants.filter((plant) => plant.potSize).reduce((sum, plant) => sum + Number(plant.amount || 0), 0);

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
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="sg-disease-nav"
                onClick={() => goTo('disease')}
              >
                🔬 ตรวจโรคพืช
              </motion.button>
              <div className="sg-weather">
            <div>
              <div className="sg-display sg-temp">{weather.temp}°C</div>
              <div className="sg-weather-label">{currentWeather.label}</div>
            </div>
            <div className="sg-weather-icon">{currentWeather.icon}</div>
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
              <DiseaseDetection onBack={() => goTo('home')} />
            </motion.div>
          ) : page === 'detail' ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Weather
                plant={selectedPlant}
                weather={weather}
                onBack={() => goTo('home')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="advice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PlantAdvice
                plant={selectedPlant}
                weather={weather}
                onBack={() => goTo('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
