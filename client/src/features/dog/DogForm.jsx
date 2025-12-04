/**
 * @file DogForm.jsx
 * @description Add / Edit Dog — Breeder only
 */

import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axiosInstance from "@/axiosInstance";

const DogForm = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [dog, setDog] = useState({
        name: "",
        breed: "",
        description: "",
        sex: "",
        ageMonths: "",
        imageKey: "",
        status: "draft",
        visibility: "public",
    });

    const [breeds, setBreeds] = useState([]);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        axiosInstance
            .get("/breeds")
            .then((res) => setBreeds(res.data || []))
            .catch((err) => console.error("Failed to fetch breeds:", err));
    }, []);

    // Load dog if editing
    useEffect(() => {
        if (!id) return;

        axiosInstance
            .get(`/dogs/id/${id}`)
            .then((res) => {
                setDog({
                    ...res.data,
                    breed: res.data.breed?._id || "",
                });
                setPreviewUrl(res.data.imageUrl || "");
            })
            .catch((err) => console.error("Failed to load dog:", err));
    }, [id]);

    const handleChange = (e) => {
        setDog({...dog, [e.target.name]: e.target.value});
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await axiosInstance.post("/upload", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            setDog((prev) => ({...prev, imageKey: res.data.key || res.data.imageKey}));
            setPreviewUrl(res.data.url);
        } catch (err) {
            console.error("Image upload failed:", err);
            alert("Error uploading image.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await axiosInstance.put(`/dogs/${id}`, dog);
            } else {
                await axiosInstance.post(`/dogs`, dog);
            }
            console.log("Navigating to breeder dashboard");
            navigate("/breeder");

        } catch (err) {
            console.error("Failed to save dog:", err.response?.data || err.message);
            alert("Error: Could not save dog");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2>{id ? "Edit Dog" : "Add Dog"}</h2>

            <form onSubmit={handleSubmit}>

                {/* Name */}
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={dog.name}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                {/* Breed */}
                <div className="mb-3">
                    <label className="form-label">Breed</label>
                    <select
                        name="breed"
                        value={dog.breed}
                        onChange={handleChange}
                        required
                        className="form-select"
                    >
                        <option value="">-- Select Breed --</option>
                        {breeds.map((b) => (
                            <option key={b._id} value={b._id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Age */}
                <div className="mb-3">
                    <label className="form-label">Age (months)</label>
                    <input
                        type="number"
                        name="ageMonths"
                        value={dog.ageMonths}
                        onChange={handleChange}
                        min="0"
                        className="form-control"
                    />
                </div>

                {/* Description */}
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                        name="description"
                        value={dog.description}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                {/* Sex */}
                <div className="mb-3">
                    <label className="form-label">Sex</label>
                    <select
                        name="sex"
                        value={dog.sex}
                        onChange={handleChange}
                        required
                        className="form-select"
                    >
                        <option value="">-- Select Sex --</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                    <label className="form-label">Upload Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="form-control"
                    />
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="mt-2"
                            style={{width: "120px", height: "120px", objectFit: "cover", borderRadius: 6}}
                        />
                    )}
                </div>

                {/* Status */}
                <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                        name="status"
                        value={dog.status}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {/* Visibility */}
                <div className="mb-3">
                    <label className="form-label">Visibility</label>
                    <select
                        name="visibility"
                        value={dog.visibility}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                <button className="btn btn-success" disabled={loading}>
                    {loading ? "Saving..." : "Save Dog"}
                </button>

            </form>
        </div>
    );
};

export default DogForm;
