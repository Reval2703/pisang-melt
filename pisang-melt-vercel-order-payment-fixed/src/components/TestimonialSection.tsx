import { CheckCircle, Star } from 'lucide-react';

import { CUSTOMER_TESTIMONIALS } from '../data/products';

export const TestimonialSection = () => {
  return (
    <section
      id="ulasan"
      className="py-16 bg-[#FAF7F2] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
            <Star
              className="w-3.5 h-3.5 fill-amber-500 text-amber-500"
              aria-hidden="true"
            />

            <span>
              Kata Mereka yang Sudah Mencoba
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241305] tracking-tight font-display">
            Pengalaman Pecinta Camilan Pisang Melt
          </h2>

          <p className="text-sm text-stone-600 mt-2">
            Lebih dari 15.000 kotak telah terkirim ke
            berbagai acara keluarga, kantor, dan santai
            sore. Ini kata mereka:
          </p>
        </div>

        {/* Testimonials 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CUSTOMER_TESTIMONIALS.map((item) => (
            <article
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">

                {/* Rating & Verified */}
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex text-amber-500 gap-0.5"
                    aria-label={`Rating ${item.rating} dari 5`}
                    role="img"
                  >
                    {Array.from(
                      { length: item.rating },
                      (_, index) => (
                        <Star
                          key={index}
                          className="w-4 h-4 fill-amber-500"
                          aria-hidden="true"
                        />
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <CheckCircle
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />

                    <span>
                      Pembelian Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Review */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{item.review}"
                </p>
              </div>

              {/* Author & Order Info */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#241305] font-display">
                    {item.name}
                  </h4>

                  <p className="text-[11px] text-stone-500">
                    {item.role}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                    {item.order}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};