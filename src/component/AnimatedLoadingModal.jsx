import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

let cachedPathLength = 0;
let stylesInjected = false;

const LOADER_KEYFRAMES = `
  @keyframes drawStroke {
    0% {
      stroke-dashoffset: var(--path-length);
      animation-timing-function: ease-in-out;
    }
    50% {
      stroke-dashoffset: 0;
      animation-timing-function: ease-in-out;
    }
    100% {
      stroke-dashoffset: calc(var(--path-length) * -1);
    }
  }
  @keyframes textShimmerModal {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }
  .modal-shimmer-text {
    background: linear-gradient(
      90deg,
      #047857 0%,
      #10b981 30%,
      #34d399 50%,
      #10b981 70%,
      #047857 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: textShimmerModal 2.4s ease-in-out infinite;
  }
`;

export function SvgPathLoader({ size = 56, strokeWidth = 2.5, className, ...props }) {
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(cachedPathLength);

  useEffect(() => {
    if (typeof window !== 'undefined' && !stylesInjected) {
      stylesInjected = true;
      const style = document.createElement('style');
      style.innerHTML = LOADER_KEYFRAMES;
      document.head.appendChild(style);
    }

    if (!cachedPathLength && pathRef.current) {
      try {
        cachedPathLength = pathRef.current.getTotalLength();
        setPathLength(cachedPathLength);
      } catch {
        setPathLength(100);
      }
    }
  }, []);

  const isReady = pathLength > 0;

  return (
    <svg
      role="status"
      aria-label="Loading..."
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn("text-emerald-500", className)}
      {...props}
    >
      <path
        ref={pathRef}
        d="M4.43431 2.42415C-0.789139 6.90104 1.21472 15.2022 8.434 15.9242C15.5762 16.6384 18.8649 9.23035 15.9332 4.5183C14.1316 1.62255 8.43695 0.0528911 7.51841 3.33733C6.48107 7.04659 15.2699 15.0195 17.4343 16.9241"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={
          isReady
            ? {
                strokeDasharray: pathLength,
                '--path-length': `${pathLength}px`,
              }
            : undefined
        }
        className={cn(
          "transition-opacity duration-300",
          isReady ? "opacity-100" : "opacity-0"
        )}
      />
    </svg>
  );
}

export function AnimatedLoadingModal({ isOpen, plantName }) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { title: "กำลังแปลงพิกเซลภาพใบพืช...", subtitle: "เตรียมข้อมูลขนาด 224x224 พิกเซล" },
    { title: "ประมวลผลผ่าน MobileNetV3 (CNN)...", subtitle: "สกัดคุณลักษณะของลวดลายและสีรอยโรค" },
    { title: `วิเคราะห์เทียบเคียงโรคใน${plantName || 'พืช'}...`, subtitle: "คำนวณค่าความมั่นใจ (Confidence Score)" },
    { title: "รวบรวมคำแนะนำการรักษาและวินิจฉัย...", subtitle: "เตรียมบันทึกผลลงฐานข้อมูล Supabase" }
  ];

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 650);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ai-loading-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md"
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(6, 44, 30, 0.45)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-full max-w-md overflow-hidden bg-white/95 rounded-3xl shadow-2xl border border-emerald-100 p-7 text-center relative"
            style={{ width: 'min(440px, 92vw)', background: 'rgba(255, 255, 255, 0.96)', borderRadius: '28px', border: '1px solid #d1fae5', padding: '34px 28px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.28)' }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', marginBottom: '18px' }}>
              <Cpu size={14} className="text-emerald-600 animate-pulse" />
              <span>MobileNetV3 Deep Learning</span>
            </div>

            <div style={{ position: 'relative', width: '74px', height: '74px', margin: '0 auto 16px', display: 'grid', placeItems: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: '#d1fae5',
                  filter: 'blur(10px)',
                  opacity: 0.7,
                }}
              />
              <SvgPathLoader
                size={58}
                strokeWidth={2.6}
                style={{
                  color: '#059669',
                  animation: 'drawStroke 2.2s infinite ease-in-out',
                }}
              />
            </div>

            <div style={{ minHeight: '52px', margin: '8px 0 16px' }}>
              <h4
                className="modal-shimmer-text"
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  margin: '0 0 4px',
                  fontFamily: 'Prompt, sans-serif',
                }}
              >
                {steps[stepIndex].title}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {steps[stepIndex].subtitle}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                margin: '12px 0 16px',
                fontSize: '12px',
                color: '#475569',
              }}
            >
              <Sparkles size={14} style={{ color: '#10b981' }} />
              <span>ขั้นตอนที่ {stepIndex + 1} จาก {steps.length}</span>
              <ChevronRight size={14} style={{ color: '#94a3b8' }} />
              <span style={{ fontWeight: 600, color: '#0f766e' }}>ความแม่นยำ 99.12%</span>
            </div>

            <div
              style={{
                width: '100%',
                height: '6px',
                background: '#e2e8f0',
                borderRadius: '99px',
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #34d399, #059669)',
                  borderRadius: '99px',
                }}
                initial={{ width: '12%' }}
                animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
