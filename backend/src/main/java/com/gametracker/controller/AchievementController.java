package com.gametracker.controller;

import com.gametracker.model.Achievement;
import com.gametracker.repository.AchievementRepository;
import com.gametracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for achievement-related endpoints
 */
@RestController
@RequestMapping("/achievements")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AchievementController {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Get all achievements for a game
     * GET /api/achievements/game/{gameId}
     */
    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<Achievement>> getGameAchievements(@PathVariable Integer gameId) {
        List<Achievement> achievements = achievementRepository.findByGameId(gameId);
        return ResponseEntity.ok(achievements);
    }

    /**
     * Get user's achievements for a game
     * GET /api/achievements/game/{gameId}/user
     */
    @GetMapping("/game/{gameId}/user")
    public ResponseEntity<?> getUserGameAchievements(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer gameId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            List<Map<String, Object>> achievements = achievementRepository.getUserAchievementsForGame(userId, gameId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get user's achievement progress for a game
     * GET /api/achievements/game/{gameId}/progress
     */
    @GetMapping("/game/{gameId}/progress")
    public ResponseEntity<?> getAchievementProgress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer gameId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            Map<String, Object> progress = achievementRepository.getAchievementProgress(userId, gameId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Unlock an achievement for user
     * POST /api/achievements/{achievementId}/unlock
     */
    @PostMapping("/{achievementId}/unlock")
    public ResponseEntity<?> unlockAchievement(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer achievementId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            boolean unlocked = achievementRepository.unlockAchievement(userId, achievementId);
            if (unlocked) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Achievement unlocked!");
                response.put("achievementId", achievementId);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Achievement already unlocked or not found");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get user's recent achievements
     * GET /api/achievements/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentAchievements(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            List<Map<String, Object>> achievements = achievementRepository.getRecentAchievements(userId, limit);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get user's rarest achievements
     * GET /api/achievements/rarest
     */
    @GetMapping("/rarest")
    public ResponseEntity<?> getRarestAchievements(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            List<Map<String, Object>> achievements = achievementRepository.getRarestAchievements(userId, limit);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get all user's achievements
     * GET /api/achievements/user
     */
    @GetMapping("/user")
    public ResponseEntity<?> getAllUserAchievements(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);

            List<Map<String, Object>> achievements = achievementRepository.getAllUserAchievements(userId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}

