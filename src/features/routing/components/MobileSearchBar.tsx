import { useState } from 'react';
import { Button, Card, CardBody, Chip, Tab, Tabs } from '@heroui/react';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { POPULAR_TRIPS } from '@/shared/data/bandungTransit';
import { useTransitStore } from '../store';
import type { ModeFilter, PassengerType, TrafficMode } from '../schemas';
import { StopAutocomplete } from './RouteSearchCard';

const MODE_SHORT_LABELS: Record<ModeFilter, string> = {
  all: 'Semua',
  bus: 'Bus',
  angkot: 'Angkot',
};

/**
 * Pencarian rute mobile inline (tanpa Modal Pop-up):
 * - Input Asal (A), Tujuan (B), dan tombol Tukar langsung di layar -> 1 tap langsung update peta & kartu rute.
 * - Filter lanjutan (Moda, Pelajar, Macet, Jam WIB) terlipat rapi 1-tap agar peta tetap luas terlihat.
 */
export function MobileSearchBar() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fromId = useTransitStore((s) => s.fromId);
  const toId = useTransitStore((s) => s.toId);
  const modeFilter = useTransitStore((s) => s.modeFilter);
  const passengerType = useTransitStore((s) => s.passengerType);
  const trafficMode = useTransitStore((s) => s.trafficMode);
  const departureTime = useTransitStore((s) => s.departureTime);

  const setFromId = useTransitStore((s) => s.setFromId);
  const setToId = useTransitStore((s) => s.setToId);
  const swapStops = useTransitStore((s) => s.swapStops);
  const applyPreset = useTransitStore((s) => s.applyPreset);
  const setModeFilter = useTransitStore((s) => s.setModeFilter);
  const setPassengerType = useTransitStore((s) => s.setPassengerType);
  const setTrafficMode = useTransitStore((s) => s.setTrafficMode);
  const setDepartureTime = useTransitStore((s) => s.setDepartureTime);
  const resetDepartureTimeToNow = useTransitStore((s) => s.resetDepartureTimeToNow);

  const hasCustomFilter =
    modeFilter !== 'all' || passengerType !== 'regular' || trafficMode !== 'normal';

  const filterSummary = [
    MODE_SHORT_LABELS[modeFilter],
    passengerType === 'discount' ? 'Pelajar' : null,
    trafficMode === 'rush' ? 'Macet' : null,
    `${departureTime}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card
      shadow="none"
      className="w-full rounded-3xl border-2 border-sky-200/80 bg-white shadow-[0_5px_0_rgba(0,74,173,0.08)]"
    >
      <CardBody className="gap-2.5 p-3">
        {/* Baris Utama: Input A & B Langsung + Tombol Tukar */}
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <StopAutocomplete
              compact
              label="Berangkat dari"
              placeholder="Berangkat dari mana?"
              pinLabel="A"
              pinColorClass="bg-[#004AAD]"
              selectedId={fromId}
              onSelect={setFromId}
            />
            <StopAutocomplete
              compact
              label="Tujuan ke"
              placeholder="Mau ke mana di Bandung?"
              pinLabel="B"
              pinColorClass="bg-rose-500"
              selectedId={toId}
              onSelect={setToId}
            />
          </div>

          <Button
            isIconOnly
            size="md"
            variant="flat"
            color="primary"
            radius="full"
            aria-label="Tukar lokasi berangkat dan tujuan"
            onPress={swapStops}
            className="h-10 w-10 min-w-10 shrink-0 border border-sky-200 bg-[#E8F4FF] text-[#004AAD] shadow-[0_3px_0_#bfdbfe] transition-transform hover:bg-sky-100 active:translate-y-0.5"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Baris 2: Tombol Filter 1-Tap + Chip Rute Populer */}
        <div className="flex items-center gap-2 pt-0.5">
          <Button
            size="sm"
            radius="full"
            variant={filtersOpen || hasCustomFilter ? 'solid' : 'flat'}
            color="primary"
            onPress={() => setFiltersOpen((prev) => !prev)}
            startContent={<SlidersHorizontal className="h-3.5 w-3.5" />}
            endContent={
              filtersOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )
            }
            className={`h-8 shrink-0 px-3 text-xs font-extrabold tabular-nums transition-transform active:translate-y-0.5 ${
              filtersOpen || hasCustomFilter
                ? 'shadow-[0_2px_0_#002D6B]'
                : 'bg-[#E8F4FF] text-[#004AAD] shadow-[0_2px_0_#bfdbfe]'
            }`}
          >
            {filterSummary}
          </Button>

          <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
            {POPULAR_TRIPS.map((trip) => (
              <Chip
                key={trip.label}
                size="sm"
                variant="flat"
                color="default"
                className="h-7 shrink-0 cursor-pointer border border-sky-200/80 bg-[#F4F8FF] text-[11px] font-bold text-slate-700 transition-colors hover:border-[#004AAD]/40 hover:bg-[#E8F4FF] hover:text-[#004AAD]"
                onClick={() => applyPreset(trip.from, trip.to)}
              >
                {trip.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Panel Filter Lanjutan (Terlipat Inline, Tanpa Modal) */}
        {filtersOpen && (
          <div className="flex flex-col gap-2 border-t border-sky-100 pt-2.5">
            <Tabs
              aria-label="Pilihan moda transportasi"
              size="sm"
              radius="full"
              fullWidth
              color="primary"
              selectedKey={modeFilter}
              onSelectionChange={(key) => setModeFilter(key as ModeFilter)}
              classNames={{
                tabList: 'bg-[#EEF5FF] p-1',
                tab: 'font-bold text-xs',
              }}
            >
              <Tab key="all" title="Semua Moda" />
              <Tab key="bus" title="Bus (MJT/TMB)" />
              <Tab key="angkot" title="Angkot Saja" />
            </Tabs>

            <div className="grid grid-cols-2 gap-2">
              <Tabs
                aria-label="Kategori tarif"
                size="sm"
                radius="full"
                fullWidth
                color="primary"
                selectedKey={passengerType}
                onSelectionChange={(key) => setPassengerType(key as PassengerType)}
                classNames={{
                  tabList: 'bg-[#EEF5FF] p-1',
                  tab: 'font-bold text-xs',
                }}
              >
                <Tab key="regular" title="Umum" />
                <Tab key="discount" title="Pelajar" />
              </Tabs>

              <Tabs
                aria-label="Kondisi lalu lintas"
                size="sm"
                radius="full"
                fullWidth
                color="primary"
                selectedKey={trafficMode}
                onSelectionChange={(key) => setTrafficMode(key as TrafficMode)}
                classNames={{
                  tabList: 'bg-[#EEF5FF] p-1',
                  tab: 'font-bold text-xs',
                }}
              >
                <Tab key="normal" title="Normal" />
                <Tab key="rush" title="Macet" />
              </Tabs>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-200/80 bg-[#F4F8FF] px-3 py-2">
              <label
                htmlFor="mobile-wib-departure-input"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
              >
                <Clock className="h-3.5 w-3.5 text-[#004AAD]" />
                <span>Jam Berangkat (WIB)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="mobile-wib-departure-input"
                  type="time"
                  value={departureTime}
                  onChange={(e) => {
                    if (e.target.value) setDepartureTime(e.target.value);
                  }}
                  className="rounded-xl border border-sky-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-900 outline-none focus:border-[#004AAD]"
                />
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  radius="full"
                  onPress={resetDepartureTimeToNow}
                  startContent={<RotateCcw className="h-3 w-3" />}
                  className="h-7 min-w-0 bg-[#E8F4FF] px-3 text-[11px] font-extrabold text-[#004AAD]"
                >
                  Sekarang
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
