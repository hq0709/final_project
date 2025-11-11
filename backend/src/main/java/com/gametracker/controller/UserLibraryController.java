package com.gametracker.controller;

import com.gametracker.model.UserGame;
import com.gametracker.repository.UserGameRepository;
import com.gametracker.repository.ActivityRepository;
import com.gametracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for user library management
 */
@RestController
@RequestMapping("/library")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class UserLibraryController {

    @Autowired
    private UserGameRepository userGameRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Get user's game library
     * GET /api/library
     */
    @GetMapping
    public ResponseEntity<?> getUserLibrary(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            List<Map<String, Object>> library = userGameRepository.getUserLibraryWithDetails(userId);
            return ResponseEntity.ok(library);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Add game to user's library
     * POST /api/library
     */
    @PostMapping
    public ResponseEntity<?> addGameToLibrary(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            Integer gameId = (Integer) request.get("gameId");
            // Default to Steam (platform_id = 1) if not provided
            Integer platformId = request.get("platformId") != null ?
                (Integer) request.get("platformId") : 1;
            String status = (String) request.getOrDefault("status", "wishlist");

            UserGame userGame = new UserGame();
            userGame.setUserId(userId);
            userGame.setGameId(gameId);
            userGame.setPlatformId(platformId);
            userGame.setStatus(status);
            userGame.setPlaytimeHours(0.0);
            userGame.setCompletionPercentage(0.0);

            UserGame created = userGameRepository.save(userGame);

            // Create activity for adding game (only for "owned" status, not wishlist)
            if ("owned".equals(status)) {
                try {
                    String activityText = "added to collection";
                    activityRepository.createActivity(userId, "add_game", gameId, null, activityText);
                } catch (Exception e) {
                    System.err.println("Failed to create activity: " + e.getMessage());
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update game in user's library
     * PUT /api/library/{userGameId}
     */
    @PutMapping("/{userGameId}")
    public ResponseEntity<?> updateGameInLibrary(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer userGameId,
            @RequestBody Map<String, Object> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            UserGame userGame = userGameRepository.findById(userGameId);
            if (userGame == null || !userGame.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String oldStatus = userGame.getStatus();

            if (request.containsKey("status")) {
                userGame.setStatus((String) request.get("status"));
            }
            if (request.containsKey("playtimeHours")) {
                userGame.setPlaytimeHours(((Number) request.get("playtimeHours")).doubleValue());
            }
            if (request.containsKey("completionPercentage")) {
                userGame.setCompletionPercentage(((Number) request.get("completionPercentage")).doubleValue());
            }

            UserGame updated = userGameRepository.update(userGame);

            // Create activity if status changed from wishlist to owned
            if (!"owned".equals(oldStatus) && "owned".equals(userGame.getStatus())) {
                try {
                    String activityText = "added to collection";
                    activityRepository.createActivity(userId, "add_game", userGame.getGameId(), null, activityText);
                } catch (Exception e) {
                    System.err.println("Failed to create activity: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Remove game from user's library
     * DELETE /api/library/{userGameId}
     */
    @DeleteMapping("/{userGameId}")
    public ResponseEntity<?> removeGameFromLibrary(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer userGameId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            UserGame userGame = userGameRepository.findById(userGameId);
            if (userGame == null || !userGame.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            userGameRepository.delete(userGameId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Game removed from library");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get library statistics
     * GET /api/library/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getLibraryStats(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            Map<String, Object> stats = userGameRepository.getLibraryStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Check if game is in user's library
     * GET /api/library/check/{gameId}
     */
    @GetMapping("/check/{gameId}")
    public ResponseEntity<?> checkGameInLibrary(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer gameId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            UserGame userGame = userGameRepository.findByUserAndGame(userId, gameId);
            Map<String, Object> response = new HashMap<>();
            response.put("inLibrary", userGame != null);
            if (userGame != null) {
                response.put("userGameId", userGame.getUserGameId());
                response.put("status", userGame.getStatus());
                response.put("playtimeHours", userGame.getPlaytimeHours());
                response.put("completionPercentage", userGame.getCompletionPercentage());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}

