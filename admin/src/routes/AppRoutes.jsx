import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

// Route-level code splitting (Suspense boundary lives in AdminLayout).
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AppointmentsPage = lazy(() => import('../pages/AppointmentsPage'));
const DoctorsPage = lazy(() => import('../pages/DoctorsPage'));
const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductFormPage = lazy(() => import('../pages/ProductFormPage'));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage'));
const InventoryPage = lazy(() => import('../pages/InventoryPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'));
const PeoplePage = lazy(() => import('../pages/PeoplePage'));
const EnquiriesPage = lazy(() => import('../pages/EnquiriesPage'));
const ContentPage = lazy(() => import('../pages/ContentPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const UsersPage = lazy(() => import('../pages/UsersPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const guard = (module, element) => <RoleGuard module={module}>{element}</RoleGuard>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={guard('dashboard', <DashboardPage />)} />
          <Route path="appointments" element={guard('appointments', <AppointmentsPage />)} />
          <Route path="doctors" element={guard('doctors', <DoctorsPage />)} />
          <Route path="services" element={guard('services', <ServicesPage />)} />
          <Route path="products" element={guard('products', <ProductsPage />)} />
          <Route path="products/new" element={guard('products', <ProductFormPage />)} />
          <Route path="products/:id" element={guard('products', <ProductFormPage />)} />
          <Route path="categories" element={guard('categories', <CategoriesPage />)} />
          <Route path="inventory" element={guard('inventory', <InventoryPage />)} />
          <Route path="orders" element={guard('orders', <OrdersPage />)} />
          <Route path="orders/:id" element={guard('orders', <OrderDetailPage />)} />
          <Route path="people" element={guard('people', <PeoplePage />)} />
          <Route path="enquiries" element={guard('enquiries', <EnquiriesPage />)} />
          <Route path="content" element={guard('content', <ContentPage />)} />
          <Route path="reports" element={guard('reports', <ReportsPage />)} />
          <Route path="users" element={guard('users', <UsersPage />)} />
          <Route path="settings" element={guard('settings', <SettingsPage />)} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
