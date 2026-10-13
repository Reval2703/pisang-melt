
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  PRODUCTS,
  Product,
} from '../data/products';

import { ProductCard } from './ProductCard';

import { Sparkles } from 'lucide-react';

interface ProductMenuProps {
  onSelectProduct: (
    product: Product
  ) => void;

  onQuickAdd: (
    product: Product,
    e: React.MouseEvent
  ) => void;
}

// ============================================================
// ADMIN PRODUCT DATA
// ============================================================

interface AdminProduct {
  id: string;
  name: string;
  category:
    | 'Pisang Crispy'
    | 'Pisang Nugget';
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  sold: number;
  active: boolean | number;
  image?: string;
  image_url?: string;
}

// ============================================================
// NORMALIZE NAME
// ============================================================

const normalizeName = (
  name: string
) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

// ============================================================
// CONVERT ADMIN PRODUCT → CUSTOMER PRODUCT
// ============================================================

const convertAdminProductToProduct = (
  adminProduct: AdminProduct
): Product => {
  const originalProduct =
    PRODUCTS.find(
      (product) =>
        normalizeName(
          product.name
        ) ===
        normalizeName(
          adminProduct.name
        )
    );

  const category =
    adminProduct.category ===
    'Pisang Crispy'
      ? 'crispy'
      : 'nugget';

  return {
    id: adminProduct.id,

    name: adminProduct.name,

    category,

    price: Number(adminProduct.price) || 0,

    originalPrice:
      Number(adminProduct.originalPrice) || 0,

    image:
      adminProduct.image_url ||
      adminProduct.image ||
      originalProduct?.image ||
      '/src/assets/images/crispy_cokelat_1790912080345.jpg',

    tagline:
      originalProduct?.tagline ||
      'Pisang Melt renyah dan lumer dengan rasa spesial.',

    description:
      adminProduct.description ||
      originalProduct?.description ||
      'Pisang Melt dengan cita rasa renyah dan lumer yang nikmat.',

    crispLevel:
      originalProduct?.crispLevel ??
      5,

    meltLevel:
      originalProduct?.meltLevel ??
      5,

    rating:
      originalProduct?.rating ??
      5,

    reviewsCount:
      originalProduct?.reviewsCount ??
      0,

    isBestSeller:
      originalProduct?.isBestSeller,

    isNew:
      originalProduct?.isNew,

    portion:
      originalProduct?.portion ||
      '1 Kotak',

    calories:
      originalProduct?.calories ||
      '300 kcal / porsi',

    ingredients:
      originalProduct?.ingredients ||
      [
        'Pisang Pilihan',
        'Tepung Crispy',
        'Topping Premium',
      ],
  };
};

// ============================================================
// LOAD PRODUCTS FROM SERVER
// ============================================================

const getCustomerProducts =
  async (): Promise<Product[]> => {
    try {
      const response = await fetch(
        '/api/products',
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(
          'Gagal mengambil produk dari server.'
        );
      }

      const result = await response.json();

      const parsed: AdminProduct[] =
        result.products;

      if (!Array.isArray(parsed)) {
        throw new Error(
          'Data produk dari server tidak valid.'
        );
      }

      return parsed
        .filter(
          (product) =>
            product &&
            (
              product.active === true ||
              product.active === 1
            )
        )
        .map(
          (product) =>
            convertAdminProductToProduct({
              ...product,
              image:
                product.image_url ||
                product.image ||
                '',
            })
        );
    } catch (error) {
      console.error(
        'Gagal membaca produk dari server:',
        error
      );

      return PRODUCTS;
    }
  };

// ============================================================
// COMPONENT
// ============================================================

export const ProductMenu: React.FC<
  ProductMenuProps
