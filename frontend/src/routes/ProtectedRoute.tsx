import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import type { Role } from '../lib/types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = ['REVIEWER'],
  children,
}) => {
  const { isAuthenticated, role, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;