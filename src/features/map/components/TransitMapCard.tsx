import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Progress } from '@heroui/react';
import { Compass, Focus, Map as MapIcon, Play, RotateCcw, Square } from 'lucide-react';
import { CORRIDORS, STOPS } from '@/shared/data/bandungTransit';
import { formatRupiah } from '@/shared/lib/format';
import { trackEvent } from '@/shared/lib/analytics';
import { getCorridorsForStop, type TransitRouteOption } from '@/features/routing/router';
import { buildSimulationSteps } from '@/features/routing/simulator';
import { useTransitStore } from '@/features/routing/store';
import { StopInspectorCard } from './StopInspectorCard';

const FULL_WIDTH = 920;
const FULL_HEIGHT = 615;

const MAJOR_HUBS = new Set([
  'kbp', 'cimahi', 'cimindi', 'cibeureum', 'elang', 'ciroyom', 'caringin', 'cijerah',
  'sarijadi', 'pasteur_pvj', 'lembang', 'ledeng', 'ciumbuleuit', 'dago_itb', 'dipatiukur',
  'sadang_serang', 'gasibu', 'stasiun_hall', 'alun_alun', 'kebon_kalapa', 'leuwipanjang',
  'cibaduyut', 'cicaheum', 'antapani', 'kiaracondong', 'ujungberung', 'buah_batu',
  'margahayu', 'ciwastra', 'gedebage', 'cibiru', 'jatinangor', 'soreang', 'bojongsoang',
  'baleendah', 'majalaya',
]);

const LABEL_OFFSETS: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
  kbp: { dx: 0, dy: -14, anchor: 'start' },
  padalarang: { dx: -6, dy: 19, anchor: 'middle' },
  cimahi: { dx: 0, dy: -13, anchor: 'middle' },
  cimindi: { dx: 0, dy: -12, anchor: 'middle' },
  gunung_batu: { dx: -10, dy: 4, anchor: 'end' },
  cijerah: { dx: -10, dy: 4, anchor: 'end' },
  bumi_asri: { dx: -10, dy: 14, anchor: 'end' },
  caringin: { dx: -10, dy: 4, anchor: 'end' },
  cibeureum: { dx: -10, dy: 14, anchor: 'end' },
  elang: { dx: 0, dy: 17, anchor: 'middle' },
  ciroyom: { dx: -10, dy: -8, anchor: 'end' },
  sarijadi: { dx: -10, dy: 4, anchor: 'end' },
  karang_setra: { dx: 0, dy: -12, anchor: 'middle' },
  pasteur_pvj: { dx: -10, dy: 4, anchor: 'end' },
  pajajaran: { dx: -10, dy: 4, anchor: 'end' },
  sederhana: { dx: 0, dy: -11, anchor: 'middle' },
  lembang: { dx: 12, dy: 4, anchor: 'start' },
  ledeng: { dx: -12, dy: 4, anchor: 'end' },
  ciumbuleuit: { dx: 11, dy: -7, anchor: 'start' },
  cisitu: { dx: 10, dy: -8, anchor: 'start' },
  cihampelas: { dx: -8, dy: 15, anchor: 'end' },
  dago_itb: { dx: 10, dy: -10, anchor: 'start' },
  dipatiukur: { dx: 10, dy: -10, anchor: 'start' },
  sadang_serang: { dx: 11, dy: 4, anchor: 'start' },
  gasibu: { dx: 11, dy: -9, anchor: 'start' },
  riau_martadinata: { dx: 11, dy: 4, anchor: 'start' },
  bip_bec: { dx: 10, dy: -8, anchor: 'start' },
  stasiun_hall: { dx: -10, dy: -9, anchor: 'end' },
  balai_kota: { dx: 10, dy: 13, anchor: 'start' },
  alun_alun: { dx: -11, dy: 11, anchor: 'end' },
  kebon_kalapa: { dx: 11, dy: 14, anchor: 'start' },
  sudirman: { dx: 0, dy: 19, anchor: 'middle' },
  kosambi: { dx: 10, dy: -9, anchor: 'start' },
  cikudapateuh: { dx: 10, dy: 13, anchor: 'start' },
  tegallega: { dx: -11, dy: 11, anchor: 'end' },
  leuwipanjang: { dx: -11, dy: 4, anchor: 'end' },
  cibaduyut: { dx: 0, dy: 18, anchor: 'middle' },
  bkr_palasari: { dx: 10, dy: 15, anchor: 'start' },
  laswi: { dx: 10, dy: 4, anchor: 'start' },
  binong: { dx: -10, dy: 14, anchor: 'end' },
  pahlawan: { dx: 0, dy: -12, anchor: 'middle' },
  cicadas: { dx: 10, dy: -8, anchor: 'start' },
  cicaheum: { dx: 11, dy: -9, anchor: 'start' },
  antapani: { dx: 11, dy: 4, anchor: 'start' },
  kiara_artha: { dx: 10, dy: 4, anchor: 'start' },
  kiaracondong: { dx: 11, dy: 4, anchor: 'start' },
  panghegar: { dx: 10, dy: 14, anchor: 'start' },
  ujungberung: { dx: 0, dy: -13, anchor: 'middle' },
  buah_batu: { dx: -10, dy: 14, anchor: 'end' },
  margahayu: { dx: 10, dy: -8, anchor: 'start' },
  ciwastra: { dx: -10, dy: 13, anchor: 'end' },
  derwati: { dx: 10, dy: 14, anchor: 'start' },
  riung_bandung: { dx: 11, dy: 4, anchor: 'start' },
  gedebage: { dx: 0, dy: -13, anchor: 'middle' },
  cibiru: { dx: 0, dy: -13, anchor: 'middle' },
  panyileukan: { dx: 0, dy: 18, anchor: 'middle' },
  jatinangor: { dx: -4, dy: -13, anchor: 'end' },
  moh_toha: { dx: -10, dy: 15, anchor: 'end' },
  mengger: { dx: 10, dy: 14, anchor: 'start' },
  kopo: { dx: -11, dy: 4, anchor: 'end' },
  soreang: { dx: 0, dy: 19, anchor: 'middle' },
  bojongsoang: { dx: 11, dy: 4, anchor: 'start' },
  dayeuhkolot: { dx: -11, dy: 4, anchor: 'end' },
  baleendah: { dx: 0, dy: 19, anchor: 'middle' },
  ciparay: { dx: 0, dy: 19, anchor: 'middle' },
  majalaya: { dx: 0, dy: 19, anchor: 'middle' },
};

