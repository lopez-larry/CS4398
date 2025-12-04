// src/axiosInstance.js
import axios from "axios";
import API_BASE_URL from "./apiConfig";

const envBase = import.meta?.env?.VITE_API_BASE_URL?.toString().trim();
const cfgBase = API_BASE_URL?.toString().trim();
const isDev = import.meta?.env?.DEV;

const baseURL = isDev
  ? "/api/"
  : ((envBase || cfgBase || "/").replace(/\/+$/, "") + "/");

const api = axios.create({
  baseURL,
  withCredentials: true, // always include cookies for session-based auth
  headers: { "Content-Type": "application/json" },
});

// Attach token if present in localStorage (for JWT auth)
// But don’t break if session cookies are being used instead
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor for logging errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      console.warn("Unauthorized: Please log in.", err.response?.data);
    } else if (status === 403) {
      console.warn("Forbidden.", err.response?.data);
    } else if (status === 404) {
      console.warn("Not Found:", err.config?.url, err.response?.data);
    } else {
      console.error(
        "API error:",
        err?.code || err?.message,
        err?.response || ""
      );
    }
    return Promise.reject(err);
  }
);

export default api;
