-- ============================================================================
-- DDL - Data Definition Language
-- ============================================================================

-- Drop and recreate database
DROP DATABASE IF EXISTS gamehub;
CREATE DATABASE gamehub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gamehub;

-- Table: USER
CREATE TABLE USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    country VARCHAR(50),
    level INT DEFAULT 1,
    reviews_count INT DEFAULT 0,
    total_achievements INT DEFAULT 0,
    total_playtime_hours DECIMAL(10,2) DEFAULT 0.00,
    account_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_total_achievements (total_achievements DESC),
    INDEX idx_level (level DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: PLATFORM
CREATE TABLE PLATFORM (
    platform_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon_url VARCHAR(500),
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: GENRE
CREATE TABLE GENRE (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: GAME
CREATE TABLE GAME (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    release_date DATE,
    developer VARCHAR(100),
    publisher VARCHAR(100),
    cover_image_url VARCHAR(500),
    total_achievements INT DEFAULT 0,
    avg_completion_time_hours DECIMAL(10,2),
    metacritic_score INT,
    INDEX idx_title (title),
    INDEX idx_release_date (release_date DESC),
    INDEX idx_metacritic_score (metacritic_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: GAME_PLATFORM (Many-to-Many)
CREATE TABLE GAME_PLATFORM (
    game_id INT NOT NULL,
    platform_id INT NOT NULL,
    PRIMARY KEY (game_id, platform_id),
    FOREIGN KEY (game_id) REFERENCES GAME(game_id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES PLATFORM(platform_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: GAME_GENRE (Many-to-Many)
CREATE TABLE GAME_GENRE (
    game_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (game_id, genre_id),
    FOREIGN KEY (game_id) REFERENCES GAME(game_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES GENRE(genre_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: USER_GAME (User's game collection and wishlist)
CREATE TABLE USER_GAME (
    user_game_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    platform_id INT,
    status ENUM('owned', 'wishlist') DEFAULT 'wishlist',
    playtime_hours DECIMAL(10,2) DEFAULT 0.00,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    ownership_date DATE,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_played TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES PLATFORM(platform_id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_game_platform (user_id, game_id, platform_id),
    INDEX idx_user_library (user_id, status),
    INDEX idx_game_owners (game_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: REVIEW
CREATE TABLE REVIEW (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    recommended BOOLEAN DEFAULT TRUE,
    playtime_at_review DECIMAL(10,2),
    helpful_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id) ON DELETE CASCADE,
    INDEX idx_game_reviews (game_id, created_date DESC),
    INDEX idx_user_reviews (user_id, created_date DESC),
    INDEX idx_rating (rating DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: REVIEW_LIKE
CREATE TABLE REVIEW_LIKE (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_review_like (review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES REVIEW(review_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    INDEX idx_review_likes (review_id),
    INDEX idx_user_likes (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: REVIEW_REPLY
CREATE TABLE REVIEW_REPLY (
    reply_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    reply_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES REVIEW(review_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    INDEX idx_review_replies (review_id),
    INDEX idx_user_replies (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: ACTIVITY (Community feed)
CREATE TABLE ACTIVITY (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('add_game', 'post_review', 'rate_game', 'reply_review', 'like_review') NOT NULL,
    game_id INT,
    review_id INT,
    activity_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES REVIEW(review_id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, created_at),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: GAME_AI_SUMMARY (Cache for OpenAI responses)
CREATE TABLE GAME_AI_SUMMARY (
    game_title VARCHAR(200) PRIMARY KEY,
    summary_text TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
