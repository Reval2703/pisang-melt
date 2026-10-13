import React, {
  useEffect,
  useState,
} from 'react';
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProducts from '../components/admin/AdminProducts';
import AdminBundles from '../components/admin/AdminBundles';
import AdminStocks from '../components/admin/AdminStocks';
import AdminOrders from '../components/admin/AdminOrders';
import AdminReports from '../components/admin/AdminReports';

const AdminRoutes: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch(
          '/api/admin/me',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();

        setIsAuthenticated(
          data?.authenticated === true
        );
      } catch (error) {
        console.error(
          'Admin session check error:',
          error
        );

        setIsAuthenticated(false);
      }
    };

    checkAdminSession();
  }, []);

  const navigate = (page: string) => {
    const routes: Record<string, string> = {
      dashboard: '/admin/dashboard',
      products: '/admin/products',
      bundles: '/admin/bundles',
      stocks: '/admin/stocks',
      orders: '/admin/orders',
      reports: '/admin/reports',
    };

    const destination = routes[page];

    if (destination) {
      window.location.href = destination;
    }
  };

  const logout = async () => {
    try {
      await fetch(
        '/api/admin/logout',
        {
          method: 'POST',
          credentials: 'include',
        }
      );
    } catch (error) {
      console.error(
        'Admin logout error:',
        error
      );
    } finally {
      setIsAuthenticated(false);
      window.location.href =
        '/admin/login';
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);

    window.location.href =
      '/admin/dashboard';
  };

  const handleBackToCustomer = () => {
    window.location.href = '/';
  };

  /*
   * Saat session sedang diperiksa,
   * jangan langsung redirect.
   */
  if (isAuthenticated === null) {
    return (
      <div
        className="
          min-h-screen
          bg-[#F8F4EE]
          flex
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-stone-200
              border-t-[#3A1E08]
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-semibold
              text-stone-500
            "
          >
            Memeriksa sesi Admin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>

      {/* ==================================================
          LOGIN
          ================================================== */}

      <Route
        path="login"
        element={
          isAuthenticated ? (
            <Navigate
              to="/admin/dashboard"
              replace
            />
          ) : (
            <AdminLogin
              onLogin={handleLogin}
              onBackToCustomer={
                handleBackToCustomer
              }
            />
          )
        }
      />

      {/* ==================================================
          DASHBOARD
          ================================================== */}

      <Route
        path="dashboard"
        element={
          isAuthenticated ? (
            <AdminDashboard
              onNavigate={navigate}
              onLogout={logout}
            />
          ) : (
            <Navigate
              to="/admin/login"
              replace
            />
          )
        }
      />

      {/* ==================================================
          PRODUCTS
          ================================================== */}

      <Route
        path="products"
        element={
          isAuthenticated ? (
            <AdminProducts
              onNavigate={navigate}
              onLogout={logout}
            />
          ) : (
            <Navigate
              to="/admin/login"
              replace
            />
          )
        }
      />

      {/* ==================================================
          BUNDLES
          ================================================== */}

      <Route
        path="bundles"
        element={
          isAuthenticated ? (
            <AdminBundles
              onNavigate={navigate}
              onLogout={logout}
            />
          ) : (
            <Navigate
              to="/admin/login"
              replace
            />
          )
        }
      />

      {/* ==================================================
          STOCKS
          ================================================== */}

      <Route
        path="stocks"
        element={
          isAuthenticated ? (
            <AdminStocks
              onNavigate={navigate}
              onLogout={logout}
            />
          ) : (
            <Navigate
              to="/admin/login"
              replace
            />
          )
        }
      />

      {/* ==================================================
          ORDERS
          ================================================== */}

      <Route
        path="orders"
        element={
          isAuthenticated ? (
            <AdminOrders
              onNavigate={navigate}
              onLogout={logout}
            />
          ) : (
            <Navigate
              to="/admin/login"
              replace
            />
          )
        }
      />

      {/* ==================================================
          REPORTS
          ================================================== */}

      <Route
        path="reports"
        element={
          isAuthenticated ? (
            <AdminReports
              onNavigate={navigate}
              onLogout={logout}
            />
          ) : (
            <Navigate
              to="/admin/login"
              replace
            />
          )
        }
      />

      {/* ==================================================
          /admin
          ================================================== */}

      <Route
        path=""
        element={
          <Navigate
            to={
              isAuthenticated
                ? '/admin/dashboard'
                : '/admin/login'
            }
            replace
          />
        }
      />

      {/* ==================================================
          URL LAIN
          ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? '/admin/dashboard'
                : '/admin/login'
            }
            replace
          />
        }
      />

    </Routes>
  );
};

export default AdminRoutes;