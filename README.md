# GameHub - Gaming Social Community Platform

**A full-stack web application for gaming enthusiasts to discover, collect, review, and discuss games.**

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Implementation Details](#implementation-details)
- [Testing](#testing)

---

## 🎮 Project Overview

GameHub is a modern gaming social community platform that enables users to:
- Browse and discover games from a curated collection
- Build and manage personal game collections and wishlists
- Write and share game reviews with ratings
- Engage with the community through likes, replies, and activity feeds
- View user profiles and gaming activity

This project demonstrates a complete full-stack application with:
- RESTful API design
- JWT-based authentication
- Relational database modeling
- Modern frontend with React and Next.js
- Social features and real-time updates

---

## ✨ Features

### Core Functionality

1. **User Authentication & Authorization**
   - User registration with email validation
   - Secure login with JWT token generation
   - Password hashing with BCrypt
   - Protected routes and API endpoints

2. **Game Discovery**
   - Browse 30+ pre-loaded popular games
   - Search games by title
   - View detailed game information
   - Filter and sort capabilities

3. **Personal Collection Management**
   - Add games to personal collection
   - Maintain a wishlist of desired games
   - Switch games between collection and wishlist
   - Remove games from library
   - View collection statistics

4. **Review System**
   - Write detailed game reviews
   - Rate games on a scale of 1-10
   - Mark games as recommended or not recommended
   - View all reviews for a specific game
   - Paginated review display

5. **Social Interaction**
   - Like and unlike reviews
   - Reply to reviews with comments
   - View threaded reply conversations
   - Real-time like and reply count updates

6. **Community Feed**
   - Activity stream showing recent user actions
   - Activity types: add_game, post_review, like_review, reply_review
   - User information and timestamps
   - Related game information

7. **User Profiles**
   - View user information
   - Browse user's game collection
   - See user's review history
   - Display user statistics

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.2.0 | Application framework |
| Java | 17+ | Programming language |
| MySQL | 8.0 | Relational database |
| JdbcTemplate | - | Database access |
| JWT | - | Authentication tokens |
| BCrypt | - | Password hashing |
| Maven | 3.6+ | Build tool |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework |
| React | 18 | UI library |
| TypeScript | 5+ | Type-safe JavaScript |
| Tailwind CSS | 3+ | Styling framework |
| Turbopack | - | Build tool |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | MySQL containerization |
| Git | Version control |

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│                      (http://localhost:3000)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST API
                           │ JSON Requests/Responses
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (Port 3000)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │  API Client  │     │
│  │  (App Router)│  │   (React)    │  │  (lib/api.ts)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API Calls
                           │ Authorization: Bearer <JWT>
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot Backend (Port 8080)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │  │ Repositories │  │  JWT Util    │     │
│  │  (REST API)  │  │ (JdbcTemplate)│  │ (Auth Logic) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC Connection
                           │ SQL Queries
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                MySQL Database (Port 3306)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: USER, GAME, REVIEW, USER_GAME, ACTIVITY    │  │
│  │  Relationships: Foreign Keys, Indexes                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow Example

**User writes a review:**

1. User submits review form in browser
2. Frontend sends POST request to `/api/reviews` with JWT token
3. Backend validates JWT and extracts user ID
4. Backend inserts review into REVIEW table
5. Backend creates activity record in ACTIVITY table
6. Backend returns created review as JSON
7. Frontend updates UI with new review

---

## 📊 Database Design

### Entity-Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    USER     │         │    GAME     │         │   REVIEW    │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ user_id (PK)│────┐    │ game_id (PK)│────┐    │ review_id   │
│ username    │    │    │ title       │    │    │ user_id (FK)│
│ email       │    │    │ description │    │    │ game_id (FK)│
│ password    │    │    │ release_date│    │    │ rating      │
│ display_name│    │    │ developer   │    │    │ review_text │
└─────────────┘    │    └─────────────┘    │    │ recommended │
                   │                        │    │ likes_count │
                   │                        │    │ replies_count│
                   │                        │    │ created_date│
                   │                        │    └─────────────┘
                   │                        │           │
                   │                        │           │
                   ▼                        ▼           │
            ┌─────────────┐         ┌─────────────┐   │
            │  USER_GAME  │         │ REVIEW_LIKE │   │
            ├─────────────┤         ├─────────────┤   │
            │ user_game_id│         │ like_id (PK)│   │
            │ user_id (FK)│         │ review_id   │   │
            │ game_id (FK)│         │ user_id (FK)│   │
            │ status      │         │ created_at  │   │
            │ playtime    │         └─────────────┘   │
            └─────────────┘                           │
                                                      │
                   ┌──────────────────────────────────┘
                   │
                   ▼
            ┌─────────────┐         ┌─────────────┐
            │REVIEW_REPLY │         │  ACTIVITY   │
            ├─────────────┤         ├─────────────┤
            │ reply_id    │         │ activity_id │
            │ review_id   │         │ user_id (FK)│
            │ user_id (FK)│         │ activity_type│
            │ reply_text  │         │ game_id (FK)│
            │ created_at  │         │ review_id   │
            └─────────────┘         │ activity_text│
                                    │ created_at  │
                                    └─────────────┘
```

### Core Tables

#### 1. USER
Stores user account information and profile data.

| Column | Type | Description |
|--------|------|-------------|
| user_id | INT (PK) | Primary key |
| username | VARCHAR(50) | Unique username |
| email | VARCHAR(100) | Unique email |
| password_hash | VARCHAR(255) | BCrypt hashed password |
| display_name | VARCHAR(100) | Display name |
| bio | TEXT | User biography |
| avatar_url | VARCHAR(255) | Profile picture URL |
| account_created | TIMESTAMP | Registration date |

#### 2. GAME
Contains game information and metadata.

| Column | Type | Description |
|--------|------|-------------|
| game_id | INT (PK) | Primary key |
| title | VARCHAR(200) | Game title |
| description | TEXT | Game description |
| release_date | DATE | Release date |
| developer | VARCHAR(100) | Developer name |
| publisher | VARCHAR(100) | Publisher name |
| genre | VARCHAR(50) | Game genre |

#### 3. USER_GAME
Junction table for user's game collection and wishlist.

| Column | Type | Description |
|--------|------|-------------|
| user_game_id | INT (PK) | Primary key |
| user_id | INT (FK) | References USER |
| game_id | INT (FK) | References GAME |
| status | ENUM | 'owned' or 'wishlist' |
| playtime_hours | DECIMAL | Hours played |
| completion_percentage | DECIMAL | Completion % |
| added_date | TIMESTAMP | Date added |

#### 4. REVIEW
User reviews for games.

| Column | Type | Description |
|--------|------|-------------|
| review_id | INT (PK) | Primary key |
| user_id | INT (FK) | References USER |
| game_id | INT (FK) | References GAME |
| rating | INT | Rating (1-10) |
| review_text | TEXT | Review content |
| recommended | BOOLEAN | Recommendation flag |
| likes_count | INT | Number of likes |
| replies_count | INT | Number of replies |
| created_date | TIMESTAMP | Creation date |

#### 5. REVIEW_LIKE
Tracks which users liked which reviews.

| Column | Type | Description |
|--------|------|-------------|
| like_id | INT (PK) | Primary key |
| review_id | INT (FK) | References REVIEW |
| user_id | INT (FK) | References USER |
| created_at | TIMESTAMP | Like timestamp |

**Unique constraint**: (review_id, user_id) - prevents duplicate likes

#### 6. REVIEW_REPLY
Comments/replies on reviews.

| Column | Type | Description |
|--------|------|-------------|
| reply_id | INT (PK) | Primary key |
| review_id | INT (FK) | References REVIEW |
| user_id | INT (FK) | References USER |
| reply_text | TEXT | Reply content |
| created_at | TIMESTAMP | Reply timestamp |

#### 7. ACTIVITY
Tracks user activities for the community feed.

| Column | Type | Description |
|--------|------|-------------|
| activity_id | INT (PK) | Primary key |
| user_id | INT (FK) | References USER |
| activity_type | ENUM | Type of activity |
| game_id | INT (FK) | Related game (optional) |
| review_id | INT (FK) | Related review (optional) |
| activity_text | TEXT | Activity description |
| created_at | TIMESTAMP | Activity timestamp |

**Activity Types**:
- `add_game`: User added game to collection
- `post_review`: User posted a review
- `like_review`: User liked a review
- `reply_review`: User replied to a review
- `rate_game`: User rated a game (reserved)

### Database Indexes

Key indexes for performance optimization:

```sql
-- USER table
CREATE INDEX idx_username ON USER(username);
CREATE INDEX idx_email ON USER(email);

-- REVIEW table
CREATE INDEX idx_game_reviews ON REVIEW(game_id, created_date DESC);
CREATE INDEX idx_user_reviews ON REVIEW(user_id, created_date DESC);

-- USER_GAME table
CREATE INDEX idx_user_library ON USER_GAME(user_id, status);
CREATE INDEX idx_game_owners ON USER_GAME(game_id, status);

-- ACTIVITY table
CREATE INDEX idx_user_activity ON ACTIVITY(user_id, created_at DESC);
CREATE INDEX idx_activity_type ON ACTIVITY(activity_type);
CREATE INDEX idx_created_at ON ACTIVITY(created_at DESC);

-- REVIEW_LIKE table
CREATE UNIQUE INDEX idx_unique_like ON REVIEW_LIKE(review_id, user_id);
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 18 or higher
- **Docker Desktop**: For running MySQL
- **Maven**: Version 3.6 or higher (or use included wrapper)
- **Git**: For version control

### Step-by-Step Setup

#### 1. Clone or Navigate to Project

```bash
cd /Users/jianghanqi/Desktop/final_project
```

#### 2. Start MySQL Database

```bash
docker run --name gamehub-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=gamehub \
  -e MYSQL_USER=gamehub \
  -e MYSQL_PASSWORD=gamehub123 \
  -p 3306:3306 \
  -d mysql:8.0
```

Wait about 10 seconds for MySQL to initialize.

#### 3. Initialize Database Schema and Data

```bash
# Initialize complete database (schema + sample data + social features)
docker exec -i gamehub-mysql mysql -ugamehub -pgamehub123 gamehub < database/init_database.sql
```

This single script creates:
- All database tables and relationships
- 30 popular games with metadata
- Platform and genre data
- Social features (likes, replies, activity feed)

#### 4. Start Backend Server

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend API will be available at: `http://localhost:8080/api`

You should see output like:
```
🎮 GameHub Backend Started!
📍 API Base URL: http://localhost:8080/api
📊 Database: MySQL (gamehub)
🔒 Security: JWT Authentication
```

#### 5. Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:3000`

#### 6. Access the Application

Open your web browser and navigate to:

**http://localhost:3000**

### Quick Start Guide

1. **Register an Account**
   - Click "Sign Up" or navigate to registration
   - Enter username, email, and password
   - Submit to create account

2. **Browse Games**
   - Click "Browse Games" in the navigation
   - View the collection of 30 games
   - Click on any game for details

3. **Add to Collection**
   - On a game detail page, click "Add to Collection"
   - Or click "Add to Wishlist" for games you want

4. **Write a Review**
   - On a game detail page, scroll to the review section
   - Enter your rating (1-10) and review text
   - Submit your review

5. **Engage with Community**
   - Like reviews by clicking the heart icon
   - Reply to reviews with comments
   - View the Community Feed on the homepage

---

## 📡 API Documentation

### Base URL

```
http://localhost:8080/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication Endpoints

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 1,
  "username": "johndoe"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 1,
  "username": "johndoe"
}
```

#### Game Endpoints

**Get All Games**
```http
GET /api/games

Response: 200 OK
[
  {
    "gameId": 1,
    "title": "Elden Ring",
    "description": "An action RPG...",
    "releaseDate": "2022-02-25",
    "developer": "FromSoftware",
    "genre": "Action RPG"
  },
  ...
]
```

**Get Game by ID**
```http
GET /api/games/{id}

Response: 200 OK
{
  "gameId": 1,
  "title": "Elden Ring",
  "description": "An action RPG...",
  ...
}
```

**Search Games**
```http
GET /api/games/search?query=zelda

Response: 200 OK
[
  {
    "gameId": 2,
    "title": "The Legend of Zelda: Breath of the Wild",
    ...
  }
]
```

#### Review Endpoints

**Get Reviews for Game**
```http
GET /api/reviews/game/{gameId}?page=0&size=10

Response: 200 OK
[
  {
    "reviewId": 1,
    "userId": 5,
    "gameId": 1,
    "rating": 9,
    "reviewText": "Amazing game!",
    "recommended": true,
    "likesCount": 15,
    "repliesCount": 3,
    "createdDate": "2025-11-10T10:30:00",
    "username": "johndoe",
    "displayName": "John Doe"
  },
  ...
]
```

**Create Review**
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": 1,
  "rating": 9,
  "reviewText": "This game is incredible!",
  "recommended": true
}

Response: 201 Created
{
  "reviewId": 42,
  "userId": 1,
  "gameId": 1,
  ...
}
```

**Like Review**
```http
POST /api/reviews/{reviewId}/like
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Review liked successfully",
  "likesCount": 16
}
```

**Unlike Review**
```http
DELETE /api/reviews/{reviewId}/unlike
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Review unliked successfully",
  "likesCount": 15
}
```

**Reply to Review**
```http
POST /api/reviews/{reviewId}/reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "replyText": "I totally agree!"
}

