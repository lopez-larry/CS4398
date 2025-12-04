/**
 * @file apiConfig.js
 * @description Centralized configuration for the base URL of backend API requests.
 *
 * Features:
 *  - Uses environment variable `VITE_API_BASE_URL` if defined (e.g., in a .env file).
 *  - Falls back to localhost (http://localhost:5001/api) for local development.
 *
 * Usage:
 *  Import this in Axios setup or anywhere you need the backend base URL.
 *  Example: axios.get(`${API_BASE_URL}/resumes`)
 *
 * Deployment Notes:
 *  - In production, set VITE_API_BASE_URL to your deployed backend URL.
 *  - Create a `.env.production` file if needed:
 *      VITE_API_BASE_URL=https://yourdomain.com/api
 */

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
//
// export default API_BASE_URL;

const isDev = import.meta?.env?.DEV;

const API_BASE_URL = isDev
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api');

export default API_BASE_URL;