import { STOPS } from '@/shared/data/bandungTransit';

export interface BmkgZone {
  adm4: string;
  label: string;
  subLabel: string;
}

/**
 * Daftar kode wilayah administratif tingkat IV (adm4 Kemendagri)
 * yang valid untuk API publik prakiraan cuaca BMKG di kawasan Bandung Raya.
 */
export const BMKG_ZONES = {
  bandungPusat: {
    adm4: '32.73.19.1001',
    label: 'Bandung Pusat',
    subLabel: 'Braga, Sumur Bandung',
  },
  bandungUtara: {
    adm4: '32.73.02.1001',
    label: 'Bandung Utara',
    subLabel: 'Cipaganti, Coblong',
  },
  bandungWetan: {
    adm4: '32.73.09.1001',
    label: 'Bandung Tengah',
    subLabel: 'Cihapit, Bandung Wetan',
  },
  bandungTimur: {
    adm4: '32.73.27.1001',
    label: 'Bandung Timur',
    subLabel: 'Cimincrang, Gedebage',
  },
  lembang: {
    adm4: '32.17.01.2001',
    label: 'Lembang',
    subLabel: 'Pagerwangi, Kab. Bandung Barat',
  },
  padalarang: {
    adm4: '32.17.08.2001',
    label: 'Padalarang / KBP',
    subLabel: 'Padalarang, Kab. Bandung Barat',
  },
  cimahi: {
    adm4: '32.77.02.1001',
    label: 'Cimahi',
    subLabel: 'Baros, Kota Cimahi',
  },
  soreang: {
    adm4: '32.04.37.2001',
    label: 'Soreang',
    subLabel: 'Soreang, Kab. Bandung',
  },
  baleendah: {
    adm4: '32.04.32.1001',
    label: 'Baleendah',
    subLabel: 'Baleendah, Kab. Bandung',
  },
  majalaya: {
    adm4: '32.04.33.2001',
    label: 'Majalaya',
    subLabel: 'Majalaya, Kab. Bandung',
  },
  jatinangor: {
    adm4: '32.11.15.2001',
    label: 'Jatinangor',
    subLabel: 'Cikeruh, Kab. Sumedang',
  },
} as const satisfies Record<string, BmkgZone>;

const STOP_ZONE_OVERRIDES: Record<string, BmkgZone> = {
  lembang: BMKG_ZONES.lembang,
  kbp: BMKG_ZONES.padalarang,
  padalarang: BMKG_ZONES.padalarang,
  cimahi: BMKG_ZONES.cimahi,
  cimindi: BMKG_ZONES.cimahi,
  soreang: BMKG_ZONES.soreang,
  baleendah: BMKG_ZONES.baleendah,
  bojongsoang: BMKG_ZONES.baleendah,
  dayeuhkolot: BMKG_ZONES.baleendah,
  majalaya: BMKG_ZONES.majalaya,
  ciparay: BMKG_ZONES.majalaya,
  jatinangor: BMKG_ZONES.jatinangor,
  dago_itb: BMKG_ZONES.bandungUtara,
  dipatiukur: BMKG_ZONES.bandungUtara,
  ledeng: BMKG_ZONES.bandungUtara,
  ciumbuleuit: BMKG_ZONES.bandungUtara,
  cisitu: BMKG_ZONES.bandungUtara,
  cihampelas: BMKG_ZONES.bandungUtara,
  sadang_serang: BMKG_ZONES.bandungUtara,
  sarijadi: BMKG_ZONES.bandungUtara,
  karang_setra: BMKG_ZONES.bandungUtara,
  pasteur_pvj: BMKG_ZONES.bandungUtara,
  gasibu: BMKG_ZONES.bandungWetan,
  riau_martadinata: BMKG_ZONES.bandungWetan,
  bip_bec: BMKG_ZONES.bandungWetan,
  pahlawan: BMKG_ZONES.bandungWetan,
  gedebage: BMKG_ZONES.bandungTimur,
  cibiru: BMKG_ZONES.bandungTimur,
  panyileukan: BMKG_ZONES.bandungTimur,
  ujungberung: BMKG_ZONES.bandungTimur,
  riung_bandung: BMKG_ZONES.bandungTimur,
  derwati: BMKG_ZONES.bandungTimur,
  ciwastra: BMKG_ZONES.bandungTimur,
  margahayu: BMKG_ZONES.bandungTimur,
  antapani: BMKG_ZONES.bandungTimur,
  cicaheum: BMKG_ZONES.bandungTimur,
  panghegar: BMKG_ZONES.bandungTimur,
};

/**
 * Memetakan ID halte/titik Bandung Raya ke zona adm4 BMKG terdekat.
 */
export function resolveBmkgZoneForStop(stopId?: string | null): BmkgZone {
  if (!stopId) return BMKG_ZONES.bandungPusat;
  if (STOP_ZONE_OVERRIDES[stopId]) return STOP_ZONE_OVERRIDES[stopId];

  const stop = STOPS[stopId];
  if (!stop) return BMKG_ZONES.bandungPusat;

  const area = stop.area.toLowerCase();
  if (area.includes('lembang')) return BMKG_ZONES.lembang;
  if (area.includes('cimahi')) return BMKG_ZONES.cimahi;
  if (area.includes('padalarang') || area.includes('bandung barat')) return BMKG_ZONES.padalarang;
  if (area.includes('jatinangor') || area.includes('sumedang')) return BMKG_ZONES.jatinangor;
  if (area.includes('soreang')) return BMKG_ZONES.soreang;
  if (area.includes('majalaya')) return BMKG_ZONES.majalaya;
  if (area.includes('baleendah') || area.includes('kab. bandung')) return BMKG_ZONES.baleendah;
  if (area.includes('utara')) return BMKG_ZONES.bandungUtara;
  if (area.includes('timur')) return BMKG_ZONES.bandungTimur;

  return BMKG_ZONES.bandungPusat;
}
