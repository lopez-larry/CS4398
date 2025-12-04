/**
 * @file EmailNotVerified.jsx
 * @description Page shown to users whose email is not yet verified (SPA PAM project).
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../src/context/AuthContext";
import axiosInstance from "../../axiosInstance";

const EmailNotVerified = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: false, msg: "", err: "" });

  const handleResend = async () => {
    const emailToSend = user?.email || localStorage.getItem("pendingEmail");

    if (!emailToSend) {
      setStatus({
        loading: false,
        msg: "",
        err: "No email found for this account.",
      });
      return;
    }

    setStatus({ loading: true, msg: "", err: "" });

    try {
      // ✅ SPA PAM backend route: /api/user/resend-verification
      const res = await axiosInstance.post("/user/resend-verification", {
        email: emailToSend,
      });

      console.log("[DEBUG] Resend verification response:", res.data);

      setStatus({
        loading: false,
        msg: res.data.message || "Verification email resent successfully.",
        err: "",
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e.message ||
        "Failed to resend verification email.";
      setStatus({ loading: false, msg: "", err: msg });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const emailDisplay =
    user?.email || localStorage.getItem("pendingEmail") || "your email";

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2>Email Verification Required</h2>
      <p className="text-muted">
        Hi{user?.firstName ? ` ${user.firstName}` : ""}! It looks like your
        account email <strong>{emailDisplay}</strong> isn’t verified yet.
      </p>

      <div className="alert alert-warning">
        Please verify your email to continue. We’ve sent you a verification
        link. If you can’t find it, check your spam folder or resend it below.
      </div>

      {status.msg && <div className="alert alert-success">{status.msg}</div>}
      {status.err && <div className="alert alert-danger">{status.err}</div>}

      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-primary"
          onClick={handleResend}
          disabled={status.loading}
        >
          {status.loading ? "Sending…" : "Resend verification email"}
        </button>
        <button className="btn btn-outline-secondary" onClick={handleLogout}>
          Log Off
        </button>
      </div>
    </div>
  );
};

export default EmailNotVerified;
