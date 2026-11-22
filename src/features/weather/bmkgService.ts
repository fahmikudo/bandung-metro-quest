import { z } from 'zod';
import { BMKG_ZONES, type BmkgZone } from './bmkgZones';

export type WeatherAdvisoryTone = 'danger' | 'warning' | 'info' | 'success';
export type WeatherConditionKind = 'storm' | 'rain' | 'hot' | 'cold_fog' | 'cloudy' | 'clear';

export interface WeatherForecastSlot {
  timestampMs: number;
  timeLabel: string; // e.g. "09:00"
  localDatetime: string;
  tempC: number;
  humidityPct: number;
  weatherDesc: string;
  windSpeedKmh: number;
  windDirection: string;
  visibilityText: string;
  iconUrl?: string;
}

export interface WeatherAdvisory {
  tone: WeatherAdvisoryTone;
  kind: WeatherConditionKind;
  headline: string;
  shortTip: string;
  tips: string[];
  upcomingRainNote?: string;
}

export interface BandungWeatherData {
  zone: BmkgZone;
  locationDisplay: string;
  current: WeatherForecastSlot;
  upcomingSlots: WeatherForecastSlot[];
  advisory: WeatherAdvisory;
  fetchedAtMs: number;
}

const BmkgRawSlotSchema = z.object({
  datetime: z.string().nullish(),
  local_datetime: z.string().nullish(),
  t: z.coerce.number(),
  hu: z.coerce.number().nullish(),
  weather_desc: z.string().nullish(),
  ws: z.coerce.number().nullish(),
  wd: z.string().nullish(),
  vs_text: z.string().nullish(),
  image: z.string().nullish(),
});

const BmkgLocationSchema = z
  .object({
    desa: z.string().nullish(),
    kecamatan: z.string().nullish(),
    kotkab: z.string().nullish(),
  })
  .nullish();

const BmkgResponseSchema = z.object({
  lokasi: BmkgLocationSchema,
  data: z
    .array(
      z.object({
        lokasi: BmkgLocationSchema,
        cuaca: z.array(z.union([z.array(BmkgRawSlotSchema), BmkgRawSlotSchema])).default([]),
      })
    )
    .min(1),
});

const WIND_DIR_ID: Record<string, string> = {
  N: 'Utara',
  NE: 'Timur Laut',
  E: 'Timur',
  SE: 'Tenggara',
  S: 'Selatan',
  SW: 'Barat Daya',
  W: 'Barat',
  NW: 'Barat Laut',
};

function formatWindDirection(wd?: string | null): string {
  if (!wd) return '';
  const trimmed = wd.trim();
  return WIND_DIR_ID[trimmed.toUpperCase()] ?? trimmed;
}

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 menit
const STORAGE_PREFIX = 'manawibandung_bmkg_v1_';
const memoryCache = new Map<string, BandungWeatherData>();