> = ({
  onSelectProduct,
  onQuickAdd,
}) => {
  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    'all' | 'crispy' | 'nugget'
  >('all');

  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    PRODUCTS
  );

  // ==========================================================
  // REFRESH PRODUCT DATA
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      const latestProducts =
        await getCustomerProducts();

      if (mounted) {
        setProducts(latestProducts);
      }
    };

    // Load pertama kali
    loadProducts();

    // Refresh berkala dari server
    const interval =
      window.setInterval(
        loadProducts,
        1000
      );

    return () => {
      mounted = false;

      window.clearInterval(
        interval
      );
    };
  }, []);

  // ==========================================================
  // CATEGORY COUNTS
  // ==========================================================

  const crispyCount = useMemo(
    () =>
      products.filter(
        (product) =>
          product.category ===
          'crispy'
      ).length,
    [products]
  );

  const nuggetCount = useMemo(
    () =>
      products.filter(
        (product) =>
          product.category ===
          'nugget'
      ).length,
    [products]
  );

  // ==========================================================
  // FILTER PRODUCTS
  // ==========================================================

  const filteredProducts =
    useMemo(() => {
      if (
        activeCategory === 'all'
      ) {
        return products;
      }

      return products.filter(
        (product) =>
          product.category ===
          activeCategory
      );
    }, [
      products,
      activeCategory,
    ]);

  return (
    <section
      id="menu-varian"
      className="py-16 bg-[#FAF7F2] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            SECTION HEADER
        ====================================================== */}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
              <Sparkles
                className="w-3.5 h-3.5 text-amber-600"
                aria-hidden="true"
              />

              <span>
                Daftar Menu Spesial
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241305] tracking-tight font-display">
              Varian Produk Pisang Melt
            </h2>

            <p className="text-sm text-stone-600 mt-2 max-w-xl">
              Tersedia berbagai varian rasa
              autentik dengan sensasi renyah
              kriuk dan limpahan cokelat serta
              keju meleleh di setiap gigitan.
            </p>
          </div>

          {/* ===================================================
              CATEGORY FILTER
          ==================================================== */}

          <div
            className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl self-start md:self-auto overflow-x-auto max-w-full"
            role="tablist"
            aria-label="Filter kategori produk"
          >

            {/* Semua */}

            <button
              type="button"
              onClick={() =>
                setActiveCategory(
                  'all'
                )
              }
              role="tab"
              aria-selected={
                activeCategory ===
                'all'
              }
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeCategory ===
                'all'
                  ? 'bg-white text-[#3A1E08] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Semua Varian (
              {products.length})
            </button>

            {/* Crispy */}

            <button
              type="button"
              onClick={() =>
                setActiveCategory(
                  'crispy'
                )
              }
              role="tab"
              aria-selected={
                activeCategory ===
                'crispy'
              }
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeCategory ===
                'crispy'
                  ? 'bg-white text-[#3A1E08] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pisang Crispy (
              {crispyCount})
            </button>

            {/* Nugget */}

            <button
              type="button"
              onClick={() =>
                setActiveCategory(
                  'nugget'
                )
              }
              role="tab"
              aria-selected={
                activeCategory ===
                'nugget'
              }
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeCategory ===
                'nugget'
                  ? 'bg-white text-[#3A1E08] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pisang Nugget (
              {nuggetCount})
            </button>
          </div>
        </div>

        {/* =====================================================
            PRODUCT GRID
        ====================================================== */}

        {filteredProducts.length >
        0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={
                    onSelectProduct
                  }
                  onQuickAdd={
                    onQuickAdd
                  }
                />
              )
            )}
          </div>
        ) : (
          /* ===================================================
             EMPTY STATE
          ==================================================== */

          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">

              <Sparkles
                className="w-8 h-8 mx-auto mb-3 text-amber-500"
                aria-hidden="true"
              />

              <p className="text-sm font-semibold text-stone-700">
                Belum ada produk pada
                kategori ini.
              </p>

              <p className="text-xs text-stone-500 mt-1">
                Silakan pilih kategori lain
                atau cek kembali menu yang
                tersedia.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            PESANAN BESAR
        ====================================================== */}

        <div className="mt-12 p-6 rounded-2xl bg-[#3A1E08] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">

          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold font-display text-amber-200">
              Ingin pesan dalam jumlah
              banyak untuk acara kantor
              atau ulang tahun?
            </h3>

            <p className="text-xs text-stone-300">
              Dapatkan diskon khusus partai
              besar, free custom greeting
              card, dan delivery tepat waktu.
            </p>
          </div>

          <a
            href="https://wa.me/6281330608974?text=Halo%20Admin%20Pisang%20Melt%2C%20saya%20tertarik%20pemesanan%20catering%2Fpartai%20besar%20untuk%20acara"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Konsultasi pesanan besar melalui WhatsApp"
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold text-[#3A1E08] bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            Konsultasi Pesanan Besar
          </a>
        </div>

      </div>
    </section>
  );
};
