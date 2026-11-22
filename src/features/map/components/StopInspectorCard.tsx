import { Button, Card, CardBody, Chip } from '@heroui/react';
import { Coffee, MapPin, X } from 'lucide-react';
import { STOPS } from '@/shared/data/bandungTransit';
import { trackEvent } from '@/shared/lib/analytics';
import { getCorridorsForStop } from '@/features/routing/router';
import { useTransitStore } from '@/features/routing/store';

export function StopInspectorCard() {
  const selectedStopId = useTransitStore((s) => s.selectedStopId);
  const setSelectedStopId = useTransitStore((s) => s.setSelectedStopId);
  const setFromId = useTransitStore((s) => s.setFromId);
  const setToId = useTransitStore((s) => s.setToId);

  if (!selectedStopId || !STOPS[selectedStopId]) return null;

  const stop = STOPS[selectedStopId];
  const corridors = getCorridorsForStop(selectedStopId);

  return (
    <Card
      shadow="none"
      className="rounded-3xl border-2 border-sky-200 bg-white/95 shadow-[0_6px_0_rgba(0,74,173,0.12)] backdrop-blur-md sm:absolute sm:bottom-3.5 sm:left-3.5 sm:z-20 sm:w-80"
    >
      <CardBody className="gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">{stop.name}</h3>
            <p className="text-xs font-bold text-[#004AAD]">{stop.area}</p>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            radius="full"
            aria-label="Tutup detail halte"
            onPress={() => setSelectedStopId(null)}
            className="h-7 w-7 min-w-7 bg-sky-50 text-slate-500 hover:text-[#004AAD]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1.5 rounded-2xl bg-[#F4F8FF] p-2.5 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#004AAD]" />
            <span>
              <strong className="text-slate-800">Sekitar:</strong> {stop.landmark}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <Coffee className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>
              <strong className="text-slate-800">Kuliner:</strong> {stop.nearbySpot}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {corridors.slice(0, 8).map((c) => (
            <span
              key={c.id}
              className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white shadow-2xs"
              style={{ backgroundColor: c.color }}
            >
              {c.code}
            </span>
          ))}
          {corridors.length > 8 && (
            <Chip size="sm" variant="flat" className="h-4 text-[10px] font-bold">
              +{corridors.length - 8} lagi
            </Chip>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            radius="full"
            onPress={() => {
              trackEvent('map_stop_inspected', {
                stop_id: stop.id,
                stop_name: stop.name,
                action: 'set_from',
              });
              setFromId(stop.id);
            }}
            className="h-9 bg-[#E8F4FF] font-extrabold text-[#004AAD] shadow-[0_3px_0_#bfdbfe] transition-transform active:translate-y-0.5"
          >
            Jadikan Asal (A)
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="primary"
            radius="full"
            onPress={() => {
              trackEvent('map_stop_inspected', {
                stop_id: stop.id,
                stop_name: stop.name,
                action: 'set_to',
              });
              setToId(stop.id);
            }}
            className="h-9 font-extrabold shadow-[0_3px_0_#002D6B] transition-transform active:translate-y-0.5"
          >
            Jadikan Tujuan (B)
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
