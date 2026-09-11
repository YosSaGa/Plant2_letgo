import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, KeyRound, Mail, Send } from 'lucide-react';
import AuthForm from './AuthForm';
import { supabase } from '../../lib/supabaseClient';
import './forgot-otp.css';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const field = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  // 1. ส่ง OTP ไปยังอีเมลจริงผ่าน Supabase Auth
  const sendOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    setBusy(true);
    setErrorMsg('');
    setNoticeMsg('');

    try {
      if (!supabase) {
        throw new Error('ยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        if (error.message.includes('rate limit')) {
          setErrorMsg(
            '⚠️ อีเมลติด Rate Limit ของ Supabase (เนื่องจากยังไม่ได้ตั้งค่า Custom SMTP ในโปรเจกต์) กรุณาดูวิธีตั้งค่า SMTP'
          );
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setOtpSent(true);
        setNoticeMsg(`✅ ส่งรหัส OTP ไปที่ ${email} เรียบร้อยแล้ว กรุณาตรวจกล่องข้อความหรือถังขยะ (Spam)`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถส่ง OTP ได้ โปรดลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  // 2. ยืนยันรหัส OTP 6 หลัก
  const submit = async (event) => {
    event.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setErrorMsg('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }

    setBusy(true);
    setErrorMsg('');

    try {
      if (!supabase) {
        throw new Error('ยังไม่ได้เชื่อมต่อฐานข้อมูล');
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'recovery',
      });

      if (error) {
        setErrorMsg('รหัส OTP ไม่ถูกต้องหรือหมดอายุ: ' + error.message);
      } else if (data?.session) {
        // ยืนยันตัวตนสำเร็จ นำทางไปหน้าตั้งรหัสผ่านใหม่
        onNavigate('/reset-password');
      }
    } catch (err) {
      setErrorMsg(err.message || 'ยืนยันรหัส OTP ไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthForm
      title="ลืมรหัสผ่าน"
      subtitle="ยืนยันตัวตนด้วยรหัส OTP 6 หลัก เพื่อกู้คืนรหัสผ่าน"
      onHome={() => onNavigate('/')}
    >
      <motion.form
        noValidate
        className="auth-form auth-otp-form"
        onSubmit={submit}
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.07 }}
      >
        <motion.p variants={field} className="auth-reset-help">
          กรอกอีเมลบัญชีของคุณ จากนั้นกด <b>"ส่ง OTP"</b> แล้วนำรหัส 6 หลักจากอีเมลมากรอกเพื่อยืนยัน
        </motion.p>

        {errorMsg && (
          <motion.div
            variants={field}
            style={{
              padding: '10px 14px',
              borderRadius: '9px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '13px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {noticeMsg && (
          <motion.div
            variants={field}
            style={{
              padding: '10px 14px',
              borderRadius: '9px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '13px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
            <span>{noticeMsg}</span>
          </motion.div>
        )}

        <motion.label variants={field}>
          อีเมล
          <span className="auth-input">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setOtpSent(false);
                setErrorMsg('');
              }}
              placeholder="name@example.com"
            />
          </span>
        </motion.label>

        <motion.button
          variants={field}
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={sendOtp}
          disabled={busy}
        >
          <Send size={17} /> {busy ? 'กำลังส่ง OTP...' : otpSent ? 'ส่ง OTP อีกครั้ง' : 'ส่ง OTP'}
        </motion.button>

        <motion.label variants={field}>
          รหัส OTP (6 หลัก)
          <span className="auth-input">
            <KeyRound size={18} />
            <input
              className="auth-otp-input"
              inputMode="numeric"
              maxLength="6"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              placeholder="เช่น 123456"
              disabled={!otpSent}
            />
          </span>
        </motion.label>

        <motion.button
          variants={field}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={busy || !otpSent}
        >
          <KeyRound size={17} /> {busy ? 'กำลังตรวจสอบ...' : 'ยืนยัน OTP'}
        </motion.button>

        <motion.p variants={field}>
          จำรหัสผ่านได้แล้ว? <a onClick={() => onNavigate('/login')}>เข้าสู่ระบบ</a>
        </motion.p>
      </motion.form>
    </AuthForm>
  );
}
