import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '@/axiosInstance';
import { toast } from 'react-toastify';

const DogDetail = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDog = async () => {
      try {
        const res = await axios.get(`/dogs/id/${id}`);
        setDog(res.data);

        const favRes = await axios.get('/dogs/favorites');
        const favIds = (favRes.data.favorites || []).map(d => d._id.toString());
        setIsFavorite(favIds.includes(id));
      } catch (err) {
        console.error('Failed to fetch dog detail:', err);
      }
    };

    fetchDog();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!dog) return;
    setSaving(true);

    try {
      if (isFavorite) {
        await axios.delete('/dogs/favorites', { data: { dogId: dog._id } });
        toast.info(`${dog.name} removed from favorites`);
        setIsFavorite(false);
      } else {
        await axios.post('/dogs/favorites', { dogId: dog._id });
        toast.success(`${dog.name} added to favorites`);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Favorite action failed:', err);
      toast.error('Could not update favorites.');
    } finally {
      setSaving(false);
    }
  };

  if (!dog) return <p>Loading...</p>;

  const breederName =
    dog.breeder?.kennelName ||
    `${dog.breeder?.firstName || ''} ${dog.breeder?.lastName || ''}`.trim() ||
    'Unknown';

  return (
    <div className="p-4">
      {/* Dog Image */}
      <img
        src={dog.imageUrl || '/placeholder-dog.svg'}
        alt={dog.name}
        className="w-80 h-80 object-cover rounded-lg"
      />

      {/* Dog Name */}
      <h2 className="text-2xl font-bold mt-3">{dog.name}</h2>

      {/* Dog Info */}
      <p>Breed: {dog.breed?.name || '—'}</p>
      <p>Age: {dog.ageMonths !== undefined ? `${dog.ageMonths} months` : 'N/A'}</p>
      <p>{dog.description}</p>
      <p>Breeder: {breederName}</p>

      {/* Actions */}
      <div className="mt-3">
        <Link
          to={`/dogs/${dog._id}/contact`}
          className="btn btn-primary me-2"
        >
          Contact Breeder
        </Link>

        {/* Toggle button */}
        <button
          onClick={handleToggleFavorite}
          disabled={saving}
          className={`btn ${isFavorite ? 'btn-danger' : 'btn-secondary'}`}
        >
          {saving
            ? 'Saving...'
            : isFavorite
            ? 'Unsave Favorite'
            : 'Save to Favorites'}
        </button>
      </div>
    </div>
  );
};

export default DogDetail;
