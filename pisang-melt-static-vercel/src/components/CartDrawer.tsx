import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  ActiveOrder,
  CartItem,
  CustomerOrderInfo,
} from '../types/cart';

import {
  RUPIAH_PER_POINT,
  POINTS_PER_FREE_BOX,
} from '../types/loyalty';

import { OrderTrackingStatus } from './OrderTrackingStatus';

import {
  ArrowRight,
  Bike,
  Check,
  Clock,
  CreditCard,
  Gift,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;

  cartItems: CartItem[];

  onUpdateQuantity: (
    itemId: string,
    newQty: number
  ) => void;

  onRemoveItem: (
    itemId: string
  ) => void;

  onClearCart: () => void;

  loyaltyPoints: number;

  onOrderSuccessEarnPoints: (
    pointsEarned: number,
    orderTitle: string
  ) => void;

  onOpenLoyaltySection: () => void;

  activeOrder: ActiveOrder | null;

  onSetActiveOrder: (
    order: ActiveOrder | null
  ) => void;

  onOpenPaymentModal: (
    order: ActiveOrder
  ) => void;
}

const MAX_QUANTITY = 99;

const WHATSAPP_NUMBER =
  '6281330608974';

const PROMO_CODE = 'LUMER20';

const PROMO_PERCENT = 20;

const FREE_SHIPPING_MINIMUM = 60000;

const DELIVERY_FEE = 10000;

/*
|--------------------------------------------------------------------------
| PAYMENT LABEL
|--------------------------------------------------------------------------
*/

const getPaymentLabel = (
  paymentMethod: string
): string => {
  const paymentLabels: Record<
    string,
    string
  > = {
    qris: 'QRIS',
    bca_va: 'BCA Virtual Account',
    mandiri_va:
      'Mandiri Virtual Account',
    gopay: 'GoPay',
    dana: 'DANA',
    cod: 'COD',
  };

  return (
    paymentLabels[paymentMethod] ||
    paymentMethod
  );
};

/*
|--------------------------------------------------------------------------
| DELIVERY LABEL
|--------------------------------------------------------------------------
*/

const getDeliveryLabel = (
  deliveryOption: string
): string => {
  if (
    deliveryOption === 'pickup'
  ) {
    return 'Pickup';
  }

  return 'GoSend';
};

/*
|--------------------------------------------------------------------------
| SAVE ORDER TO SERVER / MYSQL
|--------------------------------------------------------------------------
|
| Customer tidak lagi menyimpan order admin
| menggunakan localStorage.
|
| Order dikirim ke:
|
| POST /api/orders
|
| Server akan menyimpannya ke MySQL.
|
*/

