import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  Chip,
  Tab,
  Tabs,
} from '@heroui/react';
import { ArrowUpDown, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { POPULAR_TRIPS, SORTED_STOPS, STOPS } from '@/shared/data/bandungTransit';
import { useTransitStore } from '../store';
import type { ModeFilter, PassengerType, TrafficMode } from '../schemas';

interface StopAutocompleteProps {
  label: string;
  placeholder: string;
  pinLabel: 'A' | 'B';
  pinColorClass: string;
  selectedId: string;
  onSelect: (stopId: string) => void;
}

function StopAutocomplete({
  label,
  placeholder,
  pinLabel,
  pinColorClass,
  selectedId,
  onSelect,
}: StopAutocompleteProps) {
  const selectedName = STOPS[selectedId]?.name ?? '';
  const [inputValue, setInputValue] = useState(selectedName);

  // Sinkronkan teks input ketika pilihan berubah dari tombol Tukar, preset Populer, atau klik peta
  useEffect(() => {
    setInputValue(STOPS[selectedId]?.name ?? '');
  }, [selectedId]);

  const filteredStops = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    // Jika input kosong atau masih sama dengan nama halte terpilih, tampilkan semua halte
    if (!q || q === selectedName.toLowerCase()) {
      return SORTED_STOPS;
    }
    return SORTED_STOPS.filter((stop) =>
      `${stop.name} ${stop.area} ${stop.landmark}`.toLowerCase().includes(q)
    );
  }, [inputValue, selectedName]);

  return (
    <Autocomplete
      aria-label={label}
      label={label}
      labelPlacement="outside"
      placeholder={placeholder}
      size="md"
      variant="bordered"
      radius="lg"
      isVirtualized={false}
      items={filteredStops}
      selectedKey={selectedId}
      inputValue={inputValue}
      isClearable
      onInputChange={setInputValue}
      onSelectionChange={(key) => {
        if (typeof key === 'string' && key && STOPS[key]) {
          onSelect(key);
          setInputValue(STOPS[key].name);
        }
      }}
      onBlur={() => {
        // Kembalikan ke nama halte terpilih jika user menutup tanpa memilih
        setInputValue(STOPS[selectedId]?.name ?? '');
      }}
      startContent={
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white ${pinColorClass}`}
        >
          {pinLabel}
        </span>
      }
      classNames={{
        base: 'w-full',
        listboxWrapper: 'max-h-80',
      }}
      inputProps={{
        classNames: {
          label: 'text-sm font-bold text-slate-700 pb-1.5',
          inputWrapper:
            'h-12 bg-[#F4F8FF] border-sky-200 hover:border-[#004AAD]/50 group-data-[focus=true]:border-[#004AAD] group-data-[focus=true]:bg-white shadow-none',
          input: 'text-[15px] font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400',
        },
      }}
      popoverProps={{
        offset: 8,
        classNames: {
          content: 'p-1.5 border-2 border-sky-200 shadow-2xl rounded-2xl bg-[#F4F8FF]',
        },
      }}
      listboxProps={{
        emptyContent: 'Halte atau lokasi tidak ditemukan.',
        classNames: {
          list: 'gap-2 p-1.5',
        },
        itemClasses: {
          base: '!py-3.5 !px-3.5 min-h-[60px] rounded-2xl border border-sky-100 bg-white shadow-2xs transition-colors data-[hover=true]:bg-[#E8F4FF] data-[hover=true]:border-sky-300 data-[selectable=true]:focus:bg-[#E8F4FF]',
          wrapper: 'gap-1',
          title: '!text-[15px] !font-bold text-slate-900 leading-snug',
          description: '!text-[13px] text-slate-600 leading-relaxed whitespace-normal',
        },
      }}
    >
      {(stop) => (
        <AutocompleteItem
          key={stop.id}
          textValue={stop.name}
          description={`${stop.area} · ${stop.landmark}`}
        >
          {stop.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}

interface RouteSearchCardProps {
  embedded?: boolean;
  onPresetPicked?: () => void;
}

export function RouteSearchCard({ embedded = false, onPresetPicked }: RouteSearchCardProps = {}) {
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

  const content = (
    <div className={embedded ? 'flex flex-col gap-4' : 'flex flex-col gap-4 p-4'}>
        {/* Searchable Origin & Destination + Dedicated Swap Column (ala Google Maps) */}
        <div className="flex items-end gap-2.5">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <StopAutocomplete
              label="Berangkat dari"
              placeholder="Ketik halte, kampus, atau area..."
              pinLabel="A"
              pinColorClass="bg-[#004AAD]"
              selectedId={fromId}
              onSelect={setFromId}
            />
            <StopAutocomplete
              label="Tujuan ke"
              placeholder="Mau pergi ke mana di Bandung?"
              pinLabel="B"
              pinColorClass="bg-rose-500"
              selectedId={toId}
              onSelect={setToId}
            />
          </div>

          <div className="flex flex-col justify-center self-stretch pt-6">
            <Button
              isIconOnly
              size="md"
              variant="flat"
              color="primary"
              radius="full"
              aria-label="Tukar lokasi berangkat dan tujuan"
              onPress={swapStops}
              className="h-10 w-10 min-w-10 border border-sky-200 bg-[#E8F4FF] text-[#004AAD] shadow-[0_3px_0_#bfdbfe] transition-transform hover:bg-sky-100 active:translate-y-0.5"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mode, Fare & Traffic Filters */}
        <div className="flex flex-col gap-2">
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

          {/* Jam Berangkat WIB */}
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-200/80 bg-[#F4F8FF] px-3 py-2">
            <label
              htmlFor="wib-departure-input"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
            >
              <Clock className="h-3.5 w-3.5 text-[#004AAD]" />
              <span>Jam Berangkat (WIB)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="wib-departure-input"
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

        {/* Rute Populer Horizontal Scroll */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-extrabold text-amber-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Populer
          </span>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
            {POPULAR_TRIPS.map((trip) => (
              <Chip
                key={trip.label}
                size="sm"
                variant="flat"
                color="default"
                className="shrink-0 cursor-pointer border border-sky-200/80 bg-[#F4F8FF] text-[11px] font-bold text-slate-700 transition-colors hover:border-[#004AAD]/40 hover:bg-[#E8F4FF] hover:text-[#004AAD]"
                onClick={() => {
                  applyPreset(trip.from, trip.to);
                  onPresetPicked?.();
                }}
              >
                {trip.label}
              </Chip>
            ))}
          </div>
        </div>
    </div>
  );

  if (embedded) return content;

  return (
    <Card
      shadow="none"
      className="rounded-3xl border-2 border-sky-200/80 bg-white shadow-[0_5px_0_rgba(0,74,173,0.08)]"
    >
      <CardBody className="p-0">{content}</CardBody>
    </Card>
  );
}
