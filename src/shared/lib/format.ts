export function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount || 0).toLocaleString('id-ID')}`;
}
