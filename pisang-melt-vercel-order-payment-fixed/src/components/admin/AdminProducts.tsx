
import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Check,
  Edit3,
  Filter,
  ImagePlus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatCard from '../../components/admin/AdminStatCard';

interface AdminProductsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: 'Pisang Crispy' | 'Pisang Nugget';
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  sold: number;
  active: boolean;
  image: string;
}

const STORAGE_KEY = 'pisang_melt_products';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_OUTPUT_SIZE = 1.5 * 1024 * 1024;

const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'pisang-crispy-cokelat',
    name: 'Pisang Crispy Cokelat',
    category: 'Pisang Crispy',
    description: 'Pisang crispy renyah dengan topping cokelat lumer.',
    price: 18000,
    originalPrice: 20000,
    stock: 20,
    sold: 42,
    active: true,
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'pisang-crispy-keju',
    name: 'Pisang Crispy Keju',
    category: 'Pisang Crispy',
    description: 'Pisang crispy gurih dengan topping keju melimpah.',
    price: 18000,
    originalPrice: 20000,
    stock: 15,
    sold: 35,
    active: true,
    image:
      'https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'pisang-crispy-cokelat-keju',
    name: 'Pisang Crispy Cokelat Keju',
    category: 'Pisang Crispy',
    description: 'Perpaduan cokelat dan keju dalam satu box.',
    price: 22000,
    originalPrice: 25000,
    stock: 12,
    sold: 31,
    active: true,
    image:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'pisang-nugget-cokelat',
    name: 'Pisang Nugget Cokelat',
    category: 'Pisang Nugget',
    description: 'Pisang nugget lembut dengan balutan cokelat.',
    price: 20000,
    originalPrice: 22000,
    stock: 9,
    sold: 26,
    active: true,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'pisang-nugget-keju',
    name: 'Pisang Nugget Keju',
    category: 'Pisang Nugget',
    description: 'Pisang nugget dengan topping keju gurih.',
    price: 20000,
    originalPrice: 22000,
    stock: 7,
    sold: 21,
    active: true,
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',
  },
];

const EMPTY_FORM = {
  name: '',
  category: 'Pisang Crispy' as AdminProduct['category'],
  description: '',
  price: '',
  originalPrice: '',
  stock: '',
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const normalizeProduct = (product: any): AdminProduct => ({
  ...product,
  id: String(product.id),
  name: String(product.name ?? ''),
  category: product.category,
  description: String(product.description ?? ''),
  price: Number(product.price ?? 0),
  originalPrice: Number(
    product.originalPrice ?? product.original_price ?? 0
  ),
  stock: Number(product.stock ?? 0),
  sold: Number(product.sold ?? 0),
  active:
    product.active === true ||
    product.active === 1 ||
    product.active === '1',
  image: String(
    product.image ||
      product.image_url ||
      DEFAULT_IMAGE
  ),
});

const getStoredProducts = (): AdminProduct[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(INITIAL_PRODUCTS)
      );

      return INITIAL_PRODUCTS;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return INITIAL_PRODUCTS;
    }

    return parsed.map(normalizeProduct);
  } catch (error) {
    console.error('Gagal membaca produk:', error);
    return INITIAL_PRODUCTS;
  }
};

/**
 * Mengubah foto menjadi JPEG terkompresi.
 * Foto dikirim ke server ketika produk disimpan.
 */
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxDimension = 1200;
      const scale = Math.min(
        1,
        maxDimension / Math.max(image.width, image.height)
      );

      const canvas = document.createElement('canvas');

      canvas.width = Math.max(
        1,
        Math.round(image.width * scale)
      );

      canvas.height = Math.max(
        1,
        Math.round(image.height * scale)
      );

      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Gagal memproses gambar.'));
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      let quality = 0.8;

      const createOutput = () => {
        const result = canvas.toDataURL('image/jpeg', quality);
        const estimatedBytes = Math.ceil((result.length * 3) / 4);

        if (
          estimatedBytes > MAX_OUTPUT_SIZE &&
          quality > 0.4
        ) {
          quality -= 0.1;
          createOutput();
          return;
        }

        if (estimatedBytes > MAX_OUTPUT_SIZE) {
          reject(
            new Error(
              'Ukuran foto masih terlalu besar. Pilih foto yang lebih kecil.'
            )
          );
          return;
        }

        resolve(result);
      };

      createOutput();
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Foto tidak dapat dibaca.'));
    };

    image.src = objectUrl;
  });
};

