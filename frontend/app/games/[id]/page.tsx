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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors"
          >
            <span>←</span>
            <span>Back to Games</span>
          </Link>

          {/* Game Header */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 mb-8">
            <div className="flex gap-8">
              {/* Cover Image */}
              {game.coverImageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={game.coverImageUrl}
                    alt={game.title}
                    className="w-64 h-96 object-cover rounded-lg shadow-2xl"
                  />
                </div>
              )}

              {/* Game Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-4">{game.title}</h1>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Developer</p>
                    <p className="text-white font-semibold">{game.developer}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Publisher</p>
                    <p className="text-white font-semibold">{game.publisher}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Release Date</p>
                    <p className="text-white font-semibold">
                      {new Date(game.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Metacritic Score</p>
                    <p className="text-white font-semibold">
                      {game.metacriticScore > 0 ? `${game.metacriticScore}/100` : 'N/A'}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">{game.description}</p>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap">
                  {!inLibrary && !inWishlist && (
                    <>
                      <button
                        onClick={handleAddToCollection}
                        disabled={addingToLibrary}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        {addingToLibrary ? 'Adding...' : '📚 Add to Collection'}
                      </button>
                      <button
                        onClick={handleAddToWishlist}
                        disabled={addingToLibrary}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        {addingToLibrary ? 'Adding...' : '⭐ Add to Wishlist'}
                      </button>
                    </>
                  )}
                  {inLibrary && !inWishlist && (
                    <>
                      <div className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2">
                        <span>✓ In Your Collection</span>
                      </div>
                      <button
                        onClick={handleAddToWishlist}
                        disabled={addingToLibrary}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        {addingToLibrary ? 'Moving...' : '⭐ Move to Wishlist'}
                      </button>
                      <button
                        onClick={handleRemoveFromLibrary}
                        disabled={addingToLibrary}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        {addingToLibrary ? 'Removing...' : '🗑️ Remove'}
                      </button>
                    </>
                  )}
                  {inWishlist && (
                    <>
                      <div className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold flex items-center gap-2">
                        <span>⭐ In Your Wishlist</span>
                      </div>
                      <button
                        onClick={handleAddToCollection}
                        disabled={addingToLibrary}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        {addingToLibrary ? 'Moving...' : '📚 Move to Collection'}
                      </button>
                      <button
                        onClick={handleRemoveFromLibrary}
                        disabled={addingToLibrary}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        {addingToLibrary ? 'Removing...' : '🗑️ Remove'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Selector Modal */}
          {showPlatformSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-4">Select Platform</h3>
                <p className="text-gray-400 mb-4">Choose which platform you own this game on:</p>

                <div className="space-y-2 mb-6">
                  {platforms.map((platform) => (
                    <label
                      key={platform.platform_id}
                      className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                    >
                      <input
                        type="radio"
                        name="platform"
                        value={platform.platform_id}
                        checked={selectedPlatform === platform.platform_id}
                        onChange={(e) => setSelectedPlatform(parseInt(e.target.value))}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-white font-medium">{platform.name}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={confirmAddToCollection}
                    disabled={addingToLibrary}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    {addingToLibrary ? 'Adding...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowPlatformSelector(false)}
                    disabled={addingToLibrary}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
            <ReviewSection gameId={gameId} />
          </div>
        </div>
      </div>
    </>
  );
}