Response: 201 Created
{
  "replyId": 10,
  "reviewId": 1,
  "userId": 2,
  "replyText": "I totally agree!",
  "createdAt": "2025-11-10T11:00:00"
}
```

**Get Review Replies**
```http
GET /api/reviews/{reviewId}/replies

Response: 200 OK
[
  {
    "replyId": 10,
    "reviewId": 1,
    "userId": 2,
    "username": "janedoe",
    "displayName": "Jane Doe",
    "replyText": "I totally agree!",
    "createdAt": "2025-11-10T11:00:00"
  },
  ...
]
```

#### Library Endpoints

**Get User Library**
```http
GET /api/library?status=owned
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "userGameId": 1,
    "userId": 1,
    "gameId": 1,
    "status": "owned",
    "playtimeHours": 45.5,
    "completionPercentage": 75.0,
    "addedDate": "2025-10-15T14:20:00",
    "gameTitle": "Elden Ring"
  },
  ...
]
```

**Add Game to Library**
```http
POST /api/library
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": 1,
  "status": "owned",
  "platformId": 1
}

Response: 201 Created
{
  "userGameId": 1,
  "userId": 1,
  "gameId": 1,
  "status": "owned",
  ...
}
```

**Update Library Entry**
```http
PUT /api/library/{userGameId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "owned",
  "playtimeHours": 50.0,
  "completionPercentage": 80.0
}

