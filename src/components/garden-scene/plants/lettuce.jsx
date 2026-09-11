import React from 'react';

/**
 * lettuce.jsx
 * 4 Growth Stages for Lettuce (ผักกาดหอม):
 * 1. LettuceSeed
 * 2. LettuceSeedling
 * 3. LettuceMature (dense ruffled crisp green rosette)
 * 4. LettuceFruiting (full giant crispy harvest-ready rosette with floral stalk)
 */

export function LettuceSeed() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="letSoilGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#5c2e10" />
          <stop offset="60%" stopColor="#371705" />
          <stop offset="100%" stopColor="#200a02" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="210" rx="75" ry="16" fill="rgba(0,0,0,0.18)" />
      <path d="M40 205 C50 170, 90 155, 120 155 C150 155, 190 170, 200 205 C205 215, 180 222, 120 222 C60 222, 35 215, 40 205 Z" fill="url(#letSoilGrad)" />
      <circle cx="86" cy="195" r="4" fill="#a16207" opacity="0.6" />
      <circle cx="152" cy="188" r="4" fill="#a16207" opacity="0.6" />
      {/* Name Stake */}
      <rect x="114" y="115" width="12" height="60" rx="3" fill="#65a30d" />
      <rect x="75" y="85" width="90" height="42" rx="10" fill="#f7fee7" stroke="#65a30d" strokeWidth="2.5" />
      <text x="120" y="112" textAnchor="middle" fontSize="15" fontWeight="700" fill="#3f6212">🥬 เมล็ดผักกาด</text>
      {/* Tiny Lettuce Seeds */}
      <ellipse cx="116" cy="164" rx="4" ry="2" transform="rotate(-15 116 164)" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
      <ellipse cx="125" cy="166" rx="3.5" ry="1.8" transform="rotate(20 125 166)" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
    </svg>
  );
}

export function LettuceSeedling() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="letStemYoung" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="212" rx="55" ry="12" fill="rgba(0,0,0,0.18)" />
      <path d="M60 210 C70 188, 95 180, 120 180 C145 180, 170 188, 180 210 C185 218, 160 222, 120 222 C80 222, 55 218, 60 210 Z" fill="#451a03" />

      {/* Short Tender Stem */}
      <path d="M120 195 C120 175, 119 160, 120 145" stroke="url(#letStemYoung)" strokeWidth="6" strokeLinecap="round" />

      {/* Ruffled Cotyledons Left */}
      <path d="M120 160 C95 165, 75 150, 72 135 C82 128, 95 138, 105 130 C114 142, 118 152, 120 160 Z" fill="#84cc16" />
      {/* Ruffled Cotyledons Right */}
      <path d="M120 158 C145 163, 165 148, 168 133 C158 126, 145 136, 135 128 C126 140, 122 150, 120 158 Z" fill="#65a30d" />

      {/* Tender Center Wavy Lettuce Leaves */}
      <path d="M120 145 C92 140, 76 115, 82 92 C98 94, 104 105, 112 98 C116 115, 118 130, 120 145 Z" fill="#bef264" />
      <path d="M120 142 C148 138, 164 112, 158 90 C142 92, 136 102, 128 95 C124 112, 122 128, 120 142 Z" fill="#a3e635" />

      {/* Top Tender Heart */}
      <path d="M120 145 C112 128, 114 105, 120 100 C126 105, 128 128, 120 145 Z" fill="#d9f99d" stroke="#84cc16" strokeWidth="1.5" />
    </svg>
  );
}

