package com.gamehub.repository;

import com.gamehub.model.UserGame;
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
 * Repository for UserGame entity
 */
@Repository
public class UserGameRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * RowMapper for UserGame entity
     */
    private final RowMapper<UserGame> userGameRowMapper = (rs, rowNum) -> {
        UserGame userGame = new UserGame();
        userGame.setUserGameId(rs.getInt("user_game_id"));
        userGame.setUserId(rs.getInt("user_id"));
        userGame.setGameId(rs.getInt("game_id"));
        userGame.setPlatformId(rs.getInt("platform_id"));
        userGame.setPlaytimeHours(rs.getDouble("playtime_hours"));
        userGame.setCompletionPercentage(rs.getDouble("completion_percentage"));
        userGame.setStatus(rs.getString("status"));
        
        if (rs.getDate("ownership_date") != null) {
            userGame.setOwnershipDate(rs.getDate("ownership_date").toLocalDate());
        }
        
        Timestamp lastPlayed = rs.getTimestamp("last_played");
        if (lastPlayed != null) {
            userGame.setLastPlayed(lastPlayed.toLocalDateTime());
        }
        
        return userGame;
    };

    /**
     * Get user's library with game details
     */
    public List<Map<String, Object>> getUserLibraryWithDetails(Integer userId) {
        String sql = """
            SELECT
                ug.user_game_id,
                ug.user_id,
                ug.game_id,
                ug.platform_id,
                ug.playtime_hours,
                ug.completion_percentage,
                ug.status,
                ug.ownership_date,
                ug.last_played,
                g.title,
                g.description,
                g.cover_image_url,
                g.developer,
                g.publisher,
                g.total_achievements,
                g.metacritic_score,
                p.name as platform_name,
                (SELECT COUNT(*) FROM USER_ACHIEVEMENT ua
                 JOIN ACHIEVEMENT a ON ua.achievement_id = a.achievement_id
                 WHERE ua.user_id = ug.user_id AND a.game_id = ug.game_id) as unlocked_achievements
            FROM USER_GAME ug
            JOIN GAME g ON ug.game_id = g.game_id
            LEFT JOIN PLATFORM p ON ug.platform_id = p.platform_id
            WHERE ug.user_id = ?
            ORDER BY ug.last_played DESC, ug.ownership_date DESC
        """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> result = new HashMap<>();
            result.put("userGameId", rs.getInt("user_game_id"));
            result.put("gameId", rs.getInt("game_id"));
            result.put("title", rs.getString("title"));
            result.put("description", rs.getString("description"));
            result.put("coverImageUrl", rs.getString("cover_image_url"));
            result.put("developer", rs.getString("developer"));
            result.put("publisher", rs.getString("publisher"));
            result.put("playtimeHours", rs.getDouble("playtime_hours"));
            result.put("completionPercentage", rs.getDouble("completion_percentage"));
            result.put("status", rs.getString("status"));
            result.put("platformName", rs.getString("platform_name"));
            result.put("totalAchievements", rs.getInt("total_achievements"));
            result.put("unlockedAchievements", rs.getInt("unlocked_achievements"));
            result.put("metacriticScore", rs.getInt("metacritic_score"));
            
            if (rs.getDate("ownership_date") != null) {
                result.put("ownershipDate", rs.getDate("ownership_date").toLocalDate().toString());
            }
            if (rs.getTimestamp("last_played") != null) {
                result.put("lastPlayed", rs.getTimestamp("last_played").toLocalDateTime().toString());
            }
            
            return result;
        }, userId);
    }

    /**
     * Get library statistics
     */
    public Map<String, Object> getLibraryStats(Integer userId) {
        String sql = """
            SELECT 
                COUNT(*) as total_games,
                SUM(CASE WHEN status = 'playing' THEN 1 ELSE 0 END) as playing,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'wishlist' THEN 1 ELSE 0 END) as wishlist,
                SUM(playtime_hours) as total_playtime,
                AVG(completion_percentage) as avg_completion
            FROM USER_GAME
            WHERE user_id = ?
        """;
        
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalGames", rs.getInt("total_games"));
            stats.put("playing", rs.getInt("playing"));
            stats.put("completed", rs.getInt("completed"));
            stats.put("wishlist", rs.getInt("wishlist"));
            stats.put("totalPlaytime", rs.getDouble("total_playtime"));
            stats.put("avgCompletion", rs.getDouble("avg_completion"));
            return stats;
        }, userId);
    }

    /**
     * Find user game by user and game ID
     */
    public UserGame findByUserAndGame(Integer userId, Integer gameId) {
        String sql = "SELECT * FROM USER_GAME WHERE user_id = ? AND game_id = ?";
        List<UserGame> results = jdbcTemplate.query(sql, userGameRowMapper, userId, gameId);
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Find user game by ID
     */
    public UserGame findById(Integer userGameId) {
        String sql = "SELECT * FROM USER_GAME WHERE user_game_id = ?";
        List<UserGame> results = jdbcTemplate.query(sql, userGameRowMapper, userGameId);
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Save new user game
     */
    public UserGame save(UserGame userGame) {
        String sql = """
            INSERT INTO USER_GAME (user_id, game_id, platform_id, playtime_hours, 
                                   completion_percentage, status, ownership_date)
            VALUES (?, ?, ?, ?, ?, ?, CURDATE())
        """;
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, userGame.getUserId());
            ps.setInt(2, userGame.getGameId());
            if (userGame.getPlatformId() != null) {
                ps.setInt(3, userGame.getPlatformId());
            } else {
                ps.setNull(3, java.sql.Types.INTEGER);
            }
            ps.setDouble(4, userGame.getPlaytimeHours());
            ps.setDouble(5, userGame.getCompletionPercentage());
            ps.setString(6, userGame.getStatus());
            return ps;
        }, keyHolder);
        
        userGame.setUserGameId(keyHolder.getKey().intValue());
        return userGame;
    }

    /**
     * Update user game
     */
    public UserGame update(UserGame userGame) {
        String sql = """
            UPDATE USER_GAME 
            SET playtime_hours = ?, 
                completion_percentage = ?, 
                status = ?,
                last_played = CURRENT_TIMESTAMP
            WHERE user_game_id = ?
        """;
        
        jdbcTemplate.update(sql,
            userGame.getPlaytimeHours(),
            userGame.getCompletionPercentage(),
            userGame.getStatus(),
            userGame.getUserGameId()
        );
        
        return findById(userGame.getUserGameId());
    }

    /**
     * Delete user game
     */
    public void delete(Integer userGameId) {
        String sql = "DELETE FROM USER_GAME WHERE user_game_id = ?";
        jdbcTemplate.update(sql, userGameId);
    }
}

