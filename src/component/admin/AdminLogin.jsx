import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './admin-login.css';
import '../auth/auth-navigation.css';

export default function AdminLogin({ onNavigate }) {
  const { loginAsAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    setBusy(true);
    loginAsAdmin({ email });
    window.setTimeout(() => { setBusy(false); onNavigate('/admin/dashboard'); }, 250);
  };

  return <main className="admin-login-root">
    <motion.i className="admin-login-blob admin-login-blob-a" animate={{ x: [0, 25, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }}/><motion.i className="admin-login-blob admin-login-blob-b" animate={{ y: [0, 25, 0] }} transition={{ duration: 6, repeat: Infinity }}/>
    <motion.section className="admin-login-card" initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: .3, duration: .55 }}>
      <motion.button type="button" className="admin-login-icon" aria-label="กลับหน้าแรก" onClick={() => onNavigate('/')} animate={{ scale: [1, 1.06, 1], opacity: [.9, 1, .9] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}><ShieldCheck size={31}/></motion.button>
      <p className="admin-login-kicker">PLOOKPLOEN CONTROL ROOM</p><h1 className="sg-display">เข้าสู่ระบบผู้ดูแล</h1><p className="admin-login-subtitle">สำหรับผู้ดูแลระบบเท่านั้น</p>
      <motion.form onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <label>อีเมล<span><Mail size={18}/><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com"/></span></label>
        <label>รหัสผ่าน<span><LockKeyhole size={18}/><input type={visible ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••"/><button type="button" aria-label="แสดงหรือซ่อนรหัสผ่าน" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
        <button type="submit" disabled={busy}>{busy ? 'กำลังตรวจสอบ...' : 'เข้าสู่แดชบอร์ด'}</button>
      </motion.form>
      <button className="admin-login-back" onClick={() => onNavigate('/login')}>← กลับสู่หน้าเข้าสู่ระบบผู้ใช้</button>
      <button className="admin-login-home" onClick={() => onNavigate('/')}>← กลับหน้าแรก</button>
    </motion.section>
  </main>;
}
