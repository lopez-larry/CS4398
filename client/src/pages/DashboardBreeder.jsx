/**
 * @file DashboardBreeder.jsx
 * @description Breeder dashboard with collapsible Profile and Messages.
 */

import React, { useEffect, useState } from "react";
import axios from "@/axiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import BreederDogList from "@/features/dog/BreederDogList";
import BreederInbox from "@/features/messages/BreederInbox";
import Profile from "@/features/user/Profile";
import EditPopup from "@/components/ui/EditPopup";

const DashboardBreeder = () => {
  const { user, refreshUser } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // NEW: toggles
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const fetchDogs = async () => {
    try {
      const res = await axios.get("/dogs/mine", { withCredentials: true });
      setDogs(res.data.data || []);
    } catch (err) {
      console.error("Failed to load dogs:", err);
      toast.error("Could not load dogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dog?")) return;

    try {
      await axios.delete(`/dogs/${id}`);
      setDogs((prev) => prev.filter((dog) => dog._id !== id));
      toast.success("Dog deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete dog");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.post(`/dogs/${id}/status`, { status });
      setDogs((prev) =>
        prev.map((dog) => (dog._id === id ? { ...dog, status } : dog))
      );
      toast.success("Dog status updated!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchDogs();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Breeder Dashboard</h2>

      {/* --------------------------------------- */}
      {/* PROFILE (COLLAPSIBLE)                   */}
      {/* --------------------------------------- */}
      <section className="mb-5" key={refreshKey}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="m-0">Profile</h4>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowProfile((prev) => !prev)}
          >
            {showProfile ? "Hide" : "Show"}
          </button>
        </div>

        {showProfile && (
          <div className="card p-4 shadow-sm">
            <div className="d-flex align-items-center gap-3">
              <img
                src={user?.profileImageUrl || "/default-avatar.png"}
                alt="Profile"
                className="rounded-circle"
                style={{ width: "100px", height: "100px" }}
              />
              <div>
                <h4>{user?.breederProfile?.kennelName || "Breeder Company Name"}</h4>
                <p className="text-muted">
                  {user?.breederProfile?.location?.city},{" "}
                  {user?.breederProfile?.location?.state}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <h5>About Us</h5>
              <p className="border rounded p-3">
                {user?.breederProfile?.description || "No description provided."}
              </p>
            </div>

            <button
             className="btn btn-outline-primary btn-sm d-block mx-auto mt-3"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </section>

      {/* --------------------------------------- */}
      {/* MESSAGES (COLLAPSIBLE)                  */}
      {/* --------------------------------------- */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="m-0">Messages</h4>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowMessages((prev) => !prev)}
          >
            {showMessages ? "Hide" : "Show"}
          </button>
        </div>

        {showMessages && (
          <div className="card p-3 shadow-sm">
            <BreederInbox />
          </div>
        )}
      </section>

      {/* --------------------------------------- */}
      {/* DOG LIST                                */}
      {/* --------------------------------------- */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>My Dogs</h4>
          <Link to="/breeder/dogs/new" className="btn btn-success">
            Add Dog
          </Link>
        </div>
        <div className="card p-3 shadow-sm">
          <BreederDogList
            dogs={dogs}
            loading={loading}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>
      </section>

      {/* Edit Modal */}
      {showEditModal && (
        <EditPopup
          title="Edit Profile"
          onClose={async () => {
            await refreshUser();
            setRefreshKey((prev) => prev + 1);
            setShowEditModal(false);
          }}
        >
          <Profile />
        </EditPopup>
      )}
    </div>
  );
};

export default DashboardBreeder;
