/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Navbar } from './components/Navbar';
import { PromoBanner } from './components/PromoBanner';
import { HeroSection } from './components/HeroSection';
import { DailySpecialSection } from './components/DailySpecialSection';
import { ProductMenu } from './components/ProductMenu';
import { BundleSection } from './components/BundleSection';
import { LoyaltyRewards } from './components/LoyaltyRewards';
import { QualityPillars } from './components/QualityPillars';
import { DigitalMarketingKit } from './components/DigitalMarketingKit';
import { TestimonialSection } from './components/TestimonialSection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { OnlinePaymentModal } from './components/OnlinePaymentModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { Footer } from './components/Footer';

import {
  Product,
  PromoBundle,
  ExtraTopping,
  PRODUCTS,
  PROMO_BUNDLES,
} from './data/products';

import {
  CartItem,
  ActiveOrder,
  PaymentMethodType,
} from './types/cart';

import {
  LoyaltyState,
  POINTS_PER_FREE_BOX,
  RUPIAH_PER_POINT,
} from './types/loyalty';

import {
  ShoppingBag,
  CheckCircle,
  MessageCircle,
  Bike,
  Flame,
  Clock,
  Mic,
} from 'lucide-react';

const ACTIVE_ORDER_STORAGE_KEY =
  'pisang_melt_active_order';

const ORDER_STORAGE_KEY =
  'pisang_melt_orders';

const LOYALTY_STORAGE_KEY =
  'pisang_melt_loyalty';

const WHATSAPP_NUMBER =
  '6281330608974';

const WHATSAPP_MESSAGE =
  'Halo Admin Pisang Melt, mau tanya menu dan order dong';

const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

// ============================================================
// ADMIN STATUS → CUSTOMER STATUS
// ============================================================

const mapAdminStatusToCustomerStatus = (
  adminStatus: string
): ActiveOrder['status'] => {
  switch (
    adminStatus
      .toLowerCase()
      .trim()
  ) {
    case 'baru':
      return 'received';

    case 'diproses':
      return 'cooking';

    case 'siap':
      return 'ready';

    case 'selesai':
      return 'ready';

    default:
      return 'received';
  }
};

