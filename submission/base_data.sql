-- ============================================================================
-- Data Insertion - Base Data Only (Steam CDN Images)
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

-- Using Steam CDN for reliable cover art (library_600x900.jpg)
INSERT INTO GAME (game_id, title, description, release_date, developer, publisher, total_achievements, avg_completion_time_hours, metacritic_score, cover_image_url) VALUES
(1, 'Elden Ring', 'An action RPG set in a dark fantasy world created by FromSoftware and George R.R. Martin', '2022-02-25', 'FromSoftware', 'Bandai Namco', 42, 80.0, 96, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg'),
(3, 'Red Dead Redemption 2', 'Epic tale of life in America at the dawn of the modern age', '2018-10-26', 'Rockstar Games', 'Rockstar Games', 52, 60.0, 97, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg'),
(4, 'The Witcher 3: Wild Hunt', 'Story-driven open world RPG set in a visually stunning fantasy universe', '2015-05-19', 'CD Projekt Red', 'CD Projekt', 78, 100.5, 93, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg'),
(5, 'God of War', 'Action-adventure game following Kratos in Norse mythology', '2018-04-20', 'Santa Monica Studio', 'Sony Interactive Entertainment', 37, 25.0, 94, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg'),
(6, 'Hades', 'Rogue-like dungeon crawler combining Greek mythology with fast-paced action', '2020-09-17', 'Supergiant Games', 'Supergiant Games', 49, 30.0, 93, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900.jpg'),
(7, 'Hollow Knight', 'Challenging 2D action-adventure through a vast interconnected world', '2017-02-24', 'Team Cherry', 'Team Cherry', 63, 35.0, 90, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg'),
(8, 'Celeste', 'Platformer about climbing a mountain and overcoming personal challenges', '2018-01-25', 'Maddy Makes Games', 'Maddy Makes Games', 30, 12.0, 92, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/library_600x900.jpg'),
(9, 'Horizon Zero Dawn', 'Action RPG in a post-apocalyptic world dominated by machines', '2017-02-28', 'Guerrilla Games', 'Sony Interactive Entertainment', 56, 40.0, 89, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1151640/library_600x900.jpg'),
(10, 'Sekiro: Shadows Die Twice', 'Action-adventure game set in Sengoku period Japan', '2019-03-22', 'FromSoftware', 'Activision', 34, 35.0, 90, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900.jpg');

INSERT INTO GAME (game_id, title, description, release_date, developer, publisher, total_achievements, avg_completion_time_hours, metacritic_score, cover_image_url) VALUES
(11, 'Dark Souls III', 'Dark fantasy action RPG known for its challenging gameplay', '2016-04-12', 'FromSoftware', 'Bandai Namco', 43, 50.0, 89, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/374320/library_600x900.jpg'),
(13, 'Ghost of Tsushima', 'Open-world samurai adventure set in feudal Japan', '2020-07-17', 'Sucker Punch Productions', 'Sony Interactive Entertainment', 34, 30.0, 85, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2215430/library_600x900.jpg'),
(15, 'Cyberpunk 2077', 'Open-world RPG set in the dystopian Night City', '2020-12-10', 'CD Projekt Red', 'CD Projekt', 44, 60.0, 86, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg'),
(16, 'Spider-Man', 'Superhero action-adventure featuring Marvel\'s Spider-Man', '2018-09-07', 'Insomniac Games', 'Sony Interactive Entertainment', 42, 20.0, 87, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900.jpg'),
(17, 'Stardew Valley', 'Farming simulation RPG with life simulation elements', '2016-02-26', 'ConcernedApe', 'ConcernedApe', 40, 80.0, 89, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900.jpg'),
(18, 'Undertale', 'Indie RPG where you can choose to spare enemies', '2015-09-15', 'Toby Fox', 'Toby Fox', 0, 8.0, 92, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/library_600x900.jpg'),
(19, 'Portal 2', 'First-person puzzle-platform game with innovative mechanics', '2011-04-19', 'Valve', 'Valve', 51, 10.0, 95, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/library_600x900.jpg'),
(20, 'Half-Life: Alyx', 'VR first-person shooter set in the Half-Life universe', '2020-03-23', 'Valve', 'Valve', 0, 12.0, 93, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/546560/library_600x900.jpg');

INSERT INTO GAME (game_id, title, description, release_date, developer, publisher, total_achievements, avg_completion_time_hours, metacritic_score, cover_image_url) VALUES
(22, 'Terraria', '2D sandbox adventure with crafting and exploration', '2011-05-16', 'Re-Logic', 'Re-Logic', 104, 100.0, 83, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/library_600x900.jpg'),
(23, 'Doom Eternal', 'Fast-paced first-person shooter with intense demon-slaying action', '2020-03-20', 'id Software', 'Bethesda', 54, 15.0, 88, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/782330/library_600x900.jpg'),
(24, 'Control', 'Third-person action-adventure with supernatural elements', '2019-08-27', 'Remedy Entertainment', '505 Games', 37, 18.0, 85, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/870780/library_600x900.jpg'),
(25, 'Death Stranding', 'Action game with unique delivery and connection mechanics', '2019-11-08', 'Kojima Productions', 'Sony Interactive Entertainment', 63, 45.0, 82, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/library_600x900.jpg'),
(26, 'Resident Evil Village', 'Survival horror game continuing the Resident Evil saga', '2021-05-07', 'Capcom', 'Capcom', 49, 12.0, 84, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/library_600x900.jpg'),
(27, 'It Takes Two', 'Co-op action-adventure requiring two players', '2021-03-26', 'Hazelight Studios', 'Electronic Arts', 21, 14.0, 88, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1426210/library_600x900.jpg'),
(28, 'Disco Elysium', 'Narrative-driven RPG with deep dialogue and choices', '2019-10-15', 'ZA/UM', 'ZA/UM', 0, 25.0, 91, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632470/library_600x900.jpg'),
(29, 'Outer Wilds', 'Exploration game about a solar system trapped in a time loop', '2019-05-30', 'Mobius Digital', 'Annapurna Interactive', 0, 20.0, 85, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/753640/library_600x900.jpg'),
(30, 'Return of the Obra Dinn', 'Mystery puzzle game with unique visual style', '2018-10-18', 'Lucas Pope', '3909', 0, 12.0, 89, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/653530/library_600x900.jpg');

INSERT INTO GAME_PLATFORM (game_id, platform_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 8),
(3, 1), (3, 2), (3, 3), (3, 8),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 8),
(5, 2), (5, 6),
(6, 1), (6, 2), (6, 3), (6, 4), (6, 8),
(7, 1), (7, 2), (7, 3), (7, 4), (7, 8),
(8, 1), (8, 2), (8, 3), (8, 4), (8, 8),
(9, 1), (9, 2), (9, 8),
(10, 1), (10, 2), (10, 3), (10, 8),
(11, 1), (11, 2), (11, 3), (11, 8),
(13, 2), (13, 6),
(15, 1), (15, 2), (15, 3), (15, 8),
(16, 2), (16, 6),
(17, 1), (17, 2), (17, 3), (17, 4), (17, 8),
(18, 1), (18, 2), (18, 3), (18, 4), (18, 8),
(19, 1), (19, 2), (19, 3), (19, 8),
(20, 1), (20, 8),
(22, 1), (22, 2), (22, 3), (22, 4), (22, 8),
(23, 1), (23, 2), (23, 3), (23, 4), (23, 8),
(24, 1), (24, 2), (24, 3), (24, 8),
(25, 1), (25, 2), (25, 8),
(26, 1), (26, 2), (26, 3), (26, 8),
(27, 1), (27, 2), (27, 3), (27, 8),
(28, 1), (28, 2), (28, 3), (28, 4), (28, 8),
(29, 1), (29, 2), (29, 3), (29, 4), (29, 8),
(30, 1), (30, 2), (30, 3), (30, 4), (30, 8);

INSERT INTO GAME_GENRE (game_id, genre_id) VALUES
(1, 1), (1, 2), (1, 14),
(3, 1), (3, 3), (3, 14),
(4, 2), (4, 1), (4, 14),
(5, 1), (5, 3),
(6, 1), (6, 2), (6, 15),
(7, 1), (7, 3), (7, 12), (7, 15),
(8, 12), (8, 15),
(9, 1), (9, 2), (9, 14),
(10, 1), (10, 3),
(11, 1), (11, 2),
(13, 1), (13, 3), (13, 14),
(15, 2), (15, 1), (15, 14),
(16, 1), (16, 3), (16, 14),
(17, 9), (17, 2), (17, 15),
(18, 2), (18, 15),
(19, 8), (19, 12),
(20, 5), (20, 1),
(22, 1), (22, 3), (22, 13),
(23, 5), (23, 1),
(24, 1), (24, 3),
(25, 1), (25, 3), (25, 14),
(26, 10), (26, 13), (26, 5),
(27, 1), (27, 3), (27, 12),
(28, 2), (28, 15),
(29, 3), (29, 8), (29, 15),
(30, 8), (30, 3), (30, 15);

INSERT INTO USER (username, email, password_hash, display_name, bio, country, level, reviews_count, total_achievements, total_playtime_hours, account_created, last_login) VALUES
('demo', 'demo@gamehub.com', '$2b$12$Q6sD7VAHtNd0Bh2ajiKXOumkoTLtejKxbaE35IDOO6NmI6RCKU126', 'Demo User', 'Welcome to GameHub! This is a demo account.', 'United States', 1, 0, 0, 0, NOW(), NOW()),
('alice', 'alice@gamehub.com', '$2b$12$Q6sD7VAHtNd0Bh2ajiKXOumkoTLtejKxbaE35IDOO6NmI6RCKU126', 'Alice Johnson', 'RPG enthusiast and achievement hunter', 'Canada', 15, 12, 150, 320, NOW(), NOW()),
('bob', 'bob@gamehub.com', '$2b$12$Q6sD7VAHtNd0Bh2ajiKXOumkoTLtejKxbaE35IDOO6NmI6RCKU126', 'Bob Smith', 'Indie game lover', 'United Kingdom', 8, 5, 85, 180, NOW(), NOW()),
('charlie', 'charlie@gamehub.com', '$2b$12$Q6sD7VAHtNd0Bh2ajiKXOumkoTLtejKxbaE35IDOO6NmI6RCKU126', 'Charlie Brown', 'Speedrunner and platformer fan', 'Australia', 20, 18, 200, 450, NOW(), NOW()),
('diana', 'diana@gamehub.com', '$2b$12$Q6sD7VAHtNd0Bh2ajiKXOumkoTLtejKxbaE35IDOO6NmI6RCKU126', 'Diana Prince', 'Open world explorer', 'Germany', 12, 8, 120, 280, NOW(), NOW());

INSERT INTO REVIEW (user_id, game_id, rating, review_text, recommended, helpful_count, likes_count) VALUES
(1, 1, 5, 'Absolutely masterpiece! The story, gameplay, and graphics are all top-notch. A must-play for any gamer.', TRUE, 15, 23),
(2, 1, 4, 'Great game overall, but the combat can feel repetitive at times. Still highly recommend it!', TRUE, 8, 12),
(1, 3, 4, 'Fantastic RPG with deep storytelling. Some technical issues on launch but mostly fixed now.', TRUE, 12, 18),
(2, 5, 5, 'Perfect blend of action and stealth. The world feels alive and reactive to your choices.', TRUE, 18, 28),
(4, 8, 3, 'Good game but not for everyone. The difficulty can be frustrating at times.', TRUE, 5, 7),
(5, 10, 5, 'Challenging but fair. Every victory feels earned. Amazing boss fights!', TRUE, 22, 40),
(3, 15, 4, 'Beautiful world and engaging story. Combat is fun but could use more variety.', TRUE, 10, 15),
(4, 20, 2, 'Disappointing compared to the hype. Lots of bugs and performance issues.', FALSE, 8, 10),
(5, 25, 5, 'Incredible atmosphere and level design. A true work of art.', TRUE, 16, 25);
