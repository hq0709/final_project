package com.gametracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for leaderboard functionality
 */
@RestController
@RequestMapping("/leaderboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class LeaderboardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Get global leaderboard
     * GET /api/leaderboard?category=achievements|points|games
     */
    @GetMapping
    public ResponseEntity<?> getLeaderboard(@RequestParam(defaultValue = "achievements") String category) {
        try {
            String sql;
            
            switch (category) {
                case "points":
                    sql = """
                        SELECT 
                            u.user_id,
                            u.username,
                            u.display_name,
                            u.country,
                            u.total_achievements,
                            (SELECT COALESCE(SUM(a.points_value), 0) 
                             FROM USER_ACHIEVEMENT ua 
                             JOIN ACHIEVEMENT a ON ua.achievement_id = a.achievement_id
                             WHERE ua.user_id = u.user_id) as points,
                            (SELECT COUNT(DISTINCT game_id) FROM USER_GAME WHERE user_id = u.user_id) as games
                        FROM USER u
                        ORDER BY points DESC
                        LIMIT 100
                    """;
                    break;
                    
                case "games":
                    sql = """
                        SELECT 
                            u.user_id,
                            u.username,
                            u.display_name,
                            u.country,
                            u.total_achievements,
                            (SELECT COALESCE(SUM(a.points_value), 0) 
                             FROM USER_ACHIEVEMENT ua 
                             JOIN ACHIEVEMENT a ON ua.achievement_id = a.achievement_id
                             WHERE ua.user_id = u.user_id) as points,
                            (SELECT COUNT(DISTINCT game_id) FROM USER_GAME WHERE user_id = u.user_id) as games
                        FROM USER u
                        ORDER BY games DESC
                        LIMIT 100
                    """;
                    break;
                    
                default: // achievements
                    sql = """
                        SELECT 
                            u.user_id,
                            u.username,
                            u.display_name,
                            u.country,
                            u.total_achievements,
                            (SELECT COALESCE(SUM(a.points_value), 0) 
                             FROM USER_ACHIEVEMENT ua 
                             JOIN ACHIEVEMENT a ON ua.achievement_id = a.achievement_id
                             WHERE ua.user_id = u.user_id) as points,
                            (SELECT COUNT(DISTINCT game_id) FROM USER_GAME WHERE user_id = u.user_id) as games
                        FROM USER u
                        ORDER BY u.total_achievements DESC
                        LIMIT 100
                    """;
            }
            
            List<Map<String, Object>> leaderboard = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> entry = new HashMap<>();
                entry.put("rank", rowNum + 1);
                entry.put("userId", rs.getInt("user_id"));
                entry.put("username", rs.getString("username"));
                entry.put("displayName", rs.getString("display_name"));
                entry.put("country", rs.getString("country"));
                entry.put("achievements", rs.getInt("total_achievements"));
                entry.put("points", rs.getInt("points"));
                entry.put("games", rs.getInt("games"));
                return entry;
            });
            
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get community statistics
     * GET /api/leaderboard/stats
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

