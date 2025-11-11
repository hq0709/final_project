-- ============================================================================
-- GameHub - Complete Database Initialization Script
-- ============================================================================
-- This script creates the complete database schema for GameHub, including:
-- 1. Core tables (USER, GAME, REVIEW, etc.)
-- 2. Social features (REVIEW_LIKE, REVIEW_REPLY, ACTIVITY)
-- 3. Sample game data (30 popular games)
-- 
-- Usage:
--   docker exec -i gametracker-mysql mysql -ugametracker -pgametracker123 gametracker < database/init_database.sql
-- ============================================================================

-- Drop and recreate database
DROP DATABASE IF EXISTS gametracker;
CREATE DATABASE gametracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gametracker;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

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
    total_achievements INT DEFAULT 0,
    total_playtime_hours DECIMAL(10,2) DEFAULT 0.00,
    account_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_total_achievements (total_achievements DESC)
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
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    review_text TEXT,
    recommended BOOLEAN DEFAULT TRUE,
    playtime_at_review DECIMAL(10,2),
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

-- ============================================================================
-- SOCIAL FEATURES TABLES
-- ============================================================================

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

-- ============================================================================
-- SAMPLE DATA - PLATFORMS
-- ============================================================================

INSERT INTO PLATFORM (platform_id, name, description) VALUES
(1, 'Steam', 'PC gaming platform by Valve'),
(2, 'PlayStation 5', 'Sony PlayStation 5 console'),
(3, 'Xbox Series X/S', 'Microsoft Xbox Series X/S console'),
(4, 'Nintendo Switch', 'Nintendo Switch console'),
(5, 'Epic Games Store', 'PC gaming platform by Epic Games'),
(6, 'PlayStation 4', 'Sony PlayStation 4 console'),
(7, 'Xbox One', 'Microsoft Xbox One console'),
(8, 'PC', 'Personal Computer');

-- ============================================================================
-- SAMPLE DATA - GENRES
-- ============================================================================

INSERT INTO GENRE (genre_id, name, description) VALUES
(1, 'Action', 'Fast-paced gameplay with physical challenges'),
(2, 'RPG', 'Role-playing games with character development'),
(3, 'Adventure', 'Story-driven exploration games'),
(4, 'Strategy', 'Games requiring tactical thinking'),
(5, 'Shooter', 'First or third-person shooting games'),
(6, 'Sports', 'Sports simulation games'),
(7, 'Racing', 'Vehicle racing games'),
(8, 'Puzzle', 'Logic and problem-solving games'),
(9, 'Simulation', 'Real-world simulation games'),
(10, 'Horror', 'Scary and suspenseful games'),
(11, 'Fighting', 'Combat-focused games'),
(12, 'Platformer', 'Jump and run games'),
(13, 'Survival', 'Resource management and survival'),
(14, 'Open World', 'Large explorable game worlds'),
(15, 'Indie', 'Independent developer games'),
(16, 'MMORPG', 'Massively multiplayer online RPG');

-- ============================================================================
-- SAMPLE DATA - GAMES (30 Popular Games)
-- ============================================================================

INSERT INTO GAME (game_id, title, description, release_date, developer, publisher, total_achievements, avg_completion_time_hours, metacritic_score) VALUES
(1, 'Elden Ring', 'An action RPG set in a dark fantasy world created by FromSoftware and George R.R. Martin', '2022-02-25', 'FromSoftware', 'Bandai Namco', 42, 80.0, 96),
(2, 'The Legend of Zelda: Breath of the Wild', 'Open-world action-adventure game in the Zelda series', '2017-03-03', 'Nintendo', 'Nintendo', 76, 60.0, 97),
(3, 'Red Dead Redemption 2', 'Epic tale of life in America at the dawn of the modern age', '2018-10-26', 'Rockstar Games', 'Rockstar Games', 52, 60.0, 97),
(4, 'The Witcher 3: Wild Hunt', 'Story-driven open world RPG set in a visually stunning fantasy universe', '2015-05-19', 'CD Projekt Red', 'CD Projekt', 78, 100.5, 93),
(5, 'God of War', 'Action-adventure game following Kratos in Norse mythology', '2018-04-20', 'Santa Monica Studio', 'Sony Interactive Entertainment', 37, 25.0, 94),
(6, 'Hades', 'Rogue-like dungeon crawler combining Greek mythology with fast-paced action', '2020-09-17', 'Supergiant Games', 'Supergiant Games', 49, 30.0, 93),
(7, 'Hollow Knight', 'Challenging 2D action-adventure through a vast interconnected world', '2017-02-24', 'Team Cherry', 'Team Cherry', 63, 35.0, 90),
(8, 'Celeste', 'Platformer about climbing a mountain and overcoming personal challenges', '2018-01-25', 'Maddy Makes Games', 'Maddy Makes Games', 30, 12.0, 92),
(9, 'Horizon Zero Dawn', 'Action RPG in a post-apocalyptic world dominated by machines', '2017-02-28', 'Guerrilla Games', 'Sony Interactive Entertainment', 56, 40.0, 89),
(10, 'Sekiro: Shadows Die Twice', 'Action-adventure game set in Sengoku period Japan', '2019-03-22', 'FromSoftware', 'Activision', 34, 35.0, 90);

