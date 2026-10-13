import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Package,
  PieChart,
  Printer,
  ShoppingBag,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react';

import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatCard from '../../components/admin/AdminStatCard';

interface AdminReportsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type Period = 'today' | '7days' | '30days' | '3months';

interface SalesData {
  label: string;
  revenue: number;
  orders: number;
}

interface ProductSales {
  name: string;
  category: string;
  sold: number;
  revenue: number;
  percentage: number;
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const reportData: Record<
  Period,
  {
    label: string;
    revenue: number;
    orders: number;
    customers: number;
    averageOrder: number;
    growth: number;
    sales: SalesData[];
  }
> = {
  today: {
    label: 'Hari Ini',
    revenue: 485000,
    orders: 18,
    customers: 16,
    averageOrder: 26944,
    growth: 12.5,
    sales: [
      { label: '08.00', revenue: 45000, orders: 2 },
      { label: '10.00', revenue: 78000, orders: 3 },
      { label: '12.00', revenue: 125000, orders: 5 },
      { label: '14.00', revenue: 82000, orders: 3 },
      { label: '16.00', revenue: 67000, orders: 2 },
      { label: '18.00', revenue: 88000, orders: 3 },
    ],
  },

  '7days': {
    label: '7 Hari Terakhir',
    revenue: 3285000,
    orders: 128,
    customers: 97,
    averageOrder: 25664,
    growth: 18.4,
    sales: [
      { label: 'Sen', revenue: 385000, orders: 15 },
      { label: 'Sel', revenue: 420000, orders: 17 },
      { label: 'Rab', revenue: 515000, orders: 21 },
      { label: 'Kam', revenue: 460000, orders: 18 },
      { label: 'Jum', revenue: 625000, orders: 24 },
      { label: 'Sab', revenue: 540000, orders: 20 },
      { label: 'Min', revenue: 340000, orders: 13 },
    ],
  },

  '30days': {
    label: '30 Hari Terakhir',
    revenue: 12485000,
    orders: 486,
    customers: 312,
    averageOrder: 25689,
    growth: 21.7,
    sales: [
      { label: 'Minggu 1', revenue: 2750000, orders: 108 },
      { label: 'Minggu 2', revenue: 3150000, orders: 122 },
      { label: 'Minggu 3', revenue: 2985000, orders: 116 },
      { label: 'Minggu 4', revenue: 3600000, orders: 140 },
    ],
  },

  '3months': {
    label: '3 Bulan Terakhir',
    revenue: 36850000,
    orders: 1428,
    customers: 684,
    averageOrder: 25805,
    growth: 26.8,
    sales: [
      { label: 'Agustus', revenue: 10250000, orders: 398 },
      { label: 'September', revenue: 12100000, orders: 462 },
      { label: 'Oktober', revenue: 15000000, orders: 568 },
    ],
  },
};

const productSales: ProductSales[] = [
  {
    name: 'Pisang Crispy Cokelat',
    category: 'Pisang Crispy',
    sold: 142,
    revenue: 2556000,
    percentage: 82,
  },
  {
    name: 'Pisang Crispy Keju',
    category: 'Pisang Crispy',
    sold: 118,
    revenue: 2124000,
    percentage: 69,
  },
  {
    name: 'Bundle Party',
    category: 'Bundle',
    sold: 86,
    revenue: 4730000,
    percentage: 55,
  },
  {
    name: 'Pisang Crispy Cokelat Keju',
    category: 'Pisang Crispy',
    sold: 94,
    revenue: 2068000,
    percentage: 62,
  },
  {
    name: 'Pisang Nugget Keju',
    category: 'Pisang Nugget',
    sold: 76,
    revenue: 1520000,
    percentage: 48,
  },
];

const paymentData = [
  {
    name: 'QRIS',
    count: 186,
    percentage: 38,
    amount: 4850000,
  },
  {
    name: 'GoPay',
    count: 108,
    percentage: 22,
    amount: 2750000,
  },
  {
    name: 'DANA',
    count: 82,
    percentage: 17,
    amount: 2145000,
  },
  {
    name: 'Virtual Account',
    count: 63,
    percentage: 13,
    amount: 1680000,
  },
  {
    name: 'COD',
    count: 47,
    percentage: 10,
    amount: 1055000,
  },
];

const statusData = [
  {
    name: 'Selesai',
    count: 386,
    percentage: 79,
    icon: CheckCircle2,
    iconStyle: 'bg-emerald-50 text-emerald-600',
  },
  {
    name: 'Diproses',
    count: 48,
    percentage: 10,
    icon: Clock3,
    iconStyle: 'bg-amber-50 text-amber-600',
  },
  {
    name: 'Siap',
    count: 29,
    percentage: 6,
    icon: Package,
    iconStyle: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Dibatalkan',
    count: 23,
    percentage: 5,
    icon: XCircle,
    iconStyle: 'bg-red-50 text-red-600',
  },
];

const periodOptions: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: '30days', label: '30 Hari' },
  { value: '3months', label: '3 Bulan' },
];

