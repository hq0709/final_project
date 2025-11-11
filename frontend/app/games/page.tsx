'use client';

import { useEffect, useState } from 'react';
import { gamesAPI, Game } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadGames();
  }, [page]);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gamesAPI.getAll(page, 20);
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadGames();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await gamesAPI.search(searchQuery, 0, 20);
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search games');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 Browse Games</h1>
          <p className="text-gray-300">Discover and explore amazing games</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadGames();
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Loading games...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <Link
                  key={game.gameId}
                  href={`/games/${game.gameId}`}
                  className="bg-slate-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all transform hover:scale-105"
                >
                  {/* Game Cover Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-6xl">🎮</span>
                  </div>

                  {/* Game Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 truncate">
                      {game.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {game.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>
                        ⭐ {game.avgRating ? `${game.avgRating.toFixed(1)}/5` : 'No ratings'}
                      </span>
                      <span className="text-gray-500">{game.releaseDate}</span>
                    </div>

                    {/* Developer */}
                    <div className="mt-2 text-xs text-gray-500">
                      {game.developer}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {games.length > 0 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-slate-800 text-white rounded-lg">
                  Page {page + 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={games.length < 20}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* No Results */}
            {games.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No games found</p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      loadGames();
                    }}
                    className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Show all games
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

