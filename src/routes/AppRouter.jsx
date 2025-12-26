import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import AdminLayout from "../components/AdminLayout.jsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";
import PositionsPage from "../features/config/pages/PositionsPage.jsx";
import PrivateRoute from "./PrivateRoute.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="config/cargos" element={<PositionsPage />} />
          <Route
            path="config/usuarios"
            element={<div className="text-primary-500">Próximamente...</div>}
          />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
