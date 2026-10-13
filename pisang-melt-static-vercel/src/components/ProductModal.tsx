import { useEffect, useState } from 'react';

import {
  Check,
  MessageCircle,
  Minus,
  Plus,
  Star,
  X,
} from 'lucide-react';

import {
  EXTRA_TOPPINGS,
  ExtraTopping,
  Product,
} from '../data/products';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    toppings: ExtraTopping[],
    notes: string
  ) => void;
}

const MAX_QUANTITY = 99;

export const ProductModal = ({
  product,
  onClose,
  onAddToCart,
}: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);

  const [selectedToppings, setSelectedToppings] =
    useState<ExtraTopping[]>([]);

  const [notes, setNotes] = useState('');

  // Reset pilihan ketika produk yang ditampilkan berubah.
  useEffect(() => {
    if (!product) {
      return;
    }

    setQuantity(1);
    setSelectedToppings([]);
    setNotes('');
  }, [product?.id]);

  if (!product) {
    return null;
  }

  const toggleTopping = (
    topping: ExtraTopping
  ) => {
    setSelectedToppings((current) => {
      const alreadySelected =
        current.some(
          (item) =>
            item.id === topping.id
        );

      if (alreadySelected) {
        return current.filter(
          (item) =>
            item.id !== topping.id
        );
      }

      return [
        ...current,
        topping,
      ];
    });
  };

  const toppingsTotal =
    selectedToppings.reduce(
      (total, topping) =>
        total + topping.price,
      0
    );

  const totalPrice =
    (product.price + toppingsTotal) *
    quantity;

  const handleAdd = () => {
    onAddToCart(
      product,
      quantity,
      selectedToppings,
      notes.trim()
    );

    onClose();
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(
        MAX_QUANTITY,
        current + 1
      )
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const generateDirectWaLink = () => {
    const toppingsText =
      selectedToppings.length > 0
        ? ` (Extra Topping: ${selectedToppings
            .map(
              (topping) =>
                topping.name
            )
            .join(', ')})`
        : '';

    const text = `Halo Admin Pisang Melt! Saya mau order cepat:
- *${product.name}* x ${quantity} porsi${toppingsText}
${notes.trim() ? `Catatan: ${notes.trim()}\n` : ''}Total: Rp ${totalPrice.toLocaleString(
      'id-ID'
    )}
Mohon info ketersediaan & ongkirnya ya. Terima kasih!`;

    return `https://wa.me/6281330608974?text=${encodeURIComponent(
      text
    )}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail produk ${product.name}`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail produk"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-stone-700 hover:text-black flex items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer active:scale-95"
        >
          <X
            className="w-5 h-5"
            aria-hidden="true"
          />
        </button>

        <div className="overflow-y-auto p-6 space-y-6">

          {/* Header Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            <div className="absolute bottom-3 left-4 text-white">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
                {product.category ===
                'crispy'
                  ? 'Crispy Series'
                  : 'Nugget Series'}
              </span>

              <h2 className="text-2xl font-bold font-display">
                {product.name}
              </h2>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="space-y-4">

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">

              <div className="flex items-center gap-3 text-xs text-stone-600">

                <span className="flex items-center gap-1 font-bold text-amber-700">
                  <Star
                    className="w-4 h-4 fill-amber-500 text-amber-500"
                    aria-hidden="true"
                  />

                  <span>
                    {product.rating}{' '}
                    ({product.reviewsCount}{' '}
                    review)
                  </span>
                </span>

                <span aria-hidden="true">
                  ·
                </span>

                <span>
                  {product.portion}
                </span>

                <span aria-hidden="true">
                  ·
                </span>

                <span>
                  {product.calories}
                </span>

              </div>

              <div className="text-xl font-bold text-[#3A1E08] tabular-nums font-display">
                Rp{' '}
                {product.price.toLocaleString(
                  'id-ID'
                )}
              </div>

            </div>

            {/* Description */}
            <p className="text-sm text-stone-700 leading-relaxed">
              {product.description}
            </p>

            {/* Ingredients */}
            <div className="text-xs text-stone-500 flex flex-wrap gap-1.5 items-center">
              <span className="font-semibold text-stone-700">
                Komposisi:
              </span>

              {product.ingredients.map(
                (
                  ingredient,
                  index
                ) => (
                  <span
                    key={`${product.id}-ingredient-${index}`}
                  >
                    {ingredient}
                    {index <
                      product.ingredients.length -
                        1 &&
                      ' ·'}
                  </span>
                )
              )}
            </div>

            {/* Toppings Customizer */}
            <div className="space-y-2 pt-2 border-t border-stone-100">

              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Tambah Ekstra Topping (Opsional)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                {EXTRA_TOPPINGS.map(
                  (topping) => {
                    const isChecked =
                      selectedToppings.some(
                        (item) =>
                          item.id ===
                          topping.id
                      );

                    return (
                      <button
                        key={topping.id}
                        type="button"
                        onClick={() =>
                          toggleTopping(
                            topping
                          )
                        }
                        aria-pressed={
                          isChecked
                        }
                        aria-label={`${isChecked ? 'Hapus' : 'Tambah'} ${topping.name}`}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isChecked
                            ? 'border-amber-600 bg-amber-50/60 font-semibold text-amber-950 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                        }`}
                      >

                        <div className="flex items-center gap-2">

                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                              isChecked
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isChecked && (
                              <Check
                                className="w-3 h-3"
                                aria-hidden="true"
                              />
                            )}
                          </div>

                          <span>
                            {topping.name}
                          </span>

                        </div>

                        <span className="font-mono text-stone-500 tabular-nums">
                          +Rp{' '}
                          {topping.price.toLocaleString(
                            'id-ID'
                          )}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 pt-1">

              <label
                htmlFor="order-notes"
                className="text-xs font-semibold text-stone-700"
              >
                Catatan Pesanan Khusus (opsional)
              </label>

              <input
                id="order-notes"
                type="text"
                placeholder="Contoh: Saus dipisah, minta garpu lebih, dll."
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                maxLength={250}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-stone-50/50"
              />

              <div className="text-right text-[10px] text-stone-400">
                {notes.length}/250
              </div>

            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Controls */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Quantity */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">

            <span className="text-xs text-stone-500">
              Jumlah:
            </span>

            <div className="flex items-center border border-stone-300 bg-white rounded-xl overflow-hidden shadow-xs">

              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  quantity <= 1
                }
                className="p-2 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Kurangi satu"
              >
                <Minus
                  className="w-4 h-4"
                  aria-hidden="true"
                />
              </button>

              <span
                className="px-4 text-sm font-bold text-stone-900 tabular-nums font-mono"
                aria-live="polite"
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  quantity >=
                  MAX_QUANTITY
                }
                className="p-2 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Tambah satu"
              >
                <Plus
                  className="w-4 h-4"
                  aria-hidden="true"
                />
              </button>

            </div>
          </div>

          {/* Order Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">

            <a
              href={generateDirectWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Pesan ${product.name} langsung melalui WhatsApp`}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <MessageCircle
                className="w-3.5 h-3.5"
                aria-hidden="true"
              />

              <span>
                WA Langsung
              </span>
            </a>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#3A1E08] hover:bg-[#251203] rounded-xl transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <span>
                + Keranjang
              </span>

              <span
                className="opacity-80"
                aria-hidden="true"
              >
                ·
              </span>

              <span className="tabular-nums">
                Rp{' '}
                {totalPrice.toLocaleString(
                  'id-ID'
                )}
              </span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};