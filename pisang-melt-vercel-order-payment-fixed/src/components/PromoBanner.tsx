/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface PromoBannerProps {
  onApplyCode?: (code: string) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  onApplyCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const promoCode = 'LUMER20';

  if (dismissed) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);

      setCopied(true);

      if (onApplyCode) {
        onApplyCode(promoCode);
      }

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      console.error(
        'Gagal menyalin kode voucher:',
        error
      );
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="bg-[#3A1E08] text-amber-100 text-xs py-2 px-4 border-b border-amber-900/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Promo Information */}
        <div className="flex items-center gap-2 overflow-hidden min-w-0">

          <Sparkles
            className="w-3.5 h-3.5 text-amber-400 shrink-0"
            aria-hidden="true"
          />

          <p className="truncate">

            <span className="font-semibold text-white">
              Promo Launching Digital:
            </span>{' '}

            <span>
              Potongan 20% semua varian dengan kode{' '}
            </span>

            <span className="font-mono font-bold text-amber-300 bg-black/30 px-1.5 py-0.5 rounded">
              {promoCode}
            </span>

            <span className="hidden sm:inline text-amber-200/80">
              {' '}· Berlaku hari ini
            </span>

          </p>
        </div>

        {/* Customer Actions */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Copy Voucher */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label={`Salin kode voucher ${promoCode}`}
          >
            {copied ? (
              <>
                <Check
                  className="w-3 h-3 text-emerald-400"
                  aria-hidden="true"
                />

                <span>
                  Tersalin!
                </span>
              </>
            ) : (
              <>
                <Copy
                  className="w-3 h-3"
                  aria-hidden="true"
                />

                <span>
                  Salin Voucher
                </span>
              </>
            )}
          </button>

          {/* Dismiss Banner */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup banner promo"
            className="text-amber-300/60 hover:text-white transition-colors cursor-pointer active:scale-95"
          >
            <X
              className="w-3.5 h-3.5"
              aria-hidden="true"
            />
          </button>

        </div>
      </div>
    </div>
  );
};