INSERT INTO GAME (game_id, title, description, release_date, developer, publisher, total_achievements, avg_completion_time_hours, metacritic_score) VALUES
(11, 'Dark Souls III', 'Dark fantasy action RPG known for its challenging gameplay', '2016-04-12', 'FromSoftware', 'Bandai Namco', 43, 50.0, 89),
(12, 'Bloodborne', 'Gothic horror action RPG exclusive to PlayStation', '2015-03-24', 'FromSoftware', 'Sony Interactive Entertainment', 34, 35.0, 92),
(13, 'Ghost of Tsushima', 'Open-world samurai adventure set in feudal Japan', '2020-07-17', 'Sucker Punch Productions', 'Sony Interactive Entertainment', 34, 30.0, 85),
(14, 'The Last of Us Part II', 'Post-apocalyptic action-adventure with emotional storytelling', '2020-06-19', 'Naughty Dog', 'Sony Interactive Entertainment', 28, 24.0, 93),
(15, 'Cyberpunk 2077', 'Open-world RPG set in the dystopian Night City', '2020-12-10', 'CD Projekt Red', 'CD Projekt', 44, 60.0, 86),
(16, 'Spider-Man', 'Superhero action-adventure featuring Marvel\'s Spider-Man', '2018-09-07', 'Insomniac Games', 'Sony Interactive Entertainment', 42, 20.0, 87),
(17, 'Stardew Valley', 'Farming simulation RPG with life simulation elements', '2016-02-26', 'ConcernedApe', 'ConcernedApe', 40, 80.0, 89),
(18, 'Undertale', 'Indie RPG where you can choose to spare enemies', '2015-09-15', 'Toby Fox', 'Toby Fox', 0, 8.0, 92),
(19, 'Portal 2', 'First-person puzzle-platform game with innovative mechanics', '2011-04-19', 'Valve', 'Valve', 51, 10.0, 95),
(20, 'Half-Life: Alyx', 'VR first-person shooter set in the Half-Life universe', '2020-03-23', 'Valve', 'Valve', 0, 12.0, 93);

INSERT INTO GAME (game_id, title, description, release_date, developer, publisher, total_achievements, avg_completion_time_hours, metacritic_score) VALUES
(21, 'Minecraft', 'Sandbox game about placing blocks and going on adventures', '2011-11-18', 'Mojang Studios', 'Mojang Studios', 122, 200.0, 93),
(22, 'Terraria', '2D sandbox adventure with crafting and exploration', '2011-05-16', 'Re-Logic', 'Re-Logic', 104, 100.0, 83),
(23, 'Doom Eternal', 'Fast-paced first-person shooter with intense demon-slaying action', '2020-03-20', 'id Software', 'Bethesda', 54, 15.0, 88),
(24, 'Control', 'Third-person action-adventure with supernatural elements', '2019-08-27', 'Remedy Entertainment', '505 Games', 37, 18.0, 85),
(25, 'Death Stranding', 'Action game with unique delivery and connection mechanics', '2019-11-08', 'Kojima Productions', 'Sony Interactive Entertainment', 63, 45.0, 82),
(26, 'Resident Evil Village', 'Survival horror game continuing the Resident Evil saga', '2021-05-07', 'Capcom', 'Capcom', 49, 12.0, 84),
(27, 'It Takes Two', 'Co-op action-adventure requiring two players', '2021-03-26', 'Hazelight Studios', 'Electronic Arts', 21, 14.0, 88),
(28, 'Disco Elysium', 'Narrative-driven RPG with deep dialogue and choices', '2019-10-15', 'ZA/UM', 'ZA/UM', 0, 25.0, 91),
(29, 'Outer Wilds', 'Exploration game about a solar system trapped in a time loop', '2019-05-30', 'Mobius Digital', 'Annapurna Interactive', 0, 20.0, 85),
(30, 'Return of the Obra Dinn', 'Mystery puzzle game with unique visual style', '2018-10-18', 'Lucas Pope', '3909', 0, 12.0, 89);

-- ============================================================================
-- SAMPLE DATA - GAME_PLATFORM RELATIONSHIPS
-- ============================================================================