const AdminReports: React.FC<AdminReportsProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [period, setPeriod] = useState<Period>('7days');
  const [toast, setToast] = useState('');

  const currentData = reportData[period];

  const maxRevenue = useMemo(() => {
    return Math.max(...currentData.sales.map((item) => item.revenue));
  }, [currentData]);

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    showToast('Laporan berhasil disiapkan untuk diekspor.');
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#241305]">
      <div className="print:hidden">
        <AdminSidebar
          activePage="reports"
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      </div>

      <div className="lg:pl-[270px]">
        <div className="print:hidden">
          <AdminHeader
            title="Laporan Penjualan"
            description="Analisis performa penjualan dan aktivitas bisnis."
            onLogout={onLogout}
          />
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1500px] space-y-6">
            {/* Page Header */}
            <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  <BarChart3 className="h-4 w-4" />
                  Business Analytics
                </div>

                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#241305] sm:text-3xl">
                  Laporan & Analitik
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">
                  Pantau perkembangan penjualan, produk terlaris, pembayaran,
                  dan status pesanan Pisang Melt.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
                >
                  <Download className="h-4 w-4" />
                  Ekspor
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#3A1E08] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4B260A]"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Laporan
                </button>
              </div>
            </section>

            {/* Period Filter */}
            <section className="flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#241305]">
                    Periode Laporan
                  </p>
                  <p className="text-xs text-stone-500">
                    Data berdasarkan periode yang dipilih.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriod(option.value)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                      period === option.value
                        ? 'bg-[#3A1E08] text-white shadow-sm'
                        : 'bg-stone-50 text-stone-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                title="Total Penjualan"
                value={formatRupiah(currentData.revenue)}
                description={currentData.label}
                icon={Wallet}
                trend={currentData.growth}
                trendLabel="vs periode sebelumnya"
                iconStyle="dark"
              />

              <AdminStatCard
                title="Total Pesanan"
                value={formatNumber(currentData.orders)}
                description={`${currentData.customers} pelanggan`}
                icon={ShoppingBag}
                trend={14.2}
                trendLabel="jumlah pesanan"
                iconStyle="amber"
              />

              <AdminStatCard
                title="Rata-rata Pesanan"
                value={formatRupiah(currentData.averageOrder)}
                description="Nilai rata-rata transaksi"
                icon={TrendingUp}
                trend={7.8}
                trendLabel="nilai transaksi"
                iconStyle="green"
              />

              <AdminStatCard
                title="Pelanggan"
                value={formatNumber(currentData.customers)}
                description="Pelanggan pada periode"
                icon={Package}
                trend={11.5}
                trendLabel="pertumbuhan pelanggan"
                iconStyle="orange"
              />
            </section>

            {/* Revenue Chart */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <BarChart3 className="h-4 w-4" />
                    </div>

                    <h2 className="font-display text-lg font-extrabold text-[#241305]">
                      Tren Penjualan
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-stone-500">
                    Performa pendapatan berdasarkan {currentData.label.toLowerCase()}.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  <ArrowUpRight className="h-4 w-4" />
                  +{currentData.growth}% dibanding periode sebelumnya
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="flex min-w-[620px] items-end gap-4 sm:gap-6">
                  {currentData.sales.map((item) => {
                    const height = Math.max(
                      12,
                      Math.round((item.revenue / maxRevenue) * 100),
                    );

                    return (
                      <div
                        key={item.label}
                        className="flex min-w-[65px] flex-1 flex-col items-center gap-3"
                      >
                        <div className="relative flex h-64 w-full items-end justify-center rounded-xl bg-stone-50 p-2">
                          <div
                            className="group relative w-full max-w-[58px] rounded-lg bg-gradient-to-t from-[#3A1E08] to-amber-500 transition-all duration-500 hover:from-[#4B260A] hover:to-amber-400"
                            style={{ height: `${height}%` }}
                          >
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#241305] px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                              {formatRupiah(item.revenue)}
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-xs font-bold text-stone-600">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-[10px] text-stone-400">
                            {item.orders} order
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-stone-100 pt-4 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3A1E08]" />
                  Pendapatan
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Jumlah pesanan
                </div>
              </div>
            </section>

            {/* Product + Payment */}
            <section className="grid gap-6 xl:grid-cols-5">
              {/* Product Sales */}
              <div className="xl:col-span-3 rounded-2xl border border-stone-200/80 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Package className="h-4 w-4" />
                      </div>

                      <h2 className="font-display text-lg font-extrabold text-[#241305]">
                        Produk Terlaris
                      </h2>
                    </div>

                    <p className="mt-2 text-sm text-stone-500">
                      Produk dengan kontribusi penjualan tertinggi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('products')}
                    className="text-sm font-bold text-amber-700 hover:text-amber-800"
                  >
                    Kelola Produk →
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {productSales.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A1E08] font-display text-sm font-extrabold text-white">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#241305]">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {product.category} • {product.sold} terjual
                          </p>
                        </div>
                      </div>

                      <div className="w-full sm:max-w-[180px]">
                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-stone-400">
                          <span>Kontribusi</span>
                          <span>{product.percentage}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#3A1E08] to-amber-500"
                            style={{ width: `${product.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 text-left sm:w-28 sm:text-right">
                        <p className="text-sm font-extrabold text-[#241305]">
                          {formatRupiah(product.revenue)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-stone-400">
                          pendapatan
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="xl:col-span-2 rounded-2xl border border-stone-200/80 bg-white shadow-sm">
                <div className="border-b border-stone-100 p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <PieChart className="h-4 w-4" />
                    </div>

                    <h2 className="font-display text-lg font-extrabold text-[#241305]">
                      Metode Pembayaran
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-stone-500">
                    Distribusi transaksi berdasarkan metode pembayaran.
                  </p>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  {paymentData.map((payment) => (
                    <div key={payment.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#241305]">
                            {payment.name}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {payment.count} transaksi
                          </p>
                        </div>

                        <p className="text-sm font-extrabold text-[#241305]">
                          {payment.percentage}%
                        </p>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${payment.percentage}%` }}
                        />
                      </div>

                      <p className="mt-1.5 text-right text-[10px] font-semibold text-stone-400">
                        {formatRupiah(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Status + Summary */}
            <section className="grid gap-6 lg:grid-cols-3">
              {/* Order Status */}
              <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm">
                <div className="border-b border-stone-100 p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <FileText className="h-4 w-4" />
                    </div>

                    <h2 className="font-display text-lg font-extrabold text-[#241305]">
                      Status Pesanan
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-stone-500">
                    Ringkasan status seluruh pesanan.
                  </p>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  {statusData.map((status) => {
                    const Icon = status.icon;

                    return (
                      <div
                        key={status.name}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${status.iconStyle}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-[#241305]">
                              {status.name}
                            </p>
                            <p className="text-sm font-extrabold text-[#241305]">
                              {status.count}
                            </p>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                            <div
                              className="h-full rounded-full bg-stone-400"
                              style={{ width: `${status.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Business Summary */}
              <div className="lg:col-span-2 rounded-2xl border border-[#3A1E08] bg-[#3A1E08] p-5 text-white shadow-sm sm:p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                      <TrendingUp className="h-4 w-4" />
                      Business Summary
                    </div>

                    <h2 className="font-display text-xl font-extrabold sm:text-2xl">
                      Performa Pisang Melt
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                      Berdasarkan periode {currentData.label.toLowerCase()},
                      penjualan menunjukkan perkembangan positif dengan
                      pertumbuhan sebesar {currentData.growth}%.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 p-5 text-center backdrop-blur-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-[#3A1E08]">
                      <ArrowUpRight className="h-6 w-6" />
                    </div>

                    <p className="mt-3 font-display text-2xl font-extrabold text-amber-300">
                      +{currentData.growth}%
                    </p>

                    <p className="mt-1 text-xs text-white/50">
                      pertumbuhan penjualan
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-white/50">
                      Total Pendapatan
                    </p>
                    <p className="mt-1 text-lg font-extrabold">
                      {formatRupiah(currentData.revenue)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-white/50">
                      Total Transaksi
                    </p>
                    <p className="mt-1 text-lg font-extrabold">
                      {formatNumber(currentData.orders)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-white/50">
                      Rata-rata Order
                    </p>
                    <p className="mt-1 text-lg font-extrabold">
                      {formatRupiah(currentData.averageOrder)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Report Footer */}
            <section className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#241305]">
                    Laporan {currentData.label}
                  </p>
                  <p className="text-xs text-stone-500">
                    Data dapat dicetak untuk kebutuhan administrasi bisnis.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
              >
                <Printer className="h-4 w-4" />
                Cetak Sekarang
              </button>
            </section>

            <footer className="pb-6 text-center text-xs text-stone-400">
              © {new Date().getFullYear()} Pisang Melt Admin Panel. Semua
              laporan bersifat internal.
            </footer>
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-2xl bg-[#241305] px-5 py-3.5 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}

      {/* Print Rules */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            body {
              background: white !important;
            }

            main {
              padding: 0 !important;
            }

            section {
              break-inside: avoid;
            }

            .shadow-sm,
            .shadow-2xl {
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AdminReports;