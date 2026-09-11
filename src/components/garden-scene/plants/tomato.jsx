import React from 'react';

/**
 * tomato.jsx
 * 4 Growth Stages for Tomato (มะเขือเทศ):
 * 1. TomatoSeed
 * 2. TomatoSeedling
 * 3. TomatoMature (with yellow star flowers and support stake)
 * 4. TomatoFruiting (plump glossy red tomatoes + star calyx)
 */

export function TomatoSeed() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tomSoilGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#6c2e0b" />
          <stop offset="60%" stopColor="#3d1804" />
          <stop offset="100%" stopColor="#220b02" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="210" rx="75" ry="16" fill="rgba(0,0,0,0.18)" />
      <path d="M40 205 C50 170, 90 155, 120 155 C150 155, 190 170, 200 205 C205 215, 180 222, 120 222 C60 222, 35 215, 40 205 Z" fill="url(#tomSoilGrad)" />
      <circle cx="85" cy="195" r="4" fill="#a16207" opacity="0.6" />
      <circle cx="155" cy="188" r="4" fill="#a16207" opacity="0.6" />
      {/* Name Stake */}
      <rect x="114" y="115" width="12" height="60" rx="3" fill="#ea580c" />
      <rect x="75" y="85" width="90" height="42" rx="10" fill="#fff7ed" stroke="#ea580c" strokeWidth="2.5" />
      <text x="120" y="112" textAnchor="middle" fontSize="15" fontWeight="700" fill="#c2410c">🍅 เมล็ดมะเขือเทศ</text>
      {/* Tiny Tomato Seeds */}
      <ellipse cx="118" cy="164" rx="4.5" ry="3.5" fill="#fed7aa" stroke="#ea580c" strokeWidth="1" />
    </svg>
  );
}

export function TomatoSeedling() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tomStemYoung" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="212" rx="55" ry="12" fill="rgba(0,0,0,0.18)" />
      <path d="M60 210 C70 188, 95 180, 120 180 C145 180, 170 188, 180 210 C185 218, 160 222, 120 222 C80 222, 55 218, 60 210 Z" fill="#451a03" />

      {/* Stem with cute hairs/fine texture */}
      <path d="M120 190 C120 160, 118 135, 120 102" stroke="url(#tomStemYoung)" strokeWidth="6" strokeLinecap="round" />

      {/* Compound Tomato Leaves Left */}
      <path d="M118 150 C95 152, 75 138, 70 120 C85 120, 95 132, 102 125 C108 135, 114 140, 118 148 Z" fill="#22c55e" />
      {/* Compound Tomato Leaves Right */}
      <path d="M120 145 C145 148, 165 135, 170 118 C155 118, 145 130, 138 123 C132 133, 126 138, 120 143 Z" fill="#16a34a" />

      {/* Upper Deeply Lobed Leaves */}
      <path d="M120 106 C85 102, 60 78, 55 55 C75 55, 92 72, 100 65 C108 78, 115 92, 120 104 Z" fill="#4ade80" />
      <path d="M120 104 C155 100, 180 76, 185 52 C165 52, 148 70, 140 62 C132 75, 125 90, 120 102 Z" fill="#22c55e" />

      {/* Top Sprout Tip */}
      <path d="M120 102 C115 88, 118 72, 120 70 C122 72, 125 88, 120 102 Z" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.5" />
    </svg>
  );
}

