import React, { FormEvent, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBackToCustomer: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({
  onLogin,
  onBackToCustomer,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState('');
  const [isLoading, setIsLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage(
        'Silakan isi email dan password terlebih dahulu.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        '/api/admin/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: cleanEmail,
            password,
          }),
        }
      );

      const responseText = await response.text();

let data: any = {};

try {
  data = responseText ? JSON.parse(responseText) : {};
} catch {
  throw new Error(
    `Server tidak mengembalikan JSON yang valid. Status: ${response.status}.`
  );
}

if (!response.ok) {
  throw new Error(
    data?.error ||
      `Login gagal. Status: ${response.status}.`
  );
}
    } catch (error) {
      console.error(
        'Admin login error:',
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat login Admin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#F8F4EE]
        text-[#2C241E]
        relative
        overflow-hidden
      "
    >
      {/* ======================================================
          BACKGROUND
          ====================================================== */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          overflow-hidden
        "
        aria-hidden="true"
      >
        <div
          className="
            absolute
            -top-40
            -right-40
            w-[32rem]
            h-[32rem]
            rounded-full
            bg-amber-200/25
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-48
            -left-40
            w-[34rem]
            h-[34rem]
            rounded-full
            bg-orange-200/20
            blur-3xl
          "
        />
      </div>

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main
        className="
          relative
          z-10
          min-h-screen
          flex
          items-center
          justify-center
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            w-full
            max-w-6xl
            grid
            grid-cols-1
            lg:grid-cols-[1.05fr_0.95fr]
            bg-white
            rounded-[2rem]
            border
            border-stone-200/80
            shadow-[0_30px_80px_rgba(58,30,8,0.12)]
            overflow-hidden
          "
        >
          {/* ==================================================
              LEFT BRANDING
              ================================================== */}

          <section
            className="
              relative
              hidden
              lg:flex
              flex-col
              justify-between
              min-h-[650px]
              p-12
              xl:p-14
              bg-[#3A1E08]
              text-white
              overflow-hidden
            "
          >
            {/* Decorative Pattern */}

            <div
              className="
                absolute
                inset-0
                opacity-[0.04]
              "
              aria-hidden="true"
            >
              <div
                className="
                  absolute
                  -top-32
                  -right-32
                  w-[30rem]
                  h-[30rem]
                  rounded-full
                  border-[70px]
                  border-amber-300
                "
              />

              <div
                className="
                  absolute
                  -bottom-40
                  -left-40
                  w-[32rem]
                  h-[32rem]
                  rounded-full
                  border-[80px]
                  border-amber-300
                "
              />
            </div>

            {/* Warm Glow */}

            <div
              className="
                absolute
                top-1/2
                right-0
                -translate-y-1/2
                w-72
                h-72
                bg-amber-500/10
                blur-3xl
                rounded-full
              "
              aria-hidden="true"
            />

            {/* Brand */}

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-amber-500
                    text-[#3A1E08]
                    flex
                    items-center
                    justify-center
                    shadow-lg
                  "
                >
                  <Sparkles
                    className="w-6 h-6"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <div
                    className="
                      text-xl
                      font-extrabold
                      font-display
                      tracking-tight
                    "
                  >
                    PISANG MELT
                  </div>

                  <div
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.22em]
                      text-amber-200/80
                      font-semibold
                    "
                  >
                    Crispy & Nugget Lumer
                  </div>
                </div>
              </div>
            </div>

            {/* Main Branding */}

            <div
              className="
                relative
                z-10
                max-w-lg
              "
            >
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  mb-5
                  px-3
                  py-1.5
                  rounded-full
                  border
                  border-amber-400/20
                  bg-amber-400/10
                  text-amber-200
                  text-xs
                  font-semibold
                "
              >
                <ShieldCheck
                  className="w-4 h-4"
                  aria-hidden="true"
                />

                <span>
                  Secure Admin Area
                </span>
              </div>

              <h1
                className="
                  text-5xl
                  xl:text-6xl
                  font-extrabold
                  font-display
                  leading-[1.02]
                  tracking-tight
                "
              >
                Kelola bisnis
                <span className="block text-amber-400">
                  dengan lebih mudah.
                </span>
              </h1>

              <p
                className="
                  mt-6
                  max-w-md
                  text-sm
                  xl:text-base
                  leading-relaxed
                  text-stone-300
                "
              >
                Satu tempat untuk mengelola produk,
                stok, pesanan, promo, dan laporan
                penjualan Pisang Melt.
              </p>
            </div>

            {/* Bottom */}

            <div
              className="
                relative
                z-10
                flex
                items-center
                justify-between
                gap-4
                pt-6
                border-t
                border-white/10
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    text-white/80
                  "
                >
                  Admin Dashboard
                </p>

                <p
                  className="
                    text-[11px]
                    text-white/40
                    mt-1
                  "
                >
                  Sistem internal Pisang Melt
                </p>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  text-amber-200/70
                "
              >
                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-amber-400
                  "
                />

                <span>
                  Protected
                </span>
              </div>
            </div>
          </section>

          {/* ==================================================
              RIGHT LOGIN
              ================================================== */}

          <section
            className="
              flex
              flex-col
              justify-center
              min-h-[650px]
              p-6
              sm:p-10
              lg:p-12
              xl:p-16
            "
          >
            {/* Mobile Branding */}

            <div
              className="
                flex
                lg:hidden
                items-center
                gap-3
                mb-10
              "
            >
              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-[#3A1E08]
                  text-amber-400
                  flex
                  items-center
                  justify-center
                "
              >
                <Sparkles
                  className="w-5 h-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <div
                  className="
                    text-lg
                    font-extrabold
                    font-display
                    text-[#3A1E08]
                  "
                >
                  PISANG MELT
                </div>

                <div
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.18em]
                    text-stone-400
                    font-semibold
                  "
                >
                  Admin Dashboard
                </div>
              </div>
            </div>

            {/* Login Header */}

            <div className="mb-8">
              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-amber-100
                  text-[#3A1E08]
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >
                <LockKeyhole
                  className="w-6 h-6"
                  aria-hidden="true"
                />
              </div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-amber-700
                  mb-2
                "
              >
                Admin Access
              </p>

              <h2
                className="
                  text-3xl
                  sm:text-4xl
                  font-extrabold
                  font-display
                  tracking-tight
                  text-[#241305]
                "
              >
                Selamat datang kembali.
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-relaxed
                  text-stone-500
                  max-w-md
                "
              >
                Silakan masuk menggunakan akun
                administrator untuk melanjutkan.
              </p>
            </div>

            {/* ==================================================
                LOGIN FORM
                ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}

              <div>
                <label
                  htmlFor="admin-email"
                  className="
                    block
                    mb-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-stone-600
                  "
                >
                  Email
                </label>

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="admin@pisangmelt.com"
                  autoComplete="username"
                  className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-stone-200
                    bg-[#FCFAF7]
                    text-sm
                    text-stone-800
                    outline-none
                    placeholder:text-stone-400
                    transition-all
                    focus:bg-white
                    focus:border-amber-500
                    focus:ring-4
                    focus:ring-amber-500/10
                  "
                />
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="admin-password"
                  className="
                    block
                    mb-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-stone-600
                  "
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="admin-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="
                      w-full
                      h-12
                      px-4
                      pr-12
                      rounded-xl
                      border
                      border-stone-200
                      bg-[#FCFAF7]
                      text-sm
                      text-stone-800
                      outline-none
                      placeholder:text-stone-400
                      transition-all
                      focus:bg-white
                      focus:border-amber-500
                      focus:ring-4
                      focus:ring-amber-500/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                    className="
                      absolute
                      right-2
                      top-1/2
                      -translate-y-1/2
                      w-9
                      h-9
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      text-stone-400
                      hover:text-[#3A1E08]
                      hover:bg-stone-100
                      transition-colors
                      cursor-pointer
                    "
                  >
                    {showPassword ? (
                      <EyeOff
                        className="w-5 h-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="w-5 h-5"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}

              {errorMessage && (
                <div
                  role="alert"
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-xs
                    leading-relaxed
                    text-red-700
                  "
                >
                  <span>⚠️</span>

                  <span>
                    {errorMessage}
                  </span>
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full
                  h-12
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#3A1E08]
                  hover:bg-[#241305]
                  disabled:bg-stone-400
                  disabled:cursor-not-allowed
                  text-white
                  text-sm
                  font-bold
                  transition-all
                  shadow-lg
                  shadow-[#3A1E08]/10
                  hover:shadow-xl
                  hover:shadow-[#3A1E08]/15
                  active:scale-[0.99]
                  cursor-pointer
                "
              >
                <LogIn
                  className="w-4 h-4"
                  aria-hidden="true"
                />

                <span>
                  {isLoading
                    ? 'Memverifikasi...'
                    : 'Masuk ke Dashboard'}
                </span>
              </button>
            </form>

            {/* Back Customer */}

            <button
              type="button"
              onClick={onBackToCustomer}
              className="
                mt-6
                mx-auto
                inline-flex
                items-center
                gap-2
                text-xs
                font-semibold
                text-stone-400
                hover:text-[#3A1E08]
                transition-colors
                cursor-pointer
              "
            >
              <ArrowLeft
                className="w-4 h-4"
                aria-hidden="true"
              />

              <span>
                Kembali ke website customer
              </span>
            </button>

            {/* Footer */}

            <div
              className="
                mt-8
                pt-5
                border-t
                border-stone-100
                text-center
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-stone-300
                "
              >
                Pisang Melt • Admin Panel
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;