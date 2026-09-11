import React from 'react';
import { Warp } from '@paper-design/shaders-react';
import { motion } from 'framer-motion';
import { Play, Check, ExternalLink } from 'lucide-react';

// Preset shader configurations for 4 color themes
const THEME_SHADERS = {
  emerald: [
    {
      proportion: 0.35,
      softness: 0.9,
      distortion: 0.16,
      swirl: 0.65,
      swirlIterations: 10,
      shape: 'checks',
      shapeScale: 0.09,
      colors: ['hsl(142, 80%, 20%)', 'hsl(158, 85%, 48%)', 'hsl(168, 80%, 28%)', 'hsl(140, 95%, 64%)'],
    },
    {
      proportion: 0.4,
      softness: 1.1,
      distortion: 0.2,
      swirl: 0.85,
      swirlIterations: 12,
      shape: 'dots',
      shapeScale: 0.11,
      colors: ['hsl(132, 75%, 22%)', 'hsl(148, 82%, 46%)', 'hsl(160, 76%, 30%)', 'hsl(136, 90%, 62%)'],
    },
    {
      proportion: 0.32,
      softness: 0.85,
      distortion: 0.18,
      swirl: 0.72,
      swirlIterations: 9,
      shape: 'checks',
      shapeScale: 0.1,
      colors: ['hsl(148, 84%, 18%)', 'hsl(165, 88%, 45%)', 'hsl(175, 78%, 26%)', 'hsl(152, 92%, 62%)'],
    },
    {
      proportion: 0.42,
      softness: 1.0,
      distortion: 0.17,
      swirl: 0.78,
      swirlIterations: 11,
      shape: 'dots',
      shapeScale: 0.1,
      colors: ['hsl(125, 78%, 24%)', 'hsl(142, 86%, 48%)', 'hsl(156, 80%, 28%)', 'hsl(130, 92%, 66%)'],
    },
    {
      proportion: 0.36,
      softness: 0.92,
      distortion: 0.19,
      swirl: 0.8,
      swirlIterations: 10,
      shape: 'checks',
      shapeScale: 0.11,
      colors: ['hsl(152, 74%, 20%)', 'hsl(168, 84%, 48%)', 'hsl(178, 76%, 28%)', 'hsl(146, 88%, 62%)'],
    },
    {
      proportion: 0.38,
      softness: 1.05,
      distortion: 0.21,
      swirl: 0.88,
      swirlIterations: 13,
      shape: 'dots',
      shapeScale: 0.12,
      colors: ['hsl(138, 82%, 19%)', 'hsl(154, 88%, 45%)', 'hsl(166, 80%, 26%)', 'hsl(144, 94%, 65%)'],
    },
    {
      proportion: 0.34,
      softness: 0.88,
      distortion: 0.15,
      swirl: 0.7,
      swirlIterations: 8,
      shape: 'checks',
      shapeScale: 0.09,
      colors: ['hsl(130, 76%, 22%)', 'hsl(146, 84%, 50%)', 'hsl(158, 78%, 30%)', 'hsl(134, 90%, 64%)'],
    },
    {
      proportion: 0.44,
      softness: 1.15,
      distortion: 0.22,
      swirl: 0.9,
      swirlIterations: 14,
      shape: 'dots',
      shapeScale: 0.13,
      colors: ['hsl(144, 78%, 22%)', 'hsl(162, 85%, 48%)', 'hsl(172, 80%, 28%)', 'hsl(150, 90%, 64%)'],
    },
  ],
  cyber: [
    {
      proportion: 0.38,
      softness: 1.0,
      distortion: 0.2,
      swirl: 0.8,
      swirlIterations: 12,
      shape: 'checks',
      shapeScale: 0.1,
      colors: ['hsl(190, 100%, 22%)', 'hsl(170, 100%, 55%)', 'hsl(210, 90%, 30%)', 'hsl(150, 100%, 65%)'],
    },
    {
      proportion: 0.42,
      softness: 1.2,
      distortion: 0.22,
      swirl: 0.9,
      swirlIterations: 14,
      shape: 'dots',
      shapeScale: 0.12,
      colors: ['hsl(200, 100%, 20%)', 'hsl(180, 100%, 50%)', 'hsl(160, 90%, 35%)', 'hsl(190, 100%, 70%)'],
    },
  ],
  sunset: [
    {
      proportion: 0.35,
      softness: 0.9,
      distortion: 0.18,
      swirl: 0.75,
      swirlIterations: 10,
      shape: 'dots',
      shapeScale: 0.1,
      colors: ['hsl(30, 100%, 30%)', 'hsl(45, 100%, 58%)', 'hsl(15, 90%, 38%)', 'hsl(55, 100%, 70%)'],
    },
    {
      proportion: 0.4,
      softness: 1.1,
      distortion: 0.2,
      swirl: 0.85,
      swirlIterations: 12,
      shape: 'checks',
      shapeScale: 0.11,
      colors: ['hsl(20, 100%, 28%)', 'hsl(38, 100%, 55%)', 'hsl(8, 90%, 35%)', 'hsl(48, 100%, 68%)'],
    },
  ],
  midnight: [
    {
      proportion: 0.36,
      softness: 0.95,
      distortion: 0.18,
      swirl: 0.8,
      swirlIterations: 11,
      shape: 'checks',
      shapeScale: 0.11,
      colors: ['hsl(270, 90%, 25%)', 'hsl(295, 95%, 55%)', 'hsl(250, 85%, 32%)', 'hsl(285, 100%, 70%)'],
    },
    {
      proportion: 0.42,
      softness: 1.15,
      distortion: 0.22,
      swirl: 0.9,
      swirlIterations: 13,
      shape: 'dots',
      shapeScale: 0.12,
      colors: ['hsl(260, 88%, 24%)', 'hsl(280, 92%, 52%)', 'hsl(240, 80%, 30%)', 'hsl(275, 95%, 68%)'],
    },
  ],
};

