package com.gamehub.repository;

import com.gamehub.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity using JDBC
 * All queries use prepared statements to prevent SQL injection
 */
@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * RowMapper for User entity
     */
    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setUserId(rs.getInt("user_id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setDisplayName(rs.getString("display_name"));
        user.setBio(rs.getString("bio"));
        user.setAvatarUrl(rs.getString("avatar_url"));
        user.setCountry(rs.getString("country"));
        user.setTotalAchievements(rs.getInt("total_achievements"));
        user.setTotalPlaytimeHours(rs.getDouble("total_playtime_hours"));
        
        Timestamp accountCreated = rs.getTimestamp("account_created");
        if (accountCreated != null) {
            user.setAccountCreated(accountCreated.toLocalDateTime());
        }
        
        Timestamp lastLogin = rs.getTimestamp("last_login");
        if (lastLogin != null) {
            user.setLastLogin(lastLogin.toLocalDateTime());
        }
        
        return user;
    };

    /**
     * Find user by email (for login)
     */
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT user_id, username, email, password_hash, display_name, bio, " +
                    "avatar_url, country, total_achievements, total_playtime_hours, " +
                    "account_created, last_login FROM USER WHERE email = ?";
        
        List<User> users = jdbcTemplate.query(sql, userRowMapper, email);
        return users.isEmpty() ? Optional.empty() : Optional.of(users.get(0));
    }

    /**
     * Find user by username
     */
    public Optional<User> findByUsername(String username) {
        String sql = "SELECT user_id, username, email, password_hash, display_name, bio, " +
                    "avatar_url, country, total_achievements, total_playtime_hours, " +
                    "account_created, last_login FROM USER WHERE username = ?";
        
        List<User> users = jdbcTemplate.query(sql, userRowMapper, username);
        return users.isEmpty() ? Optional.empty() : Optional.of(users.get(0));
    }

    /**
     * Find user by ID
     */
    public Optional<User> findById(Integer userId) {
        String sql = "SELECT user_id, username, email, password_hash, display_name, bio, " +
                    "avatar_url, country, total_achievements, total_playtime_hours, " +
                    "account_created, last_login FROM USER WHERE user_id = ?";
        
        List<User> users = jdbcTemplate.query(sql, userRowMapper, userId);
        return users.isEmpty() ? Optional.empty() : Optional.of(users.get(0));
    }

    /**
     * Create new user
     */
    public User save(User user) {
        String sql = "INSERT INTO USER (username, email, password_hash, display_name, country) " +
                    "VALUES (?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, user.getDisplayName());
            ps.setString(5, user.getCountry());
            return ps;
        }, keyHolder);
        
        user.setUserId(keyHolder.getKey().intValue());
        return user;
    }

    /**
     * Update user's last login timestamp
     */
    public void updateLastLogin(Integer userId) {
        String sql = "UPDATE USER SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }

    /**
     * Update user profile
     */
    public void updateProfile(Integer userId, String displayName, String bio, String country, String avatarUrl) {
        String sql = "UPDATE USER SET display_name = ?, bio = ?, country = ?, avatar_url = ? WHERE user_id = ?";
        jdbcTemplate.update(sql, displayName, bio, country, avatarUrl, userId);
    }

    /**
     * Update user and return updated user
     */
    public User update(User user) {
        String sql = "UPDATE USER SET display_name = ?, bio = ?, country = ?, avatar_url = ? WHERE user_id = ?";
        jdbcTemplate.update(sql,
            user.getDisplayName(),
            user.getBio(),
            user.getCountry(),
            user.getAvatarUrl(),
            user.getUserId()
        );
        return findById(user.getUserId()).orElse(user);
    }

    /**
     * Get all users (for leaderboard)
     */
    public List<User> findAll() {
        String sql = "SELECT user_id, username, email, password_hash, display_name, bio, " +
                    "avatar_url, country, total_achievements, total_playtime_hours, " +
                    "account_created, last_login FROM USER ORDER BY total_achievements DESC";
        
        return jdbcTemplate.query(sql, userRowMapper);
    }

    /**
     * Search users by username
     */
    public List<User> searchByUsername(String searchTerm) {
        String sql = "SELECT user_id, username, email, password_hash, display_name, bio, " +
                    "avatar_url, country, total_achievements, total_playtime_hours, " +
                    "account_created, last_login FROM USER WHERE username LIKE ? LIMIT 20";
        
        return jdbcTemplate.query(sql, userRowMapper, "%" + searchTerm + "%");
    }
}

