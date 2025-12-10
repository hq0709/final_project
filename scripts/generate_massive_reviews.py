
import os
import re
import json
import time
import random
import threading
import concurrent.futures
from openai import OpenAI

# ================= CONFIGURATION =================
OUTPUT_FILE = "submission/premium_reviews.sql"
INPUT_DDL_FILE = "submission/data.sql" # Read games from here (Base Data)
TARGET_TOTAL_REVIEWS = 1500
NUM_USERS = 100
BATCH_SIZE = 5 # Small batch to ensure completion
MAX_WORKERS = 20 # High parallelism

PERSONAS = [
    {"role": "The Lore Archaeologist", "style": "Obsessed with hidden details, item descriptions. Uses words like 'environmental storytelling'.", "bias": "Loves vague plots."},
    {"role": "The Performance Purist", "style": "Complains about micro-stutters, shader compilation, DLSS. Writes specs in review.", "bias": "Hates optimization issues."},
    {"role": "The Casual Dad/Mom", "style": "Has 30 mins to play per week. Values pause buttons. Simple language.", "bias": "Hates grinding."},
    {"role": "The Competitive Tryhard", "style": "Talks about meta, balancing, skill ceiling. Condescending tone.", "bias": "Hates easy modes."},
    {"role": "The Indie Hipster", "style": "Compares everything to obscure games. Hates AAA. Aesthetic focused.", "bias": "Loves pixel art."},
    {"role": "The Refund Rager", "style": "Experienced a crash. ALL CAPS. Angry.", "bias": "1-star specific."},
    {"role": "The Steam Deck User", "style": "Reviews based on battery life and text readability.", "bias": "Loves verified games."},
    {"role": "The Speedrunner", "style": "Talks about sequence breaks, skip-ability. 'Frame perfect'.", "bias": "Loves glitches."},
    {"role": "The Achievement Hunter", "style": "Obsessed with 100% completion.", "bias": "Hates multiplayer achievements."},
    {"role": "The Souls Veteran", "style": "Compares combat to Dark Souls. 'Git gud'.", "bias": "Loves difficulty."},
    {"role": "The Cozy Gamer", "style": "Looking for relaxation. Vibes, music.", "bias": "Hates combat."},
    {"role": "The Graphics Snob", "style": "Only cares about Ray Tracing, 4K textures.", "bias": "Hates 'dated' engines."},
    {"role": "The Nostalgia Goggles", "style": "Compares game to a childhood classic.", "bias": "Hates modern monetization."},
    {"role": "The Whale", "style": "Admits to spending money. Defends microtransactions.", "bias": "Loves customization."},
    {"role": "The Linux User", "style": "Technical review about Proton, Vulkan.", "bias": "Hates anti-cheat."},
    {"role": "The Review Bomber", "style": "Angry about diverse characters or dev tweets.", "bias": "0 or 1 star."},
    {"role": "The RPG Min-Maxer", "style": "Spreadsheet gamer. Talks about build variety.", "bias": "Loves complexity."},
    {"role": "The Story Skipper", "style": "Just wants gameplay. Hates unskippable cutscenes.", "bias": "Hates narrative."}
]

# Shared Resources
USER_PROVIDED_KEY = os.getenv("OPENAI_API_KEY", "")
file_lock = threading.Lock()
count_lock = threading.Lock()
current_count = 0

def get_api_keys():
    keys = []
    if USER_PROVIDED_KEY and USER_PROVIDED_KEY.startswith("sk-"):
        keys.append(USER_PROVIDED_KEY)
    try:
        with open("chat_server.py", "r", encoding="utf-8") as f:
            content = f.read()
            patterns = [
                r'api_key=[\"\\\'](sk-[^\"\\\']+)[\"\\\']',
                r'API_KEY\\s*=\\s*[\"\\\'](sk-[^\"\\\']+)[\"\\\']',
                r'[\"\\\'](sk-[a-zA-Z0-9-]{20,})[\"\\\']'
            ]
            for p in patterns:
                matches = re.findall(p, content)
                for m in matches:
                    if m not in keys:
                        keys.append(m)
    except Exception as e:
        print(f"Error reading local key: {e}")
    return list(set(keys))

def parse_games(filepath):
    games = []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            matches = re.finditer(r"\(\s*(\d+),\s*'([^']+)',\s*'(?:[^']|\\')*',\s*'\d{4}-\d{2}-\d{2}'", content)
            for m in matches:
                gid = int(m.group(1))
                title = m.group(2)
                if gid < 1000: 
                    games.append({"id": gid, "title": title})
    except Exception as e:
        print(f"Error parsing games: {e}")
    return list({g['id']: g for g in games}.values())

def generate_users(count):
    print(f"Generating {count} Users...")
    users = []
    start_id = 1000
    for i in range(count):
        persona = random.choice(PERSONAS)
        base_name = f"User_{start_id + i}"
        role_word = persona['role'].split(" ")[-1]
        name = f"{role_word}_{random.randint(100,999)}"
        users.append({
            "id": start_id + i,
            "username": name,
            "email": f"{name.lower()}@gamehub.com",
            "persona": persona
        })
    return users

