import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Filter,
  MapPin,
  Package,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';

import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatCard from '../../components/admin/AdminStatCard';

interface AdminOrdersProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type OrderStatus =
  | 'Baru'
  | 'Diproses'
  | 'Siap'
  | 'Selesai'
  | 'Dibatalkan';

type PaymentStatus =
  | 'Menunggu'
  | 'Dibayar'
  | 'Terverifikasi';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  toppings?: string[];
  notes?: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  deliveryMethod: string;
  status: OrderStatus;
  notes: string;
  createdAt: string;
}

/* =========================================================
   API
========================================================= */

const ORDERS_API = '/api/orders';

/* =========================================================
   STATUS OPTIONS
========================================================= */

const STATUS_OPTIONS: Array<
  'Semua' | OrderStatus
> = [
  'Semua',
  'Baru',
  'Diproses',
  'Siap',
  'Selesai',
  'Dibatalkan',
];

/* =========================================================
   FORMAT RUPIAH
========================================================= */

const formatRupiah = (
  value: number
) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(
    Number(value) || 0
  );

/* =========================================================
   NORMALIZE ORDER STATUS
========================================================= */

const normalizeOrderStatus = (
  status: unknown
): OrderStatus => {
  const value = String(
    status || ''
  )
    .trim()
    .toLowerCase();

  switch (value) {
    case 'baru':
    case 'new':
    case 'received':
      return 'Baru';

    case 'diproses':
    case 'processing':
    case 'process':
      return 'Diproses';

    case 'siap':
    case 'ready':
      return 'Siap';

    case 'selesai':
    case 'completed':
    case 'complete':
      return 'Selesai';

    case 'dibatalkan':
    case 'cancelled':
    case 'canceled':
      return 'Dibatalkan';

    default:
      return 'Baru';
  }
};

/* =========================================================
   NORMALIZE PAYMENT STATUS
========================================================= */

const normalizePaymentStatus = (
  status: unknown
): PaymentStatus => {
  const value = String(
    status || ''
  )
    .trim()
    .toLowerCase();

  switch (value) {
    case 'dibayar':
    case 'paid':
      return 'Dibayar';

    case 'terverifikasi':
    case 'verified':
    case 'verification':
      return 'Terverifikasi';

    case 'menunggu':
    case 'pending':
    case 'unpaid':
    default:
      return 'Menunggu';
  }
};

/* =========================================================
   PAYMENT METHOD
========================================================= */

const normalizePaymentMethod = (
  method: unknown
): string => {
  const value = String(
    method || ''
  )
    .trim()
    .toLowerCase();

  switch (value) {
    case 'qris':
      return 'QRIS';

    case 'bca_va':
    case 'bca va':
    case 'bca':
      return 'BCA Virtual Account';

    case 'mandiri_va':
    case 'mandiri va':
    case 'mandiri':
      return 'Mandiri Virtual Account';

    case 'gopay':
    case 'go_pay':
      return 'GoPay';

    case 'dana':
      return 'DANA';

    case 'cod':
      return 'COD';

    default:
      return String(
        method || '-'
      );
  }
};

/* =========================================================
   DELIVERY METHOD
========================================================= */

const normalizeDeliveryMethod = (
  method: unknown
): string => {
  const value = String(
    method || ''
  )
    .trim()
    .toLowerCase();

  switch (value) {
    case 'pickup':
    case 'pick up':
      return 'Pickup';

    case 'gosend':
    case 'go-send':
    case 'go_send':
      return 'GoSend';

    case 'grabexpress':
    case 'grab express':
    case 'grab_express':
      return 'GrabExpress';

    default:
      return String(
        method || 'GoSend'
      );
  }
};

/* =========================================================
   FORMAT CREATED AT
========================================================= */

const formatCreatedAt = (
  value: unknown
): string => {
  if (!value) {
    return '-';
  }

  const stringValue =
    String(value);

  if (
    stringValue.includes('•') ||
    stringValue.includes('WIB')
  ) {
    return stringValue;
  }

  const date =
    new Date(stringValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return stringValue;
  }

  return (
    date.toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    ) +
    ' • ' +
    date.toLocaleTimeString(
      'id-ID',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  );
};

/* =========================================================
   NORMALIZE ORDER FROM API
========================================================= */

