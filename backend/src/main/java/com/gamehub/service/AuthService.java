package com.gamehub.service;

import com.gamehub.dto.AuthResponse;
import com.gamehub.dto.LoginRequest;
import com.gamehub.dto.RegisterRequest;
import com.gamehub.model.User;
import com.gamehub.repository.UserRepository;
import com.gamehub.util.JwtUtil;
import com.gamehub.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

/**
 * Service for authentication operations
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordUtil passwordUtil;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Register a new user
     */
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        Optional<User> existingUsername = userRepository.findByUsername(request.getUsername());
        if (existingUsername.isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        Optional<User> existingEmail = userRepository.findByEmail(request.getEmail());
        if (existingEmail.isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Validate password strength
        if (!passwordUtil.isPasswordStrong(request.getPassword())) {
            throw new RuntimeException("Password does not meet strength requirements");
        }

        // Hash password
        String hashedPassword = passwordUtil.hashPassword(request.getPassword());

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(hashedPassword);
        user.setDisplayName(request.getDisplayName());
        user.setCountry(request.getCountry());

        // Save user
        User savedUser = userRepository.save(user);

        // Remove password hash from response
        savedUser.setPasswordHash(null);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getUsername(), savedUser.getEmail());

        return new AuthResponse(token, savedUser);
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOptional.get();

        // Verify password
        if (!passwordUtil.verifyPassword(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Update last login
        userRepository.updateLastLogin(user.getUserId());

        // Remove password hash from response
        user.setPasswordHash(null);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getEmail());

        return new AuthResponse(token, user);
    }

    /**
     * Validate JWT token and get user
     */
    public User validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        Integer userId = jwtUtil.extractUserId(token);
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        user.setPasswordHash(null); // Remove password hash
        return user;
    }

    /**
     * Update user profile
     */
    public User updateProfile(String token, Map<String, String> updates) {
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        Integer userId = jwtUtil.extractUserId(token);
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Update fields if provided
        if (updates.containsKey("displayName")) {
            user.setDisplayName(updates.get("displayName"));
        }
        if (updates.containsKey("bio")) {
            user.setBio(updates.get("bio"));
        }
        if (updates.containsKey("country")) {
            user.setCountry(updates.get("country"));
        }

        // Save updated user
        User updatedUser = userRepository.update(user);
        updatedUser.setPasswordHash(null); // Remove password hash
        return updatedUser;
    }
}