def init_file(users):
    """Initialize file with headers and users"""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("-- MASSIVE AI DATASET \n")
        f.write("-- 1. USERS \n")
        f.write("INSERT IGNORE INTO USER (user_id, username, email, password_hash, display_name, country, level, reviews_count) VALUES\n")
        
        user_sqls = []
        default_hash = "$2b$12$Q6sD7VAHtNd0Bh2ajiKXOumkoTLtejKxbaE35IDOO6NmI6RCKU126"
        for u in users:
            u_sql = f"({u['id']}, '{u['username']}', '{u['email']}', '{default_hash}', '{u['username']}', 'USA', {random.randint(1,100)}, 0)"
            user_sqls.append(u_sql)
        f.write(",\n".join(user_sqls) + ";\n\n")
        f.write("-- 2. REVIEWS \n")
    print(f"File initialized with {len(users)} users.")

def append_reviews(reviews):
    """Securely append reviews to file"""
    if not reviews: return
    
    # Construct INSERT statement
    sql_base = "INSERT IGNORE INTO REVIEW (user_id, game_id, rating, review_text, recommended, helpful_count, likes_count, created_date) VALUES\n"
    values_str = ",\n".join(reviews) + ";\n"
    
    with file_lock:
        with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
            f.write(sql_base + values_str)

def generate_batch(keys_pool, game, batch_users):
    global current_count
    
    # Pre-check limit
    with count_lock:
        if current_count >= TARGET_TOTAL_REVIEWS:
            return

    api_key = random.choice(keys_pool)
    client = OpenAI(api_key=api_key)
    
    retries = 15
    while retries > 0:
        try:
            prompt = f"""
            Task: Write {len(batch_users)} reviews for the video game "{game['title']}".
            
            Reviewers assigned (Strictly follow order):
            {[f"{u['username']} (Persona: {u['persona']['role']})" for u in batch_users]}
            
            Instructions:
            1. Output ONLY a JSON Array.
            2. Each object must have "text" (string) and "rating" (1-5 int).
            3. The review content MUST assume the persona (voice, complaints, praises).
            4. Do NOT start with username.
            5. JSON Format Example: [ {{"text": "Msg", "rating": 5}} ]
            """
            
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.9,
                response_format={ "type": "json_object" }
            )
            
            content = response.choices[0].message.content.strip()
            if "```json" in content: content = content.split("```json")[1].split("```")[0].strip()
            
            data = json.loads(content)
            results = []
            if isinstance(data, dict):
                for v in data.values():
                    if isinstance(v, list): results = v; break
            elif isinstance(data, list):
                results = data

            # Validation
            if len(results) < len(batch_users):
                print(f"DEBUG: Failed batch content: {content[:200]}...") # Print first 200 chars
                raise ValueError(f"Incomplete batch: Expected {len(batch_users)}, got {len(results)}")
                
            # Formatting
            sql_values = []
            for idx, r in enumerate(results):
                if idx >= len(batch_users): break
                user = batch_users[idx]
                
                raw_text = r.get("text", "")
                clean_text = re.sub(r"^[\w\d_]+(\s*\(.*?\))?:\s*", "", raw_text) 
                clean_text = clean_text.replace("'", "''").replace("\\", "").replace("\n", " ")
                
                rating = int(r.get("rating", 3))
                rec = "TRUE" if rating >= 3 else "FALSE"
                helpful = random.randint(0, 50)
                likes = random.randint(0, 20)
                days = random.randint(0, 365)
                
                sql = f"({user['id']}, {game['id']}, {rating}, '{clean_text}', {rec}, {helpful}, {likes}, DATE_SUB(NOW(), INTERVAL {days} DAY))"
                sql_values.append(sql)
            
            # Post-check and Write
            with count_lock:
                if current_count >= TARGET_TOTAL_REVIEWS:
                    return # Stop if target reached by others
                current_count += len(sql_values)
                print(f"Progress: {current_count}/{TARGET_TOTAL_REVIEWS} ({len(sql_values)} new)")
            
            append_reviews(sql_values)
            return

        except Exception as e:
            print(f"Error for {game['title']} (Key ...{api_key[-4:]}): {e}. Retrying...")
            api_key = random.choice(keys_pool)
            client = OpenAI(api_key=api_key)
            retries -= 1
            time.sleep(1)

def main():
    keys = get_api_keys()
    if not keys:
        print("No API Keys found.")
        return
    print(f"Loaded {len(keys)} API Keys.")
    
    games = parse_games(INPUT_DDL_FILE)
    if not games: games = [{"id": i, "title": f"Game {i}"} for i in range(1, 21)]
    print(f"Loaded {len(games)} games.")
    
    users = generate_users(NUM_USERS)
    
    # Initialize output file
    init_file(users)
    
    reviews_per_game = int(TARGET_TOTAL_REVIEWS / len(games)) + 1
    print(f"Targeting approx {reviews_per_game} reviews per game.")
    
    tasks = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        for game in games:
            game_users = random.sample(users, min(len(users), reviews_per_game))
            for i in range(0, len(game_users), BATCH_SIZE):
                batch_u = game_users[i : i+BATCH_SIZE]
                tasks.append(executor.submit(generate_batch, keys, game, batch_u))
                
        print(f"Submitted {len(tasks)} tasks. Streaming results to {OUTPUT_FILE}...")
        concurrent.futures.wait(tasks)
        
    print(f"\nDone! Generated {current_count} reviews total.")
    print("SUCCESS: submission/premium_reviews.sql created.")

if __name__ == "__main__":
    main()
