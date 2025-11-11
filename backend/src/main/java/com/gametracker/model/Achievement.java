package com.gametracker.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Achievement entity representing a game achievement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    private Integer achievementId;
    private Integer gameId;
    private String name;
    private String description;
    private String iconUrl;
    private Integer pointsValue;
    private Double rarityPercentage;
    private Boolean isHidden;
}

