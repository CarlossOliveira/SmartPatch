interface BottleSvgProps {
  temp: number;
  days: number;
  color: string;
  core: string;
  label: string;
  daysSuffix: string;
}

/** Garrafa em SVG. Aparece enquanto o modelo 3D não carrega, ou quando o WebGL falha. */
export function BottleSvg({ temp, days, color, core, label, daysSuffix }: BottleSvgProps) {
  return (
    <svg viewBox="90 60 290 420" role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="5" result="a" />
          <feGaussianBlur stdDeviation="11" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="a" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="body" x1="0" x2="1">
          <stop offset="0" stopColor="#141e30" />
          <stop offset=".14" stopColor="#243552" />
          <stop offset=".3" stopColor="#4c6690" />
          <stop offset=".38" stopColor="#5d769e" />
          <stop offset=".48" stopColor="#334869" />
          <stop offset=".7" stopColor="#1a273d" />
          <stop offset=".9" stopColor="#101826" />
          <stop offset="1" stopColor="#1d2b42" />
        </linearGradient>
        <linearGradient id="cap" x1="0" x2="1">
          <stop offset="0" stopColor="#162133" />
          <stop offset=".2" stopColor="#2c4061" />
          <stop offset=".34" stopColor="#567099" />
          <stop offset=".48" stopColor="#2a3d5c" />
          <stop offset=".78" stopColor="#141f30" />
          <stop offset="1" stopColor="#1f2e46" />
        </linearGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#435878" />
          <stop offset=".5" stopColor="#1f2e47" />
          <stop offset="1" stopColor="#121b2b" />
        </linearGradient>
        <radialGradient id="oled" cx=".45" cy=".38" r=".6">
          <stop offset="0" stopColor="#263142" />
          <stop offset=".45" stopColor="#0d131c" />
          <stop offset="1" stopColor="#04070b" />
        </radialGradient>
        <linearGradient id="gloss" x1="0" y1="0" x2=".7" y2=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".25" />
          <stop offset=".4" stopColor="#fff" stopOpacity=".05" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M132 232V418A98 44 0 0 0 328 418V232Z" fill="url(#body)" />
      <path d="M132 142V228A98 44 0 0 0 328 228V142Z" fill="url(#cap)" />
      <path d="M132 228A98 44 0 0 0 328 228L328 235A98 44 0 0 1 132 235Z" fill="#070b12" />
      <path d="M132 234A98 44 0 0 0 328 234" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.2" />
      <ellipse cx="230" cy="142" rx="98" ry="48" fill="url(#rim)" stroke="#3b4f6e" strokeWidth="1.2" />
      <ellipse
        className="led-outer"
        cx="230"
        cy="141"
        rx="87"
        ry="42"
        fill="none"
        stroke={color}
        strokeWidth="8"
        filter="url(#glow)"
      />
      <ellipse className="led-core" cx="230" cy="141" rx="87" ry="42" fill="none" stroke={core} strokeWidth="3.5" />
      <ellipse cx="230" cy="140" rx="79" ry="37.5" fill="url(#oled)" stroke="#0f172a" strokeWidth="2" />
      <ellipse cx="222" cy="133" rx="68" ry="29" fill="url(#gloss)" />
      <g transform="translate(230 138)" fontFamily="'Courier New',monospace" fontWeight="700">
        <text x="-2" y="-2" textAnchor="end" fill="#fff" fontSize="31">
          {temp}
        </text>
        <text x="3" y="-14" fill="#e0f2fe" fontSize="11" fontFamily="Inter,sans-serif">
          °C
        </text>
        <text x="0" y="19" textAnchor="middle" fill="#bae6fd" fontSize="14">
          {days}/28{daysSuffix}
        </text>
      </g>
      <rect x="223" y="290" width="14" height="30" rx="7" fill="none" stroke="#0c1422" strokeWidth="1.6" opacity=".7" />
    </svg>
  );
}
