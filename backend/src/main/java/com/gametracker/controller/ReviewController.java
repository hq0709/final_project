package com.gametracker.controller;

import com.gametracker.model.Review;
import com.gametracker.model.ReviewReply;
import com.gametracker.repository.ReviewRepository;
import com.gametracker.repository.ReviewLikeRepository;
import com.gametracker.repository.ReviewReplyRepository;
import com.gametracker.repository.ActivityRepository;
import com.gametracker.repository.GameRepository;
import com.gametracker.model.Game;
import com.gametracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for review-related endpoints
 */
@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

    @Autowired
    private ReviewReplyRepository reviewReplyRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Get reviews for a game
     * GET /api/reviews/game/{gameId}
     */
    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<Map<String, Object>>> getGameReviews(
            @PathVariable Integer gameId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<Map<String, Object>> reviews = reviewRepository.findByGameId(gameId, page, size);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get user's reviews
     * GET /api/reviews/user
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUserReviews(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            List<Map<String, Object>> reviews = reviewRepository.findByUserId(userId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Create a review
     * POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            Integer gameId = (Integer) request.get("gameId");
            Integer rating = (Integer) request.get("rating");
            String reviewText = (String) request.get("reviewText");
            Boolean recommended = (Boolean) request.getOrDefault("recommended", true);

            // Validate
            if (gameId == null || rating == null || rating < 1 || rating > 10) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid input: gameId and rating (1-10) are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
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

            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update a review
     * PUT /api/reviews/{reviewId}
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer reviewId,
            @RequestBody Map<String, Object> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            Review review = reviewRepository.findById(reviewId);
            if (review == null || !review.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            if (request.containsKey("rating")) {
                review.setRating((Integer) request.get("rating"));
            }
            if (request.containsKey("reviewText")) {
                review.setReviewText((String) request.get("reviewText"));
            }
            if (request.containsKey("recommended")) {
                review.setRecommended((Boolean) request.get("recommended"));
            }
            
            Review updated = reviewRepository.update(review);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete a review
     * DELETE /api/reviews/{reviewId}
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer reviewId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            Review review = reviewRepository.findById(reviewId);
            if (review == null || !review.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            reviewRepository.delete(reviewId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Review deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Vote on a review (helpful/not helpful)
     * POST /api/reviews/{reviewId}/vote
     */
    @PostMapping("/{reviewId}/vote")
    public ResponseEntity<?> voteReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer reviewId,
            @RequestBody Map<String, Boolean> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            Boolean helpful = request.get("helpful");
            if (helpful == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "helpful field is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            reviewRepository.voteReview(reviewId, helpful);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Vote recorded");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Like a review
     * POST /api/reviews/{reviewId}/like
     */
    @PostMapping("/{reviewId}/like")
    public ResponseEntity<?> likeReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer reviewId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            // Check if already liked
            if (reviewLikeRepository.hasUserLiked(reviewId, userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You have already liked this review");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
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
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Unlike a review
     * DELETE /api/reviews/{reviewId}/like
     */
    @DeleteMapping("/{reviewId}/like")
    public ResponseEntity<?> unlikeReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer reviewId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            reviewLikeRepository.removeLike(reviewId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Like removed successfully");
            response.put("likesCount", reviewLikeRepository.getLikeCount(reviewId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Check if user has liked a review
     * GET /api/reviews/{reviewId}/liked
     */
    @GetMapping("/{reviewId}/liked")
    public ResponseEntity<?> checkIfLiked(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer reviewId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            boolean liked = reviewLikeRepository.hasUserLiked(reviewId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("liked", liked);
            response.put("likesCount", reviewLikeRepository.getLikeCount(reviewId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get replies for a review
     * GET /api/reviews/{reviewId}/replies
     */
    @GetMapping("/{reviewId}/replies")
    public ResponseEntity<?> getReviewReplies(@PathVariable Integer reviewId) {
        try {
            List<ReviewReply> replies = reviewReplyRepository.getRepliesByReviewId(reviewId);
            return ResponseEntity.ok(replies);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Reply to a review
     * POST /api/reviews/{reviewId}/reply
     */
    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<?> replyToReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer reviewId,
            @RequestBody Map<String, String> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            String replyText = request.get("replyText");
            if (replyText == null || replyText.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Reply text is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
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

            return ResponseEntity.status(HttpStatus.CREATED).body(reply);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete a reply
     * DELETE /api/reviews/replies/{replyId}
     */
    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<?> deleteReply(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer replyId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            ReviewReply reply = reviewReplyRepository.findById(replyId);
            if (reply == null || !reply.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            reviewReplyRepository.delete(replyId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Reply deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

