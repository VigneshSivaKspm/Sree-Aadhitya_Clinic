import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageSkeleton } from "../components/ui/States";
import MainLayout from "../layouts/MainLayout";

// Route-level code splitting keeps the initial bundle small.
const HomePage = lazy(() => import("../pages/HomePage"));
const AyurvedaPage = lazy(() => import("../pages/AyurvedaPage"));
const DentalPage = lazy(() => import("../pages/DentalPage"));
const ServicesPage = lazy(() => import("../pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("../pages/ServiceDetailPage"));
const DoctorsPage = lazy(() => import("../pages/DoctorsPage"));
const AppointmentsPage = lazy(() => import("../pages/AppointmentsPage"));
const ShopPage = lazy(() => import("../pages/ShopPage"));
const ProductPage = lazy(() => import("../pages/ProductPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("../pages/OrderSuccessPage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const PrivacyPage = lazy(() =>
  import("../pages/LegalPages").then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import("../pages/LegalPages").then((m) => ({ default: m.TermsPage })),
);
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="ayurveda" element={<AyurvedaPage />} />
          <Route
            path="ayurveda/services"
            element={<ServicesPage practice="ayurveda" />}
          />
          <Route
            path="ayurveda/services/:slug"
            element={<ServiceDetailPage practice="ayurveda" />}
          />
          {/* Siddha Aliases */}
          <Route path="siddha" element={<AyurvedaPage />} />
          <Route
            path="siddha/services"
            element={<ServicesPage practice="ayurveda" />}
          />
          <Route
            path="siddha/services/:slug"
            element={<ServiceDetailPage practice="ayurveda" />}
          />
          <Route path="dental" element={<DentalPage />} />
          <Route
            path="dental/services"
            element={<ServicesPage practice="dental" />}
          />
          <Route
            path="dental/services/:slug"
            element={<ServiceDetailPage practice="dental" />}
          />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop/category/:slug" element={<ShopPage />} />
          <Route path="shop/product/:slug" element={<ProductPage />} />
          {/* Store Aliases */}
          <Route path="store" element={<Navigate to="/shop" replace />} />
          <Route path="store/product/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success" element={<OrderSuccessPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy-policy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
