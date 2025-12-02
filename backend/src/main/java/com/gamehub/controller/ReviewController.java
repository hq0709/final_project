package com.gamehub.controller;

import com.gamehub.model.Review;
import com.gamehub.model.ReviewReply;
import com.gamehub.service.ReviewService;
import com.gamehub.util.JwtUtil;
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
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

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
        List<Map<String, Object>> reviews = reviewService.getGameReviews(gameId, page, size);
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

            List<Map<String, Object>> reviews = reviewService.getUserReviews(userId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get recent reviews globally
     * GET /api/reviews/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentReviews(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> reviews = reviewService.getRecentReviews(limit);
        return ResponseEntity.ok(reviews);
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

            Review created = reviewService.createReview(userId, gameId, rating, reviewText, recommended);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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

            Integer rating = request.containsKey("rating") ? (Integer) request.get("rating") : null;
            String reviewText = request.containsKey("reviewText") ? (String) request.get("reviewText") : null;
            Boolean recommended = request.containsKey("recommended") ? (Boolean) request.get("recommended") : null;

            Review updated = reviewService.updateReview(userId, reviewId, rating, reviewText, recommended);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found") || e.getMessage().contains("unauthorized")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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

            reviewService.deleteReview(userId, reviewId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Review deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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
            // Just checking auth
            String token = authHeader.replace("Bearer ", "");
            jwtUtil.extractUserId(token);

            Boolean helpful = request.get("helpful");
            reviewService.voteReview(reviewId, helpful);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Vote recorded");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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

            Map<String, Object> response = reviewService.likeReview(userId, reviewId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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

            Map<String, Object> response = reviewService.unlikeReview(userId, reviewId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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

            Map<String, Object> response = reviewService.checkIfLiked(userId, reviewId);
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
            List<ReviewReply> replies = reviewService.getReviewReplies(reviewId);
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
            ReviewReply reply = reviewService.replyToReview(userId, reviewId, replyText);
            return ResponseEntity.status(HttpStatus.CREATED).body(reply);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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

            reviewService.deleteReply(userId, replyId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Reply deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