Response: 200 OK
{
  "userGameId": 1,
  "status": "owned",
  "playtimeHours": 50.0,
  ...
}
```

**Remove from Library**
```http
DELETE /api/library/{userGameId}
Authorization: Bearer <token>

Response: 204 No Content
```

#### Activity Endpoints

**Get Recent Activities**
```http
GET /api/activities?limit=20

Response: 200 OK
[
  {
    "activityId": 5,
    "userId": 2,
    "activityType": "post_review",
    "gameId": 1,
    "reviewId": 42,
    "activityText": "wrote a review for",
    "createdAt": "2025-11-10T15:30:00",
    "username": "johndoe",
    "displayName": "John Doe",
    "gameTitle": "Elden Ring"
  },
  ...
]
```

#### User Endpoints

**Get User Profile**
```http
GET /api/users/{userId}

Response: 200 OK
{
  "userId": 1,
  "username": "johndoe",
  "displayName": "John Doe",
  "bio": "Avid gamer and reviewer",
  "accountCreated": "2025-09-01T10:00:00"
}
```

**Get User Reviews**
```http
GET /api/users/{userId}/reviews

Response: 200 OK
[
  {
    "reviewId": 42,
    "gameId": 1,
    "gameTitle": "Elden Ring",
    "rating": 9,
    "reviewText": "Amazing game!",
    ...
  },
  ...
]
```

### Error Responses

All endpoints may return error responses:

```http
400 Bad Request
{
  "error": "Invalid input: rating must be between 1 and 10"
}