const AdminProducts: React.FC<AdminProductsProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [categoryFilter, setCategoryFilter] =
    useState<'Semua' | AdminProduct['category']>('Semua');

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<AdminProduct | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const [deleteProduct, setDeleteProduct] =
    useState<AdminProduct | null>(null);

  const [toast, setToast] = useState('');

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 3000);
  };

  /**
   * Ambil produk terbaru dari database server.
   */
  const refreshProducts = async (): Promise<void> => {
    const response = await fetch('/api/admin/products', {
      credentials: 'include',
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || 'Gagal memuat produk dari server.'
      );
    }

    setProducts(
      Array.isArray(result.products)
        ? result.products.map(normalizeProduct)
        : []
    );
  };

  /**
   * Muat produk dari server.
   * Jika database kosong, pindahkan data lama dari localStorage.
   */
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await fetch('/api/admin/products', {
          credentials: 'include',
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || 'Gagal mengambil produk dari server.'
          );
        }

        if (cancelled) return;

        if (
          Array.isArray(result.products) &&
          result.products.length > 0
        ) {
          setProducts(result.products.map(normalizeProduct));
          return;
        }

        const oldProducts = getStoredProducts();

        for (const product of oldProducts) {
          if (cancelled) return;

          const saveResponse = await fetch(
            '/api/admin/products',
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(product),
            }
          );

          if (!saveResponse.ok) {
            const errorResult = await saveResponse.json();

            throw new Error(
              errorResult.error ||
                `Gagal memindahkan produk ${product.name}.`
            );
          }
        }

        if (cancelled) return;

        await refreshProducts();

        if (!cancelled) {
          showToast('Produk berhasil dimuat dari server.');
        }
      } catch (error) {
        console.error('Gagal memuat produk:', error);

        if (!cancelled) {
          showToast(
            error instanceof Error
              ? error.message
              : 'Gagal mengambil produk dari server.'
          );
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'Semua' ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const activeProducts = products.filter(
    (product) => product.active
  ).length;

  const lowStockProducts = products.filter(
    (product) => product.stock <= 5
  ).length;

  const totalSold = products.reduce(
    (total, product) => total + product.sold,
    0
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setSelectedImage('');
    setShowModal(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      stock: String(product.stock),
    });

    setSelectedImage('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setSelectedImage('');
    setImageLoading(false);
  };

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    event.target.value = '';

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast('Pilih gambar JPG, PNG, atau WebP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showToast('Ukuran foto maksimal 2 MB.');
      return;
    }

    setImageLoading(true);

    try {
      const compressedImage = await compressImage(file);
      setSelectedImage(compressedImage);
      showToast('Foto berhasil dipilih.');
    } catch (error) {
      console.error('Gagal memproses foto:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Gagal memproses foto.'
      );
    } finally {
      setImageLoading(false);
    }
  };

  /**
   * Tambah atau edit produk langsung melalui API server.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (imageLoading) {
      showToast('Tunggu sampai foto selesai diproses.');
      return;
    }

    const price = Number(form.price);
    const originalPrice = Number(form.originalPrice);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      form.price.trim() === '' ||
      form.originalPrice.trim() === '' ||
      form.stock.trim() === '' ||
      !Number.isFinite(price) ||
      !Number.isFinite(originalPrice) ||
      !Number.isFinite(stock)
    ) {
      showToast('Mohon lengkapi semua data produk.');
      return;
    }

    if (price <= 0 || originalPrice <= 0) {
      showToast('Harga harus lebih besar dari 0.');
      return;
    }

    if (stock < 0 || !Number.isInteger(stock)) {
      showToast('Stok harus berupa bilangan bulat minimal 0.');
      return;
    }

    if (price > originalPrice) {
      showToast(
        'Harga jual tidak boleh lebih besar dari harga normal.'
      );
      return;
    }

    const isEditing = Boolean(editingProduct);

    const product: AdminProduct = {
      id: editingProduct?.id || `product-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price,
      originalPrice,
      stock,
      sold: editingProduct?.sold ?? 0,
      active: editingProduct?.active ?? true,
      image:
        selectedImage ||
        editingProduct?.image ||
        DEFAULT_IMAGE,
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/admin/products/${encodeURIComponent(product.id)}`
          : '/api/admin/products',
        {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Gagal menyimpan produk ke server.'
        );
      }

      await refreshProducts();

      showToast(
        isEditing
          ? 'Produk dan foto berhasil diperbarui.'
          : 'Produk berhasil ditambahkan.'
      );

      closeModal();
    } catch (error) {
      console.error('Gagal menyimpan produk:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan produk ke server.'
      );
    }
  };

  /**
   * Hapus produk dari database server.
   */
  const handleDelete = async () => {
    if (!deleteProduct) return;

    try {
      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(deleteProduct.id)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Gagal menghapus produk.'
        );
      }

      await refreshProducts();

      setDeleteProduct(null);
      showToast('Produk berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus produk:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Gagal menghapus produk.'
      );
    }
  };

  /**
   * Ubah status aktif produk melalui server.
   */
  const toggleProduct = async (productId: string) => {
    const target = products.find(
      (product) => product.id === productId
    );

    if (!target) return;

    try {
      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(productId)}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...target,
            active: !target.active,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Gagal mengubah status produk.'
        );
      }

      await refreshProducts();

      showToast(
        target.active
          ? 'Produk dinonaktifkan.'
          : 'Produk diaktifkan.'
      );
    } catch (error) {
      console.error('Gagal mengubah status produk:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Gagal mengubah status produk.'
      );
    }
  };

  const previewImage =
    selectedImage ||
    editingProduct?.image ||
    DEFAULT_IMAGE;

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#2C241E]">
      <AdminSidebar
        activePage="products"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[280px]">
        <AdminHeader
          title="Produk"
          description="Kelola produk Pisang Melt."
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <Package className="h-3.5 w-3.5" />
                Product Management
              </div>

              <h2 className="mt-3 font-display text-2xl font-extrabold text-[#241305] sm:text-3xl">
                Daftar Produk
              </h2>

              <p className="mt-1.5 text-xs text-stone-400 sm:text-sm">
                Atur menu, foto, harga, stok, dan status produk.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3A1E08] px-5 text-xs font-bold text-white transition hover:bg-[#241305]"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </button>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStatCard
              title="Total Produk"
              value={String(products.length)}
              description="Semua produk terdaftar"
              icon={Package}
              iconStyle="dark"
            />

            <AdminStatCard
              title="Produk Aktif"
              value={String(activeProducts)}
              description="Produk aktif"
              icon={Check}
              iconStyle="green"
            />

            <AdminStatCard
              title="Total Terjual"
              value={String(totalSold)}
              description="Unit terjual"
              icon={ShoppingBag}
              trend={9}
              trendLabel="bulan ini"
              iconStyle="amber"
            />

            <AdminStatCard
              title="Stok Menipis"
              value={String(lowStockProducts)}
              description="Stok ≤ 5 unit"
              icon={Package}
              iconStyle="orange"
            />
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-extrabold text-[#241305]">
                  Semua Produk
                </h3>
                <p className="mt-1 text-xs text-stone-400">
                  {filteredProducts.length} produk ditemukan
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Cari produk..."
                    className="h-10 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] pl-10 pr-4 text-xs outline-none focus:border-amber-400 sm:w-56"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(
                        event.target.value as
                          | 'Semua'
                          | AdminProduct['category']
                      )
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-stone-200 bg-[#FCFAF7] pl-9 pr-8 text-xs sm:w-48"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Pisang Crispy">
                      Pisang Crispy
                    </option>
                    <option value="Pisang Nugget">
                      Pisang Nugget
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-stone-100 bg-[#FCFAF7]">
                    {[
                      'Produk',
                      'Kategori',
                      'Harga',
                      'Stok',
                      'Terjual',
                      'Status',
                      'Aksi',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-stone-50 hover:bg-[#FCFAF7]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl bg-[#F8F4EE] object-cover"
                            onError={(event) => {
                              event.currentTarget.src = DEFAULT_IMAGE;
                            }}
                          />

                          <div>
                            <p className="max-w-[220px] truncate text-xs font-bold text-[#241305]">
                              {product.name}
                            </p>
                            <p className="mt-1 max-w-[230px] truncate text-[10px] text-stone-400">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-xs font-extrabold">
                          {formatRupiah(product.price)}
                        </p>
                        <p className="mt-0.5 text-[9px] text-stone-400 line-through">
                          {formatRupiah(product.originalPrice)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold ${
                            product.stock <= 5
                              ? 'bg-red-50 text-red-600'
                              : product.stock <= 10
                                ? 'bg-orange-50 text-orange-600'
                                : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-stone-600">
                        {product.sold} unit
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          className="inline-flex items-center gap-1.5"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              product.active
                                ? 'bg-emerald-500'
                                : 'bg-stone-300'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold ${
                              product.active
                                ? 'text-emerald-600'
                                : 'text-stone-400'
                            }`}
                          >
                            {product.active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            aria-label={`Edit ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteProduct(product)}
                            aria-label={`Hapus ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="p-12 text-center text-sm text-stone-400">
                  Produk tidak ditemukan.
                </div>
              )}
            </div>
          </section>

          <footer className="py-8 text-center text-[10px] text-stone-400">
            Pisang Melt Admin Panel • Product Management
          </footer>
        </main>
      </div>

      {/* Modal Tambah / Edit Produk */}
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
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Product Management
                </p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-[#241305]">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-7">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="product-name"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Nama Produk
                  </label>
                  <input
                    id="product-name"
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Contoh: Pisang Crispy Cokelat"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-category"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Kategori
                  </label>
                  <select
                    id="product-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value as AdminProduct['category'],
                      })
                    }
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs"
                  >
                    <option value="Pisang Crispy">Pisang Crispy</option>
                    <option value="Pisang Nugget">Pisang Nugget</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="product-stock"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Stok
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.stock}
                    onChange={(event) =>
                      setForm({ ...form, stock: event.target.value })
                    }
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-price"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Harga Jual
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    min="1"
                    required
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="18000"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-original-price"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Harga Normal
                  </label>
                  <input
                    id="product-original-price"
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
                    placeholder="20000"
                    className="h-11 w-full rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="product-description"
                    className="mb-2 block text-xs font-bold text-stone-600"
                  >
                    Deskripsi
                  </label>
                  <textarea
                    id="product-description"
                    required
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Tulis deskripsi singkat produk..."
                    className="w-full resize-none rounded-xl border border-stone-200 bg-[#FCFAF7] px-4 py-3 text-xs"
                  />
                </div>

                {/* Upload dan Preview Foto */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-stone-600">
                    Foto Produk
                  </label>

                  <div className="rounded-2xl border border-dashed border-amber-300 bg-[#FCFAF7] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white sm:h-32 sm:w-36">
                        <img
                          src={previewImage}
                          alt="Preview foto produk"
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#3A1E08]">
                          <ImagePlus className="h-5 w-5 text-amber-700" />
                          {selectedImage
                            ? 'Foto baru dipilih'
                            : editingProduct
                              ? 'Foto saat ini'
                              : 'Pilih foto produk'}
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-stone-500">
                          Format JPG, PNG, atau WebP. Ukuran file maksimal 2 MB.
                        </p>

                        <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3A1E08] px-4 text-xs font-bold text-white transition hover:bg-[#241305]">
                          <Upload className="h-4 w-4" />
                          {imageLoading
                            ? 'Memproses foto...'
                            : 'Pilih Foto'}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            disabled={imageLoading}
                            className="hidden"
                          />
                        </label>

                        {selectedImage && (
                          <button
                            type="button"
                            onClick={() => setSelectedImage('')}
                            className="ml-3 mt-3 text-xs font-semibold text-red-600 hover:underline"
                          >
                            Batalkan foto baru
                          </button>
                        )}

                        {imageLoading && (
                          <p className="mt-2 text-xs text-amber-700">
                            Foto sedang dikompres...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
                      <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      Foto disimpan di server agar perubahan dapat digunakan oleh web Customer.
                    </div>
                  </div>
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
                  disabled={imageLoading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3A1E08] px-6 text-xs font-bold text-white hover:bg-[#241305] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {deleteProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#241305]/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <h3 className="mt-5 font-display text-xl font-extrabold text-[#241305]">
              Hapus Produk?
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-stone-500">
              Kamu akan menghapus{' '}
              <strong className="text-stone-700">
                {deleteProduct.name}
              </strong>
              . Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteProduct(null)}
                className="h-11 rounded-xl border border-stone-200 px-5 text-xs font-bold text-stone-500"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="h-11 rounded-xl bg-red-600 px-5 text-xs font-bold text-white hover:bg-red-700"
              >
                Ya, Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[150] max-w-[calc(100vw-32px)] -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0"
        >
          <div className="flex items-center gap-3 rounded-xl bg-[#3A1E08] px-4 py-3 text-white shadow-xl">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500">
              <Check className="h-4 w-4" />
            </div>

            <span className="text-xs font-semibold">
              {toast}
            </span>

            <button
              type="button"
              onClick={() => setToast('')}
              aria-label="Tutup notifikasi"
              className="ml-2 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
