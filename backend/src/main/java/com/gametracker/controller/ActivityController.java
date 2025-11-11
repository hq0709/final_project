package com.gametracker.controller;

import com.gametracker.model.Activity;
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
 * REST Controller for activity feed endpoints
 */
@RestController
@RequestMapping("/activities")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ActivityController {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Get recent community activities
     * GET /api/activities
     */
    @GetMapping
    public ResponseEntity<?> getRecentActivities(
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String type) {
        try {
            List<Activity> activities;
            
            if (type != null && !type.isEmpty()) {
                activities = activityRepository.getActivitiesByType(type, limit);
            } else {
                activities = activityRepository.getRecentActivities(limit);
            }
            
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get activities for a specific user
     * GET /api/activities/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserActivities(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<Activity> activities = activityRepository.getActivitiesByUserId(userId, limit);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get activities for a specific game
     * GET /api/activities/game/{gameId}
     */
    @GetMapping("/game/{gameId}")
    public ResponseEntity<?> getGameActivities(
            @PathVariable Integer gameId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<Activity> activities = activityRepository.getActivitiesByGameId(gameId, limit);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get current user's activities
     * GET /api/activities/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyActivities(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtUtil.extractUserId(token);
            
            List<Activity> activities = activityRepository.getActivitiesByUserId(userId, limit);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}

