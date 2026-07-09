import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Page Imports
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import POSPage from "../pages/billing/POSPage";
import BranchesPage from "../pages/branches/BranchesPage";
import UsersPage from "../pages/users/UsersPage";
import CategoriesPage from "../pages/products/CategoriesPage";
import ProductsPage from "../pages/products/ProductsPage";
import InventoryPage from "../pages/inventory/InventoryPage";
import IngredientsPage from "../pages/ingredients/IngredientsPage";
import CustomersPage from "../pages/customers/CustomersPage";
import SuppliersPage from "../pages/suppliers/SuppliersPage";
import ReportsPage from "../pages/reports/ReportsPage";
import AuditPage from "../pages/audit/AuditPage";
import SettingsPage from "../pages/settings/SettingsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Dashboard Layout (Pathless Route wrapper) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"]}>
              <POSPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/branches"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <BranchesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN"]}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN"]}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ingredients"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"]}>
              <IngredientsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"]}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN"]}>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AuditPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
