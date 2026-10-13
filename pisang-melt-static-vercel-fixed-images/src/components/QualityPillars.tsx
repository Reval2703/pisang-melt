import {
  Award,
  Flame,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { MARKETING_BENEFITS } from '../data/products';

export const QualityPillars = () => {
  const icons = [
    Award,
    Flame,
    Sparkles,
    HeartHandshake,
  ];

  const whatsappMessage =
    'Halo Admin Pisang Melt, saya mau order dong';

  const whatsappUrl =
    `https://wa.me/6281330608974?text=${encodeURIComponent(
      whatsappMessage
    )}`;

  return (
    <section
      id="keunggulan"
      className="py-16 bg-[#FAF7F2] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
            <ShieldCheck
              className="w-3.5 h-3.5 text-amber-600"
              aria-hidden="true"
            />

            <span>Kualitas Tanpa Kompromi</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241305] tracking-tight font-display">
            Kenapa Pisang Melt Lebih Nikmat?
          </h2>

          <p className="text-sm text-stone-600 mt-2">
            Setiap gigitan adalah kombinasi presisi
            antara bahan baku alami, teknik
            penggorengan higienis, dan topping
            gourmet terbaik.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MARKETING_BENEFITS.map(
            (benefit, index) => {
              const IconComponent =
                icons[index % icons.length];

              return (
                <div
                  key={benefit.title}
                  className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center mb-4">
                      <IconComponent
                        className="w-5 h-5"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="text-base font-bold text-[#241305] font-display">
                      {benefit.title}
                    </h3>

                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
                    <ShieldCheck
                      className="w-3.5 h-3.5"
                      aria-hidden="true"
                    />

                    <span>
                      Standar Higienis Teruji
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Customer Guarantee Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-amber-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck
                className="w-7 h-7"
                aria-hidden="true"
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#241305] font-display">
                Garansi Kepuasan Pelanggan 100%
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Pesanan tiba dalam kondisi melempem
                atau saus tumpah? Hubungi WhatsApp
                kami dalam 1 jam, kami ganti gratis
                box baru!
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pesan Pisang Melt melalui WhatsApp"
            className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold text-white bg-[#3A1E08] hover:bg-[#251203] rounded-xl transition-colors shrink-0 shadow-xs whitespace-nowrap"
          >
            Pesan Sekarang
          </a>
        </div>

      </div>
    </section>
  );
};