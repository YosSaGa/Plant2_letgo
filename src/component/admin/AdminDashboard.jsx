import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, animate, motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinned, RefreshCw, ScanSearch, ShieldCheck, Sprout, TrendingUp, Users } from 'lucide-react';
import { fetchAdminSummary, fetchDiseaseRankings, fetchPlantStatistics, fetchRegistrationSeries } from './adminDataService';
import { fetchUserProvinceStats } from './userMapService';
import './admin.css';
import './admin-interactions.css';
import './admin-polish.css';
import './admin-requirements.css';
import AdminLayout from './AdminLayout';

const periods = ['7 วัน', '30 วัน', 'รายเดือน'];
const format = (value) => new Intl.NumberFormat('th-TH').format(value || 0);

function CountUp({ value = 0 }) {
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) {
      setCount(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.85,
      ease: 'easeOut',
      onUpdate: (next) => setCount(Math.round(next)),
    });
    return controls.stop;
  }, [value, reduceMotion]);
  return <>{new Intl.NumberFormat('th-TH').format(count)}</>;
}

function Card({ children, className = '', delay = 0 }) {
  const reduceMotion = useReducedMotion();
  const clickable = className.includes('admin-clickable');
  return (
    <motion.section
      className={`admin-card ${className}`}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={clickable && !reduceMotion ? { y: -4, boxShadow: '0 12px 24px -8px rgba(6,78,59,0.18)' } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      transition={{ delay, duration: 0.42 }}
    >
      {children}
    </motion.section>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('30 วัน');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const reduceMotion = useReducedMotion();

  const [summary, setSummary] = useState({ totalUsers: 0, userGrowth: '0%', totalPlants: 0, totalDetections: 0 });
  const [seriesMap, setSeriesMap] = useState({ '7 วัน': [], '30 วัน': [], รายเดือน: [] });
  const [diseaseList, setDiseaseList] = useState([]);
  const [plantTotals, setPlantTotals] = useState([]);
  const [plantingMethods, setPlantingMethods] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sum, regSeries, diseases, plantStats, provLocations] = await Promise.all([
        fetchAdminSummary(),
        fetchRegistrationSeries(),
        fetchDiseaseRankings(),
        fetchPlantStatistics(),
        fetchUserProvinceStats(),
      ]);

      setSummary(sum);
      setSeriesMap(regSeries);
      setDiseaseList(diseases);
      setPlantTotals(plantStats.plantTotals);
      setPlantingMethods(plantStats.plantingMethods);
      if (provLocations && provLocations.length > 0) {
        setMapLocations(provLocations);
      }
      setLastUpdated(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Error loading admin dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const registrations = seriesMap[period] || [];
  const maxDisease = diseaseList.length > 0 ? Math.max(...diseaseList.map((d) => d.total), 1) : 1;

  return (
    <AdminLayout>
      <header className="admin-head">
        <div>
          <p className="admin-kicker">
            <ShieldCheck size={15} /> PLOOKPLOEN CONTROL ROOM
          </p>
          <h1>แดชบอร์ดผู้ดูแลระบบ</h1>
          <p>ภาพรวมสถิติและข้อมูลจริงจากระบบฐานข้อมูล Supabase</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadAllData}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#047857',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูลสด'}
          </button>
          <span className="admin-updated">
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#10b981', marginRight: 6 }} />
            อัปเดต: {lastUpdated || 'กำลังเชื่อมต่อ'} น.
          </span>
        </div>
      </header>

      <section className="admin-stats">
        <Card delay={0.05} className="admin-stat-primary admin-clickable">
          <button onClick={() => navigate('/admin/users')}>
            <div>
              <span>ผู้ใช้งานทั้งหมด</span>
              <strong><CountUp value={summary.totalUsers} /></strong>
              <small><TrendingUp size={14} /> {summary.userGrowth} ผู้ใช้ใหม่ล่าสุด</small>
            </div>
            <i><Users size={29} /></i>
          </button>
        </Card>
        <Card delay={0.1} className="admin-stat admin-clickable">
          <button onClick={() => navigate('/admin/plants')}>
            <div>
              <span>พืชที่ปลูกทั้งหมด</span>
              <strong><CountUp value={summary.totalPlants} /></strong>
              <small>บันทึกการปลูกจริงในระบบ</small>
            </div>
            <i><Sprout size={27} /></i>
          </button>
        </Card>
        <Card delay={0.15} className="admin-stat">
          <div>
            <span>ผลตรวจโรคพืช</span>
            <strong><CountUp value={summary.totalDetections} /></strong>
            <small>ประวัติการตรวจโรค AI ทั้งหมด</small>
          </div>
          <i><ScanSearch size={27} /></i>
        </Card>
      </section>

      <section className="admin-grid">
        <Card delay={0.18} className="admin-wide">
          <div className="admin-card-title">
            <div>
              <h2>แนวโน้มผู้สมัครใหม่</h2>
              <p>จำนวนผู้ใช้งานที่เริ่มใช้ระบบตามเวลาจริง</p>
            </div>
            <div className="admin-tabs">
              {periods.map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={item === period ? 'selected' : ''}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={period}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.18 }}
            >
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={registrations}>
                  <defs>
                    <linearGradient id="userFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#059669"
                    strokeWidth={3}
                    fill="url(#userFill)"
                    isAnimationActive={!reduceMotion}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </Card>

        <Card delay={0.22}>
          <div className="admin-card-title">
            <div>
              <h2>โรคพืชที่พบบ่อย</h2>
              <p>อันดับผลตรวจจากฐานข้อมูล AI จริง</p>
            </div>
          </div>
          {diseaseList.length > 0 ? (
            <div className="disease-list">
              {diseaseList.slice(0, 6).map((item, index) => (
                <div key={item.name}>
                  <span>{index + 1}</span>
                  <p>
                    {item.name}
                    <i>
                      <b style={{ width: `${(item.total / maxDisease) * 100}%` }} />
                    </i>
                  </p>
                  <strong>{item.total}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              <ScanSearch size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p>ยังไม่มีประวัติการตรวจพบโรคพืชในระบบ</p>
              <small style={{ color: '#9ca3af' }}>เมื่อผู้ใช้สแกนโรคพืช ข้อมูลจะแสดงที่นี่โดยอัตโนมัติ</small>
            </div>
          )}
        </Card>

        <Card delay={0.26}>
          <div className="admin-card-title">
            <div>
              <h2>จำนวนพืชแยกตามชนิด</h2>
              <p>รวมทุกการบันทึกจริงจากผู้ใช้งาน</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={255}>
            <BarChart data={plantTotals}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card delay={0.3}>
          <div className="admin-card-title">
            <div>
              <h2>พืชที่ปลูกบ่อยที่สุด</h2>
              <p>คลิกรายการเพื่อดูรายละเอียดสถิติ</p>
            </div>
          </div>
          {plantTotals.length > 0 ? (
            <ol className="plant-rank">
              {plantTotals.map((item, index) => (
                <li key={item.name}>
                  <button onClick={() => setSelectedPlant(item)}>
                    <b>{index + 1}</b>
                    <span>{item.name}</span>
                    <strong>{format(item.total)} ต้น</strong>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>ยังไม่มีข้อมูลพืชในระบบ</p>
          )}
        </Card>

        <Card delay={0.34}>
          <div className="admin-card-title">
            <div>
              <h2>สัดส่วนวิธีปลูก</h2>
              <p>เปรียบเทียบกระถาง vs ปลูกลงดิน</p>
            </div>
          </div>
          <div className="method-chart">
            <ResponsiveContainer width="50%" height={210}>
              <PieChart>
                <Pie
                  data={plantingMethods}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                  onClick={(item) => setSelectedMethod(item)}
                  isAnimationActive={!reduceMotion}
                  animationDuration={800}
                >
                  {plantingMethods.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                      opacity={!selectedMethod || selectedMethod.name === item.name ? 1 : 0.35}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div>
              {plantingMethods.map((item) => (
                <button
                  className="method-item"
                  key={item.name}
                  onClick={() => setSelectedMethod(item)}
                >
                  <i style={{ background: item.color }} />
                  <span>{item.name}</span>
                  <b>{item.value}%</b>
                </button>
              ))}
              {selectedMethod && (
                <p className="method-detail">
                  <b>{selectedMethod.name}: {format(selectedMethod.total || 0)} ต้น</b>
                  <span>({selectedMethod.value}% ของพืชทั้งหมดในระบบ)</span>
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card delay={0.38} className="admin-map-card">
          <div className="admin-card-title">
            <div>
              <h2><MapPinned size={20} /> ผู้ใช้งานตามพื้นที่</h2>
              <p>ตำแหน่งลงทะเบียนจริงในประเทศไทย <span style={{ color: '#059669', fontWeight: 600 }}>· ข้อมูลสดจาก Supabase</span></p>
            </div>
            <button className="admin-map-link" onClick={() => navigate('/admin/dashboard/user-map')}>
              ดูแผนที่เต็มจอ
            </button>
          </div>
          <MapContainer center={[13.4, 100.3]} zoom={5.4} scrollWheelZoom={false} className="admin-map">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapLocations.map((location, index) => {
              const isTop = index === 0;
              return (
                <CircleMarker
                  key={location.name}
                  center={location.position}
                  radius={isTop ? Math.max(10, location.users * 4) : Math.max(8, location.users * 3)}
                  pathOptions={{
                    color: isTop ? '#f59e0b' : '#047857',
                    weight: isTop ? 2.5 : 1.5,
                    fillColor: isTop ? '#10b981' : '#34d399',
                    fillOpacity: isTop ? 0.85 : 0.65,
                    className: isTop && !reduceMotion ? 'map-pulse' : '',
                  }}
                >
                  <Popup>
                    <b>{isTop ? '🏆 อันดับ 1: ' : ''}{location.name}</b>
                    <br />
                    ผู้ใช้งาน {format(location.users)} คน
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </Card>
      </section>

      {selectedPlant && (
        <motion.div
          className="admin-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedPlant(null)}
        >
          <motion.section
            className="admin-plant-drawer"
            initial={{ y: 220 }}
            animate={{ y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedPlant(null)}>×</button>
            <p className="admin-kicker">PLANT STATS</p>
            <h2>{selectedPlant.name}</h2>
            <strong>{format(selectedPlant.total)} ต้น</strong>
            <div>
              <p>
                <span>บันทึกปลูกในระบบ</span>
                <b>{format(selectedPlant.total)} ต้น</b>
              </p>
              <p>
                <span>สัดส่วนในระบบ</span>
                <b>{summary.totalPlants > 0 ? Math.round((selectedPlant.total / summary.totalPlants) * 100) : 0}%</b>
              </p>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AdminLayout>
  );
}
