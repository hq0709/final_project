package com.gamehub.repository;

import com.gamehub.model.ReviewReply;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

/**
 * Repository for ReviewReply entity
 */
@Repository
public class ReviewReplyRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<ReviewReply> rowMapper = (rs, rowNum) -> {
        ReviewReply reply = new ReviewReply();
        reply.setReplyId(rs.getInt("reply_id"));
        reply.setReviewId(rs.getInt("review_id"));
        reply.setUserId(rs.getInt("user_id"));
        reply.setReplyText(rs.getString("reply_text"));
        reply.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        
        // User info if joined
        try {
            reply.setUsername(rs.getString("username"));
            reply.setDisplayName(rs.getString("display_name"));
            reply.setAvatarUrl(rs.getString("avatar_url"));
        } catch (Exception e) {
            // Columns not present in query
        }
        
        return reply;
    };

    /**
     * Add a reply to a review
     */
    public ReviewReply addReply(Integer reviewId, Integer userId, String replyText) {
        String sql = "INSERT INTO REVIEW_REPLY (review_id, user_id, reply_text) VALUES (?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, reviewId);
            ps.setInt(2, userId);
            ps.setString(3, replyText);
            return ps;
        }, keyHolder);

        // Update replies_count in REVIEW table
        String updateSql = "UPDATE REVIEW SET replies_count = replies_count + 1 WHERE review_id = ?";
        jdbcTemplate.update(updateSql, reviewId);

        Integer replyId = keyHolder.getKey().intValue();
        return findById(replyId);
    }

    /**
     * Get all replies for a review with user info
     */
    public List<ReviewReply> getRepliesByReviewId(Integer reviewId) {
        String sql = """
            SELECT 
                rr.reply_id,
                rr.review_id,
                rr.user_id,
                rr.reply_text,
                rr.created_at,
                u.username,
                u.display_name,
                u.avatar_url
            FROM REVIEW_REPLY rr
            JOIN USER u ON rr.user_id = u.user_id
            WHERE rr.review_id = ?
            ORDER BY rr.created_at ASC
        """;
        
        return jdbcTemplate.query(sql, rowMapper, reviewId);
    }

    /**
     * Get reply count for a review
     */
    public int getReplyCount(Integer reviewId) {
        String sql = "SELECT COUNT(*) FROM REVIEW_REPLY WHERE review_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, reviewId);
        return count != null ? count : 0;
    }

    /**
     * Find reply by ID
     */
    public ReviewReply findById(Integer replyId) {
        String sql = "SELECT * FROM REVIEW_REPLY WHERE reply_id = ?";
        return jdbcTemplate.queryForObject(sql, rowMapper, replyId);
    }

    /**
     * Delete a reply
     */
    public void delete(Integer replyId) {
        // First get the review_id before deleting
        String getReviewIdSql = "SELECT review_id FROM REVIEW_REPLY WHERE reply_id = ?";
        Integer reviewId = null;
        try {
            reviewId = jdbcTemplate.queryForObject(getReviewIdSql, Integer.class, replyId);
        } catch (Exception e) {
            // Reply not found
        }

        String sql = "DELETE FROM REVIEW_REPLY WHERE reply_id = ?";
        int rowsAffected = jdbcTemplate.update(sql, replyId);

        // Update replies_count in REVIEW table (only if a reply was actually deleted)
        if (rowsAffected > 0 && reviewId != null) {
            String updateSql = "UPDATE REVIEW SET replies_count = GREATEST(0, replies_count - 1) WHERE review_id = ?";
            jdbcTemplate.update(updateSql, reviewId);
        }
    }

    /**
     * Get all replies by a user
     */
    public List<ReviewReply> getRepliesByUserId(Integer userId) {
        String sql = """
            SELECT 
                rr.reply_id,
                rr.review_id,
                rr.user_id,
                rr.reply_text,
                rr.created_at
            FROM REVIEW_REPLY rr
            WHERE rr.user_id = ?
            ORDER BY rr.created_at DESC
        """;
        
        return jdbcTemplate.query(sql, rowMapper, userId);
    }
}

