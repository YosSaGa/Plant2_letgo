import { useState } from 'react';
import AuthForm from './AuthForm';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';

export default function Register({ onNavigate }) {
  const { login } = useAuth(); const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' }); const [busy, setBusy] = useState(false); const [visible, setVisible] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const submit = (event) => { event.preventDefault(); setBusy(true); login({ email: form.email, displayName: form.displayName || 'ผู้ใช้งานทดลอง' }); window.setTimeout(() => { setBusy(false); onNavigate('/'); }, 250); };
  const passwordField = (field, label) => <label>{label}<span className="auth-input"><LockKeyhole size={18}/><input type={visible ? 'text' : 'password'} value={form[field]} onChange={update(field)} placeholder="••••••••" />{field === 'password' && <button type="button" className="auth-eye" aria-label="แสดงหรือซ่อนรหัสผ่าน" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>}</span></label>;
  return <AuthForm title="สมัครสมาชิก" subtitle="สร้างบัญชีเพื่อเก็บข้อมูลสวนของคุณ" onHome={() => onNavigate('/')}><motion.form className="auth-form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><label>ชื่อที่แสดง<span className="auth-input"><UserRound size={18}/><input value={form.displayName} onChange={update('displayName')} placeholder="ชื่อของคุณ" /></span></label><label>อีเมล<span className="auth-input"><Mail size={18}/><input type="email" value={form.email} onChange={update('email')} placeholder="name@example.com" /></span></label>{passwordField('password', 'รหัสผ่าน')}{passwordField('confirm', 'ยืนยันรหัสผ่าน')}<button disabled={busy}>{busy ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}</button><p>มีบัญชีแล้ว? <a onClick={() => onNavigate('/login')}>เข้าสู่ระบบ</a></p></motion.form></AuthForm>;
}
