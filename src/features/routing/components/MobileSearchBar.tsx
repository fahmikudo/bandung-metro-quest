import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { ArrowRight, Pencil } from 'lucide-react';
import { STOPS } from '@/shared/data/bandungTransit';
import { useTransitStore } from '../store';
import { RouteSearchCard } from './RouteSearchCard';

const MODE_LABELS = {
  all: 'Semua Moda',
  bus: 'Bus Saja',
  angkot: 'Angkot Saja',
} as const;

export function MobileSearchBar() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fromId = useTransitStore((s) => s.fromId);
  const toId = useTransitStore((s) => s.toId);
  const modeFilter = useTransitStore((s) => s.modeFilter);
  const passengerType = useTransitStore((s) => s.passengerType);
  const trafficMode = useTransitStore((s) => s.trafficMode);
  const departureTime = useTransitStore((s) => s.departureTime);

  const fromName = STOPS[fromId]?.name ?? 'Pilih Asal';
  const toName = STOPS[toId]?.name ?? 'Pilih Tujuan';

  return (
    <>
      <Card
        shadow="none"
        isPressable
        onPress={onOpen}
        className="w-full rounded-3xl border-2 border-sky-200/80 bg-white text-left shadow-[0_4px_0_rgba(0,74,173,0.08)] transition-all hover:border-[#004AAD]/40"
      >
        <CardBody className="flex flex-row items-center justify-between gap-2.5 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold leading-snug text-slate-900">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#004AAD] text-[10px] font-black text-white">
                  A
                </span>
                <span>{fromName}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-sky-500" />
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                  B
                </span>
                <span>{toName}</span>
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold leading-snug text-slate-500">
              <span className="rounded-full bg-[#E8F4FF] px-2 py-0.5 text-[11px] font-bold text-[#004AAD]">
                {MODE_LABELS[modeFilter]}
              </span>
              <span>
                · {passengerType === 'discount' ? 'Pelajar' : 'Umum'} ·{' '}
                {trafficMode === 'rush' ? 'Macet' : 'Normal'} · {departureTime} WIB
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="flat"
            color="warning"
            radius="full"
            onPress={onOpen}
            startContent={<Pencil className="h-3.5 w-3.5" />}
            className="h-9 shrink-0 bg-amber-100 px-3.5 font-extrabold text-amber-900 shadow-[0_3px_0_#f59e0b] transition-transform active:translate-y-0.5"
          >
            Ubah
          </Button>
        </CardBody>
      </Card>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        placement="center"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          wrapper: 'px-4 sm:px-6',
          base: 'mx-0 my-4 max-h-[86vh] rounded-3xl border-2 border-sky-200/80',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-sky-100 pb-3 text-base font-extrabold text-[#004AAD]">
                Ubah Rute &amp; Filter Perjalanan
              </ModalHeader>
              <ModalBody className="py-4">
                <RouteSearchCard embedded onPresetPicked={onClose} />
              </ModalBody>
              <ModalFooter className="border-t border-sky-100">
                <Button
                  color="primary"
                  size="md"
                  radius="full"
                  fullWidth
                  onPress={onClose}
                  className="font-extrabold shadow-[0_3px_0_#002D6B] transition-transform active:translate-y-0.5"
                >
                  Tampilkan Rute di Peta
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
