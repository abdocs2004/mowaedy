import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { homeFor, useAuth } from '../../context/AuthContext.jsx';
import { PageLoader } from '../ui/index.js';

/** <ProtectedRoute roles={['admin']} /> — role-based route guard (server enforces the same rules). */
export function ProtectedRoute({ roles }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search, notice: 'يرجى تسجيل الدخول للمتابعة' }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
