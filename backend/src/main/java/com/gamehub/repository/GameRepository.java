package com.gamehub.repository;

import com.gamehub.model.Game;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Repository for Game entity using JDBC
 */
@Repository
public class GameRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Game> gameRowMapper = (rs, rowNum) -> {
        Game game = new Game();
        game.setGameId(rs.getInt("game_id"));
        game.setTitle(rs.getString("title"));
        game.setDescription(rs.getString("description"));

        Date releaseDate = rs.getDate("release_date");
        if (releaseDate != null) {
            game.setReleaseDate(releaseDate.toLocalDate());
        }

        game.setDeveloper(rs.getString("developer"));
        game.setPublisher(rs.getString("publisher"));
        game.setCoverImageUrl(rs.getString("cover_image_url"));
        game.setTotalAchievements(rs.getInt("total_achievements"));
        game.setAvgCompletionTimeHours(rs.getDouble("avg_completion_time_hours"));
        game.setMetacriticScore(rs.getInt("metacritic_score"));
        return game;
    };

    /**
     * Find game by ID
     */
    public Optional<Game> findById(Integer gameId) {
        String sql = "SELECT * FROM GAME WHERE game_id = ?";
        List<Game> games = jdbcTemplate.query(sql, gameRowMapper, gameId);
        return games.isEmpty() ? Optional.empty() : Optional.of(games.get(0));
    }

    /**
     * Get all games with average ratings
     */
    /**
     * Get all games with average ratings (paginated)
     */
    public List<Game> findAll(int page, int size) {
        int offset = page * size;
        String sql = "SELECT g.*, " +
                "(SELECT AVG(r.rating) FROM REVIEW r WHERE r.game_id = g.game_id) as avg_rating " +
                "FROM GAME g " +
                "ORDER BY g.title " +
                "LIMIT ? OFFSET ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Game game = new Game();
            game.setGameId(rs.getInt("game_id"));
            game.setTitle(rs.getString("title"));
            game.setDescription(rs.getString("description"));

            Date releaseDate = rs.getDate("release_date");
            if (releaseDate != null) {
                game.setReleaseDate(releaseDate.toLocalDate());
            }

            game.setDeveloper(rs.getString("developer"));
            game.setPublisher(rs.getString("publisher"));
            game.setCoverImageUrl(rs.getString("cover_image_url"));
            game.setTotalAchievements(rs.getInt("total_achievements"));
            game.setAvgCompletionTimeHours(rs.getDouble("avg_completion_time_hours"));
            game.setMetacriticScore(rs.getInt("metacritic_score"));

            Double avgRating = rs.getDouble("avg_rating");
            if (!rs.wasNull()) {
                game.setAvgRating(avgRating);
            }

            return game;
        }, size, offset);
    }

    /**
     * Count total games
     */
    public long count() {
        String sql = "SELECT COUNT(*) FROM GAME";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    /**
     * Get all games (legacy support, redirects to first page with large limit)
     */
    public List<Game> findAll() {
        return findAll(0, 1000);
    }

    /**
     * Search games by title
     */
    public List<Game> searchByTitle(String searchTerm) {
        String sql = "SELECT DISTINCT g.* FROM GAME g " +
                "WHERE g.title LIKE ? " +
                "ORDER BY g.title LIMIT 50";
        return jdbcTemplate.query(sql, gameRowMapper, "%" + searchTerm + "%");
    }

    /**
     * Get game details with statistics (Query 11 from queries.sql)
     */
    public Map<String, Object> getGameDetailsWithStats(Integer gameId) {
        String sql = "SELECT " +
                "g.game_id as gameId, g.title, g.description, g.release_date as releaseDate, g.developer, " +
                "g.publisher, g.cover_image_url as coverImageUrl, g.total_achievements as totalAchievements, " +
                "g.avg_completion_time_hours as avgCompletionTimeHours, g.metacritic_score as metacriticScore, " +
                "COUNT(DISTINCT ug.user_id) as totalPlayers, " +
                "AVG(ug.completion_percentage) as avgCompletionRate, " +
                "AVG(r.rating) as avgRating, " +
                "COUNT(DISTINCT r.review_id) as reviewCount " +
                "FROM GAME g " +
                "LEFT JOIN USER_GAME ug ON g.game_id = ug.game_id " +
                "LEFT JOIN REVIEW r ON g.game_id = r.game_id " +
                "WHERE g.game_id = ? " +
                "GROUP BY g.game_id";

        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, gameId);
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Get popular games (most players)
     */
    public List<Map<String, Object>> getPopularGames(int limit) {
        String sql = "SELECT g.*, COUNT(DISTINCT ug.user_id) as player_count, " +
                "AVG(r.rating) as avg_rating " +
                "FROM GAME g " +
                "LEFT JOIN USER_GAME ug ON g.game_id = ug.game_id " +
                "LEFT JOIN REVIEW r ON g.game_id = r.game_id " +
                "GROUP BY g.game_id " +
                "ORDER BY player_count DESC " +
                "LIMIT ?";
        return jdbcTemplate.queryForList(sql, limit);
    }

    /**
     * Get recommended games based on genre preferences (Query 32)
     */
    public List<Map<String, Object>> getRecommendedGames(Integer userId, int limit) {
        String sql = "SELECT g.game_id, g.title, g.cover_image_url, g.description, " +
                "g.metacritic_score, AVG(r.rating) as avg_rating, " +
                "COUNT(DISTINCT ug.user_id) as popularity " +
                "FROM GAME g " +
                "JOIN GAME_GENRE gg ON g.game_id = gg.game_id " +
                "LEFT JOIN REVIEW r ON g.game_id = r.game_id " +
                "LEFT JOIN USER_GAME ug ON g.game_id = ug.game_id " +
                "WHERE gg.genre_id IN ( " +
                "    SELECT gg2.genre_id " +
                "    FROM USER_GAME ug2 " +
                "    JOIN GAME_GENRE gg2 ON ug2.game_id = gg2.game_id " +
                "    WHERE ug2.user_id = ? " +
                "    GROUP BY gg2.genre_id " +
                "    ORDER BY COUNT(*) DESC " +
                "    LIMIT 3 " +
                ") " +
                "AND g.game_id NOT IN ( " +
                "    SELECT game_id FROM USER_GAME WHERE user_id = ? " +
                ") " +
                "GROUP BY g.game_id " +
                "HAVING avg_rating >= 7.0 OR avg_rating IS NULL " +
                "ORDER BY popularity DESC, avg_rating DESC " +
                "LIMIT ?";
        return jdbcTemplate.queryForList(sql, userId, userId, limit);
    }

    /**
     * Get platforms for a specific game
     */
    public List<Map<String, Object>> getGamePlatforms(Integer gameId) {
        String sql = "SELECT p.platform_id, p.name, p.description " +
                "FROM PLATFORM p " +
                "JOIN GAME_PLATFORM gp ON p.platform_id = gp.platform_id " +
                "WHERE gp.game_id = ? " +
                "ORDER BY p.name";
        return jdbcTemplate.queryForList(sql, gameId);
    }
}
