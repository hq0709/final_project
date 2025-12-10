'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, libraryAPI, reviewsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface UserProfile {
  userId: number;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  country: string;
  accountCreated: string;
  level?: number;
  points?: number;
  gamesCount?: number;
  reviewsCount?: number;
  likesReceived?: number;
}

interface UserStats {
  totalGames: number;
  ownedGames: number;
  wishlistGames: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    country: ''
  });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push('/auth');
      return;
    }
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load user profile
      const profileResponse = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
        setEditForm({
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          country: profileData.country || ''
        });
      }

      // Load library stats
      try {
        const statsResponse = await libraryAPI.getLibraryStats();
        setStats(statsResponse);
      } catch (err) {
        console.log('Stats not available');
      }

      // Load user's reviews
      try {
        const reviewsResponse = await reviewsAPI.getUserReviews();
        setRecentReviews(reviewsResponse.slice(0, 5));
      } catch (err) {
        console.log('Reviews not available');
      }

    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        loadProfileData();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-gray-400">Please try logging in again.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
          {/* Profile Header */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl">
                  👤
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profile.displayName || profile.username}
                  </h1>
                  <p className="text-gray-400">@{profile.username}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Member since {new Date(profile.accountCreated).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                {isEditing ? 'Cancel' : '✏️ Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.bio && (
                  <p className="text-gray-300">{profile.bio}</p>
                )}
                {profile.country && (
                  <p className="text-gray-400">📍 {profile.country}</p>
                )}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.totalGames || 0}
              </div>
              <div className="text-gray-400">Games in Collection</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.wishlistGames || 0}
              </div>
              <div className="text-gray-400">Wishlist Games</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-3xl font-bold text-white mb-1">
                {profile.reviewsCount || recentReviews.length}
              </div>
              <div className="text-gray-400">Reviews Written</div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Reviews</h2>
            {recentReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                <p className="text-gray-400 mb-6">Start sharing your gaming experiences!</p>
                <Link
                  href="/games"
                  className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Browse Games
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        href={`/games/${review.gameId}`}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        {review.gameTitle || `Game #${review.gameId}`}
                      </Link>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">{review.reviewText}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>❤️ {review.likesCount || 0} likes</span>
                      <span>💬 {review.repliesCount || 0} replies</span>
                      <span>{new Date(review.createdDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

