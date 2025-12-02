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
    <div className="min-h-screen bg-grid bg-fixed bg-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 neon-text">🎮 Browse Games</h1>
          <p className="text-gray-400 text-xl">Discover and explore amazing games</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-12 max-w-3xl mx-auto">
          <div className="flex gap-4 p-2 glass rounded-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="flex-1 px-6 py-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50"
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
                className="px-6 py-4 glass hover:bg-white/10 text-white rounded-xl font-bold transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin text-5xl mb-4">🌀</div>
            <p className="text-gray-400 text-lg">Loading games...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-8 max-w-2xl mx-auto text-center">
            <p className="font-bold text-lg mb-1">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {games.map((game, index) => (
                <Link
                  key={game.gameId}
                  href={`/games/${game.gameId}`}
                  className="glass rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/30 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Game Cover Placeholder */}
                  <div className="h-56 bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-20"></div>
                    {game.coverImageUrl ? (
                      <img src={game.coverImageUrl} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🎮</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                  </div>

                  {/* Game Info */}
                  <div className="p-6 relative">
                    <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-purple-400 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                      {game.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3 pt-4 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span> {game.avgRating ? `${game.avgRating.toFixed(1)}` : 'N/A'}
                      </span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-gray-500">{game.releaseDate}</span>
                    </div>

                    {/* Developer */}
                    <div className="text-xs text-purple-400 font-medium uppercase tracking-wider truncate">
                      {game.developer}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {games.length > 0 && (
              <div className="mt-16 flex justify-center gap-4">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                >
                  Previous
                </button>
                <span className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20">
                  Page {page + 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={games.length < 20}
                  className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                >
                  Next
                </button>
              </div>
            )}

            {/* No Results */}
            {games.length === 0 && (
              <div className="glass rounded-3xl p-16 text-center border border-white/5 max-w-2xl mx-auto">
                <div className="text-6xl mb-6 opacity-50">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-3">No games found</h3>
                <p className="text-gray-400 text-lg">Try adjusting your search terms</p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      loadGames();
                    }}
                    className="mt-6 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/30"
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

