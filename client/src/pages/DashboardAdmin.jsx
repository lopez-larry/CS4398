/**
 * @file DashboardAdmin.jsx
 * @description Admin-only dashboard for metrics, users, submissions, and breed management
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosInstance";
import { Navigate } from "react-router-dom";
import AdminMetrics from "@/features/admin/AdminMetrics";
import AdminSubmissionList from "@/features/admin/AdminSubmissionList";
import AdminBreedManager from "@/features/admin/AdminBreedManager";
import CookieViewer from "../components/debug/CookieViewer";
import CollapsibleCard from "../components/ui/CollapsibleCard";

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]); // default to []
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [metricsRes, usersRes, submissionsRes] = await Promise.all([
          axiosInstance.get("/admin/metrics"),
          axiosInstance.get("/admin/users"),
          axiosInstance.get("/admin/submissions"),
        ]);

        setMetrics(metricsRes.data || null);
        setUsers(usersRes.data?.users || []); // ensure array
        setSubmissions(submissionsRes.data || []);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
    };

    if (user?.role === "admin") fetchAdminData();
  }, [user]);

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <CollapsibleCard title="Cookie Panel">
        <CookieViewer />
      </CollapsibleCard>

      <CollapsibleCard title="User Metrics">
        <AdminMetrics metrics={metrics} />
      </CollapsibleCard>

      <CollapsibleCard title="Manage Breeds">
        <AdminBreedManager />
      </CollapsibleCard>

      <CollapsibleCard title="Submission Forms">
        <AdminSubmissionList submissions={submissions} />
      </CollapsibleCard>
    </div>
  );
};

export default DashboardAdmin;
