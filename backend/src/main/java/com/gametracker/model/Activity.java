package com.gametracker.model;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Model class for User Activity
 */
@Data
public class Activity {
    private Integer activityId;
    private Integer userId;
    private String activityType; // add_game, post_review, rate_game, reply_review, like_review
    private Integer gameId;
    private Integer reviewId;
    private String activityText;
    private LocalDateTime createdAt;
    
    // Additional fields for display
    private String username;
    private String displayName;
    private String avatarUrl;
    private String gameTitle;
    private String gameCoverUrl;
}

