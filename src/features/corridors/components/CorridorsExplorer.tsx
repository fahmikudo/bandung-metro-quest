import { useDeferredValue, useMemo, useState } from 'react';
import { Card, CardBody, Chip, Input, Tab, Tabs } from '@heroui/react';
import { Bus, Clock, ExternalLink, MapPin, Search } from 'lucide-react';
import { CORRIDORS, OPERATORS, STOPS } from '@/shared/data/bandungTransit';
import {
  ALL_BRT_PLANNED_ROUTES,
  BRT_FEEDER_ROUTES,
  BRT_MAIN_ROUTES,
  type BrtPlannedRoute,
} from '@/shared/data/brtBandungRaya';
import { formatRupiah } from '@/shared/lib/format';
import { MJT_SCHEDULES, TMB_TIMETABLES } from '@/features/routing/schedule';
import { useTransitStore } from '@/features/routing/store';
import type { OperatorFilter } from '@/features/routing/schemas';

interface CorridorsExplorerProps {
  onSelectCorridorMobile: () => void;
}

type ExplorerMode = 'active' | 'brt_plan';
type BrtSubFilter = 'ALL' | 'BRT' | 'FEEDER';

function getBrtStatusStyle(route: BrtPlannedRoute): {
  color: 'success' | 'warning' | 'default';
  badgeBg: string;
} {
  if (route.status === 'active') {
    return { color: 'success', badgeBg: '#059669' };
  }
  if (route.status === 'partial') {
    return { color: 'warning', badgeBg: '#d97706' };
  }
  return {
    color: 'default',
    badgeBg: route.category === 'BRT' ? '#004AAD' : '#0284c7',
  };
}