-- Assign platforms to games (simplified - most games on multiple platforms)
INSERT INTO GAME_PLATFORM (game_id, platform_id) VALUES
-- Elden Ring
(1, 1), (1, 2), (1, 3), (1, 8),
-- Zelda BOTW
(2, 4),
-- Red Dead Redemption 2
(3, 1), (3, 2), (3, 3), (3, 8),
-- Witcher 3
(4, 1), (4, 2), (4, 3), (4, 4), (4, 8),
-- God of War
(5, 2), (5, 6),
-- Hades
(6, 1), (6, 2), (6, 3), (6, 4), (6, 8),
-- Hollow Knight
(7, 1), (7, 2), (7, 3), (7, 4), (7, 8),
-- Celeste
(8, 1), (8, 2), (8, 3), (8, 4), (8, 8),
-- Horizon Zero Dawn
(9, 1), (9, 2), (9, 8),
-- Sekiro
(10, 1), (10, 2), (10, 3), (10, 8);

-- Continue for remaining games (11-30)
INSERT INTO GAME_PLATFORM (game_id, platform_id) VALUES
(11, 1), (11, 2), (11, 3), (11, 8),
(12, 2), (12, 6),
(13, 2), (13, 6),
(14, 2), (14, 6),
(15, 1), (15, 2), (15, 3), (15, 8),
(16, 2), (16, 6),
(17, 1), (17, 2), (17, 3), (17, 4), (17, 8),
(18, 1), (18, 2), (18, 3), (18, 4), (18, 8),
(19, 1), (19, 2), (19, 3), (19, 8),
(20, 1), (20, 8),
(21, 1), (21, 2), (21, 3), (21, 4), (21, 8),
(22, 1), (22, 2), (22, 3), (22, 4), (22, 8),
(23, 1), (23, 2), (23, 3), (23, 4), (23, 8),
(24, 1), (24, 2), (24, 3), (24, 8),
(25, 1), (25, 2), (25, 8),
(26, 1), (26, 2), (26, 3), (26, 8),
(27, 1), (27, 2), (27, 3), (27, 8),
(28, 1), (28, 2), (28, 3), (28, 4), (28, 8),
(29, 1), (29, 2), (29, 3), (29, 4), (29, 8),
(30, 1), (30, 2), (30, 3), (30, 4), (30, 8);

-- ============================================================================
-- SAMPLE DATA - GAME_GENRE RELATIONSHIPS
-- ============================================================================

INSERT INTO GAME_GENRE (game_id, genre_id) VALUES
-- Elden Ring: Action, RPG, Open World
(1, 1), (1, 2), (1, 14),
-- Zelda BOTW: Action, Adventure, Open World
(2, 1), (2, 3), (2, 14),
-- Red Dead Redemption 2: Action, Adventure, Open World
(3, 1), (3, 3), (3, 14),
-- Witcher 3: RPG, Action, Open World
(4, 2), (4, 1), (4, 14),
-- God of War: Action, Adventure
(5, 1), (5, 3),
-- Hades: Action, RPG, Indie
(6, 1), (6, 2), (6, 15),
-- Hollow Knight: Action, Adventure, Platformer, Indie
(7, 1), (7, 3), (7, 12), (7, 15),
-- Celeste: Platformer, Indie
(8, 12), (8, 15),
-- Horizon Zero Dawn: Action, RPG, Open World
(9, 1), (9, 2), (9, 14),
-- Sekiro: Action, Adventure
(10, 1), (10, 3);

INSERT INTO GAME_GENRE (game_id, genre_id) VALUES
(11, 1), (11, 2),
(12, 1), (12, 2), (12, 10),
(13, 1), (13, 3), (13, 14),
(14, 1), (14, 3), (14, 13),
(15, 2), (15, 1), (15, 14),
(16, 1), (16, 3), (16, 14),
(17, 9), (17, 2), (17, 15),
(18, 2), (18, 15),
(19, 8), (19, 12),
(20, 5), (20, 1),
(21, 9), (21, 13), (21, 14),
(22, 1), (22, 3), (22, 13),
(23, 5), (23, 1),
(24, 1), (24, 3),
(25, 1), (25, 3), (25, 14),
(26, 10), (26, 13), (26, 5),
(27, 1), (27, 3), (27, 12),
(28, 2), (28, 15),
(29, 3), (29, 8), (29, 15),
(30, 8), (30, 3), (30, 15);

-- ============================================================================
-- DATABASE INITIALIZATION COMPLETE
-- ============================================================================
--
-- Summary:
-- - 30 games loaded
-- - 8 platforms configured
-- - 16 genres configured
-- - All relationships established
-- - Social features tables created
--
-- Next steps:
-- 1. Start the backend: cd backend && mvn spring-boot:run
-- 2. Start the frontend: cd frontend && npm run dev
-- 3. Access at: http://localhost:3000
--
-- ============================================================================

