import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import AuthForm from './AuthForm';

// UI mockup only: the new password is not stored or submitted.
export default function ResetPassword({ onNavigate }) {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [visible, setVisible] = useState(false);
  const [complete, setComplete] = useState(false);
  const field = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
  const update = (name) => (event) => { setForm({ ...form, [name]: event.target.value }); setComplete(false); };
  const submit = (event) => { event.preventDefault(); setComplete(true); };
  const passwordInput = (name, label) => <motion.label variants={field}>{label}<span className="auth-input"><LockKeyhole size={18}/><input type={visible ? 'text' : 'password'} value={form[name]} onChange={update(name)} placeholder="••••••••" />{name === 'password' && <button type="button" className="auth-eye" aria-label="แสดงหรือซ่อนรหัสผ่าน" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>}</span></motion.label>;

  return (
    <AuthForm title="ตั้งรหัสผ่านใหม่" subtitle="ตั้งรหัสผ่านใหม่เพื่อกลับเข้าสู่บัญชีของคุณ" onHome={() => onNavigate('/')}>
      <motion.form noValidate className="auth-form" onSubmit={submit} initial="hidden" animate="show" transition={{ staggerChildren: .07 }}>
        <motion.p variants={field} className="auth-reset-help">รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร และไม่ซ้ำกับรหัสเดิม</motion.p>
        {passwordInput('password', 'รหัสผ่านใหม่')}
        {passwordInput('confirmPassword', 'ยืนยันรหัสผ่านใหม่')}
        <motion.button variants={field} whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} type="submit">บันทึกรหัสผ่านใหม่</motion.button>
        {complete && <motion.p variants={field} className="auth-notice">เปลี่ยนรหัสผ่านสำเร็จ (ตัวอย่างหน้าจอ — ยังไม่มีการบันทึกจริง)</motion.p>}
        <motion.p variants={field}>กลับไปที่ <a onClick={() => onNavigate('/login')}>หน้าเข้าสู่ระบบ</a></motion.p>
      </motion.form>
    </AuthForm>
  );
}
