"use client";

interface MascotProps {
  size?: number;
  className?: string;
}

export default function Mascot({ size = 120, className = "" }: MascotProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <style>{`
        @keyframes giraffe-blink {
          0%, 42%, 46%, 100% { transform: scaleY(1); }
          44% { transform: scaleY(0.08); }
        }
        @keyframes giraffe-chew {
          0%, 40%, 60%, 100% { d: path("M 54 76 Q 60 80 66 76"); }
          48% { d: path("M 54 76 Q 60 82 66 76"); }
        }
        @keyframes giraffe-tail {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(12deg); }
          50% { transform: rotate(-8deg); }
          75% { transform: rotate(10deg); }
        }
        @keyframes giraffe-ear-l {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-6deg); }
        }
        @keyframes giraffe-ear-r {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(6deg); }
        }
        @keyframes giraffe-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .giraffe-eye-l, .giraffe-eye-r {
          transform-origin: 48px 64px;
          animation: giraffe-blink 4s ease-in-out infinite;
        }
        .giraffe-eye-r {
          transform-origin: 72px 64px;
          animation-delay: 0.1s;
        }
        .giraffe-tail-g {
          transform-origin: 88px 108px;
          animation: giraffe-tail 2.5s ease-in-out infinite;
        }
        .giraffe-ear-l {
          transform-origin: 42px 32px;
          animation: giraffe-ear-l 3s ease-in-out infinite;
        }
        .giraffe-ear-r {
          transform-origin: 78px 32px;
          animation: giraffe-ear-r 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .giraffe-body {
          animation: giraffe-bob 3s ease-in-out infinite;
        }
      `}</style>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 140"
        fill="none"
      >
        <g className="giraffe-body">
          {/* ===== NECK ===== */}
          <path
            d="M 50 48 L 46 90 Q 46 96 52 96 L 68 96 Q 74 96 74 90 L 70 48"
            fill="#F5C846"
          />
          <path
            d="M 50 48 L 46 90 Q 46 96 52 96 L 68 96 Q 74 96 74 90 L 70 48"
            fill="url(#neckShade)"
          />
          {/* Neck spots */}
          <ellipse cx="56" cy="58" rx="4" ry="5" fill="#C47A20" opacity="0.6" />
          <ellipse cx="65" cy="66" rx="3.5" ry="4" fill="#C47A20" opacity="0.6" />
          <ellipse cx="54" cy="74" rx="4" ry="3.5" fill="#C47A20" opacity="0.5" />
          <ellipse cx="66" cy="82" rx="3" ry="4" fill="#C47A20" opacity="0.5" />
          <ellipse cx="55" cy="88" rx="3.5" ry="3" fill="#C47A20" opacity="0.45" />

          {/* ===== BODY ===== */}
          <ellipse cx="60" cy="108" rx="28" ry="18" fill="#F5C846" />
          <ellipse cx="60" cy="108" rx="28" ry="18" fill="url(#bodyShade)" />
          {/* Body spots */}
          <ellipse cx="48" cy="104" rx="5" ry="4" fill="#C47A20" opacity="0.5" />
          <ellipse cx="72" cy="102" rx="4" ry="5" fill="#C47A20" opacity="0.5" />
          <ellipse cx="58" cy="114" rx="5" ry="3.5" fill="#C47A20" opacity="0.45" />
          <ellipse cx="44" cy="113" rx="3" ry="3" fill="#C47A20" opacity="0.4" />
          <ellipse cx="74" cy="112" rx="3.5" ry="3" fill="#C47A20" opacity="0.4" />

          {/* ===== LEGS ===== */}
          <rect x="38" y="120" width="8" height="16" rx="4" fill="#E8B830" />
          <rect x="50" y="122" width="7" height="14" rx="3.5" fill="#E8B830" />
          <rect x="63" y="122" width="7" height="14" rx="3.5" fill="#E8B830" />
          <rect x="74" y="120" width="8" height="16" rx="4" fill="#E8B830" />
          {/* Hooves */}
          <rect x="37" y="133" width="10" height="4" rx="2" fill="#8B6914" />
          <rect x="49" y="133" width="9" height="4" rx="2" fill="#8B6914" />
          <rect x="62" y="133" width="9" height="4" rx="2" fill="#8B6914" />
          <rect x="73" y="133" width="10" height="4" rx="2" fill="#8B6914" />

          {/* ===== TAIL ===== */}
          <g className="giraffe-tail-g">
            <path
              d="M 88 104 Q 96 100 98 92 Q 100 86 96 82"
              stroke="#E8B830"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="95" cy="80" rx="3" ry="5" fill="#8B6914" transform="rotate(-15 95 80)" />
          </g>

          {/* ===== HEAD ===== */}
          <ellipse cx="60" cy="40" rx="20" ry="16" fill="#F5C846" />
          <ellipse cx="60" cy="40" rx="20" ry="16" fill="url(#headShade)" />

          {/* Snout / muzzle */}
          <ellipse cx="60" cy="50" rx="12" ry="7" fill="#F8D86A" />

          {/* Head spots */}
          <ellipse cx="50" cy="36" rx="3" ry="2.5" fill="#C47A20" opacity="0.45" />
          <ellipse cx="70" cy="37" rx="2.5" ry="3" fill="#C47A20" opacity="0.45" />

          {/* ===== OSSICONES (horns) ===== */}
          <line x1="50" y1="28" x2="46" y2="16" stroke="#E8B830" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="46" cy="14" r="3.5" fill="#8B6914" />
          <line x1="70" y1="28" x2="74" y2="16" stroke="#E8B830" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="74" cy="14" r="3.5" fill="#8B6914" />

          {/* ===== EARS ===== */}
          <g className="giraffe-ear-l">
            <ellipse cx="38" cy="34" rx="7" ry="4" fill="#F5C846" transform="rotate(-30 38 34)" />
            <ellipse cx="38" cy="34" rx="5" ry="2.5" fill="#FFB0B0" opacity="0.5" transform="rotate(-30 38 34)" />
          </g>
          <g className="giraffe-ear-r">
            <ellipse cx="82" cy="34" rx="7" ry="4" fill="#F5C846" transform="rotate(30 82 34)" />
            <ellipse cx="82" cy="34" rx="5" ry="2.5" fill="#FFB0B0" opacity="0.5" transform="rotate(30 82 34)" />
          </g>

          {/* ===== EYES ===== */}
          {/* Eye whites */}
          <ellipse cx="50" cy="42" rx="7" ry="7.5" fill="white" />
          <ellipse cx="70" cy="42" rx="7" ry="7.5" fill="white" />

          {/* Iris */}
          <g className="giraffe-eye-l">
            <circle cx="51" cy="43" r="5" fill="#3D2B1F" />
            <circle cx="51" cy="43" r="3.2" fill="#1a0e08" />
            <circle cx="53" cy="41" r="1.8" fill="white" />
            <circle cx="49" cy="45" r="0.8" fill="white" opacity="0.6" />
          </g>
          <g className="giraffe-eye-r">
            <circle cx="71" cy="43" r="5" fill="#3D2B1F" />
            <circle cx="71" cy="43" r="3.2" fill="#1a0e08" />
            <circle cx="73" cy="41" r="1.8" fill="white" />
            <circle cx="69" cy="45" r="0.8" fill="white" opacity="0.6" />
          </g>

          {/* Eyelashes */}
          <path d="M 44 38 L 42 36" stroke="#3D2B1F" strokeWidth="1" strokeLinecap="round" />
          <path d="M 45 37 L 44 34.5" stroke="#3D2B1F" strokeWidth="1" strokeLinecap="round" />
          <path d="M 76 38 L 78 36" stroke="#3D2B1F" strokeWidth="1" strokeLinecap="round" />
          <path d="M 75 37 L 76 34.5" stroke="#3D2B1F" strokeWidth="1" strokeLinecap="round" />

          {/* ===== NOSTRILS ===== */}
          <ellipse cx="56" cy="52" rx="1.5" ry="1" fill="#C47A20" opacity="0.6" />
          <ellipse cx="64" cy="52" rx="1.5" ry="1" fill="#C47A20" opacity="0.6" />

          {/* ===== SMILE ===== */}
          <path
            d="M 54 54 Q 60 59 66 54"
            stroke="#8B6914"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Rosy cheeks */}
          <ellipse cx="42" cy="48" rx="4" ry="2.5" fill="#FFB0B0" opacity="0.35" />
          <ellipse cx="78" cy="48" rx="4" ry="2.5" fill="#FFB0B0" opacity="0.35" />

          {/* ===== MANE ===== */}
          <path
            d="M 58 26 Q 56 20 58 28 Q 56 22 59 30 Q 58 24 60 32
               Q 62 24 61 30 Q 64 22 62 28 Q 64 20 62 26"
            stroke="#C47A20"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </g>

        <defs>
          <linearGradient id="neckShade" x1="46" y1="48" x2="74" y2="96">
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="black" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="bodyShade" x1="32" y1="90" x2="88" y2="126">
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="black" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="headShade" x1="40" y1="24" x2="80" y2="56">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="black" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
