/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

import { Copy, Check, Share2, Megaphone } from 'lucide-react';

import { MARKETING_COPYWRITING } from '../data/products';

export const DigitalMarketingKit = () => {
  const [copiedIndex, setCopiedIndex] =
    useState<number | null>(null);

  const handleCopy = async (
    text: string,
    index: number
  ) => {
    if (
      !navigator.clipboard ||
      !window.isSecureContext
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      window.setTimeout(() => {
        setCopiedIndex(null);
      }, 2500);
    } catch {
      setCopiedIndex(null);
    }
  };

  return (
    <section
      id="marketing-kit"
      className="py-16 bg-white border-t border-stone-200/80 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="text-center max-w-2xl mx-auto mb-10">

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
            <Megaphone
              className="w-3.5 h-3.5 text-amber-600"
              aria-hidden="true"
            />

            <span>
              Promo & Konten Pisang Melt
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241305] tracking-tight font-display">
            Konten Promo Pisang Melt
          </h2>

          <p className="text-sm text-stone-600 mt-2">
            Temukan berbagai caption dan materi promosi
            Pisang Melt yang siap digunakan untuk membagikan
            pengalaman dan promo kepada teman maupun media sosial.
          </p>

        </div>

        {/* ======================================================
            CONTENT
            ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {MARKETING_COPYWRITING.map(
            (copy, index) => (
              <div
                key={copy.title}
                className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200/80 flex flex-col justify-between space-y-4"
              >

                <div>

                  {/* Channel */}
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-800 mb-2">
                    <span className="bg-amber-100/70 px-2 py-0.5 rounded">
                      {copy.channel}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-bold text-[#241305] font-display">
                    {copy.title}
                  </h4>

                  {/* Content */}
                  <p className="text-xs text-stone-700 mt-2.5 p-3 bg-white rounded-xl border border-stone-200/60 leading-relaxed font-sans select-all">
                    "{copy.content}"
                  </p>

                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      copy.content,
                      index
                    )
                  }
                  disabled={
                    copiedIndex === index
                  }
                  aria-label={
                    copiedIndex === index
                      ? `Caption ${copy.title} sudah tersalin`
                      : `Salin caption ${copy.title}`
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-amber-800/20 bg-white hover:bg-amber-50 text-[#3A1E08] transition-colors cursor-pointer disabled:cursor-default disabled:opacity-80"
                >

                  {copiedIndex === index ? (
                    <>
                      <Check
                        className="w-3.5 h-3.5 text-emerald-600"
                        aria-hidden="true"
                      />

                      <span>
                        Teks Tersalin!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy
                        className="w-3.5 h-3.5 text-stone-500"
                        aria-hidden="true"
                      />

                      <span>
                        Salin Caption
                      </span>
                    </>
                  )}

                </button>

              </div>
            )
          )}

        </div>

        {/* ======================================================
            INFO
            ====================================================== */}

        <div className="mt-8 max-w-2xl mx-auto">

          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">

            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Share2
                className="w-4 h-4 text-amber-700"
                aria-hidden="true"
              />
            </div>

            <div>

              <h4 className="text-sm font-bold text-[#241305]">
                Bagikan Pengalamanmu
              </h4>

              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Salin caption yang tersedia dan bagikan
                pengalaman menikmati Pisang Melt melalui
                media sosial atau kepada temanmu.
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};