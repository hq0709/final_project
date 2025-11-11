package com.gamehub.repository;

import com.gamehub.model.ReviewLike;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;

/**
 * Repository for ReviewLike entity
 */
@Repository
public class ReviewLikeRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<ReviewLike> rowMapper = (rs, rowNum) -> {
        ReviewLike like = new ReviewLike();
        like.setLikeId(rs.getInt("like_id"));
        like.setReviewId(rs.getInt("review_id"));
        like.setUserId(rs.getInt("user_id"));
        like.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return like;
    };

    /**
     * Add a like to a review
     */
    public ReviewLike addLike(Integer reviewId, Integer userId) {
        String sql = "INSERT INTO REVIEW_LIKE (review_id, user_id) VALUES (?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, reviewId);
            ps.setInt(2, userId);
            return ps;
        }, keyHolder);

        // Update likes_count in REVIEW table
        String updateSql = "UPDATE REVIEW SET likes_count = likes_count + 1 WHERE review_id = ?";
        jdbcTemplate.update(updateSql, reviewId);

        Integer likeId = keyHolder.getKey().intValue();
        return findById(likeId);
    }

    /**
     * Remove a like from a review
     */
    public void removeLike(Integer reviewId, Integer userId) {
        String sql = "DELETE FROM REVIEW_LIKE WHERE review_id = ? AND user_id = ?";
        int rowsAffected = jdbcTemplate.update(sql, reviewId, userId);

        // Update likes_count in REVIEW table (only if a like was actually removed)
        if (rowsAffected > 0) {
            String updateSql = "UPDATE REVIEW SET likes_count = GREATEST(0, likes_count - 1) WHERE review_id = ?";
            jdbcTemplate.update(updateSql, reviewId);
        }
    }

    /**
     * Check if user has liked a review
     */
    public boolean hasUserLiked(Integer reviewId, Integer userId) {
        String sql = "SELECT COUNT(*) FROM REVIEW_LIKE WHERE review_id = ? AND user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, reviewId, userId);
        return count != null && count > 0;
    }

    /**
     * Get like count for a review
     */
    public int getLikeCount(Integer reviewId) {
        String sql = "SELECT COUNT(*) FROM REVIEW_LIKE WHERE review_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, reviewId);
        return count != null ? count : 0;
    }

    /**
     * Find like by ID
     */
    public ReviewLike findById(Integer likeId) {
        String sql = "SELECT * FROM REVIEW_LIKE WHERE like_id = ?";
        return jdbcTemplate.queryForObject(sql, rowMapper, likeId);
    }

    /**
     * Get all users who liked a review
     */
    public java.util.List<Integer> getUsersWhoLiked(Integer reviewId) {
        String sql = "SELECT user_id FROM REVIEW_LIKE WHERE review_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.queryForList(sql, Integer.class, reviewId);
    }
}

