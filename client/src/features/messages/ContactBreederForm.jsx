/**
 * @file ContactBreederForm.jsx
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/axiosInstance";
import { useAuth } from "@/context/AuthContext";

const ContactBreederForm = () => {
  const { id } = useParams(); // dog id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dog, setDog] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch dog data
  useEffect(() => {
    axiosInstance
      .get(`/dogs/id/${id}`)
      .then((res) => setDog(res.data))
      .catch((err) => {
        console.error("Failed to load dog:", err);
        navigate("/dogs");
      });
  }, [id, navigate]);

  // If not logged in, require login
  useEffect(() => {
    if (dog && !user) {
      navigate("/login");
    }
  }, [dog, user, navigate]);

  const isBreederView =
    user && dog?.breeder?._id && user._id === dog.breeder._id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dog?.breeder?._id) return;

    setLoading(true);

    try {
      await axiosInstance.post("/messages", {
        dogId: dog._id,
        recipient: dog.breeder._id,
        body: message,
      });

      alert("Message sent successfully.");
      navigate(`/dogs/${dog._id}`);
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  if (!dog) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h3>
        Contact Breeder about: <strong>{dog.name}</strong>
      </h3>

      <p>
        Breeder: <strong>{dog.breeder?.name || "Unknown"}</strong>
      </p>

      {isBreederView ? (
        <p className="text-muted">You are the breeder for this dog.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows="5"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            disabled={loading || !message.trim()}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactBreederForm;
