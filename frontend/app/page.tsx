'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { activitiesAPI, Activity, reviewsAPI, Review } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'reviews'>('feed');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesData, reviewsData] = await Promise.all([
        activitiesAPI.getRecentActivities(20).catch(() => []),
        reviewsAPI.getUserReviews().catch(() => [])
      ]);
      setActivities(activitiesData);
      setRecentReviews(reviewsData.slice(0, 10));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post_review': return '📝';
      case 'add_game': return '🎮';
      case 'like_review': return '❤️';
      case 'reply_review': return '💬';
      case 'rate_game': return '⭐';
      default: return '📌';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🎮 GameHub
              </h1>
              <p className="text-gray-400">Your Gaming Social Community</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/games"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Browse Games
              </Link>
              <Link
                href="/library"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                My Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'feed'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            🌐 Community Feed
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'reviews'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            ⭐ Recent Reviews
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-400">Loading community activity...</p>
          </div>
        ) : (
          <>
            {/* Community Feed Tab */}
            {activeTab === 'feed' && (
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-500/20">
                    <div className="text-6xl mb-4">🌟</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Activity Yet</h3>
                    <p className="text-gray-400 mb-6">Be the first to add games and write reviews!</p>
                    <Link
                      href="/games"
                      className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Explore Games
                    </Link>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.activityId}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{getActivityIcon(activity.activityType)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-white">
                              {activity.displayName || activity.username}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-400">
                              {formatTimeAgo(activity.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">{activity.activityText}</p>
                          {activity.gameTitle && (
                            <Link
                              href={`/games/${activity.gameId}`}
                              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <span>🎮 {activity.gameTitle}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Recent Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {recentReviews.length === 0 ? (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-500/20">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Reviews Yet</h3>
                    <p className="text-gray-400">Start sharing your gaming experiences!</p>
                  </div>
                ) : (
                  recentReviews.map((review) => (
                    <div
                      key={review.reviewId}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">
                              {review.displayName || review.username}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-400">
                              {formatTimeAgo(review.createdDate)}
                            </span>
                          </div>
                          {review.gameTitle && (
                            <Link
                              href={`/games/${review.gameId}`}
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              {review.gameTitle}
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 mb-3">{review.reviewText}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>❤️ {review.likesCount} likes</span>
                        <span>💬 {review.repliesCount} replies</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
