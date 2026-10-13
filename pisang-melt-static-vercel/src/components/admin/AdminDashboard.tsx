
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Eye,
  Package,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet,
} from 'lucide-react';

import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatCard from '../../components/admin/AdminStatCard';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type OrderStatus =
  | 'Baru'
  | 'Diproses'
  | 'Siap'
  | 'Selesai'
  | 'Dibatalkan';

interface OrderItem {
  id: string;
  customer: string;
  orderId: string;
  items: string;
  total: number;
  status: OrderStatus;
  time: string;
  createdAt: string;
  rawItems: any[];
}

interface ProductRecord {
  id: string | number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  active: boolean;
}

interface ProductPerformance {
  name: string;
  category: string;
  sold: number;
  revenue: number;
}

interface StockItem {
  id: string | number;
  name: string;
  stock: number;
  unit: string;
  minimum: number;
}

const LOW_STOCK_LIMIT = 5;

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const getStatusClass = (status: OrderStatus) => {
  switch (status) {
    case 'Baru':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Diproses':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Siap':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Selesai':
      return 'bg-stone-100 text-stone-600 border-stone-200';
    case 'Dibatalkan':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-stone-100 text-stone-600 border-stone-200';
  }
};

const getOrderStatus = (status: unknown): OrderStatus => {
  const value = String(status ?? '').toLowerCase().trim();

  if (['diproses', 'processing', 'processed'].includes(value)) {
    return 'Diproses';
  }

  if (['siap', 'ready', 'prepared'].includes(value)) {
    return 'Siap';
  }

  if (['selesai', 'completed', 'complete'].includes(value)) {
    return 'Selesai';
  }

  if (['dibatalkan', 'cancelled', 'canceled'].includes(value)) {
    return 'Dibatalkan';
  }

  return 'Baru';
};

