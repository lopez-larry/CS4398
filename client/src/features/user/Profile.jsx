/**
 * @file Profile.jsx
 * @description User profile page for viewing, editing, withdrawing consent, and deleting account.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosInstance';
import { toast } from 'react-toastify';
import { resendVerificationEmail } from '../../services/authApi';

const Profile = () => {
  const { user, token, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [consentGiven, setConsentGiven] = useState(user?.consent?.agreed || false);
  const [loadingConsent, setLoadingConsent] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [resending, setResending] = useState(false);
  const fileInputRef = useRef();

  // breeder fields
  const [kennelName, setKennelName] = useState(user?.breederProfile?.kennelName || '');
  const [website, setWebsite] = useState(user?.breederProfile?.website || '');
  const [phone, setPhone] = useState(user?.breederProfile?.phone || '');
  const [city, setCity] = useState(user?.breederProfile?.location?.city || '');
  const [state, setState] = useState(user?.breederProfile?.location?.state || '');
  const [country, setCountry] = useState(user?.breederProfile?.location?.country || '');
  const [description, setDescription] = useState(user?.breederProfile?.description || "");


  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setKennelName(user.breederProfile?.kennelName || '');
      setWebsite(user.breederProfile?.website || '');
      setPhone(user.breederProfile?.phone || '');
      setCity(user.breederProfile?.location?.city || '');
      setState(user.breederProfile?.location?.state || '');
      setCountry(user.breederProfile?.location?.country || '');
    }
  }, [user]);

  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get('/user/current_user');
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResending(true);
      await resendVerificationEmail();
      toast.success('Verification email sent. Please check your inbox.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to resend verification email';
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/user/profile', {
        firstName,
        lastName,
        breederProfile:
          user?.role === 'breeder'
            ? {
                kennelName,
                website,
                phone,
                description,
                location: { city, state, country },
              }
            : undefined,
      });

      await refreshUser();
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action is irreversible.')) return;

    try {
      await axiosInstance.delete('/user/delete-account');
      toast.success('Account deleted. Goodbye!');
      logout();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error deleting account');
    }
  };

  const handleConsentToggle = async () => {
    try {
      setLoadingConsent(true);
      const res = await axiosInstance.post('/user/give-consent', {
        agreed: !consentGiven,
      });

      setConsentGiven(res.data.user.consent.agreed);
      setUser(res.data.user);
      toast.success(res.data.message);
    } catch (err) {
      console.error('Consent update failed:', err);
      toast.error('Failed to update consent.');
    } finally {
      setLoadingConsent(false);
    }
  };

  const handleWithdrawConsent = async () => {
    if (!window.confirm('Withdrawing consent may limit access to features. Proceed?')) return;

    try {
      const res = await axiosInstance.put('/user/withdraw-consent');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Consent withdrawn.');
    } catch (err) {
      toast.error('Error withdrawing consent');
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);
  };

  const handleSubmitProfileImage = async () => {
    if (!profileImageFile) return;

    const formData = new FormData();
    formData.append('image', profileImageFile);
    setUploadingImage(true);

    try {
      const res = await axiosInstance.post('/user/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.updatedUser) {
        setUser(res.data.updatedUser);
        localStorage.setItem('user', JSON.stringify(res.data.updatedUser));
        toast.success('Profile image updated!');
        setProfileImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error('Failed to upload profile image.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2>
        {user.role === 'breeder'
          ? 'Breeder Profile'
          : user.role === 'admin'
          ? 'Admin Profile'
          : 'User Profile'}
      </h2>
      <hr />

      {user?.isVerified === false && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
          <div>
            <strong>Email not verified.</strong> Some features are restricted until you verify your email.
          </div>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleResendVerification}
            disabled={resending}
          >
            {resending ? 'Sending…' : 'Resend email'}
          </button>
        </div>
      )}

      <div className="mb-3">
        {user?.profileImageUrl ? (
          <div>
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="profile-image"
              style={{ width: '80px', height: '80px', borderRadius: '50%' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
            <button
              onClick={async () => {
                try {
                  await axiosInstance.delete('/user/remove-profile-image');
                  toast.success('Profile image removed');
                  setUser({ ...user, profileImageUrl: undefined });
                } catch (err) {
                  toast.error('Failed to remove image');
                }
              }}
              className="btn btn-warning mx-2"
            >
              Remove Image
            </button>
          </div>
        ) : (
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            ?
          </div>
        )}

        <label htmlFor="profileImage" className="form-label mt-3">
          Upload Profile Image
        </label>
        <input
          type="file"
          id="profileImage"
          className="form-control"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleProfileImageChange}
        />
        {profileImageFile && (
          <button
            className="btn btn-primary mt-2"
            onClick={handleSubmitProfileImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? 'Uploading...' : 'Submit Image'}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-2">
            <label className="form-label">First Name</label>
            <input
              className="form-control"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {user.role === 'breeder' && (
            <>
              <h5 className="mt-3">Kennel Information</h5>
              <div className="mb-2">
                <label className="form-label">Kennel Name</label>
                <input
                  className="form-control"
                  value={kennelName}
                  onChange={(e) => setKennelName(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Website</label>
                <input
                  className="form-control"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">About Us</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a short description about your kennel, breeding goals, or background..."
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Location</label>
                <input
                  className="form-control"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  className="form-control mt-2"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                <input
                  className="form-control mt-2"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-success" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p>
            <strong>First Name:</strong> {user.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>

          {user.role === 'breeder' && (
            <>
              <h5 className="mt-3">Kennel Information</h5>
              <p>
                <strong>Kennel:</strong> {user.breederProfile?.kennelName || 'N/A'}
              </p>
              <p>
                <strong>Website:</strong> {user.breederProfile?.website || 'N/A'}
              </p>
              <p>
                <strong>Phone:</strong> {user.breederProfile?.phone || 'N/A'}
              </p>
              <p>
                <strong>Location:</strong>{' '}
                {user.breederProfile?.location
                  ? `${user.breederProfile.location.city}, ${user.breederProfile.location.state}, ${user.breederProfile.location.country}`
                  : 'N/A'}
              </p>
              <p>
                <strong>About Us:</strong>{' '}
                {user.breederProfile?.description || 'No description provided.'}
              </p>

              
            </>
          )}

          {user.role !== 'breeder' && (
            <p className="text-muted mt-3">
              You are logged in as a {user.role}. Basic profile features are available here.
            </p>
          )}

          <div className="d-flex flex-column gap-2 mt-3">
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
            {user.role === 'admin' && (
              <button className="btn btn-dark" onClick={() => navigate('/admin/dashboard')}>
                Go to Admin Dashboard
              </button>
            )}
            <button className="btn btn-warning" onClick={() => navigate('/change-password')}>
              Change Password
            </button>
            {user.consent?.agreed && (
              <button className="btn btn-secondary" onClick={handleWithdrawConsent}>
                Withdraw Consent
              </button>
            )}
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              Delete My Account
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
