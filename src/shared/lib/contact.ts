// Nomor WhatsApp resmi ManawiBandung (format internasional tanpa +, mis. 6281234567890)
// Atur melalui environment variable VITE_WHATSAPP_NUMBER saat deploy
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '6285155377009';

export function buildWhatsAppSupportUrl(
  message = 'Halo ManawiBandung, saya ingin menyampaikan kendala / pembaruan informasi rute atau tarif.'
): string {
  const cleanNumber = WHATSAPP_NUMBER.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
