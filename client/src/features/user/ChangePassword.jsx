/**
 * @file ChangePassword.jsx
 * @description Page for authenticated users to change their password.
 * Redirects user to the correct dashboard based on role after success.
 */

import React, { useState } from "react";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth(); // get current user (with role)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Matches backend: POST /api/user/change-password
      await axiosInstance.post("/user/change-password", {
        oldPassword,
        newPassword,
      });

      toast.success("Password updated successfully!");

      // ✅ Redirect based on user role
      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user?.role === "breeder") {
        navigate("/breeder/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2>Change Password</h2>
      <hr />
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Old Password</label>
          <input
            type="password"
            className="form-control"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (user?.role === "admin") {
                navigate("/admin/dashboard");
              } else if (user?.role === "breeder") {
                navigate("/breeder/dashboard");
              } else {
                navigate("/customer/dashboard");
              }
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
