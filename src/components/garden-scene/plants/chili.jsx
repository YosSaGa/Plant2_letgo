import React from 'react';

export function ChiliSeed() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chiliSoilGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="60%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#290f04" />
        </radialGradient>
        <linearGradient id="chiliSeedPouch" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="210" rx="75" ry="16" fill="rgba(0,0,0,0.18)" />
      <path d="M40 205 C50 170, 90 155, 120 155 C150 155, 190 170, 200 205 C205 215, 180 222, 120 222 C60 222, 35 215, 40 205 Z" fill="url(#chiliSoilGrad)" />
      <circle cx="85" cy="195" r="4" fill="#a16207" opacity="0.6" />
      <circle cx="150" cy="190" r="5" fill="#a16207" opacity="0.6" />
      <circle cx="115" cy="180" r="3.5" fill="#ca8a04" opacity="0.5" />
      <circle cx="165" cy="202" r="3" fill="#ca8a04" opacity="0.4" />
      <rect x="114" y="115" width="12" height="60" rx="3" fill="#d97706" />
      <rect x="75" y="85" width="90" height="42" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
      <text x="120" y="112" textAnchor="middle" fontSize="15" fontWeight="700" fill="#92400e">🌶️ เมล็ดพริก</text>
      <ellipse cx="120" cy="162" rx="6" ry="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
    </svg>
  );
}

export function ChiliSeedling() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chiliStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="chiliLeafGradL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="chiliLeafGradR" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="212" rx="55" ry="12" fill="rgba(0,0,0,0.18)" />
      <path d="M60 210 C70 188, 95 180, 120 180 C145 180, 170 188, 180 210 C185 218, 160 222, 120 222 C80 222, 55 218, 60 210 Z" fill="#542808" />
      <path d="M120 190 C120 160, 118 135, 120 105" stroke="url(#chiliStemGrad)" strokeWidth="6" strokeLinecap="round" />
      <path d="M118 150 C95 152, 80 140, 78 128 C88 125, 112 135, 118 148 Z" fill="url(#chiliLeafGradL)" />
      <path d="M118 148 C98 145, 84 133, 78 128" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M120 145 C142 146, 158 135, 160 123 C150 120, 126 130, 120 143 Z" fill="url(#chiliLeafGradR)" />
      <path d="M120 143 C140 140, 154 128, 160 123" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M120 110 C92 105, 68 85, 62 62 C82 60, 112 85, 120 106 Z" fill="url(#chiliLeafGradL)" />
      <path d="M120 106 C95 98, 75 75, 62 62" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M120 105 C148 100, 172 80, 178 57 C158 55, 128 80, 120 101 Z" fill="url(#chiliLeafGradR)" />
      <path d="M120 101 C145 93, 165 70, 178 57" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M120 105 C115 88, 120 72, 120 70 C122 75, 125 88, 120 105 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" />
    </svg>
  );
}

export function ChiliMature() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chiliMatStem" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="chiliLeafDeep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="chiliLeafLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="65" ry="14" fill="rgba(0,0,0,0.2)" />
      <path d="M55 212 C65 190, 95 182, 120 182 C145 182, 175 190, 185 212 C190 220, 165 224, 120 224 C75 224, 50 220, 55 212 Z" fill="#451a03" />

      <path d="M120 195 C120 160, 116 130, 120 75" stroke="url(#chiliMatStem)" strokeWidth="8" strokeLinecap="round" />
      <path d="M118 145 C95 130, 75 120, 55 105" stroke="url(#chiliMatStem)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M120 135 C145 120, 165 110, 185 95" stroke="url(#chiliMatStem)" strokeWidth="5.5" strokeLinecap="round" />

      <path d="M55 105 C30 100, 15 80, 10 58 C32 58, 50 82, 55 105 Z" fill="url(#chiliLeafDeep)" />
      <path d="M55 105 C35 95, 20 75, 10 58" stroke="#14532d" strokeWidth="1.5" />

      <path d="M90 130 C65 120, 50 95, 52 75 C72 75, 88 105, 90 130 Z" fill="url(#chiliLeafLight)" />

      <path d="M185 95 C210 90, 225 70, 230 48 C208 48, 190 72, 185 95 Z" fill="url(#chiliLeafDeep)" />
      <path d="M185 95 C205 85, 220 65, 230 48" stroke="#14532d" strokeWidth="1.5" />

      <path d="M118 90 C85 80, 70 50, 72 32 C95 35, 115 65, 118 90 Z" fill="url(#chiliLeafLight)" />
      <path d="M118 90 C95 72, 80 48, 72 32" stroke="#15803d" strokeWidth="1.5" />

      <path d="M120 85 C155 75, 170 45, 168 27 C145 30, 125 60, 120 85 Z" fill="url(#chiliLeafDeep)" />
      <path d="M120 85 C145 67, 160 43, 168 27" stroke="#14532d" strokeWidth="1.5" />

      <path d="M120 75 C108 50, 112 25, 120 15 C128 25, 132 50, 120 75 Z" fill="url(#chiliLeafLight)" />

      <circle cx="85" cy="85" r="4.5" fill="#ffffff" stroke="#fef08a" strokeWidth="1.5" />
      <circle cx="150" cy="78" r="4.5" fill="#ffffff" stroke="#fef08a" strokeWidth="1.5" />
      <circle cx="120" cy="55" r="5" fill="#ffffff" stroke="#fef08a" strokeWidth="1.5" />
    </svg>
  );
}

