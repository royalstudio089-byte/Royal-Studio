import React from 'react';

// Exact SVG Vector rendering of Royal Studio brand mark and full logo (based on uploaded assets)
export const ROYAL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450" width="1000" height="450">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0cb75"/>
      <stop offset="50%" stop-color="#d4a843"/>
      <stop offset="100%" stop-color="#b6892a"/>
    </linearGradient>
    <linearGradient id="darkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4d535a"/>
      <stop offset="100%" stop-color="#2c3036"/>
    </linearGradient>
  </defs>

  <!-- LEFT EMBLEM: CROWN + R MONOGRAM -->
  <g id="emblem">
    <!-- CROWN ATOP THE R -->
    <path d="M125 105 L155 55 L215 110 L275 60 L305 115 L310 145 L120 135 Z" fill="url(#goldGrad)"/>
    <polygon points="155,55 180,95 135,95" fill="#fdf0b5" opacity="0.3"/>
    <polygon points="275,60 295,100 255,100" fill="#fdf0b5" opacity="0.3"/>
    
    <!-- GOLDEN RIDGE ACCENT -->
    <polygon points="120,135 310,145 320,165 110,150" fill="url(#goldGrad)"/>

    <!-- STYLIZED R BODY -->
    <!-- Left vertical stem with beveled top and cut -->
    <path d="M35 60 L105 115 L105 310 L35 400 Z" fill="url(#darkGrad)"/>
    <!-- Upper loop and diagonal leg of R -->
    <path d="M115 155 L290 235 L310 245 L200 320 L115 255 Z" fill="url(#darkGrad)"/>
    <path d="M185 310 L300 400 L210 400 L115 325 Z" fill="url(#darkGrad)"/>
  </g>

  <!-- WE CAPTURE YOUR MEMORIES TAGLINE -->
  <text x="330" y="145" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#3a4047" letter-spacing="1">
    We Capture Your Memories.!
  </text>

  <!-- MAIN WORDMARK: Royal STUDIO -->
  <!-- Letter 'R' -->
  <path d="M335 165 L415 165 C450 165 470 185 470 215 C470 240 455 258 430 265 L475 335 L425 335 L385 275 L375 275 L375 335 L335 335 Z M375 205 L375 240 L410 240 C425 240 435 230 435 220 C435 210 425 205 410 205 Z" fill="url(#darkGrad)"/>

  <!-- Aperture 'o' -->
  <g transform="translate(540, 260)">
    <circle cx="0" cy="0" r="62" fill="none" stroke="#2c3036" stroke-width="1" opacity="0.1"/>
    <!-- Blade 1 -->
    <path d="M0 -60 L35 -50 L18 -12 Z" fill="#d4a843"/>
    <!-- Blade 2 -->
    <path d="M35 -50 L58 -20 L15 15 Z" fill="#4d535a"/>
    <!-- Blade 3 -->
    <path d="M58 -20 L60 25 L-5 20 Z" fill="#d4a843"/>
    <!-- Blade 4 -->
    <path d="M60 25 L25 58 L-20 5 Z" fill="#4d535a"/>
    <!-- Blade 5 -->
    <path d="M25 58 L-25 58 L-15 -18 Z" fill="#d4a843"/>
    <!-- Blade 6 -->
    <path d="M-25 58 L-58 25 L5 -20 Z" fill="#4d535a"/>
    <!-- Blade 7 -->
    <path d="M-58 25 L-58 -20 L-5 5 Z" fill="#d4a843"/>
    <!-- Blade 8 -->
    <path d="M-58 -20 L-25 -55 L20 -15 Z" fill="#4d535a"/>
    <!-- Center aperture iris -->
    <circle cx="0" cy="0" r="16" fill="#fdfbf7"/>
  </g>

  <!-- Letters 'yal' -->
  <!-- Letter 'y' -->
  <path d="M625 205 L655 285 L685 205 L725 205 L675 315 L660 355 L625 355 L640 315 L600 205 Z" fill="url(#darkGrad)"/>
  <!-- Letter 'a' -->
  <path d="M735 240 C735 215 755 200 780 200 C805 200 825 215 825 240 L825 335 L790 335 L790 315 C780 330 765 340 745 340 C725 340 710 325 710 300 C710 275 730 260 765 258 L790 256 L790 245 C790 235 780 228 770 228 C760 228 750 235 750 245 Z M790 280 L770 282 C755 284 748 290 748 298 C748 308 755 315 768 315 C780 315 790 305 790 292 Z" fill="url(#darkGrad)"/>
  <!-- Letter 'l' -->
  <path d="M845 165 L880 165 L880 335 L845 335 Z" fill="url(#darkGrad)"/>

  <!-- STUDIO WORDMARK -->
  <text x="330" y="415" font-family="'Arial Black', 'Helvetica Neue', Impact, sans-serif" font-size="64" font-weight="900" fill="url(#goldGrad)" letter-spacing="3">
    STUDIO
  </text>

  <!-- FRAMING BOX AROUND RIGHT SIDE -->
  <path d="M830 135 L980 135 L980 380 L635 380" fill="none" stroke="#4d535a" stroke-width="12" stroke-linecap="round"/>
</svg>`;

export const ROYAL_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(ROYAL_LOGO_SVG)}`;

export const ROYAL_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 420" width="350" height="420">
  <defs>
    <linearGradient id="markGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d37e"/>
      <stop offset="50%" stop-color="#d4a843"/>
      <stop offset="100%" stop-color="#ad8225"/>
    </linearGradient>
    <linearGradient id="markDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#545b63"/>
      <stop offset="100%" stop-color="#2a2e33"/>
    </linearGradient>
  </defs>

  <!-- CROWN -->
  <path d="M125 105 L155 55 L215 110 L275 60 L305 115 L310 145 L120 135 Z" fill="url(#markGold)"/>
  <!-- GOLD RIDGE -->
  <polygon points="120,135 310,145 320,165 110,150" fill="url(#markGold)"/>

  <!-- R MONOGRAM -->
  <path d="M35 60 L105 115 L105 310 L35 400 Z" fill="url(#markDark)"/>
  <path d="M115 155 L290 235 L310 245 L200 320 L115 255 Z" fill="url(#markDark)"/>
  <path d="M185 310 L300 400 L210 400 L115 325 Z" fill="url(#markDark)"/>
</svg>`;

export const ROYAL_MARK_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(ROYAL_MARK_SVG)}`;

export const RoyalLogo: React.FC<{ className?: string; height?: number }> = ({ className = 'h-12', height }) => {
  return (
    <div
      className={`inline-block select-none ${className}`}
      style={height ? { height: `${height}px` } : undefined}
      dangerouslySetInnerHTML={{ __html: ROYAL_LOGO_SVG }}
    />
  );
};

export const RoyalMark: React.FC<{ className?: string; height?: number }> = ({ className = 'h-10', height }) => {
  return (
    <div
      className={`inline-block select-none ${className}`}
      style={height ? { height: `${height}px` } : undefined}
      dangerouslySetInnerHTML={{ __html: ROYAL_MARK_SVG }}
    />
  );
};
