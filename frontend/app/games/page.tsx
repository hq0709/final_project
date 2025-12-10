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
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadGames();
  }, [page, pageSize]);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      if (searchQuery.trim()) {
        // Search endpoint currently returns array (based on api.ts check)
        const data = await gamesAPI.search(searchQuery, page, pageSize);
        setGames(data);
        setTotalPages(1);
      } else {
        const data = await gamesAPI.getAll(page, pageSize);
        setGames(data.content);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadGames();
  };

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 bg-grid pointer-events-none -z-10" />
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 neon-text">🎮 Browse Games</h1>
          <p className="text-gray-400 text-xl">Discover and explore amazing games</p>
        </div>

        {/* Search Bar & Page Size */}
        <form onSubmit={handleSearch} className="mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 p-2 glass rounded-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="flex-1 px-6 py-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-gray-500"
            />
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-4 py-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="10">10 per page</option>
              <option value="15">15 per page</option>
              <option value="20">20 per page</option>
            </select>
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
                  setPage(0);
                  // We need to trigger a reload with empty query. 
                  // Since loadGames uses state, we can't just call it here with old state.
                  // But setting searchQuery to '' will trigger re-render, but NOT loadGames because it's not in dependency array.
                  // We can manually call getAll here.
                  setLoading(true);
                  gamesAPI.getAll(0, pageSize).then(data => {
                    setGames(data.content);
                    setTotalPages(data.totalPages);
                    setLoading(false);
                  });
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
            {games.length > 0 && !searchQuery && (
              <div className="mt-16 flex justify-center gap-4 items-center">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                >
                  Previous
                </button>
                <span className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
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
                      setPage(0);
                      setLoading(true);
                      gamesAPI.getAll(0, pageSize).then(data => {
                        setGames(data.content);
                        setTotalPages(data.totalPages);
                        setLoading(false);
                      });
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

