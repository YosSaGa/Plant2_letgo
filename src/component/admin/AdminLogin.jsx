import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './admin-login.css';

export default function AdminLogin({ onNavigate }) {
  const { loginAsAdmin } = useAuth();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [visible,setVisible]=useState(false);
  const submit=e=>{e.preventDefault();setBusy(true);setError('');loginAsAdmin({email});window.setTimeout(()=>{setBusy(false);onNavigate('/admin/dashboard');},250);};
  const field={hidden:{opacity:0,y:10},show:{opacity:1,y:0}};
  return <main className="admin-login-root"><motion.i className="admin-login-blob admin-login-blob-a" animate={{x:[0,25,0],y:[0,-20,0]}} transition={{duration:8,repeat:Infinity}}/><motion.i className="admin-login-blob admin-login-blob-b" animate={{y:[0,25,0]}} transition={{duration:6,repeat:Infinity}}/>
    <motion.section className="admin-login-card" initial={{opacity:0,y:24,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{type:'spring',bounce:.3,duration:.55}}>
      <motion.div className="admin-login-icon" animate={{scale:[1,1.06,1],opacity:[.9,1,.9]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}><ShieldCheck size={31}/></motion.div>
      <p className="admin-login-kicker">PLOOKPLOEN CONTROL ROOM</p><h1 className="sg-display">เข้าสู่ระบบผู้ดูแล</h1><p className="admin-login-subtitle">สำหรับผู้ดูแลระบบเท่านั้น</p>
      <motion.form onSubmit={submit} initial="hidden" animate="show" transition={{staggerChildren:.07}}><motion.label variants={field}>อีเมล<span><Mail size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/></span></motion.label><motion.label variants={field}>รหัสผ่าน<span><LockKeyhole size={18}/><input type={visible?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/><button type="button" aria-label="แสดงหรือซ่อนรหัสผ่าน" onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></motion.label><AnimatePresence>{error&&<motion.p className="admin-login-error" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0,x:[0,-6,6,-4,4,0]}} exit={{opacity:0}}>{error}</motion.p>}</AnimatePresence><motion.button variants={field} type="submit" whileHover={{scale:1.02}} whileTap={{scale:.98}} disabled={busy}>{busy?<span className="admin-login-loading">กำลังตรวจสอบ<i/><i/><i/></span>:'เข้าสู่แดชบอร์ด'}</motion.button></motion.form>
      <button className="admin-login-back" onClick={()=>onNavigate('/login')}>← กลับสู่หน้าเข้าสู่ระบบผู้ใช้ทั่วไป</button>
    </motion.section>
  </main>;
}
