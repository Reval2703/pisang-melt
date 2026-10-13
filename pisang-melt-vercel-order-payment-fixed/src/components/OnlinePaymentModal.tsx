import React, { useEffect, useState } from 'react';
import { PaymentMethodType, ActiveOrder } from '../types/cart';
import { X, QrCode, Building, Banknote, ShieldCheck, MessageCircle, Copy, Check } from 'lucide-react';

interface OnlinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ActiveOrder;
}

const WHATSAPP_NUMBER = '6281330608974';

type ManualPaymentMethod = Extract<PaymentMethodType, 'qris' | 'bca_va' | 'mandiri_va' | 'cod'>;

export const OnlinePaymentModal: React.FC<OnlinePaymentModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<ManualPaymentMethod>(
    (['qris', 'bca_va', 'mandiri_va', 'cod'].includes(order.paymentMethod)
      ? order.paymentMethod
      : 'qris') as ManualPaymentMethod
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const nextMethod = ['qris', 'bca_va', 'mandiri_va', 'cod'].includes(order.paymentMethod)
      ? order.paymentMethod
      : 'qris';
    setSelectedMethod(nextMethod as ManualPaymentMethod);
    setCopied(false);
  }, [order.orderId, order.paymentMethod]);

  if (!isOpen) return null;

  const paymentDetails: Record<ManualPaymentMethod, { title: string; note: string }> = {
    qris: {
      title: 'QRIS (konfirmasi manual)',
      note: 'QRIS merchant resmi belum dikonfigurasi di website. Minta QRIS resmi kepada admin melalui WhatsApp dan pastikan nama merchant benar sebelum membayar.',
    },
    bca_va: {
      title: 'Transfer Bank BCA',
      note: 'Nomor rekening belum dikonfigurasi di website. Minta detail rekening resmi dari admin melalui WhatsApp dan pastikan nama penerima sebelum transfer.',
    },
    mandiri_va: {
      title: 'Transfer Bank Mandiri',
      note: 'Nomor rekening belum dikonfigurasi di website. Minta detail rekening resmi dari admin melalui WhatsApp dan pastikan nama penerima sebelum transfer.',
    },
    cod: {
      title: 'COD / Tunai',
      note: 'Tidak perlu transfer di muka. Konfirmasikan pesanan kepada admin dan siapkan pembayaran tunai saat pesanan diterima.',
    },
  };

  const details = paymentDetails[selectedMethod];
  const total = `Rp ${order.grandTotal.toLocaleString('id-ID')}`;
  const whatsappMessage = selectedMethod === 'cod'
    ? `Halo Admin Pisang Melt, saya ingin mengonfirmasi pesanan COD #${order.orderId}. Total pesanan ${total}. Saya akan membayar tunai saat pesanan diterima. Mohon konfirmasi pesanan ya.`
    : `Halo Admin Pisang Melt, saya ingin meminta detail pembayaran resmi untuk pesanan #${order.orderId}. Total ${total}. Metode pilihan: ${details.title}. Mohon kirim nomor rekening atau QRIS resmi. Pembayaran akan saya konfirmasi dengan bukti dan mohon diverifikasi manual oleh admin.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
  const proofMessage = `Halo Admin Pisang Melt, saya sudah melakukan pembayaran untuk pesanan #${order.orderId} sebesar ${total} melalui ${details.title}. Saya akan mengirim bukti pembayaran untuk diverifikasi. Mohon dicek ya.`;
  const proofUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(proofMessage)}`;

  const copyOrderSummary = async () => {
    const summary = `Pesanan #${order.orderId}\nTotal: ${total}\nMetode: ${details.title}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard mungkin tidak tersedia pada browser tertentu; WhatsApp tetap dapat digunakan.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Pembayaran manual Pisang Melt"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-stone-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-4 sm:p-5 bg-[#241305] text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <h3 className="text-base font-bold font-display text-white">Pembayaran Manual Pisang Melt</h3>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">Pesanan #{order.orderId} · Verifikasi dilakukan admin</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup pembayaran" className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="bg-[#FAF7F2] p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-stone-500 uppercase font-semibold block">Total pesanan</span>
            <span className="text-2xl sm:text-3xl font-black text-[#241305] font-display tabular-nums">{total}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-200">MENUNGGU KONFIRMASI ADMIN</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">Pilih metode pembayaran</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { value: 'qris', label: 'QRIS', icon: QrCode },
                { value: 'bca_va', label: 'Transfer BCA', icon: Building },
                { value: 'mandiri_va', label: 'Transfer Mandiri', icon: Building },
                { value: 'cod', label: 'COD / Tunai', icon: Banknote },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedMethod(value)}
                  aria-pressed={selectedMethod === value}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${selectedMethod === value ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950 shadow-xs ring-1 ring-amber-600' : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'}`}
                >
                  <Icon className="w-5 h-5 text-amber-800" aria-hidden="true" />
                  <span className="text-xs font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <h4 className="text-sm font-bold text-[#241305]">{details.title}</h4>
            {selectedMethod === 'cod' ? (
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200">
                <Banknote className="w-7 h-7 text-amber-800" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-stone-800">Bayar tunai saat pesanan diterima</p>
                  <p className="text-[11px] text-stone-500">Tidak ada pembayaran di muka.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-dashed border-stone-300">
                {selectedMethod === 'qris' ? <QrCode className="w-7 h-7 text-amber-800 shrink-0" aria-hidden="true" /> : <Building className="w-7 h-7 text-amber-800 shrink-0" aria-hidden="true" />}
                <p className="text-xs leading-relaxed text-stone-700">{details.note}</p>
              </div>
            )}
            <p className="text-xs text-stone-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-stone-200/60">💡 {details.note}</p>
          </div>

          <button type="button" onClick={() => window.open(whatsappUrl, '_blank')} className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#1F512B] hover:bg-[#163c20] rounded-xl transition-all shadow-md active:scale-98 cursor-pointer">
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span>{selectedMethod === 'cod' ? 'Konfirmasi Pesanan ke Admin' : 'Minta Detail Pembayaran ke Admin'}</span>
          </button>

          {selectedMethod !== 'cod' && (
            <button type="button" onClick={() => window.open(proofUrl, '_blank')} className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer">
              <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>Sudah Bayar? Kirim Bukti ke WhatsApp</span>
            </button>
          )}

          <button type="button" onClick={copyOrderSummary} className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl transition-colors cursor-pointer">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{copied ? 'Ringkasan pesanan tersalin' : 'Salin ringkasan pesanan'}</span>
          </button>
          <p className="text-[10px] leading-relaxed text-stone-500 text-center">Website tidak menandai pesanan sebagai lunas otomatis. Status pembayaran hanya dapat dikonfirmasi oleh admin setelah memeriksa pembayaran.</p>
        </div>
      </div>
    </div>
  );
};
