import { motion } from 'framer-motion';
import '../auth/auth.css';
import '../auth/auth-navigation.css';

export default function AuthForm({ title, subtitle, children, onHome }) {
  const goHome = () => onHome?.();
  return <main className="auth-root">
    <motion.i className="auth-blob auth-blob-one" animate={{ y: [0, -24, 0], x: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity }} />
    <motion.i className="auth-blob auth-blob-two" animate={{ y: [0, 22, 0] }} transition={{ duration: 6, repeat: Infinity }} />
    <div className="auth-layout">
      <motion.section className="auth-card" initial={{ opacity: 0, y: 30, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: .35, duration: .6 }}>
        <motion.button type="button" className="auth-mark" aria-label="กลับหน้าแรก" onClick={goHome} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>🌿</motion.button>
        <p className="auth-brand">PlookPloen</p><h1 className="sg-display">{title}</h1><p className="auth-subtitle">{subtitle}</p>
        {children}
        <button type="button" className="auth-back-home" onClick={goHome}>← กลับหน้าแรก</button>
      </motion.section>
      <motion.aside className="auth-art" role="button" tabIndex={0} aria-label="กลับหน้าแรก" onClick={goHome} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') goHome(); }} initial={{ opacity: 0, x: 35 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .16, duration: .6 }}>
        <motion.span className="auth-plant auth-plant-a" animate={{ y: [0, -17, 0], rotate: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity }}>🪴</motion.span><motion.span className="auth-plant auth-plant-b" animate={{ y: [0, 14, 0] }} transition={{ duration: 3.4, repeat: Infinity }}>🌿</motion.span><motion.span className="auth-plant auth-plant-c" animate={{ x: [0, 12, 0], rotate: [0, 12, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>🍃</motion.span>
        <p>ดูแลสวนของคุณ<br/><strong>ให้เติบโตอย่างมีความสุข</strong></p><small>ทุกบันทึกการปลูก อยู่ใกล้คุณเสมอ</small>
      </motion.aside>
    </div>
  </main>;
}