export default function App() {
  // ============================================================
  // CUSTOMER CART
  // ============================================================

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [isVoiceModalOpen, setIsVoiceModalOpen] =
    useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  // ============================================================
  // TOAST
  // ============================================================

  const showToast = useCallback(
    (message: string) => {
      setToastMessage(message);

      window.setTimeout(() => {
        setToastMessage(null);
      }, 3200);
    },
    []
  );

  // ============================================================
  // ACTIVE CUSTOMER ORDER
  // ============================================================

  const [activeOrder, setActiveOrder] =
    useState<ActiveOrder | null>(() => {
      try {
        const saved =
          localStorage.getItem(
            ACTIVE_ORDER_STORAGE_KEY
          );

        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.warn(
          'Gagal membaca active order:',
          error
        );
      }

      return null;
    });

  useEffect(() => {
    try {
      if (activeOrder) {
        localStorage.setItem(
          ACTIVE_ORDER_STORAGE_KEY,
          JSON.stringify(activeOrder)
        );
      } else {
        localStorage.removeItem(
          ACTIVE_ORDER_STORAGE_KEY
        );
      }
    } catch (error) {
      console.warn(
        'Gagal menyimpan active order:',
        error
      );
    }
  }, [activeOrder]);

  // ============================================================
  // SYNC STATUS PESANAN DARI ADMIN
  // ============================================================

  useEffect(() => {
    if (!activeOrder?.orderId) {
      return;
    }

    const syncActiveOrderFromAdmin = () => {
      try {
        const savedOrders =
          localStorage.getItem(
            ORDER_STORAGE_KEY
          );

        if (!savedOrders) {
          return;
        }

        const adminOrders =
          JSON.parse(savedOrders);

        if (!Array.isArray(adminOrders)) {
          return;
        }

        const adminOrder =
          adminOrders.find(
            (item: any) =>
              item.id === activeOrder.orderId
          );

        if (!adminOrder) {
          return;
        }

        const customerStatus =
          mapAdminStatusToCustomerStatus(
            adminOrder.status
          );

        const customerPaymentStatus =
          adminOrder.paymentStatus ===
          'Dibayar'
            ? 'paid'
            : 'pending';

        setActiveOrder((prev) => {
          if (!prev) {
            return null;
          }

          if (
            prev.status ===
              customerStatus &&
            prev.paymentStatus ===
              customerPaymentStatus
          ) {
            return prev;
          }

          return {
            ...prev,
            status: customerStatus,
            paymentStatus:
              customerPaymentStatus,
          };
        });
      } catch (error) {
        console.warn(
          'Gagal sinkronisasi status pesanan:',
          error
        );
      }
    };

    syncActiveOrderFromAdmin();

    const handleOrderUpdate = () => {
      syncActiveOrderFromAdmin();
    };

    window.addEventListener(
      'storage',
      handleOrderUpdate
    );

    window.addEventListener(
      'pisang-melt-orders-updated',
      handleOrderUpdate
    );

    const intervalId =
      window.setInterval(
        syncActiveOrderFromAdmin,
        2000
      );

    return () => {
      window.removeEventListener(
        'storage',
        handleOrderUpdate
      );

      window.removeEventListener(
        'pisang-melt-orders-updated',
        handleOrderUpdate
      );

      window.clearInterval(
        intervalId
      );
    };
  }, [
    activeOrder?.orderId,
  ]);

  // ============================================================
  // LOYALTY CUSTOMER
  // ============================================================

  const [loyalty, setLoyalty] =
    useState<LoyaltyState>(() => {
      try {
        const saved =
          localStorage.getItem(
            LOYALTY_STORAGE_KEY
          );

        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.warn(
          'Gagal membaca data loyalty:',
          error
        );
      }

      return {
        points: 60,
        totalEarnedLifetime: 60,
        totalBoxesClaimed: 0,

        history: [
          {
            id: 'hist-welcome',
            date: 'Hari ini',
            title:
              'Bonus Pendaftaran Member Baru MeltClub',
            points: 20,
            type: 'welcome',
          },
          {
            id: 'hist-order-1',
            date: 'Hari ini',
            title:
              'Order 2x Pisang Crispy Cokelat',
            points: 40,
            type: 'order',
          },
        ],
      };
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        LOYALTY_STORAGE_KEY,
        JSON.stringify(loyalty)
      );
    } catch (error) {
      console.warn(
        'Gagal menyimpan data loyalty:',
        error
      );
    }
  }, [loyalty]);

  // ============================================================
  // CART COUNT
  // ============================================================

  const totalCartCount =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  // ============================================================
  // CUSTOMER LOYALTY POINTS
  // ============================================================

  const handleEarnPoints = useCallback(
    (
      pointsToAdd: number,
      source: string
    ) => {
      if (
        !Number.isFinite(pointsToAdd) ||
        pointsToAdd <= 0
      ) {
        return;
      }

      const safePoints =
        Math.floor(pointsToAdd);

      if (safePoints <= 0) {
        return;
      }

      setLoyalty((prev) => ({
        ...prev,

        points:
          prev.points + safePoints,

        totalEarnedLifetime:
          prev.totalEarnedLifetime +
          safePoints,

        history: [
          {
            id: `pts-${Date.now()}`,
            date: 'Baru saja',
            title: source,
            points: safePoints,
            type: 'order',
          },
          ...prev.history,
        ],
      }));

      showToast(
        `🎉 +${safePoints} Poin MeltClub berhasil didapatkan!`
      );
    },
    [showToast]
  );

  // ============================================================
  // PAYMENT SUCCESS
  // ============================================================

  const handlePaymentSuccess = useCallback(
    (
      method: PaymentMethodType,
      paymentRef: string
    ) => {
      if (!activeOrder) {
        return;
      }

      const grandTotal =
        Number(activeOrder.grandTotal) || 0;

      setActiveOrder((prev) =>
        prev
          ? {
              ...prev,
              paymentMethod: method,
              paymentStatus: 'paid',
              paymentRef,
              status: 'cooking',
            }
          : null
      );

      const pointsToEarn =
        Math.floor(
          grandTotal /
            RUPIAH_PER_POINT
        );

      if (pointsToEarn > 0) {
        handleEarnPoints(
          pointsToEarn,
          `Pembayaran Lunas #${activeOrder.orderId}`
        );
      }

      setIsPaymentModalOpen(false);

      showToast(
        `✅ Pembayaran Rp ${grandTotal.toLocaleString(
          'id-ID'
        )} LUNAS! Dapur mulai memasak.`
      );
    },
    [
      activeOrder,
      handleEarnPoints,
      showToast,
    ]
  );

  // ============================================================
  // CLAIM FREE BOX
  // ============================================================

  const handleClaimFreeBox = (
    product: Product
  ) => {
    if (
      loyalty.points <
      POINTS_PER_FREE_BOX
    ) {
      showToast(
        `Poin Anda belum mencukupi (minimal ${POINTS_PER_FREE_BOX} Poin).`
      );
      return;
    }

    const rewardId =
      `redeem-${Date.now()}`;

    setLoyalty((prev) => ({
      ...prev,

      points:
        prev.points -
        POINTS_PER_FREE_BOX,

      totalBoxesClaimed:
        prev.totalBoxesClaimed + 1,

      history: [
        {
          id: rewardId,
          date: 'Baru saja',
          title:
            `Tukar Hadiah 1 Box ${product.name}`,
          points:
            -POINTS_PER_FREE_BOX,
          type: 'redeem',
        },
        ...prev.history,
      ],
    }));

    const freeItemId =
      `free-reward-${Date.now()}`;

    setCartItems((prev) => [
      ...prev,

      {
        id: freeItemId,

        product: {
          ...product,
          price: 0,
          name:
            `${product.name} (Hadiah Gratis Poin)`,
        },

        quantity: 1,

        selectedToppings: [],

        notes:
          `Hadiah ${POINTS_PER_FREE_BOX} Poin MeltClub (Gratis)`,
      },
    ]);

    showToast(
      `🎁 1 Box ${product.name} GRATIS berhasil dimasukkan ke keranjang!`
    );

    setIsCartOpen(true);
  };

  // ============================================================
  // QUICK ADD PRODUCT
  // ============================================================

  const handleQuickAdd = (
    product: Product,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const itemId =
      `${product.id}-default`;

    setCartItems((prev) => {
      const existing =
        prev.find(
          (item) =>
            item.id === itemId
        );

      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,

        {
          id: itemId,
          product,
          quantity: 1,
          selectedToppings: [],
        },
      ];
    });

    showToast(
      `1x ${product.name} masuk ke keranjang!`
    );
  };

  // ============================================================
  // FIND VOICE PRODUCT
  // ============================================================

  const findVoiceProduct = (
    productName: string
  ): Product | null => {
    const normalizedName =
      productName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    if (!normalizedName) {
      return null;
    }

    const exactMatch =
      PRODUCTS.find(
        (product) =>
          product.name
            .toLowerCase()
            .trim() === normalizedName
      );

    if (exactMatch) {
      return exactMatch;
    }

    return (
      PRODUCTS.find((product) => {
        const name =
          product.name
            .toLowerCase()
            .trim();

        return (
          normalizedName.includes(name) ||
          name.includes(normalizedName)
        );
      }) || null
    );
  };

  // ============================================================
  // FIND VOICE BUNDLE
  // ============================================================

  const findVoiceBundle = (
    bundleName: string
  ): PromoBundle | null => {
    const normalizedName =
      bundleName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    if (!normalizedName) {
      return null;
    }

    const exactMatch =
      PROMO_BUNDLES.find(
        (bundle) =>
          bundle.name
            .toLowerCase()
            .trim() === normalizedName
      );

    if (exactMatch) {
      return exactMatch;
    }

    return (
      PROMO_BUNDLES.find(
        (bundle) => {
          const name =
            bundle.name
              .toLowerCase()
              .trim();

          return (
            normalizedName.includes(name) ||
            name.includes(normalizedName)
          );
        }
      ) || null
    );
  };

  // ============================================================
  // VOICE AI → ADD PRODUCT
  // ============================================================

  const handleVoiceAddToCart = (
    productName: string,
    quantity: number = 1
  ) => {
    const product =
      findVoiceProduct(productName);

    if (!product) {
      console.warn(
        'Produk dari Voice AI tidak ditemukan:',
        productName
      );

      showToast(
        `Produk "${productName}" tidak ditemukan.`
      );

      return;
    }

    const safeQuantity =
      Math.max(
        1,
        Math.floor(
          Number(quantity) || 1
        )
      );

    const itemId =
      `${product.id}-default`;

    setCartItems((prev) => {
      const existing =
        prev.find(
          (item) =>
            item.id === itemId
        );

      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity:
                  item.quantity +
                  safeQuantity,
              }
            : item
        );
      }

      return [
        ...prev,

        {
          id: itemId,
          product,
          quantity: safeQuantity,
          selectedToppings: [],
        },
      ];
    });

    showToast(
      `🎙️ ${safeQuantity}x ${product.name} ditambahkan oleh Voice AI!`
    );

    setIsCartOpen(true);
  };

  // ============================================================
  // VOICE AI → REMOVE PRODUCT
  // ============================================================

  const handleVoiceRemoveFromCart = (
    productName: string,
    quantity: number = 1
  ) => {
    const product =
      findVoiceProduct(productName);

    if (!product) {
      showToast(
        `Produk "${productName}" tidak ditemukan.`
      );

      return;
    }

    const safeQuantity =
      Math.max(
        1,
        Math.floor(
          Number(quantity) || 1
        )
      );

    const itemId =
      `${product.id}-default`;

    const existing =
      cartItems.find(
        (item) =>
          item.id === itemId
      );

    if (!existing) {
      showToast(
        `${product.name} tidak ada di keranjang.`
      );

      return;
    }

    setCartItems((prev) => {
      return prev.flatMap((item) => {
        if (item.id !== itemId) {
          return [item];
        }

        const newQuantity =
          item.quantity -
          safeQuantity;

        if (newQuantity <= 0) {
          return [];
        }

        return [
          {
            ...item,
            quantity: newQuantity,
          },
        ];
      });
    });

    if (
      existing.quantity <=
      safeQuantity
    ) {
      showToast(
        `🎙️ ${product.name} dihapus dari keranjang.`
      );
    } else {
      showToast(
        `🎙️ ${safeQuantity}x ${product.name} dikurangi dari keranjang.`
      );
    }

    setIsCartOpen(true);
  };

  // ============================================================
  // PRODUCT MODAL → CUSTOMER CART
  // ============================================================

  const handleAddToCartFromModal = (
    product: Product,
    quantity: number,
    toppings: ExtraTopping[],
    notes: string
  ) => {
    const safeQuantity =
      Math.max(
        1,
        Math.floor(
          Number(quantity) || 1
        )
      );

    const toppingIds =
      toppings
        .map((topping) => topping.id)
        .sort()
        .join('-');

    const cleanNotes =
      notes.trim();

    const itemId =
      `${product.id}-${toppingIds || 'no-topping'}-${
        cleanNotes
          ? cleanNotes.toLowerCase()
          : 'clean'
      }`;

    setCartItems((prev) => {
      const existing =
        prev.find(
          (item) =>
            item.id === itemId
        );

      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity:
                  item.quantity +
                  safeQuantity,
              }
            : item
        );
      }

      return [
        ...prev,

        {
          id: itemId,
          product,
          quantity: safeQuantity,
          selectedToppings: toppings,
          notes: cleanNotes,
        },
      ];
    });

    showToast(
      `${safeQuantity}x ${product.name} berhasil ditambahkan!`
    );
  };

  // ============================================================
  // ADD BUNDLE TO CUSTOMER CART
  // ============================================================

  const handleAddBundle = (
    bundle: PromoBundle,
    quantity: number = 1
  ) => {
    const targetProduct =
      PRODUCTS.find(
        (product) =>
          product.isBestSeller
      ) || PRODUCTS[0];

    const safeQuantity =
      Math.max(
        1,
        Math.floor(
          Number(quantity) || 1
        )
      );

    const itemId =
      `bundle-${bundle.id}`;

    setCartItems((prev) => {
      const existing =
        prev.find(
          (item) =>
            item.id === itemId
        );

      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity:
                  item.quantity +
                  safeQuantity,
              }
            : item
        );
      }

      return [
        ...prev,

        {
          id: itemId,

          product: {
            ...targetProduct,
            name: bundle.name,
            price: bundle.price,
            portion: bundle.items,
          },

          quantity: safeQuantity,

          selectedToppings: [],

          notes: bundle.items,
        },
      ];
    });

    showToast(
      `${safeQuantity}x ${bundle.name} berhasil ditambahkan ke keranjang!`
    );
  };

  // ============================================================
  // VOICE AI → ADD BUNDLE
  // ============================================================

  const handleVoiceAddBundle = (
    bundleName: string,
    quantity: number = 1
  ) => {
    const bundle =
      findVoiceBundle(bundleName);

    if (!bundle) {
      showToast(
        `Paket "${bundleName}" tidak ditemukan.`
      );

      return;
    }

    const safeQuantity =
      Math.max(
        1,
        Math.floor(
          Number(quantity) || 1
        )
      );

    handleAddBundle(
      bundle,
      safeQuantity
    );

    showToast(
      `🎙️ ${safeQuantity}x ${bundle.name} ditambahkan oleh Voice AI!`
    );

    setIsCartOpen(true);
  };

  // ============================================================
  // VOICE AI → REMOVE BUNDLE
  // ============================================================

  const handleVoiceRemoveBundle = (
    bundleName: string,
    quantity: number = 1,
    removeAll: boolean = false
  ) => {
    const bundle =
      findVoiceBundle(bundleName);

    if (!bundle) {
      showToast(
        `Paket "${bundleName}" tidak ditemukan.`
      );

      return;
    }

    const itemId =
      `bundle-${bundle.id}`;

    const existing =
      cartItems.find(
        (item) =>
          item.id === itemId
      );

    if (!existing) {
      showToast(
        `${bundle.name} tidak ada di keranjang.`
      );

      return;
    }

    const safeQuantity =
      Math.max(
        1,
        Math.floor(
          Number(quantity) || 1
        )
      );

    setCartItems((prev) => {
      if (removeAll) {
        return prev.filter(
          (item) =>
            item.id !== itemId
        );
      }

      return prev.flatMap((item) => {
        if (item.id !== itemId) {
          return [item];
        }

        const newQuantity =
          item.quantity -
          safeQuantity;

        if (newQuantity <= 0) {
          return [];
        }

        return [
          {
            ...item,
            quantity: newQuantity,
          },
        ];
      });
    });

    if (removeAll) {
      showToast(
        `🎙️ Semua ${bundle.name} dihapus dari keranjang.`
      );
    } else if (
      existing.quantity <=
      safeQuantity
    ) {
      showToast(
        `🎙️ ${bundle.name} dihapus dari keranjang.`
      );
    } else {
      showToast(
        `🎙️ ${safeQuantity}x ${bundle.name} dikurangi dari keranjang.`
      );
    }

    setIsCartOpen(true);
  };

  // ============================================================
  // DAILY SPECIAL
  // ============================================================

  const handleAddDailySpecialToCart = (
    product: Product,
    specialPrice: number
  ) => {
    const itemId =
      `special-deal-${product.id}`;

    const safePrice =
      Number.isFinite(specialPrice) &&
      specialPrice >= 0
        ? specialPrice
        : product.price;

    setCartItems((prev) => {
      const existing =
        prev.find(
          (item) =>
            item.id === itemId
        );

      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,

        {
          id: itemId,

          product: {
            ...product,
            price: safePrice,
            name:
              `${product.name} (Flash Deal Hari Ini)`,
          },

          quantity: 1,

          selectedToppings: [
            {
              id: 'free-extra-choco',
              name:
                'Free Extra Molten Choco Dip (Bonus)',
              price: 0,
            },
          ],

          notes:
            'Promo Menu Hari Ini + Free Choco Dip',
        },
      ];
    });

    showToast(
      `🔥 1x ${product.name} Flash Deal (Rp ${safePrice.toLocaleString(
        'id-ID'
      )}) masuk ke keranjang!`
    );
  };

  // ============================================================
  // UPDATE CUSTOMER CART QUANTITY
  // ============================================================

  const handleUpdateQuantity = (
    itemId: string,
    newQty: number
  ) => {
    const safeQuantity =
      Math.floor(
        Number(newQty) || 0
      );

    if (safeQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity:
                safeQuantity,
            }
          : item
      )
    );
  };

  // ============================================================
  // REMOVE CUSTOMER CART ITEM
  // ============================================================

  const handleRemoveItem = (
    itemId: string
  ) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          item.id !== itemId
      )
    );
  };

  // ============================================================
  // CLEAR CUSTOMER CART
  // ============================================================

  const handleClearCart = () => {
    setCartItems([]);
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const scrollToMenu = () => {
    const menuEl =
      document.getElementById(
        'menu-hari-ini'
      ) ||
      document.getElementById(
        'menu-varian'
      );

    menuEl?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const scrollToMarketingKit = () => {
    const kitEl =
      document.getElementById(
        'marketing-kit'
      );

    kitEl?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const scrollToLoyalty = () => {
    const loyaltyEl =
      document.getElementById(
        'loyalty-rewards'
      );

    loyaltyEl?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FAF7F2] text-[#2C241E]">

      {/* ======================================================
          TOP BANNER
          ====================================================== */}

      <PromoBanner
        onApplyCode={() => {
          showToast(
            'Kode voucher LUMER20 siap dipakai saat checkout!'
          );
        }}
      />

      {/* ======================================================
          CUSTOMER NAVBAR
          ====================================================== */}

      <Navbar
        cartCount={totalCartCount}
        loyaltyPoints={loyalty.points}
        onOpenCart={() =>
          setIsCartOpen(true)
        }
        onOpenMarketingKit={
          scrollToMarketingKit
        }
        onScrollToLoyalty={
          scrollToLoyalty
        }
        onOpenVoiceAssistant={() =>
          setIsVoiceModalOpen(true)
        }
      />

      {/* ======================================================
          MAIN CUSTOMER CONTENT
          ====================================================== */}

      <main className="flex-1 w-full min-w-0 overflow-x-hidden">

        {/* HERO */}

        <section className="w-full">
          <HeroSection
            onExploreMenu={scrollToMenu}
            onOpenQuickOrder={() =>
              setIsCartOpen(true)
            }
          />
        </section>

        {/* DAILY SPECIAL */}

        <section className="w-full">
          <DailySpecialSection
            onAddSpecialToCart={
              handleAddDailySpecialToCart
            }
            onOpenProductModal={(product) =>
              setSelectedProduct(product)
            }
          />
        </section>

        {/* PRODUCT MENU */}

        <section className="w-full">
          <ProductMenu
            onSelectProduct={(product) =>
              setSelectedProduct(product)
            }
            onQuickAdd={handleQuickAdd}
          />
        </section>

        {/* BUNDLES */}

        <section className="w-full">
          <BundleSection
            onAddBundle={handleAddBundle}
          />
        </section>

        {/* LOYALTY */}

        <section className="w-full">
          <LoyaltyRewards
            loyalty={loyalty}
            onClaimFreeBox={
              handleClaimFreeBox
            }
          />
        </section>

        {/* QUALITY */}

        <section className="w-full">
          <QualityPillars />
        </section>

        {/* PROMO / MARKETING */}

        <section
          id="marketing-kit"
          className="w-full"
        >
          <DigitalMarketingKit />
        </section>

        {/* TESTIMONIAL */}

        <section className="w-full">
          <TestimonialSection />
        </section>

      </main>

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <Footer />

      {/* ======================================================
          PRODUCT MODAL
          ====================================================== */}

      <ProductModal
        product={selectedProduct}
        onClose={() =>
          setSelectedProduct(null)
        }
        onAddToCart={
          handleAddToCartFromModal
        }
      />

      {/* ======================================================
          VOICE AI CUSTOMER
          ====================================================== */}

      <div className="relative z-[70]">
        <VoiceAssistantModal
          isOpen={isVoiceModalOpen}

          onClose={() =>
            setIsVoiceModalOpen(false)
          }

          onQuickAddProduct={
            handleVoiceAddToCart
          }

          onQuickRemoveProduct={
            handleVoiceRemoveFromCart
          }

          onQuickAddBundle={
            handleVoiceAddBundle
          }

          onQuickRemoveBundle={
            handleVoiceRemoveBundle
          }
        />
      </div>

      {/* ======================================================
          CUSTOMER CART
          ====================================================== */}

      <CartDrawer
        isOpen={isCartOpen}

        onClose={() =>
          setIsCartOpen(false)
        }

        cartItems={cartItems}

        onUpdateQuantity={
          handleUpdateQuantity
        }

        onRemoveItem={
          handleRemoveItem
        }

        onClearCart={
          handleClearCart
        }

        loyaltyPoints={
          loyalty.points
        }

        onOrderSuccessEarnPoints={
          handleEarnPoints
        }

        onOpenLoyaltySection={
          scrollToLoyalty
        }

        activeOrder={
          activeOrder
        }

        onSetActiveOrder={
          setActiveOrder
        }

        onOpenPaymentModal={() =>
          setIsPaymentModalOpen(true)
        }
      />

      {/* ======================================================
          ONLINE PAYMENT
          ====================================================== */}

      {activeOrder && (
        <OnlinePaymentModal
          isOpen={
            isPaymentModalOpen
          }

          onClose={() =>
            setIsPaymentModalOpen(
              false
            )
          }

          order={activeOrder}

          onPaymentSuccess={
            handlePaymentSuccess
          }
        />
      )}

      {/* ======================================================
          FLOATING VOICE AI BUTTON
          ====================================================== */}

      <button
        type="button"
        onClick={() =>
          setIsVoiceModalOpen(true)
        }
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 lg:right-8 xl:right-10 z-40 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl border-2 border-amber-300 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        title="Bicara dengan Asisten Suara Pisang Melt"
        aria-label="Buka Asisten Suara Pisang Melt"
      >
        <div className="w-7 h-7 rounded-xl bg-stone-950 text-amber-300 flex items-center justify-center shrink-0">
          <Mic
            className="w-4 h-4 animate-pulse"
            aria-hidden="true"
          />
        </div>

        <div className="text-left text-xs leading-tight hidden sm:block">
          <div className="font-extrabold flex items-center gap-1">
            <span>
              Tanya Suara AI
            </span>

            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <span className="text-[10px] font-medium text-stone-900 opacity-90">
            gemini-3.8-live
          </span>
        </div>
      </button>

      {/* ======================================================
          ACTIVE CUSTOMER ORDER
          ====================================================== */}

      {activeOrder && (
        <button
          type="button"
          onClick={() =>
            setIsCartOpen(true)
          }
          className="fixed bottom-36 sm:bottom-24 right-4 sm:right-6 lg:right-8 xl:right-10 z-40 bg-[#241305] text-white py-2.5 px-4 rounded-2xl shadow-2xl border border-amber-800/80 flex items-center gap-3 hover:scale-[1.02] transition-all cursor-pointer backdrop-blur-md max-w-[calc(100vw-2rem)]"
          title="Buka status pesanan aktif"
          aria-label={`Buka status pesanan ${activeOrder.orderId}`}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            {activeOrder.status ===
            'ready' ? (
              <Bike
                className="w-4 h-4 text-emerald-400 animate-bounce"
                aria-hidden="true"
              />
            ) : activeOrder.status ===
              'cooking' ? (
              <Flame
                className="w-4 h-4 text-amber-400 animate-pulse"
                aria-hidden="true"
              />
            ) : (
              <Clock
                className="w-4 h-4 text-amber-300"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="text-left text-xs min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-amber-300 font-mono shrink-0">
                #{activeOrder.orderId}
              </span>

              <span className="text-[11px] font-semibold text-white truncate">
                {activeOrder.status ===
                  'received' &&
                  'Pesanan Diterima'}

                {activeOrder.status ===
                  'cooking' &&
                  'Sedang Dimasak'}

                {activeOrder.status ===
                  'ready' &&
                  'Siap Diantar'}
              </span>
            </div>

            <span className="text-[10px] text-stone-400">
              Pantau proses pesanan
            </span>
          </div>
        </button>
      )}

      {/* ======================================================
          TOAST
          ====================================================== */}

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 sm:top-22 lg:top-24 right-4 sm:right-6 lg:right-8 xl:right-10 z-[100] max-w-[calc(100vw-2rem)] bg-[#3A1E08] text-white px-4 py-3 rounded-2xl shadow-xl border border-amber-900/50 flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200"
        >
          <CheckCircle
            className="w-4 h-4 text-emerald-400 shrink-0"
            aria-hidden="true"
          />

          <span className="text-xs font-semibold">
            {toastMessage}
          </span>
        </div>
      )}

      {/* ======================================================
          MOBILE STICKY ACTION BAR
          ====================================================== */}

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 flex items-center gap-2 shadow-lg">

        {/* Voice AI */}

        <button
          type="button"
          onClick={() =>
            setIsVoiceModalOpen(true)
          }
          className="p-2.5 rounded-xl bg-amber-300 text-stone-900 font-bold text-xs flex items-center gap-1 shrink-0"
          title="Voice AI"
          aria-label="Buka Voice AI"
        >
          <Mic
            className="w-4 h-4 text-stone-950"
            aria-hidden="true"
          />

          <span>
            Suara
          </span>
        </button>

        {/* Cart */}

        <button
          type="button"
          onClick={() =>
            setIsCartOpen(true)
          }
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-white bg-[#3A1E08] rounded-xl active:scale-95"
          aria-label={`Buka pesanan, ${totalCartCount} item`}
        >
          <ShoppingBag
            className="w-4 h-4"
            aria-hidden="true"
          />

          <span>
            Pesanan ({totalCartCount})
          </span>
        </button>

        {/* WhatsApp */}

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center"
          aria-label="Hubungi Pisang Melt melalui WhatsApp"
          title="WhatsApp Pisang Melt"
        >
          <MessageCircle
            className="w-4 h-4"
            aria-hidden="true"
          />
        </a>

      </div>

    </div>
  );
}