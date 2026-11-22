import type { TransitCorridor } from '@/shared/data/bandungTransit';
import type { OperatorId, TrafficMode } from './schemas';

export interface LiveTrackerLink {
  label: string;
  url: string;
}

export interface TmbTimetable {
  forward: string[];
  backward: string[];
  fleetNote: string;
}

export interface MjtSchedule {
  first: string;
  last: string;
  headwayRange: string;
}

export type ScheduleStatusType = 'active' | 'upcoming' | 'closing_soon' | 'long_wait' | 'closed';
export type ScheduleTone = 'success' | 'warning' | 'danger';

export interface LegScheduleEvaluation {
  status: ScheduleStatusType;
  tone: ScheduleTone;
  hasExactTimetable: boolean;
  waitMinutes: number | null;
  nextPassStr?: string;
  terminalDepStr?: string;
  headline: string;
  detail: string;
  allDepartures?: string[];
  upcomingTimes?: string[];
  tracker: LiveTrackerLink | null;
}

export const LIVE_TRACKERS: Record<'TMB' | 'MJT', LiveTrackerLink> = {
  TMB: { label: 'Cek Live (BEMO)', url: 'https://bemo.uptangkutan-bandung.id' },
  MJT: { label: 'Cek Live (MJT)', url: 'https://mjt.trans.my.id' },
};

// Time Table resmi Trans Metro Bandung (PDF UPTD Angkutan Dishub Kota Bandung)
export const TMB_TIMETABLES: Record<string, TmbTimetable> = {
  'TMB-1': {
    forward: [
      '05:10', '05:25', '05:40', '05:55', '06:10', '06:35', '07:05',
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
      '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30',
    ],
    backward: [
      '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00',
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
      '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30',
    ],
    fleetNote: '7 bus · interval 15–30 menit',
  },
  'TMB-2': {
    forward: [
      '05:30', '05:55', '06:20', '06:45', '07:10', '07:35', '08:00', '08:25',
      '08:50', '09:15', '09:40', '10:05', '10:30', '10:55', '11:20', '11:45',
      '12:10', '12:35', '13:00', '13:25', '13:50', '14:15', '14:40', '15:05',
      '15:30', '15:55', '16:20', '16:45', '17:10', '17:35', '18:00', '18:25',
    ],
    backward: [
      '05:30', '05:55', '06:20', '06:45', '07:10', '07:35', '08:00', '08:25',
      '08:50', '09:15', '09:40', '10:05', '10:30', '10:55', '11:20', '11:45',
      '12:10', '12:35', '13:00', '13:25', '13:50', '14:15', '14:40', '15:05',
      '15:30', '15:55', '16:20', '16:45', '17:10', '17:35', '18:00', '18:25',
    ],
    fleetNote: '8 bus · interval rutin 25 menit',
  },
  'TMB-3': {
    forward: ['06:00', '07:00', '08:00', '09:00', '10:30', '12:00', '13:30', '15:00'],
    backward: ['07:00', '08:00', '09:00', '10:30', '12:00', '13:30', '15:00', '16:00'],
    fleetNote: '2 bus · interval 60–90 menit',
  },
  'TMB-4': {
    forward: ['07:00', '08:00', '09:00', '10:30', '12:00', '13:30', '15:00', '16:30'],
    backward: ['06:00', '07:00', '08:00', '09:00', '10:30', '12:00', '13:30', '15:00'],
    fleetNote: '2 bus · interval 60–90 menit',
  },
  'TMB-5': {
    forward: ['06:30', '07:30', '08:30', '09:30', '11:00', '12:30', '14:00', '15:00'],
    backward: ['06:00', '07:00', '08:00', '09:00', '10:30', '12:00', '13:30', '15:00'],
    fleetNote: '2 bus · interval 60–90 menit',
  },
  'TMB-F1': {
    forward: ['06:00', '07:00', '08:00', '09:00', '10:30', '12:00', '13:30', '15:00'],
    backward: ['06:00', '07:00', '08:00', '09:00', '10:30', '12:00', '13:30', '15:30'],
    fleetNote: '2 bus feeder · interval 60–90 menit',
  },
  'TMB-F2': {
    forward: ['06:30', '07:30', '08:30', '09:30', '10:30', '12:00', '13:30', '15:00'],
    backward: ['06:30', '07:30', '08:30', '09:30', '10:30', '12:00', '13:30', '15:00'],
    fleetNote: '2 bus feeder · interval 60–90 menit',
  },
};

