package com.gamehub.model;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Model class for Review Reply
 */
@Data
public class ReviewReply {
    private Integer replyId;
    private Integer reviewId;
    private Integer userId;
    private String replyText;
    private LocalDateTime createdAt;
    
    // Additional fields for display
    private String username;
    private String displayName;
    private String avatarUrl;
}

