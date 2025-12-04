/**
 * @file CustomerSavedList.jsx
 * @description Customer saved dogs list (favorites only)
 */

import React, { useEffect, useState } from "react";
import axios from "@/axiosInstance";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const CustomerSavedList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get("/dogs/favorites");
      const dogs = res.data?.favorites || res.data?.savedDogs || [];

      const results = await Promise.all(
        dogs.map(async (dog) => {
          if (!dog.imageKey) return dog;
          try {
            const imgRes = await axios.get(`/upload/image/${dog.imageKey}`);
            return { ...dog, imageUrl: imgRes.data.url };
          } catch {
            return { ...dog, imageUrl: null };
          }
        })
      );

      setFavorites(results);
    } catch (err) {
      console.error("Failed to load favorites:", err);
      toast.error("Could not load favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleUnsave = async (dogId) => {
    try {
      await axios.delete("/dogs/favorites", { data: { dogId } });
      setFavorites((prev) => prev.filter((dog) => dog._id !== dogId));
      toast.success("Removed from favorites.");
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      toast.error("Could not remove dog.");
    }
  };

  if (loading) return <p>Loading your favorites...</p>;

  return (
    <table className="table table-bordered text-sm align-middle">
      <thead className="table-light">
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Breed</th>
          <th>Age</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {favorites.map((dog) => (
          <tr key={dog._id}>
            <td>
              <img
                src={dog.imageUrl || "/placeholder-dog.svg"}
                alt={dog.name}
                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
              />
            </td>
            <td>{dog.name}</td>
            <td>{dog.breed?.name || "N/A"}</td>
            <td>{dog.ageMonths ? `${dog.ageMonths} months` : "N/A"}</td>
            <td>
              <Link to={`/dogs/${dog._id}`} className="btn btn-sm btn-info me-2">
                View
              </Link>
              <button
                onClick={() => handleUnsave(dog._id)}
                className="btn btn-sm btn-danger"
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CustomerSavedList;
