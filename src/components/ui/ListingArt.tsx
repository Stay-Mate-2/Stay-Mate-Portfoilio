import { useId } from "react";

export type ListingKind = "pg" | "private" | "shared" | "flat" | "student";

/**
 * Clean 3D isometric architectural vector artwork for demo listing cards.
 * Clearly illustrative (never photos), so demo cards cannot be mistaken for real listings.
 */
export function ListingArt({ kind, className = "" }: { kind: ListingKind; className?: string }) {
  const id = useId().replace(/:/g, "");
  const palettes: Record<ListingKind, [string, string, string, string]> = {
    pg: ["#e5f0ff", "#e8f7ef", "#1769d2", "#16a765"],
    private: ["#e8f7ef", "#edf5ff", "#16a765", "#1769d2"],
    shared: ["#edf5ff", "#e8f7ef", "#1769d2", "#16a765"],
    flat: ["#dbeafe", "#eaf7ef", "#102c50", "#1769d2"],
    student: ["#e8f7ef", "#dbeafe", "#16a765", "#102c50"],
  };
  const [sky1, sky2, main, accent] = palettes[kind];

  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      role="img"
      aria-label={`Isometric 3D illustration of a ${kind} accommodation`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={sky1} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
        <linearGradient id={`top-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6f0ff" />
        </linearGradient>
        <linearGradient id={`shd-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#102c50" stopOpacity="0.18" />
          <stop offset="1" stopColor="#102c50" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="320" height="180" fill={`url(#sky-${id})`} />
      {/* Subtle architectural perspective glow */}
      <circle cx="268" cy="34" r="32" fill="#ffffff" opacity="0.55" />
      <circle cx="48" cy="148" r="56" fill="#ffffff" opacity="0.35" />

      {/* Isometric ground plinth */}
      <g>
        <polygon points="160,96 266,136 160,174 54,136" fill="#ffffff" opacity="0.92" />
        <polygon points="54,136 160,174 160,180 54,142" fill="#cbdcf2" />
        <polygon points="266,136 160,174 160,180 266,142" fill="#9fbbe2" />
      </g>

      {kind === "flat" && (
        <g>
          {/* Cast shadow */}
          <polygon points="158,128 242,148 164,168 92,142" fill={`url(#shd-${id})`} />
          {/* Left sunlit facade */}
          <polygon points="104,44 160,68 160,148 104,124" fill="#ffffff" stroke="#d5e4f7" strokeWidth="1" />
          {/* Right shaded facade */}
          <polygon points="160,68 216,44 216,124 160,148" fill="#dbe9fb" stroke="#c3d9f5" strokeWidth="1" />
          {/* Roof slab */}
          <polygon points="160,22 216,44 160,68 104,44" fill="#1769d2" />
          {/* Rooftop terrace garden */}
          <polygon points="160,29 200,45 160,61 120,45" fill="#16a765" opacity="0.88" />
          {/* Balconies & glowing windows (left) */}
          {[0, 1, 2].map((r) => (
            <g key={`l-${r}`}>
              <polygon
                points={`114,${58 + r * 24} 131,${65 + r * 24} 131,${77 + r * 24} 114,${70 + r * 24}`}
                fill={r === 1 ? "#16a765" : "#1769d2"}
                opacity="0.82"
              />
              <polygon
                points={`138,${68 + r * 24} 152,${74 + r * 24} 152,${86 + r * 24} 138,${80 + r * 24}`}
                fill={r === 2 ? "#16a765" : "#4aa3ff"}
                opacity="0.8"
              />
            </g>
          ))}
          {/* Windows (right shaded) */}
          {[0, 1, 2].map((r) => (
            <g key={`r-${r}`}>
              <polygon
                points={`170,${74 + r * 24} 185,${68 + r * 24} 185,${80 + r * 24} 170,${86 + r * 24}`}
                fill="#102c50"
                opacity="0.72"
              />
              <polygon
                points={`193,${64 + r * 24} 207,${58 + r * 24} 207,${70 + r * 24} 193,${76 + r * 24}`}
                fill={r === 0 ? "#16a765" : "#1769d2"}
                opacity="0.75"
              />
            </g>
          ))}
          {/* Entrance awning */}
          <polygon points="142,130 160,138 160,148 142,140" fill={main} />
          <polygon points="160,138 178,130 178,140 160,148" fill={accent} />
        </g>
      )}

      {kind === "pg" && (
        <g>
          <polygon points="90,122 252,140 160,168 74,138" fill={`url(#shd-${id})`} />
          {/* Main isometric wing left */}
          <polygon points="82,58 160,88 160,146 82,116" fill="#ffffff" stroke="#d5e4f7" strokeWidth="1" />
          {/* Main isometric wing right */}
          <polygon points="160,88 238,58 238,116 160,146" fill="#deebfc" stroke="#c3d9f5" strokeWidth="1" />
          {/* Roof */}
          <polygon points="160,30 242,58 160,90 78,58" fill="#1769d2" />
          <polygon points="160,36 226,58 160,84 94,58" fill="#2e83ec" />
          {/* Solar/terrace accent */}
          <polygon points="154,48 182,58 160,67 132,57" fill="#16a765" />
          {/* Window rows */}
          {[0, 1, 2].map((c) => (
            <g key={`pgl-${c}`}>
              <polygon
                points={`${94 + c * 22},${73 + c * 8} ${108 + c * 22},${78 + c * 8} ${108 + c * 22},${92 + c * 8} ${94 + c * 22},${87 + c * 8}`}
                fill="#1769d2"
                opacity="0.78"
              />
              <polygon
                points={`${94 + c * 22},${97 + c * 8} ${108 + c * 22},${102 + c * 8} ${108 + c * 22},${116 + c * 8} ${94 + c * 22},${111 + c * 8}`}
                fill="#16a765"
                opacity="0.82"
              />
            </g>
          ))}
          {[0, 1, 2].map((c) => (
            <g key={`pgr-${c}`}>
              <polygon
                points={`${172 + c * 21},${88 - c * 8} ${186 + c * 21},${83 - c * 8} ${186 + c * 21},${97 - c * 8} ${172 + c * 21},${102 - c * 8}`}
                fill="#102c50"
                opacity="0.7"
              />
              <polygon
                points={`${172 + c * 21},${112 - c * 8} ${186 + c * 21},${107 - c * 8} ${186 + c * 21},${121 - c * 8} ${172 + c * 21},${126 - c * 8}`}
                fill="#1769d2"
                opacity="0.65"
              />
            </g>
          ))}
          {/* Trees */}
          <circle cx="72" cy="116" r="10" fill="#16a765" />
          <circle cx="246" cy="114" r="9" fill="#16a765" opacity="0.85" />
        </g>
      )}

      {kind === "private" && (
        <g>
          {/* Isometric room cutaway: left wall + right wall + floor */}
          <polygon points="160,104 242,134 160,164 78,134" fill="#f8fbff" stroke="#d0e0f5" strokeWidth="1" />
          <polygon points="78,70 160,40 160,104 78,134" fill="#ffffff" stroke="#d0e0f5" strokeWidth="1" />
          <polygon points="160,40 242,70 242,134 160,104" fill="#e6f1ff" stroke="#c3d9f5" strokeWidth="1" />
          {/* Sunlit window on right wall */}
          <polygon points="184,64 220,77 220,108 184,95" fill="#9fd3ff" stroke="#1769d2" strokeWidth="2" />
          <polygon points="184,95 220,108 186,144 148,130" fill="#ffffff" opacity="0.55" />
          {/* Isometric 3D bed */}
          <polygon points="104,116 144,101 180,115 140,130" fill="#16a765" />
          <polygon points="104,116 140,130 140,141 104,127" fill="#0d824d" />
          <polygon points="140,130 180,115 180,126 140,141" fill="#095e37" />
          {/* Pillow */}
          <polygon points="110,114 134,105 146,110 122,119" fill="#ffffff" />
          {/* Isometric study desk */}
          <polygon points="174,126 206,114 222,120 190,132" fill="#1769d2" />
          <polygon points="174,126 190,132 190,144 174,138" fill="#1256ab" />
          <polygon points="190,132 222,120 222,132 190,144" fill="#102c50" />
          {/* Desk lamp */}
          <circle cx="198" cy="116" r="4" fill="#16a765" />
        </g>
      )}

      {kind === "shared" && (
        <g>
          {/* Isometric twin room cutaway */}
          <polygon points="160,104 246,134 160,166 74,134" fill="#f8fbff" stroke="#d0e0f5" strokeWidth="1" />
          <polygon points="74,68 160,38 160,104 74,134" fill="#ffffff" stroke="#d0e0f5" strokeWidth="1" />
          <polygon points="160,38 246,68 246,134 160,104" fill="#e6f1ff" stroke="#c3d9f5" strokeWidth="1" />
          {/* Center divider / window */}
          <polygon points="144,54 176,54 176,88 144,88" fill="#cfe6ff" stroke="#1769d2" strokeWidth="1.5" opacity="0.85" />
          {/* Left Bed (Royal Blue) */}
          <polygon points="94,116 130,103 156,113 120,126" fill="#1769d2" />
          <polygon points="94,116 120,126 120,137 94,127" fill="#1256ab" />
          <polygon points="120,126 156,113 156,124 120,137" fill="#102c50" />
          <polygon points="98,114 120,106 130,110 108,118" fill="#ffffff" />
          {/* Right Bed (Emerald Green) */}
          <polygon points="164,114 200,101 226,111 190,124" fill="#16a765" />
          <polygon points="164,114 190,124 190,135 164,125" fill="#0d824d" />
          <polygon points="190,124 226,111 226,122 190,135" fill="#095e37" />
          <polygon points="168,112 190,104 200,108 178,116" fill="#ffffff" />
          {/* Shared rug */}
          <polygon points="160,132 184,141 160,150 136,141" fill="#dbeafe" />
        </g>
      )}

      {kind === "student" && (
        <g>
          <polygon points="92,126 244,142 160,170 76,140" fill={`url(#shd-${id})`} />
          {/* Campus Hall */}
          <polygon points="86,74 160,102 160,148 86,120" fill="#ffffff" stroke="#d5e4f7" strokeWidth="1" />
          <polygon points="160,102 234,74 234,120 160,148" fill="#dceafd" stroke="#c3d9f5" strokeWidth="1" />
          {/* Pitched 3D Architectural Roof */}
          <polygon points="80,74 160,30 160,102" fill="#16a765" />
          <polygon points="160,30 240,74 160,102" fill="#0d824d" />
          {/* Gable crest */}
          <polygon points="160,30 240,74 234,76 160,36 86,76 80,74" fill="#102c50" opacity="0.25" />
          {/* Colonnade windows */}
          {[0, 1, 2].map((c) => (
            <polygon
              key={`sl-${c}`}
              points={`${98 + c * 20},${92 + c * 8} ${110 + c * 20},${96 + c * 8} ${110 + c * 20},${116 + c * 8} ${98 + c * 20},${112 + c * 8}`}
              fill="#1769d2"
              opacity="0.8"
            />
          ))}
          {[0, 1, 2].map((c) => (
            <polygon
              key={`sr-${c}`}
              points={`${170 + c * 20},${104 - c * 8} ${182 + c * 20},${99 - c * 8} ${182 + c * 20},${119 - c * 8} ${170 + c * 20},${124 - c * 8}`}
              fill="#102c50"
              opacity="0.72"
            />
          ))}
          {/* Courtyard steps */}
          <polygon points="146,136 160,141 160,152 146,147" fill="#1769d2" />
          <polygon points="160,141 174,136 174,147 160,152" fill="#1256ab" />
          {/* Tree */}
          <circle cx="242" cy="116" r="10" fill="#16a765" />
          <circle cx="76" cy="120" r="8" fill="#1769d2" opacity="0.75" />
        </g>
      )}
    </svg>
  );
}
