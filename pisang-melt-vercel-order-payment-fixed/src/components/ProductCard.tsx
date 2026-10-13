import React, {
  useEffect,
  useState,
} from 'react';

import { Product } from '../data/products';

import {
  Plus,
  Star,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  PackageX,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (
    product: Product,
    e: React.MouseEvent
  ) => void;
}

interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minimumStock: number;
  incoming: number;
  outgoing: number;
  lastUpdate: string;
  active: boolean;
}

type StockStatus =
  | 'Aman'
  | 'Menipis'
  | 'Habis';

const STOCK_STORAGE_KEY =
  'pisang_melt_stocks';

const normalizeName = (
  name: string
) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

const getStoredStocks =
  (): StockItem[] => {
    try {
      const stored =
        localStorage.getItem(
          STOCK_STORAGE_KEY
        );

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    } catch (error) {
      console.error(
        'Gagal membaca data stok:',
        error
      );

      return [];
    }
  };

const getStockStatus = (
  stock: number,
  minimumStock: number
): StockStatus => {
  if (stock <= 0) {
    return 'Habis';
  }

  if (stock <= minimumStock) {
    return 'Menipis';
  }

  return 'Aman';
};

export const ProductCard: React.FC<
  ProductCardProps
> = ({
  product,
  onSelect,
  onQuickAdd,
}) => {
  const [stock, setStock] =
    useState<StockItem | null>(null);

  useEffect(() => {
    const loadStock = () => {
      const stocks = getStoredStocks();

      const productStock =
        stocks.find(
          (item) =>
            item.category ===
              'Produk Jadi' &&
            normalizeName(item.name) ===
              normalizeName(product.name)
        ) || null;

      setStock(productStock);
    };

    loadStock();

    const handleStorageChange = (
      event: StorageEvent
    ) => {
      if (
        event.key ===
          STOCK_STORAGE_KEY ||
        event.key === null
      ) {
        loadStock();
      }
    };

    window.addEventListener(
      'storage',
      handleStorageChange
    );

    const interval =
      window.setInterval(
        loadStock,
        1000
      );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange
      );

      window.clearInterval(
        interval
      );
    };
  }, [product.name]);

  /*
   * Jika produk belum mempunyai
   * data stok di Admin Stocks,
   * kartu tetap dianggap tersedia.
   */
  const currentStock =
    stock?.stock ?? null;

  const minimumStock =
    stock?.minimumStock ?? 0;

  const stockStatus =
    currentStock !== null
      ? getStockStatus(
          currentStock,
          minimumStock
        )
      : 'Aman';

  const isOutOfStock =
    currentStock !== null &&
    currentStock <= 0;

  const isLowStock =
    currentStock !== null &&
    currentStock > 0 &&
    currentStock <= minimumStock;

  const handleCardClick = () => {
    if (isOutOfStock) {
      return;
    }

    onSelect(product);
  };

  const handleQuickAdd = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    onQuickAdd(product, e);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-2xl hover:shadow-amber-950/15 hover:-translate-y-2 hover:border-amber-400/80 transition-all duration-300 ease-out select-none ${
        isOutOfStock
          ? 'cursor-not-allowed'
          : 'cursor-pointer'
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isOutOfStock
              ? 'grayscale opacity-60'
              : 'group-hover:scale-110'
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-red-600 shadow-xl">
              <PackageX className="h-4 w-4" />
              Stok Habis
            </div>
          </div>
        )}

        {/* Quick Action Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-[#241305] text-xs font-bold shadow-xl transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 backdrop-blur-xs border border-amber-200/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />

              <span>
                Kustomisasi & Pesan
              </span>

              <ArrowRight className="w-3 h-3 text-stone-600 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        )}

        {/* Best Seller */}
        {product.isBestSeller && (
          <div className="absolute top-3 left-3 bg-[#3A1E08] text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 transform group-hover:scale-105 transition-transform">
            <span>🔥</span>
            <span>
              Best Seller #1
            </span>
          </div>
        )}

        {/* New Product */}
        {product.isNew && (
          <div className="absolute top-3 left-3 bg-emerald-700 text-emerald-100 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md transform group-hover:scale-105 transition-transform">
            Varian Baru
          </div>
        )}

        {/* Stock Status */}
        {isLowStock && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
            <AlertTriangle className="h-3 w-3" />
            Stok Menipis
          </div>
        )}

        {/* Portion */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-stone-200 text-[11px] px-2 py-0.5 rounded transition-transform group-hover:scale-102">
          {product.portion}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-amber-50/20 transition-colors duration-300">

        <div>
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-amber-800">
              {product.category ===
              'crispy'
                ? 'Pisang Crispy'
                : 'Pisang Nugget'}
            </span>

            <span aria-hidden="true">
              ·
            </span>

            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />

              {product.rating.toFixed(
                1
              )}
            </span>

            <span aria-hidden="true">
              ·
            </span>

            <span>
              {product.reviewsCount}{' '}
              ulasan
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#241305] font-display group-hover:text-amber-800 transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed group-hover:text-stone-700 transition-colors">
            {product.tagline}
          </p>
        </div>

        {/* Taste Indicators */}
        <div className="flex items-center justify-between text-[11px] text-stone-600 bg-[#FAF7F2] group-hover:bg-amber-100/40 p-2 rounded-lg border border-stone-200/60 group-hover:border-amber-300/60 transition-all duration-300">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-700">
              Renyah:
            </span>

            <div
              className="flex gap-0.5"
              title={`${product.crispLevel}/5 Skor Renyah`}
            >
              {[
                ...Array(5),
              ].map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-transform duration-200 group-hover:scale-110 ${
                    i <
                    product.crispLevel
                      ? 'bg-amber-600'
                      : 'bg-stone-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-700">
              Lumer:
            </span>

            <div
              className="flex gap-0.5"
              title={`${product.meltLevel}/5 Skor Lumer`}
            >
              {[
                ...Array(5),
              ].map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-transform duration-200 group-hover:scale-110 ${
                    i <
                    product.meltLevel
                      ? 'bg-[#3A1E08]'
                      : 'bg-stone-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stock Information */}
        {currentStock !== null && (
          <div
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-[10px] font-semibold ${
              stockStatus ===
              'Habis'
                ? 'bg-red-50 text-red-600'
                : stockStatus ===
                  'Menipis'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {stockStatus ===
              'Habis' ? (
                <PackageX className="h-3.5 w-3.5" />
              ) : stockStatus ===
                'Menipis' ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <PackageX className="h-3.5 w-3.5" />
              )}

              {stockStatus ===
              'Habis'
                ? 'Produk sedang habis'
                : stockStatus ===
                  'Menipis'
                ? 'Stok produk menipis'
                : 'Stok tersedia'}
            </span>

            <span>
              {currentStock}{' '}
              {stock?.unit}
            </span>
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-2 flex items-center justify-between border-t border-stone-100 group-hover:border-amber-200/60 transition-colors">
          <div>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through mr-1.5 tabular-nums">
                Rp{' '}
                {product.originalPrice.toLocaleString(
                  'id-ID'
                )}
              </span>
            )}

            <span className="text-lg font-black text-[#241305] tabular-nums font-display group-hover:text-amber-950 transition-colors">
              Rp{' '}
              {product.price.toLocaleString(
                'id-ID'
              )}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm transform ${
              isOutOfStock
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'text-white bg-[#3A1E08] hover:bg-black group-hover:bg-[#241305] group-hover:shadow-md cursor-pointer active:scale-95 group-hover:scale-105'
            }`}
            title={
              isOutOfStock
                ? 'Stok habis'
                : 'Tambah ke Keranjang'
            }
          >
            {isOutOfStock ? (
              <>
                <PackageX className="w-3.5 h-3.5" />

                <span>
                  Habis
                </span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />

                <span>
                  Pesan
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};