const normalizeOrder = (
  raw: any
): AdminOrder => {
  const customerInfo =
    raw?.customerInfo ??
    raw?.customer_info ??
    {};

  const rawItems =
    Array.isArray(
      raw?.items
    )
      ? raw.items
      : Array.isArray(
          raw?.orderItems
        )
      ? raw.orderItems
      : Array.isArray(
          raw?.order_items
        )
      ? raw.order_items
      : [];

  const items: OrderItem[] =
    rawItems.map(
      (
        item: any,
        index: number
      ) => {
        const toppingsData =
          Array.isArray(
            item?.toppingsData
          )
            ? item.toppingsData
            : Array.isArray(
                item?.toppings_data
              )
            ? item.toppings_data
            : [];

        const toppings =
          Array.isArray(
            item?.toppings
          )
            ? item.toppings
                .map(
                  (
                    topping: any
                  ) =>
                    typeof topping ===
                    'string'
                      ? topping
                      : String(
                          topping?.name ??
                            ''
                        )
                )
                .filter(
                  Boolean
                )
            : toppingsData
                .map(
                  (
                    topping: any
                  ) =>
                    String(
                      topping?.name ??
                        ''
                    )
                )
                .filter(
                  Boolean
                );

        const basePrice =
          Number(
            item?.price ??
              item?.productPrice ??
              item?.product?.price ??
              0
          ) || 0;

        const toppingPrice =
          toppingsData.reduce(
            (
              total: number,
              topping: any
            ) =>
              total +
              (
                Number(
                  topping?.price
                ) || 0
              ),
            0
          );

        return {
          id: String(
            item?.id ??
              item?.productId ??
              `item-${index + 1}`
          ),

          name: String(
            item?.name ??
              item?.productName ??
              item?.product?.name ??
              'Produk'
          ),

          quantity:
            Number(
              item?.quantity
            ) || 1,

          price:
            basePrice +
            toppingPrice,

          toppings,

          notes: String(
            item?.notes ||
              ''
          ),
        };
      }
    );

  const orderId = String(
    raw?.orderId ??
      raw?.order_id ??
      raw?.id ??
      ''
  );

  const subtotal =
    Number(
      raw?.itemsSubtotal ??
        raw?.items_subtotal ??
        raw?.subtotal ??
        0
    ) || 0;

  const discount =
    Number(
      raw?.discountAmount ??
        raw?.discount_amount ??
        raw?.discount ??
        0
    ) || 0;

  const deliveryFee =
    Number(
      raw?.deliveryFee ??
        raw?.delivery_fee ??
        0
    ) || 0;

  const total =
    Number(
      raw?.grandTotal ??
        raw?.grand_total ??
        raw?.total
    ) ||
    subtotal -
      discount +
      deliveryFee;

  const paymentMethod =
    normalizePaymentMethod(
      raw?.paymentMethod ??
        raw?.payment_method ??
        customerInfo?.paymentMethod ??
        customerInfo?.payment_method
    );

  const deliveryMethod =
    normalizeDeliveryMethod(
      customerInfo?.deliveryOption ??
        customerInfo?.delivery_option ??
        raw?.deliveryMethod ??
        raw?.delivery_method
    );

  return {
    id:
      orderId.startsWith('#')
        ? orderId
        : `#${orderId}`,

    customerName:
      String(
        customerInfo?.name ??
          raw?.customerName ??
          raw?.customer_name ??
          raw?.name ??
          'Customer'
      ),

    phone:
      String(
        customerInfo?.phone ??
          raw?.phone ??
          raw?.customerPhone ??
          '-'
      ),

    address:
      String(
        customerInfo?.address ??
          raw?.address ??
          '-'
      ),

    items,

    subtotal,

    discount,

    deliveryFee,

    total,

    paymentMethod,

    paymentStatus:
      normalizePaymentStatus(
        raw?.paymentStatus ??
          raw?.payment_status
      ),

    deliveryMethod,

    status:
      normalizeOrderStatus(
        raw?.status
      ),

    notes:
      String(
        customerInfo?.notes ??
          raw?.notes ??
          ''
      ),

    createdAt:
      formatCreatedAt(
        raw?.createdAt ??
          raw?.created_at ??
          raw?.timestamp
      ),
  };
};

/* =========================================================
   GET ORDERS
========================================================= */

const fetchOrders =
  async (): Promise<
    AdminOrder[]
  > => {
      const response =
      await fetch(
        ORDERS_API,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',
          },

          credentials: 'include',

          cache: 'no-store',
        }
      );

    if (!response.ok) {
      let message =
        `Gagal mengambil pesanan. (${response.status})`;

      try {
        const errorData =
          await response.json();

        if (
          errorData?.message
        ) {
          message =
            errorData.message;
        }
      } catch {
        // Response bukan JSON.
      }

      throw new Error(
        message
      );
    }

    const data =
      await response.json();

    const rawOrders =
      Array.isArray(data)
        ? data
        : Array.isArray(
            data?.orders
          )
        ? data.orders
        : Array.isArray(
            data?.data
          )
        ? data.data
        : Array.isArray(
            data?.data?.orders
          )
        ? data.data.orders
        : [];

    /*
     * Tidak menggunakan .sort((a, b) => ...)
     * supaya tidak muncul error TypeScript
     * pada parameter a dan b.
     *
     * Urutan pesanan mengikuti backend / MySQL.
     */

    return rawOrders.map(
      (order: any) =>
        normalizeOrder(
          order
        )
    );
  };

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

