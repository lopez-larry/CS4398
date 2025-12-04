/**
 * @file VerifyEmail.jsx
 * @description Automatically verifies email when user clicks the verification link (SPA PAM).
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Verify email with token
        const res = await axiosInstance.post("/user/verify-email", { token });
        console.log("[DEBUG] Verification success:", res.data);

        setStatus("Your email has been successfully verified.");
        toast.success("Email verified!");

        // Optionally fetch the user so we can redirect correctly
        try {
          const userRes = await axiosInstance.get("/user/current_user");
          const u = userRes.data;

          // Route by role
          if (u.role === "admin") {
            setTimeout(() => navigate("/admin/dashboard"), 2000);
          } else if (u.role === "breeder") {
            setTimeout(() => navigate("/dogs"), 2000);
          } else {
            setTimeout(() => navigate("/blog"), 2000);
          }
        } catch {
          // fallback → go to login
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (err) {
        console.error("[DEBUG] Verification failed:", err.response?.data || err);
        setStatus("Verification failed. This link may be invalid or expired.");
        toast.error("Verification failed.");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2>Email Verification</h2>
      <p className="text-muted">{status}</p>
    </div>
  );
};

export default VerifyEmail;
