import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { Database, ExternalLink } from 'lucide-react';

interface DataSourcesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SourceEntry {
  title: string;
  badge: string;
  badgeColor: 'primary' | 'success' | 'warning' | 'secondary';
  organization: string;
  note?: string;
  url?: string;
  urlLabel?: string;
}

const DATA_SOURCES: SourceEntry[] = [
  {
    title: 'Trans Metro Bandung (TMB Koridor 1–5 & Feeder 1–2)',
    badge: 'Rute, Tarif & Jadwal',
    badgeColor: 'primary',
    organization: 'BLUD UPTD Angkutan Dinas Perhubungan Kota Bandung',
    note: 'Time Table resmi keberangkatan bus & layanan pelacakan live BEMO.',
    url: 'https://uptangkutan-bandung.id/news/trans-metro-bandung',
    urlLabel: 'uptangkutan-bandung.id',
  },
  {
    title: 'Metro Jabar Trans (MJT Koridor 1–6 & Angkot Feeder FD1–FD2)',
    badge: 'Rute, Tarif & Jam Operasional',
    badgeColor: 'primary',
    organization: 'Dinas Perhubungan Provinsi Jawa Barat',
    note: 'Informasi koridor bus & angkot feeder (FD1–FD2), tarif resmi, integrasi gratis ≤120 menit, dan pemantauan armada MJT.',
    url: 'https://mjt.trans.my.id',
    urlLabel: 'mjt.trans.my.id',
  },
  {
    title: '40 Jalur & Perkiraan Tarif Angkot Bandung',
    badge: 'Peta & Tarif',
    badgeColor: 'warning',
    organization: 'Forum Diskusi Transportasi Bandung (Transport for Bandung) & Dishub Kota Bandung',
    note: 'Peta Angkutan Kota Bandung (Juni 2023 · Lisensi CC BY-NC) & panduan perkiraan tarif angkot berbasis jarak tempuh.',
    url: 'https://transportforbandung.org/peta/angkot',
    urlLabel: 'transportforbandung.org/peta/angkot',
  },
  {
    title: 'Acuan Estimasi Tarif Ojol Motor & Mobil',
    badge: 'Estimasi',
    badgeColor: 'secondary',
    organization: 'Kementerian Perhubungan RI & Dishub Provinsi Jawa Barat',
    note: 'Acuan tarif Zona I (Roda 2) dan Angkutan Sewa Khusus / ASK Wilayah I Jawa Barat (Roda 4).',
  },
  {
    title: 'Acuan Estimasi Emisi Karbon (CO₂e)',
    badge: 'Estimasi',
    badgeColor: 'success',
    organization: 'UK Government DEFRA / Our World in Data',
    note: 'Standar faktor emisi karbon transportasi per penumpang-kilometer.',
    url: 'https://ourworldindata.org/travel-carbon-footprint',
    urlLabel: 'ourworldindata.org',
  },
  {
    title: 'Prakiraan Cuaca Bandung Raya',
    badge: 'Cuaca Resmi',
    badgeColor: 'primary',
    organization: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
    note: 'API Data Terbuka Prakiraan Cuaca per 3 jam berdasarkan kode wilayah Kemendagri (adm4).',
    url: 'https://data.bmkg.go.id',
    urlLabel: 'data.bmkg.go.id',
  },
];

export function DataSourcesModal({ isOpen, onOpenChange }: DataSourcesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      placement="center"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        wrapper: 'px-4 sm:px-6',
        base: 'mx-0 my-4 max-h-[86vh] rounded-3xl border-2 border-sky-200/80 shadow-[0_8px_0_rgba(0,74,173,0.12)]',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 border-b border-sky-100 pb-3 text-base font-extrabold text-slate-900">
              <Database className="h-4 w-4 text-[#004AAD]" />
              <span>Sumber Data</span>
            </ModalHeader>

            <ModalBody className="gap-3 py-4">
              <p className="text-xs leading-relaxed text-slate-600">
                Informasi rute, jadwal, dan estimasi pada <strong>ManawiBandung</strong> dirujuk
                dari publikasi resmi instansi dan komunitas transportasi berikut:
              </p>

              <div className="flex flex-col gap-2.5">
                {DATA_SOURCES.map((src) => (
                  <div
                    key={src.title}
                    className="rounded-2xl border border-sky-100 bg-[#F4F8FF] p-3.5"
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold leading-snug text-slate-900">
                        {src.title}
                      </h3>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={src.badgeColor}
                        className="h-5 text-[10px] font-bold"
                      >
                        {src.badge}
                      </Chip>
                    </div>
                    <p className="text-xs font-semibold leading-snug text-slate-700">
                      {src.organization}
                    </p>
                    {src.note && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{src.note}</p>
                    )}
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-[#004AAD] hover:underline"
                      >
                        <span>{src.urlLabel ?? src.url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-sky-100">
              <Button
                color="primary"
                radius="full"
                onPress={onClose}
                className="px-5 font-extrabold shadow-[0_3px_0_#002D6B] transition-transform active:translate-y-0.5"
              >
                Tutup
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
