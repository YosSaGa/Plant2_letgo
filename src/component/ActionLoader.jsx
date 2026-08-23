import { motion } from 'framer-motion';
import './action-loader.css';

export default function ActionLoader({ title, detail }) {
  return <motion.div className="al-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-live="polite"><motion.div className="al-card" initial={{ scale: .82, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: .9, opacity: 0 }} transition={{ type: 'spring', bounce: .38 }}><div className="al-scene"><motion.span className="al-cloud" animate={{ x: [-20, 20, -20] }} transition={{ duration: 4, repeat: Infinity }}>☁️</motion.span><motion.span className="al-sprout" animate={{ y: [8, -8, 8], rotate: [-4, 4, -4] }} transition={{ duration: 1.6, repeat: Infinity }}>🌱</motion.span><motion.i className="al-ring" animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} /></div><p>{title}</p><small>{detail}</small><div className="al-dots"><i /><i /><i /></div></motion.div></motion.div>;
}
