import React from 'react';
import {
  BarChart3,
  Box,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Ringkasan bisnis',
    icon: LayoutDashboard,
  },
  {
    id: 'products',
    label: 'Produk',
    description: 'Kelola menu produk',
    icon: Package,
  },
  {
    id: 'bundles',
    label: 'Bundle',
    description: 'Kelola paket promo',
    icon: Box,
  },
  {
    id: 'stocks',
    label: 'Stok',
    description: 'Pantau persediaan',
    icon: ClipboardList,
  },
  {
    id: 'orders',
    label: 'Pesanan',
    description: 'Kelola pesanan masuk',
    icon: ShoppingBag,
  },
  {
    id: 'reports',
    label: 'Laporan',
    description: 'Laporan penjualan',
    icon: FileText,
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activePage,
  onNavigate,
  onLogout,
  isOpen = true,
  onClose,
}) => {
  const handleNavigate = (page: string) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-[#241305]/40
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-[280px]
          bg-[#3A1E08]
          text-white
          flex
          flex-col
          shadow-[12px_0_40px_rgba(58,30,8,0.12)]
          transition-transform
          duration-300
          ease-out
          lg:translate-x-0
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        {/* Decorative Background */}
        <div
          className="
            absolute
            inset-0
            overflow-hidden
            pointer-events-none
          "
          aria-hidden="true"
        >
          <div
            className="
              absolute
              -top-32
              -right-32
              w-80
              h-80
              rounded-full
              border-[55px]
              border-amber-400/[0.035]
            "
          />

          <div
            className="
              absolute
              -bottom-40
              -left-40
              w-96
              h-96
              rounded-full
              border-[70px]
              border-amber-400/[0.025]
            "
          />

          <div
            className="
              absolute
              top-[35%]
              -right-24
              w-48
              h-48
              rounded-full
              bg-amber-500/[0.06]
              blur-3xl
            "
          />
        </div>

        {/* Brand */}
        <div
          className="
            relative
            z-10
            h-[88px]
            px-6
            flex
            items-center
            justify-between
            border-b
            border-white/[0.08]
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-amber-500
                text-[#3A1E08]
                flex
                items-center
                justify-center
                shadow-lg
                shadow-black/10
              "
            >
              <Sparkles
                className="w-5 h-5"
                strokeWidth={2.4}
                aria-hidden="true"
              />
            </div>

            <div>
              <div
                className="
                  font-display
                  text-lg
                  font-extrabold
                  tracking-tight
                  leading-none
                "
              >
                PISANG MELT
              </div>

              <div
                className="
                  mt-1
                  text-[9px]
                  uppercase
                  tracking-[0.2em]
                  font-semibold
                  text-amber-200/60
                "
              >
                Admin Panel
              </div>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="
              lg:hidden
              w-9
              h-9
              rounded-xl
              flex
              items-center
              justify-center
              text-white/50
              hover:text-white
              hover:bg-white/[0.06]
              transition-colors
            "
          >
            <X
              className="w-5 h-5"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Admin Profile */}
        <div
          className="
            relative
            z-10
            mx-4
            mt-5
            p-3.5
            rounded-2xl
            bg-white/[0.055]
            border
            border-white/[0.07]
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-amber-500
                text-[#3A1E08]
                flex
                items-center
                justify-center
                font-display
                font-extrabold
                text-sm
              "
            >
              AD
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-sm
                  font-bold
                  text-white
                  truncate
                "
              >
                Administrator
              </p>

              <div
                className="
                  mt-0.5
                  flex
                  items-center
                  gap-1.5
                "
              >
                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-emerald-400
                  "
                />

                <span
                  className="
                    text-[10px]
                    text-white/40
                  "
                >
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="
            relative
            z-10
            flex-1
            px-4
            mt-7
            overflow-y-auto
          "
        >
          <p
            className="
              px-3
              mb-3
              text-[10px]
              uppercase
              tracking-[0.18em]
              font-bold
              text-white/30
            "
          >
            Menu Utama
          </p>

          <div className="space-y-1.5">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                activePage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleNavigate(item.id)
                  }
                  className={`
                    group
                    relative
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    text-left
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? 'bg-amber-500 text-[#3A1E08] shadow-lg shadow-black/10'
                        : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        -translate-y-1/2
                        w-1
                        h-7
                        rounded-r-full
                        bg-white/70
                      "
                    />
                  )}

                  <span
                    className={`
                      w-10
                      h-10
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      shrink-0
                      transition-colors
                      ${
                        isActive
                          ? 'bg-white/20'
                          : 'bg-white/[0.045] group-hover:bg-white/[0.08]'
                      }
                    `}
                  >
                    <Icon
                      className="w-[18px] h-[18px]"
                      strokeWidth={
                        isActive ? 2.5 : 2
                      }
                      aria-hidden="true"
                    />
                  </span>

                  <span className="min-w-0">
                    <span
                      className={`
                        block
                        text-sm
                        font-bold
                        ${
                          isActive
                            ? 'text-[#3A1E08]'
                            : 'text-white/85'
                        }
                      `}
                    >
                      {item.label}
                    </span>

                    <span
                      className={`
                        block
                        mt-0.5
                        text-[10px]
                        ${
                          isActive
                            ? 'text-[#3A1E08]/55'
                            : 'text-white/30'
                        }
                      `}
                    >
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Business Summary */}
          <div
            className="
              mt-7
              mx-1
              p-4
              rounded-2xl
              border
              border-amber-400/10
              bg-amber-400/[0.045]
            "
          >
            <div className="flex items-center gap-2">
              <BarChart3
                className="w-4 h-4 text-amber-400"
                aria-hidden="true"
              />

              <span
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  font-bold
                  text-amber-200/70
                "
              >
                Business Center
              </span>
            </div>

            <p
              className="
                mt-2
                text-[11px]
                leading-relaxed
                text-white/35
              "
            >
              Pantau operasional dan penjualan
              Pisang Melt dari satu dashboard.
            </p>
          </div>
        </nav>

        {/* Bottom */}
        <div
          className="
            relative
            z-10
            p-4
            border-t
            border-white/[0.08]
          "
        >
          <button
            type="button"
            onClick={onLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-3
              rounded-xl
              text-white/55
              hover:text-red-300
              hover:bg-red-500/[0.08]
              transition-all
              text-left
            "
          >
            <span
              className="
                w-10
                h-10
                rounded-xl
                bg-white/[0.045]
                flex
                items-center
                justify-center
              "
            >
              <LogOut
                className="w-[18px] h-[18px]"
                aria-hidden="true"
              />
            </span>

            <span>
              <span
                className="
                  block
                  text-sm
                  font-bold
                "
              >
                Keluar
              </span>

              <span
                className="
                  block
                  mt-0.5
                  text-[10px]
                  text-white/25
                "
              >
                Akhiri sesi admin
              </span>
            </span>
          </button>

          <div
            className="
              mt-3
              px-3
              text-[9px]
              text-white/20
            "
          >
            © {new Date().getFullYear()} Pisang Melt
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;