import React, { useEffect, useState } from 'react';
import { PRODUCTS, Product } from '../data/products';
import {
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Award,
  Star,
} from 'lucide-react';

interface DailySpecialSectionProps {
  onAddSpecialToCart: (
    product: Product,
    specialPrice: number
  ) => void;
  onOpenProductModal: (product: Product) => void;
}

export const DailySpecialSection: React.FC<
  DailySpecialSectionProps
> = ({
  onAddSpecialToCart,
  onOpenProductModal,
}) => {
  // Menentukan produk awal berdasarkan hari
  const initialIndex =
    PRODUCTS.length > 0
      ? new Date().getDay() % PRODUCTS.length
      : 0;

  const [currentIndex, setCurrentIndex] =
    useState(initialIndex);

  // Indikator stok promo khusus di sisi customer.
  // Ini bukan stok database/admin.
  const [stockRemaining, setStockRemaining] =
    useState(14);

  const [isRotating, setIsRotating] =
    useState(false);

  // Harga khusus Flash Deal
  const getSpecialPrice = (
    product: Product
  ): number => {
    switch (product.id) {
      case 'pisang-crispy-cokelat-keju':
        return 16900;

      case 'pisang-crispy-cokelat':
      case 'pisang-crispy-keju':
        return 14500;

      case 'pisang-nugget-cokelat':
      case 'pisang-nugget-keju':
        return 15500;

      default:
        return (
          Math.round(
            (product.price * 0.75) / 100
          ) * 100
        );
    }
  };

  // Pengaman jika data produk kosong
  if (PRODUCTS.length === 0) {
    return null;
  }

  const currentProduct =
    PRODUCTS[currentIndex] ?? PRODUCTS[0];

  const specialPrice =
    getSpecialPrice(currentProduct);

  const regularPrice =
    currentProduct.originalPrice ||
    currentProduct.price + 4000;

  const savings =
    Math.max(0, regularPrice - specialPrice);

  const discountPercent =
    regularPrice > 0
      ? Math.round(
          ((regularPrice - specialPrice) /
            regularPrice) *
            100
        )
      : 0;

  // Countdown promo
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.hours === 0 && prev.minutes === 0) {
          if (prev.seconds > 0) {
            return {
              ...prev,
              seconds: prev.seconds - 1,
            };
          }

          // Promo berulang untuk kebutuhan tampilan demo
          return {
            hours: 6,
            minutes: 0,
            seconds: 0,
          };
        }

        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds: prev.seconds - 1,
          };
        }

        if (prev.minutes > 0) {
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          };
        }

        if (prev.hours > 0) {
          return {
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59,
          };
        }

        return {
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const handleNext = () => {
    setIsRotating(true);

    setCurrentIndex(
      (prev) => (prev + 1) % PRODUCTS.length
    );

    window.setTimeout(() => {
      setIsRotating(false);
    }, 200);
  };

  const handlePrev = () => {
    setIsRotating(true);

    setCurrentIndex(
      (prev) =>
        (prev - 1 + PRODUCTS.length) %
        PRODUCTS.length
    );

    window.setTimeout(() => {
      setIsRotating(false);
    }, 200);
  };

  const handleSelectProduct = (index: number) => {
    if (index === currentIndex) {
      return;
    }

    setIsRotating(true);
    setCurrentIndex(index);

    window.setTimeout(() => {
      setIsRotating(false);
    }, 200);
  };

  const handleAddToCart = () => {
    onAddSpecialToCart(
      currentProduct,
      specialPrice
    );

    // Hanya simulasi urgensi promo di sisi customer.
    // Tidak mengubah stok database.
    setStockRemaining((prev) =>
      Math.max(3, prev - 1)
    );
  };

  return (
    <section
      id="menu-hari-ini"
      className="py-14 bg-gradient-to-b from-[#FAF7F2] to-amber-50/50 scroll-mt-20 border-b border-amber-900/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
              <span className="p-1 rounded-md bg-amber-500 text-stone-950 flex items-center justify-center">
                <Flame
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />
              </span>

              <span>Flash Deal Harian</span>

              <span aria-hidden="true">·</span>

              <span className="text-stone-500 font-medium">
                Berganti Setiap Hari
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241305] tracking-tight font-display">
              Menu Spesial Hari Ini
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Harga hemat terbatas khusus varian
              terpilih hari ini! Nikmati kriuk ekstra
              dengan diskon hingga {discountPercent}%.
            </p>
          </div>

          {/* Navigasi Varian */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              Varian {currentIndex + 1} dari{' '}
              {PRODUCTS.length}
            </span>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Lihat varian sebelumnya"
              className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <ChevronLeft
                className="w-4 h-4"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Lihat varian berikutnya"
              className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <ChevronRight
                className="w-4 h-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Featured Showcase Card */}
        <div className="bg-white rounded-3xl border-2 border-amber-300/80 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

            {/* Product Image */}
            <div className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-stone-900">
              <img
                src={currentProduct.image}
                alt={`${currentProduct.name} - Menu Spesial Hari Ini`}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isRotating
                    ? 'scale-95 opacity-80'
                    : 'scale-100 opacity-100'
                }`}
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              <div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* Tag Promo */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                <span className="bg-amber-500 text-stone-950 font-extrabold text-xs px-3 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles
                    className="w-3.5 h-3.5 fill-stone-950"
                    aria-hidden="true"
                  />

                  <span>
                    Diskon {discountPercent}% Hari Ini
                  </span>
                </span>

                <span className="bg-black/70 backdrop-blur-sm text-stone-200 text-[11px] px-2.5 py-0.5 rounded-md">
                  {currentProduct.portion}
                </span>
              </div>

              {/* Photo Caption */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold mb-0.5">
                  <Star
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />

                  <span>
                    {currentProduct.rating.toFixed(1)} /
                    5.0
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-white/60"
                  >
                    ·
                  </span>

                  <span className="text-white/80">
                    {currentProduct.reviewsCount}{' '}
                    review pembeli
                  </span>
                </div>

                <div className="text-lg font-bold font-display text-white line-clamp-1 drop-shadow-sm">
                  {currentProduct.name}
                </div>
              </div>
            </div>

            {/* Deal Details */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-gradient-to-br from-white via-white to-amber-50/30">

              <div className="space-y-4">

                {/* Countdown */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Clock
                      className="w-4 h-4 text-amber-600 animate-spin"
                      style={{
                        animationDuration: '6s',
                      }}
                      aria-hidden="true"
                    />

                    <span>Sisa Waktu Promo:</span>
                  </div>

                  <div
                    className="flex items-center gap-1.5 font-mono font-bold text-xs"
                    aria-label={`Sisa waktu promo ${timeLeft.hours} jam ${timeLeft.minutes} menit ${timeLeft.seconds} detik`}
                  >
                    <span className="bg-[#3A1E08] text-white px-2 py-1 rounded-md tabular-nums">
                      {timeLeft.hours
                        .toString()
                        .padStart(2, '0')}
                      j
                    </span>

                    <span className="text-[#3A1E08]">
                      :
                    </span>

                    <span className="bg-[#3A1E08] text-white px-2 py-1 rounded-md tabular-nums">
                      {timeLeft.minutes
                        .toString()
                        .padStart(2, '0')}
                      m
                    </span>

                    <span className="text-[#3A1E08]">
                      :
                    </span>

                    <span className="bg-amber-600 text-white px-2 py-1 rounded-md tabular-nums">
                      {timeLeft.seconds
                        .toString()
                        .padStart(2, '0')}
                      d
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span className="uppercase tracking-wider font-semibold text-amber-800">
                      {currentProduct.category ===
                      'crispy'
                        ? 'Pisang Crispy Series'
                        : 'Pisang Nugget Series'}
                    </span>

                    <span aria-hidden="true">
                      ·
                    </span>

                    <span>
                      Freshly Fried Saat Dipesan
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#241305] font-display">
                    {currentProduct.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    {currentProduct.description}
                  </p>
                </div>

                {/* Bonus */}
                <div className="bg-amber-100/70 p-3 rounded-2xl border border-amber-300/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Award
                      className="w-4 h-4 text-amber-700 shrink-0"
                      aria-hidden="true"
                    />

                    <span>
                      Bonus Spesial Menu Hari Ini:
                    </span>
                  </div>

                  <ul className="text-xs text-amber-900 space-y-1 pl-5 list-disc marker:text-amber-700">
                    <li>
                      Gratis 1 cup{' '}
                      <strong>
                        Extra Molten Choco Dipping
                        Sauce
                      </strong>
                    </li>

                    <li>
                      Mendapatkan{' '}
                      <strong>
                        +{Math.floor(
                          specialPrice / 1000
                        )}{' '}
                        Poin MeltClub
                      </strong>{' '}
                      ke akun Anda
                    </li>
                  </ul>
                </div>

                {/* Promo Stock Indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700">
                      Stok Batch Siang:
                    </span>

                    <span className="font-bold text-amber-900 tabular-nums">
                      Tersisa {stockRemaining} Box
                    </span>
                  </div>

                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (stockRemaining / 25) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 line-through tabular-nums">
                      Rp{' '}
                      {regularPrice.toLocaleString(
                        'id-ID'
                      )}
                    </span>

                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Hemat Rp{' '}
                      {savings.toLocaleString(
                        'id-ID'
                      )}
                    </span>
                  </div>

                  <div className="text-3xl font-black text-[#241305] font-display tabular-nums">
                    Rp{' '}
                    {specialPrice.toLocaleString(
                      'id-ID'
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenProductModal(
                        currentProduct
                      )
                    }
                    className="px-3.5 py-3 text-xs font-semibold text-stone-700 hover:text-black bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer active:scale-95"
                    aria-label={`Lihat detail ${currentProduct.name}`}
                  >
                    Detail
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#3A1E08] hover:bg-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    aria-label={`Ambil promo ${currentProduct.name} seharga Rp ${specialPrice.toLocaleString(
                      'id-ID'
                    )}`}
                  >
                    <ShoppingBag
                      className="w-4 h-4"
                      aria-hidden="true"
                    />

                    <span>
                      Ambil Promo Hari Ini
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Variant Selector */}
          <div className="bg-stone-50 border-t border-stone-200 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-stone-500 font-semibold pl-1">
              Lihat Promo Varian Lain:
            </span>

            <div className="flex flex-wrap gap-1.5">
              {PRODUCTS.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() =>
                    handleSelectProduct(index)
                  }
                  aria-label={`Pilih promo ${product.name}`}
                  aria-pressed={
                    currentIndex === index
                  }
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    currentIndex === index
                      ? 'bg-[#3A1E08] text-white font-bold shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {product.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};