import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetAnalyticsForTest,
  initAnalytics,
  isValidGaMeasurementId,
  trackEvent,
} from '../analytics';

describe('GA4 & GTM Analytics Wrapper', () => {
  beforeEach(() => {
    __resetAnalyticsForTest();
  });

  it('memvalidasi format GA4 Measurement ID (G-XXXXXXXXXX)', () => {
    expect(isValidGaMeasurementId('G-1A2B3C4D5E')).toBe(true);
    expect(isValidGaMeasurementId('g-abcdef1234')).toBe(true);
    expect(isValidGaMeasurementId('')).toBe(false);
    expect(isValidGaMeasurementId('UA-123456-1')).toBe(false);
    expect(isValidGaMeasurementId('G-12')).toBe(false);
  });

  it('menjadi no-op aman saat GTM & Measurement ID tidak aktif', () => {
    const initializedEmpty = initAnalytics({
      measurementId: '',
      isDev: false,
      gtmPresent: false,
    });
    expect(initializedEmpty).toBe(false);

    const initializedDev = initAnalytics({
      measurementId: 'G-1A2B3C4D5E',
      isDev: true,
      debug: false,
      gtmPresent: false,
    });
    expect(initializedDev).toBe(false);
  });

  it('mendorong object event ke window.dataLayer saat Google Tag Manager (GTM) aktif', () => {
    const dataLayer: unknown[] = [{ 'gtm.start': Date.now(), event: 'gtm.js' }];
    vi.stubGlobal('window', { dataLayer });
    vi.stubGlobal('document', {
      querySelector: vi.fn(() => null),
      getElementById: vi.fn(() => null),
    });

    const ok = initAnalytics({ measurementId: '', isDev: false });
    expect(ok).toBe(true);

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

    expect(dataLayer).toContainEqual({
      event: 'route_searched',
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

  it('mengirim event GA4 melalui window.gtag saat Measurement ID diisi langsung', () => {
    const mockAppend = vi.fn();
    const mockCreateElement = vi.fn(() => ({
      id: '',
      async: false,
      src: '',
    }));

    const gtagSpy = vi.fn();
    vi.stubGlobal('window', { dataLayer: [], gtag: gtagSpy });
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
      gtmPresent: false,
    });
    expect(ok).toBe(true);
    expect(mockAppend).toHaveBeenCalledTimes(1);

    trackEvent('live_tracker_clicked', {
      provider: 'BEMO',
      corridor_code: 'TMB 2',
    });

    expect(gtagSpy).toHaveBeenCalledWith('event', 'live_tracker_clicked', {
      provider: 'BEMO',
      corridor_code: 'TMB 2',
    });

    vi.unstubAllGlobals();
  });
});
