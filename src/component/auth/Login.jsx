import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import AuthForm from './AuthForm';
import { useAuth } from '../../context/AuthContext';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    setBusy(true);
    login({ email: form.email });
    window.setTimeout(() => { setBusy(false); onNavigate('/'); }, 250);
  };
  const field = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return <AuthForm title="เข้าสู่ระบบ" subtitle="บันทึกสวนของคุณไว้กับบัญชี PlookPloen" onHome={() => onNavigate('/')}>
    <motion.form noValidate className="auth-form" onSubmit={submit} initial="hidden" animate="show" transition={{ staggerChildren: .07 }}>
      <motion.label variants={field}>อีเมล<span className="auth-input"><Mail size={18}/><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com"/></span></motion.label>
      <motion.label variants={field}>รหัสผ่าน<span className="auth-input"><LockKeyhole size={18}/><input type={visible ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••"/><button type="button" className="auth-eye" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></motion.label>
      <motion.a variants={field} className="auth-forgot">ลืมรหัสผ่าน?</motion.a>
      <motion.button variants={field} whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} disabled={busy}>{busy ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}</motion.button>
      <motion.p variants={field}>ยังไม่มีบัญชี? <a onClick={() => onNavigate('/register')}>สมัครสมาชิก</a></motion.p>
      <motion.button variants={field} type="button" className="auth-admin-link" onClick={() => onNavigate('/admin/login')}>🛡️ เข้าสู่ระบบผู้ดูแลระบบ</motion.button>
    </motion.form>
  </AuthForm>;
}
