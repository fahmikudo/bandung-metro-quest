import { useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  addToast,
} from '@heroui/react';
import { Megaphone } from 'lucide-react';
import { CORRIDORS } from '@/shared/data/bandungTransit';
import { ReportFormSchema, type ReportType } from '@/features/routing/schemas';

interface ReportRouteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'halte', label: 'Perubahan titik halte / rute' },
  { value: 'tarif', label: 'Pembaruan tarif / metode bayar' },
  { value: 'jam', label: 'Jam operasional / jadwal berubah' },
  { value: 'lainnya', label: 'Saran halte / trayek baru' },
];

export function ReportRouteModal({ isOpen, onOpenChange }: ReportRouteModalProps) {
  const [corridorId, setCorridorId] = useState(CORRIDORS[0]?.id ?? 'MJT-1');
  const [type, setType] = useState<ReportType>('halte');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (onClose: () => void) => {
    const parsed = ReportFormSchema.safeParse({ corridorId, type, note });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'note');
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setNote('');
    onClose();
    addToast({
      title: 'Laporan diterima',
      description: 'Terima kasih sudah membantu menjaga akurasi info transportasi Bandung.',
      color: 'success',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
      classNames={{
        wrapper: 'px-4 sm:px-6',
        base: 'mx-0 my-4 max-h-[86vh] rounded-2xl',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 text-base font-extrabold">
              <Megaphone className="h-4 w-4 text-sky-600" />
              <span>Lapor Pembaruan Rute / Tarif</span>
            </ModalHeader>

            <ModalBody className="gap-3">
              <p className="text-xs text-slate-500">
                Menemukan halte pindah, jadwal baru, atau perubahan jalur angkot/bus di Bandung?
                Kirim catatan singkat tanpa perlu login.
              </p>

              <Select
                label="Jalur / Koridor"
                labelPlacement="outside"
                size="md"
                variant="bordered"
                radius="lg"
                isVirtualized={false}
                selectedKeys={[corridorId]}
                isInvalid={Boolean(errors.corridorId)}
                errorMessage={errors.corridorId}
                listboxProps={{
                  classNames: { list: 'gap-1.5 p-1' },
                  itemClasses: {
                    base: '!py-3 !px-3 rounded-xl border border-slate-100 data-[hover=true]:bg-sky-50',
                    title: '!text-sm font-semibold text-slate-900',
                  },
                }}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0];
                  if (typeof val === 'string') setCorridorId(val);
                }}
              >
                {CORRIDORS.map((c) => (
                  <SelectItem key={c.id} textValue={`${c.code} · ${c.name}`}>
                    [{c.operator}] {c.code} · {c.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Jenis Info"
                labelPlacement="outside"
                size="md"
                variant="bordered"
                radius="lg"
                selectedKeys={[type]}
                isInvalid={Boolean(errors.type)}
                errorMessage={errors.type}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0];
                  if (typeof val === 'string') setType(val as ReportType);
                }}
              >
                {REPORT_TYPES.map((item) => (
                  <SelectItem key={item.value}>{item.label}</SelectItem>
                ))}
              </Select>

              <Textarea
                label="Catatan Singkat"
                labelPlacement="outside"
                placeholder="Contoh: Angkot 02 sekarang belok lewat Jl. Aceh saat akhir pekan..."
                size="md"
                variant="bordered"
                radius="lg"
                minRows={3}
                value={note}
                isInvalid={Boolean(errors.note)}
                errorMessage={errors.note}
                onValueChange={(val) => {
                  setNote(val);
                  if (errors.note) setErrors((prev) => ({ ...prev, note: '' }));
                }}
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="light" radius="lg" onPress={onClose} className="font-semibold">
                Batal
              </Button>
              <Button
                color="primary"
                radius="lg"
                onPress={() => handleSubmit(onClose)}
                className="font-bold"
              >
                Kirim Laporan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
