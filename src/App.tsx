/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { WishlistProvider } from './context/WishlistContext';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import SellerLayout from './components/layout/SellerLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// --- Store Pages ---
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ShoppingBag = lazy(() => import('./pages/ShoppingBag'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Account = lazy(() => import('./pages/Account'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderHistory = lazy(() => import('./pages/customer/OrderHistory'));
const ReturnsAndExchanges = lazy(() => import('./pages/ReturnsAndExchanges'));

// --- Blog Pages ---
const BlogList = lazy(() => import('./pages/blogs/BlogList'));
const BlogDetail = lazy(() => import('./pages/blogs/BlogDetail'));

// --- Auth Pages ---
const SignIn = lazy(() => import('./pages/auth/SignIn'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const SellerRegister = lazy(() => import('./pages/auth/SellerRegister'));

// --- Seller Dashboard Pages ---
const SellerDashboard = lazy(() => import('./pages/dashboard/SellerDashboard'));
const SellerOrderManager = lazy(() => import('./pages/seller/OrderManager'));
const SellerInvoices = lazy(() => import('./pages/dashboard/SellerInvoices'));
const SellerLedger = lazy(() => import('./pages/dashboard/SellerLedger'));
const SellerAnalytics = lazy(() => import('./pages/dashboard/SellerAnalytics'));
const SellerLogs = lazy(() => import('./pages/dashboard/SellerLogs'));
const Transactions = lazy(() => import('./pages/seller/Transactions'));
const AddProduct = lazy(() => import('./pages/dashboard/AddProduct'));
const EditProduct = lazy(() => import('./pages/dashboard/EditProduct'));
const BulkUpload = lazy(() => import('./pages/dashboard/BulkUpload'));
const PricelistManagement = lazy(() => import('./pages/dashboard/PricelistManagement'));
const PromotionManager = lazy(() => import('./pages/dashboard/PromotionManager'));
const CouponManager = lazy(() => import('./pages/dashboard/CouponManager'));
const DiscountManager = lazy(() => import('./pages/dashboard/DiscountManager'));
const ShippingManagement = lazy(() => import('./pages/dashboard/ShippingManagement'));
const PortalNotFound = lazy(() => import('./pages/dashboard/PortalNotFound'));

// --- Admin Pages ---
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SellerApplications = lazy(() => import('./pages/admin/SellerApplications'));
const ProductModeration = lazy(() => import('./pages/admin/ProductModeration'));
const AdminOrderManager = lazy(() => import('./pages/admin/OrderManager'));
const AdminInvoices = lazy(() => import('./pages/admin/AdminInvoices'));
const AdminLedger = lazy(() => import('./pages/admin/AdminLedger'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const SalesAnalytics = lazy(() => import('./pages/admin/SalesAnalytics'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const CommunicationSettings = lazy(() => import('./pages/admin/CommunicationSettings'));
const AccessControl = lazy(() => import('./pages/admin/AccessControl'));
const SystemLogs = lazy(() => import('./pages/admin/SystemLogs'));
const AdminPricelistManagement = lazy(() => import('./pages/admin/PricelistManagement'));
const AdminPromotionManager = lazy(() => import('./pages/admin/PromotionManager'));
const AdminCouponManager = lazy(() => import('./pages/admin/CouponManager'));
const AdminDiscountManager = lazy(() => import('./pages/admin/DiscountManager'));
const AdminBlogManager = lazy(() => import('./pages/admin/BlogManager'));
const AdminBlogEditor = lazy(() => import('./pages/admin/BlogEditor'));
const SEOManager = lazy(() => import('./pages/admin/SEOManager'));
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager'));
const BrandManager = lazy(() => import('./pages/admin/BrandManager'));
const PaymentMethodManager = lazy(() => import('./pages/admin/PaymentMethodManager'));
const PaymentSettings = lazy(() => import('./pages/admin/PaymentSettings'));
const NotificationManager = lazy(() => import('./pages/admin/NotificationManager'));
const LocalizationManager = lazy(() => import('./pages/admin/LocalizationManager'));
const FilterManager = lazy(() => import('./pages/admin/FilterManager'));
const CountryManager = lazy(() => import('./pages/admin/CountryManager'));
const TaxManager = lazy(() => import('./pages/admin/TaxManager'));

// --- Loading Fallback ---
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

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
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Store Routes */}
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
                      <Route path="returns-exchanges" element={<ReturnsAndExchanges />} />
                    </Route>

                    {/* Auth Routes */}
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/seller/register" element={<SellerRegister />} />

                    {/* Seller Routes */}
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
                </Suspense>
              </ErrorBoundary>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}