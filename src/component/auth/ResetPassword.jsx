import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import AuthForm from './AuthForm';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPassword({ onNavigate }) {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [complete, setComplete] = useState(false);
  const field = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const update = (name) => (event) => {
    setForm({ ...form, [name]: event.target.value });
    setErrorMsg('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrorMsg('');

    if (!form.password || form.password.length < 8) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษรตามข้อกำหนด');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setBusy(true);

    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: form.password,
        });

        if (error) {
          throw error;
        }
      }

      setComplete(true);
      window.setTimeout(() => {
        onNavigate('/login');
      }, 1600);
    } catch (err) {
      setErrorMsg(err.message || 'บันทึกรหัสผ่านใหม่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  const passwordInput = (name, label) => (
    <motion.label variants={field}>
      {label}
      <span className="auth-input">
        <LockKeyhole size={18} />
        <input
          type={visible ? 'text' : 'password'}
          value={form[name]}
          onChange={update(name)}
          placeholder="••••••••"
        />
        {name === 'password' && (
          <button
            type="button"
            className="auth-eye"
            aria-label="แสดงหรือซ่อนรหัสผ่าน"
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
    </motion.label>
  );

  return (
    <AuthForm
      title="ตั้งรหัสผ่านใหม่"
      subtitle="ตั้งรหัสผ่านใหม่เพื่อกลับเข้าสู่บัญชีของคุณ"
      onHome={() => onNavigate('/')}
    >
      <motion.form
        noValidate
        className="auth-form"
        onSubmit={submit}
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.07 }}
      >
        <motion.p variants={field} className="auth-reset-help">
          รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และไม่ซ้ำกับรหัสเดิม
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

        {passwordInput('password', 'รหัสผ่านใหม่')}
        {passwordInput('confirmPassword', 'ยืนยันรหัสผ่านใหม่')}

        <motion.button
          variants={field}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={busy || complete}
        >
          {busy ? 'กำลังบันทึกรหัสผ่าน...' : 'บันทึกรหัสผ่านใหม่'}
        </motion.button>

        {complete && (
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
            <span>บันทึกรหัสผ่านใหม่สำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...</span>
          </motion.div>
        )}

        <motion.p variants={field}>
          กลับไปที่ <a onClick={() => onNavigate('/login')}>หน้าเข้าสู่ระบบ</a>
        </motion.p>
      </motion.form>
    </AuthForm>
  );
}
