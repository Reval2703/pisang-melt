/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShoppingBag,
  MessageCircle,
  Gift,
  Mic,
} from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  loyaltyPoints: number;
  onOpenCart: () => void;
  onOpenMarketingKit: () => void;
  onScrollToLoyalty: () => void;
  onOpenVoiceAssistant: () => void;
}

const WHATSAPP_NUMBER =
  '6281330608974';

const WHATSAPP_MESSAGE =
  'Halo Admin Pisang Melt, mau tanya menu dan order dong';

const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  loyaltyPoints,
  onOpenCart,
  onOpenMarketingKit,
  onScrollToLoyalty,
  onOpenVoiceAssistant,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#2C241E]/10">

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-18 lg:h-20 flex items-center justify-between gap-4">

        {/* ==================================================
            BRAND
            ================================================== */}

        <a
          href="#"
          className="flex items-center gap-2 group shrink-0"
          aria-label="Pisang Melt - Beranda"
        >
          <span className="text-2xl lg:text-[26px] xl:text-3xl font-extrabold tracking-tight text-[#3A1E08] font-display">

            Pisang Melt

          </span>

          <span
            className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"
            aria-hidden="true"
          />

        </a>

        {/* ==================================================
            DESKTOP NAVIGATION
            ================================================== */}

        <nav
          className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 text-xs xl:text-sm font-medium text-[#5C4A3E] flex-1"
          aria-label="Navigasi utama"
        >

          {/* Menu Hari Ini */}

          <a
            href="#menu-hari-ini"
            className="text-amber-950 font-bold hover:text-black transition-colors flex items-center gap-1 whitespace-nowrap"
          >

            <span>
              Menu Hari Ini
            </span>

            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"
              aria-hidden="true"
            />

          </a>

          {/* Menu Varian */}

          <a
            href="#menu-varian"
            className="hover:text-[#3A1E08] transition-colors whitespace-nowrap"
          >
            Menu Varian
          </a>

          {/* Paket Hemat */}

          <a
            href="#paket-promo"
            className="hover:text-[#3A1E08] transition-colors whitespace-nowrap"
          >
            Paket Hemat
          </a>

          {/* Poin Hadiah */}

          <button
            type="button"
            onClick={onScrollToLoyalty}
            className="hover:text-[#3A1E08] transition-colors font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >

            <Gift
              className="w-3.5 h-3.5 text-amber-700"
              aria-hidden="true"
            />

            <span>
              Poin Hadiah
            </span>

            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-mono tabular-nums">

              {loyaltyPoints} Pts

            </span>

          </button>

          {/* Kualitas */}

          <a
            href="#keunggulan"
            className="hover:text-[#3A1E08] transition-colors whitespace-nowrap"
          >
           
          </a>

          {/* Ulasan */}

          <a
            href="#ulasan"
            className="hover:text-[#3A1E08] transition-colors whitespace-nowrap"
          >
         
          </a>

          {/* Promo */}

          <button
            type="button"
            onClick={onOpenMarketingKit}
            className="hover:text-[#3A1E08] transition-colors text-left font-medium cursor-pointer whitespace-nowrap"
          >
        
          </button>

        </nav>

        {/* ==================================================
            CUSTOMER ACTIONS
            ================================================== */}

        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">

          {/* ==================================================
              VOICE AI
              ================================================== */}

          <button
            type="button"
            onClick={onOpenVoiceAssistant}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 lg:px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-300/80 hover:bg-amber-300 border border-amber-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm active:scale-95"
            title="Percakapan Suara dengan AI Pisang Melt"
            aria-label="Buka Suara AI"
          >

            <Mic
              className="w-3.5 h-3.5 text-amber-900 animate-pulse"
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              Suara AI
            </span>

          </button>

          {/* ==================================================
              WHATSAPP
              ================================================== */}

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 lg:px-3.5 py-2 text-xs font-semibold text-[#1F512B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors whitespace-nowrap"
            aria-label="Chat WhatsApp dengan Admin Pisang Melt"
          >

            <MessageCircle
              className="w-3.5 h-3.5"
              aria-hidden="true"
            />

            <span>
              Chat WA
            </span>

          </a>

          {/* ==================================================
              CART
              ================================================== */}

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Keranjang belanja dengan ${cartCount} item`}
            className="relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-[#3A1E08] hover:bg-[#271304] rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer active:scale-95"
          >

            <ShoppingBag
              className="w-4 h-4"
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              Pesanan
            </span>

            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-[#3A1E08] bg-amber-400 rounded-full tabular-nums">

                {cartCount}

              </span>
            )}

          </button>

        </div>

      </div>

    </header>
  );
};