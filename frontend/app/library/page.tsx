'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, libraryAPI } from '@/lib/api';
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
  ownershipDate?: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('last_played');

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
      <span className={`${badge.color} text-white text-xs px-2 py-1 rounded`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-5xl">📚</span>
            My Game Library
          </h1>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                All Games
              </button>
              <button
                onClick={() => setFilter('owned')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'owned'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                📚 My Collection
              </button>
              <button
                onClick={() => setFilter('wishlist')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'wishlist'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                ⭐ Wishlist
              </button>
            </div>

            <div className="flex-1"></div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-purple-500/30 focus:border-purple-500 focus:outline-none"
            >
              <option value="last_played">Recently Played</option>
              <option value="name">Name</option>
              <option value="playtime">Playtime</option>
              <option value="completion">Completion</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-400">Loading...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredGames.length === 0 && (
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
        )}

        {/* Games Grid */}
        {!loading && filteredGames.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div
                key={game.userGameId}
                className="bg-slate-800/50 backdrop-blur rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all shadow-xl relative group"
              >
                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemoveGame(game.userGameId, game.title, e)}
                  className="absolute top-2 left-2 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from library"
                >
                  🗑️
                </button>

                <Link href={`/games/${game.gameId}`} className="block">
                  {/* Game Cover */}
                  <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative">
                    <span className="text-6xl">🎮</span>
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(game.status)}
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">
                      {game.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Completion</span>
                        <span>{game.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                          style={{ width: `${game.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>⏱️ Playtime</span>
                        <span className="text-white font-medium">{game.playtimeHours}h</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>🏆 Achievements</span>
                        <span className="text-white font-medium">
                          {game.unlockedAchievements}/{game.totalAchievements}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>🎮 Platform</span>
                        <span className="text-white font-medium">{game.platformName}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

