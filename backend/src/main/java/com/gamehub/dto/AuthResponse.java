package com.gamehub.dto;

import com.gamehub.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication response with JWT token
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private User user;
    
    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = user;
    }
}

