/**
 * @file PrivateRoute.jsx
 * @description Route guard for pages that require authentication.
 * Supports optional role-based restrictions and email verification.
 *
 * Usage:
 *  <PrivateRoute> ... </PrivateRoute>
 *  <PrivateRoute roles={['admin']}> ... </PrivateRoute>
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();

  // Not logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not verified → redirect to verification required page
  if (!user.isVerified) {
    return <Navigate to="/verify-required" replace />;
  }

  // Role-based protection (if roles prop is passed)
  if (roles && !roles.includes(user.role)) {
    // Redirect to home if role is not allowed
    return <Navigate to="/" replace />;
  }

  // Otherwise allow access
  return children;
};

export default PrivateRoute;