export const MJT_SCHEDULES: Record<string, MjtSchedule> = {
  'MJT-1': { first: '04:40', last: '20:30', headwayRange: '15–20 mnt' },
  'MJT-2': { first: '04:30', last: '20:00', headwayRange: '10–16 mnt' },
  'MJT-3': { first: '04:30', last: '20:00', headwayRange: '10–16 mnt' },
  'MJT-4': { first: '04:30', last: '20:30', headwayRange: '10–15 mnt' },
  'MJT-5': { first: '04:30', last: '19:30', headwayRange: '7–12 mnt' },
  'MJT-6': { first: '06:00', last: '14:00', headwayRange: '20–30 mnt' },
  'MJT-FD1': { first: '05:00', last: '20:00', headwayRange: '10–15 mnt' },
  'MJT-FD2': { first: '04:30', last: '20:00', headwayRange: '10–15 mnt' },
};

export function parseTimeToMinutes(hhmm: string): number | null {
  if (!hhmm || !hhmm.includes(':')) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function formatMinutesToHHMM(totalMinutes: number): string {
  const norm = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = String(Math.floor(norm / 60)).padStart(2, '0');
  const m = String(norm % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export function getCurrentWibMinutes(now = new Date()): number {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utcMs + 7 * 3600000);
  return wib.getHours() * 60 + wib.getMinutes();
}

function computeOffsetFromTerminus(
  corridor: TransitCorridor,
  fromId: string,
  isForward: boolean,
  trafficMultiplier: number
): number {
  const idx = corridor.stops.indexOf(fromId);
  if (idx === -1) return 0;

  let mins = 0;
  if (isForward) {
    for (let i = 0; i < idx; i++) mins += corridor.segmentMinutes[i];
  } else {
    for (let i = corridor.stops.length - 1; i > idx; i--) mins += corridor.segmentMinutes[i - 1];
  }
  return Math.round(mins * trafficMultiplier);
}

interface LegScheduleInput {
  corridorId: string;
  operatorId: OperatorId;
  fromId: string;
  toId: string;
  waitMinutes: number;
}

export function evaluateLegSchedule(
  leg: LegScheduleInput,
  corridor: TransitCorridor,
  currentMinutesWib: number,
  trafficMode: TrafficMode = 'normal'
): LegScheduleEvaluation {
  const trafficMultiplier = trafficMode === 'rush' ? 1.35 : 1.0;

  // 1) TMB — Time Table resmi PDF Dishub
  const tt = leg.operatorId === 'TMB' ? TMB_TIMETABLES[leg.corridorId] : undefined;
  if (tt) {
    const isForward = corridor.stops.indexOf(leg.fromId) < corridor.stops.indexOf(leg.toId);
    const departures = isForward ? tt.forward : tt.backward;
    const offsetMin = computeOffsetFromTerminus(corridor, leg.fromId, isForward, trafficMultiplier);

    const stopPassTimes = departures.map((depStr) => {
      const depMin = parseTimeToMinutes(depStr) ?? 0;
      return {
        terminalDepStr: depStr,
        passMin: depMin + offsetMin,
        passStr: formatMinutesToHHMM(depMin + offsetMin),
      };
    });

    const firstDep = departures[0];
    const lastDep = departures[departures.length - 1];
    const nextBus = stopPassTimes.find((t) => t.passMin >= currentMinutesWib) ?? null;
    const prevBus = [...stopPassTimes].reverse().find((t) => t.passMin < currentMinutesWib) ?? null;
    const upcomingTimes = stopPassTimes
      .filter((t) => t.passMin >= currentMinutesWib)
      .slice(0, 4)
      .map((t) => t.passStr);

    if (!nextBus) {
      return {
        status: 'closed',
        tone: 'danger',
        hasExactTimetable: true,
        waitMinutes: null,
        headline: `Bus terakhir sudah lewat (berangkat terakhir ${lastDep} WIB)`,
        detail: `Jadwal arah ini: ${firstDep}–${lastDep} WIB (${tt.fleetNote}). Besok mulai ${firstDep} WIB.`,
        allDepartures: departures,
        upcomingTimes: [],
        tracker: LIVE_TRACKERS.TMB,
      };
    }

    const waitMin = nextBus.passMin - currentMinutesWib;
    const isBeforeStart = !prevBus && waitMin > 45;
    const prevNote = prevBus ? ` · sebelumnya ~${currentMinutesWib - prevBus.passMin} mnt lalu` : '';

    return {
      status: isBeforeStart ? 'upcoming' : waitMin > 40 ? 'long_wait' : 'active',
      tone: isBeforeStart || waitMin > 40 ? 'warning' : 'success',
      hasExactTimetable: true,
      waitMinutes: waitMin,
      nextPassStr: nextBus.passStr,
      terminalDepStr: nextBus.terminalDepStr,
      headline:
        waitMin === 0
          ? `Estimasi bus sedang/segera lewat (~${nextBus.passStr} WIB)`
          : `Bus berikutnya estimasi ~${nextBus.passStr} WIB (${waitMin} mnt lagi)`,
      detail: `Berangkat terminal ${nextBus.terminalDepStr} WIB${prevNote} · ${tt.fleetNote}.`,
      allDepartures: departures,
      upcomingTimes,
      tracker: LIVE_TRACKERS.TMB,
    };
  }

  // 2) MJT — Jam operasional & headway resmi
  const mjt = leg.operatorId === 'MJT' ? MJT_SCHEDULES[leg.corridorId] : undefined;
  if (mjt) {
    const firstMin = parseTimeToMinutes(mjt.first) ?? 270;
    const lastMin = parseTimeToMinutes(mjt.last) ?? 1200;

    if (currentMinutesWib < firstMin) {
      return {
        status: 'upcoming',
        tone: 'warning',
        hasExactTimetable: false,
        waitMinutes: firstMin - currentMinutesWib,
        headline: `Belum beroperasi · mulai pukul ${mjt.first} WIB`,
        detail: `Jam operasional ${mjt.first}–${mjt.last} WIB · estimasi lewat tiap ${mjt.headwayRange}.`,
        tracker: LIVE_TRACKERS.MJT,
      };
    }

    if (currentMinutesWib > lastMin) {
      return {
        status: 'closed',
        tone: 'danger',
        hasExactTimetable: false,
        waitMinutes: null,
        headline: `Sudah selesai beroperasi hari ini (tutup ${mjt.last} WIB)`,
        detail: `Jam operasional koridor ini: ${mjt.first}–${mjt.last} WIB.`,
        tracker: LIVE_TRACKERS.MJT,
      };
    }

    const remainingMin = lastMin - currentMinutesWib;
    const isClosingSoon = remainingMin <= 45;

    return {
      status: isClosingSoon ? 'closing_soon' : 'active',
      tone: isClosingSoon ? 'warning' : 'success',
      hasExactTimetable: false,
      waitMinutes: leg.waitMinutes,
      headline: isClosingSoon
        ? `Segera berakhir (${remainingMin} mnt lagi tutup ${mjt.last} WIB)`
        : `Sedang beroperasi · estimasi lewat tiap ${mjt.headwayRange}`,
      detail: `Jam operasional ${mjt.first}–${mjt.last} WIB · pantau armada via tracker MJT.`,
      tracker: LIVE_TRACKERS.MJT,
    };
  }

  // 3) ANGKOT — Tanpa jadwal tetap
  const angkotOpen = 5 * 60;
  const angkotLate = 19 * 60 + 30;
  const angkotClose = 21 * 60 + 30;

  if (currentMinutesWib < angkotOpen || currentMinutesWib > angkotClose) {
    return {
      status: 'closed',
      tone: 'danger',
      hasExactTimetable: false,
      waitMinutes: null,
      headline: 'Di luar jam ramai angkot (umumnya 05:00–21:00 WIB)',
      detail: 'Angkot tidak memiliki jadwal tetap; malam/dini hari armada sangat jarang.',
      tracker: null,
    };
  }

  if (currentMinutesWib >= angkotLate) {
    return {
      status: 'closing_soon',
      tone: 'warning',
      hasExactTimetable: false,
      waitMinutes: 10,
      headline: 'Mulai jarang selepas 19:30 WIB (tanpa jadwal tetap)',
      detail: 'Estimasi tunggu lebih lama (~10–20 mnt) tergantung trayek.',
      tracker: null,
    };
  }

  return {
    status: 'active',
    tone: 'success',
    hasExactTimetable: false,
    waitMinutes: leg.waitMinutes,
    headline: 'Beroperasi (tanpa jadwal tetap) · rata-rata tiap 5–12 mnt',
    detail: 'Angkot tidak memakai jam keberangkatan pasti dan dapat ngetem di titik ramai.',
    tracker: null,
  };
}
