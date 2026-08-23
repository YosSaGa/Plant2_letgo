import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, animate, motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinned, ScanSearch, ShieldCheck, Sprout, TrendingUp, Users } from 'lucide-react';
import { dashboardStats, diseaseRanks, plantingMethods, plantTotals, registrationSeries, userLocations } from './mockDashboardData';
import './admin.css';
import './admin-interactions.css';
import './admin-polish.css';
import AdminLayout from './AdminLayout';

const periods = Object.keys(registrationSeries);
const format = (value) => new Intl.NumberFormat('th-TH').format(value);

function CountUp({ value }) {
  const [count, setCount] = useState(0); const reduceMotion = useReducedMotion();
  useEffect(() => { if (reduceMotion) { setCount(value); return; } const controls = animate(0, value, { duration: 1.05, ease: 'easeOut', onUpdate: (next) => setCount(Math.round(next)) }); return controls.stop; }, [value, reduceMotion]);
  return <>{new Intl.NumberFormat('th-TH').format(count)}</>;
}
function Card({ children, className = '', delay = 0 }) {
  const reduceMotion = useReducedMotion(); const clickable = className.includes('admin-clickable');
  return <motion.section className={`admin-card ${className}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} whileHover={clickable && !reduceMotion ? { y: -4, boxShadow: '0 12px 24px -8px rgba(6,78,59,0.18)' } : undefined} whileTap={clickable ? { scale: .98 } : undefined} transition={{ delay, duration: .42 }}>{children}</motion.section>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('30 วัน');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const reduceMotion = useReducedMotion();
  const registrations = registrationSeries[period];
  const maxDisease = diseaseRanks[0].total;
  return <AdminLayout>
      <header className="admin-head"><div><p className="admin-kicker"><ShieldCheck size={15} /> ADMIN MOCKUP</p><h1>แดชบอร์ดผู้ดูแลระบบ</h1><p>ภาพรวมข้อมูล PlookPloen จากชุดข้อมูลจำลอง</p></div><span className="admin-updated">อัปเดตล่าสุด: วันนี้ 10:30 น.</span></header>
      <section className="admin-stats">
        <Card delay={.05} className="admin-stat-primary admin-clickable" ><button onClick={() => navigate('/admin/users')}><div><span>ผู้ใช้งานทั้งหมด</span><strong><CountUp value={dashboardStats.totalUsers}/></strong><small><TrendingUp size={14} /> {dashboardStats.userGrowth} จากเดือนที่แล้ว</small></div><i><Users size={29} /></i></button></Card>
        <Card delay={.1} className="admin-stat admin-clickable"><button onClick={() => navigate('/admin/plants')}><div><span>พืชที่ปลูกทั้งหมด</span><strong><CountUp value={dashboardStats.totalPlants}/></strong><small>บันทึกการปลูกในระบบ</small></div><i><Sprout size={27} /></i></button></Card>
        <Card delay={.15} className="admin-stat admin-clickable"><button onClick={() => navigate('/admin/disease-reports')}><div><span>ผลตรวจโรคพืช</span><strong><CountUp value={dashboardStats.totalDetections}/></strong><small>รายการตรวจในเดือนนี้</small></div><i><ScanSearch size={27} /></i></button></Card>
      </section>
      <section className="admin-grid">
        <Card delay={.18} className="admin-wide"><div className="admin-card-title"><div><h2>แนวโน้มผู้สมัครใหม่</h2><p>จำนวนผู้ใช้งานที่เริ่มใช้ระบบ</p></div><div className="admin-tabs">{periods.map((item) => <button key={item} onClick={() => setPeriod(item)} className={item === period ? 'selected' : ''}>{item}</button>)}</div></div><AnimatePresence mode="wait"><motion.div key={period} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? .1 : .18 }}><ResponsiveContainer width="100%" height={260}><AreaChart data={registrations}><defs><linearGradient id="userFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={.35}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="label" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Area type="monotone" dataKey="total" stroke="#059669" strokeWidth={3} fill="url(#userFill)" isAnimationActive={!reduceMotion} animationDuration={900}/></AreaChart></ResponsiveContainer></motion.div></AnimatePresence></Card>
        <Card delay={.22}><div className="admin-card-title"><div><h2>โรคพืชที่พบบ่อย</h2><p>อันดับผลตรวจทั้งหมด</p></div></div><div className="disease-list">{diseaseRanks.map((item, index) => <div key={item.name}><span>{index + 1}</span><p>{item.name}<i><b style={{ width: `${item.total / maxDisease * 100}%` }}/></i></p><strong>{item.total}</strong></div>)}</div></Card>
        <Card delay={.26}><div className="admin-card-title"><div><h2>จำนวนพืชแยกตามชนิด</h2><p>รวมทุกการบันทึก</p></div></div><ResponsiveContainer width="100%" height={255}><BarChart data={plantTotals}><XAxis dataKey="name" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Bar dataKey="total" fill="#10b981" radius={[7, 7, 0, 0]}/></BarChart></ResponsiveContainer></Card>
        <Card delay={.3}><div className="admin-card-title"><div><h2>พืชที่ปลูกบ่อยที่สุด</h2><p>คลิกรายการเพื่อดูรายละเอียด</p></div></div><ol className="plant-rank">{plantTotals.map((item, index) => <li key={item.name}><button onClick={() => setSelectedPlant(item)}><b>{index + 1}</b><span>{item.name}</span><strong>{format(item.total)} ต้น</strong></button></li>)}</ol></Card>
        <Card delay={.34}><div className="admin-card-title"><div><h2>สัดส่วนวิธีปลูก</h2><p>คลิกส่วนของกราฟเพื่อดูรายละเอียด</p></div></div><div className="method-chart"><ResponsiveContainer width="50%" height={210}><PieChart><Pie data={plantingMethods} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={4} onClick={(item) => setSelectedMethod(item)} isAnimationActive={!reduceMotion} animationDuration={800}>{plantingMethods.map((item) => <Cell key={item.name} fill={item.color} opacity={!selectedMethod || selectedMethod.name === item.name ? 1 : .35}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div>{plantingMethods.map((item) => <button className="method-item" key={item.name} onClick={() => setSelectedMethod(item)}><i style={{ background: item.color }}/><span>{item.name}</span><b>{item.value}%</b></button>)}{selectedMethod && <p className="method-detail"><b>{selectedMethod.name}: {format(Math.round(dashboardStats.totalPlants * selectedMethod.value / 100))} ต้น</b><span>นิยม: พริก · โหระพา · กะเพรา</span></p>}</div></div></Card>
        <Card delay={.38} className="admin-map-card"><div className="admin-card-title"><div><h2><MapPinned size={20} /> ผู้ใช้งานตามพื้นที่</h2><p>ตำแหน่งเข้าใช้ระบบในประเทศไทย (Mockup)</p></div><button className="admin-map-link" onClick={() => navigate('/admin/dashboard/user-map')}>ดูแผนที่เต็มจอ</button></div><MapContainer center={[13.4, 100.3]} zoom={5.4} scrollWheelZoom={false} className="admin-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{userLocations.map((location, index) => <CircleMarker key={location.name} center={location.position} radius={Math.max(8, location.users / 40)} pathOptions={{ color: '#047857', fillColor: '#10b981', fillOpacity: .65, className: index === 0 && !reduceMotion ? 'map-pulse' : '' }}><Popup><b>{location.name}</b><br />ผู้ใช้งาน {format(location.users)} คน</Popup></CircleMarker>)}</MapContainer></Card>
      </section>
    {selectedPlant && <motion.div className="admin-drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedPlant(null)}><motion.section className="admin-plant-drawer" initial={{ y: 220 }} animate={{ y: 0 }} onClick={(e) => e.stopPropagation()}><button onClick={() => setSelectedPlant(null)}>×</button><p className="admin-kicker">PLANT DETAIL · MOCKUP</p><h2>{selectedPlant.name}</h2><strong>{format(selectedPlant.total)} ต้น</strong><div><p><span>ปลูกในกระถาง</span><b>{format(Math.round(selectedPlant.total * .65))} ต้น</b></p><p><span>ปลูกลงดิน</span><b>{format(Math.round(selectedPlant.total * .35))} ต้น</b></p><p><span>ผู้ใช้งานที่ปลูก</span><b>{format(Math.round(selectedPlant.total / 3.8))} คน</b></p></div><small>แนวโน้ม 30 วันล่าสุดเพิ่มขึ้น 14% (ข้อมูลจำลอง)</small></motion.section></motion.div>}
  </AdminLayout>;
}
