import { describe, expect, it } from 'vitest';
import { BMKG_ZONES, resolveBmkgZoneForStop } from '../bmkgZones';
import {
  buildWeatherAdvisory,
  parseBmkgPayload,
  type WeatherForecastSlot,
} from '../bmkgService';

function makeSlot(overrides: Partial<WeatherForecastSlot>): WeatherForecastSlot {
  return {
    timestampMs: Date.parse('2026-11-22T12:00:00+07:00'),
    timeLabel: '12:00',
    localDatetime: '2026-11-22 12:00:00',
    tempC: 26,
    humidityPct: 72,
    weatherDesc: 'Berawan',
    windSpeedKmh: 8,
    windDirection: 'Timur',
    visibilityText: '> 10 km',
    ...overrides,
  };
}

describe('BMKG Weather & Vigilance Advisory', () => {
  it('memetakan halte Bandung Raya ke kode adm4 Kemendagri yang sesuai', () => {
    expect(resolveBmkgZoneForStop('alun_alun').adm4).toBe('32.73.19.1001');
    expect(resolveBmkgZoneForStop('lembang').adm4).toBe('32.17.01.2001');
    expect(resolveBmkgZoneForStop('cimahi').adm4).toBe('32.77.02.1001');
    expect(resolveBmkgZoneForStop('soreang').adm4).toBe('32.04.37.2001');
    expect(resolveBmkgZoneForStop('jatinangor').adm4).toBe('32.11.15.2001');
    expect(resolveBmkgZoneForStop('gedebage').adm4).toBe('32.73.27.1001');
    expect(resolveBmkgZoneForStop('dago_itb').adm4).toBe('32.73.02.1001');
  });

  it('mengurai payload nested JSON BMKG dan memilih slot waktu WIB aktif', () => {
    const samplePayload = {
      lokasi: {
        kotkab: 'Kota Bandung',
        kecamatan: 'Sumur Bandung',
        desa: 'Braga',
      },
      data: [
        {
          lokasi: {
            kotkab: 'Kota Bandung',
            kecamatan: 'Sumur Bandung',
            desa: 'Braga',
          },
          cuaca: [
            [
              {
                datetime: '2026-11-22T09:00:00+07:00',
                local_datetime: '2026-11-22 09:00:00',
                t: 25,
                hu: 78,
                weather_desc: 'Berawan',
                ws: 6.5,
                wd: 'Barat',
              },
              {
                datetime: '2026-11-22T12:00:00+07:00',
                local_datetime: '2026-11-22 12:00:00',
                t: 27,
                hu: 80,
                weather_desc: 'Hujan Ringan',
                ws: 10,
                wd: 'Barat Daya',
              },
            ],
          ],
        },
      ],
    };

    const nowMs = Date.parse('2026-11-22T10:15:00+07:00');
    const parsed = parseBmkgPayload(samplePayload, BMKG_ZONES.bandungPusat, nowMs);

    expect(parsed).not.toBeNull();
    expect(parsed?.current.timeLabel).toBe('09:00');
    expect(parsed?.current.tempC).toBe(25);
    expect(parsed?.locationDisplay).toBe('Sumur Bandung, Kota Bandung');
    expect(parsed?.advisory.upcomingRainNote).toContain('12:00 WIB');
    expect(parsed?.advisory.shortTip.toLowerCase()).toContain('payung');
  });

  it('memberikan rekomendasi bawa payung & hati-hati saat hujan dan waspada petir saat hujan petir', () => {
    const rainAdv = buildWeatherAdvisory(
      makeSlot({ weatherDesc: 'Hujan Ringan', tempC: 23 }),
      []
    );
    expect(rainAdv.tone).toBe('info');
    expect(rainAdv.shortTip.toLowerCase()).toContain('payung');
    expect(rainAdv.tips.some((t) => t.toLowerCase().includes('licin'))).toBe(true);

    const stormAdv = buildWeatherAdvisory(
      makeSlot({ weatherDesc: 'Hujan Petir', tempC: 22, windSpeedKmh: 24 }),
      []
    );
    expect(stormAdv.tone).toBe('danger');
    expect(stormAdv.tips.some((t) => t.toLowerCase().includes('pohon'))).toBe(true);
  });

  it('memberikan rekomendasi pakai sunscreen saat cuaca panas/cerah terik', () => {
    const hotAdv = buildWeatherAdvisory(
      makeSlot({ weatherDesc: 'Cerah', tempC: 31, timeLabel: '12:00' }),
      []
    );
    expect(hotAdv.tone).toBe('warning');
    expect(hotAdv.shortTip.toLowerCase()).toContain('sunscreen');
    expect(hotAdv.tips.some((t) => t.toLowerCase().includes('spf'))).toBe(true);
    expect(hotAdv.tips.some((t) => t.toLowerCase().includes('air minum'))).toBe(true);
  });

  it('menangani field null (vs_text: null) & kode arah angin singkat dari payload asli api.bmkg.go.id', () => {
    const liveLikePayload = {
      data: [
        {
          lokasi: {
            adm4: '32.73.19.1001',
            desa: 'Braga',
            kecamatan: 'Sumur Bandung',
            kotkab: 'Kota Bandung',
          },
          cuaca: [
            [
              {
                datetime: '2026-11-22T02:00:00Z',
                t: 28,
                hu: 64,
                weather_desc: 'Cerah Berawan',
                wd: 'SW',
                ws: 7,
                vs: null,
                vs_text: null,
                image: 'https://api-apps.bmkg.go.id/storage/icon/cuaca/cerah berawan-am.svg',
                local_datetime: '2026-11-22 09:00:00',
              },
              {
                datetime: '2026-11-22T05:00:00Z',
                t: 29,
                hu: 58,
                weather_desc: 'Cerah',
                wd: 'E',
                ws: 1.4,
                vs: null,
                vs_text: null,
                local_datetime: '2026-11-22 12:00:00',
              },
            ],
          ],
        },
      ],
    };

    const parsed = parseBmkgPayload(
      liveLikePayload,
      BMKG_ZONES.bandungPusat,
      Date.parse('2026-11-22T09:30:00+07:00')
    );

    expect(parsed).not.toBeNull();
    expect(parsed?.current.tempC).toBe(28);
    expect(parsed?.current.windDirection).toBe('Barat Daya');
    expect(parsed?.current.visibilityText).toBe('');
  });

  it('memberikan rekomendasi jaket saat dingin/kabut dan peringatan angin kencang', () => {
    const coldWindy = buildWeatherAdvisory(
      makeSlot({ weatherDesc: 'Kabut', tempC: 18, windSpeedKmh: 24, timeLabel: '06:00' }),
      []
    );
    expect(coldWindy.kind).toBe('cold_fog');
    expect(coldWindy.tips.some((t) => t.toLowerCase().includes('jaket'))).toBe(true);
    expect(coldWindy.tips.some((t) => t.toLowerCase().includes('jarak pandang'))).toBe(true);
    expect(coldWindy.tips.some((t) => t.toLowerCase().includes('angin cukup kencang'))).toBe(true);
  });
});
