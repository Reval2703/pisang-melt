import React, { useEffect, useState } from 'react';
import {
  PaymentMethodType,
  ActiveOrder,
} from '../types/cart';
import {
  X,
  Check,
  Copy,
  QrCode,
  Building,
  Wallet,
  Banknote,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

interface OnlinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ActiveOrder;
  onPaymentSuccess: (
    method: PaymentMethodType,
    paymentRef: string
  ) => void;
}

/*
|--------------------------------------------------------------------------
| Admin Order Storage
|--------------------------------------------------------------------------
| Order customer disimpan di localStorage agar dapat dibaca oleh
| halaman AdminOrders.tsx.
|
| Catatan:
| localStorage cocok untuk prototype/demo.
| Untuk production sebaiknya menggunakan database/backend.
|--------------------------------------------------------------------------
*/
const ORDER_STORAGE_KEY =
  'pisang_melt_orders';

/*
|--------------------------------------------------------------------------
| Update Payment Status Untuk Admin
|--------------------------------------------------------------------------
*/
const updateAdminOrderPayment = (
  orderId: string,
  paymentMethod: PaymentMethodType,
  paymentRef: string
) => {
  try {
    const stored = localStorage.getItem(
      ORDER_STORAGE_KEY
    );

    if (!stored) {
      return;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return;
    }

    const updatedOrders = parsed.map(
      (adminOrder) => {
        if (
          !adminOrder ||
          typeof adminOrder !== 'object' ||
          adminOrder.id !== orderId
        ) {
          return adminOrder;
        }

        return {
          ...adminOrder,

          paymentMethod,

          paymentStatus: 'paid',

          paymentReference: paymentRef,

          /*
           * Jika order masih "Baru",
           * setelah pembayaran berhasil otomatis
           * berubah menjadi "Diproses".
           */
          status:
            adminOrder.status === 'Baru'
              ? 'Diproses'
              : adminOrder.status,

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

    localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify(updatedOrders)
    );
  } catch (error) {
    console.error(
      'Gagal memperbarui status pembayaran:',
      error
    );
  }
};

export const OnlinePaymentModal: React.FC<
  OnlinePaymentModalProps
> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType>(
      order.paymentMethod || 'qris'
    );

  const [copiedKey, setCopiedKey] =
    useState<string | null>(null);

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [isPaidSuccess, setIsPaidSuccess] =
    useState(
      order.paymentStatus === 'paid'
    );

  /*
   * 15-minute payment countdown
   */
  const [timeLeft, setTimeLeft] =
    useState(15 * 60);

  /*
   * Reset modal state when a different order
   * is opened.
   */
  useEffect(() => {
    setSelectedMethod(
      order.paymentMethod || 'qris'
    );

    setIsPaidSuccess(
      order.paymentStatus === 'paid'
    );

    setIsVerifying(false);

    setCopiedKey(null);

    setTimeLeft(15 * 60);
  }, [
    order.orderId,
    order.paymentMethod,
    order.paymentStatus,
  ]);

  /*
   * Payment countdown.
   */
  useEffect(() => {
    if (!isOpen || isPaidSuccess) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setTimeLeft((previous) =>
          previous > 0
            ? previous - 1
            : 0
        );
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isOpen, isPaidSuccess]);

  /*
   * Clean up copy feedback timeout.
   */
  useEffect(() => {
    return () => {
      setCopiedKey(null);
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  const minutes = Math.floor(
    timeLeft / 60
  );

  const seconds = timeLeft % 60;

  const timeFormatted = `${minutes
    .toString()
    .padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  /*
   |--------------------------------------------------------------------------
   | Copy Payment Number
   |--------------------------------------------------------------------------
   */
  const handleCopy = async (
    text: string,
    key: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopiedKey(key);

      window.setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    } catch (error) {
      console.error(
        'Gagal menyalin nomor pembayaran:',
        error
      );
    }
  };

  /*
   |--------------------------------------------------------------------------
   | Simulate Payment
   |--------------------------------------------------------------------------
   | DEMO ONLY.
   |
   | Pada production, bagian ini sebaiknya
   | diganti dengan payment gateway/backend.
   |--------------------------------------------------------------------------
   */
  const handleSimulatePayment = () => {
    if (
      isVerifying ||
      timeLeft <= 0
    ) {
      return;
    }

    setIsVerifying(true);

    window.setTimeout(() => {
      setIsVerifying(false);

      setIsPaidSuccess(true);

      const paymentRef =
        `TRX-${Math.floor(
          100000 +
            Math.random() * 900000
        )}`;

      /*
       * Update order pada AdminOrders
       */
      updateAdminOrderPayment(
        order.orderId,
        selectedMethod,
        paymentRef
      );

      /*
       * Callback ke parent/customer app
       */
      onPaymentSuccess(
        selectedMethod,
        paymentRef
      );
    }, 1500);
  };

  /*
   |--------------------------------------------------------------------------
   | Payment Details
   |--------------------------------------------------------------------------
   */
  const getPaymentDetails = () => {
    switch (selectedMethod) {
      case 'bca_va':
        return {
          title:
            'BCA Virtual Account',
          accountNumber:
            '8271081234567890',
          accountName:
            'PISANG MELT JAKARTA',
          instructions:
            'Transfer dapat dilakukan via BCA Mobile, KlikBCA, atau ATM BCA.',
        };

      case 'mandiri_va':
        return {
          title:
            'Mandiri Virtual Account',
          accountNumber:
            '8871081234567890',
          accountName:
            'PISANG MELT JAKARTA',
          instructions:
            'Transfer dapat dilakukan via Livin by Mandiri atau ATM Mandiri.',
        };

      case 'gopay':
        return {
          title:
            'GoPay / GoPay Later',
          accountNumber:
            '081330608974',
          accountName:
            'Pisang Melt Official',
          instructions:
            'Buka aplikasi Gojek/GoPay, bayar ke nomor di atas atau scan QRIS.',
        };

      case 'dana':
        return {
          title:
            'DANA E-Wallet',
          accountNumber:
            '081330608974',
          accountName:
            'Pisang Melt Official',
          instructions:
            'Kirim saldo DANA ke nomor terdaftar di atas.',
        };

      case 'cod':
        return {
          title:
            'Bayar di Tempat (COD)',
          accountNumber:
            'Siapkan Uang Pas',
          accountName:
            'Tunai ke Kurir / Kasir',
          instructions:
            'Bayar secara tunai kepada kurir saat pesanan hangat tiba di alamat Anda.',
        };

      case 'qris':
      default:
        return {
          title:
            'QRIS Real-Time (Semua Bank & E-Wallet)',
          accountNumber:
            'NMID: ID1024567891234',
          accountName:
            'PISANG MELT ARTISAN INDONESIA',
          instructions:
            'Scan QR di bawah menggunakan BCA, GoPay, OVO, DANA, Livin, ShopeePay, atau m-Banking apapun.',
        };
    }
  };

  const details =
    getPaymentDetails();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Pembayaran pesanan Pisang Melt"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-stone-200"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#241305] text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="w-5 h-5 text-emerald-400"
                aria-hidden="true"
              />

              <h3 className="text-base font-bold font-display text-white">
                Pembayaran Online Pisang Melt
              </h3>
            </div>

            <p className="text-xs text-stone-300 mt-0.5">
              Invoice #{order.orderId} ·
              Terenkripsi & Verifikasi Otomatis
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pembayaran"
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          >
            <X
              className="w-4 h-4"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="bg-[#FAF7F2] p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-stone-500 uppercase font-semibold block">
              Total yang Harus Dibayar
            </span>

            <span className="text-2xl sm:text-3xl font-black text-[#241305] font-display tabular-nums">
              Rp{' '}
              {order.grandTotal.toLocaleString(
                'id-ID'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isPaidSuccess ? (
              <div className="text-right">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                  Batas Pembayaran
                </span>

                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded font-mono tabular-nums flex items-center gap-1 ${
                    timeLeft > 0
                      ? 'text-amber-900 bg-amber-100'
                      : 'text-red-800 bg-red-100'
                  }`}
                >
                  <Clock
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  />

                  {timeLeft > 0
                    ? timeFormatted
                    : 'WAKTU HABIS'}
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-600"
                  aria-hidden="true"
                />

                <span>
                  LUNAS TERVERIFIKASI
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {isPaidSuccess ? (
            /* Payment Success */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Check
                  className="w-9 h-9 stroke-[3]"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h4 className="text-xl font-bold font-display text-[#241305]">
                  Pembayaran Berhasil Diterima!
                </h4>

                <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                  Terima kasih! Pesanan Anda telah
                  diverifikasi dan diteruskan ke
                  bagian dapur Pisang Melt.
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-stone-200 text-xs text-left max-w-sm mx-auto space-y-1.5">
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">
                    Nomor Pesanan:
                  </span>

                  <span className="font-mono font-bold text-stone-900">
                    #{order.orderId}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">
                    Metode Bayar:
                  </span>

                  <span className="font-semibold text-stone-900 text-right">
                    {details.title}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">
                    Nominal:
                  </span>

                  <span className="font-bold text-amber-900 font-mono">
                    Rp{' '}
                    {order.grandTotal.toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">
                    Status:
                  </span>

                  <span className="font-bold text-emerald-700">
                    LUNAS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#3A1E08] hover:bg-black rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
              >
                <span>
                  Lihat Status Pesanan
                </span>

                <ArrowRight
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          ) : (
            <>
              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Pilih Saluran Pembayaran:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

                  {/* QRIS */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMethod(
                        'qris'
                      )
                    }
                    aria-pressed={
                      selectedMethod ===
                      'qris'
                    }
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod ===
                      'qris'
                        ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950 shadow-xs ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <QrCode
                        className="w-5 h-5 text-amber-800"
                        aria-hidden="true"
                      />

                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded">
                        INSTAN
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-bold">
                      QRIS Nasional
                    </div>

                    <span className="text-[10px] text-stone-500">
                      Semua E-Wallet & Bank
                    </span>
                  </button>

                  {/* BCA VA */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMethod(
                        'bca_va'
                      )
                    }
                    aria-pressed={
                      selectedMethod ===
                      'bca_va'
                    }
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod ===
                      'bca_va'
                        ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950 shadow-xs ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <Building
                      className="w-5 h-5 text-blue-800"
                      aria-hidden="true"
                    />

                    <div className="mt-2 text-xs font-bold">
                      BCA Virtual Account
                    </div>

                    <span className="text-[10px] text-stone-500">
                      Auto Cek 24 Jam
                    </span>
                  </button>

                  {/* Mandiri VA */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMethod(
                        'mandiri_va'
                      )
                    }
                    aria-pressed={
                      selectedMethod ===
                      'mandiri_va'
                    }
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod ===
                      'mandiri_va'
                        ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950 shadow-xs ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <Building
                      className="w-5 h-5 text-amber-800"
                      aria-hidden="true"
                    />

                    <div className="mt-2 text-xs font-bold">
                      Mandiri VA
                    </div>

                    <span className="text-[10px] text-stone-500">
                      Livin by Mandiri
                    </span>
                  </button>

                  {/* GoPay */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMethod(
                        'gopay'
                      )
                    }
                    aria-pressed={
                      selectedMethod ===
                      'gopay'
                    }
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod ===
                      'gopay'
                        ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950 shadow-xs ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <Wallet
                      className="w-5 h-5 text-emerald-700"
                      aria-hidden="true"
                    />

                    <div className="mt-2 text-xs font-bold">
                      GoPay
                    </div>

                    <span className="text-[10px] text-stone-500">
                      Aplikasi Gojek
                    </span>
                  </button>

                  {/* DANA */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMethod(
                        'dana'
                      )
                    }
                    aria-pressed={
                      selectedMethod ===
                      'dana'
                    }
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod ===
                      'dana'
                        ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950 shadow-xs ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <Wallet
                      className="w-5 h-5 text-sky-600"
                      aria-hidden="true"
                    />

                    <div className="mt-2 text-xs font-bold">
                      DANA
                    </div>

                    <span className="text-[10px] text-stone-500">
                      E-Wallet Indonesia
                    </span>
                  </button>

                  {/* COD */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMethod(
                        'cod'
                      )
                    }
                    aria-pressed={
                      selectedMethod ===
                      'cod'
                    }
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod ===
                      'cod'
                        ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950 shadow-xs ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <Banknote
                      className="w-5 h-5 text-stone-800"
                      aria-hidden="true"
                    />

                    <div className="mt-2 text-xs font-bold">
                      COD / Tunai
                    </div>

                    <span className="text-[10px] text-stone-500">
                      Bayar saat Tiba
                    </span>
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-stone-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#241305]">
                      {details.title}
                    </h4>

                    <p className="text-[11px] text-stone-500">
                      {details.accountName}
                    </p>
                  </div>
                </div>

                {/* QRIS */}
                {selectedMethod ===
                  'qris' && (
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                    <div className="text-[11px] font-bold text-stone-700">
                      QRIS STANDAR PEMBAYARAN NASIONAL
                    </div>

                    <div className="relative p-3 bg-white border-2 border-stone-800 rounded-xl shadow-xs">
                      <svg
                        className="w-48 h-48"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="QRIS Pisang Melt"
                      >
                        {/* QR Corners */}
                        <rect
                          x="5"
                          y="5"
                          width="25"
                          height="25"
                          fill="#241305"
                          rx="3"
                        />

                        <rect
                          x="9"
                          y="9"
                          width="17"
                          height="17"
                          fill="white"
                        />

                        <rect
                          x="13"
                          y="13"
                          width="9"
                          height="9"
                          fill="#241305"
                        />

                        <rect
                          x="70"
                          y="5"
                          width="25"
                          height="25"
                          fill="#241305"
                          rx="3"
                        />

                        <rect
                          x="74"
                          y="9"
                          width="17"
                          height="17"
                          fill="white"
                        />

                        <rect
                          x="78"
                          y="13"
                          width="9"
                          height="9"
                          fill="#241305"
                        />

                        <rect
                          x="5"
                          y="70"
                          width="25"
                          height="25"
                          fill="#241305"
                          rx="3"
                        />

                        <rect
                          x="9"
                          y="74"
                          width="17"
                          height="17"
                          fill="white"
                        />

                        <rect
                          x="13"
                          y="78"
                          width="9"
                          height="9"
                          fill="#241305"
                        />

                        {/* Pixel Pattern */}
                        <rect
                          x="36"
                          y="8"
                          width="6"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="48"
                          y="12"
                          width="6"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="40"
                          y="24"
                          width="8"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="12"
                          y="38"
                          width="8"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="26"
                          y="44"
                          width="6"
                          height="8"
                          fill="#241305"
                        />

                        <rect
                          x="38"
                          y="38"
                          width="10"
                          height="10"
                          fill="#3A1E08"
                          rx="2"
                        />

                        <rect
                          x="54"
                          y="38"
                          width="8"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="72"
                          y="38"
                          width="10"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="84"
                          y="48"
                          width="8"
                          height="8"
                          fill="#241305"
                        />

                        <rect
                          x="64"
                          y="58"
                          width="6"
                          height="12"
                          fill="#241305"
                        />

                        <rect
                          x="44"
                          y="56"
                          width="12"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="38"
                          y="72"
                          width="6"
                          height="8"
                          fill="#241305"
                        />

                        <rect
                          x="50"
                          y="78"
                          width="12"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="74"
                          y="76"
                          width="18"
                          height="6"
                          fill="#241305"
                        />

                        <rect
                          x="80"
                          y="88"
                          width="12"
                          height="6"
                          fill="#241305"
                        />

                        {/* Center Badge */}
                        <circle
                          cx="50"
                          cy="50"
                          r="10"
                          fill="#3A1E08"
                        />

                        <text
                          x="50"
                          y="54"
                          textAnchor="middle"
                          fill="#FFC107"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          🍌
                        </text>
                      </svg>
                    </div>

                    <div className="text-center space-y-0.5">
                      <span className="text-[11px] font-mono text-stone-500">
                        NMID: ID1024567891234 ·
                        PISANG MELT
                      </span>

                      <p className="text-[11px] text-stone-600 font-medium">
                        Nominal pas otomatis:{' '}
                        <strong>
                          Rp{' '}
                          {order.grandTotal.toLocaleString(
                            'id-ID'
                          )}
                        </strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* VA / E-Wallet / COD */}
                {selectedMethod !==
                  'qris' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-stone-200">
                      <div className="min-w-0">
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
                          {selectedMethod ===
                          'cod'
                            ? 'Instruksi Bayar'
                            : 'Nomor Rekening / Virtual Account'}
                        </span>

                        <span className="text-base font-bold font-mono text-stone-900 tracking-wide select-all break-all">
                          {
                            details.accountNumber
                          }
                        </span>
                      </div>

                      {selectedMethod !==
                        'cod' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              details.accountNumber,
                              'va'
                            )
                          }
                          aria-label="Salin nomor pembayaran"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer shrink-0 active:scale-95"
                        >
                          {copiedKey ===
                          'va' ? (
                            <>
                              <Check
                                className="w-3.5 h-3.5 text-emerald-600"
                                aria-hidden="true"
                              />

                              <span>
                                Tersalin!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy
                                className="w-3.5 h-3.5 text-stone-500"
                                aria-hidden="true"
                              />

                              <span>
                                Salin Nomor
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <p className="text-xs text-stone-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-stone-200/60">
                  💡{' '}
                  {details.instructions}
                </p>
              </div>

              {/* Payment Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={
                    handleSimulatePayment
                  }
                  disabled={
                    isVerifying ||
                    timeLeft <= 0
                  }
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#1F512B] hover:bg-[#163c20] rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                        aria-hidden="true"
                      />

                      <span>
                        Memverifikasi Pembayaran...
                      </span>
                    </>
                  ) : timeLeft <= 0 ? (
                    <>
                      <Clock
                        className="w-4 h-4"
                        aria-hidden="true"
                      />

                      <span>
                        Waktu Pembayaran Habis
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        className="w-4 h-4"
                        aria-hidden="true"
                      />

                      <span>
                        Saya Sudah Bayar
                        (Konfirmasi)
                      </span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/6281330608974?text=${encodeURIComponent(
                    `Halo Admin Pisang Melt, saya sudah melakukan pembayaran untuk pesanan #${order.orderId} sebesar Rp ${order.grandTotal.toLocaleString(
                      'id-ID'
                    )} via ${details.title}. Mohon dicek ya kak.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Kirim bukti pembayaran melalui WhatsApp"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  <MessageCircle
                    className="w-4 h-4 text-emerald-700"
                    aria-hidden="true"
                  />

                  <span>
                    Kirim Bukti Pembayaran ke
                    WhatsApp
                  </span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};