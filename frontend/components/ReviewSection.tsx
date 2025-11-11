'use client';

import { useState, useEffect } from 'react';
import { reviewsAPI, Review, ReviewReply } from '@/lib/api';

interface ReviewSectionProps {
  gameId: number;
}

export default function ReviewSection({ gameId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
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
    if (!reviewText.trim()) return;

    try {
      setSubmitting(true);
      await reviewsAPI.createReview({
        gameId,
        rating,
        reviewText: reviewText.trim(),
      });
      setReviewText('');
      setRating(5);
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
      <div className="text-center py-8">
        <p className="text-gray-400">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Reviews ({reviews.length})
        </h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
        >
          {showReviewForm ? 'Cancel' : '✍️ Write Review'}
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 min-h-[120px]"
              placeholder="Share your thoughts about this game..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-500/20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
            <p className="text-gray-400">Be the first to review this game!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.reviewId}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">
                      {review.displayName || review.username || 'Anonymous'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-400">
                      {formatTimeAgo(review.createdDate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-300 mb-4">{review.reviewText}</p>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLikeToggle(review.reviewId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    likedReviews.has(review.reviewId)
                      ? 'bg-red-600/20 text-red-400'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  }`}
                >
                  <span>{likedReviews.has(review.reviewId) ? '❤️' : '🤍'}</span>
                  <span>{review.likesCount || 0}</span>
                </button>
                <button
                  onClick={() => handleToggleReplies(review.reviewId)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-400 rounded-lg transition-colors"
                >
                  <span>💬</span>
                  <span>{review.repliesCount || 0}</span>
                </button>
              </div>

              {/* Replies Section */}
              {expandedReview === review.reviewId && (
                <div className="mt-4 pl-6 border-l-2 border-purple-500/30 space-y-3">
                  {replies[review.reviewId]?.map((reply) => (
                    <div key={reply.replyId} className="bg-slate-900/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white text-sm">
                          {reply.displayName || reply.username}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{reply.replyText}</p>
                    </div>
                  ))}
                  
                  {/* Reply Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText[review.reviewId] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [review.reviewId]: e.target.value }))}
                      placeholder="Write a reply..."
                      className="flex-1 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitReply(review.reviewId);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSubmitReply(review.reviewId)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
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

