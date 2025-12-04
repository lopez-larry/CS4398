/**
 * @file VerifiedRoute.jsx
 * @description Route guard for pages that require both authentication and verified email.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const VerifiedRoute = ({ children }) => {
  const { user } = useAuth();

  // If not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not verified → go to verify-required
  if (!user.isVerified) {
    return <Navigate to="/verify-required" replace />;
  }

  // Otherwise allow access
  return children;
};

export default VerifiedRoute;
