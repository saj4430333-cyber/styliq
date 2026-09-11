import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { isNative } from '@/lib/native';
import { isPaymentsEnabled } from '@/lib/features';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageNotFound from './lib/PageNotFound';
// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Add page imports here
import Home from './pages/Home';
import StylingForm from './pages/StylingForm';
import Results from './pages/Results';
import RecommendedBrands from './pages/RecommendedBrands';
import MyStyles from './pages/MyStyles';
import Account from './pages/Account';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import AppLayout from '@/components/AppLayout';
import Designs from './pages/Designs';
import Onboarding from './pages/Onboarding';

const Router = isNative() ? HashRouter : BrowserRouter;

// تُحمَّل صفحة الشراء فقط عند تفعيل الدفع — النسخة المجانية لا تضمّن مسار IAP.
const PricingPage = isPaymentsEnabled()
  ? lazy(() => import('./pages/Pricing'))
  : null;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/styling" element={<StylingForm />} />
      </Route>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/results" element={<Results />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/brands" element={<RecommendedBrands />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/designs" element={<Designs />} />
          <Route path="/my-styles" element={<MyStyles />} />
          <Route path="/account" element={<Account />} />
          <Route
            path="/pricing"
            element={
              PricingPage ? (
                <Suspense fallback={null}>
                  <PricingPage />
                </Suspense>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
