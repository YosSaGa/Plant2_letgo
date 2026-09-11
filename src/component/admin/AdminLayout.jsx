import { BarChart3, Leaf, LogOut, ScanSearch, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './admin-polish.css';

const links = [
  ['/admin/dashboard', BarChart3, 'แดชบอร์ดภาพรวม'],
  ['/admin/users', Users, 'ผู้ใช้งาน'],
  ['/admin/plants', Leaf, 'ข้อมูลพืชกลาง'],
  ['/admin/disease-reports', ScanSearch, 'รายงานโรคพืช'],
];

export default function AdminLayout({ children, fullBleed = false }) {
  const navigate = useNavigate();
  const { logout, requestLogout } = useAuth();
  const reduceMotion = useReducedMotion();
  return <main className={`admin-root${fullBleed ? ' admin-map-shell' : ''}`}>
    <aside className="admin-sidebar">
      <button className="admin-logo" onClick={() => navigate('/')} aria-label="กลับหน้าหลัก"><motion.span animate={reduceMotion ? undefined : { rotate: [0, 8, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}>🌱</motion.span><div>PlookPloen<small>CONTROL ROOM</small></div></button>
      <nav>{links.map(([to, Icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>{({ isActive }) => <><Icon size={19} /><span>{label}</span>{isActive && !reduceMotion && <motion.i className="admin-nav-indicator" layoutId="admin-nav-indicator" transition={{ type: 'spring', stiffness: 360, damping: 30 }} />}</>}</NavLink>)}</nav>
      <button className="admin-exit" onClick={() => {
        if (typeof requestLogout === 'function') {
          requestLogout(() => navigate('/'));
        } else {
          logout().then(() => navigate('/'));
        }
      }}><LogOut size={18} /> ออกจากระบบ</button>
    </aside>
    <div className="admin-main">{children}</div>
  </main>;
}
