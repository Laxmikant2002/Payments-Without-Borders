import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../services/auth';

const Profile: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user = getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    } catch (err) {
      setError('Failed to load user profile.');
      setLoading(false);
    }
  }, [setCurrentUser]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;
  if (!currentUser) return <div>No user profile found.</div>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <p><strong>Name:</strong> {currentUser.name}</p>
      <p><strong>Email:</strong> {currentUser.email}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default Profile;
