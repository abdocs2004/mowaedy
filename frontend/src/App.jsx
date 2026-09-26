import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { PublicLayout } from './components/layout/PublicLayout.jsx';
import { ScrollManager } from './components/layout/ScrollManager.jsx';
import { PageLoader } from './components/ui/index.js';
import { adminNav, providerNav } from './lib/nav.js';

const HomePage = lazy(() => import('./pages/public/HomePage.jsx'));
const ProvidersPage = lazy(() => import('./pages/public/ProvidersPage.jsx'));
const ProviderDetailsPage = lazy(() => import('./pages/public/ProviderDetailsPage.jsx'));
const BookingPage = lazy(() => import('./pages/public/BookingPage.jsx'));
const LoginPage = lazy(() => import('./pages/public/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage.jsx'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage.jsx'));
const MyAppointmentsPage = lazy(() => import('./pages/customer/MyAppointmentsPage.jsx'));
const ProviderOverviewPage = lazy(() => import('./pages/provider/ProviderOverviewPage.jsx'));
const ProviderAppointmentsPage = lazy(() => import('./pages/provider/ProviderAppointmentsPage.jsx'));
const ProviderServicesPage = lazy(() => import('./pages/provider/ProviderServicesPage.jsx'));
const ProviderProfilePage = lazy(() => import('./pages/provider/ProviderProfilePage.jsx'));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage.jsx'));
const AdminAppointmentsPage = lazy(() => import('./pages/admin/AdminAppointmentsPage.jsx'));
const AdminProvidersPage = lazy(() => import('./pages/admin/AdminProvidersPage.jsx'));
const AdminProviderDetailsPage = lazy(() => import('./pages/admin/AdminProviderDetailsPage.jsx'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage.jsx'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage.jsx'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage.jsx'));

export default function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="providers/:id" element={<ProviderDetailsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute roles={['user', 'admin']} />}>
              <Route path="providers/:id/book" element={<BookingPage />} />
              <Route path="my-appointments" element={<MyAppointmentsPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['provider']} />}>
            <Route path="/provider" element={<DashboardLayout nav={providerNav} />}>
              <Route index element={<ProviderOverviewPage />} />
              <Route path="appointments" element={<ProviderAppointmentsPage />} />
              <Route path="services" element={<ProviderServicesPage />} />
              <Route path="profile" element={<ProviderProfilePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout nav={adminNav} />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="providers" element={<AdminProvidersPage />} />
              <Route path="providers/:id" element={<AdminProviderDetailsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
