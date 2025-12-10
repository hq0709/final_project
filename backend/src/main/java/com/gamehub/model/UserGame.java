package com.gamehub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * UserGame entity representing a game in user's library
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserGame {
    private Integer userGameId;
    private Integer userId;
    private Integer gameId;
    private Integer platformId;
    private Double playtimeHours;
    private Double completionPercentage;
    private String status; // playing, completed, abandoned, wishlist
    private LocalDate ownershipDate;
    private LocalDateTime lastPlayed;
}

