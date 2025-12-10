package com.gamehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * GameHub - Main Application Class
 *
 * A comprehensive gaming social platform that allows users to:
 * - Browse and discover games
 * - Manage game collections and wishlists
 * - Write and share game reviews
 * - Interact with the gaming community
 *
 * @author GameHub Team
 * @version 1.0.0
 */
@SpringBootApplication
public class GameHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(GameHubApplication.class, args);
        System.out.println("\n===========================================");
        System.out.println("🎮 GameHub Backend Started!");
        System.out.println("===========================================");
        System.out.println("📍 API Base URL: http://localhost:8080/api");
        System.out.println("📊 Database: MySQL (gamehub)");
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

