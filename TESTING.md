# 🧪 GameHub Testing Guide

This document provides detailed instructions for setting up the environment, running the application, and performing comprehensive testing of the GameHub platform.

## 🚀 Environment Setup

### Prerequisites

Ensure you have the following installed:
- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 18 or higher
- **Docker Desktop**: For running MySQL
- **Maven**: Version 3.6+
- **Git**: For version control

### 1. Start Database
```bash
docker run --name gamehub-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=gamehub \
  -e MYSQL_USER=gamehub \
  -e MYSQL_PASSWORD=gamehub123 \
  -p 3306:3306 \
  -d mysql:8.0
```

### 2. Initialize Data
```bash
# Initialize schema and load sample data
docker exec -i gamehub-mysql mysql -ugamehub -pgamehub123 gamehub < database/init_database.sql
```

### 3. Start Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*Backend runs on: `http://localhost:8080`*

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## ✅ Manual Testing Checklist

### 1. Authentication
- [ ] **Registration**: Sign up with a new username/email.
- [ ] **Login**: Log in with the new account.
- [ ] **Validation**: Try registering with an existing username (should fail).

### 2. Game Discovery
- [ ] **Browse**: Scroll through the game list on the homepage/games page.
- [ ] **Search**: Use the search bar to find "Zelda" or "Elden Ring".
- [ ] **Pagination**: Verify "Next" and "Previous" buttons work and page size selection (10, 15, 20) functions correctly.
- [ ] **Details**: Click a game card to view the detailed info page.

### 3. Library Management
- [ ] **Add to Collection**: On a game detail page, click "Add to Collection" and select a platform.
- [ ] **Wishlist**: Add a game to your wishlist.
- [ ] **My Library**: Go to "My Library" and verify the games appear with correct status and cover images.
- [ ] **Remove**: Remove a game from your library and verify it disappears.

### 4. Social & Reviews
- [ ] **Post Review**: Write and submit a review for a game.
- [ ] **Rating**: Ensure the star rating is saved correctly.
- [ ] **Like**: Like a review and see the count increase immediately.
- [ ] **Reply**: Reply to a review and verify it appears in the thread.
- [ ] **Feed**: Check the homepage "Community Feed" for your recent activities.

---

## 📡 API Testing (curl)

**Health Check**
```bash
curl http://localhost:8080/api/auth/health
```

**Get All Games**
```bash
curl "http://localhost:8080/api/games?page=0&size=5"
```

**Search Games**
```bash
curl "http://localhost:8080/api/games/search?q=Elden"
```

**Get Recent Activities**
```bash
curl "http://localhost:8080/api/activities?limit=5"
```

---

## 📊 Database Verification

**Check User Count**
```bash
docker exec gamehub-mysql mysql -ugamehub -pgamehub123 -e "SELECT COUNT(*) FROM USER;" gamehub
```

**Check Review Count**
```bash
docker exec gamehub-mysql mysql -ugamehub -pgamehub123 -e "SELECT COUNT(*) FROM REVIEW;" gamehub
```
