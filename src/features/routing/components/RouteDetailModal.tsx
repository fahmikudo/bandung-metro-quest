import {
  Button,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Tab,
  Tabs,
} from '@heroui/react';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Leaf,
  Navigation,
  Play,
  XCircle,
} from 'lucide-react';
import { STOPS } from '@/shared/data/bandungTransit';
import { formatRupiah } from '@/shared/lib/format';
import { trackEvent } from '@/shared/lib/analytics';
import { getBandungSavingsNote } from '../simulator';
import type { TransitRouteOption } from '../router';
import { useTransitStore } from '../store';
import type { CompareMode } from '../schemas';

interface RouteDetailModalProps {
  route: TransitRouteOption | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSimulate: () => void;
}

export function RouteDetailModal({
  route,
  isOpen,
  onOpenChange,
  onSimulate,
}: RouteDetailModalProps) {
  const passengerType = useTransitStore((s) => s.passengerType);
  const compareMode = useTransitStore((s) => s.compareMode);
  const setCompareMode = useTransitStore((s) => s.setCompareMode);

  if (!route) return null;

  const cmp = route.comparisons[compareMode];
  const fareRatioPct = Math.max(
    6,
    Math.min(100, Math.round((route.totalFare / Math.max(1, cmp.fareMid)) * 100))
  );
  const savingsNote = getBandungSavingsNote(cmp.savedMid);

  const carbonText =
    compareMode === 'car'
      ? `Estimasi -${route.comparisons.car.co2SavedKg} kg CO₂ vs mobil`
      : route.comparisons.motor.co2DiffKg >= 0
        ? `Emisi ~${route.routeEmissionKg} kg CO₂ (setara motor matic)`
        : `Jejak ~${route.routeEmissionKg} kg CO₂ (efisien vs mobil)`;

  const disclaimer =
    compareMode === 'car'
      ? `Perkiraan Ojol Mobil ${formatRupiah(cmp.fareMin)}–${formatRupiah(cmp.fareMax)} (acuan ASK Wilayah I Jabar) · Emisi dibanding mobil bensin 1 penumpang ~${cmp.baselineEmissionKg} kg CO₂e (DEFRA).`
      : `Perkiraan Ojol Motor ${formatRupiah(cmp.fareMin)}–${formatRupiah(cmp.fareMax)} (acuan Zona I Kemenhub) · Emisi motor matic 110–125cc ~${cmp.baselineEmissionKg} kg CO₂e.`;

  const startStop = STOPS[route.allStops[0]]?.name ?? '';
  const endStop = STOPS[route.allStops[route.allStops.length - 1]]?.name ?? '';

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
      classNames={{
        wrapper: 'px-4 sm:px-6',
        base: 'mx-0 my-4 max-h-[86vh] rounded-3xl border-2 border-sky-200/80 shadow-[0_8px_0_rgba(0,74,173,0.12)]',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1.5 border-b border-sky-100 pb-3">
              <div className="flex flex-wrap items-center gap-1.5 pr-6">
                {route.badges.map((badge) => (
                  <Chip
                    key={badge.text}
                    size="sm"
                    variant="flat"
                    color={badge.color}
                    className="h-5 text-[11px] font-bold"
                  >
                    {badge.text}
                  </Chip>
                ))}
                {route.transfers > 0 && (
                  <Chip size="sm" variant="flat" color="warning" className="h-5 text-[11px] font-bold">
                    {route.transfers}x Transit
                  </Chip>
                )}
              </div>

              <div className="flex items-start justify-between gap-3 pt-0.5">
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {startStop} → {endStop}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {route.legs.map((leg, i) => (
                      <div key={`${leg.corridorId}-${i}`} className="flex items-center gap-1.5">
                        {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
                        <span
                          className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-extrabold text-white shadow-2xs"
                          style={{ backgroundColor: leg.corridorColor }}
                        >
                          {leg.operatorId === 'MJT' ? `MJT ${leg.corridorCode}` : leg.corridorCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-xl font-black tabular-nums text-slate-900">
                    {route.usesAngkot ? '~' : ''}
                    {formatRupiah(route.totalFare)}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs font-extrabold text-[#004AAD]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>~{route.totalMinutes} mnt</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    {route.totalDistanceKm} km · tiba ~{route.estimatedArrivalStr}
                  </div>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="gap-4 py-4">
              {/* Apples-to-Apples Comparison Widget */}
              <div className="rounded-2xl border-2 border-emerald-200/80 bg-emerald-50/75 p-3.5">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                    Perbandingan Fair
                  </span>
                  <Tabs
                    aria-label="Pilih pembanding ojol"
                    size="sm"
                    radius="full"
                    color="success"
                    selectedKey={compareMode}
                    onSelectionChange={(k) => setCompareMode(k as CompareMode)}
                    classNames={{
                      tabList: 'bg-emerald-100/80 p-0.5 gap-0.5',
                      tab: 'h-7 px-3 text-xs font-bold',
                      cursor: 'bg-white shadow-xs',
                      tabContent: 'group-data-[selected=true]:text-emerald-800 text-emerald-700',
                    }}
                  >
                    <Tab
                      key="motor"
                      title={
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" /> vs Ojol Motor
                        </span>
                      }
                    />
                    <Tab
                      key="car"
                      title={
                        <span className="flex items-center gap-1">
                          <Car className="h-3.5 w-3.5" /> vs Ojol Mobil
                        </span>
                      }
                    />
                  </Tabs>
                </div>

                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm text-emerald-950">
                  <span>
                    Estimasi hemat{' '}
                    <strong className="font-extrabold text-emerald-700">
                      {formatRupiah(cmp.savedMin)}–{formatRupiah(cmp.savedMax)}
                    </strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                    <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                    {carbonText}
                  </span>
                </div>

                <Progress
                  aria-label="Rasio biaya angkutan umum terhadap estimasi ojol"
                  size="sm"
                  color="success"
                  value={fareRatioPct}
                  className="mb-2"
                />

                <p className="text-xs font-semibold text-emerald-800">{savingsNote}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-900/80">
                  *{disclaimer}
                </p>
              </div>

              <Divider className="bg-slate-100" />

              {/* Step-by-step Journey & Schedule */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Panduan Perjalanan &amp; Jadwal ({route.departureTimeStr} WIB)
                </h4>

                {route.legs.map((leg, legIdx) => {
                  const fare = passengerType === 'discount' ? leg.fareDiscount : leg.fareRegular;
                  const sched = leg.schedule;
                  const toneStyles =
                    sched.tone === 'success'
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                      : sched.tone === 'warning'
                        ? 'border-amber-200 bg-amber-50/80 text-amber-900'
                        : 'border-rose-200 bg-rose-50/80 text-rose-900';

                  const StatusIcon =
                    sched.tone === 'success'
                      ? CheckCircle2
                      : sched.tone === 'warning'
                        ? AlertTriangle
                        : XCircle;

                  return (
                    <div
                      key={`${leg.corridorId}-${legIdx}`}
                      className="border-l-4 pl-3.5"
                      style={{ borderLeftColor: leg.corridorColor }}
                    >
                      <div className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-slate-900">
                        <span>
                          {legIdx + 1}.{' '}
                          {leg.operatorId === 'ANGKOT'
                            ? leg.corridorCode
                            : `${leg.operatorName} ${leg.corridorCode}`}
                        </span>
                        <span className="font-semibold text-slate-500">
                          → arah {leg.directionName}
                        </span>
                      </div>

                      {leg.vehicleColorLabel && (
                        <div className="mt-1.5">
                          <Chip
                            size="sm"
                            variant="flat"
                            color="warning"
                            startContent={<Bus className="ml-1 h-3.5 w-3.5" />}
                            className="h-6 text-xs font-bold"
                          >
                            Warna Angkot: {leg.vehicleColorLabel}
                          </Chip>
                        </div>
                      )}

                      <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                        Naik di <strong className="text-slate-900">{STOPS[leg.fromId]?.name}</strong>{' '}
                        → Turun di{' '}
                        <strong className="text-slate-900">{STOPS[leg.toId]?.name}</strong>{' '}
                        <span className="text-slate-500">
                          ({leg.stopCount} titik · ~{leg.rideMinutes} mnt · {formatRupiah(fare)})
                        </span>
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Lewat: {leg.stops.map((s) => STOPS[s]?.name).join(' · ')}
                      </p>

                      {/* Schedule & Live Tracker */}
                      <div className={`mt-2.5 rounded-xl border px-3 py-2.5 text-xs ${toneStyles}`}>
                        <div className="flex items-start gap-2 font-bold">
                          <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{sched.headline}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                          {sched.detail}
                        </p>

                        {((sched.upcomingTimes && sched.upcomingTimes.length > 1) ||
                          sched.tracker) && (
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-bold">
                              {sched.upcomingTimes && sched.upcomingTimes.length > 1
                                ? `Estimasi berikutnya: ${sched.upcomingTimes.slice(1).join(' · ')}`
                                : ''}
                            </span>
                            {sched.tracker && (
                              <Button
                                as="a"
                                href={sched.tracker.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                                variant="bordered"
                                color="primary"
                                radius="full"
                                endContent={<ExternalLink className="h-3.5 w-3.5" />}
                                onPress={() => {
                                  trackEvent('live_tracker_clicked', {
                                    provider: leg.operatorId === 'TMB' ? 'BEMO' : leg.operatorId,
                                    corridor_code: leg.corridorCode,
                                  });
                                }}
                                className="h-7 min-w-0 border-sky-300 bg-white px-3 text-xs font-bold"
                              >
                                {sched.tracker.label}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Hint */}
              <div className="flex items-center gap-2.5 rounded-2xl border border-sky-100 bg-[#F4F8FF] px-3.5 py-2.5 text-xs leading-relaxed text-slate-700">
                {route.requiresCashless ? (
                  <CreditCard className="h-4 w-4 shrink-0 text-[#004AAD]" />
                ) : (
                  <Banknote className="h-4 w-4 shrink-0 text-emerald-600" />
                )}
                <span>
                  {route.requiresCashless && route.requiresCash ? (
                    <>
                      Siapkan <strong>QRIS / E-Money</strong> (bus MJT) dan{' '}
                      <strong>uang tunai pas</strong> (Angkot).
                    </>
                  ) : route.requiresCashless ? (
                    <>
                      <strong>Non-tunai:</strong> bayar pakai QRIS atau kartu E-Money / Flazz /
                      TapCash.
                    </>
                  ) : route.requiresCash ? (
                    <>
                      <strong>Tunai:</strong> siapkan uang pecahan kecil untuk sopir Angkot.
                    </>
                  ) : (
                    <>
                      Bisa bayar pakai <strong>QRIS</strong> maupun <strong>uang tunai pas</strong>{' '}
                      (TMB).
                    </>
                  )}
                </span>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-sky-100">
              <Button
                variant="flat"
                radius="full"
                onPress={onClose}
                className="bg-[#EEF5FF] px-4 font-extrabold text-slate-700"
              >
                Tutup
              </Button>
              <Button
                color="primary"
                radius="full"
                startContent={<Play className="h-4 w-4 fill-current" />}
                onPress={() => {
                  trackEvent('route_simulation_started', {
                    corridors: route.legs.map((l) => l.corridorCode).join(' -> '),
                    transfers: route.transfers,
                    trigger_source: 'modal',
                  });
                  onClose();
                  onSimulate();
                }}
                className="px-5 font-extrabold shadow-[0_3px_0_#002D6B] transition-transform active:translate-y-0.5"
              >
                Simulasikan di Peta
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
