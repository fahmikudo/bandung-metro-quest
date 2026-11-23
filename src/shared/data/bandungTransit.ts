import type { OperatorId } from '@/features/routing/schemas';

export interface OperatorInfo {
  id: OperatorId;
  name: string;
  shortName: string;
  category: 'bus' | 'angkot';
  pricingModel: 'flat' | 'distance';
  fareRegular: number;
  fareDiscount: number;
  paymentMethods: string[];
  cashAccepted: boolean;
  cashOnly: boolean;
  headwayMin: number;
  hours: string;
  note: string;
}

export interface TransitStop {
  id: string;
  name: string;
  area: string;
  x: number;
  y: number;
  landmark: string;
  nearbySpot: string;
}

export interface TransitCorridor {
  id: string;
  code: string;
  operator: OperatorId;
  name: string;
  officialName?: string | null;
  shortDesc: string;
  vehicleColorLabel?: string | null;
  color: string;
  stops: string[];
  segmentMinutes: number[];
  segmentKm: number[];
}

export interface PopularTrip {
  label: string;
  from: string;
  to: string;
}

export const OPERATORS: Record<OperatorId, OperatorInfo> = {
  MJT: {
    id: 'MJT',
    name: 'Metro Jabar Trans',
    shortName: 'MJT',
    category: 'bus',
    pricingModel: 'flat',
    fareRegular: 4900,
    fareDiscount: 2000,
    paymentMethods: ['QRIS', 'E-Money / Flazz / TapCash / Brizzi'],
    cashAccepted: false,
    cashOnly: false,
    headwayMin: 12,
    hours: '04:30 – 20:30 WIB',
    note: 'Wajib non-tunai (Tap kartu uang elektronik atau scan QRIS).',
  },
  TMB: {
    id: 'TMB',
    name: 'Trans Metro Bandung',
    shortName: 'TMB',
    category: 'bus',
    pricingModel: 'flat',
    fareRegular: 4000,
    fareDiscount: 2000,
    paymentMethods: ['QRIS', 'Tunai'],
    cashAccepted: true,
    cashOnly: false,
    headwayMin: 15,
    hours: '05:10 – 18:25 WIB',
    note: 'Bisa bayar pakai QRIS maupun uang tunai pas.',
  },
  ANGKOT: {
    id: 'ANGKOT',
    name: 'Angkot Kota Bandung',
    shortName: 'Angkot',
    category: 'angkot',
    pricingModel: 'distance',
    fareRegular: 5000,
    fareDiscount: 3000,
    paymentMethods: ['Tunai (Uang Pas)'],
    cashAccepted: true,
    cashOnly: true,
    headwayMin: 6,
    hours: '05:00 – 21:00 WIB',
    note: 'Siapkan uang tunai pecahan kecil & pastikan tujuan ke sopir sebelum naik.',
  },
};

export const STOPS: Record<string, TransitStop> = {
  // === BARAT ===
  kbp: { id: 'kbp', name: 'Kota Baru Parahyangan', area: 'Padalarang', x: 62, y: 192, landmark: 'IKEA & Mason Pine', nearbySpot: 'Bale Pare Culinary' },
  padalarang: { id: 'padalarang', name: 'Stasiun Padalarang', area: 'Bandung Barat', x: 124, y: 218, landmark: 'Integrasi Kereta Cepat Whoosh', nearbySpot: 'Area Komersial Stasiun' },
  cimahi: { id: 'cimahi', name: 'Alun-Alun Cimahi', area: 'Cimahi', x: 192, y: 242, landmark: 'Pusat Kota Cimahi', nearbySpot: 'Kuliner Gandawijaya' },
  cimindi: { id: 'cimindi', name: 'Pangkalan Cimindi', area: 'Perbatasan Cimahi', x: 246, y: 262, landmark: 'Stasiun Cimindi & Flyover Cimindi', nearbySpot: 'Pasar & Kopi Cimindi' },
  gunung_batu: { id: 'gunung_batu', name: 'Gunung Batu', area: 'Cicendo', x: 250, y: 192, landmark: 'Gateway Pasteur & Tol Pasteur', nearbySpot: 'Kuliner Gunung Batu' },
  cijerah: { id: 'cijerah', name: 'Cijerah / Melong Asih', area: 'Bandung Kulon', x: 186, y: 344, landmark: 'Puskesmas Melong Asih & Borma Gempol Sari', nearbySpot: 'Kuliner Cijerah' },
  bumi_asri: { id: 'bumi_asri', name: 'Bumi Asri / Gempol Sari', area: 'Bandung Kulon', x: 222, y: 362, landmark: 'Perumahan Bumi Asri & Holis Permai', nearbySpot: 'Kuliner Holis' },
  caringin: { id: 'caringin', name: 'Pasar Induk Caringin', area: 'Babakan Ciparay', x: 256, y: 404, landmark: 'Pasar Induk Caringin & Jl. Soekarno-Hatta', nearbySpot: 'Kuliner Caringin & Holis' },
  cibeureum: { id: 'cibeureum', name: 'Terminal Cibeureum', area: 'Bandung Kulon', x: 274, y: 316, landmark: 'Batas Kota Bandung', nearbySpot: 'Batagor & Cuanki Cibeureum' },
  elang: { id: 'elang', name: 'Pangkalan Elang', area: 'Andir', x: 326, y: 312, landmark: 'Jl. Rajawali / Elang & RS Rajawali', nearbySpot: 'Kuliner Rajawali & Garuda' },
  ciroyom: { id: 'ciroyom', name: 'Pasar / Stasiun Ciroyom', area: 'Andir', x: 348, y: 274, landmark: 'Terminal & Pasar Ciroyom, Stasiun Ciroyom', nearbySpot: 'Kuliner Ciroyom & Kebon Jati' },
  sarijadi: { id: 'sarijadi', name: 'Sarijadi', area: 'Sukasari', x: 292, y: 148, landmark: 'Polban, Maranatha & Perumnas Sarijadi', nearbySpot: 'Kopi & Sarapan Sarijadi' },
  karang_setra: { id: 'karang_setra', name: 'Karang Setra / Setrasari', area: 'Sukasari', x: 338, y: 128, landmark: 'Karang Setra Waterland & Setrasari Mall', nearbySpot: 'Kafe Setrasari & Prof. Dr. Sutami' },
  pasteur_pvj: { id: 'pasteur_pvj', name: 'Pasteur / Sukajadi (PVJ)', area: 'Sukajadi', x: 364, y: 192, landmark: 'Paris Van Java, RSHS & BTC Pasteur', nearbySpot: 'Kafe Sukajadi & PVJ' },
  pajajaran: { id: 'pajajaran', name: 'Jl. Pajajaran / Istana Plaza', area: 'Cicendo', x: 374, y: 236, landmark: 'Istana Plaza, GOR Pajajaran & RS Mata Cicendo', nearbySpot: 'Paskal Hyper Square' },
  sederhana: { id: 'sederhana', name: 'Pasar Sederhana', area: 'Sukajadi', x: 398, y: 164, landmark: 'Pasar Sederhana, Eyckman & RS Advent', nearbySpot: 'Rumah Mode & Kuliner Sukajadi' },

  // === UTARA ===
  lembang: { id: 'lembang', name: 'Alun-Alun / Pasar Lembang', area: 'Lembang', x: 404, y: 42, landmark: 'Floating Market, Farmhouse & Wisata Lembang', nearbySpot: 'Susu Murni, Ketan Bakar & Tahu Susu Lembang' },
  ledeng: { id: 'ledeng', name: 'Terminal Ledeng / UPI', area: 'Setiabudi', x: 382, y: 102, landmark: 'Kampus UPI Setiabudi & Isola', nearbySpot: 'Surabi Enhaii & Kafe Setiabudi' },
  ciumbuleuit: { id: 'ciumbuleuit', name: 'Ciumbuleuit / Unpar', area: 'Cidadap', x: 446, y: 96, landmark: 'Kampus Unpar, RSAU Salamun & Punclut', nearbySpot: 'Kopi Ciumbuleuit & Nara Park' },
  cisitu: { id: 'cisitu', name: 'Cisitu Lama / Sabuga', area: 'Coblong', x: 474, y: 132, landmark: 'Cisitu Lama, Sabuga & Babakan Siliwangi', nearbySpot: 'Kuliner Mahasiswa Cisitu' },
  cihampelas: { id: 'cihampelas', name: 'Cihampelas / Ciwalk', area: 'Coblong', x: 438, y: 178, landmark: 'Cihampelas Walk & Teras Cihampelas', nearbySpot: 'Sentra Jeans & Kopi Cihampelas' },
  dago_itb: { id: 'dago_itb', name: 'Dago / ITB Ganesha', area: 'Coblong', x: 506, y: 152, landmark: 'Kampus ITB, Simpang Dago & Taman Ganesha', nearbySpot: 'Kopi Dago & Warung Pasta' },
  dipatiukur: { id: 'dipatiukur', name: 'Unpad Dipatiukur', area: 'Coblong', x: 548, y: 118, landmark: 'Kampus Unpad DU, Unikom & Monju', nearbySpot: 'Dimsum & Streetfood Dipatiukur' },
  sadang_serang: { id: 'sadang_serang', name: 'Terminal Sadang Serang', area: 'Coblong', x: 598, y: 122, landmark: 'Terminal Sadang Serang & Cigadung', nearbySpot: 'Kuliner Sadang Serang & Tubagus Ismail' },

  // === PUSAT KOTA ===
  gasibu: { id: 'gasibu', name: 'Gasibu / Gedung Sate', area: 'Bandung Wetan', x: 558, y: 196, landmark: 'Gedung Sate, Lapangan Gasibu & Museum Geologi', nearbySpot: 'Kopi Jl. Citarum & Cilaki' },
  riau_martadinata: { id: 'riau_martadinata', name: 'Jl. Riau / RE Martadinata', area: 'Bandung Wetan', x: 542, y: 252, landmark: 'Riau Junction, Taman Pramuka & Jl. Aceh', nearbySpot: 'Deretan Kafe & Resto Jl. Riau / Progo' },
  bip_bec: { id: 'bip_bec', name: 'BEC / BIP Merdeka', area: 'Bandung Wetan', x: 486, y: 238, landmark: 'Bandung Electronic Center & BIP Merdeka', nearbySpot: 'Kopi Purnawarman & Taman Lalu Lintas' },
  stasiun_hall: { id: 'stasiun_hall', name: 'Stasiun Bandung / Hall', area: 'Sumur Bandung', x: 412, y: 268, landmark: 'Stasiun KA Bandung, Pasar Baru & Kebon Kawung', nearbySpot: 'Braga & Kopi Kebon Kawung' },
  balai_kota: { id: 'balai_kota', name: 'Balai Kota / Taman Dewi Sartika', area: 'Sumur Bandung', x: 462, y: 280, landmark: 'Balai Kota Bandung, Bank Indonesia & Braga Utara', nearbySpot: 'Kedai Kopi Jl. Braga' },
  alun_alun: { id: 'alun_alun', name: 'Alun-Alun Bandung', area: 'Regol', x: 438, y: 324, landmark: 'Masjid Raya, Museum KAA & Jl. Asia Afrika', nearbySpot: 'Braga Culinary & Kopi Aroma' },
  kebon_kalapa: { id: 'kebon_kalapa', name: 'Kebon Kalapa (Abdul Muis)', area: 'Regol', x: 454, y: 360, landmark: 'Terminal Angkot Abdul Muis & ITC Kebon Kalapa', nearbySpot: 'Kuliner Pungkur & Dewi Sartika' },
  sudirman: { id: 'sudirman', name: 'Jl. Jend. Sudirman', area: 'Astanaanyar', x: 382, y: 336, landmark: 'Sudirman Street Food & Kawasan Pecinan', nearbySpot: 'Sudirman Street Day & Night Market' },
  kosambi: { id: 'kosambi', name: 'Pasar Kosambi / Ahmad Yani', area: 'Sumur Bandung', x: 520, y: 306, landmark: 'Pasar Kosambi & The Hallway Space', nearbySpot: 'The Hallway Space (Hidden Gem F&B)' },
  cikudapateuh: { id: 'cikudapateuh', name: 'Stasiun Cikudapateuh', area: 'Batununggal', x: 548, y: 326, landmark: 'Stasiun KA Cikudapateuh & Jaya Plaza', nearbySpot: 'Kuliner Kosambi & Samoja' },
  tegallega: { id: 'tegallega', name: 'Terminal / Taman Tegallega', area: 'Astanaanyar', x: 416, y: 392, landmark: 'Monumen Bandung Lautan Api & Otista', nearbySpot: 'Kuliner Otista & BKR' },
  leuwipanjang: { id: 'leuwipanjang', name: 'Terminal Leuwipanjang', area: 'Bojongloa Kidul', x: 362, y: 432, landmark: 'Hub Utama Terminal Bus Antar Kota', nearbySpot: 'Kuliner Kopo & Cibaduyut' },
  cibaduyut: { id: 'cibaduyut', name: 'Terminal / Sentra Cibaduyut', area: 'Bojongloa Kidul', x: 362, y: 492, landmark: 'Sentra Sepatu & Kerajinan Kulit Cibaduyut', nearbySpot: 'Bakso & Kuliner Jl. Cibaduyut' },
  bkr_palasari: { id: 'bkr_palasari', name: 'BKR / Pasar Palasari', area: 'Lengkong', x: 494, y: 388, landmark: 'Pasar Buku Palasari, Lodaya & Lengkong', nearbySpot: 'Lengkong Culinary Night' },
  laswi: { id: 'laswi', name: 'Laswi / Gatot Subroto', area: 'Batununggal', x: 564, y: 350, landmark: 'Laswi Heritage & Bandung Creative Hub', nearbySpot: 'Kafe Laswi & Burangrang' },
  binong: { id: 'binong', name: 'Binong / Trans Studio Mall', area: 'Batununggal', x: 590, y: 382, landmark: 'Trans Studio Bandung & Sentra Rajut Binong', nearbySpot: 'Kuliner Gatot Subroto & TSM' },

  // === TIMUR ===
  pahlawan: { id: 'pahlawan', name: 'Jl. Pahlawan / Cikutra', area: 'Cibeunying', x: 626, y: 194, landmark: 'Itenas, GOR C-Tra & Taman Makam Pahlawan', nearbySpot: 'Kafe Cikutra & Surapati' },
  cicadas: { id: 'cicadas', name: 'Pasar Cicadas / BTM', area: 'Cibeunying Kidul', x: 636, y: 254, landmark: 'Bandung Trade Mall (BTM) & Pasar Cicadas', nearbySpot: 'Kuliner Ahmad Yani & Cicadas' },
  cicaheum: { id: 'cicaheum', name: 'Terminal Cicaheum', area: 'Kiaracondong', x: 696, y: 222, landmark: 'Terminal Timur Bandung & Saung Angklung Udjo', nearbySpot: 'Kuliner Antapani & Cicaheum' },
  antapani: { id: 'antapani', name: 'Terminal / Flyover Antapani', area: 'Antapani', x: 668, y: 292, landmark: 'Jembatan Pelangi Antapani & Terminal Antapani', nearbySpot: 'Kopi & Kuliner Jl. Purwakarta' },
  kiara_artha: { id: 'kiara_artha', name: 'Kiara Artha Park', area: 'Kiaracondong', x: 616, y: 308, landmark: 'Kiara Artha Park & IBCC Ahmad Yani', nearbySpot: 'Taman Kuliner Kiara Artha' },
  kiaracondong: { id: 'kiaracondong', name: 'Stasiun Kiaracondong', area: 'Kiaracondong', x: 624, y: 364, landmark: 'Stasiun KA Kiaracondong & Samsat Kircon', nearbySpot: 'Pasar Kiaracondong' },
  panghegar: { id: 'panghegar', name: 'Panghegar Permai / Arcamanik', area: 'Arcamanik', x: 752, y: 274, landmark: 'SPoRT Jabar Arcamanik & RS Hermina', nearbySpot: 'Kuliner Arcamanik & Sindanglaya' },
  ujungberung: { id: 'ujungberung', name: 'Terminal Ujungberung', area: 'Ujungberung', x: 806, y: 248, landmark: 'Alun-Alun Ujungberung, Ubertos & RSUD', nearbySpot: 'Kuliner Alun-Alun Ujungberung' },
  buah_batu: { id: 'buah_batu', name: 'Buah Batu / MIM', area: 'Buahbatu', x: 590, y: 432, landmark: 'Metro Indah Mall, ISBI & Griya Buah Batu', nearbySpot: 'Deretan Kafe Jl. Buah Batu' },
  margahayu: { id: 'margahayu', name: 'Terminal Margahayu Raya', area: 'Buahbatu', x: 668, y: 462, landmark: 'Kawasan Margahayu Raya & RS Al-Islam', nearbySpot: 'Kuliner Jupiter & Margahayu' },
  ciwastra: { id: 'ciwastra', name: 'Pasar Ciwastra', area: 'Buahbatu', x: 658, y: 506, landmark: 'Pasar Ciwastra & Margacinta', nearbySpot: 'Kuliner Ciwastra & Margacinta' },
  derwati: { id: 'derwati', name: 'Simpang Derwati', area: 'Rancasari', x: 716, y: 512, landmark: 'Kawasan Derwati & Grand Sharon', nearbySpot: 'Kuliner Derwati' },
  riung_bandung: { id: 'riung_bandung', name: 'Terminal Riung Bandung', area: 'Gedebage', x: 744, y: 472, landmark: 'Komplek Riung Bandung & Cipamokolan', nearbySpot: 'Kuliner Riung Bandung' },
  gedebage: { id: 'gedebage', name: 'Gedebage / Summarecon', area: 'Gedebage', x: 750, y: 428, landmark: 'Masjid Al Jabbar, Pasar Induk & Summarecon Mall', nearbySpot: 'Summarecon Mall Bandung' },
  cibiru: { id: 'cibiru', name: 'Bundaran Cibiru', area: 'Cibiru', x: 820, y: 374, landmark: 'UIN Sunan Gunung Djati & Bunderan Cibiru', nearbySpot: 'Kuliner Mahasiswa Cibiru' },
  panyileukan: { id: 'panyileukan', name: 'Bumi Panyileukan', area: 'Panyileukan', x: 866, y: 398, landmark: 'Perumahan Bumi Panyileukan & Polda Jabar', nearbySpot: 'Kuliner Panyileukan' },
  jatinangor: { id: 'jatinangor', name: 'Jatinangor (Unpad / ITB)', area: 'Sumedang', x: 874, y: 296, landmark: 'Kawasan Kampus Unpad, ITB, IPDN, Ikopin', nearbySpot: 'Kafe & Kopi Jatinangor' },

  // === SELATAN ===
  moh_toha: { id: 'moh_toha', name: 'Simpang Moh. Toha', area: 'Bandung Kidul', x: 472, y: 446, landmark: 'Gerbang Tol Moh. Toha & LPKIA', nearbySpot: 'Bakso & Sate Moh. Toha' },
  mengger: { id: 'mengger', name: 'Mengger Tengah', area: 'Bandung Kidul', x: 522, y: 474, landmark: 'Puskesmas Kujangsari & Mengger', nearbySpot: 'Kuliner Batununggal & Mengger' },
  kopo: { id: 'kopo', name: 'Kopo / Miko Mall', area: 'Babakan Ciparay', x: 282, y: 476, landmark: 'Miko Mall, RS Santosa Kopo & Akses Tol Soroja', nearbySpot: 'Kuliner Taman Kopo Indah' },
  soreang: { id: 'soreang', name: 'Soreang / Pemkab Bandung', area: 'Kab. Bandung', x: 194, y: 556, landmark: 'Komplek Pemkab & Stadion Si Jalak Harupat', nearbySpot: 'Sate & Wisata Ciwidey Gateway' },
  bojongsoang: { id: 'bojongsoang', name: 'Bojongsoang / Telkom Univ', area: 'Kab. Bandung', x: 564, y: 516, landmark: 'Telkom University & Transmart Bojongsoang', nearbySpot: 'Kafe Mahasiswa Sukabirus' },
  dayeuhkolot: { id: 'dayeuhkolot', name: 'Dayeuhkolot', area: 'Kab. Bandung', x: 478, y: 522, landmark: 'Simpang Dayeuhkolot', nearbySpot: 'Kuliner Dayeuhkolot' },
  baleendah: { id: 'baleendah', name: 'Baleendah', area: 'Kab. Bandung', x: 526, y: 572, landmark: 'Alun-Alun Baleendah & RS Al-Ihsan', nearbySpot: 'Kuliner Baleendah' },
  ciparay: { id: 'ciparay', name: 'Ciparay', area: 'Kab. Bandung', x: 662, y: 568, landmark: 'Alun-Alun Ciparay', nearbySpot: 'Kuliner Pasar Ciparay' },
  majalaya: { id: 'majalaya', name: 'Terminal Majalaya', area: 'Kab. Bandung', x: 786, y: 554, landmark: 'Pusat Tekstil & Alun-Alun Majalaya', nearbySpot: 'Borondong & Kuliner Majalaya' },
};

export const SORTED_STOPS: TransitStop[] = Object.values(STOPS).sort((a, b) =>
  a.name.localeCompare(b.name, 'id')
);

interface AngkotInput {
  id: string;
  code: string;
  name: string;
  officialName?: string;
  shortDesc: string;
  vehicleColorLabel: string;
  color: string;
  stops: string[];
  segmentMinutes?: number[];
  segmentKm?: number[];
}

function buildAngkotCorridor(input: AngkotInput): TransitCorridor {
  const kmArr: number[] = [];
  const minArr: number[] = [];

  for (let i = 0; i < input.stops.length - 1; i++) {
    const a = STOPS[input.stops[i]];
    const b = STOPS[input.stops[i + 1]];
    if (input.segmentKm && input.segmentMinutes) {
      kmArr.push(input.segmentKm[i]);
      minArr.push(input.segmentMinutes[i]);
    } else {
      const distPx = Math.hypot((b?.x ?? 0) - (a?.x ?? 0), (b?.y ?? 0) - (a?.y ?? 0));
      const km = Math.max(1.1, Number((distPx * 0.038).toFixed(1)));
      const min = Math.max(5, Math.round(km * 3.4));
      kmArr.push(km);
      minArr.push(min);
    }
  }

  return {
    id: input.id,
    code: input.code,
    operator: 'ANGKOT',
    name: input.name,
    officialName: input.officialName ?? null,
    shortDesc: input.shortDesc,
    vehicleColorLabel: input.vehicleColorLabel,
    color: input.color,
    stops: input.stops,
    segmentMinutes: minArr,
    segmentKm: kmArr,
  };
}

// 56 JALUR BANDUNG RAYA: 8 MJT (6 Bus + 2 Angkot Feeder FD1 & FD2) + 7 TMB (5 Koridor & 2 Feeder) + 40 Angkot Resmi Dishub/TfB + 1 Angkot Lembang
export const CORRIDORS: TransitCorridor[] = [
  // === 6 BUS MJT + 2 ANGKOT FEEDER MJT (FD1 & FD2) ===
  { id: 'MJT-1', code: 'K1', operator: 'MJT', name: 'Leuwipanjang – Soreang', shortDesc: 'Via Tol Soroja (Cepat)', color: '#0284c7', stops: ['leuwipanjang', 'kopo', 'soreang'], segmentMinutes: [14, 18], segmentKm: [5.2, 11.8] },
  { id: 'MJT-2', code: 'K2', operator: 'MJT', name: 'Alun-Alun – Kota Baru Parahyangan', shortDesc: 'Via Stasiun Bandung & Cimahi', color: '#d97706', stops: ['alun_alun', 'stasiun_hall', 'cimindi', 'cimahi', 'padalarang', 'kbp'], segmentMinutes: [10, 16, 12, 14, 10], segmentKm: [2.4, 5.8, 3.6, 5.5, 4.1] },
  { id: 'MJT-3', code: 'K3', operator: 'MJT', name: 'Baleendah – BEC Merdeka', shortDesc: 'Via Telkom Univ & Buah Batu', color: '#059669', stops: ['baleendah', 'bojongsoang', 'buah_batu', 'bkr_palasari', 'alun_alun', 'balai_kota', 'bip_bec'], segmentMinutes: [12, 13, 12, 10, 8, 7], segmentKm: [4.2, 4.8, 3.9, 2.8, 1.5, 1.4] },
  { id: 'MJT-4', code: 'K4', operator: 'MJT', name: 'Leuwipanjang – Unpad Dipatiukur', shortDesc: 'Via Stasiun Bandung, BIP & Dago ITB', color: '#e11d48', stops: ['leuwipanjang', 'tegallega', 'stasiun_hall', 'balai_kota', 'bip_bec', 'dago_itb', 'dipatiukur'], segmentMinutes: [9, 11, 6, 7, 11, 8], segmentKm: [2.5, 2.4, 1.2, 1.4, 3.1, 1.8] },
  { id: 'MJT-5', code: 'K5', operator: 'MJT', name: 'Dipatiukur – Jatinangor', shortDesc: 'Via Gasibu, Laswi & Tol Moh. Toha', color: '#9333ea', stops: ['dipatiukur', 'gasibu', 'laswi', 'moh_toha', 'jatinangor'], segmentMinutes: [9, 11, 13, 28], segmentKm: [2.4, 3.2, 4.1, 19.5] },
  { id: 'MJT-6', code: 'K6', operator: 'MJT', name: 'Leuwipanjang – Majalaya', shortDesc: 'Via Moh. Toha, Dayeuhkolot & Baleendah', color: '#db2777', stops: ['leuwipanjang', 'moh_toha', 'dayeuhkolot', 'baleendah', 'ciparay', 'majalaya'], segmentMinutes: [12, 14, 11, 18, 15], segmentKm: [4.0, 4.6, 3.5, 7.2, 6.4] },
  {
    id: 'MJT-FD1',
    code: 'FD1',
    operator: 'MJT',
    name: 'Feeder 1: Simpang Soetta Kircon – Pasar Baru ABC',
    shortDesc: 'Angkot Feeder MJT ber-AC (non-tunai, gratis integrasi MJT ≤120 mnt) via Buah Batu, Palasari, Kosambi, Cihapit, Gedung Sate & BIP',
    vehicleColorLabel: 'Angkot Feeder MJT (Ber-AC · Non-Tunai)',
    color: '#0369a1',
    stops: ['kiaracondong', 'buah_batu', 'bkr_palasari', 'kosambi', 'riau_martadinata', 'gasibu', 'bip_bec', 'balai_kota', 'alun_alun'],
    segmentMinutes: [10, 9, 8, 7, 7, 7, 6, 7],
    segmentKm: [2.8, 2.5, 2.0, 1.8, 1.7, 1.6, 1.3, 1.5],
  },
  {
    id: 'MJT-FD2',
    code: 'FD2',
    operator: 'MJT',
    name: 'Feeder 2: Cicadas – Elang',
    shortDesc: 'Angkot Feeder MJT ber-AC (non-tunai, gratis integrasi MJT ≤120 mnt) via Antapani, Kiara Artha, Laswi, TSM, Palasari, Alun-Alun & Stasiun Bandung',
    vehicleColorLabel: 'Angkot Feeder MJT (Ber-AC · Non-Tunai)',
    color: '#0891b2',
    stops: ['cicadas', 'antapani', 'kiara_artha', 'laswi', 'binong', 'bkr_palasari', 'alun_alun', 'balai_kota', 'stasiun_hall', 'elang'],
    segmentMinutes: [8, 7, 8, 7, 8, 9, 6, 6, 9],
    segmentKm: [2.0, 1.8, 2.1, 1.6, 2.1, 2.2, 1.4, 1.4, 2.4],
  },

  // === 7 TMB (5 KORIDOR + 2 FEEDER) ===
  { id: 'TMB-1', code: 'TMB 1', operator: 'TMB', name: 'Cibiru – Cibeureum', shortDesc: 'Jalur Soekarno-Hatta', color: '#16a34a', stops: ['cibiru', 'gedebage', 'buah_batu', 'moh_toha', 'leuwipanjang', 'sudirman', 'elang', 'cibeureum'], segmentMinutes: [13, 15, 12, 11, 10, 8, 8], segmentKm: [5.4, 6.2, 4.5, 4.0, 3.1, 2.0, 2.1] },
  { id: 'TMB-2', code: 'TMB 2', operator: 'TMB', name: 'Cicaheum – Cibeureum', shortDesc: 'Via Ahmad Yani, Kosambi & Asia Afrika', color: '#ea580c', stops: ['cicaheum', 'cicadas', 'kosambi', 'alun_alun', 'sudirman', 'elang', 'cibeureum'], segmentMinutes: [8, 9, 10, 8, 8, 8], segmentKm: [2.3, 2.5, 2.6, 1.9, 2.0, 2.1] },
  { id: 'TMB-3', code: 'TMB 3', operator: 'TMB', name: 'Cicaheum – Sarijadi', shortDesc: 'Via Pahlawan, Gasibu, Cihampelas & PVJ', color: '#0d9488', stops: ['cicaheum', 'pahlawan', 'gasibu', 'dago_itb', 'cihampelas', 'pasteur_pvj', 'sarijadi'], segmentMinutes: [11, 10, 9, 8, 10, 11], segmentKm: [3.2, 2.5, 2.1, 1.9, 2.8, 3.4] },
  { id: 'TMB-4', code: 'TMB 4', operator: 'TMB', name: 'Leuwipanjang – Flyover Antapani', shortDesc: 'Via Tegallega, BKR, Laswi & Kiaracondong', color: '#ca8a04', stops: ['leuwipanjang', 'tegallega', 'bkr_palasari', 'laswi', 'kiaracondong', 'antapani'], segmentMinutes: [9, 10, 10, 11, 12], segmentKm: [2.5, 2.7, 2.9, 3.0, 3.6] },
  { id: 'TMB-5', code: 'TMB 5', operator: 'TMB', name: 'Stasiun Hall – Antapani', shortDesc: 'Via Balai Kota, BIP & Gasibu', color: '#4f46e5', stops: ['stasiun_hall', 'balai_kota', 'bip_bec', 'gasibu', 'antapani'], segmentMinutes: [8, 7, 10, 14], segmentKm: [1.8, 1.4, 2.6, 4.5] },
  { id: 'TMB-F1', code: 'TMB F1', operator: 'TMB', name: 'Feeder 1: Stasiun Hall – Gunung Batu', shortDesc: 'Feeder TMB via Pajajaran & Pasteur PVJ', color: '#7c3aed', stops: ['stasiun_hall', 'pajajaran', 'pasteur_pvj', 'gunung_batu'], segmentMinutes: [9, 10, 11], segmentKm: [2.1, 2.5, 3.2] },
  { id: 'TMB-F2', code: 'TMB F2', operator: 'TMB', name: 'Feeder 2: Summarecon Mall – Cibeureum', shortDesc: 'Feeder TMB via Soekarno-Hatta & Leuwipanjang', color: '#0284c7', stops: ['gedebage', 'buah_batu', 'moh_toha', 'leuwipanjang', 'sudirman', 'elang', 'cibeureum'], segmentMinutes: [15, 12, 11, 10, 8, 8], segmentKm: [6.2, 4.5, 4.0, 3.1, 2.0, 2.1] },

  // === 40 ANGKOT RESMI DISHUB & TRANSPORT FOR BANDUNG (JUNI 2023) ===
  buildAngkotCorridor({ id: 'ANGKOT-01A', code: 'Angkot 01A', name: 'Kalapa – Cicaheum via Binong', officialName: 'Abdul Muis – Cicaheum via Binong', shortDesc: 'Via Pungkur, Binong (TSM), Kiaracondong & Cicadas', vehicleColorLabel: 'Hijau – Kuning (via Binong)', color: '#65a30d', stops: ['kebon_kalapa', 'bkr_palasari', 'binong', 'kiaracondong', 'kiara_artha', 'cicadas', 'cicaheum'] }),
  buildAngkotCorridor({ id: 'ANGKOT-01B', code: 'Angkot 01B', name: 'Kalapa – Cicaheum via Aceh', officialName: 'Abdul Muis – Cicaheum via Aceh', shortDesc: 'Via Alun-Alun, Balai Kota, Jl. Aceh/Riau & Supratman', vehicleColorLabel: 'Hijau – Merah Marun', color: '#84cc16', stops: ['kebon_kalapa', 'alun_alun', 'balai_kota', 'riau_martadinata', 'gasibu', 'cicadas', 'cicaheum'] }),
  buildAngkotCorridor({ id: 'ANGKOT-02', code: 'Angkot 02', name: 'Kalapa – Dago', officialName: 'Abdul Muis – Dago', shortDesc: 'Via Alun-Alun, BIP, Jl. Riau & Dago ITB', vehicleColorLabel: 'Hijau – Oranye', color: '#f97316', stops: ['kebon_kalapa', 'alun_alun', 'bip_bec', 'riau_martadinata', 'dago_itb', 'dipatiukur'], segmentMinutes: [7, 10, 7, 10, 8], segmentKm: [1.3, 2.2, 1.4, 2.6, 1.7] }),
  buildAngkotCorridor({ id: 'ANGKOT-03', code: 'Angkot 03', name: 'Kalapa – Ledeng', officialName: 'Abdul Muis – Ledeng', shortDesc: 'Via Balai Kota, Cihampelas, Sederhana & UPI', vehicleColorLabel: 'Hijau Tua – Biru', color: '#22c55e', stops: ['kebon_kalapa', 'balai_kota', 'cihampelas', 'sederhana', 'pasteur_pvj', 'ledeng'] }),
  buildAngkotCorridor({ id: 'ANGKOT-04', code: 'Angkot 04', name: 'Kalapa – Elang', officialName: 'Abdul Muis – Elang', shortDesc: 'Via Alun-Alun, Sudirman & Rajawali', vehicleColorLabel: 'Hijau – Cokelat Muda', color: '#10b981', stops: ['kebon_kalapa', 'alun_alun', 'sudirman', 'elang'] }),
  buildAngkotCorridor({ id: 'ANGKOT-05', code: 'Angkot 05', name: 'Cicaheum – Ledeng', shortDesc: 'Via Pahlawan, Dipatiukur, Dago, Cihampelas & UPI', vehicleColorLabel: 'Hijau – Hitam / Toska', color: '#14b8a6', stops: ['cicaheum', 'pahlawan', 'dipatiukur', 'dago_itb', 'cihampelas', 'sederhana', 'ledeng'] }),
  buildAngkotCorridor({ id: 'ANGKOT-06', code: 'Angkot 06', name: 'Cicaheum – Ciroyom', shortDesc: 'Via Pahlawan, Gasibu, Cihampelas, PVJ & Pajajaran', vehicleColorLabel: 'Hijau – Oranye Tua', color: '#059669', stops: ['cicaheum', 'pahlawan', 'gasibu', 'dago_itb', 'cihampelas', 'pasteur_pvj', 'pajajaran', 'ciroyom'] }),
  buildAngkotCorridor({ id: 'ANGKOT-07', code: 'Angkot 07', name: 'Gasibu – Ciwastra', officialName: 'Cicaheum – Ciwastra – Derwati', shortDesc: 'Via Jl. Riau, Kiara Artha, Kiaracondong & Margahayu', vehicleColorLabel: 'Hijau – Cokelat', color: '#15803d', stops: ['gasibu', 'riau_martadinata', 'kiara_artha', 'kiaracondong', 'buah_batu', 'margahayu', 'ciwastra'] }),
  buildAngkotCorridor({ id: 'ANGKOT-08', code: 'Angkot 08', name: 'Kiara Artha – Leuwipanjang', officialName: 'Cicaheum – Cibaduyut', shortDesc: 'Via Kiaracondong, Buah Batu & Soekarno-Hatta', vehicleColorLabel: 'Hijau – Merah', color: '#4d7c0f', stops: ['kiara_artha', 'kiaracondong', 'buah_batu', 'moh_toha', 'leuwipanjang'] }),
  buildAngkotCorridor({ id: 'ANGKOT-09', code: 'Angkot 09', name: 'Stasiun Hall – Dago', shortDesc: 'Via Viaduct, Balai Kota, BIP & Ir. H. Juanda', vehicleColorLabel: 'Hijau – Oranye / Biru Muda', color: '#3b82f6', stops: ['stasiun_hall', 'balai_kota', 'bip_bec', 'dago_itb'] }),
  buildAngkotCorridor({ id: 'ANGKOT-10', code: 'Angkot 10', name: 'Stasiun Hall – Sadang Serang', shortDesc: 'Via Balai Kota, BIP, Gasibu & Pahlawan', vehicleColorLabel: 'Hijau – Kuning', color: '#2563eb', stops: ['stasiun_hall', 'balai_kota', 'bip_bec', 'gasibu', 'pahlawan', 'sadang_serang'] }),
  buildAngkotCorridor({ id: 'ANGKOT-11A', code: 'Angkot 11A', name: 'Stasiun Hall – Sederhana', officialName: 'Stasiun Hall – Ciumbuleuit via Eyckman', shortDesc: 'Via Pajajaran, PVJ, Eyckman & Ciumbuleuit', vehicleColorLabel: 'Hijau – Putih (via Eyckman)', color: '#0ea5e9', stops: ['stasiun_hall', 'pajajaran', 'pasteur_pvj', 'sederhana', 'ciumbuleuit'] }),
  buildAngkotCorridor({ id: 'ANGKOT-11B', code: 'Angkot 11B', name: 'Stasiun Hall – Ciumbuleuit via Cihampelas', shortDesc: 'Via Cihampelas menuju Unpar & Punclut', vehicleColorLabel: 'Hijau – Cokelat (via Cihampelas)', color: '#d97706', stops: ['stasiun_hall', 'cihampelas', 'ciumbuleuit'] }),
  buildAngkotCorridor({ id: 'ANGKOT-12', code: 'Angkot 12', name: 'Stasiun Hall – Gedebage', shortDesc: 'Via Alun-Alun, Kosambi, Binong, Buah Batu & MIM', vehicleColorLabel: 'Hijau – Merah Muda / Putih', color: '#0284c7', stops: ['stasiun_hall', 'alun_alun', 'kosambi', 'laswi', 'binong', 'kiaracondong', 'buah_batu', 'gedebage'] }),
  buildAngkotCorridor({ id: 'ANGKOT-13', code: 'Angkot 13', name: 'Stasiun Hall – Sarijadi', shortDesc: 'Via Pajajaran, Pasteur PVJ & Sukajadi', vehicleColorLabel: 'Hijau – Biru Tua', color: '#1d4ed8', stops: ['stasiun_hall', 'pajajaran', 'pasteur_pvj', 'sarijadi'] }),
  buildAngkotCorridor({ id: 'ANGKOT-14', code: 'Angkot 14', name: 'Stasiun Hall – Gunung Batu', shortDesc: 'Via Pajajaran, Dr. Djunjunan & Pasteur', vehicleColorLabel: 'Hijau – Biru Langit', color: '#0369a1', stops: ['stasiun_hall', 'pajajaran', 'pasteur_pvj', 'gunung_batu'] }),
  buildAngkotCorridor({ id: 'ANGKOT-15', code: 'Angkot 15', name: 'Margahayu Raya – Ledeng', shortDesc: 'Trayek Lintas Kota via Buah Batu, Kircon, Gasibu & Dago', vehicleColorLabel: 'Hijau – Ungu / Biru', color: '#9333ea', stops: ['margahayu', 'buah_batu', 'kiaracondong', 'laswi', 'gasibu', 'dago_itb', 'sederhana', 'ledeng'] }),
  buildAngkotCorridor({ id: 'ANGKOT-16', code: 'Angkot 16', name: 'Dago – Riung Bandung', shortDesc: 'Via Dipatiukur, Gasibu, Cicadas, Kircon & Margahayu', vehicleColorLabel: 'Hijau – Putih (Dago–Riung)', color: '#7c3aed', stops: ['dago_itb', 'dipatiukur', 'gasibu', 'cicadas', 'kiara_artha', 'kiaracondong', 'buah_batu', 'margahayu', 'riung_bandung'] }),
  buildAngkotCorridor({ id: 'ANGKOT-17', code: 'Angkot 17', name: 'Caringin – Dago', shortDesc: 'Via Sudirman, Ciroyom, Pajajaran & BIP', vehicleColorLabel: 'Oranye – Kuning', color: '#f59e0b', stops: ['caringin', 'sudirman', 'ciroyom', 'pajajaran', 'bip_bec', 'dago_itb'] }),
  buildAngkotCorridor({ id: 'ANGKOT-18', code: 'Angkot 18', name: 'Panghegar Permai – Dipatiukur', officialName: 'Panghegar Permai – Dipatiukur – Dago', shortDesc: 'Via Cicaheum, Cicadas, Gasibu & Dago ITB', vehicleColorLabel: 'Hijau – Putih Strip Biru', color: '#16a34a', stops: ['panghegar', 'cicaheum', 'cicadas', 'gasibu', 'dago_itb', 'dipatiukur'] }),
  buildAngkotCorridor({ id: 'ANGKOT-19', code: 'Angkot 19', name: 'Ciroyom – Sarijadi', shortDesc: 'Via Pajajaran, Pasteur PVJ & Karang Setra', vehicleColorLabel: 'Biru – Hijau', color: '#2563eb', stops: ['ciroyom', 'pajajaran', 'pasteur_pvj', 'karang_setra', 'sarijadi'] }),
  buildAngkotCorridor({ id: 'ANGKOT-20', code: 'Angkot 20', name: 'Ciroyom – Bumi Asri', shortDesc: 'Via Rajawali, Elang & Cibeureum', vehicleColorLabel: 'Biru – Kuning', color: '#3b82f6', stops: ['ciroyom', 'elang', 'cibeureum', 'bumi_asri'] }),
  buildAngkotCorridor({ id: 'ANGKOT-21', code: 'Angkot 21', name: 'Sederhana – Cijerah', shortDesc: 'Via Pasteur, Pajajaran, Ciroyom, Elang & Cibeureum', vehicleColorLabel: 'Biru – Merah', color: '#1d4ed8', stops: ['sederhana', 'pasteur_pvj', 'pajajaran', 'ciroyom', 'elang', 'cibeureum', 'cijerah'] }),
  buildAngkotCorridor({ id: 'ANGKOT-22BB', code: 'Angkot 22BB', name: 'Kalapa – Buah Batu', officialName: 'Sederhana – Cipagalo', shortDesc: 'Via BKR / Palasari menuju Buah Batu & MIM', vehicleColorLabel: 'Biru – Hijau Muda', color: '#0284c7', stops: ['kebon_kalapa', 'bkr_palasari', 'buah_batu'] }),
  buildAngkotCorridor({ id: 'ANGKOT-22SE', code: 'Angkot 22SE', name: 'Kalapa – Sarijadi', officialName: 'Sederhana – Cipagalo', shortDesc: 'Via Alun-Alun, Stasiun Hall, Pajajaran & Sederhana', vehicleColorLabel: 'Biru – Strip Kuning', color: '#0ea5e9', stops: ['kebon_kalapa', 'alun_alun', 'stasiun_hall', 'pajajaran', 'pasteur_pvj', 'sederhana', 'sarijadi'] }),
  buildAngkotCorridor({ id: 'ANGKOT-23', code: 'Angkot 23', name: 'Ciroyom – Cikudapateuh', shortDesc: 'Via Sudirman, Alun-Alun, Kebon Kalapa & Kosambi', vehicleColorLabel: 'Biru – Putih', color: '#4f46e5', stops: ['ciroyom', 'sudirman', 'alun_alun', 'kebon_kalapa', 'kosambi', 'cikudapateuh'] }),
  buildAngkotCorridor({ id: 'ANGKOT-24', code: 'Angkot 24', name: 'Sederhana – Cimindi', shortDesc: 'Via Pasteur PVJ & Gunung Batu', vehicleColorLabel: 'Biru – Hitam', color: '#6366f1', stops: ['sederhana', 'pasteur_pvj', 'gunung_batu', 'cimindi'] }),
  buildAngkotCorridor({ id: 'ANGKOT-25', code: 'Angkot 25', name: 'Ciwastra – Ujungberung', shortDesc: 'Via Margahayu, Gedebage & Panghegar Arcamanik', vehicleColorLabel: 'Cokelat – Biru', color: '#b45309', stops: ['ciwastra', 'margahayu', 'gedebage', 'panghegar', 'ujungberung'] }),
  buildAngkotCorridor({ id: 'ANGKOT-26', code: 'Angkot 26', name: 'Cisitu – Tegallega', shortDesc: 'Via Dago ITB, Cihampelas, Stasiun Hall & Alun-Alun', vehicleColorLabel: 'Ungu – Hijau', color: '#7e22ce', stops: ['cisitu', 'dago_itb', 'cihampelas', 'stasiun_hall', 'alun_alun', 'tegallega'] }),
  buildAngkotCorridor({ id: 'ANGKOT-27', code: 'Angkot 27', name: 'Cijerah – Ciwastra – Derwati', shortDesc: 'Jalur Selatan via Caringin, Leuwipanjang, Buah Batu & Margahayu', vehicleColorLabel: 'Abu – Hijau', color: '#475569', stops: ['cijerah', 'caringin', 'leuwipanjang', 'moh_toha', 'buah_batu', 'margahayu', 'ciwastra', 'derwati'] }),
  buildAngkotCorridor({ id: 'ANGKOT-28', code: 'Angkot 28', name: 'Elang – Ujungberung', shortDesc: 'Lintas Barat–Timur via Alun-Alun, Kosambi, Cicadas & Cicaheum', vehicleColorLabel: 'Hijau – Kuning (Elang–Uber)', color: '#0f766e', stops: ['elang', 'sudirman', 'alun_alun', 'kosambi', 'cikudapateuh', 'kiara_artha', 'cicadas', 'cicaheum', 'panghegar', 'ujungberung'] }),
  buildAngkotCorridor({ id: 'ANGKOT-29', code: 'Angkot 29', name: 'Kalapa – Mengger', officialName: 'Abdul Muis – Mengger', shortDesc: 'Via Taman Tegallega & Simpang Moh. Toha', vehicleColorLabel: 'Hijau – Biru Muda', color: '#0891b2', stops: ['kebon_kalapa', 'tegallega', 'moh_toha', 'mengger'] }),
  buildAngkotCorridor({ id: 'ANGKOT-30CC', code: 'Angkot 30CC', name: 'Cicadas – Kalapa', officialName: 'Cicadas – Elang', shortDesc: 'Via Kiara Artha, Pasar Kosambi & Alun-Alun', vehicleColorLabel: 'Merah – Putih (Cicadas)', color: '#dc2626', stops: ['cicadas', 'kiara_artha', 'kosambi', 'alun_alun', 'kebon_kalapa'] }),
  buildAngkotCorridor({ id: 'ANGKOT-30EL', code: 'Angkot 30EL', name: 'Kalapa – Elang', officialName: 'Cicadas – Elang', shortDesc: 'Via Stasiun Hall & Pasar Ciroyom', vehicleColorLabel: 'Merah – Putih (Elang)', color: '#ef4444', stops: ['kebon_kalapa', 'stasiun_hall', 'ciroyom', 'elang'] }),
  buildAngkotCorridor({ id: 'ANGKOT-31', code: 'Angkot 31', name: 'Antapani – Pajajaran', officialName: 'Antapani – Ciroyom', shortDesc: 'Via Cicadas, Gasibu, BIP & Istana Plaza Pajajaran', vehicleColorLabel: 'Krem – Strip Biru', color: '#ca8a04', stops: ['antapani', 'cicadas', 'gasibu', 'bip_bec', 'pajajaran', 'ciroyom'] }),
  buildAngkotCorridor({ id: 'ANGKOT-32', code: 'Angkot 32', name: 'Cicadas – Cibiru – Panyileukan', shortDesc: 'Via Cicaheum, Panghegar, Ujungberung & Bunderan Cibiru', vehicleColorLabel: 'Merah Marun – Putih', color: '#be123c', stops: ['cicadas', 'cicaheum', 'panghegar', 'ujungberung', 'cibiru', 'panyileukan'] }),
  buildAngkotCorridor({ id: 'ANGKOT-33', code: 'Angkot 33', name: 'Gedebage – Simpang Dago', officialName: 'Bumi Panyileukan – Sekemirung', shortDesc: 'Via Panyileukan, Ujungberung, Cicaheum, Pahlawan & Dipatiukur', vehicleColorLabel: 'Hijau – Biru (Bumi Panyileukan)', color: '#15803d', stops: ['gedebage', 'panyileukan', 'ujungberung', 'cicaheum', 'pahlawan', 'dipatiukur', 'dago_itb'] }),
  buildAngkotCorridor({ id: 'ANGKOT-34', code: 'Angkot 34', name: 'Caringin – Sadang Serang', shortDesc: 'Via Ciroyom, Pajajaran, Cihampelas, Dago ITB & Dipatiukur', vehicleColorLabel: 'Hijau – Krem', color: '#0d9488', stops: ['caringin', 'ciroyom', 'pajajaran', 'cihampelas', 'dago_itb', 'dipatiukur', 'sadang_serang'] }),
  buildAngkotCorridor({ id: 'ANGKOT-35CB', code: 'Angkot 35CB', name: 'Cibaduyut – Kalapa', officialName: 'Cibaduyut – Karang Setra', shortDesc: 'Akses Sentra Sepatu Cibaduyut, Leuwipanjang & Tegallega', vehicleColorLabel: 'Hijau – Kuning / Biru', color: '#06b6d4', stops: ['cibaduyut', 'leuwipanjang', 'tegallega', 'kebon_kalapa'] }),
  buildAngkotCorridor({ id: 'ANGKOT-35KS', code: 'Angkot 35KS', name: 'Kalapa – Karang Setra', officialName: 'Cibaduyut – Karang Setra', shortDesc: 'Via Stasiun Hall, Pajajaran, PVJ & Pasar Sederhana', vehicleColorLabel: 'Hijau – Kuning / Biru', color: '#0891b2', stops: ['kebon_kalapa', 'stasiun_hall', 'pajajaran', 'pasteur_pvj', 'sederhana', 'karang_setra'] }),

  // === TRAYEK WISATA LUAR KOTA ===
  buildAngkotCorridor({ id: 'ANGKOT-LMG', code: 'Angkot Lembang', name: 'Stasiun Hall – Lembang', officialName: 'Trayek Kabupaten Bandung Barat', shortDesc: 'Via Sukajadi (PVJ), UPI Ledeng & Wisata Lembang', vehicleColorLabel: 'Kuning – Putih (Lembang)', color: '#eab308', stops: ['stasiun_hall', 'pasteur_pvj', 'ledeng', 'lembang'], segmentMinutes: [15, 14, 24], segmentKm: [3.8, 3.9, 8.6] }),
];

export const POPULAR_TRIPS: PopularTrip[] = [
  { label: 'St. Bandung → Lembang', from: 'stasiun_hall', to: 'lembang' },
  { label: 'Alun-Alun → ITB Dago', from: 'alun_alun', to: 'dago_itb' },
  { label: 'St. Bandung → Unpar', from: 'stasiun_hall', to: 'ciumbuleuit' },
  { label: 'Cicaheum → UPI Ledeng', from: 'cicaheum', to: 'ledeng' },
  { label: 'Alun-Alun → Telkom Univ', from: 'alun_alun', to: 'bojongsoang' },
  { label: 'Elang → Ujungberung', from: 'elang', to: 'ujungberung' },
  { label: 'Cicaheum → Cibeureum', from: 'cicaheum', to: 'cibeureum' },
];
