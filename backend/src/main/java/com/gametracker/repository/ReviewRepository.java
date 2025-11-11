package com.gametracker.repository;

import com.gametracker.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Repository for Review entity
 */
@Repository
public class ReviewRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * RowMapper for Review entity
     */
    private final RowMapper<Review> reviewRowMapper = (rs, rowNum) -> {
        Review review = new Review();
        review.setReviewId(rs.getInt("review_id"));
        review.setUserId(rs.getInt("user_id"));
        review.setGameId(rs.getInt("game_id"));
        review.setRating(rs.getInt("rating"));
        review.setReviewText(rs.getString("review_text"));
        review.setHelpfulCount(rs.getInt("helpful_count"));

        // Handle optional fields
        try {
            review.setRecommended(rs.getBoolean("recommended"));
        } catch (Exception e) {
            review.setRecommended(review.getRating() >= 4); // Default based on rating
        }

        try {
            review.setNotHelpfulCount(rs.getInt("not_helpful_count"));
        } catch (Exception e) {
            review.setNotHelpfulCount(0);
        }

        try {
            Timestamp reviewDate = rs.getTimestamp("review_date");
            if (reviewDate != null) {
                review.setReviewDate(reviewDate.toLocalDateTime());
            }
        } catch (Exception e) {
            // Use created_date instead
            try {
                Timestamp createdDate = rs.getTimestamp("created_date");
                if (createdDate != null) {
                    review.setReviewDate(createdDate.toLocalDateTime());
                }
            } catch (Exception ex) {
                // Ignore
            }
        }

        try {
            Timestamp lastUpdated = rs.getTimestamp("last_updated");
            if (lastUpdated != null) {
                review.setLastUpdated(lastUpdated.toLocalDateTime());
            }
        } catch (Exception e) {
            // Use updated_date instead
            try {
                Timestamp updatedDate = rs.getTimestamp("updated_date");
                if (updatedDate != null) {
                    review.setLastUpdated(updatedDate.toLocalDateTime());
                }
            } catch (Exception ex) {
                // Ignore
            }
        }

        return review;
    };

    /**
     * Find reviews by game ID with user details
     */
    public List<Map<String, Object>> findByGameId(Integer gameId, int page, int size) {
        String sql = """
            SELECT
                r.review_id,
                r.user_id,
                r.game_id,
                r.rating,
                r.review_text,
                r.helpful_count,
                r.likes_count,
                r.replies_count,
                r.created_date,
                u.username,
                u.display_name,
                u.level,
                u.reviews_count
            FROM REVIEW r
            JOIN USER u ON r.user_id = u.user_id
            WHERE r.game_id = ?
            ORDER BY r.created_date DESC
            LIMIT ? OFFSET ?
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> result = new HashMap<>();
            result.put("reviewId", rs.getInt("review_id"));
            result.put("userId", rs.getInt("user_id"));
            result.put("gameId", rs.getInt("game_id"));
            result.put("username", rs.getString("username"));
            result.put("displayName", rs.getString("display_name"));
            result.put("userLevel", rs.getInt("level"));
            result.put("userReviewsCount", rs.getInt("reviews_count"));
            result.put("rating", rs.getInt("rating"));
            result.put("reviewText", rs.getString("review_text"));
            result.put("helpfulCount", rs.getInt("helpful_count"));
            result.put("likesCount", rs.getInt("likes_count"));
            result.put("repliesCount", rs.getInt("replies_count"));

            if (rs.getTimestamp("created_date") != null) {
                result.put("createdDate", rs.getTimestamp("created_date").toLocalDateTime().toString());
            }

            return result;
        }, gameId, size, page * size);
    }

    /**
     * Find reviews by user ID with game details
     */
    public List<Map<String, Object>> findByUserId(Integer userId) {
        String sql = """
            SELECT
                r.review_id,
                r.user_id,
                r.game_id,
                r.rating,
                r.review_text,
                r.helpful_count,
                r.likes_count,
                r.replies_count,
                r.created_date,
                g.title as game_title,
                g.cover_image_url
            FROM REVIEW r
            JOIN GAME g ON r.game_id = g.game_id
            WHERE r.user_id = ?
            ORDER BY r.created_date DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> result = new HashMap<>();
            result.put("reviewId", rs.getInt("review_id"));
            result.put("userId", rs.getInt("user_id"));
            result.put("gameId", rs.getInt("game_id"));
            result.put("gameTitle", rs.getString("game_title"));
            result.put("gameCoverUrl", rs.getString("cover_image_url"));
            result.put("rating", rs.getInt("rating"));
            result.put("reviewText", rs.getString("review_text"));
            result.put("helpfulCount", rs.getInt("helpful_count"));
            result.put("likesCount", rs.getInt("likes_count"));
            result.put("repliesCount", rs.getInt("replies_count"));

            if (rs.getTimestamp("created_date") != null) {
                result.put("createdDate", rs.getTimestamp("created_date").toLocalDateTime().toString());
            }

            return result;
        }, userId);
    }

    /**
     * Find review by ID
     */
    public Review findById(Integer reviewId) {
        String sql = "SELECT * FROM REVIEW WHERE review_id = ?";
        List<Review> results = jdbcTemplate.query(sql, reviewRowMapper, reviewId);
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Save new review
     */
    public Review save(Review review) {
        String sql = """
            INSERT INTO REVIEW (user_id, game_id, rating, review_text, helpful_count, likes_count, replies_count)
            VALUES (?, ?, ?, ?, 0, 0, 0)
        """;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, review.getUserId());
            ps.setInt(2, review.getGameId());
            ps.setInt(3, review.getRating());
            ps.setString(4, review.getReviewText());
            return ps;
        }, keyHolder);

        review.setReviewId(keyHolder.getKey().intValue());
        return findById(review.getReviewId());
    }

    /**
     * Update review
     */
    public Review update(Review review) {
        String sql = """
            UPDATE REVIEW
            SET rating = ?,
                review_text = ?,
                updated_date = CURRENT_TIMESTAMP
            WHERE review_id = ?
        """;

        jdbcTemplate.update(sql,
            review.getRating(),
            review.getReviewText(),
            review.getReviewId()
        );

        return findById(review.getReviewId());
    }

    /**
     * Delete review
     */
    public void delete(Integer reviewId) {
        String sql = "DELETE FROM REVIEW WHERE review_id = ?";
        jdbcTemplate.update(sql, reviewId);
    }

    /**
     * Vote on a review (mark as helpful)
     */
    public void voteReview(Integer reviewId, boolean helpful) {
        if (helpful) {
            String sql = "UPDATE REVIEW SET helpful_count = helpful_count + 1 WHERE review_id = ?";
            jdbcTemplate.update(sql, reviewId);
        }
    }

    /**
     * Update likes count
     */
    public void updateLikesCount(Integer reviewId, int delta) {
        String sql = "UPDATE REVIEW SET likes_count = likes_count + ? WHERE review_id = ?";
        jdbcTemplate.update(sql, delta, reviewId);
    }

    /**
     * Update replies count
     */
    public void updateRepliesCount(Integer reviewId, int delta) {
        String sql = "UPDATE REVIEW SET replies_count = replies_count + ? WHERE review_id = ?";
        jdbcTemplate.update(sql, delta, reviewId);
    }
}

