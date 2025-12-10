package com.gamehub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Review entity representing a user's game review
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    private Integer reviewId;
    private Integer userId;
    private Integer gameId;
    private Integer rating; // 1-10
    private String reviewText;
    private Boolean recommended;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private LocalDateTime reviewDate;
    private LocalDateTime lastUpdated;
}

