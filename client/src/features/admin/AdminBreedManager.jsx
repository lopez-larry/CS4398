// features/admin/AdminBreedManager.jsx
import React, {useEffect, useState} from "react";
import axiosInstance from "@/axiosInstance";

const AdminBreedManager = () => {
    const [breeds, setBreeds] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newBreed, setNewBreed] = useState("");

    const fetchBreeds = async () => {
        try {
            const res = await axiosInstance.get("/admin/breeds", {
                params: {search, sortOrder, page, limit: 10},
            });
            setBreeds(res.data.breeds || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch breeds:", err);
        }
    };

    useEffect(() => {
        fetchBreeds();
    }, [search, sortOrder, page]);

    const handleAddBreed = async () => {
        if (!newBreed.trim()) return;
        try {
            await axiosInstance.post("/admin/breeds", {name: newBreed.trim()});
            setNewBreed("");
            fetchBreeds();
        } catch (err) {
            console.error("Failed to add breed:", err);
            alert("Error adding breed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this breed?")) return;
        try {
            await axiosInstance.delete(`/admin/breeds/${id}`);
            fetchBreeds();
        } catch (err) {
            console.error("Failed to delete breed:", err);
            alert("Error deleting breed");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Dog Breeds Available</h2>

            {/* Add New Breed */}
            <div className="input-group mb-3">
                <input
                    type="text"
                    placeholder="New breed name"
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="form-control"
                />
                <button className="btn btn-primary" onClick={handleAddBreed}>
                    Add Breed
                </button>
            </div>

            {/* Search */}
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Search breeds..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="form-control"
                />
            </div>


            {/* Breed Table */}
            <table className="table">
                <thead>
                <tr>
                    <th
                        style={{cursor: "pointer"}}
                        onClick={() =>
                            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                        }
                    >
                        Breed Name {sortOrder === "asc" ? "▲" : "▼"}
                    </th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {breeds.length === 0 ? (
                    <tr>
                        <td colSpan="2">No breeds found</td>
                    </tr>
                ) : (
                    breeds.map((breed) => (
                        <tr key={breed._id}>
                            <td>{breed.name}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(breed._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between mt-3">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span>
          Page {page} of {totalPages}
        </span>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AdminBreedManager;
