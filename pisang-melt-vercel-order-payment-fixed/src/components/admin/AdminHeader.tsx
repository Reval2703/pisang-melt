
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Sparkles,
  User,
  ShoppingBag,
  CreditCard,
  Package,
  CheckCheck,
  RefreshCw,
  X,
} from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
  onLogout?: () => void;
}

type NotificationType = 'order' | 'payment' | 'stock';

interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
}

interface StockItem {
  id: string | number;
  name: string;
  category?: string;
  unit?: string;
  stock: number;
  minimumStock: number;
  active?: boolean;
}

const READ_STORAGE_KEY = 'pisang_melt_read_notifications';
const STOCK_STORAGE_KEY = 'pisang_melt_stocks';
const REFRESH_INTERVAL = 10000;

const formatTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatus = (value: unknown) =>
  String(value ?? '').trim().toLowerCase();

const getOrderId = (order: any, index: number) =>
  String(
    order?.id ??
      order?.orderId ??
      order?.order_id ??
      `order-${index}`
  );

const getOrderStatus = (order: any) =>
  getStatus(
    order?.status ??
      order?.orderStatus ??
      order?.order_status
  );

const getPaymentStatus = (order: any) =>
  getStatus(
    order?.paymentStatus ??
      order?.payment_status ??
      order?.payment?.status
  );

const getPaymentMethod = (order: any) =>
  getStatus(
    order?.paymentMethod ??
      order?.payment_method ??
      order?.payment?.method
  );

const isOnlinePayment = (method: string) => {
  if (!method) return false;

  return [
    'online',
    'transfer',
    'bank_transfer',
    'bank transfer',
    'qris',
    'ewallet',
    'e-wallet',
    'virtual_account',
    'virtual account',
    'payment_gateway',
  ].some((keyword) => method.includes(keyword));
};

const isPaymentPending = (status: string) => {
  if (!status) return false;

  return [
    'pending',
    'menunggu',
    'unpaid',
    'belum dibayar',
    'waiting',
    'waiting for payment',
  ].some((keyword) => status.includes(keyword));
};

const readStoredStocks = (): StockItem[] => {
  try {
    const raw = localStorage.getItem(STOCK_STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item: any) =>
      item &&
      item.id !== undefined &&
      item.id !== null &&
      item.name !== undefined
    ) as StockItem[];
  } catch (error) {
    console.error('Gagal membaca inventaris:', error);
    return [];
  }
};

