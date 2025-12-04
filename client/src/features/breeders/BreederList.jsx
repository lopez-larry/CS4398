/**
 * @file BreederList.jsx
 * @description Displays a list of verified breeders with ratings, locations, and profile images.
 */

import React, {useEffect, useState} from "react";
import axios from "@/axiosInstance";

const BreederList = () => {
    const [breeders, setBreeders] = useState([]);

    useEffect(() => {
        const fetchBreeders = async () => {
            try {
                const res = await axios.get("/breeders");
                const data = Array.isArray(res.data) ? res.data : res.data.breeders;
                setBreeders(data || []);
            } catch (err) {
                console.error("Error fetching breeders:", err);
                setBreeders([]);
            }
        };

        fetchBreeders();
    }, []);

    if (breeders.length === 0) {
        return (
            <p className="text-center text-gray-500">No breeders found.</p>
        );
    }

    return (
        <div className="space-y-6">
            {breeders.map((b) => {
                const imageSrc =
                    b.profileImageUrl || b.profileImage || "/default-breeder.png";

                return (
                    <div
                        key={b._id}
                        className="flex items-center bg-white shadow-md p-4 rounded-lg border border-gray-300"
                    >
                        <img
                            src={imageSrc}
                            alt={b.username}
                            className="breeder-img"

                        />
                        <div className="text-gray-800">
                            <p className="font-semibold">
                                Breeder Name:{" "}
                                <span className="font-normal">
                  {b.breederProfile?.kennelName || b.username}
                </span>
                            </p>
                            <p className="font-semibold">
                                Location:{" "}
                                <span className="font-normal">
                  {b.breederProfile?.location?.city || ""}{" "}
                                    {b.breederProfile?.location?.state || ""}
                </span>
                            </p>
                            <p className="font-semibold">
                                Ratings:{" "}
                                <span className="font-normal">
                  {b.averageRating
                      ? "⭐".repeat(Math.round(b.averageRating))
                      : "No ratings yet"}
                </span>
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BreederList;
