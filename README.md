# 🚇 ManawiBandung — *bade kamana manawi?*

Aplikasi web *mobile-first* untuk mengecek rute, jadwal keberangkatan resmi, estimasi biaya, waktu tempuh, dan simulasi perjalanan transportasi umum Bandung Raya (**Metro Jabar Trans / MJT**, **Trans Metro Bandung / TMB + Feeder**, serta **40 Angkot resmi Dishub Kota Bandung & Transport for Bandung**).

## Tech Stack
- **React 19 + TypeScript + Vite**
- **HeroUI** (`@heroui/react`) + **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Zustand** untuk manajemen state terpusat
- **Zod** untuk validasi skema pencarian rute & laporan warga
- **Lucide React** untuk ikonografi bersih & konsisten
- **Vitest** untuk pengujian unit

## Fitur Utama
1. **54 Jalur & 66 Titik Bandung Raya** — 6 Koridor MJT, 7 Jalur TMB (Koridor 1–5 + Feeder 1 & 2), 40 Angkot resmi peta Dishub/TfB (Juni 2023), dan trayek wisata Lembang.
2. **Pencarian Halte *Autocomplete* Ramah HP** — ketik nama halte, kampus, atau area langsung tanpa gulir panjang.
3. **Jadwal Keberangkatan Real-Time (WIB)** — *Time Table* resmi 7 halaman PDF TMB + jam operasional MJT (`K1–K6`), otomatis mendeteksi koridor yang sudah lewat bus terakhirnya, plus tombol pintas ke *live tracker* **BEMO** & **MJT**.
4. **Perbandingan *Apples-to-Apples*** — *Umum vs Ojol Motor* (Zona I Kemenhub) dan *Umum vs Ojol Mobil* (ASK Wilayah I Jabar), lengkap dengan estimasi penghematan karbon berbasis standar **UK DEFRA / Our World in Data**.
5. **Peta Interaktif *Auto-Zoom* + Simulasi Perjalanan** — otomatis men-zoom ke rute pilihan agar jelas di layar HP dengan animasi pergerakan kendaraan antar halte.

## Perintah Pengembangan
```bash
npm install
npm run dev      # Jalankan dev server lokal
npm test         # Jalankan pengujian Vitest
npm run build    # Typecheck + production build ke dist/
```

## Deploy ke Server (Docker)
```bash
docker build -t manawi-bandung .
docker run -d -p 8080:80 --name manawi-bandung manawi-bandung
```
