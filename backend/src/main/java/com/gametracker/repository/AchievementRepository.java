package com.gametracker.repository;

import com.gametracker.model.Achievement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Repository for Achievement entity
 */
@Repository
public class AchievementRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * RowMapper for Achievement entity
     */
    private final RowMapper<Achievement> achievementRowMapper = (rs, rowNum) -> {
        Achievement achievement = new Achievement();
        achievement.setAchievementId(rs.getInt("achievement_id"));
        achievement.setGameId(rs.getInt("game_id"));
        achievement.setName(rs.getString("name"));
        achievement.setDescription(rs.getString("description"));
        achievement.setIconUrl(rs.getString("icon_url"));
        achievement.setPointsValue(rs.getInt("points_value"));
        achievement.setRarityPercentage(rs.getDouble("rarity_percentage"));
        achievement.setIsHidden(rs.getBoolean("is_hidden"));
        return achievement;
    };

    /**
     * Find all achievements for a game
     */
    public List<Achievement> findByGameId(Integer gameId) {
        String sql = "SELECT * FROM ACHIEVEMENT WHERE game_id = ? ORDER BY points_value DESC, name";
        return jdbcTemplate.query(sql, achievementRowMapper, gameId);
    }

    /**
     * Get user's achievements for a game with unlock status
     */
    public List<Map<String, Object>> getUserAchievementsForGame(Integer userId, Integer gameId) {
        String sql = """
            SELECT 
                a.*,
                ua.unlock_date,
                CASE WHEN ua.user_achievement_id IS NOT NULL THEN TRUE ELSE FALSE END as unlocked
            FROM ACHIEVEMENT a
            LEFT JOIN USER_ACHIEVEMENT ua ON a.achievement_id = ua.achievement_id AND ua.user_id = ?
            WHERE a.game_id = ?
            ORDER BY unlocked DESC, a.points_value DESC, a.name
        """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> result = new HashMap<>();
            result.put("achievementId", rs.getInt("achievement_id"));
            result.put("gameId", rs.getInt("game_id"));
            result.put("name", rs.getString("name"));
            result.put("description", rs.getString("description"));
            result.put("iconUrl", rs.getString("icon_url"));
            result.put("pointsValue", rs.getInt("points_value"));
            result.put("rarityPercentage", rs.getDouble("rarity_percentage"));
            result.put("isHidden", rs.getBoolean("is_hidden"));
            result.put("unlocked", rs.getBoolean("unlocked"));
            
            if (rs.getTimestamp("unlock_date") != null) {
                result.put("unlockDate", rs.getTimestamp("unlock_date").toLocalDateTime().toString());
            }
            
            return result;
        }, userId, gameId);
    }

    /**
     * Get achievement progress for a game
     */
    public Map<String, Object> getAchievementProgress(Integer userId, Integer gameId) {
        String sql = """
            SELECT 
                COUNT(*) as total_achievements,
                SUM(CASE WHEN ua.user_achievement_id IS NOT NULL THEN 1 ELSE 0 END) as unlocked_achievements,
                SUM(a.points_value) as total_points,
                SUM(CASE WHEN ua.user_achievement_id IS NOT NULL THEN a.points_value ELSE 0 END) as earned_points
            FROM ACHIEVEMENT a
            LEFT JOIN USER_ACHIEVEMENT ua ON a.achievement_id = ua.achievement_id AND ua.user_id = ?
            WHERE a.game_id = ?
        """;
        
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            Map<String, Object> progress = new HashMap<>();
            int total = rs.getInt("total_achievements");
            int unlocked = rs.getInt("unlocked_achievements");
            progress.put("totalAchievements", total);
            progress.put("unlockedAchievements", unlocked);
            progress.put("completionPercentage", total > 0 ? (unlocked * 100.0 / total) : 0);
            progress.put("totalPoints", rs.getInt("total_points"));
            progress.put("earnedPoints", rs.getInt("earned_points"));
            return progress;
        }, userId, gameId);
    }

    /**
     * Unlock an achievement for a user
     */
    public boolean unlockAchievement(Integer userId, Integer achievementId) {
        // Check if already unlocked
        String checkSql = "SELECT COUNT(*) FROM USER_ACHIEVEMENT WHERE user_id = ? AND achievement_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, achievementId);

        if (count != null && count > 0) {
            return false; // Already unlocked
        }

        // Check if achievement exists
        String checkAchievementSql = "SELECT COUNT(*) FROM ACHIEVEMENT WHERE achievement_id = ?";
        Integer achievementCount = jdbcTemplate.queryForObject(checkAchievementSql, Integer.class, achievementId);

        if (achievementCount == null || achievementCount == 0) {
            return false; // Achievement not found
        }

        // Unlock the achievement (USER_ACHIEVEMENT table doesn't have game_id column)
        String insertSql = """
            INSERT INTO USER_ACHIEVEMENT (user_id, achievement_id, unlock_date)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """;

        jdbcTemplate.update(insertSql, userId, achievementId);
        return true;
    }

    /**
     * Get user's recent achievements
     */
    public List<Map<String, Object>> getRecentAchievements(Integer userId, int limit) {
        String sql = """
            SELECT
                ua.user_achievement_id,
                ua.unlock_date,
                a.achievement_id,
                a.game_id,
                a.name,
                a.description,
                a.icon_url,
                a.points_value,
                a.rarity_percentage,
                g.title as game_title,
                g.cover_image_url
            FROM USER_ACHIEVEMENT ua
            JOIN ACHIEVEMENT a ON ua.achievement_id = a.achievement_id
            JOIN GAME g ON a.game_id = g.game_id
            WHERE ua.user_id = ?
            ORDER BY ua.unlock_date DESC
            LIMIT ?
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> result = new HashMap<>();
            result.put("achievementId", rs.getInt("achievement_id"));
            result.put("name", rs.getString("name"));
            result.put("description", rs.getString("description"));
            result.put("iconUrl", rs.getString("icon_url"));
            result.put("pointsValue", rs.getInt("points_value"));
            result.put("rarityPercentage", rs.getDouble("rarity_percentage"));
            result.put("gameId", rs.getInt("game_id"));
            result.put("gameTitle", rs.getString("game_title"));
            result.put("gameCoverUrl", rs.getString("cover_image_url"));
            result.put("unlockDate", rs.getTimestamp("unlock_date").toLocalDateTime().toString());
            return result;
        }, userId, limit);
    }

    /**
     * Get user's rarest achievements
     */
    public List<Map<String, Object>> getRarestAchievements(Integer userId, int limit) {
        String sql = """
            SELECT
                ua.user_achievement_id,
                ua.unlock_date,
                a.achievement_id,
                a.game_id,
                a.name,
                a.description,
                a.icon_url,
                a.points_value,
                a.rarity_percentage,
                g.title as game_title,
                g.cover_image_url
            FROM USER_ACHIEVEMENT ua
            JOIN ACHIEVEMENT a ON ua.achievement_id = a.achievement_id
            JOIN GAME g ON a.game_id = g.game_id
            WHERE ua.user_id = ?
            ORDER BY a.rarity_percentage ASC
            LIMIT ?
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> result = new HashMap<>();
            result.put("achievementId", rs.getInt("achievement_id"));
            result.put("name", rs.getString("name"));
            result.put("description", rs.getString("description"));
            result.put("iconUrl", rs.getString("icon_url"));
            result.put("pointsValue", rs.getInt("points_value"));
            result.put("rarityPercentage", rs.getDouble("rarity_percentage"));
            result.put("gameId", rs.getInt("game_id"));
            result.put("gameTitle", rs.getString("game_title"));
            result.put("gameCoverUrl", rs.getString("cover_image_url"));
            result.put("unlockDate", rs.getTimestamp("unlock_date").toLocalDateTime().toString());
            return result;
        }, userId, limit);
    }

    /**
     * Get all user's achievements
     */
    public List<Map<String, Object>> getAllUserAchievements(Integer userId) {
        String sql = """
            SELECT
                ua.user_achievement_id,
                ua.unlock_date,
                a.achievement_id,
                a.game_id,
                a.name,
                a.description,
                a.icon_url,
                a.points_value,
                a.rarity_percentage,
                g.title as game_title,
                g.cover_image_url
            FROM USER_ACHIEVEMENT ua
            JOIN ACHIEVEMENT a ON ua.achievement_id = a.achievement_id
            JOIN GAME g ON a.game_id = g.game_id
            WHERE ua.user_id = ?
            ORDER BY ua.unlock_date DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> result = new HashMap<>();
            result.put("userAchievementId", rs.getInt("user_achievement_id"));
            result.put("achievementId", rs.getInt("achievement_id"));
            result.put("title", rs.getString("name"));
            result.put("name", rs.getString("name"));
            result.put("description", rs.getString("description"));
            result.put("iconUrl", rs.getString("icon_url"));
            result.put("pointsValue", rs.getInt("points_value"));
            result.put("rarityPercentage", rs.getDouble("rarity_percentage"));
            result.put("gameId", rs.getInt("game_id"));
            result.put("gameName", rs.getString("game_title"));
            result.put("gameTitle", rs.getString("game_title"));
            result.put("gameCoverUrl", rs.getString("cover_image_url"));
            result.put("unlockDate", rs.getTimestamp("unlock_date").toLocalDateTime().toString());
            return result;
        }, userId);
    }
}