const SHORT_NAMES: Record<string, string> = {
  kbp: 'Kota Baru Parahyangan', padalarang: 'Padalarang', cimahi: 'Cimahi', cimindi: 'Cimindi',
  gunung_batu: 'Gunung Batu', cijerah: 'Cijerah', bumi_asri: 'Bumi Asri', caringin: 'Caringin',
  cibeureum: 'Cibeureum', elang: 'Elang', ciroyom: 'Ciroyom', sarijadi: 'Sarijadi',
  karang_setra: 'Karang Setra', pasteur_pvj: 'PVJ / Pasteur', pajajaran: 'Pajajaran',
  sederhana: 'Sederhana', lembang: 'Lembang', ledeng: 'Ledeng / UPI', ciumbuleuit: 'Unpar',
  cisitu: 'Cisitu', cihampelas: 'Cihampelas', dago_itb: 'ITB / Dago', dipatiukur: 'Unpad DU',
  sadang_serang: 'Sadang Serang', gasibu: 'Gasibu', riau_martadinata: 'Jl. Riau',
  bip_bec: 'BEC / BIP', stasiun_hall: 'St. Bandung', balai_kota: 'Balai Kota',
  alun_alun: 'Alun-Alun', kebon_kalapa: 'Kebon Kalapa', sudirman: 'Sudirman',
  kosambi: 'Kosambi', cikudapateuh: 'Cikudapateuh', tegallega: 'Tegallega',
  leuwipanjang: 'Leuwipanjang', cibaduyut: 'Cibaduyut', bkr_palasari: 'BKR / Palasari',
  laswi: 'Laswi', binong: 'Binong / TSM', pahlawan: 'Pahlawan', cicadas: 'Cicadas',
  cicaheum: 'Cicaheum', antapani: 'Antapani', kiara_artha: 'Kiara Artha',
  kiaracondong: 'Kiaracondong', panghegar: 'Panghegar', ujungberung: 'Ujungberung',
  buah_batu: 'Buah Batu', margahayu: 'Margahayu', ciwastra: 'Ciwastra', derwati: 'Derwati',
  riung_bandung: 'Riung Bandung', gedebage: 'Gedebage', cibiru: 'Cibiru',
  panyileukan: 'Panyileukan', jatinangor: 'Jatinangor', moh_toha: 'Moh. Toha',
  mengger: 'Mengger', kopo: 'Kopo', soreang: 'Soreang', bojongsoang: 'Telkom Univ',
  dayeuhkolot: 'Dayeuhkolot', baleendah: 'Baleendah', ciparay: 'Ciparay', majalaya: 'Majalaya',
};