export default function ShaderTestCard({
  module,
  index = 0,
  isSelected = false,
  onSelect,
  onLaunch,
  theme = 'emerald',
  enableShader = true,
}) {
  const themeList = THEME_SHADERS[theme] || THEME_SHADERS.emerald;
  const shaderConfig = themeList[index % themeList.length];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (typeof onSelect === 'function') onSelect(module.id);
      }}
      className={`qa-shader-card-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        minHeight: '260px',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isSelected
          ? '0 12px 35px rgba(5, 150, 105, 0.4), 0 0 0 2.5px #10b981'
          : '0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Background WebGL Shader Canvas */}
      {enableShader ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            opacity: isSelected ? 0.95 : 0.75,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Warp
            style={{ width: '100%', height: '100%' }}
            proportion={shaderConfig.proportion}
            softness={shaderConfig.softness}
            distortion={shaderConfig.distortion}
            swirl={shaderConfig.swirl}
            swirlIterations={shaderConfig.swirlIterations}
            shape={shaderConfig.shape}
            shapeScale={shaderConfig.shapeScale}
            scale={1}
            rotation={0}
            speed={0.7}
            colors={shaderConfig.colors}
          />
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: isSelected
              ? 'linear-gradient(135deg, #064e3b, #0f766e)'
              : 'linear-gradient(135deg, #0f172a, #1e293b)',
          }}
        />
      )}

      {/* Glassmorphism Overlay Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '22px 24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: isSelected
            ? 'rgba(6, 78, 59, 0.78)'
            : 'rgba(15, 23, 42, 0.78)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: isSelected
            ? '1px solid rgba(52, 211, 153, 0.6)'
            : '1px solid rgba(255, 255, 255, 0.14)',
          color: '#ffffff',
          borderRadius: '24px',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Header: Icon & Route Tag */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.12)',
                  border: isSelected ? '1.5px solid #34d399' : '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  boxShadow: isSelected ? '0 0 16px rgba(52, 211, 153, 0.5)' : 'none',
                }}
              >
                {module.icon}
              </div>
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: isSelected ? '#6ee7b7' : '#94a3b8',
                  }}
                >
                  {module.badge}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#38bdf8',
                      background: 'rgba(2, 132, 199, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    {module.path}
                  </span>
                </div>
              </div>
            </div>

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 0 14px #10b981',
                }}
              >
                <Check size={16} strokeWidth={3} />
              </motion.div>
            )}
          </div>

          {/* Title & Description */}
          <h4
            style={{
              margin: '0 0 8px 0',
              fontSize: '17px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.35,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {module.title}
          </h4>

          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#e2e8f0',
              lineHeight: 1.5,
              fontWeight: 400,
              opacity: 0.92,
            }}
          >
            {module.description}
          </p>
        </div>

        {/* Footer: Selection Status & Quick Launch */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: isSelected ? '#a7f3d0' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {isSelected ? '🟢 กำลังเลือกโมดูลนี้' : '⚪ คลิกเพื่อเลือก'}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onLaunch === 'function') onLaunch(module.id);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: '10px',
              border: 'none',
              background: isSelected
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isSelected ? '0 4px 14px rgba(16, 185, 129, 0.45)' : 'none',
              transition: 'all 0.2s ease',
            }}
            title="เปิดหน้าเว็บและเริ่มรันการทดสอบทันที"
          >
            <Play size={13} fill="currentColor" />
            <span>รันหน้านี้</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
