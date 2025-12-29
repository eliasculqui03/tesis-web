import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import AdminLayout from "../components/AdminLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import PositionsPage from "../features/config/pages/PositionsPage";
import UsersPage from "../features/config/pages/UsersPage";
import PrivateRoute from "./PrivateRoute";

// Base URL desde Vite
const BASE_URL = import.meta.env.BASE_URL;

export default function AppRouter() {
  return (
    <BrowserRouter basename={BASE_URL}>
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
          <Route path="config/usuarios" element={<UsersPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
