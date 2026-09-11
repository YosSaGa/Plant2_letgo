import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * SceneBackground.jsx
 * Cozy 2D Storybook Cartoon Landscape Scene using generated JPG backgrounds
 * with animated SVG overlays (clouds, birds, butterflies, fireflies).
 *
 * Background images are in /assets/garden/backgrounds/
 * - bg_morning.jpg
 * - bg_afternoon.jpg
 * - bg_evening.jpg
 */

const BG_MAP = {
  morning: '/assets/garden/backgrounds/bg_morning.jpg',
  afternoon: '/assets/garden/backgrounds/bg_afternoon.jpg',
  evening: '/assets/garden/backgrounds/bg_evening.jpg',
};

export default function SceneBackground({ timeOfDay = 'afternoon' }) {
  const bgSrc = BG_MAP[timeOfDay] || BG_MAP.afternoon;

  // นกยามเช้า
  const morningBirds = useMemo(() => [
    { id: 1, top: 16, delay: 0, duration: 20, scale: 0.85 },
    { id: 2, top: 22, delay: 3, duration: 24, scale: 0.7 },
    { id: 3, top: 14, delay: 1.5, duration: 22, scale: 0.9 },
  ], []);

  // ผีเสื้อยามบ่าย
  const butterflies = useMemo(() => [
    { id: 1, left: '20%', bottom: '36%', color: '#f59e0b', duration: 6.5, delay: 0 },
    { id: 2, left: '76%', bottom: '40%', color: '#ec4899', duration: 7.5, delay: 2 },
  ], []);

  // หิ่งห้อยยามเย็น (Sunset)
  const fireflies = useMemo(() => [
    { id: 1, left: '18%', bottom: '28%', delay: '0s', duration: '4.5s' },
    { id: 2, left: '32%', bottom: '42%', delay: '1.2s', duration: '5.2s' },
    { id: 3, left: '58%', bottom: '34%', delay: '2.4s', duration: '4.8s' },
    { id: 4, left: '82%', bottom: '44%', delay: '0.8s', duration: '6s' },
    { id: 5, left: '68%', bottom: '24%', delay: '1.8s', duration: '5.5s' },
    { id: 6, left: '44%', bottom: '26%', delay: '3.1s', duration: '5s' },
  ], []);

  return (
    <div className={`gs-scene-bg gs-time-${timeOfDay}`}>
      {/* 1. Background Image Layer */}
      <img
        src={bgSrc}
        alt={`Garden scene - ${timeOfDay}`}
        className="gs-bg-image"
        draggable={false}
      />

      {/* 2. Animated Overlay Creatures */}
      {timeOfDay === 'morning' && (
        <>
          {morningBirds.map((bird) => (
            <motion.div
              key={bird.id}
              className="gs-morning-bird"
              style={{ top: `${bird.top}%`, transform: `scale(${bird.scale})` }}
              initial={{ x: '-15vw' }}
              animate={{ x: '115vw' }}
              transition={{
                duration: bird.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: bird.delay,
              }}
            >
              <svg viewBox="0 0 32 16" width="30" height="15" fill="none">
                <path
                  d="M2 10 C8 3, 14 6, 16 10 C18 6, 24 3, 30 10"
                  stroke="#475569"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          ))}
        </>
      )}

      {timeOfDay === 'afternoon' && (
        <>
          {butterflies.map((b) => (
            <motion.div
              key={b.id}
              className="gs-butterfly"
              style={{ left: b.left, bottom: b.bottom }}
              animate={{
                x: [-15, 18, -10, 15, -15],
                y: [-20, 6, -14, 16, -20],
                rotate: [-12, 14, -8, 10, -12],
              }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: b.delay,
              }}
            >
              <svg viewBox="0 0 26 26" width="22" height="22">
                <path d="M13 13 C8 4, 1 6, 3 13 C1 20, 8 20, 13 15 Z" fill={b.color} opacity="0.95" />
                <path d="M13 13 C18 4, 25 6, 23 13 C25 20, 18 20, 13 15 Z" fill={b.color} opacity="0.95" />
                <circle cx="13" cy="13" r="2.2" fill="#1e293b" />
              </svg>
            </motion.div>
          ))}
        </>
      )}

      {timeOfDay === 'evening' && (
        <>
          {fireflies.map((f) => (
            <div
              key={f.id}
              className="gs-firefly-glow"
              style={{
                left: f.left,
                bottom: f.bottom,
                animationDelay: f.delay,
                animationDuration: f.duration,
              }}
            />
          ))}
        </>
      )}

      {/* 3. Warm Sparkle Particles (all times) */}
      <div className="gs-sparkle-layer">
        <span className="gs-glow-dot" style={{ left: '25%', top: '35%' }} />
        <span className="gs-glow-dot" style={{ left: '48%', top: '22%' }} />
        <span className="gs-glow-dot" style={{ left: '72%', top: '30%' }} />
        <span className="gs-glow-dot" style={{ left: '84%', top: '45%' }} />
      </div>
    </div>
  );
}
