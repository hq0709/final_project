package com.gamehub.service;

import com.gamehub.model.Review;
import com.gamehub.model.ReviewReply;
import com.gamehub.repository.ActivityRepository;
import com.gamehub.repository.ReviewLikeRepository;
import com.gamehub.repository.ReviewReplyRepository;
import com.gamehub.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

    @Autowired
    private ReviewReplyRepository reviewReplyRepository;

    @Autowired
    private ActivityRepository activityRepository;

    public List<Map<String, Object>> getGameReviews(Integer gameId, int page, int size) {
        return reviewRepository.findByGameId(gameId, page, size);
    }

    public List<Map<String, Object>> getUserReviews(Integer userId) {
        return reviewRepository.findByUserId(userId);
    }

    public List<Map<String, Object>> getRecentReviews(int limit) {
        return reviewRepository.getRecentReviews(limit);
    }

    @Transactional
    public Review createReview(Integer userId, Integer gameId, Integer rating, String reviewText, Boolean recommended) {
        if (gameId == null || rating == null || rating < 1 || rating > 10) {
            throw new IllegalArgumentException("Invalid input: gameId and rating (1-10) are required");
        }

        Review review = new Review();
        review.setUserId(userId);
        review.setGameId(gameId);
        review.setRating(rating);
        review.setReviewText(reviewText);
        review.setRecommended(recommended);

        Review created = reviewRepository.save(review);

        // Create activity for the review
        try {
            String activityText = "wrote a review for";
            activityRepository.createActivity(userId, "post_review", gameId, created.getReviewId(), activityText);
        } catch (Exception e) {
            // Log but don't fail the request if activity creation fails
            System.err.println("Failed to create activity: " + e.getMessage());
        }

        return created;
    }

    @Transactional
    public Review updateReview(Integer userId, Integer reviewId, Integer rating, String reviewText,
            Boolean recommended) {
        Review review = reviewRepository.findById(reviewId);
        if (review == null || !review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Review not found or unauthorized");
        }

        if (rating != null) {
            review.setRating(rating);
        }
        if (reviewText != null) {
            review.setReviewText(reviewText);
        }
        if (recommended != null) {
            review.setRecommended(recommended);
        }

        return reviewRepository.update(review);
    }

    @Transactional
    public void deleteReview(Integer userId, Integer reviewId) {
        Review review = reviewRepository.findById(reviewId);
        if (review == null || !review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Review not found or unauthorized");
        }
        reviewRepository.delete(reviewId);
    }

    @Transactional
    public void voteReview(Integer reviewId, Boolean helpful) {
        if (helpful == null) {
            throw new IllegalArgumentException("helpful field is required");
        }
        reviewRepository.voteReview(reviewId, helpful);
    }

    @Transactional
    public Map<String, Object> likeReview(Integer userId, Integer reviewId) {
        // Check if already liked
        if (reviewLikeRepository.hasUserLiked(reviewId, userId)) {
            throw new IllegalArgumentException("You have already liked this review");
        }

        reviewLikeRepository.addLike(reviewId, userId);

        // Create activity for the like
        try {
            Review review = reviewRepository.findById(reviewId);
            if (review != null) {
                String activityText = "liked a review for";
                activityRepository.createActivity(userId, "like_review", review.getGameId(), reviewId, activityText);
            }
        } catch (Exception e) {
            System.err.println("Failed to create activity: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Review liked successfully");
        response.put("likesCount", reviewLikeRepository.getLikeCount(reviewId));
        return response;
    }

    @Transactional
    public Map<String, Object> unlikeReview(Integer userId, Integer reviewId) {
        reviewLikeRepository.removeLike(reviewId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Like removed successfully");
        response.put("likesCount", reviewLikeRepository.getLikeCount(reviewId));
        return response;
    }

    public Map<String, Object> checkIfLiked(Integer userId, Integer reviewId) {
        boolean liked = reviewLikeRepository.hasUserLiked(reviewId, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likesCount", reviewLikeRepository.getLikeCount(reviewId));
        return response;
    }

    public List<ReviewReply> getReviewReplies(Integer reviewId) {
        return reviewReplyRepository.getRepliesByReviewId(reviewId);
    }

    @Transactional
    public ReviewReply replyToReview(Integer userId, Integer reviewId, String replyText) {
        if (replyText == null || replyText.trim().isEmpty()) {
            throw new IllegalArgumentException("Reply text is required");
        }

        ReviewReply reply = reviewReplyRepository.addReply(reviewId, userId, replyText);

        // Create activity for the reply
        try {
            Review review = reviewRepository.findById(reviewId);
            if (review != null) {
                String activityText = "replied to a review for";
                activityRepository.createActivity(userId, "reply_review", review.getGameId(), reviewId, activityText);
            }
        } catch (Exception e) {
            System.err.println("Failed to create activity: " + e.getMessage());
        }

        return reply;
    }

    @Transactional
    public void deleteReply(Integer userId, Integer replyId) {
        ReviewReply reply = reviewReplyRepository.findById(replyId);
        if (reply == null || !reply.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Reply not found or unauthorized");
        }
        reviewReplyRepository.delete(replyId);
    }
}
