import React from 'react';

/**
 * basil.jsx
 * 4 Growth Stages for Sweet Basil (โหระพา):
 * 1. BasilSeed
 * 2. BasilSeedling
 * 3. BasilMature
 * 4. BasilFruiting (with distinctive purple flower spikes)
 */

export function BasilSeed() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="basilSoilGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#652b0d" />
          <stop offset="60%" stopColor="#3b1704" />
          <stop offset="100%" stopColor="#220b02" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="210" rx="75" ry="16" fill="rgba(0,0,0,0.18)" />
      <path d="M40 205 C50 170, 90 155, 120 155 C150 155, 190 170, 200 205 C205 215, 180 222, 120 222 C60 222, 35 215, 40 205 Z" fill="url(#basilSoilGrad)" />
      {/* Pebbles */}
      <circle cx="90" cy="195" r="4" fill="#a16207" opacity="0.6" />
      <circle cx="145" cy="188" r="5" fill="#a16207" opacity="0.6" />
      <circle cx="118" cy="178" r="3.5" fill="#ca8a04" opacity="0.5" />
      {/* Name Stake */}
      <rect x="114" y="115" width="12" height="60" rx="3" fill="#047857" />
      <rect x="75" y="85" width="90" height="42" rx="10" fill="#ecfdf5" stroke="#047857" strokeWidth="2.5" />
      <text x="120" y="112" textAnchor="middle" fontSize="15" fontWeight="700" fill="#065f46">🌱 เมล็ดโหระพา</text>
      {/* Tiny Basil Seeds in furrows */}
      <circle cx="115" cy="164" r="3" fill="#1e293b" />
      <circle cx="123" cy="162" r="2.8" fill="#1e293b" />
      <circle cx="128" cy="166" r="2.5" fill="#1e293b" />
    </svg>
  );
}

export function BasilSeedling() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="basilStem" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="50%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="basilLeafL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="basilLeafR" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="212" rx="55" ry="12" fill="rgba(0,0,0,0.18)" />
      <path d="M60 210 C70 188, 95 180, 120 180 C145 180, 170 188, 180 210 C185 218, 160 222, 120 222 C80 222, 55 218, 60 210 Z" fill="#451a03" />

      {/* Stem with cute subtle purple hue at base */}
      <path d="M120 190 C120 160, 118 135, 120 110" stroke="url(#basilStem)" strokeWidth="6" strokeLinecap="round" />

      {/* Lower Rounded Oval Leaves */}
      <path d="M118 155 C90 160, 72 145, 75 130 C88 126, 110 140, 118 152 Z" fill="url(#basilLeafL)" />
      <path d="M120 150 C148 155, 166 140, 163 125 C150 121, 128 135, 120 147 Z" fill="url(#basilLeafR)" />

      {/* Upper Glossy Spoon-shaped Leaves */}
      <path d="M120 115 C85 110, 68 85, 72 65 C95 65, 115 90, 120 110 Z" fill="url(#basilLeafL)" />
      <path d="M120 110 C118 90, 95 72, 72 65" stroke="#15803d" strokeWidth="1.8" />

      <path d="M120 112 C155 107, 172 82, 168 62 C145 62, 125 87, 120 107 Z" fill="url(#basilLeafR)" />
      <path d="M120 107 C122 87, 145 69, 168 62" stroke="#15803d" strokeWidth="1.8" />

      {/* Tender Top Shoot */}
      <path d="M120 110 C114 96, 118 82, 120 80 C122 82, 126 96, 120 110 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" />
    </svg>
  );
}

export function BasilMature() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="basilMatStem" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b0764" />
          <stop offset="40%" stopColor="#581c87" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="basilMatLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="68" ry="14" fill="rgba(0,0,0,0.2)" />
      <path d="M55 212 C65 190, 95 182, 120 182 C145 182, 175 190, 185 212 C190 220, 165 224, 120 224 C75 224, 50 220, 55 212 Z" fill="#451a03" />

      {/* Strong Purple-Tinted Stems */}
      <path d="M120 195 C120 155, 118 120, 120 70" stroke="url(#basilMatStem)" strokeWidth="8" strokeLinecap="round" />
      <path d="M118 145 C90 130, 68 115, 48 95" stroke="url(#basilMatStem)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M120 135 C150 120, 172 105, 192 85" stroke="url(#basilMatStem)" strokeWidth="5.5" strokeLinecap="round" />

      {/* Lush Rounded Ovate Basil Leaves - Lower Tier */}
      <path d="M48 95 C25 90, 12 70, 18 48 C42 45, 58 70, 48 95 Z" fill="url(#basilMatLeaf)" />
      <path d="M192 85 C215 80, 228 60, 222 38 C198 35, 182 60, 192 85 Z" fill="url(#basilMatLeaf)" />

      {/* Mid Tier Leaves */}
      <path d="M85 120 C55 110, 42 85, 48 62 C74 60, 92 90, 85 120 Z" fill="url(#basilMatLeaf)" />
      <path d="M155 110 C185 100, 198 75, 192 52 C166 50, 148 80, 155 110 Z" fill="url(#basilMatLeaf)" />

      {/* Crown Canopy Foliage */}
      <path d="M118 80 C85 70, 72 45, 80 25 C105 25, 120 52, 118 80 Z" fill="url(#basilMatLeaf)" />
      <path d="M120 75 C155 65, 168 40, 160 20 C135 20, 120 47, 120 75 Z" fill="url(#basilMatLeaf)" />
      <path d="M120 65 C108 45, 112 25, 120 15 C128 25, 132 45, 120 65 Z" fill="#86efac" />
    </svg>
  );
}

