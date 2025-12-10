package com.gamehub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * User entity representing a GameTracker user
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer userId;
    private String username;
    private String email;
    private String passwordHash;
    private String displayName;
    private String bio;
    private String avatarUrl;
    private String country;
    private Integer totalAchievements;
    private Double totalPlaytimeHours;
    private LocalDateTime accountCreated;
    private LocalDateTime lastLogin;
    
    // Constructor without password hash (for responses)
    public User(Integer userId, String username, String email, String displayName, 
                String bio, String avatarUrl, String country, Integer totalAchievements, 
                Double totalPlaytimeHours, LocalDateTime accountCreated, LocalDateTime lastLogin) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.country = country;
        this.totalAchievements = totalAchievements;
        this.totalPlaytimeHours = totalPlaytimeHours;
        this.accountCreated = accountCreated;
        this.lastLogin = lastLogin;
    }
}

