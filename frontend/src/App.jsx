import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import DesktopNav from "./components/DesktopNav";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import CartPage from "./pages/CartPage";
import CategoriesPage from "./pages/CategoriesPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import WishlistPage from "./pages/WishlistPage";
import "./App.css";

/* ── Admin imports ── */
import { ToastProvider } from "./admin/components/Toast";
import AdminLayout from "./admin/components/Layout";
import AdminLoginPage from "./admin/pages/LoginPage";
import DashboardPage from "./admin/pages/DashboardPage";
import AdminProductsPage from "./admin/pages/ProductsPage";
import ProductFormPage from "./admin/pages/ProductFormPage";
import AdminCategoriesPage from "./admin/pages/CategoriesPage";
import AdminOrdersPage from "./admin/pages/OrdersPage";
import AdminOrderDetailPage from "./admin/pages/OrderDetailPage";
import CustomersPage from "./admin/pages/CustomersPage";
import CouponsPage from "./admin/pages/CouponsPage";
import SettingsPage from "./admin/pages/SettingsPage";

const TAB_PATHS = ["/", "/categories", "/cart", "/wishlist", "/profile"];

function AppShell() {
  const location = useLocation();
  const showBottomNav = TAB_PATHS.includes(location.pathname);

  return (
    <div className="app-shell">
      <DesktopNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      {showBottomNav && <BottomNav />}
      <Footer />
    </div>
  );
}

/* Guard admin routes — redirect to /login if no admin_token */
function RequireAdmin({ children }) {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    window.location.replace("/admin/login");
    return null;
  }
  return children;
}

function AdminApp() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route
          path="/"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:slug/edit" element={<ProductFormPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default function App() {
  const isAdmin = typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <BrowserRouter basename="/admin">
        <AdminApp />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppShell />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
