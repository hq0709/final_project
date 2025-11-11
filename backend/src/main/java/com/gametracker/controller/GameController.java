package com.gametracker.controller;

import com.gametracker.model.Game;
import com.gametracker.repository.GameRepository;
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
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class GameController {

    @Autowired
    private GameRepository gameRepository;

    /**
     * Get all games
     * GET /api/games
     */
    @GetMapping
    public ResponseEntity<List<Game>> getAllGames() {
        List<Game> games = gameRepository.findAll();
        return ResponseEntity.ok(games);
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
}

