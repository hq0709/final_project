package com.gametracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for community activities
 */
@RestController
@RequestMapping("/community")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class CommunityController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Get recent community activities
     * GET /api/community/activities?limit=50
     */
    @GetMapping("/activities")
    public ResponseEntity<?> getRecentActivities(@RequestParam(defaultValue = "50") int limit) {
        try {
            // Get recent achievement unlocks
            String sql = """
                SELECT 
                    u.user_id,
                    u.username,
                    u.display_name,
                    'unlocked_achievement' as action,
                    g.title as game_title,
                    a.name as achievement_name,
                    ua.unlock_date as timestamp
                FROM USER_ACHIEVEMENT ua
                JOIN USER u ON ua.user_id = u.user_id
                JOIN ACHIEVEMENT a ON ua.achievement_id = a.achievement_id
                JOIN GAME g ON a.game_id = g.game_id
                ORDER BY ua.unlock_date DESC
                LIMIT ?
            """;
            
            List<Map<String, Object>> activities = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("userId", rs.getInt("user_id"));
                activity.put("username", rs.getString("username"));
                activity.put("displayName", rs.getString("display_name"));
                activity.put("action", rs.getString("action"));
                activity.put("gameTitle", rs.getString("game_title"));
                activity.put("achievementName", rs.getString("achievement_name"));
                activity.put("timestamp", rs.getTimestamp("timestamp").toString());
                return activity;
            }, limit);
            
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get community statistics
     * GET /api/community/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getCommunityStats() {
        try {
            String sql = """
                SELECT 
                    (SELECT COUNT(*) FROM USER) as total_players,
                    (SELECT COUNT(*) FROM GAME) as total_games,
                    (SELECT COUNT(*) FROM USER_ACHIEVEMENT) as total_achievements_unlocked,
                    (SELECT COALESCE(SUM(playtime_hours), 0) FROM USER_GAME) as total_hours_played
            """;
            
            Map<String, Object> stats = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Map<String, Object> result = new HashMap<>();
                result.put("totalPlayers", rs.getInt("total_players"));
                result.put("totalGames", rs.getInt("total_games"));
                result.put("totalAchievementsUnlocked", rs.getInt("total_achievements_unlocked"));
                result.put("totalHoursPlayed", rs.getDouble("total_hours_played"));
                return result;
            });
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

