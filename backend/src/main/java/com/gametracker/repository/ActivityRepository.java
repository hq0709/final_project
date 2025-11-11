package com.gametracker.repository;

import com.gametracker.model.Activity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Activity entity
 */
@Repository
public class ActivityRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Activity> rowMapper = (rs, rowNum) -> {
        Activity activity = new Activity();
        activity.setActivityId(rs.getInt("activity_id"));
        activity.setUserId(rs.getInt("user_id"));
        activity.setActivityType(rs.getString("activity_type"));
        
        // Nullable fields
        try {
            activity.setGameId(rs.getInt("game_id"));
        } catch (Exception e) {
            activity.setGameId(null);
        }
        
        try {
            activity.setReviewId(rs.getInt("review_id"));
        } catch (Exception e) {
            activity.setReviewId(null);
        }
        
        activity.setActivityText(rs.getString("activity_text"));
        activity.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        
        // User and game info if joined
        try {
            activity.setUsername(rs.getString("username"));
            activity.setDisplayName(rs.getString("display_name"));
            activity.setAvatarUrl(rs.getString("avatar_url"));
            activity.setGameTitle(rs.getString("game_title"));
            activity.setGameCoverUrl(rs.getString("game_cover_url"));
        } catch (Exception e) {
            // Columns not present in query
        }
        
        return activity;
    };

    /**
     * Get recent community activities
     */
    public List<Activity> getRecentActivities(int limit) {
        String sql = """
            SELECT 
                a.activity_id,
                a.user_id,
                a.activity_type,
                a.game_id,
                a.review_id,
                a.activity_text,
                a.created_at,
                u.username,
                u.display_name,
                u.avatar_url,
                g.title as game_title,
                g.cover_image_url as game_cover_url
            FROM ACTIVITY a
            JOIN USER u ON a.user_id = u.user_id
            LEFT JOIN GAME g ON a.game_id = g.game_id
            ORDER BY a.created_at DESC
            LIMIT ?
        """;
        
        return jdbcTemplate.query(sql, rowMapper, limit);
    }

    /**
     * Get activities by user
     */
    public List<Activity> getActivitiesByUserId(Integer userId, int limit) {
        String sql = """
            SELECT 
                a.activity_id,
                a.user_id,
                a.activity_type,
                a.game_id,
                a.review_id,
                a.activity_text,
                a.created_at,
                u.username,
                u.display_name,
                u.avatar_url,
                g.title as game_title,
                g.cover_image_url as game_cover_url
            FROM ACTIVITY a
            JOIN USER u ON a.user_id = u.user_id
            LEFT JOIN GAME g ON a.game_id = g.game_id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT ?
        """;
        
        return jdbcTemplate.query(sql, rowMapper, userId, limit);
    }

    /**
     * Get activities by type
     */
    public List<Activity> getActivitiesByType(String activityType, int limit) {
        String sql = """
            SELECT 
                a.activity_id,
                a.user_id,
                a.activity_type,
                a.game_id,
                a.review_id,
                a.activity_text,
                a.created_at,
                u.username,
                u.display_name,
                u.avatar_url,
                g.title as game_title,
                g.cover_image_url as game_cover_url
            FROM ACTIVITY a
            JOIN USER u ON a.user_id = u.user_id
            LEFT JOIN GAME g ON a.game_id = g.game_id
            WHERE a.activity_type = ?
            ORDER BY a.created_at DESC
            LIMIT ?
        """;
        
        return jdbcTemplate.query(sql, rowMapper, activityType, limit);
    }

    /**
     * Get activities for a specific game
     */
    public List<Activity> getActivitiesByGameId(Integer gameId, int limit) {
        String sql = """
            SELECT 
                a.activity_id,
                a.user_id,
                a.activity_type,
                a.game_id,
                a.review_id,
                a.activity_text,
                a.created_at,
                u.username,
                u.display_name,
                u.avatar_url,
                g.title as game_title,
                g.cover_image_url as game_cover_url
            FROM ACTIVITY a
            JOIN USER u ON a.user_id = u.user_id
            LEFT JOIN GAME g ON a.game_id = g.game_id
            WHERE a.game_id = ?
            ORDER BY a.created_at DESC
            LIMIT ?
        """;
        
        return jdbcTemplate.query(sql, rowMapper, gameId, limit);
    }

    /**
     * Create a new activity (manual creation, triggers handle most cases)
     */
    public void createActivity(Integer userId, String activityType, Integer gameId, 
                               Integer reviewId, String activityText) {
        String sql = """
            INSERT INTO ACTIVITY (user_id, activity_type, game_id, review_id, activity_text)
            VALUES (?, ?, ?, ?, ?)
        """;
        
        jdbcTemplate.update(sql, userId, activityType, gameId, reviewId, activityText);
    }

    /**
     * Delete activities older than specified days
     */
    public void deleteOldActivities(int days) {
        String sql = "DELETE FROM ACTIVITY WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
        jdbcTemplate.update(sql, days);
    }
}

