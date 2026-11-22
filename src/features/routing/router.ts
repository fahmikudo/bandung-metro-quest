import {
  CORRIDORS,
  OPERATORS,
  STOPS,
  type TransitCorridor,
} from '@/shared/data/bandungTransit';
import type { ModeFilter, OperatorId, PassengerType, TrafficMode } from './schemas';
import {
  evaluateLegSchedule,
  formatMinutesToHHMM,
  getCurrentWibMinutes,
  parseTimeToMinutes,
  type LegScheduleEvaluation,
} from './schedule';

export interface RouteLeg {
  corridorId: string;
  corridorCode: string;
  corridorName: string;
  corridorColor: string;
  vehicleColorLabel: string | null;
  operatorId: OperatorId;
  operatorName: string;
  category: 'bus' | 'angkot';
  directionName: string;
  fromId: string;
  toId: string;
  stops: string[];
  stopCount: number;
  rideMinutes: number;
  waitMinutes: number;
  distanceKm: number;
  fareRegular: number;
  fareDiscount: number;
  integratedFreeTransfer?: boolean;
  cashAccepted: boolean;
  cashOnly: boolean;
  paymentMethods: string[];
  schedule: LegScheduleEvaluation;
}

export interface MotorComparison {
  label: 'Ojol Motor';
  fareMin: number;
  fareMax: number;
  fareMid: number;
  savedMin: number;
  savedMax: number;
  savedMid: number;
  baselineEmissionKg: number;
  routeEmissionKg: number;
  co2DiffKg: number;
}

export interface CarComparison {
  label: 'Ojol Mobil';
  fareMin: number;
  fareMax: number;
  fareMid: number;
  savedMin: number;
  savedMax: number;
  savedMid: number;
  baselineEmissionKg: number;
  routeEmissionKg: number;
  co2SavedKg: number;
}

