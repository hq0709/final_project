# GameHub Manual Data Generation Guide

This guide explains how to use Python scripts to generate massive AI reviews and correctly merge them into the database.

---

## Workflow Overview
1. **Generate**: `generate_massive_reviews.py` -> Generates `premium_reviews.sql`
2. **Reconstruct**: `reconstruct_final.py` -> Merges `base_data.sql` + `premium_reviews.sql` = `data.sql`
3. **Import**: `ddl.sql` (Clear DB) + `data.sql` (Insert Data) -> MySQL

---

## 1. Generate Massive Reviews
Running this script calls the OpenAI/Gemini API to generate high-quality, persona-driven reviews for games.

Execute in Terminal:
```powershell
# 1. Install dependencies
pip install openai requests tqdm concurrent-futures

# 2. Run generation script
python scripts/generate_massive_reviews.py
```
*   **Input**: Reads game list from `submission/data.sql`.
*   **Output**: Writes to `submission/premium_reviews.sql`.
*   **Note**: The script supports resuming. If it stops, run it again to continue from where it left off.

---

## 2. Reconstruct Final Data file
This merges your base data (Games, Platforms, Genres) with the newly generated reviews into a single import file.

Execute in Terminal:
```powershell
python scripts/reconstruct_final.py
```
*   **Action**: Concatenates `submission/base_data.sql` and `submission/premium_reviews.sql` into `submission/data.sql`.
*   **Success Message**: `Success: submission/data.sql created.`

---

## 3. Import to Database
**WARNING**: To avoid "Duplicate entry" errors, you **MUST** reset the database schema before importing.

Execute in Terminal (Project Root):
```powershell
# 1. Copy latest SQL files to container
docker cp submission/ddl.sql gamehub-mysql:/ddl.sql
docker cp submission/data.sql gamehub-mysql:/data.sql

# 2. [CRITICAL] Reset Database Schema (DROP & CREATE)
docker exec -i gamehub-mysql mysql -ugamehub -pgamehub123 gamehub -e "source /ddl.sql"

# 3. Import Data
docker exec -i gamehub-mysql mysql -ugamehub -pgamehub123 gamehub -e "source /data.sql"
```

---

## 4. Verification
```powershell
# Check review count (Should be > 1300)
docker exec -i gamehub-mysql mysql -ugamehub -pgamehub123 gamehub -e "SELECT COUNT(*) FROM REVIEW;"
```

---

### Advanced: Preserving Base Data
If you have manually edited game descriptions or images in `data.sql` and want to keep them:
1. Run `python scripts/extract_base_data.py` (Developer tool).
2. Or manually copy the content before `INSERT INTO REVIEW...` in `data.sql` to `submission/base_data.sql`.