const readNotifications = (): string[] => {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  description,
  onMenuClick,
  onLogout,
}) => {
  const [notifications, setNotifications] = useState<
    AdminNotification[]
  >([]);

  const [readIds, setReadIds] = useState<string[]>(() =>
    readNotifications()
  );

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [adminName, setAdminName] =
    useState('Muhammad Reval Prasetya');

  const [adminRole, setAdminRole] = useState('Super Admin');

  // State untuk edit profil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    (notification) => !readIds.includes(notification.id)
  ).length;

  // Memuat profil admin dari server
  const loadAdminProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) return;

      const data = await response.json();

      const profile =
        data?.user ??
        data?.admin ??
        data?.data ??
        data;

      const name =
        profile?.displayName ??
        profile?.name ??
        profile?.nama ??
        profile?.username ??
        profile?.fullName;

      const role =
        profile?.role ??
        profile?.jabatan ??
        profile?.level;

      if (name) setAdminName(String(name));

      // Pertahankan role jika server tidak mengirimkannya.
      if (role) setAdminRole(String(role));
    } catch (error) {
      console.error('Gagal memuat profil admin:', error);
    }
  }, []);

  // Membuka form edit profil
  const openProfileEditor = () => {
    setEditedName(adminName);
    setProfileOpen(false);
    setShowProfileModal(true);
  };

  // Menyimpan nama profil ke database melalui API
  const saveProfile = async () => {
    const displayName = editedName.trim();

    if (!displayName) {
      alert('Nama profil tidak boleh kosong.');
      return;
    }

    if (displayName.length > 100) {
      alert('Nama profil maksimal 100 karakter.');
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || 'Gagal memperbarui profil.'
        );
      }

      setAdminName(String(data.displayName || displayName));
      setShowProfileModal(false);

      alert('Nama profil berhasil diperbarui.');
    } catch (error) {
      console.error('Gagal menyimpan profil:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan profil.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Memuat notifikasi pesanan, pembayaran, dan stok
  const loadNotifications = useCallback(async () => {
    setLoadingNotifications(true);

    const nextNotifications: AdminNotification[] = [];

    try {
      try {
        const response = await fetch('/api/orders', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();

          const orders: any[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.orders)
              ? data.orders
              : Array.isArray(data?.data)
                ? data.data
                : [];

          orders.forEach((order, index) => {
            const status = getOrderStatus(order);

            if (
              ![
                'baru',
                'new',
                'pending',
                'menunggu',
                'pesanan baru',
              ].includes(status)
            ) {
              return;
            }

            const orderId = getOrderId(order, index);

            const customerName =
              order?.customerName ??
              order?.customer_name ??
              order?.nama ??
              order?.name ??
              'Pelanggan';

            nextNotifications.push({
              id: `order-${orderId}`,
              type: 'order',
              title: 'Pesanan baru',
              message: `Pesanan dari ${customerName} perlu diproses.`,
              createdAt: new Date(
                order?.createdAt ??
                  order?.created_at ??
                  Date.now()
              ).toISOString(),
            });
          });

          orders.forEach((order, index) => {
            const method = getPaymentMethod(order);
            const paymentStatus = getPaymentStatus(order);

            if (
              !isOnlinePayment(method) ||
              !isPaymentPending(paymentStatus)
            ) {
              return;
            }

            const orderId = getOrderId(order, index);

            nextNotifications.push({
              id: `payment-${orderId}`,
              type: 'payment',
              title: 'Pembayaran menunggu',
              message: `Pembayaran pesanan ${orderId} belum dikonfirmasi.`,
              createdAt: new Date(
                order?.createdAt ??
                  order?.created_at ??
                  Date.now()
              ).toISOString(),
            });
          });
        }
      } catch (error) {
        console.error(
          'Gagal memuat notifikasi pesanan:',
          error
        );
      }

      const stockItems = readStoredStocks();

      stockItems.forEach((item) => {
        const itemId = String(item.id ?? '').trim();
        const itemName = String(
          item.name ?? 'Barang tanpa nama'
        ).trim();

        const stock = Number(item.stock);
        const minimumStock = Number(item.minimumStock);

        if (
          !itemId ||
          !Number.isFinite(stock) ||
          !Number.isFinite(minimumStock) ||
          stock < 0 ||
          minimumStock < 0
        ) {
          return;
        }

        if (
          item.active === false ||
          String(item.active).toLowerCase() === 'false' ||
          String(item.active) === '0'
        ) {
          return;
        }

        if (stock > minimumStock) return;

        const unit = String(item.unit ?? 'unit');
        const isEmpty = stock <= 0;

        nextNotifications.push({
          id: `stock-${itemId}`,
          type: 'stock',
          title: isEmpty ? 'Stok habis' : 'Stok menipis',
          message: isEmpty
            ? `${itemName} sudah habis. Batas minimum: ${minimumStock} ${unit}.`
            : `${itemName} tersisa ${stock} ${unit}. Batas minimum: ${minimumStock} ${unit}.`,
          createdAt: new Date().toISOString(),
        });
      });

      const uniqueNotifications = Array.from(
        new Map(
          nextNotifications.map((notification) => [
            notification.id,
            notification,
          ])
        ).values()
      );

      uniqueNotifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setNotifications(uniqueNotifications);
    } catch (error) {
      console.error(
        'Gagal memuat notifikasi admin:',
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Memuat profil dan notifikasi secara berkala
  useEffect(() => {
    void loadAdminProfile();
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
      void loadAdminProfile();
    }, REFRESH_INTERVAL);

    const handleStorageChange = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === STOCK_STORAGE_KEY ||
        event.key === READ_STORAGE_KEY
      ) {
        setReadIds(readNotifications());
        void loadNotifications();
      }
    };

    const handleStocksUpdated = () => {
      void loadNotifications();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setReadIds(readNotifications());
        void loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(
      'pisang-melt-stocks-updated',
      handleStocksUpdated
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(interval);

      window.removeEventListener(
        'storage',
        handleStorageChange
      );

      window.removeEventListener(
        'pisang-melt-stocks-updated',
        handleStocksUpdated
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [loadAdminProfile, loadNotifications]);

  // Menutup dropdown saat klik di luar
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  // Tandai notifikasi sudah dibaca
  const markAsRead = useCallback((id: string) => {
    setReadIds((previous) => {
      const updated = previous.includes(id)
        ? previous
        : [...previous, id];

      try {
        localStorage.setItem(
          READ_STORAGE_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error(
          'Gagal menyimpan status notifikasi:',
          error
        );
      }

      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(
      (notification) => notification.id
    );

    setReadIds((previous) => {
      const updated = Array.from(
        new Set([...previous, ...allIds])
      );

      try {
        localStorage.setItem(
          READ_STORAGE_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error(
          'Gagal menyimpan status notifikasi:',
          error
        );
      }

      return updated;
    });
  }, [notifications]);


const handleLogout = async () => {
  setProfileOpen(false);

  try {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Gagal logout.');
    }

    if (onLogout) {
      onLogout();
      return;
    }

    window.location.replace('/admin/login');
  } catch (error) {
    console.error('Gagal logout:', error);

    alert(
      'Logout gagal. Silakan periksa terminal server.'
    );
  }
};



  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} />;
      case 'payment':
        return <CreditCard size={18} />;
      case 'stock':
        return <Package size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 text-blue-600';
      case 'payment':
        return 'bg-amber-50 text-amber-600';
      case 'stock':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const filteredNotifications = notifications.filter(
    (notification) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();

      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-amber-100 bg-[#fffdf9]/95 backdrop-blur-md">
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* KIRI: MENU DAN JUDUL */}
          <div className="flex min-w-0 items-center gap-3">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                aria-label="Buka menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#654321] transition hover:bg-amber-50 lg:hidden"
              >
                <Menu size={22} />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold text-[#4b2e1f] sm:text-xl">
                  {title}
                </h1>

                <span className="hidden items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 sm:inline-flex">
                  <Sparkles size={11} />
                  Admin
                </span>
              </div>

              {description && (
                <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* KANAN: SEARCH, NOTIFIKASI, PROFIL */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* SEARCH */}
            <div className="relative">
              {searchOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(80vw,280px)] rounded-xl border border-amber-100 bg-white p-3 shadow-xl">
                  <label
                    htmlFor="admin-notification-search"
                    className="mb-2 block text-xs font-semibold text-gray-600"
                  >
                    Cari notifikasi
                  </label>

                  <input
                    id="admin-notification-search"
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Cari pesanan atau stok..."
                    autoFocus
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              )}

              <button
                type="button"
                aria-label="Cari notifikasi"
                onClick={() => setSearchOpen((open) => !open)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  searchOpen
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-500 hover:bg-amber-50 hover:text-[#654321]'
                }`}
              >
                {searchOpen ? <X size={19} /> : <Search size={19} />}
              </button>
            </div>

            {/* NOTIFIKASI */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                aria-label={`Notifikasi, ${unreadCount} belum dibaca`}
                aria-expanded={notificationOpen}
                onClick={() => {
                  setNotificationOpen((open) => !open);
                  setProfileOpen(false);
                  setSearchOpen(false);
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-amber-50 hover:text-[#654321]"
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#fffdf9] bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#4b2e1f]">
                        Notifikasi
                      </h2>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        {unreadCount} belum dibaca
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Muat ulang notifikasi"
                        onClick={() => void loadNotifications()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#654321]"
                      >
                        <RefreshCw
                          size={15}
                          className={loadingNotifications ? 'animate-spin' : ''}
                        />
                      </button>

                      <button
                        type="button"
                        title="Tandai semua sudah dibaca"
                        onClick={markAllAsRead}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#654321]"
                      >
                        <CheckCheck size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                          <Bell size={22} />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          Tidak ada notifikasi
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                          {searchQuery
                            ? 'Tidak ditemukan notifikasi yang sesuai.'
                            : 'Notifikasi pesanan, pembayaran, dan stok akan muncul di sini.'}
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map((notification) => {
                        const isRead = readIds.includes(notification.id);

                        return (
                          <button
                            type="button"
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`flex w-full gap-3 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-amber-50/70 ${
                              isRead ? 'bg-white' : 'bg-amber-50/40'
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getNotificationColor(
                                notification.type
                              )}`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-[#4b2e1f]">
                                  {notification.title}
                                </p>
                                {!isRead && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                )}
                              </div>

                              <p className="mt-1 break-words text-xs leading-relaxed text-gray-600">
                                {notification.message}
                              </p>

                              <p className="mt-1.5 text-[10px] text-gray-400">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-gray-100 bg-[#fffdf9] px-4 py-2">
                    <p className="text-center text-[10px] text-gray-400">
                      Diperbarui otomatis setiap 10 detik
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PROFIL ADMIN */}
            <div
              className="relative border-l border-amber-100 pl-2 sm:pl-3"
              ref={profileRef}
            >
              <button
                type="button"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotificationOpen(false);
                  setSearchOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition hover:bg-amber-50 sm:px-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-700 text-white shadow-sm">
                  <User size={18} />
                </div>

                <div className="hidden max-w-[130px] text-left sm:block">
                  <p className="truncate text-xs font-bold text-[#4b2e1f]">
                    {adminName}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-gray-500">
                    {adminRole}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className="hidden text-gray-400 sm:block"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-amber-100 bg-white shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-[#4b2e1f]">
                      {adminName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {adminRole}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openProfileEditor}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-medium text-gray-600 transition hover:bg-amber-50 hover:text-[#654321]"
                  >
                    <User size={16} />
                    Perbarui profil
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MODAL EDIT PROFIL */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingProfile) {
              setShowProfileModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-profile-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="admin-profile-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Perbarui Profil
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ubah nama yang ditampilkan pada profil admin.
                </p>
              </div>

              <button
                type="button"
                aria-label="Tutup form"
                disabled={savingProfile}
                onClick={() => setShowProfileModal(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveProfile();
              }}
            >
              <label
                htmlFor="admin-display-name"
                className="mt-5 block text-sm font-medium text-gray-700"
              >
                Nama Profil
              </label>

              <input
                id="admin-display-name"
                type="text"
                value={editedName}
                onChange={(event) => setEditedName(event.target.value)}
                maxLength={100}
                required
                autoFocus
                placeholder="Masukkan nama profil"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />

              <p className="mt-2 text-xs text-gray-400">
                Maksimal 100 karakter. Perubahan tidak mengubah username login.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  disabled={savingProfile}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={savingProfile || !editedName.trim()}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;