const getOrderDate = (order: any): Date => {
  const rawDate =
    order.createdAt ??
    order.created_at ??
    order.orderDate ??
    order.order_date ??
    order.date;

  if (!rawDate) return new Date(0);

  const parsed = new Date(rawDate);

  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

const formatOrderTime = (date: Date) => {
  if (date.getTime() === 0) return '-';

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const readArray = (value: any, key: 'orders' | 'products'): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const parseObject = (value: any): any => {
  if (!value) return {};

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
};

const parseItems = (value: any): any[] => {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const getCustomerName = (order: any): string => {
  const info = parseObject(order.customerInfo ?? order.customer_info);

  return String(
    info.name ??
      info.customerName ??
      info.customer_name ??
      info.fullName ??
      info.full_name ??
      order.customerName ??
      order.customer_name ??
      order.customer ??
      order.name ??
      'Pelanggan'
  );
};

const getItemName = (item: any): string =>
  String(
    item.name ??
      item.productName ??
      item.product_name ??
      item.product?.name ??
      'Produk'
  );

const getItemQuantity = (item: any): number => {
  const quantity = Number(item.quantity ?? item.qty ?? 1);

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

const getItemPrice = (item: any): number => {
  const price = Number(
    item.price ??
      item.unitPrice ??
      item.unit_price ??
      item.product?.price ??
      0
  );

  return Number.isFinite(price) && price >= 0 ? price : 0;
};

const getProductActive = (value: any): boolean =>
  value === true || value === 1 || value === '1';

const getErrorMessage = (response: any, fallback: string) =>
  String(response?.message ?? response?.error ?? fallback);

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [productRecords, setProductRecords] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async (showLoading = false) => {
      if (showLoading && active) setLoading(true);

      try {
        const [ordersResponse, productsResponse] = await Promise.all([
          fetch('/api/orders', {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          }),
          fetch('/api/admin/products', {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          }),
        ]);

        if (ordersResponse.status === 401 || productsResponse.status === 401) {
          throw new Error(
            'Sesi admin berakhir. Silakan login kembali.'
          );
        }

        if (!ordersResponse.ok) {
          throw new Error('Data pesanan gagal dimuat dari server.');
        }

        if (!productsResponse.ok) {
          throw new Error('Data produk gagal dimuat dari server.');
        }

        const ordersPayload = await ordersResponse.json();
        const productsPayload = await productsResponse.json();

        if (ordersPayload?.success === false) {
          throw new Error(
            getErrorMessage(ordersPayload, 'Data pesanan gagal dimuat.')
          );
        }

        if (productsPayload?.success === false) {
          throw new Error(
            getErrorMessage(productsPayload, 'Data produk gagal dimuat.')
          );
        }

        const rawOrders = readArray(ordersPayload, 'orders');
        const rawProducts = readArray(productsPayload, 'products');

        const normalizedOrders: OrderItem[] = rawOrders.map(
          (order: any, index: number) => {
            const date = getOrderDate(order);
            const rawItems = parseItems(
              order.items ?? order.orderItems ?? order.order_items
            );

            const itemText = rawItems.length
              ? rawItems
                  .map(
                    (item: any) =>
                      `${getItemName(item)} (${getItemQuantity(item)})`
                  )
                  .join(', ')
              : '-';

            return {
              id: String(
                order.id ?? order.orderId ?? order.order_id ?? index
              ),
              customer: getCustomerName(order),
              orderId: String(
                order.orderId ??
                  order.order_id ??
                  order.orderNumber ??
                  order.order_number ??
                  order.orderCode ??
                  order.order_code ??
                  `#${order.id ?? index}`
              ),
              items: itemText,
              total: Number(
                order.grandTotal ??
                  order.grand_total ??
                  order.total ??
                  order.totalAmount ??
                  order.total_amount ??
                  0
              ),
              status: getOrderStatus(
                order.status ?? order.orderStatus ?? order.order_status
              ),
              time: formatOrderTime(date),
              createdAt: date.toISOString(),
              rawItems,
            };
          }
        );

        const normalizedProducts: ProductRecord[] = rawProducts.map(
          (product: any, index: number) => ({
            id: product.id ?? index,
            name: String(product.name ?? product.productName ?? 'Produk'),
            category: String(
              product.category ?? product.categoryName ?? 'Produk'
            ),
            price: Number(product.price ?? 0),
            stock: Number(product.stock ?? 0),
            sold: Number(product.sold ?? 0),
            active: getProductActive(product.active),
          })
        );

        normalizedOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        if (active) {
          setOrders(normalizedOrders);
          setProductRecords(normalizedProducts);
          setApiError('');
        }
      } catch (error) {
        if (active) {
          setApiError(
            error instanceof Error
              ? error.message
              : 'Dashboard gagal memuat data.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDashboard(true);

    const intervalId = window.setInterval(() => {
      void loadDashboard(false);
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const todayOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const date = new Date(order.createdAt);

      return (
        date.getTime() > 0 &&
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        order.status !== 'Dibatalkan'
      );
    });
  }, [orders]);

  const todayRevenue = useMemo(() => {
    return todayOrders.reduce((total, order) => {
      return order.status === 'Selesai' ? total + order.total : total;
    }, 0);
  }, [todayOrders]);

  const weeklyOrders = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    return orders.filter((order) => {
      const date = new Date(order.createdAt);

      return (
        date.getTime() > 0 &&
        date >= cutoff &&
        order.status === 'Selesai'
      );
    });
  }, [orders]);

  const weeklyRevenue = useMemo(
    () => weeklyOrders.reduce((total, order) => total + order.total, 0),
    [weeklyOrders]
  );

  const averageOrder =
    weeklyOrders.length > 0 ? weeklyRevenue / weeklyOrders.length : 0;

  const customersToday = useMemo(
    () =>
      new Set(
        todayOrders.map((order) => order.customer.trim().toLowerCase())
      ).size,
    [todayOrders]
  );

  const activeProducts = productRecords.filter(
    (product) => product.active
  ).length;

  const stocks: StockItem[] = productRecords
    .filter(
      (product) =>
        product.active && product.stock <= LOW_STOCK_LIMIT
    )
    .sort((a, b) => a.stock - b.stock)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      unit: 'unit',
      minimum: LOW_STOCK_LIMIT,
    }));

  const lowStock = stocks;

  const products = useMemo(() => {
    const salesByProduct = new Map<
      string,
      { name: string; sold: number; revenue: number; category: string }
    >();

    const categoryByName = new Map(
      productRecords.map((product) => [
        product.name.trim().toLowerCase(),
        product.category,
      ])
    );

    for (const order of orders) {
      if (order.status !== 'Selesai') continue;

      for (const item of order.rawItems) {
        const name = getItemName(item);
        const key = name.trim().toLowerCase();

        if (!key || key === 'produk') continue;

        const quantity = getItemQuantity(item);
        const price = getItemPrice(item);

        const previous = salesByProduct.get(key) ?? {
          name,
          sold: 0,
          revenue: 0,
          category:
            String(item.category ?? item.product?.category ?? '') ||
            categoryByName.get(key) ||
            'Produk',
        };

        previous.sold += quantity;
        previous.revenue += quantity * price;

        salesByProduct.set(key, previous);
      }
    }

    return Array.from(salesByProduct.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((product) => ({
        ...product,
        category: product.category || 'Produk',
      }));
  }, [orders, productRecords]);

  const EmptyState = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div className="px-5 py-10 text-center sm:px-6">
      <p className="text-sm font-semibold text-stone-500">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-stone-400">
        {description}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#2C241E]">
      <AdminSidebar
        activePage="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[280px]">
        <AdminHeader
          title="Dashboard"
          description="Pantau aktivitas dan performa bisnis Pisang Melt."
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <section className="relative overflow-hidden rounded-3xl bg-[#3A1E08] px-6 py-7 text-white shadow-[0_18px_50px_rgba(58,30,8,0.12)] sm:px-8 lg:px-10 lg:py-9">
            <div
              className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[55px] border-amber-300/[0.05]"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-36 right-[22%] h-64 w-64 rounded-full bg-amber-400/[0.06] blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Overview Hari Ini
                </div>

                <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Selamat datang,
                  <span className="text-amber-400">
                    {' '}Administrator.
                  </span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-300">
                  Berikut ringkasan aktivitas Pisang Melt hari ini.
                  Data dashboard mengikuti transaksi dan stok yang tercatat.
                </p>

                {apiError && (
                  <p
                    role="alert"
                    className="mt-3 max-w-xl text-xs font-semibold text-amber-200"
                  >
                    {apiError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('orders')}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-[#3A1E08] shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-amber-400"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Lihat Pesanan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              title="Penjualan Hari Ini"
              value={formatRupiah(todayRevenue)}
              description="Pesanan selesai hari ini"
              icon={Wallet}
              iconStyle="dark"
            />
            <AdminStatCard
              title="Total Pesanan"
              value={String(orders.length)}
              description="Pesanan tercatat"
              icon={ShoppingBag}
              iconStyle="amber"
            />
            <AdminStatCard
              title="Produk Aktif"
              value={String(activeProducts)}
              description="Produk yang tersedia"
              icon={Package}
              iconStyle="orange"
            />
            <AdminStatCard
              title="Stok Menipis"
              value={String(lowStock.length)}
              description={`Stok ${LOW_STOCK_LIMIT} unit atau kurang`}
              icon={TrendingUp}
              iconStyle="green"
            />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(58,30,8,0.04)]">
              <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-[#241305]">
                    Pesanan Terbaru
                  </h3>
                  <p className="mt-1 text-xs text-stone-400">
                    Aktivitas pesanan yang baru masuk.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('orders')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  Lihat semua
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {loading ? (
                <EmptyState
                  title="Memuat pesanan..."
                  description="Sedang mengambil data transaksi."
                />
              ) : orders.length === 0 ? (
                <EmptyState
                  title="Belum ada pesanan"
                  description="Pesanan pelanggan akan muncul di sini setelah tersedia."
                />
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stone-100 text-left">
                          {[
                            'Pelanggan',
                            'Pesanan',
                            'Total',
                            'Status',
                            'Waktu',
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 first:pl-6 last:pr-6"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 6).map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-stone-50 transition-colors last:border-b-0 hover:bg-[#FCFAF7]"
                          >
                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-[#241305]">
                                {order.customer}
                              </p>
                              <p className="mt-1 text-[10px] text-stone-400">
                                {order.orderId}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="max-w-[220px] truncate text-xs text-stone-600">
                                {order.items}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-[#241305]">
                              {formatRupiah(order.total)}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(order.status)}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 text-[10px] text-stone-400">
                                <Clock3 className="h-3 w-3" aria-hidden="true" />
                                {order.time}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-stone-100 md:hidden">
                    {orders.slice(0, 6).map((order) => (
                      <div
                        key={order.id}
                        className="p-4 hover:bg-[#FCFAF7]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#241305]">
                              {order.customer}
                            </p>
                            <p className="mt-1 text-[10px] text-stone-400">
                              {order.orderId}
                            </p>
                            <p className="mt-2 text-xs text-stone-500">
                              {order.items}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${getStatusClass(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#241305]">
                            {formatRupiah(order.total)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-stone-400">
                            <Clock3 className="h-3 w-3" aria-hidden="true" />
                            {order.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(58,30,8,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-[#241305]">
                    Produk Terlaris
                  </h3>
                  <p className="mt-1 text-xs text-stone-400">
                    Produk dengan penjualan tertinggi.
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Utensils className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              {products.length === 0 ? (
                <EmptyState
                  title="Belum ada data penjualan"
                  description="Produk terlaris akan muncul setelah transaksi selesai tercatat."
                />
              ) : (
                <div className="mt-6 space-y-5">
                  {products.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8F4EE] font-display text-xs font-extrabold text-[#3A1E08]">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#241305]">
                          {product.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-stone-400">
                            {product.category}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-stone-300" />
                          <span className="text-[10px] font-semibold text-stone-500">
                            {product.sold} terjual
                          </span>
                        </div>
                      </div>
                      <span className="hidden text-right text-[10px] font-bold text-[#3A1E08] sm:block">
                        {formatRupiah(product.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-[#FCFAF7] py-3 text-xs font-bold text-[#3A1E08] transition-colors hover:border-amber-300 hover:bg-amber-50"
              >
                Kelola Produk
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(58,30,8,0.04)] sm:p-6">
              <div>
                <h3 className="font-display text-lg font-extrabold text-[#241305]">
                  Ringkasan Penjualan
                </h3>
                <p className="mt-1 text-xs text-stone-400">
                  Performa penjualan tujuh hari terakhir.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-[#FCFAF7] p-4">
                  <p className="text-[10px] font-semibold text-stone-400">
                    Hari ini
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-[#241305]">
                    {formatRupiah(todayRevenue)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FCFAF7] p-4">
                  <p className="text-[10px] font-semibold text-stone-400">
                    Pesanan selesai
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-[#241305]">
                    {weeklyOrders.length}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FCFAF7] p-4">
                  <p className="text-[10px] font-semibold text-stone-400">
                    Rata-rata
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-[#241305]">
                    {formatRupiah(averageOrder)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FCFAF7] p-4">
                  <p className="text-[10px] font-semibold text-stone-400">
                    Pelanggan hari ini
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-[#241305]">
                    {customersToday}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex h-40 items-center justify-center rounded-xl bg-[#FCFAF7] p-4 sm:h-48">
                <div className="text-center">
                  <TrendingUp
                    className="mx-auto h-6 w-6 text-stone-300"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-xs font-semibold text-stone-500">
                    {weeklyOrders.length
                      ? `Total penjualan tujuh hari: ${formatRupiah(weeklyRevenue)}`
                      : 'Belum ada data penjualan minggu ini'}
                  </p>
                  <p className="mt-1 text-[10px] text-stone-400">
                    Ringkasan dihitung dari pesanan berstatus selesai.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(58,30,8,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-[#241305]">
                    Stok Menipis
                  </h3>
                  <p className="mt-1 text-xs text-stone-400">
                    Produk aktif dengan stok lima unit atau kurang.
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <Package className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              {lowStock.length === 0 ? (
                <EmptyState
                  title="Belum ada stok menipis"
                  description="Peringatan muncul jika stok produk aktif mencapai lima unit atau kurang."
                />
              ) : (
                <div className="mt-6 space-y-3">
                  {lowStock.slice(0, 5).map((item) => {
                    const minimum = item.minimum;
                    const quantity = Math.max(0, item.stock);

                    return (
                      <div
                        key={String(item.id)}
                        className="rounded-xl border border-stone-100 bg-[#FCFAF7] p-3.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-[#241305]">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[10px] text-stone-400">
                              Batas minimum {minimum} {item.unit}
                            </p>
                          </div>
                          <span className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-extrabold text-red-600">
                            {quantity} {item.unit}
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
                          <div
                            className="h-full rounded-full bg-red-400"
                            style={{
                              width: `${Math.min(
                                (quantity / minimum) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => onNavigate('stocks')}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A1E08] py-3 text-xs font-bold text-white transition-all hover:bg-[#241305]"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Lihat Semua Stok
              </button>
            </div>
          </section>

          <footer className="mt-8 pb-4 text-center text-[10px] text-stone-400">
            Pisang Melt Admin Panel • Sistem Manajemen Internal
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