function parseSlotTimestamp(datetime?: string, localDatetime?: string): number {
  if (datetime) {
    const parsed = Date.parse(datetime);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (localDatetime) {
    const iso = `${localDatetime.replace(' ', 'T')}+07:00`;
    const parsed = Date.parse(iso);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

function extractTimeLabelWib(localDatetime?: string, timestampMs?: number): string {
  if (localDatetime) {
    const match = localDatetime.match(/(\d{2}:\d{2})/);
    if (match) return match[1];
  }
  const d = new Date((timestampMs ?? Date.now()) + 7 * 60 * 60 * 1000);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function getWibHourFromSlot(slot: WeatherForecastSlot): number {
  const [hStr] = slot.timeLabel.split(':');
  const parsed = Number.parseInt(hStr ?? '', 10);
  if (!Number.isNaN(parsed)) return parsed;
  return new Date(slot.timestampMs + 7 * 60 * 60 * 1000).getUTCHours();
}

function isStormText(desc: string): boolean {
  const d = desc.toLowerCase();
  return d.includes('petir') || d.includes('lebat') || d.includes('badai') || d.includes('thunder');
}

function isRainText(desc: string): boolean {
  const d = desc.toLowerCase();
  return d.includes('hujan') || d.includes('gerimis') || d.includes('rain') || d.includes('drizzle');
}

function isFogText(desc: string): boolean {
  const d = desc.toLowerCase();
  return d.includes('kabut') || d.includes('kabur') || d.includes('asap') || d.includes('fog');
}

function isSunnyClearText(desc: string): boolean {
  const d = desc.toLowerCase();
  return d.includes('cerah') && !d.includes('berawan');
}

/**
 * Menyusun rekomendasi kewaspadaan cuaca kontekstual untuk pengguna transportasi umum Bandung.
 */
export function buildWeatherAdvisory(
  current: WeatherForecastSlot,
  upcomingSlots: WeatherForecastSlot[]
): WeatherAdvisory {
  const desc = current.weatherDesc;
  const hourWib = getWibHourFromSlot(current);
  const isDaytimePeakUv = hourWib >= 9 && hourWib <= 15;
  const stormNow = isStormText(desc);
  const rainNow = isRainText(desc);
  const fogNow = isFogText(desc);
  const sunnyClear = isSunnyClearText(desc);
  const hotNow = current.tempC >= 29 || (sunnyClear && isDaytimePeakUv && current.tempC >= 26);
  const coldNow = current.tempC <= 21;

  // Cek apakah 1–2 slot berikutnya (3–6 jam ke depan) ada potensi hujan
  const upcomingRain = !rainNow
    ? upcomingSlots.slice(0, 2).find((slot) => isRainText(slot.weatherDesc) || isStormText(slot.weatherDesc))
    : undefined;

  const upcomingRainNote = upcomingRain
    ? `BMKG memprakirakan ${upcomingRain.weatherDesc.toLowerCase()} sekitar pukul ${upcomingRain.timeLabel} WIB — tetap bawa payung ya.`
    : undefined;

  let tone: WeatherAdvisoryTone = 'success';
  let kind: WeatherConditionKind = 'cloudy';
  let headline = 'Cuaca Cukup Bersahabat';
  let shortTip = 'Cuaca nyaman — tetap sedia payung lipat untuk jaga-jaga';
  const tips: string[] = [];

  if (stormNow) {
    tone = 'danger';
    kind = 'storm';
    headline = 'Waspada Hujan Lebat / Petir';
    shortTip = 'Bawa payung/jas hujan, hati-hati jalan licin & hindari pohon besar';
    tips.push(
      'Bawa payung kuat atau jas hujan dan berhati-hati terhadap jalanan licin serta potensi genangan.'
    );
    tips.push('Hindari berteduh di bawah pohon besar, tiang listrik, atau baliho saat ada petir.');
    tips.push(
      'Bus MJT/TMB tertutup & ber-AC lebih aman saat hujan deras; beri waktu ekstra untuk potensi macet.'
    );
  } else if (rainNow) {
    tone = 'info';
    kind = 'rain';
    headline = 'Sedia Payung & Berhati-hati';
    shortTip = 'Bawa payung atau jas hujan & hati-hati saat melangkah';
    tips.push('Bawa payung lipat atau jas hujan sebelum berangkat menuju halte atau titik angkot.');
    tips.push('Berhati-hati saat naik-turun kendaraan karena tangga dan trotoar bisa licin.');
    tips.push('Bus MJT/TMB ber-AC & teduh bisa jadi pilihan nyaman dibanding menunggu di ruang terbuka.');
  } else if (hotNow) {
    tone = 'warning';
    kind = 'hot';
    headline = 'Cuaca Panas & Terik';
    shortTip = 'Pakai sunscreen, topi, & bawa air minum biar tetap segar';
    tips.push(
      'Gunakan sunscreen (minimal SPF 30), topi, atau kacamata hitam saat menunggu di halte terbuka.'
    );
    tips.push('Bawa air minum agar tetap terhidrasi selama perjalanan di cuaca terik.');
    tips.push('Manfaatkan tempat tunggu teduh atau bus MJT/TMB ber-AC di jam siang.');
  } else if (fogNow || coldNow) {
    tone = 'info';
    kind = 'cold_fog';
    headline = fogNow ? 'Waspada Kabut & Jarak Pandang' : 'Udara Sejuk Cenderung Dingin';
    shortTip = fogNow
      ? 'Berkabut — waspada saat menyeberang & bawa jaket'
      : 'Udara sejuk — bawa jaket tipis agar tetap hangat';
    tips.push(
      'Kenakan jaket tipis atau pakaian hangat, apalagi jika melintas arah utara/Lembang atau berangkat pagi–malam.'
    );
    if (fogNow) {
      tips.push('Perhatikan jarak pandang dan lalu lintas saat menyeberang menuju halte.');
    }
  } else {
    tone = upcomingRain ? 'info' : 'success';
    kind = sunnyClear ? 'clear' : 'cloudy';
    headline = upcomingRain ? 'Berawan, Berpotensi Hujan Nanti' : 'Cuaca Nyaman untuk Bepergian';
    shortTip = upcomingRain
      ? `Siapkan payung — potensi ${upcomingRain.weatherDesc.toLowerCase()} sekitar ${upcomingRain.timeLabel} WIB`
      : 'Cuaca teduh & nyaman untuk jalan kaki singkat menuju halte';
    tips.push('Cuaca relatif nyaman untuk berjalan kaki singkat ke halte atau menunggu angkot.');
    if (!upcomingRain) {
      tips.push('Cuaca Bandung cepat berubah menjelang sore — membawa payung lipat tetap sangat disarankan.');
    }
  }

  if (upcomingRainNote) {
    tips.unshift(upcomingRainNote);
  }

  if (current.windSpeedKmh >= 20) {
    tips.push(
      `Angin cukup kencang (~${Math.round(current.windSpeedKmh)} km/jam) — tetap waspada ranting pohon di jalanan rindang Bandung.`
    );
  }

  if (!rainNow && !stormNow && current.humidityPct >= 85 && current.tempC >= 27) {
    tips.push(
      `Kelembapan cukup tinggi (${current.humidityPct}%) sehingga udara terasa gerah — pilih pakaian nyaman & bawa air minum.`
    );
  }

  return {
    tone,
    kind,
    headline,
    shortTip,
    tips,
    upcomingRainNote,
  };
}

/**
 * Mengurai respons JSON resmi API publik BMKG dan memilih slot waktu paling dekat.
 */
export function parseBmkgPayload(
  rawJson: unknown,
  zone: BmkgZone,
  nowMs: number = Date.now()
): BandungWeatherData | null {
  const parsed = BmkgResponseSchema.safeParse(rawJson);
  if (!parsed.success) return null;

  const firstEntry = parsed.data.data[0];
  const rawSlots = firstEntry.cuaca.flatMap((group) => (Array.isArray(group) ? group : [group]));
  if (rawSlots.length === 0) return null;

  const slots: WeatherForecastSlot[] = rawSlots
    .map((s) => {
      const datetime = s.datetime ?? undefined;
      const localDatetime = s.local_datetime ?? undefined;
      const timestampMs = parseSlotTimestamp(datetime, localDatetime);
      const wsVal = typeof s.ws === 'number' && !Number.isNaN(s.ws) ? s.ws : 0;
      const huVal = typeof s.hu === 'number' && !Number.isNaN(s.hu) ? s.hu : 70;
      return {
        timestampMs,
        timeLabel: extractTimeLabelWib(localDatetime, timestampMs),
        localDatetime: localDatetime ?? datetime ?? '',
        tempC: Math.round(s.t),
        humidityPct: Math.round(huVal),
        weatherDesc: s.weather_desc?.trim() || 'Berawan',
        windSpeedKmh: Math.round(wsVal * 10) / 10,
        windDirection: formatWindDirection(s.wd),
        visibilityText: s.vs_text ?? '',
        iconUrl: s.image ?? undefined,
      };
    })
    .sort((a, b) => a.timestampMs - b.timestampMs);

  // Pilih slot paling relevan: utamakan window 3 jam yang sedang berjalan, lalu terdekat
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  let currentIdx = slots.findIndex(
    (s) => s.timestampMs <= nowMs && nowMs < s.timestampMs + THREE_HOURS_MS
  );
  if (currentIdx === -1) {
    let bestDiff = Infinity;
    slots.forEach((s, idx) => {
      const diff = Math.abs(s.timestampMs - nowMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        currentIdx = idx;
      }
    });
  }

  const current = slots[Math.max(0, currentIdx)];
  const upcomingSlots = slots.slice(Math.max(0, currentIdx) + 1, Math.max(0, currentIdx) + 5);

  const lok = firstEntry.lokasi ?? parsed.data.lokasi;
  const locationParts = [lok?.kecamatan, lok?.kotkab].filter(Boolean);
  const locationDisplay =
    locationParts.length > 0 ? locationParts.join(', ') : `${zone.label} (${zone.subLabel})`;

  return {
    zone,
    locationDisplay,
    current,
    upcomingSlots,
    advisory: buildWeatherAdvisory(current, upcomingSlots),
    fetchedAtMs: nowMs,
  };
}

function readCachedWeather(adm4: string, nowMs: number): BandungWeatherData | null {
  const mem = memoryCache.get(adm4);
  if (mem && nowMs - mem.fetchedAtMs < CACHE_TTL_MS) return mem;

  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${adm4}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as BandungWeatherData;
    if (cached && typeof cached.fetchedAtMs === 'number' && nowMs - cached.fetchedAtMs < CACHE_TTL_MS) {
      memoryCache.set(adm4, cached);
      return cached;
    }
  } catch {
    // Abaikan error storage (mis. private mode)
  }
  return null;
}

function writeCachedWeather(adm4: string, data: BandungWeatherData): void {
  memoryCache.set(adm4, data);
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${adm4}`, JSON.stringify(data));
  } catch {
    // Abaikan kuota penuh
  }
}

function buildBmkgEndpointUrls(adm4: string): string[] {
  const encoded = encodeURIComponent(adm4);
  const customBase = import.meta.env.VITE_BMKG_API_BASE?.trim();
  const directUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encoded}`;
  const localProxyUrl = `/api/bmkg?adm4=${encoded}`;

  if (customBase) {
    const cleanBase = customBase.replace(/\/+$/, '');
    return [`${cleanBase}?adm4=${encoded}`, directUrl];
  }
  // Di mode dev/preview (Vite proxy) atau hosting dengan rewrite /api/bmkg (Vercel),
  // coba /api/bmkg lebih dulu supaya bebas CORS, lalu fallback ke endpoint BMKG langsung.
  return [localProxyUrl, directUrl];
}

async function fetchSingleZone(
  zone: BmkgZone,
  signal?: AbortSignal
): Promise<BandungWeatherData | null> {
  const urls = buildBmkgEndpointUrls(zone.adm4);
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('json')) continue;

      const json: unknown = await res.json();
      const parsed = parseBmkgPayload(json, zone, Date.now());
      if (parsed) {
        writeCachedWeather(zone.adm4, parsed);
        return parsed;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return null;
      }
      // Lanjut ke fallback URL berikutnya
    }
  }
  return null;
}

export async function fetchBmkgWeather(
  zone: BmkgZone,
  signal?: AbortSignal
): Promise<BandungWeatherData | null> {
  const nowMs = Date.now();
  const cached = readCachedWeather(zone.adm4, nowMs);
  if (cached) return cached;

  const primary = await fetchSingleZone(zone, signal);
  if (primary) return primary;

  // Fallback ke Kota Bandung Pusat (32.73.19.1001) jika zona sekunder tidak tersedia
  if (zone.adm4 !== BMKG_ZONES.bandungPusat.adm4 && !signal?.aborted) {
    const fallbackCached = readCachedWeather(BMKG_ZONES.bandungPusat.adm4, Date.now());
    if (fallbackCached) return fallbackCached;
    return fetchSingleZone(BMKG_ZONES.bandungPusat, signal);
  }

  return null;
}
