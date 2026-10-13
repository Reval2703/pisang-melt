import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Box,
  Check,
  Edit3,
  Filter,
  ImagePlus,
  LoaderCircle,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatCard from '../../components/admin/AdminStatCard';

interface AdminBundlesProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type BundleCategory = 'Hemat' | 'Party' | 'Corporate';

export interface AdminBundle {
  id: string;
  name: string;
  category: BundleCategory;
  description: string;
  items: string[];
  price: number;
  originalPrice: number;
  sold: number;
  active: boolean;
  image: string;
}

interface BundleApiRow {
  id: string;
  name: string;
  category: BundleCategory;
  description?: string | null;
  items: string[] | string;
  price: number | string;
  originalPrice: number | string;
  sold?: number | string | null;
  active: boolean | number | string;
  image?: string | null;
}

interface BundleForm {
  name: string;
  category: BundleCategory;
  description: string;
  items: string;
  price: string;
  originalPrice: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
  bundles?: BundleApiRow[];
}

const EMPTY_FORM: BundleForm = {
  name: '',
  category: 'Hemat',
  description: '',
  items: '',
  price: '',
  originalPrice: '',
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const getErrorMessage = (
  data: unknown,
  fallback: string,
): string => {
  if (
    data &&
    typeof data === 'object' &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message;
  }

  if (
    data &&
    typeof data === 'object' &&
    'error' in data &&
    typeof data.error === 'string'
  ) {
    return data.error;
  }

  return fallback;
};

// Normalisasi data yang diterima dari MySQL/API.
const normalizeBundle = (bundle: BundleApiRow): AdminBundle => {
  let parsedItems: string[] = [];

  if (Array.isArray(bundle.items)) {
    parsedItems = bundle.items.filter(
      (item): item is string => typeof item === 'string',
    );
  } else if (typeof bundle.items === 'string') {
    try {
      const parsed: unknown = JSON.parse(bundle.items);

      if (Array.isArray(parsed)) {
        parsedItems = parsed.filter(
          (item): item is string => typeof item === 'string',
        );
      }
    } catch {
      parsedItems = [];
    }
  }

  return {
    id: String(bundle.id),
    name: bundle.name || '',
    category: bundle.category || 'Hemat',
    description: bundle.description || '',
    items: parsedItems,
    price: Number(bundle.price) || 0,
    originalPrice: Number(bundle.originalPrice) || 0,
    sold: Number(bundle.sold) || 0,

    // MySQL dapat mengembalikan TINYINT sebagai 0 atau 1.
    // Jangan gunakan Boolean('0'), karena hasilnya true.
    active:
      bundle.active === true ||
      String(bundle.active) === '1',

    image: bundle.image || '',
  };
};

// Kompres foto sebelum dikirim ke server.
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      reject(
        new Error('Format foto harus JPG, PNG, atau WebP.'),
      );
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar.'));
    };

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => {
        reject(new Error('Gambar tidak dapat dibuka.'));
      };

      image.onload = () => {
        const maxDimension = 1200;

        const scale = Math.min(
          1,
          maxDimension / Math.max(image.width, image.height),
        );

        const canvas = document.createElement('canvas');

        canvas.width = Math.max(
          1,
          Math.round(image.width * scale),
        );

        canvas.height = Math.max(
          1,
          Math.round(image.height * scale),
        );

        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Gagal memproses gambar.'));
          return;
        }

        context.fillStyle = '#ffffff';

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height,
        );

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        let quality = 0.82;
        let dataUrl = canvas.toDataURL(
          'image/jpeg',
          quality,
        );

        while (
          dataUrl.length > 2_400_000 &&
          quality > 0.4
        ) {
          quality -= 0.1;

          dataUrl = canvas.toDataURL(
            'image/jpeg',
            quality,
          );
        }

        if (dataUrl.length > 2_800_000) {
          reject(
            new Error(
              'Foto terlalu besar. Gunakan gambar yang lebih kecil.',
            ),
          );
          return;
        }

        resolve(dataUrl);
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
};

