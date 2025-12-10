-- ============================================================================
-- queries.sql
-- Purpose: Documentation of all SQL queries used in the GameHub application.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USER AUTHENTICATION & PROFILE
-- ----------------------------------------------------------------------------
-- Purpose: Creating a new user account
-- Page: /auth/register
INSERT INTO USER (username, email, password_hash, display_name, country) VALUES (?, ?, ?, ?, ?);

-- Purpose: Retrieving user details by email for login
-- Page: /auth/signin
SELECT * FROM USER WHERE email = ?;

-- Purpose: Updating last login timestamp
-- Page: /auth/signin
UPDATE USER SET last_login = NOW() WHERE user_id = ?;

-- Purpose: Getting public user profile
-- Page: /profile
SELECT * FROM USER WHERE user_id = ?;

-- Purpose: User Leaderboard (Most Achievements)
-- Page: /community
SELECT user_id, username, display_name, avatar_url, total_achievements 
FROM USER ORDER BY total_achievements DESC;

-- Purpose: Search Users
-- Page: /community
SELECT * FROM USER WHERE username LIKE ? LIMIT 20;

-- ----------------------------------------------------------------------------
-- 2. GAME BROWSING & DISCOVERY
-- ----------------------------------------------------------------------------
-- Purpose: Retrieve all games with pagination
-- Page: /games
SELECT g.*, 
       (SELECT AVG(r.rating) FROM REVIEW r WHERE r.game_id = g.game_id) as avg_rating
FROM GAME g 
ORDER BY g.title 
LIMIT ? OFFSET ?;

-- Purpose: Search games by title
-- Page: /games (Search Bar)
SELECT DISTINCT g.* FROM GAME g WHERE g.title LIKE ? ORDER BY g.title LIMIT 50;

-- Purpose: Get single game details
-- Page: /games/[id]
SELECT * FROM GAME WHERE game_id = ?;

-- Purpose: Get detailed game stats (Players, Completion Rate)
-- Page: /games/[id]
SELECT 
    g.game_id, g.title,
    COUNT(DISTINCT ug.user_id) as totalPlayers, 
    AVG(ug.completion_percentage) as avgCompletionRate, 
    AVG(r.rating) as avgRating, 
    COUNT(DISTINCT r.review_id) as reviewCount 
FROM GAME g 
LEFT JOIN USER_GAME ug ON g.game_id = ug.game_id 
LEFT JOIN REVIEW r ON g.game_id = r.game_id 
WHERE g.game_id = ? 
GROUP BY g.game_id;

-- Purpose: Get Popular Games (Most Players)
-- Page: /home
SELECT g.*, COUNT(DISTINCT ug.user_id) as player_count 
FROM GAME g 
LEFT JOIN USER_GAME ug ON g.game_id = ug.game_id 
GROUP BY g.game_id 
ORDER BY player_count DESC 
LIMIT ?;

-- ----------------------------------------------------------------------------
-- 3. ALGORITHMIC RECOMMENDATIONS
-- ----------------------------------------------------------------------------
-- Purpose: Recommend games based on user's favorite genres
-- Logic: Finds genres the user plays most, then finds high-rated games in those genres that the user DOESN'T own.
-- Page: /home
SELECT g.game_id, g.title, g.cover_image_url, g.description, 
       g.metacritic_score, AVG(r.rating) as avg_rating, 
       COUNT(DISTINCT ug.user_id) as popularity 
FROM GAME g 
JOIN GAME_GENRE gg ON g.game_id = gg.game_id 
LEFT JOIN REVIEW r ON g.game_id = r.game_id 
LEFT JOIN USER_GAME ug ON g.game_id = ug.game_id 
WHERE gg.genre_id IN ( 
    -- Subquery: User's Top Genres
    SELECT gg2.genre_id 
    FROM USER_GAME ug2 
    JOIN GAME_GENRE gg2 ON ug2.game_id = gg2.game_id 
    WHERE ug2.user_id = ? 
    GROUP BY gg2.genre_id 
    ORDER BY COUNT(*) DESC 
    LIMIT 3 
) 
AND g.game_id NOT IN ( 
    SELECT game_id FROM USER_GAME WHERE user_id = ? 
) 
GROUP BY g.game_id 
HAVING avg_rating >= 7.0 OR avg_rating IS NULL 
ORDER BY popularity DESC, avg_rating DESC 
LIMIT ?;

