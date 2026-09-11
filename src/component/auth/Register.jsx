import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole, Mail, MapPin, UserRound } from 'lucide-react';
import AuthForm from './AuthForm';
import { useAuth } from '../../context/AuthContext';

const THAI_PROVINCES = [
  'สุราษฎร์ธานี',
  'กรุงเทพมหานคร',
  'เชียงใหม่',
  'ขอนแก่น',
  'สงขลา',
  'ภูเก็ต',
  'นครราชสีมา',
  'ชลบุรี',
  'นนทบุรี',
  'ปทุมธานี',
  'เชียงราย',
  'อุบลราชธานี',
  'อุดรธานี',
  'พิษณุโลก',
  'นครศรีธรรมราช',
  'กระบี่',
  'พังงา',
  'ตรัง',
  'ระยอง',
  'เพชรบุรี',
  'ประจวบคีรีขันธ์',
  'พระนครศรีอยุธยา',
  'กาญจนบุรี',
  'ลพบุรี',
];

export default function Register({ onNavigate }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirm: '',
    province: 'สุราษฎร์ธานี',
  });
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [visible, setVisible] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setErrorMsg('');

    if (!form.email || !form.password) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (form.password !== form.confirm) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (form.password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setBusy(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        displayName: form.displayName || form.email.split('@')[0],
        province: form.province,
      });
      setBusy(false);
      onNavigate('/');
    } catch (err) {
      setBusy(false);
      let msg = err?.message || 'การสมัครสมาชิกไม่สำเร็จ โปรดลองอีกครั้ง';
      if (typeof msg === 'string' && (msg.includes('sending confirmation email') || msg.includes('500') || msg.trim().length <= 2)) {
        msg = '⚠️ สมัครไม่สำเร็จเนื่องจากระบบอีเมลยังไม่พร้อม (กรุณาปิด Confirm email ใน Supabase ที่ Authentication -> Providers -> Email)';
      }
      setErrorMsg(msg);
    }
  };

  const passwordField = (field, label) => (
    <label>
      {label}
      <span className="auth-input">
        <LockKeyhole size={18} />
        <input
          type={visible ? 'text' : 'password'}
          value={form[field]}
          onChange={update(field)}
          placeholder="••••••••"
        />
        {field === 'password' && (
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
    </label>
  );

  return (
    <AuthForm title="สมัครสมาชิก" subtitle="สร้างบัญชีเพื่อเก็บข้อมูลสวนของคุณ" onHome={() => onNavigate('/')}>
      <motion.form className="auth-form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {errorMsg && (
          <div
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '13px',
              marginBottom: '10px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <label>
          ชื่อที่แสดง
          <span className="auth-input">
            <UserRound size={18} />
            <input value={form.displayName} onChange={update('displayName')} placeholder="ชื่อของคุณ" />
          </span>
        </label>

        <label>
          อีเมล
          <span className="auth-input">
            <Mail size={18} />
            <input type="email" value={form.email} onChange={update('email')} placeholder="name@example.com" />
          </span>
        </label>

        <label>
          จังหวัดที่ปลูกพืช (บันทึกครั้งแรก)
          <span className="auth-input">
            <MapPin size={18} />
            <select
              value={form.province}
              onChange={update('province')}
              style={{
                width: '100%',
                border: 0,
                background: 'transparent',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '14px',
                color: '#1e293b',
              }}
            >
              {THAI_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </span>
        </label>

        {passwordField('password', 'รหัสผ่าน')}
        {passwordField('confirm', 'ยืนยันรหัสผ่าน')}

        <button disabled={busy}>{busy ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}</button>
        <p>
          มีบัญชีแล้ว? <a onClick={() => onNavigate('/login')}>เข้าสู่ระบบ</a>
        </p>
      </motion.form>
    </AuthForm>
  );
}
