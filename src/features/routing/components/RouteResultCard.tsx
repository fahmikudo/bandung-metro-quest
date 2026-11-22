import { Button, Card, CardBody, Chip } from '@heroui/react';
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Leaf,
  Play,
  XCircle,
} from 'lucide-react';
import { formatRupiah } from '@/shared/lib/format';
import type { TransitRouteOption } from '../router';

interface RouteResultCardProps {
  route: TransitRouteOption;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetail: () => void;
  onSimulate: () => void;
}

function formatRupiahRange(min: number, max: number): string {
  const minStr = Math.round(min || 0).toLocaleString('id-ID');
  const maxStr = Math.round(max || 0).toLocaleString('id-ID');
  return `Rp${minStr}–${maxStr}`;
}

export function RouteResultCard({
  route,
  isSelected,
  onSelect,
  onOpenDetail,
  onSimulate,
}: RouteResultCardProps) {
  const { motor, car } = route.comparisons;
  const firstSched = route.legs[0]?.schedule;

  const StatusIcon =
    route.scheduleStatus === 'active'
      ? CheckCircle2
      : route.scheduleStatus === 'warning'
        ? AlertTriangle
        : XCircle;

  const statusColorClass =
    route.scheduleStatus === 'active'
      ? 'text-emerald-700'
      : route.scheduleStatus === 'warning'
        ? 'text-amber-700'
        : 'text-rose-700';

  const statusSummary =
    route.scheduleStatus === 'closed'
      ? 'Sebagian / seluruh jalur sudah lewat jam operasional'
      : firstSched?.headline ?? 'Sedang beroperasi';

  return (
    <Card
      shadow="none"
      isPressable
      onPress={onSelect}
      className={`flex h-full min-h-[344px] w-full flex-col rounded-3xl border-2 text-left transition-all ${
        isSelected
          ? 'border-[#004AAD] bg-white shadow-[0_5px_0_rgba(0,74,173,0.14)]'
          : 'border-sky-200/80 bg-white shadow-[0_3px_0_rgba(0,74,173,0.06)] hover:border-[#004AAD]/45'
      }`}
    >
      <CardBody className="flex h-full flex-1 flex-col gap-3 p-4">
        {/* Top Row: Badges + Corridor Pills + Fare & ETA */}
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap gap-1">
              {route.badges.slice(0, 2).map((badge) => (
                <Chip
                  key={badge.text}
                  size="sm"
                  variant="flat"
                  color={badge.color}
                  className="h-5 px-1 text-[11px] font-bold"
                >
                  {badge.text}
                </Chip>
              ))}
              {route.transfers > 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="warning"
                  className="h-5 px-1 text-[11px] font-bold"
                >
                  {route.transfers}x Transit
                </Chip>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {route.legs.map((leg, i) => (
                <div key={`${leg.corridorId}-${i}`} className="flex flex-wrap items-center gap-1.5">
                  {i > 0 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  <span
                    className="inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-extrabold text-white shadow-2xs"
                    style={{ backgroundColor: leg.corridorColor }}
                  >
                    {leg.operatorId === 'MJT' ? `MJT ${leg.corridorCode}` : leg.corridorCode}
                  </span>
                  <span className="text-xs font-bold leading-snug text-slate-800">
                    {leg.corridorName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-lg font-black leading-tight tracking-tight tabular-nums text-slate-900">
              {route.usesAngkot ? '~' : ''}
              {formatRupiah(route.totalFare)}
            </div>
            <div className="mt-0.5 flex items-center justify-end gap-1 text-xs font-extrabold text-[#004AAD]">
              <Clock className="h-3.5 w-3.5" />
              <span>~{route.totalMinutes} mnt</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              {route.totalDistanceKm} km · tiba ~{route.estimatedArrivalStr}
            </div>
          </div>
        </div>

        {/* Compact Summary Meta: Schedule + Side-by-Side Ojol Motor & Mobil + Carbon */}
        <div className="flex flex-1 flex-col justify-between gap-2.5 rounded-2xl bg-[#F4F8FF] p-3 text-xs">
          <div className={`flex items-start gap-1.5 font-bold leading-snug ${statusColorClass}`}>
            <StatusIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-normal break-words">{statusSummary}</span>
          </div>

          <div className="grid grid-cols-2 items-stretch gap-2">
            <div className="flex flex-col justify-between rounded-xl border border-sky-100 bg-white px-2.5 py-2">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                  <Bike className="h-3 w-3 text-[#004AAD]" />
                  <span>Est. Ojol Motor</span>
                </div>
                <div className="mt-0.5 text-xs font-extrabold tabular-nums text-slate-900">
                  {formatRupiahRange(motor.fareMin, motor.fareMax)}
                </div>
                <div className="text-[11px] font-bold tabular-nums text-emerald-700">
                  Hemat {formatRupiahRange(motor.savedMin, motor.savedMax)}
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1 border-t border-slate-100 pt-1 text-[11px] text-slate-600">
                <Leaf className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="tabular-nums">~{motor.baselineEmissionKg} kg CO₂e</span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-sky-100 bg-white px-2.5 py-2">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                  <Car className="h-3 w-3 text-sky-600" />
                  <span>Est. Ojol Mobil</span>
                </div>
                <div className="mt-0.5 text-xs font-extrabold tabular-nums text-slate-900">
                  {formatRupiahRange(car.fareMin, car.fareMax)}
                </div>
                <div className="text-[11px] font-bold tabular-nums text-emerald-700">
                  Hemat {formatRupiahRange(car.savedMin, car.savedMax)}
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1 border-t border-slate-100 pt-1 text-[11px] text-slate-600">
                <Leaf className="h-3 w-3 shrink-0 text-emerald-600" />
                <span className="tabular-nums">
                  ~{car.baselineEmissionKg} kg CO₂e{' '}
                  <strong className="font-bold text-emerald-700">(-{car.co2SavedKg})</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-1.5 px-0.5 text-slate-700">
            <span className="flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                Karbon rute ini:{' '}
                <strong className="font-extrabold tabular-nums text-slate-900">
                  ~{route.routeEmissionKg} kg CO₂e
                </strong>
              </span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              Hemat ~{car.co2SavedKg} kg vs mobil
            </span>
          </div>
        </div>

        {/* Actions: Tactile Rounded-Full Buttons */}
        <div className="mt-auto grid shrink-0 grid-cols-2 gap-2.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            radius="full"
            endContent={<ChevronRight className="h-3.5 w-3.5" />}
            onPress={onOpenDetail}
            className="h-9 bg-[#E8F4FF] font-extrabold text-[#004AAD] shadow-[0_3px_0_#bfdbfe] transition-transform active:translate-y-0.5"
          >
            Lihat Detail
          </Button>
          <Button
            size="sm"
            color="primary"
            variant="solid"
            radius="full"
            startContent={<Play className="h-3.5 w-3.5 fill-current" />}
            onPress={onSimulate}
            className="h-9 font-extrabold shadow-[0_3px_0_#002D6B] transition-transform active:translate-y-0.5"
          >
            Simulasikan
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
