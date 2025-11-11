package com.gamehub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Game entity representing a video game
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Game {
    private Integer gameId;
    private String title;
    private String description;
    private LocalDate releaseDate;
    private String developer;
    private String publisher;
    private String coverImageUrl;
    private Integer totalAchievements;
    private Double avgCompletionTimeHours;
    private Integer metacriticScore;
}