-- ----------------------------------------------------------------------------
-- 4. REVIEWS & INTERACTIONS
-- ----------------------------------------------------------------------------
-- Purpose: Get all reviews for a specific game with user info
-- Page: /games/[id]
SELECT r.*, u.username, u.avatar_url, u.display_name,
       (SELECT COUNT(*) FROM REVIEW_LIKE rl WHERE rl.review_id = r.review_id) as calculated_likes
FROM REVIEW r
JOIN USER u ON r.user_id = u.user_id
WHERE r.game_id = ?
ORDER BY r.created_date DESC;

-- Purpose: Get Recent Global Reviews
-- Page: /community
SELECT r.*, u.username, g.title, g.cover_image_url
FROM REVIEW r
JOIN USER u ON r.user_id = u.user_id
JOIN GAME g ON r.game_id = g.game_id
ORDER BY r.created_date DESC
LIMIT ?;

-- Purpose: Post a new review
-- Page: /games/[id]
INSERT INTO REVIEW (user_id, game_id, rating, review_text, helpful_count, likes_count, replies_count) 
VALUES (?, ?, ?, ?, 0, 0, 0);

-- Purpose: Vote on Review (Helpful/Not Helpful)
-- Page: /games/[id]
UPDATE REVIEW SET helpful_count = helpful_count + 1 WHERE review_id = ?;

-- Purpose: Like/Unlike Review
-- Page: /games/[id]
INSERT INTO REVIEW_LIKE (review_id, user_id) VALUES (?, ?);
UPDATE REVIEW SET likes_count = likes_count + ? WHERE review_id = ?;

-- ----------------------------------------------------------------------------
-- 5. USER LIBRARY & STATS
-- ----------------------------------------------------------------------------
-- Purpose: Add/Update Game in Library
-- Page: /games/[id]
INSERT INTO USER_GAME (user_id, game_id, platform_id, status, ownership_date) VALUES (?, ?, ?, ?, CURDATE());

-- Purpose: Get Full Library with Game Details
-- Page: /library
SELECT ug.*, g.title, g.cover_image_url, g.metacritic_score,
       (SELECT AVG(r.rating) FROM REVIEW r WHERE r.game_id = g.game_id) as avg_rating
FROM USER_GAME ug
JOIN GAME g ON ug.game_id = g.game_id
WHERE ug.user_id = ?
ORDER BY ug.last_played DESC;

-- Purpose: Get User Library Statistics
-- Page: /profile
SELECT 
    COUNT(*) as total_games,
    SUM(CASE WHEN status = 'playing' THEN 1 ELSE 0 END) as playing,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'wishlist' THEN 1 ELSE 0 END) as wishlist,
    SUM(playtime_hours) as total_playtime,
    AVG(completion_percentage) as avg_completion
FROM USER_GAME
WHERE user_id = ?;

-- ----------------------------------------------------------------------------
-- 6. ACTIVITY FEED
-- ----------------------------------------------------------------------------
-- Purpose: Get Global Activity Feed
-- Page: /home
SELECT a.*, u.username, u.avatar_url, g.title as game_title
FROM ACTIVITY a
JOIN USER u ON a.user_id = u.user_id
LEFT JOIN GAME g ON a.game_id = g.game_id
ORDER BY a.created_at DESC
LIMIT ?;

-- Purpose: Get Activities by Specific Type (e.g., 'REVIEW_POSTED')
-- Page: /community
SELECT a.*, u.username, g.title
FROM ACTIVITY a
JOIN USER u ON a.user_id = u.user_id
LEFT JOIN GAME g ON a.game_id = g.game_id
WHERE a.activity_type = ?
ORDER BY a.created_at DESC;

-- ----------------------------------------------------------------------------
-- 7. AI SYSTEM (Caching)
-- ----------------------------------------------------------------------------
-- Purpose: Retrieve cached AI summary
SELECT summary_text, updated_at FROM GAME_AI_SUMMARY WHERE game_title = ?;

-- Purpose: Upsert AI summary (Cache for 24 hours logic handled in app)
INSERT INTO GAME_AI_SUMMARY (game_title, summary_text, updated_at) 
VALUES (?, ?, NOW()) 
ON DUPLICATE KEY UPDATE summary_text = VALUES(summary_text), updated_at = NOW();
