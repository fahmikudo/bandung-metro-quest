import { describe, expect, it } from 'vitest';
import { CORRIDORS, STOPS } from '@/shared/data/bandungTransit';
import { EMISSION_G_PER_PKM, findRoutes, getCorridorById } from '../router';
import { buildSimulationSteps, getBandungSavingsNote } from '../simulator';
import { ReportFormSchema, RouteSearchSchema } from '../schemas';

const EXPECTED_40_DISHUB_ANGKOT = [
  'ANGKOT-01A', 'ANGKOT-01B', 'ANGKOT-02', 'ANGKOT-03', 'ANGKOT-04',
  'ANGKOT-05', 'ANGKOT-06', 'ANGKOT-07', 'ANGKOT-08', 'ANGKOT-09',
  'ANGKOT-10', 'ANGKOT-11A', 'ANGKOT-11B', 'ANGKOT-12', 'ANGKOT-13',
  'ANGKOT-14', 'ANGKOT-15', 'ANGKOT-16', 'ANGKOT-17', 'ANGKOT-18',
  'ANGKOT-19', 'ANGKOT-20', 'ANGKOT-21', 'ANGKOT-22BB', 'ANGKOT-22SE',
  'ANGKOT-23', 'ANGKOT-24', 'ANGKOT-25', 'ANGKOT-26', 'ANGKOT-27',
  'ANGKOT-28', 'ANGKOT-29', 'ANGKOT-30CC', 'ANGKOT-30EL', 'ANGKOT-31',
  'ANGKOT-32', 'ANGKOT-33', 'ANGKOT-34', 'ANGKOT-35CB', 'ANGKOT-35KS',
];

describe('ManawiBandung Data & Routing Engine', () => {
  it('memuat lengkap 54 jalur (6 MJT + 7 TMB termasuk Feeder 1 & 2 + 40 Angkot Dishub + 1 Lembang)', () => {
    expect(CORRIDORS).toHaveLength(54);
    expect(getCorridorById('TMB-F1')).not.toBeNull();
    expect(getCorridorById('TMB-F2')).not.toBeNull();
    for (const id of EXPECTED_40_DISHUB_ANGKOT) {
      expect(getCorridorById(id), `Jalur ${id} harus ada`).not.toBeNull();
    }
    for (const c of CORRIDORS) {
      expect(c.segmentMinutes).toHaveLength(c.stops.length - 1);
      expect(c.segmentKm).toHaveLength(c.stops.length - 1);
      for (const stopId of c.stops) {
        expect(STOPS[stopId], `Halte ${stopId} pada ${c.id}`).toBeDefined();
      }
    }
  });

  it('menerapkan koreksi Dishub: 15 = Margahayu–Ledeng, 16 = Dago–Riung Bandung', () => {
    expect(getCorridorById('ANGKOT-15')?.name).toBe('Margahayu Raya – Ledeng');
    expect(getCorridorById('ANGKOT-16')?.name).toBe('Dago – Riung Bandung');
  });

  it('menemukan opsi langsung Bus MJT K4 & Angkot 02 dari Alun-Alun ke Dipatiukur', () => {
    const routes = findRoutes('alun_alun', 'dipatiukur', {
      passengerType: 'regular',
      trafficMode: 'normal',
      modeFilter: 'all',
      departureTime: '09:00',
    });
    const mjt = routes.find((r) => r.transfers === 0 && r.legs[0].corridorId === 'MJT-4');
    const angkot = routes.find((r) => r.transfers === 0 && r.legs[0].corridorId === 'ANGKOT-02');
    expect(mjt).toBeDefined();
    expect(angkot).toBeDefined();
    expect(mjt?.totalFare).toBe(4900);
    expect(mjt?.requiresCashless).toBe(true);
  });

  it('menghitung tarif pelajar MJT Rp2.000 & jarak Angkot Lembang', () => {
    const mjtStudent = findRoutes('alun_alun', 'dipatiukur', {
      passengerType: 'discount',
      modeFilter: 'bus',
      departureTime: '09:00',
    })[0];
    expect(mjtStudent.totalFare).toBe(2000);

    const lembangReg = findRoutes('stasiun_hall', 'lembang', {
      passengerType: 'regular',
      modeFilter: 'angkot',
      departureTime: '09:00',
    })[0];
    expect(lembangReg.totalFare).toBe(10000);
    expect(lembangReg.legs[0].vehicleColorLabel).toBe('Kuning – Putih (Lembang)');
  });

  it('menghitung perbandingan apples-to-apples Umum vs Ojol Motor & Umum vs Ojol Mobil + CO2 DEFRA', () => {
    const route = findRoutes('alun_alun', 'dipatiukur', {
      passengerType: 'regular',
      trafficMode: 'normal',
      modeFilter: 'bus',
      departureTime: '09:00',
    })[0];

    const { motor, car } = route.comparisons;
    expect(car.fareMin).toBeGreaterThan(motor.fareMin);
    expect(car.savedMid).toBeGreaterThan(motor.savedMid);
    expect(car.co2SavedKg).toBeGreaterThan(0);

    const expectedBusSaved = Number(
      ((route.totalDistanceKm * (EMISSION_G_PER_PKM.CAR_BASELINE - EMISSION_G_PER_PKM.MJT)) / 1000).toFixed(2)
    );
    expect(route.co2SavedKg).toBe(expectedBusSaved);
  });

  it('membaca Time Table resmi TMB PDF & jam tutup MJT K6 dengan akurat', () => {
    const tmb2 = findRoutes('cicaheum', 'cibeureum', {
      modeFilter: 'bus',
      departureTime: '08:40',
    }).find((r) => r.legs[0].corridorId === 'TMB-2');
    expect(tmb2?.legs[0].schedule.status).toBe('active');
    expect(tmb2?.legs[0].schedule.terminalDepStr).toBe('08:50');
    expect(tmb2?.legs[0].schedule.waitMinutes).toBe(10);

    const tmb3Closed = findRoutes('cicaheum', 'sarijadi', {
      modeFilter: 'bus',
      departureTime: '15:30',
    }).find((r) => r.legs[0].corridorId === 'TMB-3');
    expect(tmb3Closed?.hasClosedLeg).toBe(true);
    expect(tmb3Closed?.legs[0].schedule.status).toBe('closed');

    const mjt6Closed = findRoutes('leuwipanjang', 'majalaya', {
      modeFilter: 'bus',
      departureTime: '14:30',
    })[0];
    expect(mjt6Closed.hasClosedLeg).toBe(true);
  });

  it('memvalidasi skema Zod untuk pencarian rute & form laporan warga', () => {
    const sameStop = RouteSearchSchema.safeParse({
      fromId: 'alun_alun',
      toId: 'alun_alun',
    });
    expect(sameStop.success).toBe(false);

    const shortReport = ReportFormSchema.safeParse({
      corridorId: 'MJT-4',
      type: 'halte',
      note: 'pendek',
    });
    expect(shortReport.success).toBe(false);

    const validReport = ReportFormSchema.safeParse({
      corridorId: 'MJT-4',
      type: 'halte',
      note: 'Halte Alun-Alun bergeser 20 meter ke depan pendopo.',
    });
    expect(validReport.success).toBe(true);
  });

  it('membangun langkah simulasi & metafora hemat Bandung', () => {
    const route = findRoutes('alun_alun', 'ciumbuleuit', {
      modeFilter: 'all',
      departureTime: '09:00',
    })[0];
    const steps = buildSimulationSteps(route, 'regular');
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[steps.length - 1].isFinalArrival).toBe(true);
    expect(getBandungSavingsNote(20000)).toContain('es kopi susu');
  });
});