401 Unauthorized
{
  "error": "Invalid or expired token"
}

404 Not Found
{
  "error": "Game not found"
}

500 Internal Server Error
{
  "error": "An unexpected error occurred"
}
```

---

## 📁 Project Structure

```
final_project/
│
├── backend/                           # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/gamehub/
│   │       │   ├── controller/       # REST API Controllers
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── GameController.java
│   │       │   │   ├── ReviewController.java
│   │       │   │   ├── UserLibraryController.java
│   │       │   │   ├── ActivityController.java
│   │       │   │   └── UserController.java
│   │       │   │
│   │       │   ├── model/            # Entity Models (POJOs)
│   │       │   │   ├── User.java
│   │       │   │   ├── Game.java
│   │       │   │   ├── Review.java
│   │       │   │   ├── UserGame.java
│   │       │   │   ├── ReviewLike.java
│   │       │   │   ├── ReviewReply.java
│   │       │   │   └── Activity.java
│   │       │   │
│   │       │   ├── repository/       # Data Access Layer
│   │       │   │   ├── UserRepository.java
│   │       │   │   ├── GameRepository.java
│   │       │   │   ├── ReviewRepository.java
│   │       │   │   ├── UserGameRepository.java
│   │       │   │   ├── ReviewLikeRepository.java
│   │       │   │   ├── ReviewReplyRepository.java
│   │       │   │   └── ActivityRepository.java
│   │       │   │
│   │       │   ├── service/          # Business Logic (if needed)
│   │       │   │   └── AuthService.java
│   │       │   │
│   │       │   ├── util/             # Utility Classes
│   │       │   │   └── JwtUtil.java  # JWT token generation/validation
│   │       │   │
│   │       │   └── GameHubApplication.java  # Main application class
│   │       │
│   │       └── resources/
│   │           └── application.properties  # Configuration
│   │
│   └── pom.xml                       # Maven dependencies
│
├── frontend/                          # Next.js Frontend
│   ├── app/                          # App Router (Next.js 16)
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Homepage (Community Feed)
│   │   │
│   │   ├── games/                   # Game browsing
│   │   │   ├── page.tsx            # Game list page
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Game detail page
│   │   │
│   │   ├── library/                 # User collection
│   │   │   └── page.tsx            # Library page
│   │   │
│   │   └── profile/                 # User profile
│   │       └── page.tsx            # Profile page
│   │
│   ├── components/                   # Reusable React Components
│   │   ├── Navbar.tsx               # Navigation bar
│   │   ├── ReviewSection.tsx        # Review display component
│   │   └── chatbot/                 # Chatbot feature
│   │
│   ├── lib/                          # Utilities and API client
│   │   └── api.ts                   # Centralized API communication
│   │
│   ├── public/                       # Static assets
│   ├── package.json                  # npm dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   └── tailwind.config.ts            # Tailwind CSS configuration
│
├── database/                          # Database Scripts
│   └── init_database.sql             # Complete database initialization
│
└── README.md                          # This file
```

### Key Files Explained

#### Backend

- **`GameHubApplication.java`**: Main Spring Boot application entry point
- **`AuthController.java`**: Handles user registration and login
- **`ReviewController.java`**: Manages review CRUD operations, likes, and replies
- **`UserLibraryController.java`**: Manages user's game collection and wishlist
- **`ActivityController.java`**: Provides community activity feed
- **`JwtUtil.java`**: JWT token generation, validation, and user ID extraction
- **`*Repository.java`**: Data access layer using JdbcTemplate for SQL queries
- **`application.properties`**: Database connection and Spring Boot configuration

#### Frontend

- **`frontend/app/page.tsx`**: Homepage with Community Feed and Recent Reviews tabs
- **`frontend/app/games/page.tsx`**: Game browsing page with search
- **`frontend/app/games/[id]/page.tsx`**: Game detail page with reviews and collection management
- **`frontend/app/library/page.tsx`**: User's game collection and wishlist
- **`frontend/app/profile/page.tsx`**: User profile with collection and reviews
- **`frontend/lib/api.ts`**: Centralized API client with authentication handling
- **`frontend/components/ReviewSection.tsx`**: Reusable review display with likes and replies

#### Database

- **`init_database.sql`**: Complete database initialization script that creates all tables, indexes, relationships, and loads 30 popular games with social features

---

## 🔧 Implementation Details

### Authentication Flow

1. **User Registration**:
   - User submits registration form
   - Backend validates input (unique username/email)
   - Password is hashed using BCrypt
   - User record is created in database
   - JWT token is generated and returned

2. **User Login**:
   - User submits credentials
   - Backend verifies username and password
   - If valid, JWT token is generated
   - Token contains user ID and expiration time
   - Frontend stores token in localStorage

3. **Protected Requests**:
   - Frontend includes token in Authorization header
   - Backend validates token signature and expiration
   - User ID is extracted from token
   - Request proceeds with authenticated user context

### Review System Implementation

**Creating a Review**:
```java
// ReviewController.java
@PostMapping
public ResponseEntity<?> createReview(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Map<String, Object> request) {
    // Extract user ID from JWT
    String token = authHeader.replace("Bearer ", "");
    Integer userId = jwtUtil.extractUserId(token);
    
    // Create review
    Review review = new Review();
    review.setUserId(userId);
    review.setGameId((Integer) request.get("gameId"));
    review.setRating((Integer) request.get("rating"));
    review.setReviewText((String) request.get("reviewText"));
    
    // Save to database
    Review created = reviewRepository.save(review);
    
    // Create activity record
    activityRepository.createActivity(userId, "post_review", 
                                     gameId, created.getReviewId(), 
                                     "wrote a review for");
    
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}
```

**Like System**:
- Uses REVIEW_LIKE junction table to track likes
- Prevents duplicate likes with unique constraint
- Updates denormalized `likes_count` in REVIEW table for performance
- Provides real-time feedback to users

**Reply System**:
- Stores replies in REVIEW_REPLY table
- Updates `replies_count` in REVIEW table
- Supports threaded conversations
- Displays with user information

### Activity Feed Implementation

**Activity Creation**:
Every user action that should appear in the feed creates an Activity record:

```java
// After adding game to collection
activityRepository.createActivity(userId, "add_game", gameId, null, "added to collection");

