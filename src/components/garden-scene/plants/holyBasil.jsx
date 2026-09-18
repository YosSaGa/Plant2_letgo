import React from 'react';

export function HolyBasilSeed() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hbSoilGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#582910" />
          <stop offset="60%" stopColor="#351403" />
          <stop offset="100%" stopColor="#1f0902" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="210" rx="75" ry="16" fill="rgba(0,0,0,0.18)" />
      <path d="M40 205 C50 170, 90 155, 120 155 C150 155, 190 170, 200 205 C205 215, 180 222, 120 222 C60 222, 35 215, 40 205 Z" fill="url(#hbSoilGrad)" />
      <circle cx="88" cy="196" r="3.5" fill="#a16207" opacity="0.6" />
      <circle cx="152" cy="186" r="4.5" fill="#a16207" opacity="0.6" />
      <rect x="114" y="115" width="12" height="60" rx="3" fill="#059669" />
      <rect x="75" y="85" width="90" height="42" rx="10" fill="#f0fdf4" stroke="#059669" strokeWidth="2.5" />
      <text x="120" y="112" textAnchor="middle" fontSize="15" fontWeight="700" fill="#065f46">🌿 เมล็ดกะเพรา</text>
      <circle cx="116" cy="165" r="2.6" fill="#0f172a" />
      <circle cx="124" cy="163" r="2.4" fill="#0f172a" />
    </svg>
  );
}

export function HolyBasilSeedling() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hbStemYoung" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#701a75" />
          <stop offset="60%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="212" rx="55" ry="12" fill="rgba(0,0,0,0.18)" />
      <path d="M60 210 C70 188, 95 180, 120 180 C145 180, 170 188, 180 210 C185 218, 160 222, 120 222 C80 222, 55 218, 60 210 Z" fill="#451a03" />

      <path d="M120 190 C120 160, 118 135, 120 108" stroke="url(#hbStemYoung)" strokeWidth="6" strokeLinecap="round" />

      <path d="M118 152 C95 155, 78 142, 80 128 C88 126, 96 132, 102 128 C108 134, 114 138, 118 150 Z" fill="#22c55e" />
      <path d="M120 148 C143 151, 160 138, 158 124 C150 122, 142 128, 136 124 C130 130, 124 134, 120 146 Z" fill="#16a34a" />

      <path d="M120 112 C90 110, 72 88, 76 68 C88 68, 95 76, 102 72 C110 82, 116 94, 120 110 Z" fill="#4ade80" />
      <path d="M120 110 C150 108, 168 86, 164 66 C152 66, 145 74, 138 70 C130 80, 124 92, 120 108 Z" fill="#22c55e" />

      <path d="M120 108 C115 94, 118 80, 120 78 C122 80, 125 94, 120 108 Z" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.5" />
    </svg>
  );
}

export function HolyBasilMature() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hbStemMature" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#4a044e" />
          <stop offset="40%" stopColor="#701a75" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="68" ry="14" fill="rgba(0,0,0,0.2)" />
      <path d="M55 212 C65 190, 95 182, 120 182 C145 182, 175 190, 185 212 C190 220, 165 224, 120 224 C75 224, 50 220, 55 212 Z" fill="#451a03" />

      <path d="M120 195 C120 155, 118 120, 120 68" stroke="url(#hbStemMature)" strokeWidth="8" strokeLinecap="round" />
      <path d="M118 145 C92 130, 70 115, 50 92" stroke="url(#hbStemMature)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M120 135 C148 120, 170 105, 190 82" stroke="url(#hbStemMature)" strokeWidth="5.5" strokeLinecap="round" />

      <path d="M50 92 C25 86, 12 65, 18 45 C28 47, 36 55, 45 52 C54 62, 58 75, 50 92 Z" fill="#15803d" />
      <path d="M50 92 C32 78, 22 58, 18 45" stroke="#701a75" strokeWidth="1.5" />

      <path d="M190 82 C215 76, 228 55, 222 35 C212 37, 204 45, 195 42 C186 52, 182 65, 190 82 Z" fill="#16a34a" />
      <path d="M190 82 C208 68, 218 48, 222 35" stroke="#701a75" strokeWidth="1.5" />

      <path d="M88 120 C60 110, 48 85, 55 64 C70 66, 82 82, 88 120 Z" fill="#22c55e" />
      <path d="M152 110 C180 100, 192 75, 185 54 C170 56, 158 72, 152 110 Z" fill="#15803d" />

      <path d="M118 80 C88 70, 75 45, 84 25 C100 27, 114 48, 118 80 Z" fill="#22c55e" />
      <path d="M122 75 C152 65, 165 40, 156 20 C140 22, 126 43, 122 75 Z" fill="#16a34a" />
      <path d="M120 68 C110 48, 114 28, 120 16 C126 28, 130 48, 120 68 Z" fill="#4ade80" />

      <circle cx="120" cy="35" r="3.5" fill="#f472b6" />
      <circle cx="95" cy="50" r="3" fill="#f472b6" />
      <circle cx="145" cy="45" r="3" fill="#f472b6" />
    </svg>
  );
}

