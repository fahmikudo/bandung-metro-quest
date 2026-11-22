/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_BMKG_API_BASE?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_GA_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
