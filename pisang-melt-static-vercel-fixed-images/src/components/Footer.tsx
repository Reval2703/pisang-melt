import React from 'react';
import {
  Clock,
  MapPin,
  Phone,
  Instagram,
  MessageCircle,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const whatsappNumber = '6281330608974';

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Halo Admin Pisang Melt, saya ingin tanya menu dan order dong.'
  )}`;

  return (
    <footer className="bg-[#241305] text-stone-300 py-14 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <a
              href="#"
              aria-label="Pisang Melt - Beranda"
              className="inline-block text-2xl font-extrabold text-white font-display tracking-tight hover:text-amber-300 transition-colors"
            >
              Pisang Melt
            </a>

            <p className="text-xs text-stone-400 leading-relaxed">
              Pelopor camilan pisang crispy dan pisang nugget dengan lelehan
              cokelat premium serta limpahan keju gurih melimpah. Renyah di
              luar, lumer di dalam!
            </p>
          </div>

          {/* Jam Operasional */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-display">
              Jam Operasional
            </h4>

            <div className="text-xs space-y-1.5 text-stone-300">
              <div className="flex items-center gap-2">
                <Clock
                  className="w-3.5 h-3.5 text-amber-400 shrink-0"
                  aria-hidden="true"
                />

                <span>
                  Senin - Minggu: 10:00 - 22:00 WIB
                </span>
              </div>

              <p className="text-[11px] text-stone-400 pl-5.5">
                Penggorengan terakhir pukul 21:30 WIB
              </p>
            </div>
          </div>

          {/* Lokasi & WhatsApp */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-display">
              Lokasi & Outlet
            </h4>

            <div className="text-xs space-y-2 text-stone-300">

              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin
                  className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />

                <span>
                  Perumahan Jati Permai Block C3 No 21,
                  Kec. Cikarang Selatan, Bekasi,
                  Jawa Barat 17530
                </span>
              </div>

              {/* WhatsApp */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hubungi Pisang Melt melalui WhatsApp"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone
                  className="w-3.5 h-3.5 text-amber-400 shrink-0"
                  aria-hidden="true"
                />

                <span>
                  WhatsApp: +62 813-3060-8974
                </span>
              </a>
            </div>
          </div>

          {/* Delivery & Social */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-display">
              Tersedia Di
            </h4>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-stone-800/80 px-2.5 py-1 rounded text-stone-300">
                GoFood
              </span>

              <span className="bg-stone-800/80 px-2.5 py-1 rounded text-stone-300">
                GrabFood
              </span>

              <span className="bg-stone-800/80 px-2.5 py-1 rounded text-stone-300">
                ShopeeFood
              </span>

              <span className="bg-stone-800/80 px-2.5 py-1 rounded text-stone-300">
                WhatsApp Delivery
              </span>
            </div>

            {/* Instagram */}
            <a
              href="https://instagram.com/pisangmelt.official"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Pisang Melt"
              className="pt-2 flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Instagram
                className="w-4 h-4"
                aria-hidden="true"
              />

              <span>@pisangmelt.official</span>
            </a>

            {/* WhatsApp Quick Contact */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat WhatsApp dengan Admin Pisang Melt"
              className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle
                className="w-3.5 h-3.5"
                aria-hidden="true"
              />

              <span>Chat dengan Admin</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 text-center sm:flex sm:justify-between text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} Pisang Melt Artisan.
            Hak Cipta Dilindungi.
          </p>

          <p className="mt-2 sm:mt-0">
            100% Produk Kuliner Buatan Anak Bangsa
          </p>
        </div>
      </div>
    </footer>
  );
};