import { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { Download, PlusSquare, Share, Smartphone } from 'lucide-react';
import { trackEvent } from '@/shared/lib/analytics';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return mediaStandalone || iosStandalone;
}

function isIosSafariBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/i.test(ua);
  const isWebKit = /WebKit/i.test(ua);
  const isCriOSorFxiOS = /CriOS|FxiOS|EdgiOS/i.test(ua);
  return isIos && isWebKit && !isCriOSorFxiOS;
}

/**
 * Tombol pintar "Pasang Aplikasi" (PWA):
 * - Android / Chrome / Edge: memicu dialog instalasi native 1-tap.
 * - iOS Safari: menampilkan panduan singkat 2 langkah (Bagikan -> Tambah ke Layar Utama).
 * - Otomatis tersembunyi jika sudah dibuka dalam mode terpasang (standalone) atau browser tak mendukung.
 */
export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isRunningStandalone());
  const [isIos, setIsIos] = useState(false);
  const iosModal = useDisclosure();

  useEffect(() => {
    setInstalled(isRunningStandalone());
    setIsIos(isIosSafariBrowser());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (installed) return null;
  if (!deferredPrompt && !isIos) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      trackEvent('pwa_install_clicked', {
        platform: 'android',
        outcome,
      });
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    if (isIos) {
      trackEvent('pwa_install_clicked', {
        platform: 'ios',
        outcome: 'guide_opened',
      });
      iosModal.onOpen();
    }
  };

  return (
    <>
      <Button
        size="sm"
        color="warning"
        variant="flat"
        radius="full"
        onPress={handleInstallClick}
        startContent={<Download className="h-3.5 w-3.5" />}
        className="h-9 bg-amber-100 px-4 font-extrabold text-amber-950 shadow-[0_3px_0_#f59e0b] transition-transform active:translate-y-0.5"
      >
        Pasang Aplikasi
      </Button>

      <Modal
        isOpen={iosModal.isOpen}
        onOpenChange={iosModal.onOpenChange}
        size="md"
        placement="center"
        backdrop="blur"
        classNames={{
          wrapper: 'px-4 sm:px-6',
          base: 'mx-0 my-4 rounded-3xl border-2 border-sky-200/80 shadow-[0_8px_0_rgba(0,74,173,0.12)]',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 border-b border-sky-100 pb-3 text-base font-extrabold text-slate-900">
                <Smartphone className="h-4 w-4 text-[#004AAD]" />
                <span>Pasang ManawiBandung di iPhone</span>
              </ModalHeader>
              <ModalBody className="gap-3 py-4 text-sm text-slate-700">
                <p className="text-xs leading-relaxed text-slate-600">
                  Supaya bisa dibuka langsung dari layar utama dan tetap jalan saat sinyal lemah,
                  ikuti 2 langkah ini di Safari:
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-[#F4F8FF] p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#004AAD] text-xs font-extrabold text-white">
                      1
                    </span>
                    <div className="text-xs leading-relaxed">
                      <p className="font-extrabold text-slate-900">
                        Ketuk ikon Bagikan (Share) di bawah layar Safari
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-slate-600">
                        Ikon kotak dengan panah ke atas <Share className="h-3.5 w-3.5 text-[#004AAD]" />.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-[#F4F8FF] p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#004AAD] text-xs font-extrabold text-white">
                      2
                    </span>
                    <div className="text-xs leading-relaxed">
                      <p className="font-extrabold text-slate-900">
                        Pilih &ldquo;Tambah ke Layar Utama&rdquo;
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-slate-600">
                        Gulir ke bawah, ketuk <PlusSquare className="h-3.5 w-3.5 text-[#004AAD]" />{' '}
                        <strong>Add to Home Screen</strong>, lalu ketuk <strong>Add</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-sky-100">
                <Button
                  color="primary"
                  radius="full"
                  onPress={onClose}
                  className="px-5 font-extrabold shadow-[0_3px_0_#002D6B] transition-transform active:translate-y-0.5"
                >
                  Mengerti
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