export function HolyBasilFruiting() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hbFruitingStem" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#4a044e" />
          <stop offset="50%" stopColor="#701a75" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="72" ry="15" fill="rgba(0,0,0,0.22)" />
      <path d="M50 212 C60 188, 92 180, 120 180 C148 180, 180 188, 190 212 C195 220, 168 224, 120 224 C72 224, 45 220, 50 212 Z" fill="#3b1704" />

      <path d="M120 195 C120 155, 118 120, 120 75" stroke="url(#hbFruitingStem)" strokeWidth="8.5" strokeLinecap="round" />
      <path d="M118 140 C85 125, 62 108, 42 85" stroke="url(#hbFruitingStem)" strokeWidth="6" strokeLinecap="round" />
      <path d="M120 130 C155 115, 178 98, 198 75" stroke="url(#hbFruitingStem)" strokeWidth="6" strokeLinecap="round" />

      <path d="M42 85 C18 80, 8 58, 16 38 C38 38, 52 60, 42 85 Z" fill="#15803d" />
      <path d="M198 75 C222 70, 232 48, 224 28 C202 28, 188 50, 198 75 Z" fill="#16a34a" />
      <path d="M85 115 C58 105, 48 80, 55 58 C78 58, 92 85, 85 115 Z" fill="#22c55e" />
      <path d="M155 105 C182 95, 192 70, 185 48 C162 48, 148 75, 155 105 Z" fill="#15803d" />

      <g>
        <path d="M120 75 L120 10" stroke="#86198f" strokeWidth="3" strokeLinecap="round" />
        {[65, 54, 43, 32, 22, 14].map((y, i) => (
          <g key={i}>
            <circle cx="114" cy={y} r="2.8" fill="#f472b6" />
            <circle cx="126" cy={y} r="2.8" fill="#f472b6" />
            <ellipse cx="120" cy={y} rx="4.5" ry="2.2" fill="#a21caf" />
            <circle cx="120" cy={y - 1} r="1.5" fill="#fdf2f8" />
          </g>
        ))}
      </g>

      <g>
        <path d="M52 86 L38 35" stroke="#86198f" strokeWidth="2.5" strokeLinecap="round" />
        {[72, 60, 48, 38].map((y, i) => (
          <g key={i}>
            <circle cx={48 - i * 3} cy={y} r="2.5" fill="#f472b6" />
            <ellipse cx={48 - i * 3} cy={y} rx="4" ry="2" fill="#a21caf" />
          </g>
        ))}
      </g>

      <g>
        <path d="M188 76 L202 25" stroke="#86198f" strokeWidth="2.5" strokeLinecap="round" />
        {[65, 52, 40, 30].map((y, i) => (
          <g key={i}>
            <circle cx={192 + i * 3} cy={y} r="2.5" fill="#f472b6" />
            <ellipse cx={192 + i * 3} cy={y} rx="4" ry="2" fill="#a21caf" />
          </g>
        ))}
      </g>
    </svg>
  );
}
