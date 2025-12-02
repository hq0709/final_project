'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gamesAPI, Game, getAuthToken, libraryAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ReviewSection from '@/components/ReviewSection';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = parseInt(params.id as string);

  const [game, setGame] = useState<Game | null>(null);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [userGameId, setUserGameId] = useState<number | null>(null);
  const [addingToLibrary, setAddingToLibrary] = useState(false);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);

  useEffect(() => {
    const loggedIn = !!getAuthToken();
    setIsLoggedIn(loggedIn);
    loadGameDetails();
    loadPlatforms();
    if (loggedIn) {
      checkLibraryStatus();
    }
  }, [gameId]);

  const loadGameDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const gameData = await gamesAPI.getById(gameId);
      setGame(gameData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game details');
    } finally {
      setLoading(false);
    }
  };

  const loadPlatforms = async () => {
    try {
      const platformData = await gamesAPI.getPlatforms(gameId);
      setPlatforms(platformData);
      if (platformData.length > 0) {
        setSelectedPlatform(platformData[0].platform_id);
      }
    } catch (err) {
      console.log('Failed to load platforms:', err);
    }
  };

  const checkLibraryStatus = async () => {
    try {
      const result = await libraryAPI.checkGameInLibrary(gameId);
      setInLibrary(result.inLibrary);
      setInWishlist(result.status === 'wishlist');
      setUserGameId(result.userGameId || null);
    } catch (err) {
      console.log('Failed to check library status:', err);
    }
  };

  const handleAddToCollection = async () => {
    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }

    // Show platform selector if not already in library
    if (!inLibrary && !inWishlist) {
      setShowPlatformSelector(true);
      return;
    }

    try {
      setAddingToLibrary(true);

      // If already in wishlist, update status to owned
      if (inWishlist && userGameId) {
        await libraryAPI.updateGameInLibrary(userGameId, { status: 'owned' });
      }

      setInLibrary(true);
      setInWishlist(false);
      await checkLibraryStatus(); // Refresh status
      alert('✅ Game added to your collection!');
    } catch (error: any) {
      console.error('Error adding to collection:', error);
      alert('❌ ' + (error.message || 'Failed to add game to collection'));
    } finally {
      setAddingToLibrary(false);
    }
  };

  const confirmAddToCollection = async () => {
    try {
      setAddingToLibrary(true);
      await libraryAPI.addGameToLibrary({
        gameId,
        status: 'owned',
        platformId: selectedPlatform,
        playtimeHours: 0,
        completionPercentage: 0,
      });
      setInLibrary(true);
      setShowPlatformSelector(false);
      await checkLibraryStatus();
      alert('✅ Game added to your collection!');
    } catch (error: any) {
      console.error('Error adding to collection:', error);
      alert('❌ ' + (error.message || 'Failed to add game to collection'));
    } finally {
      setAddingToLibrary(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }

    try {
      setAddingToLibrary(true);

      // If already in library, update status to wishlist
      if (inLibrary && userGameId) {
        await libraryAPI.updateGameInLibrary(userGameId, { status: 'wishlist' });
      } else {
        // Add new game to wishlist (use first platform as default)
        await libraryAPI.addGameToLibrary({
          gameId,
          status: 'wishlist',
          platformId: platforms.length > 0 ? platforms[0].platform_id : 1,
          playtimeHours: 0,
          completionPercentage: 0,
        });
      }

      setInWishlist(true);
      setInLibrary(false);
      await checkLibraryStatus(); // Refresh status
      alert('✅ Game added to your wishlist!');
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      alert('❌ ' + (error.message || 'Failed to add game to wishlist'));
    } finally {
      setAddingToLibrary(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }

    if (!userGameId) {
      alert('Game not found in library');
      return;
    }

    if (!confirm('Are you sure you want to remove this game from your library?')) {
      return;
    }

    try {
      setAddingToLibrary(true);
      await libraryAPI.removeGameFromLibrary(userGameId);
      setInLibrary(false);
      setInWishlist(false);
      setUserGameId(null);
      alert('✅ Game removed from your library!');
    } catch (error: any) {
      console.error('Error removing from library:', error);
      alert('❌ ' + (error.message || 'Failed to remove game from library'));
    } finally {
      setAddingToLibrary(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-400">Loading game details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !game) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">Game Not Found</h1>
            <p className="text-gray-400 mb-6">{error || 'The game you are looking for does not exist.'}</p>
            <Link
              href="/games"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Back to Games
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="fixed inset-0 bg-grid pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
          {/* Back Button */}
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-purple-500/20 text-purple-300 mb-8 transition-all hover:-translate-x-1 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Games</span>
          </Link>

          {/* Game Header */}
          <div className="glass rounded-2xl p-8 mb-8 animate-fade-in relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              {/* Cover Image */}
              {game.coverImageUrl && (
                <div className="flex-shrink-0">
                  <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-purple-900/40 border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                    <img
                      src={game.coverImageUrl}
                      alt={game.title}
                      className="w-full md:w-64 h-96 object-cover transform transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                </div>
              )}

              {/* Game Info */}
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-white mb-6 neon-text tracking-tight">{game.title}</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                    <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">Developer</p>
                    <p className="text-white font-semibold">{game.developer}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                    <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">Publisher</p>
                    <p className="text-white font-semibold">{game.publisher}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                    <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">Release Date</p>
                    <p className="text-white font-semibold">
                      {new Date(game.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                    <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">Metacritic</p>
                    <p className={`text-xl font-bold ${game.metacriticScore >= 80 ? 'text-green-400' : game.metacriticScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {game.metacriticScore > 0 ? game.metacriticScore : 'N/A'}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 mb-8 text-lg leading-relaxed border-l-2 border-purple-500/30 pl-6 italic">
                  {game.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap">
                  {!inLibrary && !inWishlist && (
                    <>
                      <button
                        onClick={handleAddToCollection}
                        disabled={addingToLibrary}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-1 flex items-center gap-2"
                      >
                        <span>📚</span> Add to Collection
                      </button>
                      <button
                        onClick={handleAddToWishlist}
                        disabled={addingToLibrary}
                        className="px-8 py-4 glass hover:bg-white/10 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all hover:-translate-y-1 flex items-center gap-2"
                      >
                        <span>⭐</span> Add to Wishlist
                      </button>
                    </>
                  )}
                  {inLibrary && !inWishlist && (
                    <>
                      <div className="px-6 py-4 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-bold flex items-center gap-2">
                        <span>✓</span> In Collection
                      </div>
                      <button
                        onClick={handleAddToWishlist}
                        disabled={addingToLibrary}
                        className="px-6 py-4 glass hover:bg-white/10 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all hover:-translate-y-1"
                      >
                        Move to Wishlist
                      </button>
                      <button
                        onClick={handleRemoveFromLibrary}
                        disabled={addingToLibrary}
                        className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl font-bold transition-all hover:-translate-y-1"
                      >
                        Remove
                      </button>
                    </>
                  )}
                  {inWishlist && (
                    <>
                      <div className="px-6 py-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl font-bold flex items-center gap-2">
                        <span>⭐</span> In Wishlist
                      </div>
                      <button
                        onClick={handleAddToCollection}
                        disabled={addingToLibrary}
                        className="px-6 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-1"
                      >
                        Move to Collection
                      </button>
                      <button
                        onClick={handleRemoveFromLibrary}
                        disabled={addingToLibrary}
                        className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl font-bold transition-all hover:-translate-y-1"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Selector Modal */}
          {showPlatformSelector && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
              <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/30 shadow-2xl shadow-purple-900/50">
                <h3 className="text-2xl font-bold text-white mb-2">Select Platform</h3>
                <p className="text-gray-400 mb-6">Choose which platform you own this game on:</p>

                <div className="space-y-3 mb-8">
                  {platforms.map((platform) => (
                    <label
                      key={platform.platform_id}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${selectedPlatform === platform.platform_id
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-slate-800/50 border-white/5 text-gray-400 hover:bg-slate-700 hover:border-white/10'
                        }`}
                    >
                      <input
                        type="radio"
                        name="platform"
                        value={platform.platform_id}
                        checked={selectedPlatform === platform.platform_id}
                        onChange={(e) => setSelectedPlatform(parseInt(e.target.value))}
                        className="w-5 h-5 text-purple-600 accent-purple-600"
                      />
                      <span className="font-bold text-lg">{platform.name}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={confirmAddToCollection}
                    disabled={addingToLibrary}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/30"
                  >
                    {addingToLibrary ? 'Adding...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowPlatformSelector(false)}
                    disabled={addingToLibrary}
                    className="flex-1 px-6 py-3 glass hover:bg-white/10 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="glass rounded-2xl p-8 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10"></div>
            <ReviewSection gameId={gameId} />
          </div>
        </div>
      </div>
    </>
  );
}

