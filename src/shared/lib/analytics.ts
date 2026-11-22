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
const SCRIPT_ELEMENT_ID = 'manawibandung-ga4-script';

let directGaEnabled = false;
let gtmEnabled = false;

export function isValidGaMeasurementId(id?: string | null): id is string {
  if (!id) return false;
  return GA4_ID_PATTERN.test(id.trim());
}

function detectGtmInstalled(): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;
  if (typeof document.querySelector === 'function') {
    if (document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
      return true;
    }
  }
  return Array.isArray(window.dataLayer) && window.dataLayer.some(
    (item) => typeof item === 'object' && item !== null && 'gtm.start' in item
  );
}

/**
 * Menginisialisasi analytics:
 * 1. Mendeteksi Google Tag Manager (GTM) yang terpasang di index.html agar seluruh
 *    product event otomatis dikirim ke `window.dataLayer` (siap ditangkap trigger GTM).
 * 2. Opsional: jika VITE_GA_MEASUREMENT_ID (G-...) juga diisi, memuat gtag.js langsung.
 */
export function initAnalytics(options?: {
  measurementId?: string;
  isDev?: boolean;
  debug?: boolean;
  gtmPresent?: boolean;
}): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  gtmEnabled = options?.gtmPresent ?? detectGtmInstalled();

  const rawId = options?.measurementId ?? import.meta.env.VITE_GA_MEASUREMENT_ID;
  const isDev = options?.isDev ?? import.meta.env.DEV;
  const debugMode = options?.debug ?? import.meta.env.VITE_GA_DEBUG === 'true';

  if (!isValidGaMeasurementId(rawId) || (isDev && !debugMode)) {
    directGaEnabled = false;
    return gtmEnabled;
  }

  const measurementId = rawId.trim().toUpperCase();

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: GtagCommand) {
      window.dataLayer?.push(args);
    };

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

  directGaEnabled = true;
  return true;
}

/**
 * Mengirim custom product event ke GTM dataLayer dan/atau GA4 gtag.
 */
export function trackEvent<K extends keyof AnalyticsEventMap>(
  eventName: K,
  params: AnalyticsEventMap[K]
): void {
  if (typeof window === 'undefined') return;

  const cleanParams: Record<string, GtagParamValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleanParams[key] = value;
    }
  }

  // Format standar Google Tag Manager (object push dengan key `event`)
  if (gtmEnabled) {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: eventName,
      ...cleanParams,
    });
  }

  // Format langsung GA4 (aktif jika VITE_GA_MEASUREMENT_ID diisi)
  if (directGaEnabled && typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanParams);
  }
}

/** Helper internal untuk pengujian unit */
export function __resetAnalyticsForTest(): void {
  directGaEnabled = false;
  gtmEnabled = false;
}