export function BasilFruiting() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="basilFruitingStem" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b0764" />
          <stop offset="60%" stopColor="#6b21a8" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="purpleSpikeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7e22ce" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f3e8ff" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="72" ry="15" fill="rgba(0,0,0,0.22)" />
      <path d="M50 212 C60 188, 92 180, 120 180 C148 180, 180 188, 190 212 C195 220, 168 224, 120 224 C72 224, 45 220, 50 212 Z" fill="#3b1704" />

      {/* Main Woody Purple Stem */}
      <path d="M120 195 C120 155, 118 120, 120 80" stroke="url(#basilFruitingStem)" strokeWidth="8.5" strokeLinecap="round" />
      <path d="M118 140 C88 125, 65 110, 45 88" stroke="url(#basilFruitingStem)" strokeWidth="6" strokeLinecap="round" />
      <path d="M120 130 C152 115, 175 100, 195 78" stroke="url(#basilFruitingStem)" strokeWidth="6" strokeLinecap="round" />

      {/* Dense Aromatic Foliage */}
      <path d="M45 88 C20 82, 10 60, 18 38 C42 35, 58 60, 45 88 Z" fill="#22c55e" />
      <path d="M195 78 C220 72, 230 50, 222 28 C198 25, 182 50, 195 78 Z" fill="#16a34a" />
      <path d="M85 115 C55 105, 45 80, 52 58 C78 55, 95 85, 85 115 Z" fill="#15803d" />
      <path d="M155 105 C185 95, 195 70, 188 48 C162 45, 145 75, 155 105 Z" fill="#22c55e" />
      <path d="M118 90 C85 80, 75 55, 82 35 C108 35, 120 62, 118 90 Z" fill="#16a34a" />
      <path d="M122 85 C155 75, 165 50, 158 30 C132 30, 120 57, 122 85 Z" fill="#15803d" />

      {/* DISTINCTIVE SWEET BASIL PURPLE FLOWER SPIKES */}
      {/* Central Tall Flower Spike */}
      <g>
        <path d="M120 80 L120 12" stroke="#6b21a8" strokeWidth="4" strokeLinecap="round" />
        {/* Flower Whorls */}
        <ellipse cx="120" cy="65" rx="11" ry="5" fill="#a855f7" />
        <ellipse cx="120" cy="52" rx="10" ry="4.5" fill="#c084fc" />
        <ellipse cx="120" cy="40" rx="9" ry="4" fill="#d8b4fe" />
        <ellipse cx="120" cy="28" rx="7.5" ry="3.5" fill="#e9d5ff" />
        <ellipse cx="120" cy="18" rx="5" ry="3" fill="#f3e8ff" />
        {/* Tiny White Petal Accents */}
        <circle cx="115" cy="51" r="1.8" fill="#ffffff" />
        <circle cx="125" cy="53" r="1.8" fill="#ffffff" />
        <circle cx="116" cy="39" r="1.8" fill="#ffffff" />
        <circle cx="124" cy="41" r="1.8" fill="#ffffff" />
      </g>

      {/* Left Lateral Flower Spike */}
      <g>
        <path d="M55 90 L45 40" stroke="#6b21a8" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="48" cy="68" rx="8" ry="4" fill="#a855f7" transform="rotate(-10 48 68)" />
        <ellipse cx="46" cy="55" rx="7" ry="3.5" fill="#c084fc" transform="rotate(-10 46 55)" />
        <ellipse cx="45" cy="42" rx="5" ry="2.8" fill="#e9d5ff" transform="rotate(-10 45 42)" />
      </g>

      {/* Right Lateral Flower Spike */}
      <g>
        <path d="M185 80 L195 30" stroke="#6b21a8" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="188" cy="58" rx="8" ry="4" fill="#a855f7" transform="rotate(10 188 58)" />
        <ellipse cx="191" cy="45" rx="7" ry="3.5" fill="#c084fc" transform="rotate(10 191 45)" />
        <ellipse cx="194" cy="32" rx="5" ry="2.8" fill="#e9d5ff" transform="rotate(10 194 32)" />
      </g>
    </svg>
  );
}
