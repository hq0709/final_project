# Project Complete Run Guide

If you have just downloaded or updated the code, please strictly follow the steps below to ensure the project runs perfectly from scratch.

### 1. Prerequisites
Ensure the following software is installed:
- **Docker** (For running MySQL database)
- **Node.js** (For running Next.js frontend)
- **Java 17+** (For running Spring Boot backend; a portable version is provided in `tools/`)
- **Python 3.8+** (For running AI scripts and chat service)

---

### 2. Database Initialization (Database & Data)
*This is the most critical step. We will start the database and load the latest data.*

Open a terminal (Terminal 1) and **execute in the project root directory**:

#### 2.1 Start Database Container
```powershell
# Remove old container if it exists (Ensure a clean environment)
docker rm -f gamehub-mysql

# Start new MySQL container
docker run --name gamehub-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=gamehub -e MYSQL_USER=gamehub -e MYSQL_PASSWORD=gamehub123 -p 3306:3306 -d mysql:8.0

# Wait 15 seconds for the database to fully start
Start-Sleep -Seconds 15
```

#### 2.2 Import Data
```powershell
# 1. Copy SQL files into the container
docker cp submission/ddl.sql gamehub-mysql:/ddl.sql
docker cp submission/data.sql gamehub-mysql:/data.sql

# 2. Reset Database Schema (Execute DDL) - This clears old data and creates tables
docker exec -i gamehub-mysql mysql -ugamehub -pgamehub123 gamehub -e "source /ddl.sql"

# 3. Import Business Data (Execute Data) - Inserts base data and AI reviews
docker exec -i gamehub-mysql mysql -ugamehub -pgamehub123 gamehub -e "source /data.sql"
```
*Note: Ignore warnings exactly like "Using a password on the command line interface can be insecure".*

---

### 3. Start Backend
Open a new terminal (Terminal 2) and **execute in the project root directory**:

```powershell
brew install maven
mvn -f backend/pom.xml spring-boot:run
```
*Wait until you see `Started GameTrackerApplication`.*

---

### 4. Start AI Chatbot
*This is the core service for the floating window AI (Offering GPT-5.1 Roleplay experience).*

Open a new terminal (Terminal 3) and execute:
```powershell
# 1. Install Python dependencies (If not already installed)
pip install flask flask-cors openai mysql-connector-python scikit-learn pandas textblob

# 2. Start Chat Server
python chat_server.py
```
*Wait until you see `Starting Chat Server on port 5001`.*

---

### 5. Start Frontend
Open a new terminal (Terminal 4) and execute:

```powershell
cd frontend

# Install dependencies (First time only)
npm install

# Start development server
npm run dev
```
*After startup, visit browser: [http://localhost:3000](http://localhost:3000)*

---

### Troubleshooting

**1. Database Import Error `Duplicate entry`**
*   **Cause**: You ran `source /data.sql` directly without running `source /ddl.sql` first to clear data, causing ID conflicts.
*   **Solution**: **Always** run `docker exec ... "source /ddl.sql"` to reset the database before importing data.

**2. Backend Port In Use (Port 8080 in use)**
*   Run the following command to forcibly close the process occupying the port:
    ```powershell
    netstat -ano | findstr :8080
    # Note the PID (Last number in the row), e.g., 12345
    taskkill /F /PID 12345
    ```

**3. Where is the AI Generated Data?**
*   If you want to manually generate more data, please refer to `MANUAL_GENERATION_GUIDE.md` in the root directory.