function buildPath(stopIds: string[]): string {
  const pts = stopIds.map((id) => STOPS[id]).filter(Boolean);
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

function computeViewBox(
  activeRoute: TransitRouteOption | null,
  focusRoute: boolean,
  filterCorridorId: string
): string {
  let targetStopIds: string[] | null = null;
  if (focusRoute && activeRoute && activeRoute.allStops.length >= 2) {
    targetStopIds = activeRoute.allStops;
  } else if (focusRoute && filterCorridorId !== 'ALL') {
    const c = CORRIDORS.find((x) => x.id === filterCorridorId);
    if (c) targetStopIds = c.stops;
  }

  if (!targetStopIds) return `0 0 ${FULL_WIDTH} ${FULL_HEIGHT}`;
  const pts = targetStopIds.map((id) => STOPS[id]).filter(Boolean);
  if (pts.length === 0) return `0 0 ${FULL_WIDTH} ${FULL_HEIGHT}`;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  let width = Math.max(360, maxX - minX + 220);
  let height = Math.max(260, maxY - minY + 160);
  const aspect = 1.45;
  if (width / height < aspect) width = height * aspect;
  else height = width / aspect;

  width = Math.min(FULL_WIDTH, width);
  height = Math.min(FULL_HEIGHT, height);

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const vx = Math.max(0, Math.min(FULL_WIDTH - width, cx - width / 2));
  const vy = Math.max(0, Math.min(FULL_HEIGHT - height, cy - height / 2));
  return `${Math.round(vx)} ${Math.round(vy)} ${Math.round(width)} ${Math.round(height)}`;
}

interface SimVehicle {
  x: number;
  y: number;
  color: string;
  label: string;
}

export function TransitMapCard() {
  const activeTab = useTransitStore((s) => s.activeTab);
  const fromId = useTransitStore((s) => s.fromId);
  const toId = useTransitStore((s) => s.toId);
  const passengerType = useTransitStore((s) => s.passengerType);
  const routes = useTransitStore((s) => s.routes);
  const selectedRouteIndex = useTransitStore((s) => s.selectedRouteIndex);
  const selectedStopId = useTransitStore((s) => s.selectedStopId);
  const focusRoute = useTransitStore((s) => s.focusRoute);
  const filterCorridorId = useTransitStore((s) => s.filterCorridorId);
  const operatorFilter = useTransitStore((s) => s.operatorFilter);
  const simRunId = useTransitStore((s) => s.simRunId);

  const setSelectedStopId = useTransitStore((s) => s.setSelectedStopId);
  const toggleFocusRoute = useTransitStore((s) => s.toggleFocusRoute);
  const triggerSimulation = useTransitStore((s) => s.triggerSimulation);

  const activeRoute = activeTab === 'planner' ? (routes[selectedRouteIndex] ?? null) : null;

  const [simRunning, setSimRunning] = useState(false);
  const [simFinished, setSimFinished] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  const [simProgress, setSimProgress] = useState(0);
  const [simVehicle, setSimVehicle] = useState<SimVehicle | null>(null);

  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRunRef = useRef(0);

  const clearTimers = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopSimulation = () => {
    activeRunRef.current += 1;
    clearTimers();
    setSimRunning(false);
    setSimFinished(false);
    setSimVehicle(null);
    setSimMessage('');
    setSimProgress(0);
  };

  // Reset simulasi ketika rute aktif berubah
  useEffect(() => {
    stopSimulation();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoute?.id, activeTab, filterCorridorId]);

  // Mulai simulasi saat simRunId meningkat
  useEffect(() => {
    if (simRunId === 0 || !activeRoute) return;

    const steps = buildSimulationSteps(activeRoute, passengerType);
    if (steps.length === 0) return;

    clearTimers();
    const runToken = activeRunRef.current + 1;
    activeRunRef.current = runToken;

    setSimRunning(true);
    setSimFinished(false);
    setSimProgress(0);

    const totalSteps = steps.length;
    const segDurationMs = Math.max(1250, Math.min(2000, Math.round(9000 / totalSteps)));

    const runStep = (idx: number) => {
      if (activeRunRef.current !== runToken) return;
      if (idx >= totalSteps) {
        const last = steps[totalSteps - 1];
        setSimVehicle({ x: last.toX, y: last.toY, color: '#059669', label: '✓' });
        setSimMessage(last.arrivalMessage);
        setSimProgress(100);
        setSimRunning(false);
        setSimFinished(true);
        return;
      }

      const step = steps[idx];
      setSimMessage(step.message);
      const startTime = performance.now();

      const animate = (now: number) => {
        if (activeRunRef.current !== runToken) return;
        const t = Math.min(1, (now - startTime) / segDurationMs);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const x = step.fromX + (step.toX - step.fromX) * ease;
        const y = step.fromY + (step.toY - step.fromY) * ease;

        setSimVehicle({
          x,
          y,
          color: step.corridorColor,
          label: step.isAngkot ? 'A' : 'B',
        });
        setSimProgress(Math.round(((idx + t) / totalSteps) * 100));

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setSimMessage(step.arrivalMessage);
          const pauseMs = step.isTransferNext ? 1500 : 500;
          timerRef.current = setTimeout(() => runStep(idx + 1), pauseMs);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    runStep(0);
    return () => clearTimers();
  }, [simRunId, activeRoute, passengerType]);

  const viewBox = useMemo(
    () => computeViewBox(activeRoute, focusRoute, filterCorridorId),
    [activeRoute, focusRoute, filterCorridorId]
  );

  const visibleCorridors = useMemo(
    () =>
      CORRIDORS.filter((c) => {
        if (filterCorridorId !== 'ALL') return c.id === filterCorridorId;
        if (operatorFilter !== 'ALL') return c.operator === operatorFilter;
        return true;
      }),
    [filterCorridorId, operatorFilter]
  );

  const activeStopSet = useMemo(
    () => new Set(activeRoute ? activeRoute.allStops : []),
    [activeRoute]
  );

  const transferStopSet = useMemo(
    () => new Set(activeRoute ? activeRoute.legs.slice(0, -1).map((l) => l.toId) : []),
    [activeRoute]
  );

  const isFullOverview = !activeRoute && filterCorridorId === 'ALL';
  const isWideCanvas = !focusRoute || isFullOverview;

  const heading = useMemo(() => {
    if (activeRoute) {
      const start = STOPS[activeRoute.allStops[0]]?.name;
      const end = STOPS[activeRoute.allStops[activeRoute.allStops.length - 1]]?.name;
      return {
        title: `${start} → ${end}`,
        sub: `${activeRoute.totalDistanceKm} km · Estimasi ~${activeRoute.totalMinutes} mnt · ${formatRupiah(activeRoute.totalFare)}`,
      };
    }
    if (filterCorridorId !== 'ALL') {
      const c = CORRIDORS.find((x) => x.id === filterCorridorId);
      if (c) {
        return {
          title: `${c.code} · ${c.name}`,
          sub: `${c.shortDesc}${c.vehicleColorLabel ? ` · Warna: ${c.vehicleColorLabel}` : ''}`,
        };
      }
    }
    return {
      title: 'Peta Jaringan Bandung Raya',
      sub: 'Ketuk titik halte di peta untuk melihat jalur & memilih Asal/Tujuan',
    };
  }, [activeRoute, filterCorridorId]);

  return (
    <Card
      shadow="none"
      className="overflow-hidden rounded-3xl border-2 border-sky-200/80 bg-white shadow-[0_5px_0_rgba(0,74,173,0.08)]"
    >
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 bg-white px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold leading-snug text-slate-900">{heading.title}</h2>
          <p className="mt-0.5 text-xs font-medium leading-snug text-slate-500">{heading.sub}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            radius="full"
            onPress={() => {
              stopSimulation();
              toggleFocusRoute();
            }}
            startContent={
              focusRoute ? <MapIcon className="h-3.5 w-3.5" /> : <Focus className="h-3.5 w-3.5" />
            }
            className="h-9 bg-[#E8F4FF] px-3.5 font-extrabold text-[#004AAD] shadow-[0_3px_0_#bfdbfe] transition-transform active:translate-y-0.5"
          >
            {focusRoute ? 'Peta Penuh' : 'Fokus Rute'}
          </Button>

          {activeRoute && (
            <Button
              size="sm"
              color={simRunning ? 'danger' : 'primary'}
              variant={simRunning ? 'flat' : 'solid'}
              radius="full"
              onPress={() => {
                if (simRunning) stopSimulation();
                else {
                  trackEvent('route_simulation_started', {
                    corridors: activeRoute.legs.map((l) => l.corridorCode).join(' -> '),
                    transfers: activeRoute.transfers,
                    trigger_source: 'map',
                  });
                  triggerSimulation();
                }
              }}
              startContent={
                simRunning ? (
                  <Square className="h-3 w-3 fill-current" />
                ) : simFinished ? (
                  <RotateCcw className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )
              }
              className={`h-9 px-3.5 font-extrabold transition-transform active:translate-y-0.5 ${
                simRunning ? 'shadow-[0_3px_0_#fecdd3]' : 'shadow-[0_3px_0_#002D6B]'
              }`}
            >
              {simRunning ? 'Stop' : simFinished ? 'Putar Ulang' : 'Simulasikan'}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Live Simulation Narration Strip */}
      {(simRunning || simFinished) && (
        <div className="border-b border-amber-200 bg-amber-50/95 px-4 py-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
              <Compass className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              {simMessage}
            </span>
            <Button
              size="sm"
              variant="flat"
              color="warning"
              radius="full"
              onPress={stopSimulation}
              className="h-6 min-w-0 bg-amber-200/70 px-2.5 text-[11px] font-extrabold text-amber-950"
            >
              Tutup
            </Button>
          </div>
          <Progress
            aria-label="Progres simulasi rute"
            size="sm"
            color="primary"
            value={simProgress}
            classNames={{ track: 'bg-amber-200/70' }}
          />
        </div>
      )}

      {/* Interactive SVG Map Stage */}
      <CardBody className="relative bg-[#F4F9FF] p-0">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={viewBox}
            className={`block h-auto w-full select-none ${isWideCanvas ? 'min-w-[620px] lg:min-w-0' : ''}`}
            role="img"
            aria-label="Peta interaktif 54 jalur Bus dan Angkot Bandung Raya"
          >
            <defs>
              <pattern id="metroDotsSky" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="1.2" fill="#004AAD" opacity="0.11" />
              </pattern>
              <filter id="vehicleShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3"
                  floodColor="#002D6B"
                  floodOpacity="0.32"
                />
              </filter>
            </defs>

            <rect width={FULL_WIDTH} height={FULL_HEIGHT} fill="#F4F9FF" />
            <rect width={FULL_WIDTH} height={FULL_HEIGHT} fill="url(#metroDotsSky)" />

            {/* Soft playful Bandung geography tints (Dago hills, parks, sky clouds) */}
            <g className="pointer-events-none">
              <ellipse cx="520" cy="125" rx="185" ry="62" fill="#BBF7D0" opacity="0.22" />
              <ellipse cx="785" cy="245" rx="115" ry="52" fill="#BAE6FD" opacity="0.24" />
              <ellipse cx="185" cy="485" rx="145" ry="64" fill="#BBF7D0" opacity="0.18" />
              <ellipse cx="725" cy="505" rx="150" ry="58" fill="#BAE6FD" opacity="0.18" />
            </g>

            {/* Zone Watermarks */}
            <g className="pointer-events-none fill-[#004AAD]/30 text-[10.5px] font-extrabold tracking-[0.12em]">
              <text x="86" y="96">BANDUNG BARAT &amp; CIMAHI</text>
              <text x="612" y="64">BANDUNG UTARA · LEMBANG</text>
              <text x="720" y="148">BANDUNG TIMUR · JATINANGOR</text>
              <text x="148" y="596">SOREANG · KAB. BANDUNG</text>
              <text x="646" y="600">BALEENDAH · MAJALAYA</text>
            </g>

            {/* Layer 1: Background Corridors */}
            <g>
              {visibleCorridors.map((c) => {
                const isAngkot = c.operator === 'ANGKOT';
                const isSingleFocus = filterCorridorId === c.id;

                let opacity = isAngkot ? (operatorFilter === 'ANGKOT' ? 0.55 : 0.22) : 0.78;
                let width = isAngkot ? 2.1 : 4.0;
                let dash: string | undefined = isAngkot ? '4 4' : undefined;

                if (activeRoute) {
                  opacity = isAngkot ? 0.045 : 0.13;
                  width = isAngkot ? 1.6 : 2.8;
                } else if (isSingleFocus) {
                  opacity = 0.96;
                  width = 5.4;
                  dash = undefined;
                }

                return (
                  <path
                    key={c.id}
                    d={buildPath(c.stops)}
                    fill="none"
                    stroke={c.color}
                    strokeWidth={width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={opacity}
                    strokeDasharray={dash}
                  />
                );
              })}
            </g>

            {/* Layer 2: Active Route Highlight */}
            {activeRoute && (
              <g>
                {activeRoute.legs.map((leg, i) => {
                  const d = buildPath(leg.stops);
                  return (
                    <g key={`${leg.corridorId}-${i}`}>
                      <path
                        d={d}
                        fill="none"
                        stroke={leg.corridorColor}
                        strokeWidth={11}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeOpacity={0.22}
                      />
                      <path
                        d={d}
                        fill="none"
                        stroke={leg.corridorColor}
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={d}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="6 12"
                        className="route-flow-anim"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Layer 3: Stops */}
            <g>
              {Object.values(STOPS).map((stop) => {
                const stopCorridors = getCorridorsForStop(stop.id);
                const isMajor = MAJOR_HUBS.has(stop.id);
                const isOrigin = activeTab === 'planner' && stop.id === fromId;
                const isDest = activeTab === 'planner' && stop.id === toId;
                const isTransfer = transferStopSet.has(stop.id);
                const isOnActiveRoute = activeStopSet.has(stop.id);
                const isSelected = stop.id === selectedStopId;

                const matchesFilter =
                  (filterCorridorId === 'ALL' ||
                    stopCorridors.some((c) => c.id === filterCorridorId)) &&
                  (operatorFilter === 'ALL' ||
                    stopCorridors.some((c) => c.operator === operatorFilter));

                const dimmedByRoute = activeRoute && !isOnActiveRoute && !isSelected;

                let fill = '#ffffff';
                let stroke = stopCorridors[0]?.color ?? '#64748b';
                let radius = isMajor ? 5.6 : 3.8;
                let strokeWidth = 2.2;

                if (isOrigin) {
                  fill = '#004AAD';
                  stroke = '#ffffff';
                  radius = 9.5;
                  strokeWidth = 2.8;
                } else if (isDest) {
                  fill = '#e11d48';
                  stroke = '#ffffff';
                  radius = 9.5;
                  strokeWidth = 2.8;
                } else if (isTransfer) {
                  fill = '#f59e0b';
                  stroke = '#ffffff';
                  radius = 8.5;
                  strokeWidth = 2.6;
                } else if (isOnActiveRoute || (filterCorridorId !== 'ALL' && matchesFilter)) {
                  fill = '#ffffff';
                  stroke = '#004AAD';
                  radius = 5.6;
                  strokeWidth = 2.6;
                }

                const opacity = !matchesFilter ? 0.12 : dimmedByRoute ? 0.16 : 1;
                const offset = LABEL_OFFSETS[stop.id] ?? { dx: 0, dy: -12, anchor: 'middle' };
                const labelText = SHORT_NAMES[stop.id] ?? stop.name;

                const showLabel =
                  isOrigin ||
                  isDest ||
                  isTransfer ||
                  isOnActiveRoute ||
                  isSelected ||
                  (filterCorridorId !== 'ALL' && matchesFilter) ||
                  (isFullOverview && isMajor && matchesFilter);

                const isProminent =
                  isOrigin ||
                  isDest ||
                  isTransfer ||
                  isOnActiveRoute ||
                  isSelected ||
                  (filterCorridorId !== 'ALL' && matchesFilter);

                return (
                  <g
                    key={stop.id}
                    opacity={opacity}
                    className="cursor-pointer"
                    onClick={() => setSelectedStopId(stop.id)}
                  >
                    <circle cx={stop.x} cy={stop.y} r={15} fill="transparent" />
                    {(isOrigin || isDest) && (
                      <circle
                        cx={stop.x}
                        cy={stop.y}
                        r={16}
                        fill={isOrigin ? '#004AAD' : '#e11d48'}
                        opacity={0.22}
                        className="pulse-ring"
                      />
                    )}
                    {isSelected && (
                      <circle
                        cx={stop.x}
                        cy={stop.y}
                        r={13.5}
                        fill="none"
                        stroke="#004AAD"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle
                      cx={stop.x}
                      cy={stop.y}
                      r={radius}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                    />
                    {isOrigin && (
                      <text
                        x={stop.x}
                        y={stop.y + 3.5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="800"
                      >
                        A
                      </text>
                    )}
                    {isDest && (
                      <text
                        x={stop.x}
                        y={stop.y + 3.5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="800"
                      >
                        B
                      </text>
                    )}
                    {isTransfer && !isOrigin && !isDest && (
                      <text
                        x={stop.x}
                        y={stop.y + 3.2}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="800"
                      >
                        ⇄
                      </text>
                    )}
                    {showLabel && (
                      <text
                        x={stop.x + offset.dx}
                        y={stop.y + offset.dy}
                        textAnchor={offset.anchor}
                        fill={isProminent ? '#0f172a' : '#475569'}
                        fontSize={isProminent ? '11' : '10'}
                        fontWeight={isProminent ? '800' : '600'}
                        style={{
                          pointerEvents: 'none',
                          paintOrder: 'stroke',
                          stroke: '#F4F9FF',
                          strokeWidth: 4,
                          strokeLinejoin: 'round',
                        }}
                      >
                        {labelText}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Animated Simulation Vehicle Token */}
            {simVehicle && (
              <g
                transform={`translate(${simVehicle.x.toFixed(1)}, ${simVehicle.y.toFixed(1)})`}
                filter="url(#vehicleShadow)"
              >
                <circle cx={0} cy={0} r={20} fill="#FACC15" opacity={0.35} />
                <circle
                  cx={0}
                  cy={0}
                  r={13}
                  fill={simVehicle.color}
                  stroke="#FACC15"
                  strokeWidth={3.2}
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="900"
                >
                  {simVehicle.label}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Stop Inspector Sheet */}
        <div className="p-2.5 sm:p-0">
          <StopInspectorCard />
        </div>
      </CardBody>

      <CardFooter className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-sky-100 bg-white px-4 py-2.5 text-[11px] font-bold text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#004AAD]" /> Asal (A)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Tujuan (B)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Transit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-[#004AAD]" /> Bus MJT/TMB
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-amber-600" /> Angkot
        </span>
      </CardFooter>
    </Card>
  );
}
