
import React, { useEffect, useState } from 'react';
import {
  PromoBundle,
} from '../data/products';
import {
  Sparkles,
  ShoppingBag,
  Package,
  RefreshCw,
} from 'lucide-react';

interface BundleSectionProps {
  onAddBundle: (bundle: PromoBundle) => void;
}

interface AdminBundle {
  id: string;
  name: string;
  category: 'Hemat' | 'Party' | 'Corporate';
  description: string;
  items: string[];
  price: number;
  originalPrice: number;
  sold: number;
  active: boolean | number | string;
  image: string;
}

const convertToPromoBundle = (
  bundle: AdminBundle
): PromoBundle => {
  const items = Array.isArray(bundle.items)
    ? bundle.items
    : [];

  const price = Number(bundle.price) || 0;
  const originalPrice =
    Number(bundle.originalPrice) || 0;

  const saving = Math.max(0, originalPrice - price);

  return {
    id: bundle.id,
    name: bundle.name,
    items: items.join(' + '),
    price,
    originalPrice,
    badge: saving > 0
      ? `Hemat Rp ${saving.toLocaleString('id-ID')}`
      : bundle.category,
    description: bundle.description || '',
    popular: bundle.category === 'Party',
  };
};

export const BundleSection: React.FC<BundleSectionProps> = ({
  onAddBundle,
}) => {
  const [bundles, setBundles] = useState<AdminBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadBundles = async () => {
      try {
        const response = await fetch('/api/bundles', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error ||
            result?.message ||
            'Gagal mengambil data bundle.'
          );
        }

        const rows = Array.isArray(result)
          ? result
          : Array.isArray(result?.bundles)
            ? result.bundles
            : [];

        const activeBundles = rows.filter(
          (bundle: AdminBundle) =>
            bundle.active === true ||
            Number(bundle.active) === 1
        );

        if (!cancelled) {
          setBundles(activeBundles);
          setError('');
        }
      } catch (err) {
        console.error('Gagal memuat bundle:', err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat bundle.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBundles();

    // Perbarui otomatis ketika admin menambah atau mengubah bundle.
    const intervalId = window.setInterval(() => {
      void loadBundles();
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      id="paket-promo"
      className="py-16 bg-white border-y border-stone-200/70 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
            <Sparkles
              className="w-3.5 h-3.5 text-amber-600"
              aria-hidden="true"
            />
            <span>Bundle Pilihan Pisang Melt</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241305] tracking-tight font-display">
            Bundle Pilihan
          </h2>

          <p className="text-sm text-stone-600 mt-2">
            Pilih bundle yang tersedia. Paket, isi, dan harga
            ditambahkan serta dikelola langsung oleh Admin.
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center gap-2 text-stone-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Memuat bundle...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">
              Bundle belum dapat dimuat: {error}
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Periksa server dan endpoint /api/bundles.
            </p>
          </div>
        ) : bundles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {bundles.map((adminBundle) => {
              const bundle = convertToPromoBundle(adminBundle);

              return (
                <div
                  key={bundle.id}
                  className="rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {adminBundle.image && (
                    <img
                      src={adminBundle.image}
                      alt={bundle.name}
                      loading="lazy"
                      className="w-full h-52 object-cover bg-stone-100"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                        {adminBundle.category}
                      </span>

                      {Number(adminBundle.originalPrice) > bundle.price && (
                        <span className="text-xs text-stone-400 line-through">
                          Rp {bundle.originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#241305]">
                      {bundle.name}
                    </h3>

                    <p className="text-xs font-medium text-amber-900/80 mt-2">
                      {bundle.items}
                    </p>

                    <p className="text-sm text-stone-600 leading-relaxed mt-3 flex-1">
                      {bundle.description}
                    </p>

                    <div className="pt-5 mt-5 border-t border-stone-200 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] text-stone-500 block">
                          Harga Bundle
                        </span>
                        <span className="text-lg font-black text-[#241305] tabular-nums font-display">
                          Rp {bundle.price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddBundle(bundle)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#3A1E08] text-white hover:bg-black transition-colors active:scale-95 shrink-0"
                        aria-label={`Tambah ${bundle.name} ke keranjang`}
                      >
                        <ShoppingBag
                          className="w-3.5 h-3.5"
                          aria-hidden="true"
                        />
                        <span>Ambil Bundle</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-600">
              Belum ada bundle yang tersedia.
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Bundle aktif yang dibuat Admin akan muncul di sini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
