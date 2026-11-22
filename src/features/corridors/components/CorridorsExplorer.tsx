import { useDeferredValue, useMemo } from 'react';
import { Card, CardBody, Chip, Input, Tab, Tabs } from '@heroui/react';
import { Bus, Clock, Search } from 'lucide-react';
import { CORRIDORS, OPERATORS, STOPS } from '@/shared/data/bandungTransit';
import { formatRupiah } from '@/shared/lib/format';
import { MJT_SCHEDULES, TMB_TIMETABLES } from '@/features/routing/schedule';
import { useTransitStore } from '@/features/routing/store';
import type { OperatorFilter } from '@/features/routing/schemas';

interface CorridorsExplorerProps {
  onSelectCorridorMobile: () => void;
}

export function CorridorsExplorer({ onSelectCorridorMobile }: CorridorsExplorerProps) {
  const operatorFilter = useTransitStore((s) => s.operatorFilter);
  const filterCorridorId = useTransitStore((s) => s.filterCorridorId);
  const corridorQuery = useTransitStore((s) => s.corridorQuery);
  const setOperatorFilter = useTransitStore((s) => s.setOperatorFilter);
  const setFilterCorridorId = useTransitStore((s) => s.setFilterCorridorId);
  const setCorridorQuery = useTransitStore((s) => s.setCorridorQuery);

  const deferredQuery = useDeferredValue(corridorQuery);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return CORRIDORS.filter((c) => {
      if (operatorFilter !== 'ALL' && c.operator !== operatorFilter) return false;
      if (!q) return true;
      const stopNames = c.stops.map((id) => STOPS[id]?.name ?? '').join(' ');
      const hay = `${c.code} ${c.name} ${c.officialName ?? ''} ${c.shortDesc} ${c.vehicleColorLabel ?? ''} ${stopNames}`.toLowerCase();
      return hay.includes(q);
    });
  }, [operatorFilter, deferredQuery]);

  return (
    <Card
      shadow="none"
      className="rounded-3xl border-2 border-sky-200/80 bg-white shadow-[0_5px_0_rgba(0,74,173,0.08)]"
    >
      <CardBody className="gap-3.5 p-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">54 Jalur Bandung Raya</h2>
          <p className="text-xs font-medium text-slate-500">
            6 MJT + 7 TMB (5 Koridor &amp; 2 Feeder) + 40 Angkot Dishub/TfB &amp; Lembang.
          </p>
        </div>

        <Input
          aria-label="Cari jalur atau halte"
          placeholder="Cari nomor atau area (mis. 05, TMB 2, Feeder, Ciroyom)..."
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
          <Tab key="MJT" title="MJT (6)" />
          <Tab key="TMB" title="TMB (7)" />
          <Tab key="ANGKOT" title="Angkot (41)" />
        </Tabs>

        <div className="flex max-h-[540px] flex-col gap-3 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-[#F4F8FF] py-8 text-center text-sm font-medium text-slate-600">
              Tidak ada jalur yang cocok dengan kata kunci &ldquo;{corridorQuery}&rdquo;.
            </div>
          ) : (
            filtered.map((c) => {
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
      </CardBody>
    </Card>
  );
}
