import React, {
  useEffect,
  useState,
} from 'react';

import {
  POINTS_PER_FREE_BOX,
  LoyaltyState,
} from '../types/loyalty';

import {
  PRODUCTS,
  Product,
} from '../data/products';

import {
  Award,
  Gift,
  Sparkles,
  Check,
  History,
} from 'lucide-react';

interface LoyaltyRewardsProps {
  loyalty: LoyaltyState;
  onClaimFreeBox: (product: Product) => void;
}

export const LoyaltyRewards: React.FC<
  LoyaltyRewardsProps
> = ({
  loyalty,
  onClaimFreeBox,
}) => {
  // ============================================================
  // STATE
  // ============================================================

  const [selectedFreeProduct, setSelectedFreeProduct] =
    useState<Product | null>(
      PRODUCTS.length > 0
        ? PRODUCTS[0]
        : null
    );

  const [showHistory, setShowHistory] =
    useState(false);

  const [
    claimSuccessMessage,
    setClaimSuccessMessage,
  ] = useState<string | null>(null);

  // ============================================================
  // CLEANUP SUCCESS MESSAGE TIMER
  // ============================================================

  useEffect(() => {
    if (!claimSuccessMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setClaimSuccessMessage(null);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [claimSuccessMessage]);

  // ============================================================
  // LOYALTY CALCULATION
  // ============================================================

  const currentPoints = Math.max(
    0,
    Number(loyalty.points) || 0
  );

  const totalEarnedLifetime = Math.max(
    0,
    Number(loyalty.totalEarnedLifetime) || 0
  );

  const totalBoxesClaimed = Math.max(
    0,
    Number(loyalty.totalBoxesClaimed) || 0
  );

  const progressPercent =
    POINTS_PER_FREE_BOX > 0
      ? Math.min(
          100,
          Math.round(
            (currentPoints /
              POINTS_PER_FREE_BOX) *
              100
          )
        )
      : 0;

  const pointsRemaining = Math.max(
    0,
    POINTS_PER_FREE_BOX - currentPoints
  );

  const canClaim =
    currentPoints >= POINTS_PER_FREE_BOX;

  // ============================================================
  // CUSTOMER TIER
  // ============================================================

  const tier =
    totalEarnedLifetime >= 250
      ? {
          name: 'Melt Gold',
          color:
            'text-amber-500 bg-amber-950/40 border-amber-500/50',
          perk:
            'Gratis 1 Extra Dip setiap order',
        }
      : totalEarnedLifetime >= 100
      ? {
          name: 'Melt Silver',
          color:
            'text-stone-300 bg-stone-900 border-stone-600',
          perk:
            'Voucher diskon ulang tahun',
        }
      : {
          name: 'Melt Bronze',
          color:
            'text-amber-700 bg-amber-950/20 border-amber-900/30',
          perk:
            'Dapatkan 1 Poin per Rp 1.000',
        };

  // ============================================================
  // DIGITAL STAMP
  // ============================================================

  const totalStamps = 5;

  const filledStamps = Math.min(
    totalStamps,
    Math.floor(
      currentPoints / 20
    )
  );

  // ============================================================
  // CLAIM FREE BOX
  // ============================================================

  const handleClaim = () => {
    if (
      !canClaim ||
      !selectedFreeProduct
    ) {
      return;
    }

    onClaimFreeBox(
      selectedFreeProduct
    );

    setClaimSuccessMessage(
      `Selamat! 1 Box ${selectedFreeProduct.name} gratis telah masuk ke keranjang pesanan.`
    );
  };

  // ============================================================
  // EMPTY PRODUCT STATE
  // ============================================================

  if (PRODUCTS.length === 0) {
    return (
      <section
        id="loyalty-rewards"
        className="py-16 bg-[#241305] text-stone-100 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-stone-400">
              Program loyalty belum tersedia
              saat ini.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section
      id="loyalty-rewards"
      className="py-16 bg-[#241305] text-stone-100 scroll-mt-20 relative overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-600/10 blur-[140px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <Award
              className="w-3.5 h-3.5 text-amber-400"
              aria-hidden="true"
            />

            <span>
              MeltClub Loyalty Rewards
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Kumpulkan Poin, Dapatkan Box Gratis
          </h2>

          <p className="text-sm text-stone-300 mt-2">
            Setiap pembelian Rp 1.000 = 1 Poin.
            Kumpulkan hingga 100 poin dan
            tukarkan langsung dengan 1 Box
            Pisang Melt pilihanmu!
          </p>
        </div>

        {/* Main Loyalty Card */}
        <div className="max-w-4xl mx-auto bg-stone-900/90 rounded-3xl border border-amber-900/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-8">

          {/* Balance & Tier */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                  Saldo Poin Anda
                </span>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tier.color}`}
                >
                  {tier.name}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-amber-400 font-display tabular-nums">
                  {currentPoints}
                </span>

                <span className="text-sm text-stone-400 font-medium">
                  / {POINTS_PER_FREE_BOX} Poin
                </span>
              </div>

              <p className="text-[11px] text-stone-500 mt-1">
                {tier.perk}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowHistory(
                    (prev) => !prev
                  )
                }
                aria-expanded={showHistory}
                aria-controls="loyalty-point-history"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors cursor-pointer active:scale-95"
              >
                <History
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />

                <span>
                  {showHistory
                    ? 'Tutup Riwayat'
                    : 'Riwayat Poin'}
                </span>
              </button>

              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-stone-400 block">
                  Total Box Diklaim
                </span>

                <span className="text-sm font-bold text-white tabular-nums">
                  {totalBoxesClaimed}{' '}
                  Box Gratis
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs gap-3">
              <span className="font-semibold text-stone-300">
                {canClaim ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Sparkles
                      className="w-4 h-4"
                      aria-hidden="true"
                    />

                    Target Tercapai!
                    1 Box Gratis Siap Diklaim
                  </span>
                ) : (
                  <span>
                    Kemajuan Hadiah:{' '}
                    <strong className="text-amber-400">
                      {progressPercent}%
                    </strong>
                  </span>
                )}
              </span>

              <span className="text-stone-400 tabular-nums text-right">
                {canClaim
                  ? 'Siap ditukarkan!'
                  : `Kurang ${pointsRemaining} poin lagi`}
              </span>
            </div>

            {/* Progress Bar */}
            <div
              className="w-full bg-stone-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-stone-700"
              role="progressbar"
              aria-valuenow={currentPoints}
              aria-valuemin={0}
              aria-valuemax={
                POINTS_PER_FREE_BOX
              }
              aria-label="Kemajuan poin menuju hadiah gratis"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  canClaim
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 animate-pulse'
                    : 'bg-gradient-to-r from-amber-600 to-amber-400'
                }`}
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>

            {/* Digital Stamp */}
            <div className="pt-4">
              <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                Kartu Stempel Digital
                (Setiap 20 Poin = 1 Cap Pisang):
              </span>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {Array.from({
                  length: totalStamps,
                }).map((_, index) => {
                  const isStampFilled =
                    index < filledStamps;

                  const isFinalReward =
                    index ===
                    totalStamps - 1;

                  return (
                    <div
                      key={index}
                      className={`relative flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all ${
                        isStampFilled
                          ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-xs'
                          : 'bg-stone-800/60 border-stone-700/80 text-stone-600'
                      }`}
                    >
                      <div className="text-xl sm:text-2xl mb-1 select-none">
                        {isFinalReward
                          ? isStampFilled
                            ? '🎁'
                            : '📦'
                          : isStampFilled
                          ? '🍌'
                          : '⚪'}
                      </div>

                      <span className="text-[10px] font-semibold tabular-nums">
                        {(index + 1) * 20} Pts
                      </span>

                      {isFinalReward && (
                        <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold mt-0.5">
                          GRATIS
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reward Redemption */}
          <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700 flex flex-col md:flex-row items-center justify-between gap-5">

            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
                <Gift
                  className="w-4 h-4 text-amber-400"
                  aria-hidden="true"
                />

                <span>
                  Klaim Hadiah 1 Box Gratis
                </span>
              </div>

              <p className="text-xs text-stone-300 max-w-md">
                Pilih varian favoritmu di bawah
                ini saat poin mencukupi
                ({POINTS_PER_FREE_BOX} poin).
                Hadiah akan dimasukkan langsung
                ke keranjang dengan harga Rp 0.
              </p>

              {/* Product Selector */}
              <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                {PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() =>
                      setSelectedFreeProduct(
                        product
                      )
                    }
                    aria-pressed={
                      selectedFreeProduct?.id ===
                      product.id
                    }
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                      selectedFreeProduct?.id ===
                      product.id
                        ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-xs'
                        : 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Claim Button */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleClaim}
                disabled={
                  !canClaim ||
                  !selectedFreeProduct
                }
                className={`px-6 py-3.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  canClaim &&
                  selectedFreeProduct
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer'
                    : 'bg-stone-700 text-stone-400 cursor-not-allowed opacity-60'
                }`}
              >
                <Gift
                  className="w-4 h-4"
                  aria-hidden="true"
                />

                <span>
                  {canClaim
                    ? 'Klaim 1 Box Gratis Sekarang!'
                    : `Perlu ${pointsRemaining} Poin Lagi`}
                </span>
              </button>

              <span className="text-[10px] text-stone-400 text-center">
                Otomatis memotong{' '}
                {POINTS_PER_FREE_BOX} poin saat
                diklaim
              </span>
            </div>
          </div>

          {/* Claim Success */}
          {claimSuccessMessage && (
            <div
              className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2"
              role="status"
              aria-live="polite"
            >
              <Check
                className="w-4 h-4 text-emerald-400 shrink-0"
                aria-hidden="true"
              />

              <span>
                {claimSuccessMessage}
              </span>
            </div>
          )}

          {/* Point History */}
          {showHistory && (
            <div
              id="loyalty-point-history"
              className="pt-4 border-t border-stone-800 space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>
                  Riwayat Aktivitas Poin
                </span>

                <span>
                  {loyalty.history.length}{' '}
                  Catatan
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {loyalty.history.length === 0 ? (
                  <p className="text-xs text-stone-500 text-center py-4">
                    Belum ada riwayat poin.
                    Mulai pesan varian Pisang
                    Melt untuk mengumpulkan poin
                    pertamamu!
                  </p>
                ) : (
                  loyalty.history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/60 text-xs gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-stone-200 truncate">
                          {item.title}
                        </div>

                        <div className="text-[10px] text-stone-400">
                          {item.date}
                        </div>
                      </div>

                      <span
                        className={`font-mono font-bold tabular-nums shrink-0 ${
                          item.points > 0
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >
                        {item.points > 0
                          ? `+${item.points}`
                          : item.points}{' '}
                        Pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};