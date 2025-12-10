package com.gamehub.model;

import java.time.LocalDate;

/**
 * Game entity representing a video game
 */
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
    private Double avgRating;

    // Default Constructor
    public Game() {
    }

    // All Arguments Constructor
    public Game(Integer gameId, String title, String description, LocalDate releaseDate,
            String developer, String publisher, String coverImageUrl,
            Integer totalAchievements, Double avgCompletionTimeHours,
            Integer metacriticScore, Double avgRating) {
        this.gameId = gameId;
        this.title = title;
        this.description = description;
        this.releaseDate = releaseDate;
        this.developer = developer;
        this.publisher = publisher;
        this.coverImageUrl = coverImageUrl;
        this.totalAchievements = totalAchievements;
        this.avgCompletionTimeHours = avgCompletionTimeHours;
        this.metacriticScore = metacriticScore;
        this.avgRating = avgRating;
    }

    // Getters and Setters

    public Integer getGameId() {
        return gameId;
    }

    public void setGameId(Integer gameId) {
        this.gameId = gameId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getDeveloper() {
        return developer;
    }

    public void setDeveloper(String developer) {
        this.developer = developer;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public Integer getTotalAchievements() {
        return totalAchievements;
    }

    public void setTotalAchievements(Integer totalAchievements) {
        this.totalAchievements = totalAchievements;
    }

    public Double getAvgCompletionTimeHours() {
        return avgCompletionTimeHours;
    }

    public void setAvgCompletionTimeHours(Double avgCompletionTimeHours) {
        this.avgCompletionTimeHours = avgCompletionTimeHours;
    }

    public Integer getMetacriticScore() {
        return metacriticScore;
    }

    public void setMetacriticScore(Integer metacriticScore) {
        this.metacriticScore = metacriticScore;
    }

    public Double getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(Double avgRating) {
        this.avgRating = avgRating;
    }
}
