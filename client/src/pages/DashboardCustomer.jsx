/**
 * @file DashboardCustomer.jsx
 * @description Combined page for customers showing saved dogs and inbox toggle
 */

import React, { useEffect, useState } from "react";
import axios from "@/axiosInstance";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

import CustomerSavedList from "@/features/customers/CustomerSavedList";
import CustomerInbox from "@/features/messages/CustomerInbox";

const DashboardCustomer = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showInbox, setShowInbox] = useState(false);

  const fetchUnread = async () => {
    if (!user) return; // guard against null user
    try {
      const res = await axios.get("/messages/unread/count");
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Error loading unread messages:", err);
      toast.error("Error loading unread messages.");
    }
  };

  useEffect(() => {
    fetchUnread();
  }, [user]);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>My Favorite Dogs</h2>

        <button
          onClick={() => {
            const newState = !showInbox;
            setShowInbox(newState);
            if (newState) fetchUnread();
          }}
          className={`btn ${showInbox ? "btn-outline-secondary" : "btn-primary"}`}
        >
          Messages
          {unreadCount > 0 && (
            <span className="badge bg-light text-dark ms-2">{unreadCount}</span>
          )}
        </button>
      </div>

      {showInbox && (
        <div className="mb-4">
          <CustomerInbox refreshUnread={fetchUnread} />
        </div>
      )}

      <CustomerSavedList />
    </div>
  );
};

export default DashboardCustomer;
