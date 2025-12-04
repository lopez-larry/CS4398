/**
 * @file BreederRoute.jsx
 * @description Route guard for breeder-only pages.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const BreederRoute = ({ children }) => {
  const { user } = useAuth();

  // If not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not a breeder → redirect to dashboard or forbidden page
  if (user.role !== "breeder") {
    return <Navigate to="/profile" replace />;
  }

  // Allow breeder access
  return children;
};

export default BreederRoute;
