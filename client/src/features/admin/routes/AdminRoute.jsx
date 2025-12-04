/**
 * @file AdminRoute.jsx
 * @description Route guard for pages that require an authenticated admin user.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  // If not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not an admin → block access
  if (user.role !== "admin") {
    return <h1>403 - Forbidden</h1>;
  }

  // Otherwise allow access
  return children;
};

export default AdminRoute;