const AdminBundles: React.FC<AdminBundlesProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [bundles, setBundles] = useState<AdminBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [categoryFilter, setCategoryFilter] = useState<
    'Semua' | BundleCategory
  >('Semua');

  const [showModal, setShowModal] = useState(false);

  const [editingBundle, setEditingBundle] =
    useState<AdminBundle | null>(null);

  const [deleteBundle, setDeleteBundle] =
    useState<AdminBundle | null>(null);

  const [form, setForm] = useState<BundleForm>(EMPTY_FORM);
  const [imageData, setImageData] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [toast, setToast] = useState('');

  // ==========================================================
  // NOTIFIKASI
  // ==========================================================

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  // ==========================================================
  // API: AMBIL DATA BUNDLE
  // ==========================================================

  const loadBundles = async () => {
    try {
      const response = await fetch('/api/admin/bundles', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const data: ApiResponse | BundleApiRow[] | null =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            'Gagal mengambil data bundle.',
          ),
        );
      }

      const rows: BundleApiRow[] = Array.isArray(data)
        ? data
        : data &&
            typeof data === 'object' &&
            'bundles' in data &&
            Array.isArray(data.bundles)
          ? data.bundles
          : [];

      setBundles(rows.map(normalizeBundle));
    } catch (error) {
      console.error('Gagal memuat bundle:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Gagal memuat bundle dari server.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBundles();
  }, []);

  // ==========================================================
  // FILTER DAN STATISTIK
  // ==========================================================

  const filteredBundles = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();

    return bundles.filter((bundle) => {
      const matchesSearch =
        bundle.name.toLowerCase().includes(search) ||
        bundle.description.toLowerCase().includes(search) ||
        bundle.items.some((item) =>
          item.toLowerCase().includes(search),
        );

      const matchesCategory =
        categoryFilter === 'Semua' ||
        bundle.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [bundles, searchQuery, categoryFilter]);

  const activeBundles = bundles.filter(
    (bundle) => bundle.active,
  ).length;

  const totalSold = bundles.reduce(
    (total, bundle) => total + bundle.sold,
    0,
  );

  const totalRevenue = bundles.reduce(
    (total, bundle) =>
      total + bundle.price * bundle.sold,
    0,
  );

  // ==========================================================
  // MODAL TAMBAH / EDIT
  // ==========================================================

  const openAddModal = () => {
    setEditingBundle(null);
    setForm(EMPTY_FORM);
    setImageData('');
    setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = (bundle: AdminBundle) => {
    setEditingBundle(bundle);

    setForm({
      name: bundle.name,
      category: bundle.category,
      description: bundle.description,
      items: bundle.items.join('\n'),
      price: String(bundle.price),
      originalPrice: String(bundle.originalPrice),
    });

    setImageData('');
    setImagePreview(bundle.image || '');
    setShowModal(true);
  };

  const closeModal = (force = false) => {
    if (saving && !force) return;

    setShowModal(false);
    setEditingBundle(null);
    setForm(EMPTY_FORM);
    setImageData('');
    setImagePreview('');
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const compressed = await compressImage(file);

      setImageData(compressed);
      setImagePreview(compressed);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Gagal memproses foto.',
      );
    } finally {
      // Memungkinkan memilih kembali file yang sama.
      event.target.value = '';
    }
  };

  // ==========================================================
  // API: TAMBAH / EDIT BUNDLE
  // ==========================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const price = Number(form.price);
    const originalPrice = Number(form.originalPrice);

    const items = form.items
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !Number.isFinite(price) ||
      !Number.isFinite(originalPrice) ||
      price <= 0 ||
      originalPrice < price ||
      items.length === 0
    ) {
      showToast(
        'Periksa nama, deskripsi, isi bundle, dan harga.',
      );
      return;
    }

    if (
      !editingBundle &&
      !imageData &&
      !imagePreview
    ) {
      showToast(
        'Silakan pilih foto bundle terlebih dahulu.',
      );
      return;
    }

    setSaving(true);

    try {
      
      const payload = {
        ...(editingBundle
          ? {}
          : {
              id: `bundle-${Date.now()}`,
            }),
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        items,
        price,
        originalPrice,
        active: editingBundle?.active ?? true,
        ...(imageData ? { image: imageData } : {}),
      };


      const isEditing = Boolean(editingBundle);

      const url = isEditing
        ? `/api/admin/bundles/${encodeURIComponent(
            editingBundle!.id,
          )}`
        : '/api/admin/bundles';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: unknown = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Gagal menyimpan bundle.'),
        );
      }

      // Tutup modal dengan paksa karena proses simpan masih berjalan.
      closeModal(true);

      await loadBundles();

      showToast(
        isEditing
          ? 'Bundle berhasil diperbarui.'
          : 'Bundle berhasil ditambahkan.',
      );
    } catch (error) {
      console.error('Gagal menyimpan bundle:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan bundle.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // API: HAPUS BUNDLE
  // ==========================================================

  const handleDelete = async () => {
    if (!deleteBundle || deleting) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/bundles/${encodeURIComponent(
          deleteBundle.id,
        )}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      const data: unknown = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Gagal menghapus bundle.'),
        );
      }

      setBundles((current) =>
        current.filter(
          (bundle) => bundle.id !== deleteBundle.id,
        ),
      );

      setDeleteBundle(null);
      showToast('Bundle berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus bundle:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Gagal menghapus bundle.',
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // API: AKTIF / NONAKTIF
  // ==========================================================

  const toggleBundle = async (bundle: AdminBundle) => {
    const nextActive = !bundle.active;

    try {
      const response = await fetch(
        `/api/admin/bundles/${encodeURIComponent(
          bundle.id,
        )}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: bundle.name,
            category: bundle.category,
            description: bundle.description,
            items: bundle.items,
            price: bundle.price,
            originalPrice: bundle.originalPrice,
            active: nextActive,
          }),
        },
      );

      const data: unknown = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            'Gagal mengubah status bundle.',
          ),
        );
      }

      setBundles((current) =>
        current.map((item) =>
          item.id === bundle.id
            ? { ...item, active: nextActive }
            : item,
        ),
      );

      showToast(
        nextActive
          ? 'Bundle berhasil diaktifkan.'
          : 'Bundle berhasil dinonaktifkan.',
      );
    } catch (error) {
      console.error('Gagal mengubah status bundle:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Gagal mengubah status bundle.',
      );
    }
  };

  // ==========================================================
  // TAMPILAN
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#2C241E]">
      <AdminSidebar
        activePage="bundles"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[280px]">
        <AdminHeader
          title="Bundle"
          description="Kelola paket promo dan penawaran spesial Pisang Melt."
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          {/* Intro */}
          <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <Box className="h-3.5 w-3.5" />
                Bundle Management
              </div>

              <h2 className="mt-3 font-display text-2xl font-extrabold text-[#241305] sm:text-3xl">
                Paket Bundle
              </h2>

              <p className="mt-1.5 max-w-2xl text-xs text-stone-400 sm:text-sm">
                Kelola paket hemat, party, dan kebutuhan khusus customer.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[#3A1E08] px-5 text-xs font-bold text-white shadow-lg transition hover:bg-[#241305]"
            >
              <Plus className="h-4 w-4" />
              Tambah Bundle
            </button>
          </section>

          {/* Statistik */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStatCard
              title="Total Bundle"
              value={String(bundles.length)}
              description="Semua paket terdaftar"
              icon={Box}
              iconStyle="dark"
            />

            <AdminStatCard
              title="Bundle Aktif"
              value={String(activeBundles)}
              description="Tampil di website"
              icon={Check}
              iconStyle="green"
            />

            <AdminStatCard
              title="Bundle Terjual"
              value={String(totalSold)}
              description="Total paket terjual"
              icon={ShoppingBag}
              trend={12}
              trendLabel="bulan ini"
              iconStyle="amber"
            />

            <AdminStatCard
              title="Pendapatan Bundle"
              value={
                totalRevenue >= 1_000_000
                  ? `Rp${(totalRevenue / 1_000_000).toFixed(1)}jt`
                  : formatRupiah(totalRevenue)
              }
              description="Estimasi dari bundle"
              icon={Users}
              iconStyle="orange"
            />
          </section>

          {/* Daftar Bundle */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-stone-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-display text-lg font-extrabold text-[#241305]">
                  Semua Bundle
                </h3>

                <p className="mt-1 text-xs text-stone-400">
                  {filteredBundles.length} bundle ditemukan
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Cari bundle..."
                    className="h-10 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] pl-10 pr-4 text-xs outline-none focus:border-amber-400 sm:w-56"
                  />
                </div>

                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />

                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(
                        event.target.value as
                          | 'Semua'
                          | BundleCategory,
                      )
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-stone-200 bg-[#FCFAF7] pl-9 pr-8 text-xs font-semibold outline-none focus:border-amber-400 sm:w-44"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Hemat">Hemat</option>
                    <option value="Party">Party</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-stone-500">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Memuat data bundle...
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8F4EE] text-stone-400">
                  <Search className="h-6 w-6" />
                </div>

                <h4 className="mt-4 text-sm font-bold text-[#241305]">
                  {bundles.length === 0
                    ? 'Belum ada bundle'
                    : 'Bundle tidak ditemukan'}
                </h4>

                <p className="mt-1 text-xs text-stone-400">
                  {bundles.length === 0
                    ? 'Klik Tambah Bundle untuk membuat paket pertama.'
                    : 'Coba ubah kata pencarian atau filter kategori.'}
                </p>

                {bundles.length === 0 && (
                  <button
                    type="button"
                    onClick={() => void loadBundles()}
                    className="mt-4 rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    Muat Ulang
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 xl:grid-cols-3">
                {filteredBundles.map((bundle) => {
                  const discount =
                    bundle.originalPrice > 0
                      ? Math.max(
                          0,
                          Math.round(
                            ((bundle.originalPrice - bundle.price) /
                              bundle.originalPrice) *
                              100,
                          ),
                        )
                      : 0;

                  return (
                    <article
                      key={bundle.id}
                      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg"
                    >
                      {/* Foto */}
                      <div className="relative h-48 overflow-hidden bg-[#F8F4EE]">
                        {bundle.image ? (
                          <img
                            src={bundle.image}
                            alt={bundle.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-400">
                            <ImagePlus className="h-10 w-10" />
                          </div>
                        )}

                        <div className="absolute left-3 top-3">
                          <span className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-extrabold text-[#3A1E08] shadow-sm">
                            Hemat {discount}%
                          </span>
                        </div>

                        <div className="absolute right-3 top-3">
                          <span
                            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold shadow-sm ${
                              bundle.active
                                ? 'bg-emerald-50/95 text-emerald-700'
                                : 'bg-stone-100/95 text-stone-500'
                            }`}
                          >
                            {bundle.active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </div>

                      {/* Detail */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
                              {bundle.category}
                            </span>

                            <h4 className="mt-1 break-words font-display text-lg font-extrabold text-[#241305]">
                              {bundle.name}
                            </h4>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-extrabold text-[#241305]">
                              {formatRupiah(bundle.price)}
                            </p>

                            <p className="text-[9px] text-stone-400 line-through">
                              {formatRupiah(bundle.originalPrice)}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 min-h-[40px] text-[11px] leading-relaxed text-stone-400">
                          {bundle.description}
                        </p>

                        <div className="mt-4 rounded-xl bg-[#FCFAF7] p-3.5">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                            Isi Bundle
                          </p>

                          <div className="mt-2 space-y-1.5">
                            {bundle.items.map((item, index) => (
                              <div
                                key={`${bundle.id}-${index}`}
                                className="flex items-start gap-2"
                              >
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                  <Check className="h-2.5 w-2.5" />
                                </span>

                                <span className="text-[10px] font-medium text-stone-600">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                          <div>
                            <p className="text-[9px] text-stone-400">
                              Terjual
                            </p>

                            <p className="mt-0.5 text-xs font-bold text-stone-600">
                              {bundle.sold} bundle
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(bundle)}
                              aria-label={`Edit ${bundle.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-amber-50 hover:text-amber-700"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteBundle(bundle)}
                              aria-label={`Hapus ${bundle.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => void toggleBundle(bundle)}
                          className="mt-3 w-full rounded-xl border border-stone-200 py-2.5 text-[10px] font-bold text-stone-500 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        >
                          {bundle.active
                            ? 'Nonaktifkan Bundle'
                            : 'Aktifkan Bundle'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="py-8 text-center text-[10px] text-stone-400">
            Pisang Melt Admin Panel • Bundle Management
          </footer>
        </main>
      </div>

      {/* ======================================================
          MODAL TAMBAH / EDIT
      ====================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241305]/50 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Bundle Management
                </p>

                <h3 className="mt-1 font-display text-xl font-extrabold text-[#241305]">
                  {editingBundle ? 'Edit Bundle' : 'Tambah Bundle'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => closeModal()}
                disabled={saving}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-7">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Nama */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="bundle-name"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Nama Bundle
                  </label>

                  <input
                    id="bundle-name"
                    type="text"
                    required
                    maxLength={255}
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="Contoh: Bundle Duo"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs outline-none focus:border-amber-400"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label
                    htmlFor="bundle-category"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Kategori
                  </label>

                  <select
                    id="bundle-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value as BundleCategory,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs outline-none focus:border-amber-400"
                  >
                    <option value="Hemat">Hemat</option>
                    <option value="Party">Party</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>

                {/* Harga Promo */}
                <div>
                  <label
                    htmlFor="bundle-price"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Harga Promo (Rp)
                  </label>

                  <input
                    id="bundle-price"
                    type="number"
                    min="1"
                    required
                    value={form.price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price: event.target.value,
                      })
                    }
                    placeholder="32000"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs outline-none focus:border-amber-400"
                  />
                </div>

                {/* Harga Normal */}
                <div>
                  <label
                    htmlFor="bundle-original-price"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Harga Normal (Rp)
                  </label>

                  <input
                    id="bundle-original-price"
                    type="number"
                    min="1"
                    required
                    value={form.originalPrice}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        originalPrice: event.target.value,
                      })
                    }
                    placeholder="40000"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs outline-none focus:border-amber-400"
                  />
                </div>

                {/* Isi Bundle */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="bundle-items"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Isi Bundle
                  </label>

                  <textarea
                    id="bundle-items"
                    required
                    value={form.items}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        items: event.target.value,
                      })
                    }
                    rows={4}
                    placeholder={
                      '2 Box Pisang Melt\nPilihan topping\nKemasan khusus'
                    }
                    className="w-full resize-y rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 py-3 text-xs outline-none focus:border-amber-400"
                  />

                  <p className="mt-1.5 text-[9px] text-stone-400">
                    Tulis satu item untuk setiap baris.
                  </p>
                </div>

                {/* Deskripsi */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="bundle-description"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Deskripsi
                  </label>

                  <textarea
                    id="bundle-description"
                    required
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Tulis deskripsi singkat bundle..."
                    className="w-full resize-y rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 py-3 text-xs outline-none focus:border-amber-400"
                  />
                </div>

                {/* Foto */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="bundle-image"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Foto Bundle
                  </label>

                  <div className="rounded-xl border border-dashed border-stone-300 bg-[#FCFAF7] p-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Pratinjau foto bundle"
                        className="mb-4 h-48 w-full rounded-xl object-cover"
                      />
                    )}

                    <label
                      htmlFor="bundle-image"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-600 transition hover:border-amber-400 hover:text-amber-700"
                    >
                      <ImagePlus className="h-4 w-4" />

                      {imagePreview
                        ? 'Ganti Foto'
                        : 'Pilih Foto dari Perangkat'}
                    </label>

                    <input
                      id="bundle-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        void handleImageChange(event)
                      }
                      className="hidden"
                    />

                    <p className="mt-2 text-center text-[10px] text-stone-400">
                      Format JPG, PNG, atau WebP. Foto akan dikompres
                      sebelum diunggah.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => closeModal()}
                  disabled={saving}
                  className="h-11 rounded-xl border border-stone-200 px-5 text-xs font-bold text-stone-500 hover:bg-stone-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3A1E08] px-6 text-xs font-bold text-white hover:bg-[#241305] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}

                  {saving
                    ? 'Menyimpan...'
                    : editingBundle
                      ? 'Simpan Perubahan'
                      : 'Tambah Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          KONFIRMASI HAPUS
      ====================================================== */}

      {deleteBundle && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#241305]/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <h3 className="mt-5 font-display text-xl font-extrabold text-[#241305]">
              Hapus Bundle?
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-stone-500">
              Anda akan menghapus{' '}
              <strong className="text-stone-700">
                {deleteBundle.name}
              </strong>
              . Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteBundle(null)}
                disabled={deleting}
                className="h-11 rounded-xl border border-stone-200 px-5 text-xs font-bold text-stone-500 hover:bg-stone-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}

                {deleting ? 'Menghapus...' : 'Ya, Hapus Bundle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[150] -translate-x-1/2 px-4 sm:left-auto sm:right-6 sm:translate-x-0">
          <div className="flex min-w-[260px] items-center gap-3 rounded-xl bg-[#3A1E08] px-4 py-3 text-white shadow-xl">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500">
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

export default AdminBundles;