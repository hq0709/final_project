package com.gamehub.model;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Model class for Review Like
 */
@Data
public class ReviewLike {
    private Integer likeId;
    private Integer reviewId;
    private Integer userId;
    private LocalDateTime createdAt;
}