export function LettuceMature() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="letRosetteGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#ecfccb" />
          <stop offset="45%" stopColor="#bef264" />
          <stop offset="75%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="72" ry="14" fill="rgba(0,0,0,0.2)" />
      <path d="M50 212 C60 190, 92 182, 120 182 C148 182, 180 190, 190 212 C195 220, 168 224, 120 224 C72 224, 45 220, 50 212 Z" fill="#451a03" />

      {/* Compact Ruffled Lettuce Head - Outer Fluted Skirt */}
      <path d="M40 185 C25 165, 25 140, 42 122 C55 125, 62 140, 75 132 C85 145, 95 165, 120 175 C100 185, 65 190, 40 185 Z" fill="#4d7c0f" />
      <path d="M200 185 C215 165, 215 140, 198 122 C185 125, 178 140, 165 132 C155 145, 145 165, 120 175 C140 185, 175 190, 200 185 Z" fill="#3f6212" />

      {/* Mid Layer Ruffled Wavy Rosette */}
      <path d="M52 165 C38 135, 48 105, 75 95 C88 105, 95 98, 108 112 C98 135, 108 155, 120 170 C95 172, 70 170, 52 165 Z" fill="#65a30d" />
      <path d="M188 165 C202 135, 192 105, 165 95 C152 105, 145 98, 132 112 C142 135, 132 155, 120 170 C145 172, 170 170, 188 165 Z" fill="#84cc16" />

      {/* Inner Crisp Lime Curly Heart */}
      <path d="M72 145 C65 118, 80 88, 105 78 C115 88, 125 82, 135 90 C125 115, 128 138, 120 160 C100 158, 82 155, 72 145 Z" fill="#a3e635" />
      <path d="M168 145 C175 118, 160 88, 135 78 C125 88, 115 82, 105 90 C115 115, 112 138, 120 160 C140 158, 158 155, 168 145 Z" fill="#bef264" />

      {/* Core Center Tender Rosette Bud */}
      <ellipse cx="120" cy="115" rx="28" ry="32" fill="url(#letRosetteGrad)" />
      <path d="M102 112 C110 95, 120 95, 128 108" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M112 125 C122 110, 130 115, 138 122" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function LettuceFruiting() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="letFruitRosette" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#f7fee7" />
          <stop offset="35%" stopColor="#d9f99d" />
          <stop offset="70%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="78" ry="16" fill="rgba(0,0,0,0.22)" />
      <path d="M45 212 C55 188, 90 180, 120 180 C150 180, 185 188, 195 212 C200 220, 172 224, 120 224 C68 224, 40 220, 45 212 Z" fill="#3b1704" />

      {/* Giant Crisp Rosette Base (Ready to Harvest) */}
      <path d="M30 185 C15 160, 15 130, 36 110 C52 114, 60 132, 75 122 C88 140, 98 162, 120 172 C95 182, 60 190, 30 185 Z" fill="#3f6212" />
      <path d="M210 185 C225 160, 225 130, 204 110 C188 114, 180 132, 165 122 C152 140, 142 162, 120 172 C145 182, 180 190, 210 185 Z" fill="#3f6212" />

      {/* Ruffled Side Wings */}
      <path d="M48 160 C32 125, 45 92, 75 80 C90 92, 98 84, 112 100 C102 128, 110 152, 120 168 C92 170, 65 168, 48 160 Z" fill="#65a30d" />
      <path d="M192 160 C208 125, 195 92, 165 80 C150 92, 142 84, 128 100 C138 128, 130 152, 120 168 C148 170, 175 168, 192 160 Z" fill="#84cc16" />

      {/* Lush Rosette Bowl */}
      <circle cx="120" cy="142" r="42" fill="url(#letFruitRosette)" />

      {/* Crispy Ruffled Veins */}
      <path d="M98 135 C110 118, 125 118, 136 132" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M108 152 C118 138, 128 142, 138 148" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

      {/* Bolted Flowering Stalk Emerging (Fruiting/Seed Phase) */}
      <path d="M120 135 L120 30" stroke="#84cc16" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M120 95 C108 85, 95 80, 85 70" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" />
      <path d="M120 75 C132 65, 145 60, 155 50" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" />

      {/* Small Bright Golden Dandelion-like Lettuce Flowers on Stalk */}
      {/* Center Top Flower */}
      <g transform="translate(120, 24)">
        <circle cx="0" cy="0" r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="4" fill="#f59e0b" />
        <circle cx="-5" cy="-5" r="2.5" fill="#fef08a" />
        <circle cx="5" cy="-5" r="2.5" fill="#fef08a" />
        <circle cx="-5" cy="5" r="2.5" fill="#fef08a" />
        <circle cx="5" cy="5" r="2.5" fill="#fef08a" />
      </g>
      {/* Left Stalk Flower */}
      <g transform="translate(85, 68)">
        <circle cx="0" cy="0" r="6.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="3" fill="#f59e0b" />
      </g>
      {/* Right Stalk Flower */}
      <g transform="translate(155, 48)">
        <circle cx="0" cy="0" r="6.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="3" fill="#f59e0b" />
      </g>
    </svg>
  );
}
