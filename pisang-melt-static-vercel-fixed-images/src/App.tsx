import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import CustomerApp from './CustomerApp';
import AdminRoutes from './routes/AdminRoutes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================= */}
        {/* ADMIN PANEL                */}
        {/* ========================= */}
        <Route
          path="/admin/*"
          element={<AdminRoutes />}
        />

        {/* ========================= */}
        {/* CUSTOMER WEBSITE           */}
        {/* ========================= */}
        <Route
          path="/*"
          element={<CustomerApp />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;