const saveOrderToServer = async (
  order: ActiveOrder,
  paymentStatus:
    | 'pending'
    | 'paid' = 'pending'
) => {
  const response = await fetch(
    '/api/orders',
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        orderId:
          order.orderId,

        status:
          order.status ===
          'received'
            ? 'Baru'
            : order.status,

        paymentStatus:
          paymentStatus === 'paid'
            ? 'Dibayar'
            : 'Menunggu',

        paymentMethod:
          getPaymentLabel(
            order.paymentMethod
          ),

        customerInfo:
          order.customerInfo,

        items:
          order.items.map(
            (item) => ({
              id: item.id,

              name:
                item.product.name,

              quantity:
                item.quantity,

              price:
                item.product.price,

              toppings:
                item.selectedToppings.map(
                  (topping) =>
                    topping.name
                ),

              toppingsData:
                item.selectedToppings,

              notes:
                item.notes || '',
            })
          ),

        itemsSubtotal:
          order.itemsSubtotal,

        discountAmount:
          order.discountAmount,

        deliveryFee:
          order.deliveryFee,

        grandTotal:
          order.grandTotal,

        estimatedMinutes:
          order.estimatedMinutes,

        createdAt:
          order.timestamp,
      }),
    }
  );

  if (!response.ok) {
    let errorMessage =
      'Gagal menyimpan pesanan ke server.';

    try {
      const errorData =
        await response.json();

      if (
        errorData?.message
      ) {
        errorMessage =
          errorData.message;
      }
    } catch {
      // Abaikan jika response bukan JSON.
    }

    throw new Error(
      errorMessage
    );
  }

  return response.json();
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export const CartDrawer = ({
  isOpen,
  onClose,

  cartItems,

  onUpdateQuantity,
  onRemoveItem,
  onClearCart,

  loyaltyPoints,

  onOrderSuccessEarnPoints,

  onOpenLoyaltySection,

  activeOrder,
  onSetActiveOrder,

  onOpenPaymentModal,
}: CartDrawerProps) => {
  // ============================================================
  // TAB
  // ============================================================

  const [activeTab, setActiveTab] =
    useState<
      'cart' | 'tracking'
    >(
      activeOrder
        ? 'tracking'
        : 'cart'
    );

  useEffect(() => {
    if (activeOrder) {
      setActiveTab(
        'tracking'
      );
    }
  }, [
    activeOrder?.orderId,
  ]);

  // ============================================================
  // PROMO
  // ============================================================

  const [promoCode, setPromoCode] =
    useState('');

  const [
    appliedDiscount,
    setAppliedDiscount,
  ] = useState<{
    code: string;
    percent: number;
  } | null>({
    code: PROMO_CODE,
    percent: PROMO_PERCENT,
  });

  const [
    discountError,
    setDiscountError,
  ] = useState('');

  // ============================================================
  // CUSTOMER ORDER INFO
  // ============================================================

  const [orderInfo, setOrderInfo] =
    useState<CustomerOrderInfo>({
      name: '',
      phone: '',
      address: '',
      deliveryOption:
        'gosend',
      notes: '',
      paymentMethod:
        'qris',
    });

  const [
    showCheckoutForm,
    setShowCheckoutForm,
  ] = useState(false);

  // ============================================================
  // SUBMIT / LOADING
  // ============================================================

  const [
    isSubmittingOrder,
    setIsSubmittingOrder,
  ] = useState(false);

  // ============================================================
  // ERROR
  // ============================================================

  const [
    orderError,
    setOrderError,
  ] = useState('');

  // ============================================================
  // CLOSE DRAWER
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // CALCULATE CART
  // ============================================================

  const itemsSubtotal =
    cartItems.reduce(
      (
        sum,
        item
      ) => {
        const toppingsCost =
          item.selectedToppings.reduce(
            (
              toppingSum,
              topping
            ) =>
              toppingSum +
              topping.price,
            0
          );

        const itemTotal =
          (
            item.product.price +
            toppingsCost
          ) *
          item.quantity;

        return (
          sum +
          itemTotal
        );
      },
      0
    );

  // ============================================================
  // DISCOUNT
  // ============================================================

  const discountAmount =
    appliedDiscount
      ? Math.round(
          (
            itemsSubtotal *
            appliedDiscount.percent
          ) / 100
        )
      : 0;

  // ============================================================
  // DELIVERY FEE
  // ============================================================

  const deliveryFee =
    orderInfo.deliveryOption ===
    'pickup'
      ? 0
      : itemsSubtotal >=
          FREE_SHIPPING_MINIMUM ||
        itemsSubtotal === 0
      ? 0
      : DELIVERY_FEE;

  // ============================================================
  // GRAND TOTAL
  // ============================================================

  const grandTotal =
    Math.max(
      0,
      itemsSubtotal -
        discountAmount +
        deliveryFee
    );

  // ============================================================
  // LOYALTY POINTS
  // ============================================================

  const pointsToEarn =
    Math.floor(
      grandTotal /
        RUPIAH_PER_POINT
    );

  // ============================================================
  // APPLY PROMO
  // ============================================================

  const handleApplyPromo = (
    event: FormEvent
  ) => {
    event.preventDefault();

    const normalizedCode =
      promoCode
        .trim()
        .toUpperCase();

    setDiscountError('');

    if (
      normalizedCode ===
      PROMO_CODE
    ) {
      setAppliedDiscount({
        code: PROMO_CODE,
        percent: PROMO_PERCENT,
      });

      setPromoCode('');

      return;
    }

    setDiscountError(
      'Kode voucher tidak valid.'
    );
  };

  // ============================================================
  // VALIDATE CUSTOMER DATA
  // ============================================================

  const validateOrderData =
    (): boolean => {
      if (
        cartItems.length === 0
      ) {
        alert(
          'Keranjang Anda masih kosong.'
        );

        return false;
      }

      if (
        !orderInfo.name.trim() ||
        !orderInfo.phone.trim()
      ) {
        alert(
          'Mohon lengkapi nama dan nomor WhatsApp Anda terlebih dahulu.'
        );

        setShowCheckoutForm(
          true
        );

        return false;
      }

      if (
        orderInfo.deliveryOption !==
          'pickup' &&
        !orderInfo.address.trim()
      ) {
        alert(
          'Mohon lengkapi alamat pengiriman terlebih dahulu.'
        );

        setShowCheckoutForm(
          true
        );

        return false;
      }

      return true;
    };

  // ============================================================
  // CREATE ACTIVE ORDER
  // ============================================================

  const createActiveOrder = (
    orderNumber: string
  ): ActiveOrder => {
    return {
      orderId:
        orderNumber,

      timestamp:
        new Date().toLocaleString(
          'id-ID',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        ) + ' WIB',

      status:
        'received',

      items: [
        ...cartItems,
      ],

      itemsSubtotal,

      discountAmount,

      deliveryFee,

      grandTotal,

      paymentMethod:
        orderInfo.paymentMethod,

      paymentStatus:
        'pending',

      customerInfo: {
        ...orderInfo,
      },

      estimatedMinutes: 15,
    };
  };

  // ============================================================
  // GENERATE ORDER NUMBER
  // ============================================================

  const generateOrderNumber =
    (): string => {
      const timestamp =
        Date.now()
          .toString()
          .slice(-6);

      const randomNumber =
        Math.floor(
          10 +
            Math.random() *
              90
        );

      return `PM-${timestamp}${randomNumber}`;
    };

  // ============================================================
  // ONLINE PAYMENT
  // ============================================================

  const handleInitiateOnlinePayment =
    async () => {
      if (
        isSubmittingOrder
      ) {
        return;
      }

      if (
        !validateOrderData()
      ) {
        return;
      }

      setOrderError('');
      setIsSubmittingOrder(
        true
      );

      try {
        const orderNumber =
          generateOrderNumber();

        const newActiveOrder =
          createActiveOrder(
            orderNumber
          );

        /*
         * Kirim order ke backend.
         *
         * Server akan menyimpan:
         * - customer
         * - item
         * - total
         * - payment
         * - status
         */
        await saveOrderToServer(
          newActiveOrder,
          'pending'
        );

        /*
         * Simpan sebagai pesanan aktif
         * customer.
         */
        onSetActiveOrder(
          newActiveOrder
        );

        /*
         * Kosongkan keranjang.
         */
        onClearCart();

        /*
         * Pindah ke tracking.
         */
        setActiveTab(
          'tracking'
        );

        /*
         * Buka modal pembayaran.
         */
        onOpenPaymentModal(
          newActiveOrder
        );
      } catch (error) {
        console.error(
          'Gagal membuat pesanan:',
          error
        );

        const message =
          error instanceof
          Error
            ? error.message
            : 'Gagal membuat pesanan. Silakan coba lagi.';

        setOrderError(
          message
        );

        alert(message);
      } finally {
        setIsSubmittingOrder(
          false
        );
      }
    };

  // ============================================================
  // WHATSAPP ORDER
  // ============================================================

  const handleCreateWhatsAppOrder =
    async () => {
      if (
        isSubmittingOrder
      ) {
        return;
      }

      if (
        !validateOrderData()
      ) {
        return;
      }

      setOrderError('');
      setIsSubmittingOrder(
        true
      );

      try {
        const orderNumber =
          generateOrderNumber();

        // ======================================================
        // BUILD ITEM LIST
        // ======================================================

        const itemsList =
          cartItems
            .map(
              (
                item,
                index
              ) => {
                const toppingsStr =
                  item
                    .selectedToppings
                    .length >
                  0
                    ? ` (+ ${item.selectedToppings
                        .map(
                          (
                            topping
                          ) =>
                            topping.name
                        )
                        .join(
                          ', '
                        )})`
                    : '';

                const toppingsCost =
                  item.selectedToppings.reduce(
                    (
                      sum,
                      topping
                    ) =>
                      sum +
                      topping.price,
                    0
                  );

                const itemTotal =
                  (
                    item.product
                      .price +
                    toppingsCost
                  ) *
                  item.quantity;

                const priceLabel =
                  item.product
                    .price ===
                  0
                    ? 'GRATIS (Hadiah Poin)'
                    : `Rp ${itemTotal.toLocaleString(
                        'id-ID'
                      )}`;

                return `${index + 1}. *${item.product.name}* x ${item.quantity} porsi${toppingsStr} = ${priceLabel}${
                  item.notes
                    ? `\n   Catatan: ${item.notes}`
                    : ''
                }`;
              }
            )
            .join('\n');

        // ======================================================
        // WHATSAPP MESSAGE
        // ======================================================

        const message = `
*PESANAN PISANG MELT - ${orderNumber}*

Halo Admin Pisang Melt, saya ingin konfirmasi pesanan:

📋 *Daftar Pesanan:*
${itemsList}

💰 *Rincian Pembayaran:*
- Subtotal: Rp ${itemsSubtotal.toLocaleString(
          'id-ID'
        )}
${
  appliedDiscount
    ? `- Diskon (${appliedDiscount.code} ${appliedDiscount.percent}%): -Rp ${discountAmount.toLocaleString(
        'id-ID'
      )}\n`
    : ''
}- Biaya Pengiriman: ${
          deliveryFee ===
          0
            ? 'GRATIS'
            : `Rp ${deliveryFee.toLocaleString(
                'id-ID'
              )}`
        }
*TOTAL BAYAR: Rp ${grandTotal.toLocaleString(
          'id-ID'
        )}*

- Metode Pembayaran: ${getPaymentLabel(
          orderInfo.paymentMethod
        )}
🎁 Poin Loyalty yang Diperoleh: +${pointsToEarn} Poin

📍 *Data Pengiriman:*
- Nama: ${orderInfo.name}
- WhatsApp: ${orderInfo.phone}
- Opsi Pengiriman: ${
          orderInfo.deliveryOption ===
          'pickup'
            ? 'Ambil Sendiri di Outlet'
            : 'Kurir Instan'
        }
- Alamat: ${
          orderInfo.address.trim() ||
          '-'
        }
${
  orderInfo.notes.trim()
    ? `- Catatan Tambahan: ${orderInfo.notes.trim()}`
    : ''
}

Mohon segera diproses ya kak, terima kasih!
`.trim();

        // ======================================================
        // CREATE ACTIVE ORDER
        // ======================================================

        const newActiveOrder =
          createActiveOrder(
            orderNumber
          );

        /*
         * Simpan order ke MySQL
         * SEBELUM membuka WhatsApp.
         */
        await saveOrderToServer(
          newActiveOrder,
          'pending'
        );

        // ======================================================
        // OPEN WHATSAPP
        // ======================================================

        const waUrl =
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            message
          )}`;

        window.open(
          waUrl,
          '_blank',
          'noopener,noreferrer'
        );

        // ======================================================
        // CUSTOMER LOYALTY
        // ======================================================

        if (
          pointsToEarn > 0
        ) {
          onOrderSuccessEarnPoints(
            pointsToEarn,
            `Pesanan Online #${orderNumber}`
          );
        }

        // ======================================================
        // CUSTOMER ACTIVE ORDER
        // ======================================================

        onSetActiveOrder(
          newActiveOrder
        );

        // ======================================================
        // CLEAR CART
        // ======================================================

        onClearCart();

        // ======================================================
        // TRACKING
        // ======================================================

        setActiveTab(
          'tracking'
        );
      } catch (error) {
        console.error(
          'Gagal membuat pesanan WhatsApp:',
          error
        );

        const message =
          error instanceof
          Error
            ? error.message
            : 'Gagal menyimpan pesanan. Silakan coba lagi.';

        setOrderError(
          message
        );

        alert(message);
      } finally {
        setIsSubmittingOrder(
          false
        );
      }
    };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang dan pemesanan"
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* ====================================================
            HEADER
            ==================================================== */}

        <div>
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag
                className="w-5 h-5 text-amber-900"
                aria-hidden="true"
              />

              <h2 className="text-base font-bold text-[#241305] font-display">
                Pemesanan & Pembayaran
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup keranjang"
              className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            >
              <X
                className="w-4 h-4"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* ==================================================
              TABS
              ================================================== */}

          <div className="flex border-b border-stone-200 bg-stone-100/70 p-1">
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'cart'
                )
              }
              aria-selected={
                activeTab ===
                'cart'
              }
              role="tab"
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab ===
                'cart'
                  ? 'bg-white text-[#3A1E08] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag
                className="w-3.5 h-3.5"
                aria-hidden="true"
              />

              <span>
                Keranjang (
                {cartItems.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    item.quantity,
                  0
                )}
                )
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'tracking'
                )
              }
              aria-selected={
                activeTab ===
                'tracking'
              }
              role="tab"
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                activeTab ===
                'tracking'
                  ? 'bg-white text-[#3A1E08] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bike
                className="w-3.5 h-3.5 text-amber-700"
                aria-hidden="true"
              />

              <span>
                Status Pesanan
              </span>

              {activeOrder && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>

        {/* ====================================================
            BODY
            ==================================================== */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">

          {activeTab ===
          'tracking' ? (
            activeOrder ? (
              <OrderTrackingStatus
                order={
                  activeOrder
                }
                onNewOrder={() => {
                  onSetActiveOrder(
                    null
                  );

                  setActiveTab(
                    'cart'
                  );
                }}
                onOpenPayment={() =>
                  onOpenPaymentModal(
                    activeOrder
                  )
                }
              />
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <Clock
                    className="w-6 h-6"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-base font-bold text-stone-800">
                  Belum Ada Pesanan Aktif
                </h3>

                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Belum ada pesanan yang sedang diproses. Silakan lakukan pemesanan melalui keranjang.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      'cart'
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#3A1E08] hover:bg-black rounded-xl transition-colors cursor-pointer"
                >
                  <ShoppingBag
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  />

                  <span>
                    Kembali ke Keranjang
                  </span>
                </button>
              </div>
            )
          ) : (
            <>
              {cartItems.length ===
              0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <ShoppingBag
                      className="w-6 h-6"
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="text-base font-bold text-stone-800">
                    Keranjang Masih Kosong
                  </h3>

                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Pilih varian pisang crispy atau nugget favoritmu dan pesan dengan praktis!
                  </p>

                  {activeOrder && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          'tracking'
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 underline hover:text-black mt-2"
                    >
                      <span>
                        Lihat Pesanan #
                        {
                          activeOrder.orderId
                        }
                      </span>

                      <ArrowRight
                        className="w-3.5 h-3.5"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* ==========================================
                      LOYALTY BANNER
                      ========================================== */}

                  {loyaltyPoints >=
                    POINTS_PER_FREE_BOX && (
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-stone-950 flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Gift
                          className="w-4 h-4 shrink-0"
                          aria-hidden="true"
                        />

                        <div>
                          <div className="text-xs font-black">
                            Kamu Punya{' '}
                            {
                              loyaltyPoints
                            }{' '}
                            Poin!
                          </div>

                          <div className="text-[10px] opacity-90">
                            Klaim 1 Box Pisang Melt Gratis sekarang
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenLoyaltySection();
                        }}
                        className="px-2.5 py-1.5 bg-stone-950 text-amber-300 text-[11px] font-bold rounded-lg hover:bg-black transition-colors shrink-0 cursor-pointer"
                      >
                        Klaim Hadiah
                      </button>
                    </div>
                  )}

                  {/* ==========================================
                      ITEM LIST
                      ========================================== */}

                  <div className="space-y-3">
                    {cartItems.map(
                      (item) => {
                        const toppingsCost =
                          item.selectedToppings.reduce(
                            (
                              sum,
                              topping
                            ) =>
                              sum +
                              topping.price,
                            0
                          );

                        const itemPrice =
                          (
                            item
                              .product
                              .price +
                            toppingsCost
                          ) *
                          item.quantity;

                        const isFreeReward =
                          item
                            .product
                            .price ===
                          0;

                        return (
                          <div
                            key={
                              item.id
                            }
                            className={`p-3 rounded-xl border flex gap-3 ${
                              isFreeReward
                                ? 'bg-amber-50/70 border-amber-300'
                                : 'bg-[#FAF7F2] border-stone-200/80'
                            }`}
                          >
                            <img
                              src={
                                item
                                  .product
                                  .image
                              }
                              alt={
                                item
                                  .product
                                  .name
                              }
                              className="w-16 h-16 rounded-lg object-cover bg-stone-200 shrink-0"
                            />

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <div>
                                    <h4 className="text-xs font-bold text-[#241305] truncate font-display">
                                      {
                                        item
                                          .product
                                          .name
                                      }
                                    </h4>

                                    {isFreeReward && (
                                      <span className="inline-block text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-1.5 py-0.2 rounded mt-0.5">
                                        🎁 Hadiah Box Poin Gratis
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onRemoveItem(
                                        item.id
                                      )
                                    }
                                    className="text-stone-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                                    title="Hapus item"
                                    aria-label={`Hapus ${item.product.name}`}
                                  >
                                    <Trash2
                                      className="w-3.5 h-3.5"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>

                                {item
                                  .selectedToppings
                                  .length >
                                  0 && (
                                  <p className="text-[10px] text-amber-900 mt-0.5 line-clamp-1">
                                    +{' '}
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

                                {item.notes && (
                                  <p className="text-[10px] text-stone-500 italic mt-0.5 line-clamp-1">
                                    Catatan:{' '}
                                    {
                                      item.notes
                                    }
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-bold text-stone-800 tabular-nums">
                                  {isFreeReward ? (
                                    <span className="text-emerald-700 font-extrabold">
                                      Rp 0 (GRATIS)
                                    </span>
                                  ) : (
                                    `Rp ${itemPrice.toLocaleString(
                                      'id-ID'
                                    )}`
                                  )}
                                </span>

                                <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateQuantity(
                                        item.id,
                                        Math.max(
                                          1,
                                          item.quantity -
                                            1
                                        )
                                      )
                                    }
                                    disabled={
                                      item.quantity <=
                                      1
                                    }
                                    className="p-1 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label={`Kurangi jumlah ${item.product.name}`}
                                  >
                                    <Minus
                                      className="w-3 h-3"
                                      aria-hidden="true"
                                    />
                                  </button>

                                  <span className="px-2 text-xs font-semibold tabular-nums text-stone-800 font-mono">
                                    {
                                      item.quantity
                                    }
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateQuantity(
                                        item.id,
                                        Math.min(
                                          MAX_QUANTITY,
                                          item.quantity +
                                            1
                                        )
                                      )
                                    }
                                    disabled={
                                      item.quantity >=
                                      MAX_QUANTITY
                                    }
                                    className="p-1 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label={`Tambah jumlah ${item.product.name}`}
                                  >
                                    <Plus
                                      className="w-3 h-3"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* ==========================================
                      LOYALTY POINTS
                      ========================================== */}

                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-stone-200/90 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-black shrink-0"
                        aria-hidden="true"
                      >
                        🍌
                      </div>

                      <div>
                        <span className="font-bold text-[#241305]">
                          MeltClub Points:
                        </span>

                        <p className="text-[11px] text-stone-600">
                          Pesanan ini menambah{' '}
                          <strong className="text-amber-700">
                            +{pointsToEarn}{' '}
                            Poin
                          </strong>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLoyaltySection();
                      }}
                      className="text-[11px] font-semibold text-amber-900 hover:text-black underline cursor-pointer"
                    >
                      Saldo:{' '}
                      {
                        loyaltyPoints
                      }{' '}
                      Pts
                    </button>
                  </div>

                  {/* ==========================================
                      FREE SHIPPING
                      ========================================== */}

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/80 text-xs">
                    {itemsSubtotal >=
                    FREE_SHIPPING_MINIMUM ? (
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <Check
                          className="w-4 h-4 text-emerald-600 shrink-0"
                          aria-hidden="true"
                        />

                        <span>
                          Selamat! Anda mendapatkan Gratis Ongkir Instan.
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-stone-700 font-medium mb-1">
                          <span>
                            Gratis Ongkir min. Rp 60.000
                          </span>

                          <span className="font-semibold text-amber-900 tabular-nums">
                            Kurang Rp{' '}
                            {(
                              FREE_SHIPPING_MINIMUM -
                              itemsSubtotal
                            ).toLocaleString(
                              'id-ID'
                            )}
                          </span>
                        </div>

                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-600 h-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                (
                                  itemsSubtotal /
                                  FREE_SHIPPING_MINIMUM
                                ) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ==========================================
                      PROMO CODE
                      ========================================== */}

                  <div className="space-y-1.5">
                    <form
                      onSubmit={
                        handleApplyPromo
                      }
                      className="flex gap-2"
                    >
                      <div className="relative flex-1">
                        <Tag
                          className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                          aria-hidden="true"
                        />

                        <input
                          type="text"
                          placeholder="Kode Promo (cth: LUMER20)"
                          value={
                            promoCode
                          }
                          onChange={(
                            event
                          ) =>
                            setPromoCode(
                              event
                                .target
                                .value
                            )
                          }
                          maxLength={30}
                          autoComplete="off"
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-500"
                          aria-label="Kode promo"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-3.5 py-2 text-xs font-semibold bg-stone-200 text-stone-800 hover:bg-stone-300 rounded-xl transition-colors cursor-pointer"
                      >
                        Gunakan
                      </button>
                    </form>

                    {appliedDiscount && (
                      <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span className="font-medium">
                          Voucher{' '}
                          {
                            appliedDiscount.code
                          }{' '}
                          aktif (
                          {
                            appliedDiscount.percent
                          }
                          % off)
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setAppliedDiscount(
                              null
                            )
                          }
                          className="text-stone-400 hover:text-red-500 cursor-pointer"
                          aria-label="Hapus voucher"
                        >
                          <X
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    )}

                    {discountError && (
                      <p
                        className="text-[11px] text-red-600"
                        role="alert"
                      >
                        {
                          discountError
                        }
                      </p>
                    )}
                  </div>

                  {/* ==========================================
                      CUSTOMER INFORMATION
                      ========================================== */}

                  <div className="border-t border-stone-200 pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShowCheckoutForm(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      aria-expanded={
                        showCheckoutForm
                      }
                      className="w-full flex items-center justify-between text-xs font-bold text-amber-900 py-1 hover:underline cursor-pointer"
                    >
                      <span>
                        {showCheckoutForm
                          ? 'Sembunyikan Data Pemesan'
                          : 'Lengkapi Data Pengiriman & Metode Bayar'}
                      </span>

                      <span className="text-[11px] text-stone-500">
                        {showCheckoutForm
                          ? 'Tutup'
                          : 'Buka'}
                      </span>
                    </button>

                    {showCheckoutForm && (
                      <div className="space-y-3 pt-3 animate-in fade-in duration-150">

                        {/* Nama */}

                        <div>
                          <label
                            htmlFor="customer-name"
                            className="text-[11px] font-semibold text-stone-700 block mb-1"
                          >
                            Nama Lengkap *
                          </label>

                          <input
                            id="customer-name"
                            type="text"
                            required
                            maxLength={100}
                            autoComplete="name"
                            placeholder="Contoh: Rian Pratama"
                            value={
                              orderInfo.name
                            }
                            onChange={(
                              event
                            ) =>
                              setOrderInfo(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  name: event
                                    .target
                                    .value,
                                })
                              )
                            }
                            className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {/* WhatsApp */}

                        <div>
                          <label
                            htmlFor="customer-phone"
                            className="text-[11px] font-semibold text-stone-700 block mb-1"
                          >
                            Nomor WhatsApp *
                          </label>

                          <input
                            id="customer-phone"
                            type="tel"
                            required
                            maxLength={20}
                            autoComplete="tel"
                            inputMode="tel"
                            placeholder="Contoh: 081234567890"
                            value={
                              orderInfo.phone
                            }
                            onChange={(
                              event
                            ) =>
                              setOrderInfo(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  phone: event
                                    .target
                                    .value,
                                })
                              )
                            }
                            className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {/* Delivery */}

                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            Metode Pengiriman
                          </label>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                setOrderInfo(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    deliveryOption:
                                      'gosend',
                                  })
                                )
                              }
                              aria-pressed={
                                orderInfo.deliveryOption ===
                                'gosend'
                              }
                              className={`p-2 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer ${
                                orderInfo.deliveryOption ===
                                'gosend'
                                  ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950'
                                  : 'border-stone-200'
                              }`}
                            >
                              <Bike
                                className="w-3.5 h-3.5 text-amber-700"
                                aria-hidden="true"
                              />

                              <span>
                                Kurir Instan
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setOrderInfo(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    deliveryOption:
                                      'pickup',
                                  })
                                )
                              }
                              aria-pressed={
                                orderInfo.deliveryOption ===
                                'pickup'
                              }
                              className={`p-2 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer ${
                                orderInfo.deliveryOption ===
                                'pickup'
                                  ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950'
                                  : 'border-stone-200'
                              }`}
                            >
                              <MapPin
                                className="w-3.5 h-3.5 text-stone-600"
                                aria-hidden="true"
                              />

                              <span>
                                Ambil di Outlet
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Address */}

                        {orderInfo.deliveryOption !==
                          'pickup' && (
                          <div>
                            <label
                              htmlFor="customer-address"
                              className="text-[11px] font-semibold text-stone-700 block mb-1"
                            >
                              Alamat Lengkap Pengiriman *
                            </label>

                            <textarea
                              id="customer-address"
                              rows={3}
                              maxLength={500}
                              autoComplete="street-address"
                              placeholder="Jalan, No. Rumah / Gedung, RT/RW, Patokan..."
                              value={
                                orderInfo.address
                              }
                              onChange={(
                                event
                              ) =>
                                setOrderInfo(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    address:
                                      event
                                        .target
                                        .value,
                                  })
                                )
                              }
                              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        )}

                        {/* Order Notes */}

                        <div>
                          <label
                            htmlFor="customer-order-notes"
                            className="text-[11px] font-semibold text-stone-700 block mb-1"
                          >
                            Catatan Tambahan
                          </label>

                          <textarea
                            id="customer-order-notes"
                            rows={2}
                            maxLength={250}
                            placeholder="Contoh: Saus dipisah, kirim sore, dll."
                            value={
                              orderInfo.notes
                            }
                            onChange={(
                              event
                            ) =>
                              setOrderInfo(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  notes:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                            className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {/* Payment */}

                        <div className="pt-2 border-t border-stone-200">
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1.5">
                            Metode Pembayaran Pilihan:
                          </label>

                          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                            {[
                              {
                                value:
                                  'qris',
                                label:
                                  'QRIS Instan',
                              },
                              {
                                value:
                                  'bca_va',
                                label:
                                  'BCA VA',
                              },
                              {
                                value:
                                  'mandiri_va',
                                label:
                                  'Mandiri VA',
                              },
                              {
                                value:
                                  'gopay',
                                label:
                                  'GoPay',
                              },
                              {
                                value:
                                  'dana',
                                label:
                                  'DANA',
                              },
                              {
                                value:
                                  'cod',
                                label:
                                  'COD / Tunai',
                              },
                            ].map(
                              (
                                payment
                              ) => (
                                <button
                                  key={
                                    payment.value
                                  }
                                  type="button"
                                  onClick={() =>
                                    setOrderInfo(
                                      (
                                        current
                                      ) => ({
                                        ...current,
                                        paymentMethod:
                                          payment.value as CustomerOrderInfo['paymentMethod'],
                                      })
                                    )
                                  }
                                  aria-pressed={
                                    orderInfo.paymentMethod ===
                                    payment.value
                                  }
                                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                                    orderInfo.paymentMethod ===
                                    payment.value
                                      ? 'border-amber-600 bg-amber-50 font-bold text-amber-950'
                                      : 'border-stone-200 text-stone-600'
                                  }`}
                                >
                                  {
                                    payment.label
                                  }
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* ====================================================
            ERROR
            ==================================================== */}

        {orderError && (
          <div className="px-4 sm:px-5 pb-2">
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700"
              role="alert"
            >
              {orderError}
            </div>
          </div>
        )}

        {/* ====================================================
            FOOTER CHECKOUT
            ==================================================== */}

        {activeTab ===
          'cart' &&
          cartItems.length >
            0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">

            {/* Price Summary */}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>
                  Subtotal Produk
                </span>

                <span className="tabular-nums font-mono">
                  Rp{' '}
                  {itemsSubtotal.toLocaleString(
                    'id-ID'
                  )}
                </span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>
                    Diskon Promo (
                    {
                      appliedDiscount.percent
                    }
                    %)
                  </span>

                  <span className="tabular-nums font-mono">
                    -Rp{' '}
                    {discountAmount.toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>
                  Biaya Pengiriman
                </span>

                <span className="tabular-nums font-mono">
                  {deliveryFee ===
                  0 ? (
                    <span className="text-emerald-700 font-semibold">
                      GRATIS
                    </span>
                  ) : (
                    `Rp ${deliveryFee.toLocaleString(
                      'id-ID'
                    )}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-[#241305] pt-2 border-t border-stone-200">
                <span>
                  Total Pembayaran
                </span>

                <span className="text-base text-[#3A1E08] tabular-nums font-mono">
                  Rp{' '}
                  {grandTotal.toLocaleString(
                    'id-ID'
                  )}
                </span>
              </div>
            </div>

            {/* ONLINE PAYMENT */}

            <button
              type="button"
              onClick={
                handleInitiateOnlinePayment
              }
              disabled={
                isSubmittingOrder
              }
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#3A1E08] hover:bg-black rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CreditCard
                className="w-4 h-4 text-amber-300"
                aria-hidden="true"
              />

              <span>
                {isSubmittingOrder
                  ? 'Menyimpan Pesanan...'
                  : 'Bayar Online Sekarang'}
              </span>

              {!isSubmittingOrder && (
                <ArrowRight
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* WHATSAPP */}

            <button
              type="button"
              onClick={
                handleCreateWhatsAppOrder
              }
              disabled={
                isSubmittingOrder
              }
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#1F512B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <MessageCircle
                className="w-4 h-4"
                aria-hidden="true"
              />

              <span>
                {isSubmittingOrder
                  ? 'Menyimpan Pesanan...'
                  : 'Atau Pesan Cepat via WhatsApp'}
              </span>
            </button>

            <p className="text-[10px] text-center text-stone-500">
              Pilihan pembayaran: QRIS, BCA, Mandiri, GoPay, DANA, atau COD.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
