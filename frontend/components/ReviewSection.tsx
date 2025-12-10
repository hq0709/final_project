'use client';

import { useState, useEffect } from 'react';
import { reviewsAPI, Review, ReviewReply } from '@/lib/api';

interface ReviewSectionProps {
  gameId: number;
  totalReviews?: number;
}

export default function ReviewSection({ gameId, totalReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [replies, setReplies] = useState<{ [key: number]: ReviewReply[] }>({});
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadReviews();
  }, [gameId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsAPI.getGameReviews(gameId, 0, 50);
      setReviews(Array.isArray(data) ? data : []);

      // Check which reviews are liked
      const liked = new Set<number>();
      for (const review of (Array.isArray(data) ? data : [])) {
        try {
          const likeStatus = await reviewsAPI.checkLiked(review.reviewId);
          if (likeStatus.liked) {
            liked.add(review.reviewId);
          }
        } catch (err) {
          // Not logged in or error
        }
      }
      setLikedReviews(liked);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a star rating');
      return;
    }
    if (!reviewText.trim()) return;

    try {
      setSubmitting(true);
      await reviewsAPI.createReview({
        gameId,
        rating,
        reviewText: reviewText.trim(),
      });
      setReviewText('');
      setRating(0);
      setShowReviewForm(false);
      await loadReviews();
    } catch (error: any) {
      alert(error.message || 'Failed to submit review. Please login first.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeToggle = async (reviewId: number) => {
    try {
      const isLiked = likedReviews.has(reviewId);
      if (isLiked) {
        await reviewsAPI.unlikeReview(reviewId);
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
      } else {
        await reviewsAPI.likeReview(reviewId);
        setLikedReviews(prev => new Set(prev).add(reviewId));
      }

      // Update the review's like count (ensure it doesn't go below 0)
      setReviews(prev => prev.map(r => {
        if (r.reviewId === reviewId) {
          const currentCount = r.likesCount || 0;
          const newCount = currentCount + (isLiked ? -1 : 1);
          return { ...r, likesCount: Math.max(0, newCount) };
        }
        return r;
      }));
    } catch (error: any) {
      alert(error.message || 'Failed to like review. Please login first.');
    }
  };

  const loadReplies = async (reviewId: number) => {
    try {
      const repliesData = await reviewsAPI.getReplies(reviewId);
      setReplies(prev => ({ ...prev, [reviewId]: repliesData }));
    } catch (error) {
      console.error('Failed to load replies:', error);
    }
  };

  const handleToggleReplies = async (reviewId: number) => {
    if (expandedReview === reviewId) {
      setExpandedReview(null);
    } else {
      setExpandedReview(reviewId);
      if (!replies[reviewId]) {
        await loadReplies(reviewId);
      }
    }
  };

  const handleSubmitReply = async (reviewId: number) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;

    try {
      await reviewsAPI.addReply(reviewId, text);
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      await loadReplies(reviewId);

      // Update reply count
      setReviews(prev => prev.map(r =>
        r.reviewId === reviewId
          ? { ...r, repliesCount: r.repliesCount + 1 }
          : r
      ));
    } catch (error: any) {
      alert(error.message || 'Failed to post reply. Please login first.');
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-4xl mb-4">🌀</div>
        <p className="text-gray-400">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-purple-400">Reviews</span>
          <span className="text-lg px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 border border-purple-500/30">
            {totalReviews !== undefined ? totalReviews : reviews.length}
          </span>
        </h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 border border-white/10"
        >
          {showReviewForm ? 'Cancel' : '✍️ Write Review'}
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="glass rounded-2xl p-8 animate-fade-in border border-purple-500/30">
          <form onSubmit={handleSubmitReview}>
            <div className="mb-6">
              <label className="block text-gray-300 font-semibold mb-3 uppercase text-sm tracking-wider">Rating</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-4xl transition-all hover:scale-110 focus:outline-none"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 font-semibold mb-3 uppercase text-sm tracking-wider">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-6 py-4 bg-slate-900/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[150px] transition-all"
                placeholder="Share your thoughts about this game..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50"
            >
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center border border-white/5">
            <div className="text-7xl mb-6 opacity-50">📝</div>
            <h3 className="text-2xl font-bold text-white mb-3">No Reviews Yet</h3>
            <p className="text-gray-400 text-lg">Be the first to share your experience with this game!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div
              key={review.reviewId}
              className={`glass rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    {(review.displayName || review.username || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">
                        {review.displayName || review.username || 'Anonymous'}
                      </span>
                      {review.recommended && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {formatTimeAgo(review.createdDate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-200 mb-6 leading-relaxed text-lg">{review.reviewText}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleLikeToggle(review.reviewId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${likedReviews.has(review.reviewId)
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white border border-transparent'
                    }`}
                >
                  <span className={likedReviews.has(review.reviewId) ? 'scale-110' : ''}>
                    {likedReviews.has(review.reviewId) ? '❤️' : '🤍'}
                  </span>
                  <span className="font-medium">{review.likesCount || 0}</span>
                </button>
                <button
                  onClick={() => handleToggleReplies(review.reviewId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${expandedReview === review.reviewId
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white border border-transparent'
                    }`}
                >
                  <span>💬</span>
                  <span className="font-medium">{review.repliesCount || 0} Replies</span>
                </button>
              </div>

              {/* Replies Section */}
              {expandedReview === review.reviewId && (
                <div className="mt-6 pl-8 border-l-2 border-purple-500/30 space-y-4 animate-fade-in">
                  {replies[review.reviewId]?.map((reply) => (
                    <div key={reply.replyId} className="bg-slate-900/50 rounded-xl p-5 border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                          {(reply.displayName || reply.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm block">
                            {reply.displayName || reply.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(reply.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm ml-11">{reply.replyText}</p>
                    </div>
                  ))}

                  {/* Reply Input */}
                  <div className="flex gap-3 mt-4">
                    <input
                      type="text"
                      value={replyText[review.reviewId] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [review.reviewId]: e.target.value }))}
                      placeholder="Write a reply..."
                      className="flex-1 px-5 py-3 bg-slate-900/80 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitReply(review.reviewId);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSubmitReply(review.reviewId)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
