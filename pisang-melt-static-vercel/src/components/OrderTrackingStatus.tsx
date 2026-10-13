import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';

import {
  OrderStatusStep,
  ActiveOrder,
} from '../types/cart';

import {
  ClipboardCheck,
  Flame,
  Bike,
  PackageCheck,
  Check,
  Clock,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface OrderTrackingStatusProps {
  order: ActiveOrder;
  onNewOrder: () => void;
  onOpenPayment?: () => void;
}

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
|
| Customer membaca status langsung dari backend.
| Backend mengambil data terbaru dari MySQL.
|
*/

const ORDERS_API = '/api/orders';

/*
|--------------------------------------------------------------------------
| ADMIN STATUS → CUSTOMER STATUS
|--------------------------------------------------------------------------
*/

const mapAdminStatusToCustomerStatus = (
  adminStatus: string
): OrderStatusStep | 'completed' | 'cancelled' => {
  const normalized = String(adminStatus)
    .toLowerCase()
    .trim();

  switch (normalized) {
    case 'baru':
    case 'received':
      return 'received';

    case 'diproses':
    case 'processing':
    case 'cooking':
      return 'cooking';

    case 'siap':
    case 'ready':
      return 'ready';

    case 'selesai':
    case 'completed':
      return 'completed';

    case 'dibatalkan':
    case 'cancelled':
    case 'canceled':
      return 'cancelled';

    default:
      return 'received';
  }
};

/*
|--------------------------------------------------------------------------
| PAYMENT STATUS
|--------------------------------------------------------------------------
*/

const mapPaymentStatus = (
  paymentStatus: string
): 'pending' | 'paid' => {
  const normalized = String(paymentStatus)
    .toLowerCase()
    .trim();

  switch (normalized) {
    case 'dibayar':
    case 'terverifikasi':
    case 'paid':
    case 'verified':
      return 'paid';

    case 'menunggu':
    case 'pending':
    default:
      return 'pending';
  }
};

/*
|--------------------------------------------------------------------------
| API RESPONSE HELPER
|--------------------------------------------------------------------------
|
| Server bisa mengembalikan:
|
| { success: true, order: {...} }
|
| atau object order secara langsung.
|
*/

const extractOrder = (
  data: any
) => {
  if (
    data &&
    typeof data === 'object' &&
    data.order
  ) {
    return data.order;
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export const OrderTrackingStatus: React.FC<
  OrderTrackingStatusProps
> = ({
  order,
  onNewOrder,
  onOpenPayment,
}) => {
  /*
  |--------------------------------------------------------------------------
  | CUSTOMER STATUS
  |--------------------------------------------------------------------------
  */

  const [
    customerStatus,
    setCustomerStatus,
  ] = useState<
    OrderStatusStep |
    'completed' |
    'cancelled'
  >(
    mapAdminStatusToCustomerStatus(
      order.status
    )
  );

  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATUS
  |--------------------------------------------------------------------------
  */

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState<
    'pending' |
    'paid'
  >(
    mapPaymentStatus(
      order.paymentStatus
    )
  );

  /*
  |--------------------------------------------------------------------------
  | SERVER SYNC STATE
  |--------------------------------------------------------------------------
  */

  const [
    isSyncing,
    setIsSyncing,
  ] = useState(false);

  const [
    syncError,
    setSyncError,
  ] = useState<string | null>(
    null
  );

  const [
    lastSyncedAt,
    setLastSyncedAt,
  ] = useState<Date | null>(
    null
  );

  /*
  |--------------------------------------------------------------------------
  | FETCH ORDER FROM MYSQL
  |--------------------------------------------------------------------------
  |
  | Customer HP
  |      ↓
  | GET /api/orders/:orderId
  |      ↓
  | Express
  |      ↓
  | MySQL
  |      ↓
  | Status terbaru
  |
  */

  const syncOrderFromDatabase =
    async () => {
      if (!order.orderId) {
        return;
      }

      try {
        setIsSyncing(true);

        const response =
          await fetch(
            `${ORDERS_API}/${encodeURIComponent(
              order.orderId
            )}`,
            {
              method: 'GET',
              headers: {
                Accept:
                  'application/json',
              },
              cache: 'no-store',
            }
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        const serverOrder =
          extractOrder(data);

        if (
          !serverOrder ||
          typeof serverOrder !==
            'object'
        ) {
          throw new Error(
            'Data pesanan dari server tidak valid.'
          );
        }

        /*
        |--------------------------------------------------------------------------
        | STATUS PESANAN
        |--------------------------------------------------------------------------
        */

        if (
          serverOrder.status
        ) {
          const mappedStatus =
            mapAdminStatusToCustomerStatus(
              serverOrder.status
            );

          setCustomerStatus(
            mappedStatus
          );
        }

        /*
        |--------------------------------------------------------------------------
        | STATUS PEMBAYARAN
        |--------------------------------------------------------------------------
        */

        if (
          serverOrder.paymentStatus
        ) {
          const mappedPayment =
            mapPaymentStatus(
              serverOrder.paymentStatus
            );

          setPaymentStatus(
            mappedPayment
          );
        }

        /*
        |--------------------------------------------------------------------------
        | SYNC SUCCESS
        |--------------------------------------------------------------------------
        */

        setSyncError(null);
        setLastSyncedAt(
          new Date()
        );
      } catch (error) {
        console.error(
          'Gagal mengambil status pesanan dari MySQL:',
          error
        );

        setSyncError(
          'Status belum dapat diperbarui. Mencoba kembali...'
        );
      } finally {
        setIsSyncing(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | INITIAL DATABASE SYNC
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    syncOrderFromDatabase();
  }, [
    order.orderId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | AUTO POLLING
  |--------------------------------------------------------------------------
  |
  | Customer akan meminta status terbaru
  | setiap 3 detik.
  |
  | Ini yang membuat HP customer bisa menerima
  | perubahan status dari Admin Laptop melalui MySQL.
  |
  */

  useEffect(() => {
    if (!order.orderId) {
      return;
    }

    const interval =
      window.setInterval(() => {
        syncOrderFromDatabase();
      }, 3000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    order.orderId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | STATUS STEPS
  |--------------------------------------------------------------------------
  */

  const steps: {
    key: OrderStatusStep;
    title: string;
    description: string;
    estimatedTime: string;
    icon: React.ElementType;
  }[] = [
    {
      key: 'received',
      title:
        'Pesanan Diterima',
      description:
        'Pesanan masuk dan sedang diverifikasi oleh kasir serta sistem dapur.',
      estimatedTime:
        '1 - 2 mnt',
      icon:
        ClipboardCheck,
    },

    {
      key: 'cooking',
      title:
        'Sedang Dimasak',
      description:
        'Pisang dibalut panko renyah, digoreng dadakan dan disiram topping lumer panas.',
      estimatedTime:
        '8 - 12 mnt',
      icon: Flame,
    },

    {
      key: 'ready',
      title:
        'Siap Diantar',
      description:
        order.customerInfo
            .deliveryOption ===
          'pickup'
          ? 'Pesanan sudah matang dan siap diambil di konter pickup outlet.'
          : 'Pesanan selesai dikemas secara higienis dan siap diserahkan kepada kurir.',
      estimatedTime:
        'Siap Sekarang',
      icon:
        order.customerInfo
            .deliveryOption ===
          'pickup'
          ? PackageCheck
          : Bike,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | CURRENT STEP
  |--------------------------------------------------------------------------
  */

  const currentStepIndex =
    useMemo(() => {
      if (
        customerStatus ===
        'completed'
      ) {
        return 2;
      }

      if (
        customerStatus ===
        'cancelled'
      ) {
        return 0;
      }

      const index =
        steps.findIndex(
          (step) =>
            step.key ===
            customerStatus
        );

      return Math.max(
        0,
        index
      );
    }, [
      customerStatus,
      order.customerInfo.deliveryOption,
    ]);

  /*
  |--------------------------------------------------------------------------
  | ESTIMATED COUNTDOWN
  |--------------------------------------------------------------------------
  */

  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState<number>(() => {
    if (
      customerStatus ===
      'received'
    ) {
      return 12 * 60;
    }

    if (
      customerStatus ===
      'cooking'
    ) {
      return 6 * 60;
    }

    return 0;
  });

  useEffect(() => {
    if (
      customerStatus ===
        'ready' ||
      customerStatus ===
        'completed' ||
      customerStatus ===
        'cancelled'
    ) {
      setSecondsRemaining(
        0
      );

      return;
    }

    /*
    |----------------------------------------------------------------------
    | Reset estimasi ketika status berubah
    |----------------------------------------------------------------------
    */

    if (
      customerStatus ===
      'received'
    ) {
      setSecondsRemaining(
        12 * 60
      );
    }

    if (
      customerStatus ===
      'cooking'
    ) {
      setSecondsRemaining(
        6 * 60
      );
    }

    const timer =
      window.setInterval(
        () => {
          setSecondsRemaining(
            (previous) =>
              previous > 0
                ? previous - 1
                : 0
          );
        },
        1000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    customerStatus,
  ]);

  const minutes =
    Math.floor(
      secondsRemaining / 60
    );

  const seconds =
    secondsRemaining % 60;

  const timeFormatted =
    `${minutes
      .toString()
      .padStart(
        2,
        '0'
      )}:${seconds
      .toString()
      .padStart(
        2,
        '0')}`;

  /*
  |--------------------------------------------------------------------------
  | STATUS LABEL
  |--------------------------------------------------------------------------
  */

  const statusLabel =
    customerStatus ===
    'received'
      ? 'Pesanan Diterima'
      : customerStatus ===
        'cooking'
      ? 'Sedang Dimasak'
      : customerStatus ===
        'ready'
      ? 'Siap Diantar'
      : customerStatus ===
        'completed'
      ? 'Pesanan Selesai'
      : 'Pesanan Dibatalkan';

  /*
  |--------------------------------------------------------------------------
  | STATUS BADGE
  |--------------------------------------------------------------------------
  */

  const statusBadge =
    customerStatus ===
    'received'
      ? 'BARU'
      : customerStatus ===
        'cooking'
      ? 'DIPROSES'
      : customerStatus ===
        'ready'
      ? 'SIAP'
      : customerStatus ===
        'completed'
      ? 'SELESAI'
      : 'DIBATALKAN';

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">

      {/* ======================================================
          ORDER ID & ESTIMATED TIME
          ====================================================== */}

      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200/90 flex items-center justify-between gap-4">

        <div className="min-w-0">

          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Nomor Pesanan
          </span>

          <span className="text-base font-black text-[#241305] font-mono tracking-tight">
            #{order.orderId}
          </span>

          <div className="text-[11px] text-stone-500 mt-0.5">
            Dibuat: {order.timestamp}
          </div>

        </div>

        <div className="text-right shrink-0">

          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Estimasi Waktu
          </span>

          {customerStatus ===
            'ready' ||
          customerStatus ===
            'completed' ? (

            <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">

              <Check className="w-3.5 h-3.5" />

              <span>
                {customerStatus ===
                'completed'
                  ? 'Selesai!'
                  : 'Sudah Siap!'}
              </span>

            </span>

          ) : customerStatus ===
            'cancelled' ? (

            <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">

              <XCircle className="w-3.5 h-3.5" />

              <span>
                Dibatalkan
              </span>

            </span>

          ) : (

            <div className="flex items-center gap-1.5 text-base font-bold text-amber-900 font-mono tabular-nums">

              <Clock
                className="w-4 h-4 text-amber-700 animate-spin"
                style={{
                  animationDuration:
                    '4s',
                }}
              />

              <span>
                ~{timeFormatted} mnt
              </span>

            </div>
          )}

        </div>
      </div>

      {/* ======================================================
          DATABASE SYNC STATUS
          ====================================================== */}

      <div className="flex items-center justify-between px-1 text-[10px] text-stone-400">

        <div className="flex items-center gap-1.5">

          {isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : syncError ? (
            <AlertCircle className="w-3 h-3 text-amber-600" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}

          <span>
            {syncError
              ? syncError
              : isSyncing
              ? 'Memperbarui status...'
              : 'Status tersinkronisasi dengan server'}
          </span>

        </div>

        {lastSyncedAt && !syncError && (
          <span>
            Update{' '}
            {lastSyncedAt.toLocaleTimeString(
              'id-ID',
              {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }
            )}
          </span>
        )}

      </div>

      {/* ======================================================
          PAYMENT STATUS
          ====================================================== */}

      <div
        className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          paymentStatus ===
          'paid'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >

        <div className="flex items-center gap-2 min-w-0">

          {paymentStatus ===
          'paid' ? (

            <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />

          ) : (

            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />

          )}

          <div className="min-w-0">

            <span className="font-bold block">

              {paymentStatus ===
              'paid'
                ? `Pembayaran LUNAS (${order.paymentMethod.toUpperCase()})`
                : 'Menunggu Pembayaran Online'}

            </span>

            <p className="text-[11px] opacity-80">

              Total Tagihan: Rp{' '}

              {order.grandTotal.toLocaleString(
                'id-ID'
              )}

            </p>

          </div>

        </div>

        {paymentStatus !==
          'paid' &&
          onOpenPayment && (
            <button
              type="button"
              onClick={
                onOpenPayment
              }
              className="px-3 py-1.5 bg-[#3A1E08] hover:bg-black text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
            >
              Bayar Sekarang
            </button>
          )}

      </div>

      {/* ======================================================
          CANCELLED
          ====================================================== */}

      {customerStatus ===
        'cancelled' && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-900">

          <div className="flex items-center gap-2">

            <XCircle className="w-5 h-5 shrink-0" />

            <div>

              <h3 className="text-sm font-bold">
                Pesanan Dibatalkan
              </h3>

              <p className="text-xs mt-1 opacity-80">
                Pesanan ini telah dibatalkan oleh Admin Pisang Melt.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          ORDER STATUS TIMELINE
          ====================================================== */}

      {customerStatus !==
        'cancelled' && (
        <div className="space-y-4 px-1">

          <div className="relative">

            <div
              className="absolute left-5 top-4 bottom-4 w-0.5 bg-stone-200"
              aria-hidden="true"
            />

            <div
              className="absolute left-5 top-4 w-0.5 bg-amber-600 transition-all duration-500"
              style={{
                height:
                  currentStepIndex ===
                  0
                    ? '0%'
                    : currentStepIndex ===
                      1
                    ? '50%'
                    : '100%',
              }}
              aria-hidden="true"
            />

            <div className="space-y-6">

              {steps.map(
                (
                  step,
                  idx
                ) => {

                  const isPast =
                    idx <
                    currentStepIndex;

                  const isCurrent =
                    idx ===
                    currentStepIndex;

                  const StepIcon =
                    step.icon;

                  return (
                    <div
                      key={
                        step.key
                      }
                      className="relative flex items-start gap-4"
                    >

                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isPast
                            ? 'bg-amber-700 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-[#3A1E08] text-amber-300 ring-4 ring-amber-300/60 shadow-md'
                            : 'bg-stone-100 text-stone-400 border border-stone-300'
                        }`}
                      >

                        {isPast ? (

                          <Check className="w-5 h-5 stroke-[2.5]" />

                        ) : (

                          <StepIcon
                            className={`w-5 h-5 ${
                              isCurrent
                                ? 'animate-pulse'
                                : ''
                            }`}
                          />

                        )}

                      </div>

                      <div className="flex-1 pt-1 min-w-0">

                        <div className="flex items-center justify-between gap-2">

                          <h4
                            className={`text-sm font-bold font-display ${
                              isCurrent
                                ? 'text-[#241305]'
                                : isPast
                                ? 'text-stone-700'
                                : 'text-stone-400'
                            }`}
                          >
                            {
                              step.title
                            }
                          </h4>

                          <span
                            className={`text-[11px] font-mono tabular-nums shrink-0 ${
                              isCurrent
                                ? 'font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded'
                                : 'text-stone-400'
                            }`}
                          >
                            {
                              step.estimatedTime
                            }
                          </span>

                        </div>

                        <p
                          className={`text-xs mt-0.5 leading-relaxed ${
                            isCurrent
                              ? 'text-stone-700 font-medium'
                              : isPast
                              ? 'text-stone-500'
                              : 'text-stone-400'
                          }`}
                        >
                          {
                            step.description
                          }
                        </p>

                        {isCurrent && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-xs text-amber-950 flex items-center gap-2">

                            {step.key ===
                              'received' && (
                              <>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />

                                <span>
                                  Pesanan Anda telah diterima dan sedang dipersiapkan oleh tim Pisang Melt.
                                </span>
                              </>
                            )}

                            {step.key ===
                              'cooking' && (
                              <>
                                <Flame className="w-4 h-4 text-amber-700 animate-bounce shrink-0" />

                                <span>
                                  Pisang Anda sedang digoreng hingga renyah dan disiapkan dengan topping pilihan.
                                </span>
                              </>
                            )}

                            {step.key ===
                              'ready' && (
                              <>
                                <PackageCheck className="w-4 h-4 text-emerald-700 shrink-0" />

                                <span>
                                  Pesanan sudah matang dan dikemas. Silakan menunggu pengantaran atau mengambilnya di outlet.
                                </span>
                              </>
                            )}

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          STATUS INFORMATION
          ====================================================== */}

      <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">

        <div className="flex items-center justify-between gap-3">

          <div>

            <span className="block text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
              Status Pesanan
            </span>

            <span className="text-sm font-bold text-[#241305]">
              {statusLabel}
            </span>

          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase font-mono ${
              customerStatus ===
              'cancelled'
                ? 'bg-red-100 text-red-800'
                : customerStatus ===
                  'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {statusBadge}
          </span>

        </div>

        <p className="text-[11px] text-stone-500 mt-2">
          Status pesanan diperbarui oleh Admin. Halaman ini mengambil status terbaru langsung dari server secara otomatis.
        </p>

      </div>

      {/* ======================================================
          ORDER SUMMARY
          ====================================================== */}

      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200/80 space-y-3">

        <div className="flex items-center justify-between text-xs font-bold text-[#241305]">

          <span>
            Rincian Menu (
            {order.items.reduce(
              (
                acc,
                item
              ) =>
                acc +
                item.quantity,
              0
            )}{' '}
            Box)
          </span>

          <span className="font-mono tabular-nums">
            Rp{' '}
            {order.grandTotal.toLocaleString(
              'id-ID'
            )}
          </span>

        </div>

        <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200/60 pt-2">

          {order.items.map(
            (
              item,
              idx
            ) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex justify-between items-start gap-2"
              >

                <div className="min-w-0">

                  <span className="font-semibold text-stone-800">
                    {item.quantity}x{' '}
                    {
                      item.product
                        .name
                    }
                  </span>

                  {item
                    .selectedToppings
                    .length >
                    0 && (
                    <p className="text-[10px] text-amber-900">
                      +
                      {item.selectedToppings
                        .map(
                          (
                            topping
                          ) =>
                            topping.name
                        )
                        .join(
                          ', '
                        )}
                    </p>
                  )}

                </div>

                <span className="tabular-nums font-mono text-[11px] shrink-0">

                  {item.product
                    .price ===
                  0
                    ? 'GRATIS'
                    : `Rp ${(
                        (
                          item
                            .product
                            .price +
                          item.selectedToppings.reduce(
                            (
                              total,
                              topping
                            ) =>
                              total +
                              topping.price,
                            0
                          )
                        ) *
                        item.quantity
                      ).toLocaleString(
                        'id-ID'
                      )}`}

                </span>

              </div>
            )
          )}

        </div>

        {/* Customer Information */}

        <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-600 space-y-1">

          <div>
            <strong className="text-stone-700">
              Penerima:
            </strong>{' '}
            {
              order
                .customerInfo
                .name
            }{' '}
            (
            {
              order
                .customerInfo
                .phone
            }
            )
          </div>

          <div>
            <strong className="text-stone-700">
              Metode:
            </strong>{' '}
            {
              order
                .customerInfo
                .deliveryOption ===
              'pickup'
                ? 'Ambil di Outlet'
                : 'Kurir Instan'
            }
          </div>

          {order
            .customerInfo
            .address && (
            <div className="line-clamp-1">
              <strong className="text-stone-700">
                Alamat:
              </strong>{' '}
              {
                order
                  .customerInfo
                  .address
              }
            </div>
          )}

        </div>

      </div>

      {/* ======================================================
          CUSTOMER ACTIONS
          ====================================================== */}

      <div className="flex flex-col gap-2 pt-2">

        {/* WhatsApp Admin */}

        <a
          href={`https://wa.me/6281330608974?text=${encodeURIComponent(
            `Halo Admin Pisang Melt, saya ingin mengecek status pesanan #${order.orderId}. Terima kasih.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-[#1F512B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
        >

          <MessageCircle className="w-4 h-4" />

          <span>
            Hubungi Admin via WhatsApp
          </span>

        </a>

        {/* New Order */}

        <button
          type="button"
          onClick={
            onNewOrder
          }
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
        >

          <RefreshCw className="w-3.5 h-3.5" />

          <span>
            Buat Pesanan Baru
          </span>

        </button>

      </div>

    </div>
  );
};