export interface AnalyticsEventMap {
  route_searched: {
    from_id: string;
    to_id: string;
    route_pair: string;
    mode_filter: string;
    passenger_type: string;
    traffic_mode: string;
    results_count: number;
    trigger: 'from' | 'to' | 'swap' | 'preset' | 'filter' | 'time';
  };
  route_option_selected: {
    option_index: number;
    corridors: string;
    transfers: number;
    uses_angkot: boolean;
    total_fare: number;
  };
  route_detail_opened: {
    corridors: string;
    transfers: number;
    total_fare: number;
    compare_mode: string;
  };
  route_simulation_started: {
    corridors: string;
    transfers: number;
    trigger_source: 'card' | 'map' | 'modal';
  };
  live_tracker_clicked: {
    provider: string;
    corridor_code: string;
  };
  map_stop_inspected: {
    stop_id: string;
    stop_name: string;
    action: 'view' | 'set_from' | 'set_to';
  };
  corridor_explored: {
    corridor_id: string;
    corridor_code: string;
    operator: string;
  };
  tab_switched: {
    tab: 'planner' | 'corridors';
  };
  compare_mode_switched: {
    compare_mode: 'motor' | 'car';
  };
  whatsapp_support_clicked: {
    source: 'footer';
  };
  data_sources_opened: {
    source: 'footer';
  };
}

type GtagParamValue = string | number | boolean;
type GtagCommand =
  | ['js', Date]
  | ['config', string, Record<string, GtagParamValue | undefined>?]
  | ['event', string, Record<string, GtagParamValue>?];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagCommand) => void;
  }
}

const GA4_ID_PATTERN = /^G-[A-Z0-9]{6,}$/i;
const DEFAULT_HTML_GA4_ID = 'G-ZPPJSXF8RB';
const SCRIPT_ELEMENT_ID = 'manawibandung-ga4-script';

let gaEnabled = false;

export function isValidGaMeasurementId(id?: string | null): id is string {
  if (!id) return false;
  return GA4_ID_PATTERN.test(id.trim());
}

function detectStaticGtag(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (typeof window.gtag === 'function') return true;
  if (typeof document.querySelector === 'function') {
    return Boolean(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'));
  }
  return false;
}

/**
 * Menginisialisasi Google Analytics 4 (gtag.js).
 * Jika snippet gtag.js sudah terpasang statis di index.html, langsung aktifkan
 * pengiriman custom event tanpa menduplikasi `gtag('config', ...)` untuk ID yang sama.
 */
export function initAnalytics(options?: {
  measurementId?: string;
  isDev?: boolean;
  debug?: boolean;
  staticGtagPresent?: boolean;
}): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const hasStaticGtag = options?.staticGtagPresent ?? detectStaticGtag();
  const rawId = options?.measurementId ?? import.meta.env.VITE_GA_MEASUREMENT_ID;
  const isDev = options?.isDev ?? import.meta.env.DEV;
  const debugMode = options?.debug ?? import.meta.env.VITE_GA_DEBUG === 'true';

  if (hasStaticGtag) {
    gaEnabled = true;
    // Jika ada Measurement ID tambahan berbeda via env (bukan default index.html), konfigurasikan juga.
    if (
      isValidGaMeasurementId(rawId) &&
      rawId.trim().toUpperCase() !== DEFAULT_HTML_GA4_ID &&
      (!isDev || debugMode) &&
      typeof window.gtag === 'function'
    ) {
      window.gtag('config', rawId.trim().toUpperCase(), {
        send_page_view: true,
        ...(debugMode ? { debug_mode: true } : {}),
      });
    }
    return true;
  }

  if (!isValidGaMeasurementId(rawId) || (isDev && !debugMode)) {
    gaEnabled = false;
    return false;
  }

  const measurementId = rawId.trim().toUpperCase();

  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag !== 'function') {
    // PENTING: gtag.js mewajibkan `arguments` object, bukan Array rest (...args).
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }

  if (!document.getElementById(SCRIPT_ELEMENT_ID)) {
    const script = document.createElement('script');
    script.id = SCRIPT_ELEMENT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    ...(debugMode ? { debug_mode: true } : {}),
  });

  gaEnabled = true;
  return true;
}

/**
 * Mengirim custom product event langsung ke Google Analytics 4 via gtag().
 */
export function trackEvent<K extends keyof AnalyticsEventMap>(
  eventName: K,
  params: AnalyticsEventMap[K]
): void {
  if (!gaEnabled || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  const cleanParams: Record<string, GtagParamValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleanParams[key] = value;
    }
  }

  window.gtag('event', eventName, cleanParams);
}

/** Helper internal untuk pengujian unit */
export function __resetAnalyticsForTest(): void {
  gaEnabled = false;
}