// After posting review
activityRepository.createActivity(userId, "post_review", gameId, reviewId, "wrote a review for");

// After liking review
activityRepository.createActivity(userId, "like_review", gameId, reviewId, "liked a review for");

// After replying to review
activityRepository.createActivity(userId, "reply_review", gameId, reviewId, "replied to a review for");
```

**Activity Retrieval**:
```java
// ActivityRepository.java
public List<Activity> getRecentActivities(int limit) {
    String sql = """
        SELECT a.*, u.username, u.display_name, g.title as game_title
        FROM ACTIVITY a
        JOIN USER u ON a.user_id = u.user_id
        LEFT JOIN GAME g ON a.game_id = g.game_id
        ORDER BY a.created_at DESC
        LIMIT ?
    """;
    return jdbcTemplate.query(sql, activityRowMapper, limit);
}
```

### Frontend State Management

**Example: Game Detail Page**

```typescript
// frontend/app/games/[id]/page.tsx
const [game, setGame] = useState<Game | null>(null);
const [reviews, setReviews] = useState<Review[]>([]);
const [userGameId, setUserGameId] = useState<number | null>(null);
const [inCollection, setInCollection] = useState(false);
const [inWishlist, setInWishlist] = useState(false);

// Load game data
useEffect(() => {
  const loadData = async () => {
    const gameData = await gamesAPI.getGameById(id);
    setGame(gameData);
    
    const reviewsData = await reviewsAPI.getGameReviews(id);
    setReviews(reviewsData);
    
    await checkLibraryStatus();
  };
  loadData();
}, [id]);

