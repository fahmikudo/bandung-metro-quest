import { useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { MapPinOff } from 'lucide-react';
import { trackEvent } from '@/shared/lib/analytics';
import { RouteSearchSchema } from '../schemas';
import { useTransitStore } from '../store';
import { RouteResultCard } from './RouteResultCard';
import { RouteDetailModal } from './RouteDetailModal';

interface RouteResultsListProps {
  onRequestScrollToMap: () => void;
}

export function RouteResultsList({ onRequestScrollToMap }: RouteResultsListProps) {
  const fromId = useTransitStore((s) => s.fromId);
  const toId = useTransitStore((s) => s.toId);
  const modeFilter = useTransitStore((s) => s.modeFilter);
  const passengerType = useTransitStore((s) => s.passengerType);
  const trafficMode = useTransitStore((s) => s.trafficMode);
  const departureTime = useTransitStore((s) => s.departureTime);
  const compareMode = useTransitStore((s) => s.compareMode);
  const routes = useTransitStore((s) => s.routes);
  const selectedRouteIndex = useTransitStore((s) => s.selectedRouteIndex);

  const setSelectedRouteIndex = useTransitStore((s) => s.setSelectedRouteIndex);
  const setModeFilter = useTransitStore((s) => s.setModeFilter);
  const triggerSimulation = useTransitStore((s) => s.triggerSimulation);

  const [detailRouteIndex, setDetailRouteIndex] = useState<number | null>(null);

  const validation = RouteSearchSchema.safeParse({
    fromId,
    toId,
    modeFilter,
    passengerType,
    trafficMode,
    departureTime,
  });

  if (!validation.success) {
    return (
      <Card shadow="none" className="rounded-3xl border-2 border-dashed border-sky-200 bg-white">
        <CardBody className="items-center gap-2 py-8 text-center">
          <MapPinOff className="h-7 w-7 text-sky-400" />
          <p className="text-sm font-semibold text-slate-700">
            {validation.error.issues[0]?.message ?? 'Pilih lokasi berangkat dan tujuan berbeda.'}
          </p>
        </CardBody>
      </Card>
    );
  }

  if (routes.length === 0) {
    return (
      <Card shadow="none" className="rounded-3xl border-2 border-dashed border-sky-200 bg-white">
        <CardBody className="items-center gap-3 py-8 text-center">
          <MapPinOff className="h-7 w-7 text-sky-400" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              Belum ada koneksi langsung pada moda ini
            </p>
            <p className="text-xs text-slate-500">
              Coba tampilkan kombinasi Bus + Angkot agar semua titik Bandung Raya terhubung.
            </p>
          </div>
          {modeFilter !== 'all' && (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              radius="full"
              onPress={() => setModeFilter('all')}
              className="bg-[#E8F4FF] px-4 font-extrabold text-[#004AAD] shadow-[0_3px_0_#bfdbfe]"
            >
              Tampilkan Semua Moda
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  const detailRoute = detailRouteIndex !== null ? (routes[detailRouteIndex] ?? null) : null;

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {routes.length} Pilihan Rute
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Ketuk kartu untuk peta · Detail untuk info lengkap
          </span>
        </div>

        {routes.map((route, idx) => (
          <RouteResultCard
            key={route.id}
            route={route}
            isSelected={idx === selectedRouteIndex}
            onSelect={() => setSelectedRouteIndex(idx)}
            onOpenDetail={() => {
              setSelectedRouteIndex(idx);
              setDetailRouteIndex(idx);
              trackEvent('route_detail_opened', {
                corridors: route.legs.map((l) => l.corridorCode).join(' -> '),
                transfers: route.transfers,
                total_fare: route.totalFare,
                compare_mode: compareMode,
              });
            }}
            onSimulate={() => {
              trackEvent('route_simulation_started', {
                corridors: route.legs.map((l) => l.corridorCode).join(' -> '),
                transfers: route.transfers,
                trigger_source: 'card',
              });
              triggerSimulation(idx);
              onRequestScrollToMap();
            }}
          />
        ))}
      </div>

      <RouteDetailModal
        route={detailRoute}
        isOpen={detailRoute !== null}
        onOpenChange={(open) => {
          if (!open) setDetailRouteIndex(null);
        }}
        onSimulate={() => {
          if (detailRouteIndex !== null) {
            triggerSimulation(detailRouteIndex);
            onRequestScrollToMap();
          }
        }}
      />
    </>
  );
}
