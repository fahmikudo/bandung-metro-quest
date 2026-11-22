import { STOPS } from '@/shared/data/bandungTransit';
import type { PassengerType } from './schemas';
import type { TransitRouteOption } from './router';

export interface SimulationStep {
  legIndex: number;
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  corridorId: string;
  corridorCode: string;
  corridorColor: string;
  isAngkot: boolean;
  vehicleLabel: string;
  message: string;
  arrivalMessage: string;
  isTransferNext: boolean;
  isFinalArrival: boolean;
}

export function getBandungSavingsNote(savedRp: number): string {
  if (savedRp < 8000) return 'Lumayan buat tambahan jajan di jalan';
  if (savedRp < 15000) return 'Setara 1 porsi cuanki / cilok kuah';
  if (savedRp < 24000) return 'Setara 1 gelas es kopi susu kekinian';
  if (savedRp < 36000) return 'Setara 1 porsi batagor / mie kocok Bandung';
  if (savedRp < 55000) return 'Setara makan siang + es kopi susu';
  return 'Setara nongkrong santai di kafe Braga / Dago';
}

export function buildSimulationSteps(
  route: TransitRouteOption | null,
  passengerType: PassengerType = 'regular'
): SimulationStep[] {
  if (!route || route.legs.length === 0) return [];

  const steps: SimulationStep[] = [];
  const isDiscount = passengerType === 'discount';

  for (let legIdx = 0; legIdx < route.legs.length; legIdx++) {
    const leg = route.legs[legIdx];
    const legFare = isDiscount ? leg.fareDiscount : leg.fareRegular;
    const isAngkot = leg.operatorId === 'ANGKOT';
    const vehicleLabel = isAngkot
      ? `${leg.corridorCode}${leg.vehicleColorLabel ? ` (${leg.vehicleColorLabel})` : ''}`
      : `${leg.operatorName} ${leg.corridorCode}`;

    for (let i = 0; i < leg.stops.length - 1; i++) {
      const fromId = leg.stops[i];
      const toId = leg.stops[i + 1];
      const fromStop = STOPS[fromId];
      const toStop = STOPS[toId];
      if (!fromStop || !toStop) continue;

      const isFirstOfLeg = i === 0;
      const isLastOfLeg = i === leg.stops.length - 2;
      const isTransferNext = isLastOfLeg && legIdx < route.legs.length - 1;
      const isFinalArrival = isLastOfLeg && legIdx === route.legs.length - 1;

      let message = `Melaju bersama ${vehicleLabel} menuju ${toStop.name}`;
      if (isFirstOfLeg && legIdx === 0) {
        const payText = isAngkot
          ? `siapkan tunai ~Rp${legFare.toLocaleString('id-ID')}`
          : leg.cashAccepted
            ? `QRIS/tunai Rp${legFare.toLocaleString('id-ID')}`
            : `tap QRIS/E-Money Rp${legFare.toLocaleString('id-ID')}`;
        message = `Naik ${vehicleLabel} dari ${fromStop.name} (${payText})`;
      } else if (isFirstOfLeg && legIdx > 0) {
        message = `Transit di ${fromStop.name} · Lanjut naik ${vehicleLabel}`;
      }

      steps.push({
        legIndex: legIdx,
        fromId,
        toId,
        fromX: fromStop.x,
        fromY: fromStop.y,
        toX: toStop.x,
        toY: toStop.y,
        corridorId: leg.corridorId,
        corridorCode: leg.corridorCode,
        corridorColor: leg.corridorColor,
        isAngkot,
        vehicleLabel,
        message,
        arrivalMessage: isTransferNext
          ? `Turun di ${toStop.name} untuk pindah jalur`
          : isFinalArrival
            ? `Wilujeng sumping di ${toStop.name}! Estimasi ~${route.totalMinutes} mnt · Total Rp${route.totalFare.toLocaleString('id-ID')}`
            : `Melewati ${toStop.name}`,
        isTransferNext,
        isFinalArrival,
      });
    }
  }

  return steps;
}
