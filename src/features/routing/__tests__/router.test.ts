import { describe, expect, it } from 'vitest';
import { CORRIDORS, STOPS } from '@/shared/data/bandungTransit';
import {
  ALL_BRT_PLANNED_ROUTES,
  BRT_FEEDER_ROUTES,
  BRT_MAIN_ROUTES,
} from '@/shared/data/brtBandungRaya';
import { EMISSION_G_PER_PKM, estimateAngkotFare, findRoutes, getCorridorById } from '../router';
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
  it('memuat lengkap 56 jalur (6 Bus MJT + 2 Angkot Feeder MJT FD1/FD2 + 7 TMB termasuk Feeder 1 & 2 + 40 Angkot Dishub + 1 Lembang)', () => {
    expect(CORRIDORS).toHaveLength(56);
    expect(getCorridorById('MJT-FD1')).not.toBeNull();
    expect(getCorridorById('MJT-FD2')).not.toBeNull();
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

  it('menemukan Bus MJT K4 langsung dari Stasiun Bandung ke Dipatiukur & Angkot 02 langsung dari Alun-Alun', () => {
    // 1. Stasiun Bandung -> Dipatiukur: dilayani langsung oleh Bus MJT K4 (Leuwipanjang - Dipatiukur via Stasiun Hall)
    const stasiunRoutes = findRoutes('stasiun_hall', 'dipatiukur', {
      passengerType: 'regular',
      trafficMode: 'normal',
      modeFilter: 'all',
      departureTime: '09:00',
    });
    const mjt = stasiunRoutes.find((r) => r.transfers === 0 && r.legs[0].corridorId === 'MJT-4');
    expect(mjt).toBeDefined();
    expect(mjt?.totalFare).toBe(4900);
    expect(mjt?.requiresCashless).toBe(true);

    // 2. Alun-Alun -> Dipatiukur: dilayani langsung oleh Angkot 02 (Kalapa - Dago), sedangkan MJT K4 tidak lewat halte Alun-Alun
    const alunAlunRoutes = findRoutes('alun_alun', 'dipatiukur', {
      passengerType: 'regular',
      trafficMode: 'normal',
      modeFilter: 'all',
      departureTime: '09:00',
    });
    const angkot02 = alunAlunRoutes.find((r) => r.transfers === 0 && r.legs[0].corridorId === 'ANGKOT-02');
    const directMjtAtAlunAlun = alunAlunRoutes.find((r) => r.transfers === 0 && r.legs[0].corridorId === 'MJT-4');
    expect(angkot02).toBeDefined();
    expect(directMjtAtAlunAlun).toBeUndefined();
  });

  it('menghitung tarif pelajar MJT Rp2.000 & estimasi tarif Angkot sesuai acuan Transport for Bandung', () => {
    const mjtStudent = findRoutes('alun_alun', 'dipatiukur', {
      passengerType: 'discount',
      modeFilter: 'bus',
      departureTime: '09:00',
    })[0];
    expect(mjtStudent.totalFare).toBe(2000);

    // Acuan transportforbandung.org/peta/angkot: 1–1,5 km Rp3rb | 1,5–5 km Rp5rb | 5–20 km Rp5–15rb | 20–25 km Rp15–18rb
    expect(estimateAngkotFare(1.2).regular).toBe(3000);
    expect(estimateAngkotFare(3.5).regular).toBe(5000);
    expect(estimateAngkotFare(20).regular).toBe(15000);
    expect(estimateAngkotFare(25).regular).toBe(18000);

    // Stasiun Hall -> Lembang (16.3 km) jatuh di rentang 5–20 km (Rp13.000)
    const lembangReg = findRoutes('stasiun_hall', 'lembang', {
      passengerType: 'regular',
      modeFilter: 'angkot',
      departureTime: '09:00',
    })[0];
    expect(lembangReg.totalFare).toBe(13000);
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

  it('menerapkan tarif integrasi Rp0 (<=120 mnt) saat transit antara Angkot Feeder MJT (FD1/FD2) dan Bus MJT', () => {
    // Cicadas -> Soreang (mode bus): naik FD2 ke Alun-Alun/Stasiun/Elang atau transfer MJT -> K1
    // Contoh 1x transit MJT murni: Kosambi -> Cimahi (MJT-FD1 ke Alun-Alun/Stasiun -> MJT-2 ke Cimahi)
    const routes = findRoutes('kosambi', 'cimahi', {
      passengerType: 'regular',
      modeFilter: 'bus',
      departureTime: '09:00',
    });
    const mjtIntegrated = routes.find(
      (r) =>
        r.transfers === 1 &&
        r.legs[0].operatorId === 'MJT' &&
        r.legs[1].operatorId === 'MJT'
    );
    expect(mjtIntegrated).toBeDefined();
    expect(mjtIntegrated?.legs[0].corridorId).toBe('MJT-FD1');
    expect(mjtIntegrated?.legs[1].corridorId).toBe('MJT-2');
    expect(mjtIntegrated?.legs[1].integratedFreeTransfer).toBe(true);
    expect(mjtIntegrated?.legs[1].fareRegular).toBe(0);
    // Total tetap Rp4.900 (bukan Rp9.800!) karena gratis integrasi MJT <=120 menit
    expect(mjtIntegrated?.totalFare).toBe(4900);
  });

  it('memuat lengkap 47 rute rencana Kawal BRT (18 BRT utama + 29 Feeder) & tautan koridor MJT aktif', () => {
    expect(BRT_MAIN_ROUTES).toHaveLength(18);
    expect(BRT_FEEDER_ROUTES).toHaveLength(29);
    expect(ALL_BRT_PLANNED_ROUTES).toHaveLength(47);

    for (const r of ALL_BRT_PLANNED_ROUTES) {
      if (r.activeMjtCorridorId) {
        expect(getCorridorById(r.activeMjtCorridorId), `Link MJT ${r.code}`).not.toBeNull();
      }
    }
  });

  it('membangun langkah simulasi dengan nama jurusan & metafora hemat Bandung', () => {
    const route = findRoutes('ujungberung', 'dago_itb', {
      modeFilter: 'all',
      departureTime: '09:00',
    })[0];
    const steps = buildSimulationSteps(route, 'regular');
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].message).toContain(route.legs[0].corridorName);
    expect(steps[steps.length - 1].isFinalArrival).toBe(true);
    expect(getBandungSavingsNote(20000)).toContain('es kopi susu');
  });
});
