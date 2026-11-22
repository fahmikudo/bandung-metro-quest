import { useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { MapPinOff } from 'lucide-react';
import { formatRupiah } from '@/shared/lib/format';
import { trackEvent } from '@/shared/lib/analytics';
import { RouteSearchSchema } from '../schemas';
import { useTransitStore } from '../store';
import { RouteResultCard } from './RouteResultCard';
import { RouteDetailModal } from './RouteDetailModal';

interface MobileRouteCarouselProps {
  onRequestScrollToMap: () => void;
}

export function MobileRouteCarousel({ onRequestScrollToMap }: MobileRouteCarouselProps) {
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validation = RouteSearchSchema.safeParse({
    fromId,
    toId,
    modeFilter,
    passengerType,
    trafficMode,
    departureTime,
  });

  // Geser carousel secara halus saat selectedRouteIndex berubah lewat klik pill
  const scrollToCard = (idx: number) => {
    const container = scrollerRef.current;
    if (!container) return;
    const child = container.children[idx] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Reset posisi geser ke kartu pertama saat hasil pencarian berubah
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [fromId, toId, modeFilter, departureTime]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // Deteksi kartu yang sedang di tengah saat user menggeser horizontal -> peta di atas langsung berubah!
  const handleHorizontalScroll = () => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const container = scrollerRef.current;
      if (!container || routes.length === 0) return;

      const centerX = container.scrollLeft + container.clientWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;

      for (let i = 0; i < container.children.length; i++) {
        const child = container.children[i] as HTMLElement;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const diff = Math.abs(childCenter - centerX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      if (closestIdx !== selectedRouteIndex && routes[closestIdx]) {
        setSelectedRouteIndex(closestIdx);
      }
    }, 90);
  };

  if (!validation.success) {
    return (
      <Card shadow="none" className="rounded-3xl border-2 border-dashed border-sky-200 bg-white">
        <CardBody className="items-center gap-2 py-6 text-center">
          <MapPinOff className="h-6 w-6 text-sky-400" />
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
        <CardBody className="items-center gap-2.5 py-6 text-center">
          <MapPinOff className="h-6 w-6 text-sky-400" />
          <p className="text-sm font-bold text-slate-800">
            Belum ada koneksi langsung pada moda ini
          </p>
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
        {/* Tappable Option Switcher (mudah untuk usia 60+ & sinkron dengan swipe) */}
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto py-1">
            {routes.map((r, idx) => {
              const active = idx === selectedRouteIndex;
              return (
                <Button
                  key={r.id}
                  size="sm"
                  radius="full"
                  color={active ? 'primary' : 'default'}
                  variant={active ? 'solid' : 'flat'}
                  onPress={() => {
                    setSelectedRouteIndex(idx);
                    scrollToCard(idx);
                  }}
                  className={`h-8 shrink-0 px-3.5 text-xs font-extrabold tabular-nums transition-transform active:translate-y-0.5 ${
                    active
                      ? 'shadow-[0_3px_0_#002D6B]'
                      : 'border border-sky-200 bg-white text-slate-700 shadow-[0_2px_0_#cbd5e1]'
                  }`}
                >
                  Opsi {idx + 1} · {r.usesAngkot ? '~' : ''}
                  {formatRupiah(r.totalFare)}
                </Button>
              );
            })}
          </div>
          <span className="shrink-0 text-[11px] font-bold text-slate-400">
            Geser ⇄
          </span>
        </div>

        {/* Horizontal Swipeable Cards Carousel (tinggi kartu konsisten & sejajar) */}
        <div
          ref={scrollerRef}
          onScroll={handleHorizontalScroll}
          className="no-scrollbar -mx-3 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-3 pb-1.5"
        >
          {routes.map((route, idx) => (
            <div key={route.id} className="flex w-[88vw] max-w-[400px] shrink-0 snap-center">
              <RouteResultCard
                route={route}
                isSelected={idx === selectedRouteIndex}
                onSelect={() => {
                  setSelectedRouteIndex(idx);
                  scrollToCard(idx);
                }}
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
            </div>
          ))}
        </div>
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
