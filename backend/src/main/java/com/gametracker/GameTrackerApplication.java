package com.gametracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * GameTracker Pro - Main Application Class
 * 
 * A comprehensive gaming achievement tracking platform that allows users to:
 * - Track achievements across multiple games and platforms
 * - Compare progress with friends
 * - Discover rare achievements
 * - Analyze gaming statistics and personality
 * 
 * @author GameTracker Team
 * @version 1.0.0
 */
@SpringBootApplication
public class GameTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(GameTrackerApplication.class, args);
        System.out.println("\n===========================================");
        System.out.println("🎮 GameTracker Pro Backend Started!");
        System.out.println("===========================================");
        System.out.println("📍 API Base URL: http://localhost:8080/api");
        System.out.println("📊 Database: MySQL (gametracker)");
        System.out.println("🔒 Security: JWT Authentication");
        System.out.println("===========================================\n");
    }

    /**
     * Configure CORS to allow requests from frontend
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000", "http://localhost:3001")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}

