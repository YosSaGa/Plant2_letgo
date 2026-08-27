import { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Mail, Send } from 'lucide-react';
import AuthForm from './AuthForm';
import './forgot-otp.css';

// UI mockup only: no email or OTP service is called.
export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const field = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const sendOtp = () => setOtpSent(true);
  const submit = (event) => {
    event.preventDefault();
    onNavigate('/reset-password');
  };

  return (
    <AuthForm title="ลืมรหัสผ่าน" subtitle="ยืนยันตัวตนด้วยรหัส OTP เพื่อดำเนินการต่อ" onHome={() => onNavigate('/')}>
      <motion.form noValidate className="auth-form auth-otp-form" onSubmit={submit} initial="hidden" animate="show" transition={{ staggerChildren: .07 }}>
        <motion.p variants={field} className="auth-reset-help">กรอกอีเมล แล้วกดส่ง OTP จากนั้นนำรหัสที่ได้รับมากรอกในหน้านี้</motion.p>
        <motion.label variants={field}>อีเมล<span className="auth-input"><Mail size={18}/><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setOtpSent(false); }} placeholder="name@example.com" /></span></motion.label>
        <motion.button variants={field} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} onClick={sendOtp}><Send size={17} /> {otpSent ? 'ส่ง OTP อีกครั้ง' : 'ส่ง OTP'}</motion.button>
        {otpSent && <motion.p variants={field} className="auth-notice">ส่ง OTP ไปที่ {email || 'อีเมลของคุณ'} แล้ว (ตัวอย่างหน้าจอ — ยังไม่มีการส่งจริง)</motion.p>}
        <motion.label variants={field}>รหัส OTP<span className="auth-input"><KeyRound size={18}/><input className="auth-otp-input" inputMode="numeric" maxLength="6" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="กรอกรหัส 6 หลัก" disabled={!otpSent} /></span></motion.label>
        <motion.button variants={field} whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} type="submit"><KeyRound size={17} /> ยืนยัน OTP</motion.button>
        <motion.p variants={field}>จำรหัสผ่านได้แล้ว? <a onClick={() => onNavigate('/login')}>เข้าสู่ระบบ</a></motion.p>
      </motion.form>
    </AuthForm>
  );
}
