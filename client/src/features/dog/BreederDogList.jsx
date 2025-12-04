/**
 * @file BreederDogList.jsx
 * @description Displays a table of breeder-owned dogs with actions.
 */

import React from "react";
import { Link } from "react-router-dom";

const BreederDogList = ({ dogs, loading, onDelete, onStatusChange }) => {
  if (loading) return <p>Loading...</p>;

  if (!dogs || dogs.length === 0) {
    return <p>No dogs posted yet.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Breed</th>
          <th>Age</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {dogs.map((dog) => (
          <tr key={dog._id}>
            <td>
              <img
                src={dog.imageUrl || "/placeholder-dog.svg"}
                alt={dog.name}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            </td>
            <td>{dog.name}</td>
            <td>{dog.breed?.name || "—"}</td>
            <td>{dog.ageMonths ? `${dog.ageMonths} months` : "N/A"}</td>
            <td>
              <span
                className={`badge bg-${
                  dog.status === "published" ? "success" : "secondary"
                }`}
              >
                {dog.status || "draft"}
              </span>
            </td>
            <td>
              <Link
                to={`/dogs/${dog._id}`}
                className="btn btn-sm btn-outline-info me-2"
              >
                View
              </Link>
              <Link
                to={`/breeder/dogs/edit/${dog._id}`}
                className="btn btn-sm btn-warning me-2"
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(dog._id)}
                className="btn btn-sm btn-danger me-2"
              >
                Delete
              </button>
              {dog.status !== "published" ? (
                <button
                  onClick={() => onStatusChange(dog._id, "published")}
                  className="btn btn-sm btn-success"
                >
                  Publish
                </button>
              ) : (
                <button
                  onClick={() => onStatusChange(dog._id, "archived")}
                  className="btn btn-sm btn-secondary"
                >
                  Archive
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BreederDogList;
