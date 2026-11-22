/**
 * Dekorasi SVG header yang proporsional (tanpa distorsi) & relevan dengan
 * identitas ManawiBandung: cakrawala perbukitan Bandung yang lembut,
 * jalur transit mengalir dengan titik halte, dan logo bus kota ramah.
 */

export function BandungHeaderBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Cahaya langit pagi/sore lembut di kanan atas (CSS radial, tidak pernah gepeng) */}
      <div
        className="absolute -right-12 -top-16 h-52 w-52 rounded-full opacity-35 blur-2xl"
        style={{
          background: 'radial-gradient(circle, #FDE047 0%, #38BDF8 55%, transparent 75%)',
        }}
      />
      <div
        className="absolute -left-10 -bottom-16 h-44 w-44 rounded-full opacity-25 blur-2xl"
        style={{
          background: 'radial-gradient(circle, #38BDF8 0%, transparent 70%)',
        }}
      />

      {/* Siluet perbukitan Bandung yang halus di bagian bawah */}
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M0,160 L0,126 C210,88 410,104 650,126 C890,148 1120,76 1440,108 L1440,160 Z"
          fill="#ffffff"
          opacity="0.06"
        />
        <path
          d="M0,160 L0,138 C280,114 540,146 860,120 C1100,100 1280,128 1440,118 L1440,160 Z"
          fill="#ffffff"
          opacity="0.09"
        />
      </svg>

      {/* Motif jalur rute transit mengalir di sisi kanan (rasio tetap, tidak melar) */}
      <svg
        viewBox="0 0 420 120"
        preserveAspectRatio="xMaxYMid meet"
        className="absolute right-0 top-0 h-full w-auto max-w-[65%] opacity-90"
      >
        {/* Jalur utama (Bus) */}
        <path
          d="M 28 106 C 102 106, 122 50, 204 52 C 276 54, 294 24, 396 28"
          fill="none"
          stroke="#BAE6FD"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.16"
        />
        <path
          d="M 28 106 C 102 106, 122 50, 204 52 C 276 54, 294 24, 396 28"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="6 6"
          opacity="0.34"
        />

        {/* Jalur cabang (Feeder / Angkot) */}
        <path
          d="M 204 52 C 254 54, 280 86, 366 86"
          fill="none"
          stroke="#FDE047"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.36"
        />

        {/* Titik-titik halte */}
        <circle cx="96" cy="92" r="4" fill="#004AAD" stroke="#ffffff" strokeWidth="2" opacity="0.55" />
        <circle cx="204" cy="52" r="5.5" fill="#0284C7" stroke="#ffffff" strokeWidth="2.5" opacity="0.7" />
        <circle cx="312" cy="34" r="4" fill="#004AAD" stroke="#ffffff" strokeWidth="2" opacity="0.55" />
        <circle cx="366" cy="86" r="4.5" fill="#FACC15" stroke="#ffffff" strokeWidth="2" opacity="0.72" />

        {/* Titik tujuan bercahaya hangat */}
        <circle cx="396" cy="28" r="10" fill="#FDE047" opacity="0.18" />
        <circle cx="396" cy="28" r="5" fill="#FACC15" stroke="#ffffff" strokeWidth="2.2" opacity="0.85" />
      </svg>
    </div>
  );
}

export function ManawiLogoMark() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/35 bg-white/20 shadow-sm backdrop-blur-xs">
      <svg
        viewBox="0 0 40 40"
        className="h-9 w-9"
        role="img"
        aria-label="Ikon bus ManawiBandung"
      >
        {/* Bodi bus ramah */}
        <rect x="7" y="6.5" width="26" height="21.5" rx="7" fill="#ffffff" />
        {/* Papan rute atas */}
        <rect x="13.5" y="9" width="13" height="2.4" rx="1.2" fill="#004AAD" opacity="0.24" />
        {/* Kaca depan biru langit */}
        <rect x="10.5" y="13" width="19" height="8" rx="3" fill="#0284C7" />
        {/* Kilau kaca */}
        <path
          d="M12.8 19.8 L16.2 14.2 L19.2 14.2 L15.8 19.8 Z"
          fill="#ffffff"
          opacity="0.32"
        />
        {/* Lampu kuning hangat */}
        <circle cx="13.5" cy="24.2" r="2" fill="#FACC15" />
        <circle cx="26.5" cy="24.2" r="2" fill="#FACC15" />
        {/* Garis senyum ramah */}
        <path
          d="M17.2 24.1 Q20 26 22.8 24.1"
          fill="none"
          stroke="#004AAD"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Roda */}
        <rect x="11" y="27.2" width="4.4" height="3.2" rx="1.4" fill="#002D6B" />
        <rect x="24.6" y="27.2" width="4.4" height="3.2" rx="1.4" fill="#002D6B" />
        {/* Lengkungan jalur kuning mentari di bawah */}
        <path
          d="M8.5 33.8 Q20 31 31.5 33.8"
          fill="none"
          stroke="#FDE047"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