export function ChiliFruiting() {
  return (
    <svg viewBox="0 0 240 240" className="gs-plant-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chiliFruitRed1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="chiliFruitRed2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
        <linearGradient id="chiliFruitGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="60%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="chiliLush" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="72" ry="15" fill="rgba(0,0,0,0.22)" />
      <path d="M50 212 C60 188, 92 180, 120 180 C148 180, 180 188, 190 212 C195 220, 168 224, 120 224 C72 224, 45 220, 50 212 Z" fill="#3b1704" />

      <path d="M120 195 C120 155, 116 125, 120 65" stroke="#166534" strokeWidth="8.5" strokeLinecap="round" />
      <path d="M118 140 C85 125, 60 110, 42 90" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
      <path d="M120 130 C155 115, 180 100, 198 80" stroke="#166534" strokeWidth="6" strokeLinecap="round" />

      <path d="M42 90 C20 85, 8 60, 5 40 C28 40, 42 65, 42 90 Z" fill="url(#chiliLush)" />
      <path d="M198 80 C220 75, 232 50, 235 30 C212 30, 198 55, 198 80 Z" fill="url(#chiliLush)" />
      <path d="M118 70 C80 58, 62 30, 65 12 C90 15, 112 45, 118 70 Z" fill="#22c55e" />
      <path d="M122 65 C160 53, 178 25, 175 7 C150 10, 128 40, 122 65 Z" fill="#15803d" />
      <path d="M120 60 C110 35, 115 12, 120 2 C125 12, 130 35, 120 60 Z" fill="#4ade80" />

      <g>
        <path d="M78 128 C74 135, 68 155, 72 175 C75 190, 85 200, 92 208 C90 198, 88 180, 84 165 C82 150, 84 135, 86 128 Z" fill="url(#chiliFruitRed1)" />
        <path d="M74 128 C78 123, 86 123, 90 128 C87 132, 77 132, 74 128 Z" fill="#15803d" />
        <path d="M82 124 C82 118, 85 115, 90 114" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M76 142 C74 155, 76 172, 82 186" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      </g>

      <g>
        <path d="M145 115 C150 125, 160 148, 158 170 C156 186, 146 196, 138 204 C142 194, 146 176, 148 160 C150 144, 148 128, 142 118 Z" fill="url(#chiliFruitRed2)" />
        <path d="M140 116 C144 111, 152 111, 156 116 C153 120, 143 120, 140 116 Z" fill="#15803d" />
        <path d="M148 112 C148 106, 145 102, 140 100" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M154 130 C156 145, 154 162, 148 178" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </g>

      <g>
        <path d="M182 98 C185 106, 192 122, 190 140 C188 152, 180 160, 174 166 C177 158, 180 144, 182 130 C184 118, 182 106, 178 100 Z" fill="url(#chiliFruitGreen)" />
        <path d="M176 100 C180 96, 186 96, 190 100 Z" fill="#14532d" />
        <path d="M183 97 C183 92, 181 88, 178 86" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
        <path d="M186 112 C188 124, 186 136, 181 148" stroke="#bbf7d0" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      </g>

      <circle cx="112" cy="72" r="5" fill="#ffffff" stroke="#fef08a" strokeWidth="1.5" />
    </svg>
  );
}