const updateOrderStatusApi = async (
  orderId: string,
  status: OrderStatus
) => {
  const cleanOrderId = orderId.replace(/^#/, '');

  const response = await fetch(
    `${ORDERS_API}/${encodeURIComponent(cleanOrderId)}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        status,
      }),
    }
  );

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      'Gagal memperbarui status pesanan.'
    );
  }

  return data;
};


/* =========================================================
   UPDATE PAYMENT STATUS
========================================================= */

const updatePaymentStatusApi = async (
  orderId: string,
  paymentStatus: PaymentStatus
) => {
  const cleanOrderId = orderId.replace(/^#/, '');

  const response = await fetch(
    `${ORDERS_API}/${encodeURIComponent(cleanOrderId)}/payment`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        paymentStatus,
      }),
    }
  );

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      'Gagal memperbarui status pembayaran.'
    );
  }

  return data;
};
/* =========================================================
   STATUS CLASS
========================================================= */

const getStatusClass = (
  status: OrderStatus
) => {
  switch (status) {
    case 'Baru':
      return 'bg-blue-50 text-blue-700';

    case 'Diproses':
      return 'bg-amber-50 text-amber-700';

    case 'Siap':
      return 'bg-emerald-50 text-emerald-700';

    case 'Selesai':
      return 'bg-stone-100 text-stone-600';

    case 'Dibatalkan':
      return 'bg-red-50 text-red-600';

    default:
      return 'bg-stone-100 text-stone-600';
  }
};

/* =========================================================
   STATUS DOT
========================================================= */

const getStatusDot = (
  status: OrderStatus
) => {
  switch (status) {
    case 'Baru':
      return 'bg-blue-500';

    case 'Diproses':
      return 'bg-amber-500';

    case 'Siap':
      return 'bg-emerald-500';

    case 'Selesai':
      return 'bg-stone-400';

    case 'Dibatalkan':
      return 'bg-red-500';

    default:
      return 'bg-stone-400';
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const AdminOrders: React.FC<
  AdminOrdersProps
> = ({
  onNavigate,
  onLogout,
}) => {
  const [
    orders,
    setOrders,
  ] = useState<AdminOrder[]>(
    []
  );

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    'Semua' | OrderStatus
  >('Semua');

  const [
    selectedOrder,
    setSelectedOrder,
  ] =
    useState<AdminOrder | null>(
      null
    );

  const [
    toast,
    setToast,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
  ] = useState(false);
  
  const [
    isUpdatingPayment,
    setIsUpdatingPayment,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  const loadOrders =
    async (
      showLoading = false
    ) => {
      try {
        if (showLoading) {
          setIsLoading(
            true
          );
        }

        const latestOrders =
          await fetchOrders();

        setOrders(
          latestOrders
        );

        setErrorMessage('');

        setSelectedOrder(
          (current) => {
            if (!current) {
              return null;
            }

            return (
              latestOrders.find(
                (
                  order
                ) =>
                  order.id ===
                  current.id
              ) || null
            );
          }
        );
      } catch (error) {
        console.error(
          'Gagal mengambil data pesanan:',
          error
        );

        if (
          orders.length ===
          0
        ) {
          setErrorMessage(
            error instanceof
              Error
              ? error.message
              : 'Gagal mengambil data pesanan dari server.'
          );
        }
      } finally {
        if (showLoading) {
          setIsLoading(
            false
          );
        }
      }
    };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadOrders(true);
  }, []);

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          loadOrders(false);
        },
        3000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const newOrders =
    orders.filter(
      (order) =>
        order.status ===
        'Baru'
    ).length;

  const processingOrders =
    orders.filter(
      (order) =>
        order.status ===
        'Diproses'
    ).length;

  const readyOrders =
    orders.filter(
      (order) =>
        order.status ===
        'Siap'
    ).length;

  /* =======================================================
     TODAY REVENUE
  ======================================================= */

  const todayRevenue =
    useMemo(() => {
      const today =
        new Date();

      const todayDate =
        today.toLocaleDateString(
          'id-ID'
        );

      return orders
        .filter(
          (order) => {
            if (
              order.status ===
              'Dibatalkan'
            ) {
              return false;
            }

            const parsed =
              new Date(
                order.createdAt
              );

            if (
              !Number.isNaN(
                parsed.getTime()
              )
            ) {
              return (
                parsed.toLocaleDateString(
                  'id-ID'
                ) ===
                todayDate
              );
            }

            const todayDay =
              String(
                today.getDate()
              ).padStart(
                2,
                '0'
              );

            return order.createdAt.includes(
              todayDay
            );
          }
        )
        .reduce(
          (
            total,
            order
          ) =>
            total +
            order.total,
          0
        );
    }, [orders]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredOrders =
    useMemo(() => {
      const search =
        searchQuery
          .toLowerCase()
          .trim();

      return orders.filter(
        (order) => {
          const matchesSearch =
            order.id
              .toLowerCase()
              .includes(search) ||
            order.customerName
              .toLowerCase()
              .includes(search) ||
            order.phone
              .toLowerCase()
              .includes(search) ||
            order.items.some(
              (item) =>
                item.name
                  .toLowerCase()
                  .includes(
                    search
                  )
            );

          const matchesStatus =
            statusFilter ===
              'Semua' ||
            order.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      orders,
      searchQuery,
      statusFilter,
    ]);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = (
    message: string
  ) => {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 2500);
  };

/* =======================================================
   UPDATE ORDER STATUS
======================================================= */

const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus
) => {
  if (isUpdatingStatus) {
    return;
  }

  setIsUpdatingStatus(true);

  try {
    await updateOrderStatusApi(
      orderId,
      newStatus
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    setSelectedOrder((current) =>
      current && current.id === orderId
        ? {
            ...current,
            status: newStatus,
          }
        : current
    );

    showToast(
      `Status pesanan ${orderId} diubah menjadi ${newStatus}.`
    );

    // Sinkronisasi ulang dengan MySQL
    await loadOrders(false);
  } catch (error) {
    console.error(
      'Gagal mengubah status pesanan:',
      error
    );

    showToast(
      error instanceof Error
        ? error.message
        : 'Gagal mengubah status pesanan.'
    );
  } finally {
    setIsUpdatingStatus(false);
  }
};


/* =======================================================
   UPDATE PAYMENT STATUS
======================================================= */

const updatePaymentStatus = async (
  orderId: string,
  newPaymentStatus: PaymentStatus
) => {
  if (isUpdatingPayment) {
    return;
  }

  setIsUpdatingPayment(true);

  try {
    await updatePaymentStatusApi(
      orderId,
      newPaymentStatus
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              paymentStatus: newPaymentStatus,
            }
          : order
      )
    );

    setSelectedOrder((current) =>
      current && current.id === orderId
        ? {
            ...current,
            paymentStatus: newPaymentStatus,
          }
        : current
    );

    showToast(
      `Pembayaran ${orderId} diubah menjadi ${newPaymentStatus}.`
    );

    // Sinkronisasi ulang dengan MySQL
    await loadOrders(false);
  } catch (error) {
    console.error(
      'Gagal mengubah status pembayaran:',
      error
    );

    showToast(
      error instanceof Error
        ? error.message
        : 'Gagal mengubah status pembayaran.'
    );
  } finally {
    setIsUpdatingPayment(false);
  }
};

  /* =======================================================
     NEXT STATUS
  ======================================================= */

  const getNextStatus = (
    status: OrderStatus
  ): OrderStatus | null => {
    switch (status) {
      case 'Baru':
        return 'Diproses';

      case 'Diproses':
        return 'Siap';

      case 'Siap':
        return 'Selesai';

      default:
        return null;
    }
  };

  /* =======================================================
     NEXT STATUS LABEL
  ======================================================= */

  const getNextStatusLabel = (
    status: OrderStatus
  ) => {
    switch (status) {
      case 'Baru':
        return 'Proses Pesanan';

      case 'Diproses':
        return 'Tandai Siap';

      case 'Siap':
        return 'Selesaikan Pesanan';

      default:
        return null;
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#2C241E]">

      {/* SIDEBAR */}

      <AdminSidebar
        activePage="orders"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* MAIN */}

      <div className="min-h-screen lg:pl-[280px]">

        <AdminHeader
          title="Pesanan"
          description="Kelola pesanan customer dari masuk hingga selesai."
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          onLogout={onLogout}
        />

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">

          {/* INTRO */}

          <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">

                <ShoppingBag className="h-3.5 w-3.5" />

                Order Management

              </div>

              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#241305] sm:text-3xl">

                Pesanan Customer

              </h2>

              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-stone-400 sm:text-sm">

                Pantau dan proses pesanan customer
                secara terstruktur.

              </p>

            </div>

            {newOrders > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">

                  <Bell className="h-4 w-4" />

                </div>

                <div>

                  <p className="text-xs font-extrabold text-[#3A1E08]">

                    Pesanan baru

                  </p>

                  <p className="mt-0.5 text-[10px] text-amber-800/60">

                    {newOrders} pesanan menunggu
                    diproses

                  </p>

                </div>

              </div>
            )}

          </section>

          {/* ERROR */}

          {errorMessage && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>

                <p className="text-xs font-extrabold text-red-700">

                  Tidak dapat mengambil data pesanan

                </p>

                <p className="mt-1 text-[10px] leading-relaxed text-red-600">

                  {errorMessage}

                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadOrders(true)
                  }
                  className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-red-700"
                >
                  Coba Lagi
                </button>

              </div>

            </div>
          )}

          {/* STATS */}

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <AdminStatCard
              title="Pesanan Baru"
              value={String(
                newOrders
              )}
              description="Menunggu diproses"
              icon={Bell}
              iconStyle="orange"
            />

            <AdminStatCard
              title="Sedang Diproses"
              value={String(
                processingOrders
              )}
              description="Dalam proses produksi"
              icon={Clock3}
              iconStyle="amber"
            />

            <AdminStatCard
              title="Siap Diambil"
              value={String(
                readyOrders
              )}
              description="Menunggu customer"
              icon={Package}
              iconStyle="green"
            />

            <AdminStatCard
              title="Penjualan Hari Ini"
              value={
                todayRevenue >=
                1000000
                  ? `Rp${(
                      todayRevenue /
                      1000000
                    ).toFixed(
                      1
                    )}jt`
                  : formatRupiah(
                      todayRevenue
                    )
              }
              description="Pesanan tidak dibatalkan"
              icon={ShoppingBag}
              iconStyle="dark"
            />

          </section>

          {/* ORDERS TABLE */}

          <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(58,30,8,0.04)]">

            {/* TOOLBAR */}

            <div className="flex flex-col gap-4 border-b border-stone-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

             <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-extrabold text-[#241305]">
                  Daftar Pesanan
                </h3>

                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-bold tracking-wide text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  LIVE
                </span>

                <span className="rounded-full bg-[#3A1E08] px-2.5 py-1 text-[8px] font-bold text-white">
                  {filteredOrders.length} PESANAN
                </span>
              </div>

              <p className="mt-1.5 text-xs text-stone-400">
                Data diperbarui otomatis setiap 3 detik
              </p>
            </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                {/* SEARCH */}

                <div className="relative">

                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                  <input
                    type="search"
                    value={
                      searchQuery
                    }
                    onChange={(
                      event
                    ) =>
                      setSearchQuery(
                        event.target
                          .value
                      )
                    }
                    placeholder="Cari pesanan..."
                    className="h-10 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] pl-10 pr-4 text-xs text-stone-700 outline-none placeholder:text-stone-400 transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:w-56"
                  />

                </div>

                {/* FILTER */}

                <div className="relative">

                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />

                  <select
                    value={
                      statusFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setStatusFilter(
                        event.target
                          .value as
                          | 'Semua'
                          | OrderStatus
                      )
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-stone-200 bg-[#FCFAF7] pl-9 pr-8 text-xs font-semibold text-stone-600 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 sm:w-40"
                  >
                    {STATUS_OPTIONS.map(
                      (
                        status
                      ) => (
                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {status ===
                          'Semua'
                            ? 'Semua Status'
                            : status}
                        </option>
                      )
                    )}
                  </select>

                </div>

              </div>

            </div>

            {/* LOADING */}

            {isLoading ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

                <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-600" />

                <p className="mt-4 text-xs font-semibold text-stone-500">

                  Mengambil data pesanan...

                </p>

                <p className="mt-1 text-[10px] text-stone-400">

                  Menghubungkan ke database MySQL

                </p>

              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}

                <div className="hidden overflow-x-auto lg:block">

                  <table className="w-full min-w-[1050px]">

                    <thead>

                      <tr className="border-b border-stone-100 bg-[#FCFAF7]">

                        <th className="px-6 py-4 text-left text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                          Pesanan
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                          Customer
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                          Item
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                          Pembayaran
                        </th>

                        <th className="px-4 py-4 text-right text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                          Total
                        </th>

                        <th className="px-4 py-4 text-center text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                          Status
                        </th>

                        <th className="px-6 py-4 text-right text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredOrders.map(
                        (
                          order
                        ) => (
                          <tr
                            key={
                              order.id
                            }
                            className="border-b border-stone-100 last:border-0 hover:bg-[#FCFAF7]/70"
                          >

                            <td className="px-6 py-4">

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedOrder(
                                    order
                                  )
                                }
                                className="text-left"
                              >

                                <p className="text-xs font-extrabold text-[#3A1E08] hover:text-amber-700">
                                  {
                                    order.id
                                  }
                                </p>

                                <p className="mt-1 text-[9px] text-stone-400">
                                  {
                                    order.createdAt
                                  }
                                </p>

                              </button>

                            </td>

                            <td className="px-4 py-4">

                              <p className="text-xs font-bold text-[#241305]">
                                {
                                  order.customerName
                                }
                              </p>

                              <p className="mt-1 text-[9px] text-stone-400">
                                {
                                  order.deliveryMethod
                                }
                              </p>

                            </td>

                            <td className="max-w-[220px] px-4 py-4">

                              <p className="truncate text-xs font-semibold text-stone-600">

                                {
                                  order
                                    .items[0]
                                    ?.name ||
                                  'Tidak ada item'
                                }

                                {order
                                  .items
                                  .length >
                                  1 &&
                                  ` + ${
                                    order
                                      .items
                                      .length -
                                    1
                                  } lainnya`}

                              </p>

                              <p className="mt-1 text-[9px] text-stone-400">

                                {order.items.reduce(
                                  (
                                    total,
                                    item
                                  ) =>
                                    total +
                                    item.quantity,
                                  0
                                )}{' '}
                                produk

                              </p>

                            </td>

                            <td className="px-4 py-4">

                              <p className="text-[10px] font-semibold text-stone-600">
                                {
                                  order.paymentMethod
                                }
                              </p>

                              <span
                                className={`mt-1 inline-block rounded-md px-2 py-1 text-[8px] font-bold ${
                                  order.paymentStatus ===
                                  'Terverifikasi'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : order.paymentStatus ===
                                      'Dibayar'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {
                                  order.paymentStatus
                                }
                              </span>

                            </td>

                            <td className="px-4 py-4 text-right">

                              <p className="text-xs font-extrabold text-[#241305]">
                                {formatRupiah(
                                  order.total
                                )}
                              </p>

                            </td>

                            <td className="px-4 py-4 text-center">

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${getStatusClass(
                                  order.status
                                )}`}
                              >

                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                    order.status
                                  )}`}
                                />

                                {
                                  order.status
                                }

                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <div className="flex justify-end gap-1">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedOrder(
                                      order
                                    )
                                  }
                                  title="Lihat detail"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-amber-50 hover:text-amber-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {getNextStatus(
                                  order.status
                                ) && (
                                  <button
                                    type="button"
                                    disabled={
                                      isUpdatingStatus
                                    }
                                    onClick={() =>
                                      updateOrderStatus(
                                        order.id,
                                        getNextStatus(
                                          order.status
                                        )!
                                      )
                                    }
                                    title={
                                      getNextStatusLabel(
                                        order.status
                                      ) ||
                                      ''
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                )}

                              </div>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {/* MOBILE */}

                <div className="divide-y divide-stone-100 lg:hidden">

                  {filteredOrders.map(
                    (
                      order
                    ) => (
                      <div
                        key={
                          order.id
                        }
                        className="p-5"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedOrder(
                                  order
                                )
                              }
                              className="text-xs font-extrabold text-[#3A1E08]"
                            >
                              {
                                order.id
                              }
                            </button>

                            <p className="mt-1 text-[9px] text-stone-400">
                              {
                                order.createdAt
                              }
                            </p>

                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${getStatusClass(
                              order.status
                            )}`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                order.status
                              )}`}
                            />

                            {
                              order.status
                            }

                          </span>

                        </div>

                        <div className="mt-4 rounded-xl bg-[#FCFAF7] p-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                              <User className="h-4 w-4" />
                            </div>

                            <div>

                              <p className="text-xs font-bold text-[#241305]">
                                {
                                  order.customerName
                                }
                              </p>

                              <p className="mt-0.5 text-[9px] text-stone-400">
                                {
                                  order.phone
                                }
                              </p>

                            </div>

                          </div>

                          <div className="mt-4 flex items-start gap-2">
                            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3">
                          <div>
                            <p className="text-[9px] text-stone-400">
                              Pembayaran
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-stone-600">
                              {order.paymentMethod}
                            </p>
                          </div>

                          <span
                            className={`rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${
                              order.paymentStatus === 'Terverifikasi'
                                ? 'bg-emerald-50 text-emerald-700'
                                : order.paymentStatus === 'Dibayar'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>

                            <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />

                            <p className="text-[10px] leading-relaxed text-stone-500">

                              {
                                order
                                  .items[0]
                                  ?.name ||
                                'Tidak ada item'
                              }

                              {order
                                .items
                                .length >
                                1 &&
                                ` + ${
                                  order
                                    .items
                                    .length -
                                  1
                                } lainnya`}

                            </p>

                          </div>

                        </div>

                        <div className="mt-4 flex items-center justify-between">

                          <div>

                            <p className="text-[9px] text-stone-400">
                              Total
                            </p>

                            <p className="mt-0.5 text-sm font-extrabold text-[#241305]">
                              {formatRupiah(
                                order.total
                              )}
                            </p>

                          </div>

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedOrder(
                                  order
                                )
                              }
                              className="flex h-9 items-center gap-2 rounded-lg border border-stone-200 px-3 text-[9px] font-bold text-stone-500"
                            >

                              <Eye className="h-3.5 w-3.5" />

                              Detail

                            </button>

                            {getNextStatus(
                              order.status
                            ) && (
                              <button
                                type="button"
                                disabled={
                                  isUpdatingStatus
                                }
                                onClick={() =>
                                  updateOrderStatus(
                                    order.id,
                                    getNextStatus(
                                      order.status
                                    )!
                                  )
                                }
                                className="flex h-9 items-center gap-2 rounded-lg bg-[#3A1E08] px-3 text-[9px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                <ChevronRight className="h-3.5 w-3.5" />

                                Lanjut

                              </button>
                            )}

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

                {filteredOrders.length ===
                  0 && (
                  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8F4EE] text-stone-400">

                      <Search className="h-6 w-6" />

                    </div>

                    <h4 className="mt-4 text-sm font-bold text-[#241305]">

                      {orders.length ===
                      0
                        ? 'Belum ada pesanan'
                        : 'Pesanan tidak ditemukan'}

                    </h4>

                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-stone-400">
                      {orders.length === 0
                        ? 'Pesanan dari customer akan muncul di sini setelah customer melakukan checkout.'
                        : 'Tidak ada pesanan yang sesuai dengan pencarian atau filter yang dipilih.'}
                    </p>

                  </div>
                )}

              </>
            )}

          </section>

          <footer className="py-8 text-center text-[10px] text-stone-400">

            Pisang Melt Admin Panel • Order Management

          </footer>

        </main>
      </div>

      {/* DETAIL MODAL */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241305]/50 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedOrder(
                null
              );
            }
          }}
        >

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-[0_30px_80px_rgba(36,19,5,0.22)]">

            {/* HEADER */}

              <div className="mt-5 flex items-center justify-between rounded-xl border border-stone-100 bg-[#FBF8F3] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                  <CreditCard className="h-4 w-4 text-[#3A1E08]" />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                    Pembayaran
                  </p>
                  <p className="mt-0.5 text-xs font-extrabold text-[#3A1E08]">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-[8px] font-extrabold ${
                  selectedOrder.paymentStatus === 'Terverifikasi'
                    ? 'bg-emerald-50 text-emerald-600'
                    : selectedOrder.paymentStatus === 'Dibayar'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {selectedOrder.paymentStatus}
              </span>
            </div>

            <div className="p-6 sm:p-7">

              {/* CUSTOMER */}

              <div className="rounded-2xl bg-[#FCFAF7] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">

                    <User className="h-4 w-4" />

                  </div>

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">

                      Customer

                    </p>

                    <p className="mt-0.5 text-sm font-extrabold text-[#241305]">

                      {
                        selectedOrder.customerName
                      }

                    </p>

                  </div>

                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div className="flex items-center gap-2">

                    <Phone className="h-3.5 w-3.5 text-stone-400" />

                    <span className="text-[10px] text-stone-500">

                      {
                        selectedOrder.phone
                      }

                    </span>

                  </div>

                  <div className="flex items-start gap-2">

                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />

                    <span className="text-[10px] leading-relaxed text-stone-500">

                      {
                        selectedOrder.address ||
                        '-'
                      }

                    </span>

                  </div>

                </div>

              </div>

              {/* ITEMS */}

              <div className="mt-6">

                <div className="flex items-center gap-2">

                  <Package className="h-4 w-4 text-amber-600" />

                  <h4 className="font-display text-sm font-extrabold text-[#241305]">

                    Detail Pesanan

                  </h4>

                </div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200">

                  {selectedOrder.items.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className={`flex items-start justify-between gap-4 p-4 ${
                          index !==
                          selectedOrder
                            .items
                            .length -
                            1
                            ? 'border-b border-stone-100'
                            : ''
                        }`}
                      >

                        <div className="flex gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[10px] font-extrabold text-amber-700">

                            {
                              item.quantity
                            }x

                          </div>

                          <div>

                            <p className="text-xs font-bold text-[#241305]">

                              {
                                item.name
                              }

                            </p>

                            {item.toppings &&
                              item.toppings
                                .length >
                                0 && (
                                <p className="mt-1 text-[9px] text-stone-400">

                                  Topping:{' '}

                                  {item.toppings.join(
                                    ', '
                                  )}

                                </p>
                              )}

                            {item.notes && (
                              <p className="mt-1 text-[9px] text-stone-400">

                                Catatan:{' '}

                                {
                                  item.notes
                                }

                              </p>
                            )}

                          </div>

                        </div>

                        <p className="shrink-0 text-xs font-bold text-stone-600">

                          {formatRupiah(
                            item.price *
                              item.quantity
                          )}

                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* SUMMARY */}

              <div className="mt-6 rounded-2xl border border-stone-200 p-4">

                <div className="flex justify-between text-[10px] text-stone-500">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    {formatRupiah(
                      selectedOrder.subtotal
                    )}
                  </span>

                </div>

                {selectedOrder.discount >
                  0 && (
                  <div className="mt-2 flex justify-between text-[10px] text-emerald-600">

                    <span>
                      Diskon
                    </span>

                    <span>
                      -
                      {formatRupiah(
                        selectedOrder.discount
                      )}
                    </span>

                  </div>
                )}

                <div className="mt-2 flex justify-between text-[10px] text-stone-500">

                  <span>
                    Biaya Pengiriman
                  </span>

                  <span>
                    {selectedOrder.deliveryFee ===
                    0
                      ? 'Gratis'
                      : formatRupiah(
                          selectedOrder.deliveryFee
                        )}
                  </span>

                </div>

                <div className="mt-3 flex justify-between border-t border-stone-100 pt-3">

                  <span className="text-xs font-extrabold text-[#241305]">

                    Total Pembayaran

                  </span>

                  <span className="text-sm font-extrabold text-[#3A1E08]">

                    {formatRupiah(
                      selectedOrder.total
                    )}

                  </span>

                </div>

              </div>

              {/* PAYMENT */}

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-xl bg-[#FCFAF7] p-4">

                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">

                    Metode Pembayaran

                  </p>

                  <p className="mt-1.5 text-xs font-bold text-stone-600">

                    {
                      selectedOrder.paymentMethod
                    }

                  </p>

                  <span
                    className={`mt-2 inline-block rounded-md px-2 py-1 text-[8px] font-bold ${
                      selectedOrder.paymentStatus ===
                      'Terverifikasi'
                        ? 'bg-emerald-50 text-emerald-700'
                        : selectedOrder.paymentStatus ===
                          'Dibayar'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >

                    {
                      selectedOrder.paymentStatus
                    }

                  </span>
                 <div className="mt-3 grid grid-cols-3 gap-2">
                {(
                  [
                    'Menunggu',
                    'Dibayar',
                    'Terverifikasi',
                  ] as PaymentStatus[]
                ).map((paymentStatus) => {
                  const isActive =
                    selectedOrder.paymentStatus === paymentStatus;

                  return (
                    <button
                      key={paymentStatus}
                      type="button"
                      disabled={
                        isActive ||
                        isUpdatingPayment
                      }
                      onClick={() =>
                        updatePaymentStatus(
                          selectedOrder.id,
                          paymentStatus
                        )
                      }
                      className={`flex h-10 items-center justify-center rounded-xl text-[9px] font-bold transition-all ${
                      selectedOrder.paymentStatus === paymentStatus
                        ? paymentStatus === 'Terverifikasi'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : paymentStatus === 'Dibayar'
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-amber-500 text-white shadow-sm'
                        : 'border border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                    } ${
                      isUpdatingPayment
                        ? 'cursor-wait opacity-60'
                        : ''
                    }`}
                    >
                      {isActive && (
                        <Check className="mr-1 inline h-3 w-3" />
                      )}

                      {paymentStatus}
                    </button>
                  );
                })}
              </div>

                </div>

                <div className="rounded-xl bg-[#FCFAF7] p-4">

                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">

                    Pengiriman

                  </p>

                  <p className="mt-1.5 text-xs font-bold text-stone-600">

                    {
                      selectedOrder.deliveryMethod
                    }

                  </p>

                </div>

              </div>

              {/* NOTES */}

              {selectedOrder.notes && (
                <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/60 p-4">

                  <div className="flex gap-2">

                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">

                        Catatan Customer

                      </p>

                      <p className="mt-1 text-[10px] leading-relaxed text-amber-900/70">

                        {
                          selectedOrder.notes
                        }

                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* STATUS */}

              <div className="mt-7">

                <p className="mb-3 text-[9px] font-bold uppercase tracking-wider text-stone-400">

                  Ubah Status Pesanan

                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                  {(
                    [
                      'Baru',
                      'Diproses',
                      'Siap',
                      'Selesai',
                    ] as OrderStatus[]
                  ).map(
                    (
                      status
                    ) => (
                      <button
                        key={
                          status
                        }
                        type="button"
                        disabled={
                          selectedOrder.status ===
                            status ||
                          isUpdatingStatus
                        }
                        onClick={() =>
                          updateOrderStatus(
                            selectedOrder.id,
                            status
                          )
                        }
                        className={`
                          h-10 rounded-xl text-[9px] font-bold transition-all
                          ${
                            selectedOrder.status ===
                            status
                              ? `${getStatusClass(
                                  status
                                )} cursor-default`
                              : 'border border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700'
                          }
                          disabled:cursor-not-allowed disabled:opacity-60
                        `}
                      >

                        {selectedOrder.status ===
                          status && (
                          <Check className="mr-1 inline h-3 w-3" />
                        )}

                        {
                          status
                        }

                      </button>
                    )
                  )}

                </div>

                {selectedOrder.status !==
                  'Selesai' &&
                  selectedOrder.status !==
                    'Dibatalkan' &&
                  getNextStatus(
                    selectedOrder.status
                  ) && (
                    <button
                      type="button"
                      disabled={
                        isUpdatingStatus
                      }
                      onClick={() =>
                        updateOrderStatus(
                          selectedOrder.id,
                          getNextStatus(
                            selectedOrder.status
                          )!
                        )
                      }
                      className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3A1E08] text-xs font-bold text-white transition-colors hover:bg-[#241305] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {isUpdatingStatus
                        ? 'Menyimpan...'
                        : getNextStatusLabel(
                            selectedOrder.status
                          )}

                      {!isUpdatingStatus && (
                        <ArrowRight className="h-4 w-4" />
                      )}

                    </button>
                  )}

                {selectedOrder.status !==
                  'Dibatalkan' && (
                  <button
                    type="button"
                    disabled={
                      isUpdatingStatus
                    }
                    onClick={() =>
                      updateOrderStatus(
                        selectedOrder.id,
                        'Dibatalkan'
                      )
                    }
                    className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <X className="h-3.5 w-3.5" />

                    Batalkan Pesanan

                  </button>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[150] -translate-x-1/2 px-4 sm:left-auto sm:right-6 sm:translate-x-0">

          <div className="flex min-w-[280px] items-center gap-3 rounded-xl bg-[#3A1E08] px-4 py-3 text-white shadow-[0_15px_40px_rgba(58,30,8,0.2)]">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">

              <Check className="h-4 w-4" />

            </div>

            <span className="text-xs font-semibold">

              {toast}

            </span>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminOrders;