/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { WishlistProvider } from './context/WishlistContext';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import ShoppingBag from './pages/ShoppingBag';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Orders from './pages/Orders';
import AccountSettings from './pages/AccountSettings';
import Checkout from './pages/Checkout';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import SellerRegister from './pages/auth/SellerRegister';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import SellerOrders from './pages/dashboard/SellerOrders';
import SellerPayments from './pages/dashboard/SellerPayments';
import SellerInvoices from './pages/dashboard/SellerInvoices';
import SellerLedger from './pages/dashboard/SellerLedger';
import AddProduct from './pages/dashboard/AddProduct';
import BulkUpload from './pages/dashboard/BulkUpload';
import PricelistManagement from './pages/dashboard/PricelistManagement';
import PromotionManager from './pages/dashboard/PromotionManager';
import CouponManager from './pages/dashboard/CouponManager';
import DiscountManager from './pages/dashboard/DiscountManager';
import EditProduct from './pages/dashboard/EditProduct';
import ShippingManagement from './pages/dashboard/ShippingManagement';
import SellerLogs from './pages/dashboard/SellerLogs';
import AdminPricelistManagement from './pages/admin/PricelistManagement';
import SellerApplications from './pages/admin/SellerApplications';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductModeration from './pages/admin/ProductModeration';
import SalesAnalytics from './pages/admin/SalesAnalytics';
import Settings from './pages/admin/Settings';
import CommunicationSettings from './pages/admin/CommunicationSettings';
import AccessControl from './pages/admin/AccessControl';
import SystemLogs from './pages/admin/SystemLogs';
import AdminPromotionManager from './pages/admin/PromotionManager';
import AdminCouponManager from './pages/admin/CouponManager';
import AdminDiscountManager from './pages/admin/DiscountManager';
import BlogList from './pages/blogs/BlogList';
import BlogDetail from './pages/blogs/BlogDetail';
import AdminBlogManager from './pages/admin/BlogManager';
import AdminBlogEditor from './pages/admin/BlogEditor';
import SEOManager from './pages/admin/SEOManager';
import CategoryManager from './pages/admin/CategoryManager';
import BrandManager from './pages/admin/BrandManager';
import PaymentMethodManager from './pages/admin/PaymentMethodManager';
import PaymentSettings from './pages/admin/PaymentSettings';
import NotificationManager from './pages/admin/NotificationManager';
import LocalizationManager from './pages/admin/LocalizationManager';
import FilterManager from './pages/admin/FilterManager';
import CountryManager from './pages/admin/CountryManager';
import TaxManager from './pages/admin/TaxManager';
import Transactions from './pages/seller/Transactions';

import OrderHistory from './pages/customer/OrderHistory';
import SellerOrderManager from './pages/seller/OrderManager';
import AdminOrderManager from './pages/admin/OrderManager';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminLedger from './pages/admin/AdminLedger';
import AdminTransactions from './pages/admin/AdminTransactions';

import SellerLayout from './components/layout/SellerLayout';
import SellerAnalytics from './pages/dashboard/SellerAnalytics';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import PortalNotFound from './pages/dashboard/PortalNotFound';

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ErrorBoundary>
                <ScrollToTop />
                <ScrollToTopButton />
                <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="blogs" element={<BlogList />} />
                  <Route path="blog/:slug" element={<BlogDetail />} />
                  <Route path="cart" element={<ShoppingBag />} />
                  <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="account" element={<Account />} />
                  <Route path="orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                  <Route path="account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                </Route>
              
              {/* Auth Routes - No Layout */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/seller/register" element={<SellerRegister />} />
              
              {/* Seller Dashboard Routes - No Layout */}
              <Route path="/seller" element={<SellerLayout />}>
                <Route path="dashboard" element={<ProtectedRoute module="overview"><SellerDashboard /></ProtectedRoute>} />
                <Route path="orders" element={<ProtectedRoute module="orders"><SellerOrderManager /></ProtectedRoute>} />
                <Route path="payments" element={<ProtectedRoute module="payments"><Transactions /></ProtectedRoute>} />
                <Route path="invoices" element={<ProtectedRoute module="invoices"><SellerInvoices /></ProtectedRoute>} />
                <Route path="ledger" element={<ProtectedRoute module="ledger"><SellerLedger /></ProtectedRoute>} />
                <Route path="add-product" element={<ProtectedRoute module="products" action="create"><AddProduct /></ProtectedRoute>} />
                <Route path="edit-product/:id" element={<ProtectedRoute module="products" action="edit"><EditProduct /></ProtectedRoute>} />
                <Route path="bulk-upload" element={<ProtectedRoute module="bulk_upload"><BulkUpload /></ProtectedRoute>} />
                <Route path="products" element={<ProtectedRoute module="products"><SellerDashboard /></ProtectedRoute>} />
                <Route path="pricelists" element={<ProtectedRoute module="pricelist"><PricelistManagement /></ProtectedRoute>} />
                <Route path="promotions" element={<ProtectedRoute module="promotions"><PromotionManager /></ProtectedRoute>} />
                <Route path="coupons" element={<ProtectedRoute module="coupons"><CouponManager /></ProtectedRoute>} />
                <Route path="discounts" element={<ProtectedRoute module="discounts"><DiscountManager /></ProtectedRoute>} />
                <Route path="shipping" element={<ProtectedRoute module="shipping"><ShippingManagement /></ProtectedRoute>} />
                <Route path="logs" element={<ProtectedRoute module="system"><SellerLogs /></ProtectedRoute>} />
                <Route path="analytics" element={<ProtectedRoute module="analytics"><SellerAnalytics /></ProtectedRoute>} />
                <Route path="*" element={<PortalNotFound />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<ProtectedRoute module="overview"><AdminDashboard /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute module="users"><UserManagement /></ProtectedRoute>} />
                <Route path="seller-applications" element={<ProtectedRoute module="users"><SellerApplications /></ProtectedRoute>} />
                <Route path="products" element={<ProtectedRoute module="products"><ProductModeration /></ProtectedRoute>} />
                <Route path="orders" element={<ProtectedRoute module="orders"><AdminOrderManager /></ProtectedRoute>} />
                <Route path="invoices" element={<ProtectedRoute module="invoices"><AdminInvoices /></ProtectedRoute>} />
                <Route path="ledger" element={<ProtectedRoute module="ledger"><AdminLedger /></ProtectedRoute>} />
                <Route path="analytics" element={<ProtectedRoute module="analytics"><SalesAnalytics /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
                <Route path="communication" element={<ProtectedRoute module="settings"><CommunicationSettings /></ProtectedRoute>} />
                <Route path="access" element={<ProtectedRoute module="rbac"><AccessControl /></ProtectedRoute>} />
                <Route path="logs" element={<ProtectedRoute module="system"><SystemLogs /></ProtectedRoute>} />
                <Route path="pricelists" element={<ProtectedRoute module="pricelist"><AdminPricelistManagement /></ProtectedRoute>} />
                <Route path="promotions" element={<ProtectedRoute module="promotions"><AdminPromotionManager /></ProtectedRoute>} />
                <Route path="coupons" element={<ProtectedRoute module="coupons"><AdminCouponManager /></ProtectedRoute>} />
                <Route path="discounts" element={<ProtectedRoute module="discounts"><AdminDiscountManager /></ProtectedRoute>} />
                <Route path="blogs" element={<ProtectedRoute module="blogs"><AdminBlogManager /></ProtectedRoute>} />
                <Route path="blogs/new" element={<ProtectedRoute module="blogs" action="create"><AdminBlogEditor /></ProtectedRoute>} />
                <Route path="blogs/edit/:id" element={<ProtectedRoute module="blogs" action="edit"><AdminBlogEditor /></ProtectedRoute>} />
                <Route path="seo" element={<ProtectedRoute module="seo"><SEOManager /></ProtectedRoute>} />
                <Route path="categories" element={<ProtectedRoute module="products"><CategoryManager /></ProtectedRoute>} />
                <Route path="brands" element={<ProtectedRoute module="products"><BrandManager /></ProtectedRoute>} />
                <Route path="payments" element={<ProtectedRoute module="payments"><AdminTransactions /></ProtectedRoute>} />
                <Route path="payment-methods" element={<ProtectedRoute module="payments"><PaymentMethodManager /></ProtectedRoute>} />
                <Route path="payment-settings" element={<ProtectedRoute module="payments"><PaymentSettings /></ProtectedRoute>} />
                <Route path="notifications" element={<ProtectedRoute module="settings"><NotificationManager /></ProtectedRoute>} />
                <Route path="localizations" element={<ProtectedRoute module="settings"><LocalizationManager /></ProtectedRoute>} />
                <Route path="filters" element={<ProtectedRoute module="products"><FilterManager /></ProtectedRoute>} />
                <Route path="countries" element={<ProtectedRoute module="settings"><CountryManager /></ProtectedRoute>} />
                <Route path="taxes" element={<ProtectedRoute module="tax_rules"><TaxManager /></ProtectedRoute>} />
                <Route path="*" element={<PortalNotFound />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </Router>
        </WishlistProvider>
      </CartProvider>
    </CurrencyProvider>
  </AuthProvider>
);
}


