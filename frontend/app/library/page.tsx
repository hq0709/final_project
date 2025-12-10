'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, libraryAPI, authAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface LibraryGame {
  userGameId: number;
  gameId: number;
  title: string;
  coverImageUrl: string;
  playtimeHours: number;
  completionPercentage: number;
  status: string;
  platformName: string;
  totalAchievements: number;
  unlockedAchievements: number;
  developer?: string;
  publisher?: string;
  description?: string;
  metacriticScore?: number;
  avgRating?: number;
  ownershipDate?: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('last_played');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push('/auth');
      return;
    }
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const data = await libraryAPI.getUserLibrary();
      setGames(data);
    } catch (error) {
      console.error('Failed to load library:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoadingRecs(true);
      // 1. Get User ID
      const user = await authAPI.getCurrentUser();
      if (user && user.userId) {
        // 2. Fetch Recommendations from Python AI
        const response = await fetch('http://localhost:5001/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.userId })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.recommendations) {
            setRecommendations(data.recommendations);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleRemoveGame = async (userGameId: number, gameTitle: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!confirm(`Are you sure you want to remove "${gameTitle}" from your library?`)) {
      return;
    }

    try {
      await libraryAPI.removeGameFromLibrary(userGameId);
      // Refresh library
      await loadLibrary();
      alert('✅ Game removed from library!');
    } catch (error: any) {
      console.error('Failed to remove game:', error);
      alert('❌ ' + (error.message || 'Failed to remove game'));
    }
  };

  const filteredGames = games.filter(game => {
    if (filter === 'all') return true;
    return game.status === filter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating_high':
        return (b.avgRating || 0) - (a.avgRating || 0);
      case 'rating_low':
        return (a.avgRating || 0) - (b.avgRating || 0);
      case 'metacritic':
        return (b.metacriticScore || 0) - (a.metacriticScore || 0);
      case 'name':
        return a.title.localeCompare(b.title);
      case 'platform':
        return a.platformName.localeCompare(b.platformName);
      case 'last_played':
      default:
        // Assuming higher ID means more recently added as a fallback
        return b.userGameId - a.userGameId;
    }
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      playing: { text: 'Playing', color: 'bg-green-600' },
      completed: { text: 'Completed', color: 'bg-blue-600' },
      abandoned: { text: 'Abandoned', color: 'bg-gray-600' },
      wishlist: { text: 'Wishlist', color: 'bg-purple-600' },
      owned: { text: 'Owned', color: 'bg-indigo-600' },
    };
    const badge = badges[status] || { text: status, color: 'bg-gray-600' };
    return (
      <span className={`${badge.color} text-white text-xs px-2 py-1 rounded-lg font-bold shadow-sm`}>
        {badge.text}
      </span>
    );
  };

  const handleQuickAdd = async (gameId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await libraryAPI.addGameToLibrary({
        gameId,
        status: 'wishlist',
        platformId: 1
      });
      alert("⭐️ Added to Wishlist!");
      // Optional: Refresh library to show change immediately
      loadLibrary();
    } catch (err) {
      alert("Failed to add to wishlist");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 bg-grid pointer-events-none -z-10" />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3 neon-text">
            <span className="text-5xl">📚</span>
            My Game Library
          </h1>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${filter === 'all'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                All Games
              </button>
              <button
                onClick={() => setFilter('owned')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${filter === 'owned'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                📚 My Collection
              </button>
              <button
                onClick={() => setFilter('wishlist')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${filter === 'wishlist'
                  ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/30'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                ⭐ Wishlist
              </button>
            </div>

            <div className="flex-1"></div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl glass text-white border border-white/10 focus:border-purple-500 focus:outline-none cursor-pointer"
            >
              <option value="last_played">Recently Added</option>
              <option value="name">Name (A-Z)</option>
              <option value="rating_high">Highest Rated</option>
              <option value="rating_low">Lowest Rated</option>
              <option value="metacritic">Metacritic Score</option>
              <option value="platform">Platform</option>
            </select>
          </div>
        </div>

        {/* Recommendations Section */}
        {
          recommendations.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>✨</span> Recommended for You <span className="text-sm bg-purple-600 px-2 py-0.5 rounded-full">AI</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {recommendations.map((rec) => (
                  <Link href={`/games/${rec.game_id}`} key={rec.game_id} className="glass p-4 rounded-xl hover:bg-purple-900/20 transition-all hover:-translate-y-1 block border border-purple-500/10 group relative">
                    {/* Reason Badge */}
                    {rec.reason && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20">
                        Because you played {rec.reason}
                      </div>
                    )}

                    {/* Quick Action Overlay */}
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleQuickAdd(rec.game_id, e)}
                        className="bg-slate-900/80 hover:bg-purple-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors shadow-lg border border-white/10"
                        title="Quick Wishlist"
                      >
                        ➕
                      </button>
                    </div>

                    <div className="h-32 bg-slate-800 rounded-lg mb-3 overflow-hidden relative">
                      {rec.cover_image_url ? (
                        <img src={rec.cover_image_url} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">🎮</div>
                      )}
                    </div>
                    <h3 className="font-bold text-white line-clamp-1 group-hover:text-purple-400 transition-colors">{rec.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{rec.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )
        }

        {/* Loading State */}
        {
          loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">⏳</div>
              <p className="text-gray-400">Loading...</p>
            </div>
          )
        }

        {/* Empty State */}
        {
          !loading && filteredGames.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white mb-2">Your library is empty</h3>
              <p className="text-gray-400 mb-6">Start adding games to your library!</p>
              <Link
                href="/games"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-purple-500/50"
              >
                Browse Store
              </Link>
            </div>
          )
        }

        {/* Games Grid */}
        {
          !loading && filteredGames.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <div
                  key={game.userGameId}
                  className="glass rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/30 group card-hover-3d"
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveGame(game.userGameId, game.title, e)}
                    className="absolute top-2 left-2 z-10 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-lg"
                    title="Remove from library"
                  >
                    🗑️
                  </button>

                  <Link href={`/games/${game.gameId}`} className="block">
                    {/* Game Cover */}
                    <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden">
                      {game.coverImageUrl ? (
                        <img
                          src={game.coverImageUrl}
                          alt={game.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-6xl">🎮</span>
                      )}
                      <div className="absolute top-2 right-2 z-10">
                        {getStatusBadge(game.status)}
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">
                        {game.title}
                      </h3>

                      {/* Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-400">
                          <span>🎮 Platform</span>
                          <span className="text-white font-medium">{game.platformName}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>⭐ Community Rating</span>
                          <span className="text-white font-medium">
                            {game.avgRating ? `${game.avgRating.toFixed(1)}/5` : 'No ratings yet'}
                          </span>
                        </div>
                        {game.developer && (
                          <div className="flex justify-between text-gray-400">
                            <span>👨‍💻 Developer</span>
                            <span className="text-white font-medium text-xs">{game.developer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )
        }
      </div >
    </div >
  );
}

