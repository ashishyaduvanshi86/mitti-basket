import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { AdminProvider } from "@/context/AdminContext";
import { ProductProvider } from "@/context/ProductContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import HomePage from "@/pages/HomePage";
import MangoHarvestPage from "@/pages/MangoHarvestPage";
import VillagePantryPage from "@/pages/VillagePantryPage";
import FestiveCollectionPage from "@/pages/FestiveCollectionPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsPage from "@/pages/TermsPage";
import RefundPolicyPage from "@/pages/RefundPolicyPage";
import ShippingPolicyPage from "@/pages/ShippingPolicyPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminSubscribers from "@/pages/admin/AdminSubscribers";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminBroadcast from "@/pages/admin/AdminBroadcast";
import { useEffect } from "react";

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <AdminProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="broadcast" element={<AdminBroadcast />} />
          </Route>
        </Routes>
      </AdminProvider>
    );
  }

  return (
    <CartProvider>
      <ProductProvider>
      <ScrollToTop />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#3A5A40",
            color: "white",
            border: "none",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
          },
        }}
      />
      <div className="min-h-screen bg-[#FAF7F2]">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mango-harvest" element={<MangoHarvestPage />} />
          <Route path="/village-pantry" element={<VillagePantryPage />} />
          <Route path="/festive-collection" element={<FestiveCollectionPage />} />
          <Route path="/farm-basket-subscription" element={<SubscriptionPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
      </ProductProvider>
    </CartProvider>
  );
}

function App() {

  useEffect(() => {
  if (!window.location.pathname.startsWith("/admin")) {
    if (!document.querySelector('script[src="https://verify.msg91.com/otp-provider.js"]')) {
      const script = document.createElement("script");
      script.src = "https://verify.msg91.com/otp-provider.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }
}, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