// Add to collection
const handleAddToCollection = async () => {
  if (inCollection) return;
  
  if (userGameId && inWishlist) {
    // Move from wishlist to collection
    await libraryAPI.updateGameInLibrary(userGameId, { status: 'owned' });
  } else {
    // Add new entry
    const result = await libraryAPI.addGameToLibrary({
      gameId: game.gameId,
      status: 'owned'
    });
    setUserGameId(result.userGameId);
  }
  
  setInCollection(true);
  setInWishlist(false);
};
```

### Database Query Optimization

**Indexes for Performance**:
- `idx_game_reviews`: Fast retrieval of reviews for a game
- `idx_user_library`: Quick access to user's collection
- `idx_created_at`: Efficient activity feed queries
- `idx_unique_like`: Prevents duplicate likes and speeds up checks

**Denormalized Counts**:
- `likes_count` in REVIEW table (instead of COUNT(*) on REVIEW_LIKE)
- `replies_count` in REVIEW table (instead of COUNT(*) on REVIEW_REPLY)
- Updated synchronously when likes/replies are added/removed

**Pagination**:
```java
// ReviewRepository.java
public List<Review> getGameReviews(Integer gameId, int page, int size) {
    int offset = page * size;
    String sql = """
        SELECT r.*, u.username, u.display_name
        FROM REVIEW r
        JOIN USER u ON r.user_id = u.user_id
        WHERE r.game_id = ?
        ORDER BY r.created_date DESC
        LIMIT ? OFFSET ?
    """;
    return jdbcTemplate.query(sql, reviewRowMapper, gameId, size, offset);
}
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register new user with valid credentials
- [ ] Register with duplicate username (should fail)
- [ ] Register with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect password (should fail)
- [ ] Access protected route without token (should fail)

