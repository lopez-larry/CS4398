/**
 * @file ForgotPassword.jsx
 * @description Request a password reset link by email (SPA PAM).
 *
 * Improvements:
 *  - Consistent security wording: avoids leaking if account exists
 *  - Clears email field after successful request
 *  - Added label for accessibility
 */

import React, { useState } from "react";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await axiosInstance.post("/user/forgot-password", { email });

      // Always use safe wording (prevents info leak)
      toast.success(
        "If this email is registered, a password reset link has been sent."
      );

      // Clear form
      setEmail("");
    } catch (err) {
      console.error("[DEBUG] Forgot password failed:", err.response?.data || err);

      // Use safe fallback wording
      toast.error("Unable to process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2>Forgot Password</h2>
      <p className="text-muted">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className="form-control mb-3"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
        />

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