export function CorridorsExplorer({ onSelectCorridorMobile }: CorridorsExplorerProps) {
  const [explorerMode, setExplorerMode] = useState<ExplorerMode>('active');
  const [brtSubFilter, setBrtSubFilter] = useState<BrtSubFilter>('ALL');

  const operatorFilter = useTransitStore((s) => s.operatorFilter);
  const filterCorridorId = useTransitStore((s) => s.filterCorridorId);
  const corridorQuery = useTransitStore((s) => s.corridorQuery);
  const setOperatorFilter = useTransitStore((s) => s.setOperatorFilter);
  const setFilterCorridorId = useTransitStore((s) => s.setFilterCorridorId);
  const setCorridorQuery = useTransitStore((s) => s.setCorridorQuery);

  const deferredQuery = useDeferredValue(corridorQuery);

  const filteredActive = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return CORRIDORS.filter((c) => {
      if (operatorFilter !== 'ALL' && c.operator !== operatorFilter) return false;
      if (!q) return true;
      const stopNames = c.stops.map((id) => STOPS[id]?.name ?? '').join(' ');
      const hay = `${c.code} ${c.name} ${c.officialName ?? ''} ${c.shortDesc} ${c.vehicleColorLabel ?? ''} ${stopNames}`.toLowerCase();
      return hay.includes(q);
    });
  }, [operatorFilter, deferredQuery]);

  const filteredBrt = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return ALL_BRT_PLANNED_ROUTES.filter((r) => {
      if (brtSubFilter !== 'ALL' && r.category !== brtSubFilter) return false;
      if (!q) return true;
      const hay = `${r.code} ${r.name} ${r.currentStatusLabel} ${r.note ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [brtSubFilter, deferredQuery]);

  return (
    <Card
      shadow="none"
      className="rounded-3xl border-2 border-sky-200/80 bg-white shadow-[0_5px_0_rgba(0,74,173,0.08)]"
    >
      <CardBody className="gap-3.5 p-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            {explorerMode === 'active'
              ? '56 Jalur Aktif Bandung Raya'
              : '47 Rute BRT & Feeder (Kawal BRT)'}
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {explorerMode === 'active'
              ? '8 MJT (6 Bus & 2 Angkot Feeder FD1–FD2) + 7 TMB (5 Koridor & 2 Feeder) + 40 Angkot Dishub/TfB & Lembang.'
              : 'Daftar 18 rute BRT utama & 29 rute Feeder Cekungan Bandung (termasuk yang belum beroperasi).'}
          </p>
        </div>

        {/* Switcher: Jalur Aktif vs Rencana BRT Cekungan Bandung */}
        <Tabs
          aria-label="Pilih katalog jalur"
          size="sm"
          radius="full"
          fullWidth
          color="primary"
          selectedKey={explorerMode}
          onSelectionChange={(k) => setExplorerMode(k as ExplorerMode)}
          classNames={{
            tabList: 'bg-[#E8F4FF] p-1 border border-sky-200/80',
            tab: 'text-xs font-extrabold',
          }}
        >
          <Tab key="active" title="Beroperasi (56)" />
          <Tab key="brt_plan" title="Rencana BRT (47)" />
        </Tabs>

        <Input
          aria-label="Cari jalur atau halte"
          placeholder={
            explorerMode === 'active'
              ? 'Cari nomor atau area (mis. 33, FD1, TMB 2, Ciroyom)...'
              : 'Cari rute BRT/Feeder (mis. BRT 1, Tegalluar, Ciwidey, FD 12)...'
          }
          size="md"
          variant="bordered"
          radius="full"
          isClearable
          value={corridorQuery}
          onValueChange={setCorridorQuery}
          startContent={<Search className="h-4 w-4 text-[#004AAD]" />}
          classNames={{
            inputWrapper: 'bg-[#F4F8FF] border-sky-200/90 hover:border-[#004AAD]/50',
            input: 'text-sm font-medium',
          }}
        />

        {explorerMode === 'active' ? (
          <>
            <Tabs
              aria-label="Filter operator"
              size="sm"
              radius="full"
              fullWidth
              color="primary"
              selectedKey={operatorFilter}
              onSelectionChange={(k) => setOperatorFilter(k as OperatorFilter)}
              classNames={{
                tabList: 'bg-[#EEF5FF] p-1',
                tab: 'text-xs font-bold',
              }}
            >
              <Tab key="ALL" title="Semua" />
              <Tab key="MJT" title="MJT (8)" />
              <Tab key="TMB" title="TMB (7)" />
              <Tab key="ANGKOT" title="Angkot (41)" />
            </Tabs>

            <div className="flex max-h-[540px] flex-col gap-3 overflow-y-auto pr-1">
              {filteredActive.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-[#F4F8FF] py-8 text-center text-sm font-medium text-slate-600">
                  Tidak ada jalur yang cocok dengan kata kunci &ldquo;{corridorQuery}&rdquo;.
                </div>
              ) : (
                filteredActive.map((c) => {
                  const op = OPERATORS[c.operator];
                  const isActive = filterCorridorId === c.id;
                  const tt = TMB_TIMETABLES[c.id];
                  const mjt = MJT_SCHEDULES[c.id];

                  const fareDesc =
                    op.pricingModel === 'distance'
                      ? 'Tarif jarak ~Rp3.000–Rp18.000 · Tunai'
                      : `Umum ${formatRupiah(op.fareRegular)} / Pelajar ${formatRupiah(op.fareDiscount)} · ${op.cashAccepted ? 'QRIS & Tunai' : 'QRIS/E-Money'}`;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setFilterCorridorId(c.id);
                        onSelectCorridorMobile();
                      }}
                      className={`w-full rounded-2xl border-2 p-3.5 text-left transition-all ${
                        isActive
                          ? 'border-[#004AAD] bg-[#E8F4FF]/70 shadow-[0_4px_0_rgba(0,74,173,0.14)]'
                          : 'border-sky-100 bg-white shadow-[0_2px_0_rgba(0,74,173,0.05)] hover:border-[#004AAD]/45 hover:bg-[#F4F8FF]'
                      }`}
                    >
                      <div className="mb-1.5 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <span
                            className="shrink-0 rounded-md px-2.5 py-0.5 text-xs font-extrabold text-white shadow-2xs"
                            style={{ backgroundColor: c.color }}
                          >
                            {c.code}
                          </span>
                          <span className="text-sm font-extrabold leading-snug text-slate-900">
                            {c.name}
                          </span>
                        </div>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={c.operator === 'ANGKOT' ? 'warning' : 'primary'}
                          className="h-6 shrink-0 text-[11px] font-bold"
                        >
                          {op.shortName}
                        </Chip>
                      </div>

                      {c.officialName && (
                        <p className="mb-1 text-xs italic text-slate-500">
                          Trayek resmi: {c.officialName}
                        </p>
                      )}

                      <p className="text-[13px] leading-relaxed text-slate-700">{c.shortDesc}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
                        {c.vehicleColorLabel && (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                            <Bus className="h-3 w-3" /> {c.vehicleColorLabel}
                          </span>
                        )}
                        <span>{fareDesc}</span>
                        {tt && (
                          <span className="inline-flex items-center gap-1 font-bold text-[#004AAD]">
                            <Clock className="h-3 w-3" /> {tt.forward[0]}–
                            {tt.forward[tt.forward.length - 1]} WIB ({tt.fleetNote})
                          </span>
                        )}
                        {mjt && (
                          <span className="inline-flex items-center gap-1 font-bold text-[#004AAD]">
                            <Clock className="h-3 w-3" /> {mjt.first}–{mjt.last} WIB (tiap{' '}
                            {mjt.headwayRange})
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            <Tabs
              aria-label="Filter kategori rencana BRT"
              size="sm"
              radius="full"
              fullWidth
              color="primary"
              selectedKey={brtSubFilter}
              onSelectionChange={(k) => setBrtSubFilter(k as BrtSubFilter)}
              classNames={{
                tabList: 'bg-[#EEF5FF] p-1',
                tab: 'text-xs font-bold',
              }}
            >
              <Tab key="ALL" title={`Semua (${ALL_BRT_PLANNED_ROUTES.length})`} />
              <Tab key="BRT" title={`BRT Utama (${BRT_MAIN_ROUTES.length})`} />
              <Tab key="FEEDER" title={`Feeder (${BRT_FEEDER_ROUTES.length})`} />
            </Tabs>

            <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-100 bg-[#F4F8FF] px-3 py-2 text-[11px] font-semibold text-slate-600">
              <span>Rute berstatus MJT dapat diketuk untuk melihat jalurnya di peta.</span>
              <a
                href="https://kawalbrt.transportforbandung.org/#Rute"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 font-extrabold text-[#004AAD] hover:underline"
              >
                <span>Kawal BRT</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex max-h-[500px] flex-col gap-2.5 overflow-y-auto pr-1">
              {filteredBrt.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-[#F4F8FF] py-8 text-center text-sm font-medium text-slate-600">
                  Tidak ada rute rencana BRT yang cocok dengan &ldquo;{corridorQuery}&rdquo;.
                </div>
              ) : (
                filteredBrt.map((r) => {
                  const style = getBrtStatusStyle(r);
                  const canHighlightOnMap = Boolean(r.activeMjtCorridorId);
                  const isHighlighted =
                    canHighlightOnMap && filterCorridorId === r.activeMjtCorridorId;

                  const cardClasses = `w-full rounded-2xl border-2 p-3.5 text-left transition-all ${
                    isHighlighted
                      ? 'border-[#004AAD] bg-[#E8F4FF]/70 shadow-[0_4px_0_rgba(0,74,173,0.14)]'
                      : canHighlightOnMap
                        ? 'border-sky-100 bg-white shadow-[0_2px_0_rgba(0,74,173,0.05)] hover:border-[#004AAD]/45 hover:bg-[#F4F8FF] cursor-pointer'
                        : 'border-slate-100 bg-slate-50/70'
                  }`;

                  const inner = (
                    <>
                      <div className="mb-1.5 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <span
                            className="shrink-0 rounded-md px-2.5 py-0.5 text-xs font-extrabold text-white shadow-2xs"
                            style={{ backgroundColor: style.badgeBg }}
                          >
                            {r.code}
                          </span>
                          <span className="text-sm font-extrabold leading-snug text-slate-900">
                            {r.name}
                          </span>
                        </div>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={style.color}
                          className="h-6 shrink-0 text-[11px] font-bold"
                        >
                          {r.currentStatusLabel}
                        </Chip>
                      </div>

                      {r.note && (
                        <p className="text-[13px] leading-relaxed text-slate-700">{r.note}</p>
                      )}

                      {canHighlightOnMap && (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#004AAD]">
                          <MapPin className="h-3 w-3" />
                          <span>Ketuk untuk lihat jalur aktif {r.currentStatusLabel} di peta</span>
                        </p>
                      )}
                    </>
                  );

                  if (canHighlightOnMap && r.activeMjtCorridorId) {
                    const targetId = r.activeMjtCorridorId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setFilterCorridorId(targetId);
                          onSelectCorridorMobile();
                        }}
                        className={cardClasses}
                      >
                        {inner}
                      </button>
                    );
                  }

                  return (
                    <div key={r.id} className={cardClasses}>
                      {inner}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
