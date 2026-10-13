/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowDown,
  Flame,
  CheckCircle2,
  Volume2,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onOpenQuickOrder: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMenu,
  onOpenQuickOrder,
}) => {
  const [crunchActive, setCrunchActive] =
    useState(false);

  const playCrunchSound = () => {
    setCrunchActive(true);

    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as unknown as {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error(
          'Web Audio API tidak tersedia.'
        );
      }

      const audioCtx =
        new AudioContextClass();

      const osc =
        audioCtx.createOscillator();

      const gain =
        audioCtx.createGain();

      osc.type = 'triangle';

      osc.frequency.setValueAtTime(
        140,
        audioCtx.currentTime
      );

      osc.frequency.exponentialRampToValueAtTime(
        40,
        audioCtx.currentTime + 0.12
      );

      gain.gain.setValueAtTime(
        0.3,
        audioCtx.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.12
      );

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();

      osc.stop(
        audioCtx.currentTime + 0.12
      );

      osc.addEventListener(
        'ended',
        () => {
          void audioCtx.close();
        },
        { once: true }
      );
    } catch {
      // Jika Web Audio API tidak tersedia,
      // efek suara cukup dilewati.
    }

    window.setTimeout(() => {
      setCrunchActive(false);
    }, 800);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-16 lg:pb-28 xl:pt-20 xl:pb-32">

      {/* ======================================================
          BACKGROUND AMBIENT LIGHT
          ====================================================== */}

      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] sm:w-[700px] sm:h-[400px] lg:w-[900px] lg:h-[500px] bg-amber-200/25 blur-[120px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 xl:gap-16 items-center">

          {/* ==================================================
              LEFT COLUMN
              ================================================== */}

          <div className="lg:col-span-6 xl:col-span-6 space-y-6 lg:space-y-7 text-center lg:text-left">

            {/* Badge */}

            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-amber-900 tracking-wide">

              <span className="inline-flex items-center justify-center p-1 rounded bg-amber-100 text-amber-800">

                <Flame
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />

              </span>

              <span>
                Camilan Pisang Goreng Viral
              </span>

              <span aria-hidden="true">
                ·
              </span>

              <span>
                Freshly Fried Every Order
              </span>

            </div>

            {/* Heading */}

            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-[#241305] tracking-tight font-display leading-[1.08] text-balance">

              Sensasi Renyah di Luar,{' '}

              <span className="text-[#8B3A0F] underline decoration-amber-400 decoration-wavy decoration-2 underline-offset-4">

                Lumer Cokelat

              </span>{' '}

              di Dalam.

            </h1>

            {/* Description */}

            <p className="text-base sm:text-lg lg:text-[17px] xl:text-lg text-[#5A493E] leading-relaxed max-w-2xl mx-auto lg:mx-0">

              Dibuat dari 100% Pisang Raja pilihan
              berlapis tepung panko emas super renyah.
              Disiram cokelat Belgian lumer hangat dan
              taburan keju cheddar gurih menggunung yang
              memanjakan lidah.

            </p>

            {/* ==================================================
                CTA
                ================================================== */}

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">

              {/* Explore Menu */}

              <button
                type="button"
                onClick={onExploreMenu}
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-[#3A1E08] hover:bg-[#251203] rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                aria-label="Lihat pilihan menu Pisang Melt"
              >

                <span>
                  Pilih Varian Menu
                </span>

                <ArrowDown
                  className="w-4 h-4"
                  aria-hidden="true"
                />

              </button>

              {/* Quick Order */}

              <button
                type="button"
                onClick={onOpenQuickOrder}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-[#1F512B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                aria-label="Buka keranjang untuk melakukan pesanan cepat"
              >

                <MessageCircle
                  className="w-4 h-4"
                  aria-hidden="true"
                />

                <span>
                  Pesan Cepat
                </span>

              </button>

            </div>

            {/* ==================================================
                CRUNCH TEST
                ================================================== */}

            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4">

              <button
                type="button"
                onClick={playCrunchSound}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  crunchActive
                    ? 'bg-amber-400 text-amber-950 border-amber-500 scale-105 shadow-inner'
                    : 'bg-white/80 text-[#5A493E] border-stone-300 hover:border-amber-400 hover:bg-amber-50/50'
                }`}
                aria-label="Tes efek suara renyah Pisang Melt"
                aria-pressed={crunchActive}
              >

                <Volume2
                  className={`w-3.5 h-3.5 ${
                    crunchActive
                      ? 'text-amber-950 animate-bounce'
                      : 'text-amber-700'
                  }`}
                  aria-hidden="true"
                />

                <span>
                  {crunchActive
                    ? '💥 KRRRIIUUKK! Super Renyah!'
                    : 'Tes Efek Suara Renyah'}
                </span>

              </button>

            </div>

            {/* ==================================================
                SOCIAL PROOF
                ================================================== */}

            <div className="pt-4 lg:pt-5 border-t border-[#3A1E08]/10 grid grid-cols-3 gap-3 lg:gap-5 text-left">

              {/* Sold */}

              <div>

                <div className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-[#241305] font-display tabular-nums">

                  15.000+

                </div>

                <div className="text-xs text-[#705B4E] leading-tight">

                  Box Terjual

                </div>

              </div>

              {/* Rating */}

              <div>

                <div className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-[#241305] font-display tabular-nums">

                  4.9 / 5.0

                </div>

                <div className="text-xs text-[#705B4E] leading-tight">

                  Rating Kepuasan

                </div>

              </div>

              {/* Quality */}

              <div>

                <div className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-[#241305] font-display">

                  100% Halal

                </div>

                <div className="text-xs text-[#705B4E] leading-tight">

                  Higienis & Alami

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              RIGHT COLUMN - HERO IMAGE
              ================================================== */}

          <div className="lg:col-span-6 xl:col-span-6 relative">

            <div className="relative mx-auto max-w-lg sm:max-w-xl lg:max-w-none">

              {/* Main Photo Card */}

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-stone-900 group">

                <img
                  src="/images/hero_pisang_melt_1790912066137.jpg"
                  alt="Pisang Crispy Cokelat Keju Melt hangat bertabur topping melimpah"
                  className="w-full h-[360px] sm:h-[440px] lg:h-[500px] xl:h-[560px] 2xl:h-[620px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* Product Highlight */}

                <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 text-white flex items-end justify-between gap-4">

                  <div className="min-w-0">

                    <span className="text-xs font-semibold tracking-wider text-amber-300 uppercase">

                      Signature Artisan

                    </span>

                    <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold font-display text-white drop-shadow">

                      Pisang Crispy Cokelat Keju

                    </h2>

                    <p className="text-xs sm:text-sm text-stone-200 mt-0.5 line-clamp-2">

                      Kombinasi paling hits:
                      Cokelat tebal lumer & keju gurih menggunung

                    </p>

                  </div>

                  <div className="text-right shrink-0 ml-4">

                    <span className="text-xs text-stone-300 block line-through">

                      Rp 26.000

                    </span>

                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-300 tabular-nums">

                      Rp 22.000

                    </span>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  FLOATING BADGE LEFT
                  ================================================== */}

              <div className="absolute -top-3 -left-2 sm:top-5 sm:-left-4 lg:top-8 lg:-left-5 bg-white/95 backdrop-blur-sm p-3 sm:p-3.5 rounded-2xl shadow-lg border border-stone-200/80 flex items-center gap-3 max-w-[230px]">

                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">

                  <Sparkles
                    className="w-5 h-5"
                    aria-hidden="true"
                  />

                </div>

                <div className="min-w-0">

                  <div className="text-xs font-bold text-[#241305]">

                    Lumer Melimpah

                  </div>

                  <div className="text-[11px] text-stone-500">

                    Bukan cokelat kaleng-kaleng

                  </div>

                </div>

              </div>

              {/* ==================================================
                  FLOATING BADGE RIGHT
                  ================================================== */}

              <div className="absolute -bottom-3 -right-1 sm:bottom-5 sm:-right-3 lg:bottom-8 lg:-right-4 bg-white/95 backdrop-blur-sm p-3 sm:p-3.5 rounded-2xl shadow-lg border border-stone-200/80 flex items-center gap-3 max-w-[230px]">

                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">

                  <CheckCircle2
                    className="w-5 h-5"
                    aria-hidden="true"
                  />

                </div>

                <div className="min-w-0">

                  <div className="text-xs font-bold text-[#241305]">

                    Garansi Kriuk

                  </div>

                  <div className="text-[11px] text-stone-500">

                    Tahan renyah hingga 4 jam

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};