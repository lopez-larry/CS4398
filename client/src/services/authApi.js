// src/services/authApi.js
import api from "../axiosInstance.js";

// Accepts either a string or an object and normalizes to { email: "<string>" }
export const resendVerificationEmail = (emailOrObj) => {
  const email = typeof emailOrObj === "string" ? emailOrObj : emailOrObj?.email;
  return api.post("/api/user/resend-verification", { email });
};

export const verifyEmailWithToken = (token) =>
  api.post("/api/user/verify-email", { token });

// Helpful extras you likely need elsewhere:
export const getCurrentUser = () => api.get("/api/user/current_user");
export const logout = () => api.post("/api/user/logout");