export interface RouteBadge {
  text: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

export interface TransitRouteOption {
  id: string;
  legs: RouteLeg[];
  transfers: number;
  totalFare: number;
  totalMinutes: number;
  totalRideMin: number;
  totalWaitMin: number;
  totalDistanceKm: number;
  departureTimeStr: string;
  estimatedArrivalStr: string;
  hasClosedLeg: boolean;
  scheduleStatus: 'active' | 'warning' | 'closed';
  co2SavedKg: number;
  routeEmissionKg: number;
  carBaselineEmissionKg: number;
  comparisons: {
    motor: MotorComparison;
    car: CarComparison;
  };
  requiresCashless: boolean;
  requiresCash: boolean;
  usesAngkot: boolean;
  usesBus: boolean;
  allStops: string[];
  corridorIds: string[];
  badges: RouteBadge[];
}

export interface FindRoutesOptions {
  passengerType?: PassengerType;
  trafficMode?: TrafficMode;
  modeFilter?: ModeFilter;
  departureTime?: string | null;
}

// Acuan faktor emisi UK DEFRA / Our World in Data & konsumsi BBM motor matic Indonesia (g CO2e / pkm)
export const EMISSION_G_PER_PKM = {
  CAR_BASELINE: 170,
  MOTOR_BASELINE: 60,
  MJT: 90,
  TMB: 90,
  ANGKOT: 60,
} as const;

const corridorById: Record<string, TransitCorridor> = Object.fromEntries(
  CORRIDORS.map((c) => [c.id, c])
);

const corridorsAtStop: Record<string, TransitCorridor[]> = {};
for (const corridor of CORRIDORS) {
  for (const stopId of corridor.stops) {
    if (!corridorsAtStop[stopId]) corridorsAtStop[stopId] = [];
    corridorsAtStop[stopId].push(corridor);
  }
}

function matchesModeFilter(corridor: TransitCorridor, modeFilter: ModeFilter): boolean {
  if (modeFilter === 'bus') return corridor.operator === 'MJT' || corridor.operator === 'TMB';
  if (modeFilter === 'angkot') return corridor.operator === 'ANGKOT';
  return true;
}

export function getCorridorsForStop(
  stopId: string,
  modeFilter: ModeFilter = 'all'
): TransitCorridor[] {
  const list = corridorsAtStop[stopId] ?? [];
  if (modeFilter === 'all') return list;
  return list.filter((c) => matchesModeFilter(c, modeFilter));
}

export function getCorridorById(id: string): TransitCorridor | null {
  return corridorById[id] ?? null;
}

/**
 * Perkiraan tarif angkot Bandung Raya berdasarkan jarak tempuh.
 * Sumber acuan: Panduan Angkot di Bandung Raya — Transport for Bandung
 * (https://transportforbandung.org/peta/angkot):
 * - 1–1,5 km: Rp3.000
 * - 1,5–5 km: Rp5.000
 * - 5–20 km: Rp5.000–Rp15.000
 * - 20–25 km: Rp15.000–Rp18.000
 */
export function estimateAngkotFare(distanceKm: number): { regular: number; discount: number } {
  let regular: number;

  if (distanceKm <= 1.5) {
    regular = 3000;
  } else if (distanceKm <= 5.0) {
    regular = 5000;
  } else if (distanceKm <= 20.0) {
    const raw = 5000 + ((distanceKm - 5.0) / 15.0) * 10000;
    regular = Math.min(15000, Math.max(5000, Math.round(raw / 1000) * 1000));
  } else {
    const raw = 15000 + ((Math.min(distanceKm, 25.0) - 20.0) / 5.0) * 3000;
    regular = Math.min(18000, Math.max(15000, Math.round(raw / 1000) * 1000));
  }

  const discount =
    regular <= 3000 ? 3000 : Math.max(3000, Math.round((regular * 0.8) / 1000) * 1000);

  return { regular, discount };
}

// Zona I Kemenhub Roda 2 (Bandung)
function estimateOjolMotorRange(distanceKm: number, trafficMode: TrafficMode) {
  const extraKm = Math.max(0, distanceKm - 4);
  const minRaw = 9250 + extraKm * 1850 + 2000;
  const maxRaw = 11500 + extraKm * 2300 + 3500;
  const minSurge = trafficMode === 'rush' ? 1.15 : 1.0;
  const maxSurge = trafficMode === 'rush' ? 1.25 : 1.0;
  const min = Math.round((minRaw * minSurge) / 500) * 500;
  const max = Math.round((maxRaw * maxSurge) / 500) * 500;
  const mid = Math.round(((min + max) / 2) / 500) * 500;
  return { min, max, mid };
}

// ASK / Roda 4 Wilayah I Kemenhub & Dishub Jabar
function estimateOjolCarRange(distanceKm: number, trafficMode: TrafficMode) {
  const minRaw = Math.max(14000, distanceKm * 3500) + 3000;
  const maxRaw = Math.max(22000, distanceKm * 5500) + 4500;
  const minSurge = trafficMode === 'rush' ? 1.15 : 1.0;
  const maxSurge = trafficMode === 'rush' ? 1.25 : 1.0;
  const min = Math.round((minRaw * minSurge) / 500) * 500;
  const max = Math.round((maxRaw * maxSurge) / 500) * 500;
  const mid = Math.round(((min + max) / 2) / 500) * 500;
  return { min, max, mid };
}

function calculateCarbonComparison(legs: Array<Pick<RouteLeg, 'operatorId' | 'distanceKm'>>) {
  let routeEmissionG = 0;
  let carBaselineG = 0;
  let motorBaselineG = 0;

  for (const leg of legs) {
    const modeFactor = EMISSION_G_PER_PKM[leg.operatorId];
    routeEmissionG += leg.distanceKm * modeFactor;
    carBaselineG += leg.distanceKm * EMISSION_G_PER_PKM.CAR_BASELINE;
    motorBaselineG += leg.distanceKm * EMISSION_G_PER_PKM.MOTOR_BASELINE;
  }

  return {
    routeEmissionKg: Number((routeEmissionG / 1000).toFixed(2)),
    carBaselineEmissionKg: Number((carBaselineG / 1000).toFixed(2)),
    motorBaselineEmissionKg: Number((motorBaselineG / 1000).toFixed(2)),
    co2SavedVsCarKg: Number((Math.max(0, carBaselineG - routeEmissionG) / 1000).toFixed(2)),
    co2DiffVsMotorKg: Number(((motorBaselineG - routeEmissionG) / 1000).toFixed(2)),
  };
}

type RawLeg = Omit<RouteLeg, 'schedule'>;

function buildLeg(
  corridor: TransitCorridor,
  fromId: string,
  toId: string,
  trafficMultiplier: number
): RawLeg | null {
  const fromIdx = corridor.stops.indexOf(fromId);
  const toIdx = corridor.stops.indexOf(toId);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return null;

  const step = fromIdx < toIdx ? 1 : -1;
  const stopsPath: string[] = [];
  let rideMinutes = 0;
  let distanceKm = 0;

  for (let i = fromIdx; i !== toIdx; i += step) {
    stopsPath.push(corridor.stops[i]);
    const segIdx = step === 1 ? i : i - 1;
    rideMinutes += corridor.segmentMinutes[segIdx];
    distanceKm += corridor.segmentKm[segIdx];
  }
  stopsPath.push(toId);

  const terminusId = step === 1 ? corridor.stops[corridor.stops.length - 1] : corridor.stops[0];
  const operator = OPERATORS[corridor.operator];
  const roundedKm = Number(distanceKm.toFixed(1));
  const angkotFare = operator.pricingModel === 'distance' ? estimateAngkotFare(roundedKm) : null;

  return {
    corridorId: corridor.id,
    corridorCode: corridor.code,
    corridorName: corridor.name,
    corridorColor: corridor.color,
    vehicleColorLabel: corridor.vehicleColorLabel ?? null,
    operatorId: corridor.operator,
    operatorName: operator.name,
    category: operator.category,
    directionName: STOPS[terminusId]?.name ?? terminusId,
    fromId,
    toId,
    stops: stopsPath,
    stopCount: stopsPath.length - 1,
    rideMinutes: Math.round(rideMinutes * trafficMultiplier),
    waitMinutes: Math.round(operator.headwayMin * 0.5),
    distanceKm: roundedKm,
    fareRegular: angkotFare ? angkotFare.regular : operator.fareRegular,
    fareDiscount: angkotFare ? angkotFare.discount : operator.fareDiscount,
    cashAccepted: operator.cashAccepted,
    cashOnly: operator.cashOnly,
    paymentMethods: operator.paymentMethods,
  };
}

function summarizeRoute(
  legs: RawLeg[],
  passengerType: PassengerType,
  trafficMode: TrafficMode,
  departureMinutesWib: number
): TransitRouteOption {
  const isDiscount = passengerType === 'discount';
  const transferPenalty = trafficMode === 'rush' ? 10 : 7;

  let totalFare = 0;
  let totalRideMin = 0;
  let totalWaitMin = 0;
  let totalDistanceKm = 0;
  let clockCursorMin = departureMinutesWib;
  let mjtFirstTapMin: number | null = null;

  const enrichedLegs: RouteLeg[] = legs.map((leg, i) => {
    const corridor = corridorById[leg.corridorId];
    const schedule = evaluateLegSchedule(leg, corridor, clockCursorMin, trafficMode);

    const effectiveWait =
      schedule.hasExactTimetable && schedule.waitMinutes !== null && schedule.waitMinutes <= 90
        ? schedule.waitMinutes
        : i === 0
          ? leg.waitMinutes
          : Math.max(leg.waitMinutes, transferPenalty);

    const boardingMin = clockCursorMin + effectiveWait;

    // Skema resmi tarif integrasi Metro Jabar Trans (Bus K1–K6 <-> Angkot Feeder FD1/FD2):
    // Gratis (Rp0) untuk sambungan antar layanan MJT dalam 120 menit sejak tap pertama.
    let integratedFreeTransfer = false;
    let effectiveRegularFare = leg.fareRegular;
    let effectiveDiscountFare = leg.fareDiscount;

    if (leg.operatorId === 'MJT') {
      if (mjtFirstTapMin === null) {
        mjtFirstTapMin = boardingMin;
      } else if (boardingMin - mjtFirstTapMin <= 120) {
        integratedFreeTransfer = true;
        effectiveRegularFare = 0;
        effectiveDiscountFare = 0;
      }
    }

    totalFare += isDiscount ? effectiveDiscountFare : effectiveRegularFare;
    totalRideMin += leg.rideMinutes;
    totalWaitMin += effectiveWait;
    totalDistanceKm += leg.distanceKm;
    clockCursorMin = boardingMin + leg.rideMinutes;

    return {
      ...leg,
      fareRegular: effectiveRegularFare,
      fareDiscount: effectiveDiscountFare,
      integratedFreeTransfer,
      schedule,
    };
  });

  const totalMinutes = totalRideMin + totalWaitMin;
  const transfers = enrichedLegs.length - 1;
  const roundedKm = Number(totalDistanceKm.toFixed(1));

  const motorFare = estimateOjolMotorRange(roundedKm, trafficMode);
  const carFare = estimateOjolCarRange(roundedKm, trafficMode);
  const carbon = calculateCarbonComparison(enrichedLegs);

  const hasClosedLeg = enrichedLegs.some((l) => l.schedule.status === 'closed');
  const hasWarningLeg = enrichedLegs.some(
    (l) =>
      l.schedule.status === 'closing_soon' ||
      l.schedule.status === 'upcoming' ||
      l.schedule.status === 'long_wait'
  );
  const scheduleStatus = hasClosedLeg ? 'closed' : hasWarningLeg ? 'warning' : 'active';

  const allStops: string[] = [];
  for (const leg of enrichedLegs) {
    for (const s of leg.stops) {
      if (allStops[allStops.length - 1] !== s) allStops.push(s);
    }
  }

  return {
    id: enrichedLegs.map((l) => `${l.corridorId}:${l.fromId}-${l.toId}`).join('|'),
    legs: enrichedLegs,
    transfers,
    totalFare,
    totalMinutes,
    totalRideMin,
    totalWaitMin,
    totalDistanceKm: roundedKm,
    departureTimeStr: formatMinutesToHHMM(departureMinutesWib),
    estimatedArrivalStr: formatMinutesToHHMM(departureMinutesWib + totalMinutes),
    hasClosedLeg,
    scheduleStatus,
    co2SavedKg: carbon.co2SavedVsCarKg,
    routeEmissionKg: carbon.routeEmissionKg,
    carBaselineEmissionKg: carbon.carBaselineEmissionKg,
    comparisons: {
      motor: {
        label: 'Ojol Motor',
        fareMin: motorFare.min,
        fareMax: motorFare.max,
        fareMid: motorFare.mid,
        savedMin: Math.max(0, motorFare.min - totalFare),
        savedMax: Math.max(0, motorFare.max - totalFare),
        savedMid: Math.max(0, motorFare.mid - totalFare),
        baselineEmissionKg: carbon.motorBaselineEmissionKg,
        routeEmissionKg: carbon.routeEmissionKg,
        co2DiffKg: carbon.co2DiffVsMotorKg,
      },
      car: {
        label: 'Ojol Mobil',
        fareMin: carFare.min,
        fareMax: carFare.max,
        fareMid: carFare.mid,
        savedMin: Math.max(0, carFare.min - totalFare),
        savedMax: Math.max(0, carFare.max - totalFare),
        savedMid: Math.max(0, carFare.mid - totalFare),
        baselineEmissionKg: carbon.carBaselineEmissionKg,
        routeEmissionKg: carbon.routeEmissionKg,
        co2SavedKg: carbon.co2SavedVsCarKg,
      },
    },
    requiresCashless: enrichedLegs.some((l) => !l.cashAccepted),
    requiresCash: enrichedLegs.some((l) => l.cashOnly),
    usesAngkot: enrichedLegs.some((l) => l.operatorId === 'ANGKOT'),
    usesBus: enrichedLegs.some((l) => l.operatorId === 'MJT' || l.operatorId === 'TMB'),
    allStops,
    corridorIds: [...new Set(enrichedLegs.map((l) => l.corridorId))],
    badges: [],
  };
}

export function findRoutes(
  fromId: string,
  toId: string,
  options: FindRoutesOptions = {}
): TransitRouteOption[] {
  const {
    passengerType = 'regular',
    trafficMode = 'normal',
    modeFilter = 'all',
    departureTime = null,
  } = options;

  if (!fromId || !toId || fromId === toId || !STOPS[fromId] || !STOPS[toId]) {
    return [];
  }

  const parsedDep = departureTime ? parseTimeToMinutes(departureTime) : null;
  const departureMinutesWib = parsedDep !== null ? parsedDep : getCurrentWibMinutes();
  const trafficMultiplier = trafficMode === 'rush' ? 1.35 : 1.0;

  const candidates: TransitRouteOption[] = [];
  const seenKeys = new Set<string>();

  const pushCandidate = (legs: Array<RawLeg | null>) => {
    if (legs.some((l) => l === null)) return;
    const validLegs = legs as RawLeg[];
    const usedCorridors = new Set(validLegs.map((l) => l.corridorId));
    if (usedCorridors.size !== validLegs.length) return;

    const visitedStops = new Set<string>();
    for (let i = 0; i < validLegs.length; i++) {
      const startIdx = i === 0 ? 0 : 1;
      for (let j = startIdx; j < validLegs[i].stops.length; j++) {
        const s = validLegs[i].stops[j];
        if (visitedStops.has(s)) return;
        visitedStops.add(s);
      }
    }

    const key = validLegs.map((l) => `${l.corridorId}@${l.toId}`).join('>');
    if (seenKeys.has(key)) return;
    seenKeys.add(key);

    candidates.push(summarizeRoute(validLegs, passengerType, trafficMode, departureMinutesWib));
  };

  const startCorridors = getCorridorsForStop(fromId, modeFilter);
  const endCorridors = getCorridorsForStop(toId, modeFilter);
  const endCorridorIds = new Set(endCorridors.map((c) => c.id));

  // 1) Langsung (0 transit)
  for (const c1 of startCorridors) {
    if (endCorridorIds.has(c1.id)) {
      pushCandidate([buildLeg(c1, fromId, toId, trafficMultiplier)]);
    }
  }

  // 2) 1 Transit
  for (const c1 of startCorridors) {
    for (const midStop of c1.stops) {
      if (midStop === fromId || midStop === toId) continue;
      for (const c2 of getCorridorsForStop(midStop, modeFilter)) {
        if (c2.id === c1.id) continue;
        if (endCorridorIds.has(c2.id)) {
          pushCandidate([
            buildLeg(c1, fromId, midStop, trafficMultiplier),
            buildLeg(c2, midStop, toId, trafficMultiplier),
          ]);
        }
      }
    }
  }

  // 3) 2 Transit (fallback dengan batas aman)
  if (candidates.length < 2) {
    outer2: for (const c1 of startCorridors) {
      for (const mid1 of c1.stops) {
        if (mid1 === fromId || mid1 === toId) continue;
        for (const c2 of getCorridorsForStop(mid1, modeFilter)) {
          if (c2.id === c1.id) continue;
          for (const mid2 of c2.stops) {
            if (mid2 === mid1 || mid2 === fromId || mid2 === toId) continue;
            for (const c3 of getCorridorsForStop(mid2, modeFilter)) {
              if (c3.id === c2.id || c3.id === c1.id) continue;
              if (endCorridorIds.has(c3.id)) {
                pushCandidate([
                  buildLeg(c1, fromId, mid1, trafficMultiplier),
                  buildLeg(c2, mid1, mid2, trafficMultiplier),
                  buildLeg(c3, mid2, toId, trafficMultiplier),
                ]);
                if (candidates.length >= 24) break outer2;
              }
            }
          }
        }
      }
    }
  }

  candidates.sort((a, b) => {
    const closedPenaltyA = a.hasClosedLeg ? 500 : 0;
    const closedPenaltyB = b.hasClosedLeg ? 500 : 0;
    const scoreA = closedPenaltyA + a.totalMinutes + a.transfers * 6 + a.totalFare / 2000;
    const scoreB = closedPenaltyB + b.totalMinutes + b.transfers * 6 + b.totalFare / 2000;
    return scoreA - scoreB;
  });

  const picked: TransitRouteOption[] = [];
  const pickedCombos = new Set<string>();

  const tryPick = (route: TransitRouteOption | undefined) => {
    if (!route || picked.length >= 3) return;
    const combo = route.legs.map((l) => l.corridorId).join('+');
    if (pickedCombos.has(combo)) return;
    pickedCombos.add(combo);
    picked.push(route);
  };

  tryPick(candidates[0]);

  if (modeFilter === 'all' && picked.length < 3) {
    const bestBusOnly = candidates.find((r) => r.usesBus && !r.usesAngkot && !r.hasClosedLeg);
    if (bestBusOnly && bestBusOnly.totalMinutes <= (candidates[0]?.totalMinutes ?? 0) + 30) {
      tryPick(bestBusOnly);
    }
  }

  for (const route of candidates) {
    if (picked.length === 3) break;
    tryPick(route);
  }

  if (picked.length > 0) {
    const activePicked = picked.filter((r) => !r.hasClosedLeg);
    const pool = activePicked.length > 0 ? activePicked : picked;
    const fastest = pool.reduce((best, r) => (r.totalMinutes < best.totalMinutes ? r : best), pool[0]);
    const cheapest = pool.reduce((best, r) => (r.totalFare < best.totalFare ? r : best), pool[0]);

    for (const r of picked) {
      if (r.hasClosedLeg) {
        r.badges.push({ text: 'Di Luar Jam Operasional', color: 'danger' });
      } else if (r.id === fastest.id) {
        r.badges.push({ text: 'Tercepat', color: 'primary' });
      }
      if (r.transfers === 0) {
        r.badges.push({ text: 'Langsung · Tanpa Transit', color: 'success' });
      }
      if (r.usesAngkot && r.usesBus) {
        r.badges.push({ text: 'Bus + Angkot', color: 'warning' });
      } else if (r.usesAngkot) {
        r.badges.push({ text: 'Angkot Bandung', color: 'warning' });
      }
      if (!r.hasClosedLeg && r.id === cheapest.id && r.totalFare < fastest.totalFare) {
        r.badges.push({ text: 'Paling Hemat', color: 'success' });
      }
    }
  }

  return picked;
}
