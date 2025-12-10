package com.gamehub.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Utility class for password hashing and verification using BCrypt
 */
@Component
public class PasswordUtil {

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    /**
     * Hash a plain text password using BCrypt with work factor 12
     * 
     * @param plainPassword The plain text password
     * @return BCrypt hashed password
     */
    public String hashPassword(String plainPassword) {
        return encoder.encode(plainPassword);
    }

    /**
     * Verify a plain text password against a BCrypt hash
     * 
     * @param plainPassword The plain text password to verify
     * @param hashedPassword The BCrypt hash to compare against
     * @return true if password matches, false otherwise
     */
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return encoder.matches(plainPassword, hashedPassword);
    }

    /**
     * Check if password meets strength requirements
     * - Minimum 8 characters
     * - Contains uppercase letter
     * - Contains lowercase letter
     * - Contains digit
     * - Contains special character
     * 
     * @param password The password to check
     * @return true if password is strong, false otherwise
     */
    public boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpper = password.matches(".*[A-Z].*");
        boolean hasLower = password.matches(".*[a-z].*");
        boolean hasDigit = password.matches(".*[0-9].*");
        boolean hasSpecial = password.matches(".*[@$!%*?&].*");
        
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}