#### Game Browsing
- [ ] View all games on games page
- [ ] Search for games by title
- [ ] Click on game to view details
- [ ] Verify game information displays correctly

#### Collection Management
- [ ] Add game to collection
- [ ] Add game to wishlist
- [ ] Switch game from wishlist to collection
- [ ] Switch game from collection to wishlist
- [ ] Remove game from collection
- [ ] Remove game from wishlist
- [ ] View collection in library page
- [ ] Filter by collection/wishlist

#### Review System
- [ ] Write review with rating 1-10
- [ ] Submit review without rating (should fail)
- [ ] View reviews on game detail page
- [ ] See review count update after posting
- [ ] View own reviews on profile page

#### Social Features
- [ ] Like a review
- [ ] Unlike a review
- [ ] Verify like count updates immediately
- [ ] Verify like count persists after refresh
- [ ] Reply to a review
- [ ] View replies on a review
- [ ] Verify reply count updates

#### Community Feed
- [ ] View activity feed on homepage
- [ ] Verify activities appear after actions
- [ ] Check activity types display correctly
- [ ] Verify user and game information shown
- [ ] Confirm activities sorted by time (newest first)

#### User Profile
- [ ] View own profile
- [ ] See collection count
- [ ] See review count
- [ ] View collection games
- [ ] View review history

### API Testing with curl

**Test Health Endpoint**:
```bash
curl http://localhost:8080/api/health
```

**Test Registration**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "displayName": "Test User"
  }'
```

**Test Login**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!"
  }'
```

**Test Get Games**:
```bash
curl http://localhost:8080/api/games
```

**Test Get Activities**:
```bash
curl http://localhost:8080/api/activities?limit=10
```

**Test Protected Endpoint** (replace TOKEN with actual JWT):
```bash
curl http://localhost:8080/api/library \
  -H "Authorization: Bearer TOKEN"
```

### Database Verification

**Check User Count**:
```bash
docker exec gamehub-mysql mysql -ugamehub -pgamehub123 \
  -e "SELECT COUNT(*) as user_count FROM USER;" gamehub
```

**Check Game Count**:
```bash
docker exec gamehub-mysql mysql -ugamehub -pgamehub123 \
  -e "SELECT COUNT(*) as game_count FROM GAME;" gamehub
```

**Check Recent Activities**:
```bash
docker exec gamehub-mysql mysql -ugamehub -pgamehub123 \
  -e "SELECT activity_type, COUNT(*) as count FROM ACTIVITY GROUP BY activity_type;" gamehub
```

**Check Review Statistics**:
```bash
docker exec gamehub-mysql mysql -ugamehub -pgamehub123 \
  -e "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM REVIEW;" gamehub
```

