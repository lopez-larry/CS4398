import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '@/axiosInstance';
import { toast } from 'react-toastify';

const DogGrid = () => {
  const [dogs, setDogs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  // -------------------------------
  // Handle Search From Puppies Page
  // -------------------------------
  const handleSearch = async () => {
    const trimmed = searchInput.trim();

    if (!trimmed) {
      navigate("/dogs");
      return;
    }

    try {
      const res = await axios.get("/dogs", {
        params: { search: trimmed }
      });

      const count = res.data?.data?.length || 0;

      if (count === 0) {
        toast.info(`No "${trimmed}" dogs right now. Showing all available dogs.`);
        navigate("/dogs");
      } else {
        navigate(`/dogs?search=${encodeURIComponent(trimmed)}`);
      }

    } catch (err) {
      console.error(err);
      toast.error("Search failed. Please try again.");
    }
  };

  // -------------------------------
  // Fetch Dogs Whenever Search Changes
  // -------------------------------
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const res = await axios.get('/dogs', {
          params: { search: searchQuery }
        });

        const dogsWithUrls = await Promise.all(
          (res.data.data || res.data || []).map(async (dog) => {
            if (dog.imageKey) {
              try {
                const imgRes = await axios.get(`/upload/image/${dog.imageKey}`);
                return { ...dog, imageUrl: imgRes.data.url };
              } catch {
                return { ...dog, imageUrl: null };
              }
            }
            return dog;
          })
        );

        setDogs(dogsWithUrls);
      } catch (err) {
        console.error('Failed to fetch dogs:', err);
      }
    };

    fetchDogs();
  }, [searchQuery]);

  return (
    <div className="p-4">
      {/* SEARCH BAR */}
      <section className="py-4 text-center bg-light shadow-sm mb-4">
        <div className="container d-flex justify-content-center align-items-center gap-2">
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search for breeds, names, or keywords..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </section>

      <h2 className="text-2xl font-bold mb-4">Available Dogs</h2>

      {/* No Results */}
      {dogs.length === 0 && (
        <div className="text-center py-5">
          <h4>No {searchQuery ? `"${searchQuery}"` : ""} dogs currently available.</h4>
        </div>
      )}

      {/* DOG GRID */}
      <div className="dog-grid">
        {dogs.map((dog) => (
          <Link to={`/dogs/${dog._id}`} key={dog._id} className="dog-card">
            <img
              src={dog.imageUrl || '/placeholder-dog.svg'}
              alt={dog.name}
              className="dog-placeholder"
            />
            <div className="p-3">
              <h3 className="font-semibold text-lg">{dog.name}</h3>
              <p className="text-sm text-gray-600">{dog.breed?.name || '—'}</p>
              {dog.ageMonths !== undefined && (
                <p className="text-sm">{dog.ageMonths} months old</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DogGrid;
