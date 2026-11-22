import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetAnalyticsForTest,
  initAnalytics,
  isValidGaMeasurementId,
  trackEvent,
} from '../analytics';

describe('GA4 Analytics Wrapper', () => {
  beforeEach(() => {
    __resetAnalyticsForTest();
  });

  it('memvalidasi format GA4 Measurement ID (G-XXXXXXXXXX)', () => {
    expect(isValidGaMeasurementId('G-ZPPJSXF8RB')).toBe(true);
    expect(isValidGaMeasurementId('g-abcdef1234')).toBe(true);
    expect(isValidGaMeasurementId('')).toBe(false);
    expect(isValidGaMeasurementId('UA-123456-1')).toBe(false);
    expect(isValidGaMeasurementId('G-12')).toBe(false);
  });

  it('menjadi no-op aman saat gtag statis dan Measurement ID tidak ada', () => {
    const initializedEmpty = initAnalytics({
      measurementId: '',
      isDev: false,
      staticGtagPresent: false,
    });
    expect(initializedEmpty).toBe(false);

    const initializedDev = initAnalytics({
      measurementId: 'G-1A2B3C4D5E',
      isDev: true,
      debug: false,
      staticGtagPresent: false,
    });
    expect(initializedDev).toBe(false);
  });

  it('mengaktifkan trackEvent otomatis ketika gtag.js sudah terpasang statis di index.html', () => {
    const gtagSpy = vi.fn();
    vi.stubGlobal('window', { dataLayer: [], gtag: gtagSpy });
    vi.stubGlobal('document', {
      querySelector: vi.fn(() => null),
      getElementById: vi.fn(() => null),
    });

    const ok = initAnalytics({ measurementId: '', isDev: false });
    expect(ok).toBe(true);
    // Tidak memanggil config ulang untuk ID default yang sudah dikonfigurasi di index.html
    expect(gtagSpy).not.toHaveBeenCalled();

    trackEvent('route_searched', {
      from_id: 'alun_alun',
      to_id: 'dago_itb',
      route_pair: 'alun_alun__dago_itb',
      mode_filter: 'all',
      passenger_type: 'regular',
      traffic_mode: 'normal',
      results_count: 3,
      trigger: 'to',
    });

    expect(gtagSpy).toHaveBeenCalledWith('event', 'route_searched', {
      from_id: 'alun_alun',
      to_id: 'dago_itb',
      route_pair: 'alun_alun__dago_itb',
      mode_filter: 'all',
      passenger_type: 'regular',
      traffic_mode: 'normal',
      results_count: 3,
      trigger: 'to',
    });

    vi.unstubAllGlobals();
  });

  it('memuat gtag.js dinamis jika belum terpasang statis dan Measurement ID diisi', () => {
    const mockAppend = vi.fn();
    const mockCreateElement = vi.fn(() => ({
      id: '',
      async: false,
      src: '',
    }));

    const dataLayer: unknown[] = [];
    vi.stubGlobal('window', { dataLayer });
    vi.stubGlobal('document', {
      querySelector: vi.fn(() => null),
      getElementById: vi.fn(() => null),
      createElement: mockCreateElement,
      head: { appendChild: mockAppend },
    });

    const ok = initAnalytics({
      measurementId: 'G-1A2B3C4D5E',
      isDev: false,
      debug: false,
      staticGtagPresent: false,
    });
    expect(ok).toBe(true);
    expect(mockAppend).toHaveBeenCalledTimes(1);

    trackEvent('live_tracker_clicked', {
      provider: 'BEMO',
      corridor_code: 'TMB 2',
    });

    // Pastikan item terakhir adalah Arguments object (bukan Array biasa) agar diterima gtag.js
    const lastEntry = dataLayer[dataLayer.length - 1];
    expect(Object.prototype.toString.call(lastEntry)).toBe('[object Arguments]');

    vi.unstubAllGlobals();
  });
});
