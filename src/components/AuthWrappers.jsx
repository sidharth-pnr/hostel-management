import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Guard for authenticated student users
 */
export const StudentRoute = ({ user }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'student') return <Navigate to="/login" replace />;
  return <Outlet />;
};

/**
 * Guard for authenticated admin users (SUPER or STAFF)
 */
export const AdminRoute = ({ user }) => {
  const isAdmin = user?.role === 'SUPER' || user?.role === 'STAFF';
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return <Outlet />;
};

/**
 * Guard for public routes (Login/Register) - redirects to home if already logged in
 */
export const PublicRoute = ({ user }) => {
  if (user) {
    const dashboard = (user.role === 'SUPER' || user.role === 'STAFF') ? '/admin' : '/student';
    return <Navigate to={dashboard} replace />;
  }
  return <Outlet />;
};