export function TomatoMature() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tomMatStem" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="68" ry="14" fill="rgba(0,0,0,0.2)" />
      <path d="M55 212 C65 190, 95 182, 120 182 C145 182, 175 190, 185 212 C190 220, 165 224, 120 224 C75 224, 50 220, 55 212 Z" fill="#451a03" />

      {/* Bamboo Support Stake */}
      <rect x="126" y="25" width="7" height="175" rx="3.5" fill="#ca8a04" stroke="#a16207" strokeWidth="1.5" />
      <line x1="126" y1="65" x2="133" y2="65" stroke="#78350f" strokeWidth="1.5" />
      <line x1="126" y1="110" x2="133" y2="110" stroke="#78350f" strokeWidth="1.5" />
      <line x1="126" y1="155" x2="133" y2="155" stroke="#78350f" strokeWidth="1.5" />

      {/* Main Tomato Vine */}
      <path d="M120 195 C118 160, 125 125, 120 65" stroke="url(#tomMatStem)" strokeWidth="8" strokeLinecap="round" />
      <path d="M118 145 C90 130, 65 112, 45 92" stroke="url(#tomMatStem)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M122 135 C150 120, 175 105, 195 82" stroke="url(#tomMatStem)" strokeWidth="5.5" strokeLinecap="round" />

      {/* Vine Ties to Bamboo Stake */}
      <path d="M120 120 C124 118, 128 118, 130 120" stroke="#f59e0b" strokeWidth="2.5" />
      <path d="M119 75 C123 73, 127 73, 129 75" stroke="#f59e0b" strokeWidth="2.5" />

      {/* Deeply Serrated Lobed Foliage */}
      <path d="M45 92 C20 88, 10 65, 15 45 C35 48, 48 60, 55 52 C52 70, 48 85, 45 92 Z" fill="#15803d" />
      <path d="M195 82 C220 78, 230 55, 225 35 C205 38, 192 50, 185 42 C188 60, 192 75, 195 82 Z" fill="#16a34a" />
      <path d="M88 120 C55 110, 45 85, 52 64 C75 66, 90 85, 88 120 Z" fill="#22c55e" />
      <path d="M152 110 C185 100, 195 75, 188 54 C165 56, 150 75, 152 110 Z" fill="#15803d" />

      {/* Top Foliage */}
      <path d="M120 65 C95 55, 85 30, 92 12 C115 15, 122 42, 120 65 Z" fill="#22c55e" />
      <path d="M122 62 C150 50, 160 25, 152 8 C130 12, 122 40, 122 62 Z" fill="#16a34a" />

      {/* Bright Yellow Star Tomato Blossoms */}
      <g transform="translate(78, 98)">
        <polygon points="0,-7 2,-2 7,-2 3,1 5,6 0,3 -5,6 -3,1 -7,-2 -2,-2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </g>
      <g transform="translate(160, 88)">
        <polygon points="0,-7 2,-2 7,-2 3,1 5,6 0,3 -5,6 -3,1 -7,-2 -2,-2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </g>
      <g transform="translate(112, 48)">
        <polygon points="0,-8 2.5,-2.5 8,-2.5 3.5,1.5 5.5,7 0,3.5 -5.5,7 -3.5,1.5 -8,-2.5 -2.5,-2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function TomatoFruiting() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tomFruitRed1" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="85%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <radialGradient id="tomFruitRed2" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fecaca" />
          <stop offset="25%" stopColor="#f87171" />
          <stop offset="85%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
        <radialGradient id="tomFruitGreen" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="35%" stopColor="#4ade80" />
          <stop offset="85%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="72" ry="15" fill="rgba(0,0,0,0.22)" />
      <path d="M50 212 C60 188, 92 180, 120 180 C148 180, 180 188, 190 212 C195 220, 168 224, 120 224 C72 224, 45 220, 50 212 Z" fill="#3b1704" />

      {/* Bamboo Support Stake */}
      <rect x="126" y="20" width="7" height="180" rx="3.5" fill="#ca8a04" stroke="#a16207" strokeWidth="1.5" />
      <line x1="126" y1="60" x2="133" y2="60" stroke="#78350f" strokeWidth="1.5" />
      <line x1="126" y1="105" x2="133" y2="105" stroke="#78350f" strokeWidth="1.5" />
      <line x1="126" y1="150" x2="133" y2="150" stroke="#78350f" strokeWidth="1.5" />

      {/* Main Tomato Vine */}
      <path d="M120 195 C118 155, 124 120, 120 60" stroke="#15803d" strokeWidth="8.5" strokeLinecap="round" />
      <path d="M118 140 C88 125, 62 108, 42 85" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />
      <path d="M122 130 C155 115, 178 98, 198 75" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />

      {/* Lush Vine Foliage */}
      <path d="M42 85 C18 80, 8 58, 15 38 C35 40, 48 55, 52 48 C50 65, 46 80, 42 85 Z" fill="#16a34a" />
      <path d="M198 75 C222 70, 232 48, 225 28 C205 30, 192 45, 185 38 C188 55, 194 70, 198 75 Z" fill="#15803d" />
      <path d="M85 115 C55 105, 45 80, 52 58 C78 60, 92 82, 85 115 Z" fill="#22c55e" />
      <path d="M155 105 C185 95, 195 70, 188 48 C162 50, 148 72, 155 105 Z" fill="#16a34a" />

      {/* PLUMP GLOSSY RED TOMATO 1 (Large, Center-Left) */}
      <g>
        <circle cx="75" cy="155" r="22" fill="url(#tomFruitRed1)" />
        {/* Cute Star Calyx / Sepals */}
        <path d="M75 133 L72 138 L67 136 L70 141 L65 144 L71 144 L73 149 L76 144 L81 146 L78 141 L83 138 L77 138 Z" fill="#15803d" />
        <path d="M75 133 C75 125, 78 122, 82 120" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        {/* Soft highlight reflection */}
        <ellipse cx="68" cy="148" rx="6" ry="3.5" transform="rotate(-25 68 148)" fill="#ffffff" opacity="0.65" />
      </g>

      {/* PLUMP GLOSSY RED TOMATO 2 (Large, Center-Right) */}
      <g>
        <circle cx="160" cy="145" r="20" fill="url(#tomFruitRed2)" />
        <path d="M160 125 L157 130 L152 128 L155 133 L150 136 L156 136 L158 141 L161 136 L166 138 L163 133 L168 130 L162 130 Z" fill="#15803d" />
        <path d="M160 125 C160 118, 157 114, 152 112" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="153" cy="139" rx="5.5" ry="3" transform="rotate(-25 153 139)" fill="#ffffff" opacity="0.65" />
      </g>

      {/* YOUNG GREEN TOMATO (Medium, Right High) */}
      <g>
        <circle cx="180" cy="100" r="14" fill="url(#tomFruitGreen)" />
        <path d="M180 86 L178 90 L174 88 L176 92 L172 94 L177 94 L178 98 L180 94 L184 96 L182 92 L186 90 L181 90 Z" fill="#14532d" />
        <path d="M180 86 C180 80, 178 77, 174 76" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="175" cy="95" rx="4" ry="2" transform="rotate(-25 175 95)" fill="#ffffff" opacity="0.5" />
      </g>

      {/* Yellow Blossom on Top */}
      <g transform="translate(112, 45)">
        <polygon points="0,-7 2,-2 7,-2 3,1 5,6 0,3 -5,6 -3,1 -7,-2 -2,-2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </g>
    </svg>
  );
}
