package com.gamehub.controller;

import com.gamehub.model.Game;
import com.gamehub.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for game-related endpoints
 */
@RestController
@RequestMapping("/games")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class GameController {

    @Autowired
    private GameRepository gameRepository;

    /**
     * Get all games
     * GET /api/games
     */
    /**
     * Get all games (paginated)
     * GET /api/games?page=0&size=20
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Game> games = gameRepository.findAll(page, size);
        long totalElements = gameRepository.count();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", games);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);
        response.put("currentPage", page);
        response.put("size", size);

        return ResponseEntity.ok(response);
    }

    /**
     * Get game by ID with statistics
     * GET /api/games/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getGameById(@PathVariable Integer id) {
        Map<String, Object> gameDetails = gameRepository.getGameDetailsWithStats(id);
        if (gameDetails == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Game not found");
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(gameDetails);
    }

    /**
     * Search games by title
     * GET /api/games/search?q=searchTerm
     */
    @GetMapping("/search")
    public ResponseEntity<List<Game>> searchGames(@RequestParam String q) {
        List<Game> games = gameRepository.searchByTitle(q);
        return ResponseEntity.ok(games);
    }

    /**
     * Get popular games
     * GET /api/games/popular?limit=20
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Map<String, Object>>> getPopularGames(
            @RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> games = gameRepository.getPopularGames(limit);
        return ResponseEntity.ok(games);
    }

    /**
     * Get recommended games for user
     * GET /api/games/recommended?userId=1&limit=20
     */
    @GetMapping("/recommended")
    public ResponseEntity<List<Map<String, Object>>> getRecommendedGames(
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> games = gameRepository.getRecommendedGames(userId, limit);
        return ResponseEntity.ok(games);
    }

    /**
     * Get platforms for a specific game
     * GET /api/games/:id/platforms
     */
    @GetMapping("/{id}/platforms")
    public ResponseEntity<List<Map<String, Object>>> getGamePlatforms(@PathVariable Integer id) {
        List<Map<String, Object>> platforms = gameRepository.getGamePlatforms(id);
        return ResponseEntity.ok(platforms);
    }
}
