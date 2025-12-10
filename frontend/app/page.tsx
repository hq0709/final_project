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
        reviewsAPI.getRecentReviews(10).catch(() => [])
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
    <div className="min-h-screen pt-28 pb-12 relative">
      <div className="fixed inset-0 bg-grid pointer-events-none -z-10" />
      <div className="bg-noise"></div>
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-20 min-h-[80vh] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="py-20">
            <h1 className="text-7xl md:text-9xl font-black mb-8 animate-fade-in drop-shadow-2xl tracking-tighter">
              <span className="text-gradient-animate">GameHub</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in animate-delay-100 leading-relaxed font-light">
              Your ultimate <span className="text-purple-400 font-semibold">social platform</span> for gaming.
              <br />
              Discover, review, and connect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in animate-delay-200">
              <Link
                href="/games"
                className="px-10 py-5 btn-neon text-white rounded-2xl font-bold text-xl shadow-xl shadow-purple-600/30 transition-all border border-white/10 shimmer"
              >
                Browse Games
              </Link>
              <Link
                href="/library"
                className="px-10 py-5 glass hover:bg-white/10 text-white rounded-2xl font-bold text-xl transition-all hover:scale-110 border border-white/10 hover:border-purple-500/50"
              >
                My Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-float"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -z-10 animate-float-delayed"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px] -z-10 animate-float"></div>

        {/* Floating Icons */}
        <div className="absolute top-20 left-20 text-6xl opacity-20 animate-float-delayed">🎮</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-float">🕹️</div>
        <div className="absolute top-40 right-40 text-4xl opacity-20 animate-float">🎲</div>
        <div className="absolute bottom-40 left-40 text-4xl opacity-20 animate-float-delayed">👾</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex justify-center mb-12 animate-fade-in animate-delay-300">
          <div className="glass p-1.5 rounded-2xl inline-flex">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'feed'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              🌐 Community Feed
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'reviews'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              ⭐ Recent Reviews
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-6xl mb-6">🌀</div>
            <p className="text-gray-400 text-xl">Loading community activity...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-fade-in animate-delay-300">
            {/* Community Feed Tab */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {activities.length === 0 ? (
                  <div className="glass rounded-3xl p-16 text-center border border-white/5">
                    <div className="text-7xl mb-6 opacity-50">🌟</div>
                    <h3 className="text-3xl font-bold text-white mb-4">No Activity Yet</h3>
                    <p className="text-gray-400 text-lg mb-8">Be the first to add games and write reviews!</p>
                    <Link
                      href="/games"
                      className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/30 hover:scale-105"
                    >
                      Explore Games
                    </Link>
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div
                      key={activity.activityId}
                      className="glass-premium rounded-2xl p-6 card-hover-3d"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-2xl border border-white/10">
                          {getActivityIcon(activity.activityType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-white text-lg">
                              {activity.displayName || activity.username}
                            </span>
                            <span className="text-gray-500 text-sm">•</span>
                            <span className="text-sm text-gray-400 bg-slate-800/50 px-2 py-0.5 rounded-md">
                              {formatTimeAgo(activity.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-3 text-lg">{activity.activityText}</p>
                          {activity.gameTitle && (
                            <Link
                              href={`/games/${activity.gameId}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg transition-colors border border-purple-500/20"
                            >
                              <span>🎮</span>
                              <span className="font-medium">{activity.gameTitle}</span>
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
              <div className="space-y-6">
                {recentReviews.length === 0 ? (
                  <div className="glass rounded-3xl p-16 text-center border border-white/5">
                    <div className="text-7xl mb-6 opacity-50">📝</div>
                    <h3 className="text-3xl font-bold text-white mb-4">No Reviews Yet</h3>
                    <p className="text-gray-400 text-lg">Start sharing your gaming experiences!</p>
                  </div>
                ) : (
                  recentReviews.map((review, index) => (
                    <div
                      key={review.reviewId}
                      className="glass-premium rounded-2xl p-8 card-hover-3d"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-white text-lg">
                              {review.displayName || review.username}
                            </span>
                            <span className="text-gray-500 text-sm">•</span>
                            <span className="text-sm text-gray-400 bg-slate-800/50 px-2 py-0.5 rounded-md">
                              {formatTimeAgo(review.createdDate)}
                            </span>
                          </div>
                          {review.gameTitle && (
                            <Link
                              href={`/games/${review.gameId}`}
                              className="text-purple-400 hover:text-purple-300 transition-colors font-medium text-lg flex items-center gap-2"
                            >
                              <span>🎮</span>
                              {review.gameTitle}
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-400">
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-200 mb-4 leading-relaxed text-lg">{review.reviewText}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-400 pt-4 border-t border-white/5">
                        <span className="flex items-center gap-2">
                          <span className="text-red-400">❤️</span> {review.likesCount} likes
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-purple-400">💬</span> {review.repliesCount} replies
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
