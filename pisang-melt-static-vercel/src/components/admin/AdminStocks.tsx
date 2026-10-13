import React, {
  FormEvent,
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ClipboardList,
  Edit3,
  Filter,
  History,
  Package,
  Plus,
  Search,
  TrendingDown,
  X,
} from 'lucide-react';

import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatCard from '../../components/admin/AdminStatCard';

interface AdminStocksProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type StockStatus =
  | 'Aman'
  | 'Menipis'
  | 'Habis';

interface StockItem {
  id: string;
  name: string;
  category:
    | 'Bahan Utama'
    | 'Topping'
    | 'Kemasan'
    | 'Produk Jadi';
  unit: string;
  stock: number;
  minimumStock: number;
  incoming: number;
  outgoing: number;
  lastUpdate: string;
  active: boolean;
}

interface StockHistory {
  id: string;
  itemName: string;
  type: 'Masuk' | 'Keluar';
  quantity: number;
  unit: string;
  note: string;
  date: string;
  time: string;
}

const STOCK_STORAGE_KEY =
  'pisang_melt_stocks';

const HISTORY_STORAGE_KEY =
  'pisang_melt_stock_history';

const INITIAL_STOCKS: StockItem[] = [
  {
    id: 'stock-001',
    name: 'Pisang',
    category: 'Bahan Utama',
    unit: 'kg',
    stock: 18,
    minimumStock: 10,
    incoming: 30,
    outgoing: 12,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-002',
    name: 'Tepung Terigu',
    category: 'Bahan Utama',
    unit: 'kg',
    stock: 14,
    minimumStock: 8,
    incoming: 20,
    outgoing: 6,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-003',
    name: 'Cokelat',
    category: 'Topping',
    unit: 'pack',
    stock: 6,
    minimumStock: 8,
    incoming: 15,
    outgoing: 9,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-004',
    name: 'Keju',
    category: 'Topping',
    unit: 'pack',
    stock: 3,
    minimumStock: 8,
    incoming: 10,
    outgoing: 7,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-005',
    name: 'Susu Kental Manis',
    category: 'Topping',
    unit: 'kaleng',
    stock: 12,
    minimumStock: 5,
    incoming: 15,
    outgoing: 3,
    lastUpdate: '07 Okt 2026',
    active: true,
  },
  {
    id: 'stock-006',
    name: 'Meses',
    category: 'Topping',
    unit: 'pack',
    stock: 9,
    minimumStock: 5,
    incoming: 12,
    outgoing: 3,
    lastUpdate: '07 Okt 2026',
    active: true,
  },
  {
    id: 'stock-007',
    name: 'Box Small',
    category: 'Kemasan',
    unit: 'pcs',
    stock: 85,
    minimumStock: 30,
    incoming: 100,
    outgoing: 15,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-008',
    name: 'Box Large',
    category: 'Kemasan',
    unit: 'pcs',
    stock: 28,
    minimumStock: 30,
    incoming: 50,
    outgoing: 22,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-009',
    name: 'Pisang Crispy Cokelat',
    category: 'Produk Jadi',
    unit: 'box',
    stock: 20,
    minimumStock: 5,
    incoming: 50,
    outgoing: 30,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-010',
    name: 'Pisang Crispy Keju',
    category: 'Produk Jadi',
    unit: 'box',
    stock: 15,
    minimumStock: 5,
    incoming: 40,
    outgoing: 25,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-011',
    name: 'Pisang Nugget Cokelat',
    category: 'Produk Jadi',
    unit: 'box',
    stock: 9,
    minimumStock: 5,
    incoming: 30,
    outgoing: 21,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
  {
    id: 'stock-012',
    name: 'Pisang Nugget Keju',
    category: 'Produk Jadi',
    unit: 'box',
    stock: 4,
    minimumStock: 5,
    incoming: 25,
    outgoing: 21,
    lastUpdate: '08 Okt 2026',
    active: true,
  },
];

const INITIAL_HISTORY: StockHistory[] = [
  {
    id: 'history-001',
    itemName: 'Pisang',
    type: 'Masuk',
    quantity: 20,
    unit: 'kg',
    note: 'Restock bahan utama',
    date: '08 Okt 2026',
    time: '16:20',
  },
  {
    id: 'history-002',
    itemName: 'Keju',
    type: 'Keluar',
    quantity: 3,
    unit: 'pack',
    note: 'Produksi hari ini',
    date: '08 Okt 2026',
    time: '14:15',
  },
  {
    id: 'history-003',
    itemName: 'Box Small',
    type: 'Masuk',
    quantity: 50,
    unit: 'pcs',
    note: 'Pembelian kemasan',
    date: '08 Okt 2026',
    time: '11:40',
  },
  {
    id: 'history-004',
    itemName: 'Cokelat',
    type: 'Keluar',
    quantity: 4,
    unit: 'pack',
    note: 'Penggunaan topping',
    date: '08 Okt 2026',
    time: '10:25',
  },
  {
    id: 'history-005',
    itemName: 'Pisang Crispy Cokelat',
    type: 'Keluar',
    quantity: 8,
    unit: 'box',
    note: 'Pesanan customer',
    date: '08 Okt 2026',
    time: '09:50',
  },
];

const EMPTY_FORM = {
  name: '',
  category:
    'Bahan Utama' as StockItem['category'],
  unit: 'kg',
  stock: '',
  minimumStock: '',
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('id-ID').format(
    value
  );

const getToday = () =>
  new Date().toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );

const getCurrentTime = () =>
  new Date().toLocaleTimeString(
    'id-ID',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );

const getStockStatus = (
  stock: number,
  minimumStock: number
): StockStatus => {
  if (stock <= 0) return 'Habis';

  if (stock <= minimumStock) {
    return 'Menipis';
  }

  return 'Aman';
};


const getStoredStocks = (): StockItem[] => {
  try {
    const stored = localStorage.getItem(
      STOCK_STORAGE_KEY
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(
      'Gagal membaca data stok:',
      error
    );

    return [];
  }
};



const getStoredHistory = (): StockHistory[] => {
  try {
    const stored = localStorage.getItem(
      HISTORY_STORAGE_KEY
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(
      'Gagal membaca riwayat stok:',
      error
    );

    return [];
  }
};


const AdminStocks: React.FC<
  AdminStocksProps
> = ({
  onNavigate,
  onLogout,
}) => {
  const [stocks, setStocks] =
    useState<StockItem[]>(
      getStoredStocks
    );

  const [history, setHistory] =
    useState<StockHistory[]>(
      getStoredHistory
    );

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<
      'Semua' | StockStatus
    >('Semua');

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState<
    'Semua' | StockItem['category']
  >('Semua');

  const [showModal, setShowModal] =
    useState(false);

  const [
    editingStock,
    setEditingStock,
  ] = useState<StockItem | null>(null);

  const [
    showMovementModal,
    setShowMovementModal,
  ] = useState(false);

  const [
    movementType,
    setMovementType,
  ] = useState<'Masuk' | 'Keluar'>(
    'Masuk'
  );

  const [
    selectedStock,
    setSelectedStock,
  ] = useState<StockItem | null>(
    null
  );

  const [
    movementQuantity,
    setMovementQuantity,
  ] = useState('');

  const [
    movementNote,
    setMovementNote,
  ] = useState('');

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [toast, setToast] =
    useState('');

  const totalItems = stocks.length;

  const lowStockCount =
    stocks.filter(
      (stock) =>
        getStockStatus(
          stock.stock,
          stock.minimumStock
        ) === 'Menipis'
    ).length;

  const emptyStockCount =
    stocks.filter(
      (stock) =>
        getStockStatus(
          stock.stock,
          stock.minimumStock
        ) === 'Habis'
    ).length;

  const totalUnits =
    stocks.reduce(
      (total, stock) =>
        total + stock.stock,
      0
    );

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const search =
        searchQuery.toLowerCase();

      const matchesSearch =
        stock.name
          .toLowerCase()
          .includes(search);

      const status =
        getStockStatus(
          stock.stock,
          stock.minimumStock
        );

      const matchesStatus =
        statusFilter === 'Semua' ||
        status === statusFilter;

      const matchesCategory =
        categoryFilter === 'Semua' ||
        stock.category ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    stocks,
    searchQuery,
    statusFilter,
    categoryFilter,
  ]);

  const showToast = (
    message: string
  ) => {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 2500);
  };

 
const saveStocks = (
  updatedStocks: StockItem[]
) => {
  setStocks(updatedStocks);

  try {
    localStorage.setItem(
      STOCK_STORAGE_KEY,
      JSON.stringify(updatedStocks)
    );

    // Memperbarui notifikasi stok di AdminHeader
    // tanpa mengubah struktur halaman yang lama.
    window.dispatchEvent(
      new CustomEvent(
        'pisang-melt-stocks-updated'
      )
    );
  } catch (error) {
    console.error(
      'Gagal menyimpan data stok:',
      error
    );

    showToast(
      'Gagal menyimpan data stok.'
    );
  }
};

  const saveHistory = (
    updatedHistory: StockHistory[]
  ) => {
    setHistory(updatedHistory);

    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error(
        'Gagal menyimpan riwayat stok:',
        error
      );
    }
  };

  const openAddModal = () => {
    setEditingStock(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (
    stock: StockItem
  ) => {
    setEditingStock(stock);

    setForm({
      name: stock.name,
      category: stock.category,
      unit: stock.unit,
      stock: String(stock.stock),
      minimumStock: String(
        stock.minimumStock
      ),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStock(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const stockValue = Number(
      form.stock
    );

    const minimumStockValue =
      Number(form.minimumStock);

    if (
      !form.name.trim() ||
      !form.unit.trim() ||
      form.stock === '' ||
      form.minimumStock === ''
    ) {
      showToast(
        'Mohon lengkapi semua data stok.'
      );

      return;
    }

    if (
      !Number.isFinite(stockValue) ||
      !Number.isFinite(
        minimumStockValue
      )
    ) {
      showToast(
        'Jumlah stok harus berupa angka yang valid.'
      );

      return;
    }

    if (
      stockValue < 0 ||
      minimumStockValue < 0
    ) {
      showToast(
        'Jumlah stok tidak boleh negatif.'
      );

      return;
    }

    if (editingStock) {
      const updatedStocks =
        stocks.map((stock) =>
          stock.id ===
          editingStock.id
            ? {
                ...stock,
                name: form.name.trim(),
                category:
                  form.category,
                unit: form.unit.trim(),
                stock: stockValue,
                minimumStock:
                  minimumStockValue,
                lastUpdate: getToday(),
              }
            : stock
        );

      saveStocks(updatedStocks);

      showToast(
        'Data stok berhasil diperbarui.'
      );
    } else {
      const newStock: StockItem = {
        id: `stock-${Date.now()}`,
        name: form.name.trim(),
        category: form.category,
        unit: form.unit.trim(),
        stock: stockValue,
        minimumStock:
          minimumStockValue,
        incoming: 0,
        outgoing: 0,
        lastUpdate: getToday(),
        active: true,
      };

      const updatedStocks = [
        newStock,
        ...stocks,
      ];

      saveStocks(updatedStocks);

      showToast(
        'Data stok berhasil ditambahkan.'
      );
    }

    closeModal();
  };

  const openMovementModal = (
    stock: StockItem,
    type: 'Masuk' | 'Keluar'
  ) => {
    setSelectedStock(stock);
    setMovementType(type);
    setMovementQuantity('');
    setMovementNote('');
    setShowMovementModal(true);
  };

  const closeMovementModal = () => {
    setShowMovementModal(false);
    setSelectedStock(null);
    setMovementQuantity('');
    setMovementNote('');
  };

  const handleMovement = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedStock) return;

    const quantity = Number(
      movementQuantity
    );

    if (
      !movementQuantity ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      showToast(
        'Jumlah pergerakan stok harus lebih dari 0.'
      );

      return;
    }

    if (
      movementType === 'Keluar' &&
      quantity > selectedStock.stock
    ) {
      showToast(
        'Stok tidak mencukupi untuk transaksi keluar.'
      );

      return;
    }

    const updatedStocks =
      stocks.map((stock) => {
        if (
          stock.id !==
          selectedStock.id
        ) {
          return stock;
        }

        return {
          ...stock,
          stock:
            movementType === 'Masuk'
              ? stock.stock + quantity
              : stock.stock - quantity,
          incoming:
            movementType === 'Masuk'
              ? stock.incoming +
                quantity
              : stock.incoming,
          outgoing:
            movementType === 'Keluar'
              ? stock.outgoing +
                quantity
              : stock.outgoing,
          lastUpdate: getToday(),
        };
      });

    saveStocks(updatedStocks);

    const newHistory: StockHistory = {
      id: `history-${Date.now()}`,
      itemName:
        selectedStock.name,
      type: movementType,
      quantity,
      unit: selectedStock.unit,
      note:
        movementNote.trim() ||
        (movementType === 'Masuk'
          ? 'Penambahan stok'
          : 'Pengurangan stok'),
      date: getToday(),
      time: getCurrentTime(),
    };

    const updatedHistory = [
      newHistory,
      ...history,
    ];

    saveHistory(updatedHistory);

    showToast(
      movementType === 'Masuk'
        ? 'Stok berhasil ditambahkan.'
        : 'Stok berhasil dikurangi.'
    );

    closeMovementModal();
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#2C241E]">
      <AdminSidebar
        activePage="stocks"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="min-h-screen lg:pl-[280px]">
        <AdminHeader
          title="Stok"
          description="Pantau persediaan bahan, kemasan, dan produk jadi."
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          onLogout={onLogout}
        />

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">

          <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <ClipboardList className="h-3.5 w-3.5" />
                Inventory Management
              </div>

              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#241305] sm:text-3xl">
                Persediaan Stok
              </h2>

              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-stone-400 sm:text-sm">
                Pantau jumlah stok dan catat setiap
                pergerakan barang secara teratur.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  if (stocks.length > 0) {
                    openMovementModal(
                      stocks[0],
                      'Masuk'
                    );
                  } else {
                    showToast(
                      'Belum ada data stok.'
                    );
                  }
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-xs font-bold text-[#3A1E08] transition-all hover:border-amber-300 hover:bg-amber-50"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Stok Masuk
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3A1E08] px-5 text-xs font-bold text-white shadow-lg shadow-[#3A1E08]/10 transition-all hover:-translate-y-0.5 hover:bg-[#241305]"
              >
                <Plus className="h-4 w-4" />
                Tambah Stok
              </button>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              title="Jenis Barang"
              value={String(totalItems)}
              description="Item dalam inventori"
              icon={Package}
              iconStyle="dark"
            />

            <AdminStatCard
              title="Total Persediaan"
              value={formatNumber(totalUnits)}
              description="Gabungan seluruh unit"
              icon={ClipboardList}
              iconStyle="amber"
            />

            <AdminStatCard
              title="Stok Menipis"
              value={String(lowStockCount)}
              description="Perlu segera diperhatikan"
              icon={AlertTriangle}
              iconStyle="orange"
            />

            <AdminStatCard
              title="Stok Habis"
              value={String(emptyStockCount)}
              description="Tidak tersedia"
              icon={TrendingDown}
              iconStyle="orange"
            />
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(58,30,8,0.04)]">

            <div className="flex flex-col gap-4 border-b border-stone-100 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="font-display text-lg font-extrabold text-[#241305]">
                  Daftar Persediaan
                </h3>

                <p className="mt-1 text-xs text-stone-400">
                  {filteredStocks.length} item
                  ditampilkan
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                    placeholder="Cari barang..."
                    className="h-10 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] pl-10 pr-4 text-xs text-stone-700 outline-none placeholder:text-stone-400 transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:w-48"
                  />
                </div>

                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target
                          .value as
                          | 'Semua'
                          | StockStatus
                      )
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-stone-200 bg-[#FCFAF7] pl-9 pr-8 text-xs font-semibold text-stone-600 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 sm:w-36"
                  >
                    <option value="Semua">
                      Semua Status
                    </option>
                    <option value="Aman">
                      Aman
                    </option>
                    <option value="Menipis">
                      Menipis
                    </option>
                    <option value="Habis">
                      Habis
                    </option>
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(
                        event.target
                          .value as
                          | 'Semua'
                          | StockItem['category']
                      )
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-stone-200 bg-[#FCFAF7] px-3 pr-8 text-xs font-semibold text-stone-600 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 sm:w-40"
                  >
                    <option value="Semua">
                      Semua Kategori
                    </option>
                    <option value="Bahan Utama">
                      Bahan Utama
                    </option>
                    <option value="Topping">
                      Topping
                    </option>
                    <option value="Kemasan">
                      Kemasan
                    </option>
                    <option value="Produk Jadi">
                      Produk Jadi
                    </option>
                  </select>
                </div>

              </div>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-stone-100 bg-[#FCFAF7]">
                    <th className="px-6 py-4 text-left text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                      Barang
                    </th>
                    <th className="px-4 py-4 text-left text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                      Kategori
                    </th>
                    <th className="px-4 py-4 text-center text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                      Stok Saat Ini
                    </th>
                    <th className="px-4 py-4 text-center text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                      Minimum
                    </th>
                    <th className="px-4 py-4 text-center text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                      Status
                    </th>
                    <th className="px-4 py-4 text-center text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                      Pergerakan
                    </th>
                    <th className="px-6 py-4 text-right text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStocks.map(
                    (stock) => {
                      const status =
                        getStockStatus(
                          stock.stock,
                          stock.minimumStock
                        );

                      return (
                        <tr
                          key={stock.id}
                          className="border-b border-stone-100 last:border-0 hover:bg-[#FCFAF7]/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                <Package className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-xs font-bold text-[#241305]">
                                  {stock.name}
                                </p>

                                <p className="mt-0.5 text-[9px] text-stone-400">
                                  Update:{' '}
                                  {stock.lastUpdate}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-[9px] font-bold text-stone-500">
                              {stock.category}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <p
                              className={`text-sm font-extrabold ${
                                status ===
                                'Habis'
                                  ? 'text-red-600'
                                  : status ===
                                    'Menipis'
                                  ? 'text-amber-600'
                                  : 'text-[#241305]'
                              }`}
                            >
                              {formatNumber(
                                stock.stock
                              )}
                            </p>

                            <p className="text-[9px] text-stone-400">
                              {stock.unit}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="text-xs font-semibold text-stone-500">
                              {formatNumber(
                                stock.minimumStock
                              )}{' '}
                              {stock.unit}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${
                                status ===
                                'Aman'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : status ===
                                    'Menipis'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-600'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  status ===
                                  'Aman'
                                    ? 'bg-emerald-500'
                                    : status ===
                                      'Menipis'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                              />

                              {status}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-3">
                              <div className="text-center">
                                <p className="text-[9px] text-stone-400">
                                  Masuk
                                </p>

                                <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                                  +
                                  {formatNumber(
                                    stock.incoming
                                  )}
                                </p>
                              </div>

                              <div className="h-6 w-px bg-stone-200" />

                              <div className="text-center">
                                <p className="text-[9px] text-stone-400">
                                  Keluar
                                </p>

                                <p className="mt-0.5 text-[10px] font-bold text-red-500">
                                  -
                                  {formatNumber(
                                    stock.outgoing
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  openMovementModal(
                                    stock,
                                    'Masuk'
                                  )
                                }
                                title="Tambah stok"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                              >
                                <ArrowDownToLine className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openMovementModal(
                                    stock,
                                    'Keluar'
                                  )
                                }
                                title="Kurangi stok"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-orange-600 transition-colors hover:bg-orange-50"
                              >
                                <ArrowUpFromLine className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    stock
                                  )
                                }
                                title="Edit stok"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-amber-50 hover:text-amber-700"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
              {filteredStocks.map(
                (stock) => {
                  const status =
                    getStockStatus(
                      stock.stock,
                      stock.minimumStock
                    );

                  return (
                    <div
                      key={stock.id}
                      className="rounded-2xl border border-stone-200 bg-[#FCFAF7] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <Package className="h-4 w-4" />
                          </div>

                          <div>
                            <h4 className="text-xs font-extrabold text-[#241305]">
                              {stock.name}
                            </h4>

                            <p className="mt-0.5 text-[9px] text-stone-400">
                              {stock.category}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-lg px-2 py-1 text-[9px] font-bold ${
                            status ===
                            'Aman'
                              ? 'bg-emerald-50 text-emerald-700'
                              : status ===
                                'Menipis'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[9px] text-stone-400">
                            Stok
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-[#241305]">
                            {formatNumber(
                              stock.stock
                            )}
                          </p>

                          <p className="text-[9px] text-stone-400">
                            {stock.unit}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[9px] text-stone-400">
                            Minimum
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-[#241305]">
                            {formatNumber(
                              stock.minimumStock
                            )}
                          </p>

                          <p className="text-[9px] text-stone-400">
                            {stock.unit}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[9px] text-stone-400">
                            Update
                          </p>

                          <p className="mt-1 text-[10px] font-bold text-stone-600">
                            {stock.lastUpdate}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-[9px] text-stone-400">
                              Masuk
                            </p>

                            <p className="text-[10px] font-bold text-emerald-600">
                              +
                              {formatNumber(
                                stock.incoming
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] text-stone-400">
                              Keluar
                            </p>

                            <p className="text-[10px] font-bold text-red-500">
                              -
                              {formatNumber(
                                stock.outgoing
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openMovementModal(
                                stock,
                                'Masuk'
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
                          >
                            <ArrowDownToLine className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openMovementModal(
                                stock,
                                'Keluar'
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600"
                          >
                            <ArrowUpFromLine className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                stock
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-500"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {filteredStocks.length ===
              0 && (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8F4EE] text-stone-400">
                  <Search className="h-6 w-6" />
                </div>

                <h4 className="mt-4 text-sm font-bold text-[#241305]">
                  Data stok tidak ditemukan
                </h4>

                <p className="mt-1 text-xs text-stone-400">
                  Coba ubah kata pencarian atau
                  filter.
                </p>
              </div>
            )}
          </section>

          {lowStockCount > 0 && (
            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-[#3A1E08]">
                    Perhatian Persediaan
                  </h3>

                  <p className="mt-1 text-[11px] leading-relaxed text-amber-800/70">
                    Terdapat{' '}
                    <strong>
                      {lowStockCount}
                    </strong>{' '}
                    item yang stoknya sudah
                    mencapai batas minimum.
                    Segera lakukan restock agar
                    proses penjualan tetap berjalan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      'Menipis'
                    )
                  }
                  className="h-10 shrink-0 rounded-xl bg-[#3A1E08] px-4 text-[10px] font-bold text-white hover:bg-[#241305]"
                >
                  Lihat Stok Menipis
                </button>
              </div>
            </section>
          )}

          <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(58,30,8,0.04)]">
            <div className="flex flex-col gap-2 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-amber-600" />

                  <h3 className="font-display text-lg font-extrabold text-[#241305]">
                    Riwayat Pergerakan Stok
                  </h3>
                </div>

                <p className="mt-1 text-xs text-stone-400">
                  Aktivitas stok terbaru.
                </p>
              </div>

              <span className="rounded-lg bg-[#F8F4EE] px-3 py-1.5 text-[9px] font-bold text-stone-500">
                {history.length} aktivitas
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {history
                .slice(0, 6)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        item.type ===
                        'Masuk'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      {item.type ===
                      'Masuk' ? (
                        <ArrowDownToLine className="h-4 w-4" />
                      ) : (
                        <ArrowUpFromLine className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-[#241305]">
                          {item.itemName}
                        </p>

                        <span
                          className={`rounded-md px-2 py-0.5 text-[8px] font-bold ${
                            item.type ===
                            'Masuk'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] text-stone-400">
                        {item.note}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <div className="text-right">
                        <p
                          className={`text-xs font-extrabold ${
                            item.type ===
                            'Masuk'
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }`}
                        >
                          {item.type ===
                          'Masuk'
                            ? '+'
                            : '-'}
                          {formatNumber(
                            item.quantity
                          )}{' '}
                          {item.unit}
                        </p>

                        <p className="mt-0.5 text-[9px] text-stone-400">
                          {item.date} •{' '}
                          {item.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <footer className="py-8 text-center text-[10px] text-stone-400">
            Pisang Melt Admin Panel • Inventory
            Management
          </footer>
        </main>
      </div>

      {/* Add / Edit Stock Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241305]/50 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-[0_30px_80px_rgba(36,19,5,0.22)]">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Inventory Management
                </p>

                <h3 className="mt-1 font-display text-xl font-extrabold text-[#241305]">
                  {editingStock
                    ? 'Edit Data Stok'
                    : 'Tambah Data Stok'}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-7"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">
                  <label
                    htmlFor="stock-name"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Nama Barang
                  </label>

                  <input
                    id="stock-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="Contoh: Pisang"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs text-stone-700 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock-category"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Kategori
                  </label>

                  <select
                    id="stock-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category:
                          event.target
                            .value as StockItem['category'],
                      })
                    }
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs font-semibold text-stone-700 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  >
                    <option value="Bahan Utama">
                      Bahan Utama
                    </option>
                    <option value="Topping">
                      Topping
                    </option>
                    <option value="Kemasan">
                      Kemasan
                    </option>
                    <option value="Produk Jadi">
                      Produk Jadi
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="stock-unit"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Satuan
                  </label>

                  <input
                    id="stock-unit"
                    type="text"
                    value={form.unit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        unit: event.target.value,
                      })
                    }
                    placeholder="kg / pack / pcs / box"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs text-stone-700 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock-quantity"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Jumlah Stok
                  </label>

                  <input
                    id="stock-quantity"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        stock: event.target.value,
                      })
                    }
                    placeholder="20"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs text-stone-700 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="minimum-stock"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Batas Minimum
                  </label>

                  <input
                    id="minimum-stock"
                    type="number"
                    min="0"
                    value={form.minimumStock}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        minimumStock:
                          event.target.value,
                      })
                    }
                    placeholder="10"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs text-stone-700 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                  <p className="text-[10px] leading-relaxed text-amber-800/70">
                    Batas minimum digunakan untuk
                    menentukan apakah stok masuk
                    kategori{' '}
                    <strong>
                      Menipis
                    </strong>.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 rounded-xl border border-stone-200 px-5 text-xs font-bold text-stone-500 hover:bg-stone-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3A1E08] px-6 text-xs font-bold text-white transition-colors hover:bg-[#241305]"
                >
                  <Check className="h-4 w-4" />

                  {editingStock
                    ? 'Simpan Perubahan'
                    : 'Tambah Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showMovementModal &&
        selectedStock && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#241305]/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-[0_30px_80px_rgba(36,19,5,0.22)]">

              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
                <div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      movementType ===
                      'Masuk'
                        ? 'text-emerald-600'
                        : 'text-orange-600'
                    }`}
                  >
                    Stok {movementType}
                  </p>

                  <h3 className="mt-1 font-display text-xl font-extrabold text-[#241305]">
                    {selectedStock.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={
                    closeMovementModal
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={
                  handleMovement
                }
                className="p-6"
              >
                <div className="rounded-2xl bg-[#F8F4EE] p-4">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                    Stok Saat Ini
                  </p>

                  <div className="mt-1 flex items-end gap-2">
                    <span className="font-display text-2xl font-extrabold text-[#241305]">
                      {formatNumber(
                        selectedStock.stock
                      )}
                    </span>

                    <span className="pb-1 text-xs text-stone-400">
                      {selectedStock.unit}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setMovementType(
                        'Masuk'
                      )
                    }
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-colors ${
                      movementType ===
                      'Masuk'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-stone-200 text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    Stok Masuk
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setMovementType(
                        'Keluar'
                      )
                    }
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-colors ${
                      movementType ===
                      'Keluar'
                        ? 'border-orange-200 bg-orange-50 text-orange-700'
                        : 'border-stone-200 text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <ArrowUpFromLine className="h-4 w-4" />
                    Stok Keluar
                  </button>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="movement-quantity"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Jumlah (
                    {selectedStock.unit}
                    )
                  </label>

                  <input
                    id="movement-quantity"
                    type="number"
                    min="1"
                    value={movementQuantity}
                    onChange={(event) =>
                      setMovementQuantity(
                        event.target.value
                      )
                    }
                    placeholder="Masukkan jumlah"
                    autoFocus
                    className="h-12 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-sm font-bold text-stone-700 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="movement-note"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Catatan
                  </label>

                  <textarea
                    id="movement-note"
                    rows={3}
                    value={movementNote}
                    onChange={(event) =>
                      setMovementNote(
                        event.target.value
                      )
                    }
                    placeholder="Contoh: Restock dari supplier..."
                    className="w-full resize-none rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 py-3 text-xs leading-relaxed text-stone-700 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeMovementModal
                    }
                    className="h-11 rounded-xl border border-stone-200 px-5 text-xs font-bold text-stone-500 hover:bg-stone-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-xs font-bold text-white ${
                      movementType ===
                      'Masuk'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    {movementType ===
                    'Masuk' ? (
                      <ArrowDownToLine className="h-4 w-4" />
                    ) : (
                      <ArrowUpFromLine className="h-4 w-4" />
                    )}

                    Simpan Stok{' '}
                    {movementType}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[150] -translate-x-1/2 px-4 sm:left-auto sm:right-6 sm:translate-x-0">
          <div className="flex min-w-[270px] items-center gap-3 rounded-xl bg-[#3A1E08] px-4 py-3 text-white shadow-[0_15px_40px_rgba(58,30,8,0.2)]">
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

export default AdminStocks;