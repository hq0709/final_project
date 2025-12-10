from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from textblob import TextBlob
import pandas as pd
import mysql.connector
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS

# User provided key
API_KEY = os.getenv("OPENAI_API_KEY", "your-api-key-here")

client = OpenAI(api_key=API_KEY)

SYSTEM_PROMPT_TEMPLATE = """
You are the "GameHub Master", an intelligent guide for a gaming platform.
Your goal is to help users navigate, find games, and use the site based on their CURRENT CONTEXT.

**GAME KNOWLEDGE BASE (DYNAMIC):**
{game_context}

**CRITICAL RULES:**
1. **FORMATTING**: Use Markdown. Use **Bold** for emphasis.
2. **NAVIGATION**: If a user asks about a specific game in the list above, output a BUTTON to `/games/<ID>`.
   - Example: "Oh, Cyberpunk! [BUTTON: Visit Night City](/games/15)"
3. **GENERAL ROUTES**:
   - Login/Register: `/auth`
   - All Games: `/games`
   - My Library: `/library` (Check your **AI Recommendations** here!)
   - Profile: `/profile`
   - Game Details: `/games/<ID>` (Look for the **AI Sentiment Score**!)
4. **CONTEXT AWARE**: Use the provided "Current Page" info to be helpful. 
5. **TONE**: Enthusiastic, knowledgeable (Gamer persona).
"""


# DB Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'gamehub',
    'password': 'gamehub123',
    'database': 'gamehub',
    'port': 3306
}

def get_db_connection():
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except Exception as e:
        print(f"DB Connection Error: {e}")
        return None

# Global Cache for Game Titles (Simple In-Memory RAG)
GAME_TITLE_CACHE = {}

def refresh_game_cache():
    """Fetches all game titles and IDs on startup/periodically"""
    global GAME_TITLE_CACHE
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT game_id, title, description, developer, publisher FROM GAME")
            games = cursor.fetchall()
            GAME_TITLE_CACHE = {g['title'].lower(): g for g in games}
            print(f"Loaded {len(GAME_TITLE_CACHE)} games into cache.")
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Failed to refresh game cache: {e}")

# Initial Load
refresh_game_cache()

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get('message', '')
        # Context from frontend (e.g., "Page: /games/123 - Title: Elden Ring")
        context = data.get('context', 'Unknown Page')

        print(f"Context: {context} | User: {user_input}")

        # 1. Dynamic RAG: Find mentioned games in user input
        mentioned_games = []
        user_lower = user_input.lower()
        
        # Simple keyword matching (could be improved with vector search)
        for title_lower, game_data in GAME_TITLE_CACHE.items():
            if title_lower in user_lower:
                mentioned_games.append(f"- {game_data['title']} (ID {game_data['game_id']}): {game_data['description'][:100]}... by {game_data['developer']}")
        
        game_context_str = "\n".join(mentioned_games) if mentioned_games else "No specific game mentioned, use general gaming knowledge."

        print(f"Context: {context} | User: {user_input} | RAG: {len(mentioned_games)} games")

        # Construct the "Prompt" by combining System Instructions + Context + User Input
        # This is necessary because 'client.responses.create' (as requested) might be a completion-style API
        full_input = f"""
{SYSTEM_PROMPT_TEMPLATE.format(game_context=game_context_str)}

---
**CURRENT USER CONTEXT**:
{context}

**USER QUESTION**:
{user_input}

**AI RESPONSE**:
"""

        # EXACT CODE REQUESTED BY USER
        result = client.responses.create(
            model="gpt-5.1",
            input=full_input,
            reasoning={ "effort": "low" },
            text={ "verbosity": "low" },
        )
        
        response_text = result.output_text
        return jsonify({"reply": response_text})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"reply": f"**System Error**: {str(e)}\n\nPlease ensure your API Key and Model are valid."}), 500



# ... (Previous Imports)



# ... (App setup)

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.json
        game_title = data.get('game', 'Unknown Game')
        reviews = data.get('reviews', [])
        
        # 1. CACHE CHECK
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor(dictionary=True)
            # Check for fresh summary (less than 24 hours old)
            query = "SELECT summary_text, updated_at FROM GAME_AI_SUMMARY WHERE game_title = %s"
            cursor.execute(query, (game_title,))
            result = cursor.fetchone()
            
            if result:
                last_update = result['updated_at']
                if datetime.now() - last_update < timedelta(hours=24):
                    print(f"Cache HIT for {game_title} (Updated: {last_update})")
                    cursor.close()
                    conn.close()
                    return jsonify({"summary": result['summary_text']})
            
            print(f"Cache MISS for {game_title}. Generating new summary...")

        # 2. GENERATE NEW SUMMARY (If cache miss or DB error)
        # Combine reviews into a single text block
        reviews_text = "\n- ".join(reviews[:20])
        
        prompt = f"""
You are an expert Game Critic.
Here are user reviews for the game "{game_title}":

- {reviews_text}

**TASK**:
Provide a **single, short paragraph** (maximum 3 sentences) summarizing these reviews. 
Write it like a Google Maps place summary: mentioned key vibes, one major pro, one major con (if any), and the general consensus.
Do NOT use bullet points or lists. Be extremely concise.
"""

        api_result = client.responses.create(
            model="gpt-5.1",
            input=prompt,
            reasoning={ "effort": "low" },
            text={ "verbosity": "low" },
        )
        
        summary_text = api_result.output_text

        # 3. SAVE TO CACHE
        if conn:
            try:
                upsert_query = """
                    INSERT INTO GAME_AI_SUMMARY (game_title, summary_text, updated_at) 
                    VALUES (%s, %s, NOW()) 
                    ON DUPLICATE KEY UPDATE summary_text = VALUES(summary_text), updated_at = NOW()
                """
                cursor.execute(upsert_query, (game_title, summary_text))
                conn.commit()
                print(f"Cached summary for {game_title}")
                cursor.close()
                conn.close()
            except Exception as db_e:
                print(f"Failed to cache summary: {db_e}")

        return jsonify({"summary": summary_text})

    except Exception as e:
        print(f"Summary Error: {e}")
        return jsonify({"summary": "Unable to generate summary at this time."}), 500

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        user_id = request.json.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID required"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "DB Connection failed"}), 500

        # 1. Fetch User's Owned Games
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT game_id FROM USER_GAME WHERE user_id = %s", (user_id,))
        owned_games = [row['game_id'] for row in cursor.fetchall()]

        # 2. Fetch All Games for Content Analysis
        cursor.execute("SELECT game_id, title, description, cover_image_url FROM GAME")
        all_games = cursor.fetchall()
        cursor.close()
        conn.close()

        if not all_games:
            return jsonify({"recommendations": []})

        # 3. Create DataFrame & TF-IDF matrix
        df = pd.DataFrame(all_games)
        
        # If user has no games, return top rated (mock logic for cold start or random)
        if not owned_games:
            return jsonify({"recommendations": all_games[:5]})

        tfidf = TfidfVectorizer(stop_words='english')
        df['description'] = df['description'].fillna('')
        tfidf_matrix = tfidf.fit_transform(df['description'])

        # 4. Find similarity
        # Filter dataframe to get only user's owned games indices
        owned_indices = df[df['game_id'].isin(owned_games)].index
        
        if owned_indices.empty:
             return jsonify({"recommendations": all_games[:5]})

        # Compute cosine similarity between ALL games and OWNED games
        cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

        # Aggregate similarity scores and track top contributor
        sim_data = {} # game_index -> { 'score': 0, 'reason_idx': -1, 'max_sim': -1 }
        
        for idx in owned_indices:
            # Get similarity scores for this owned game
            scores = list(enumerate(cosine_sim[idx]))
            for i, score in scores:
                if i not in owned_indices: # Don't recommend what they own
                    if i not in sim_data:
                         sim_data[i] = { 'score': 0, 'reason_idx': -1, 'max_sim': -1 }
                    
                    sim_data[i]['score'] += score
                    
                    # Track which owned game contributed the most to this recommendation
                    if score > sim_data[i]['max_sim']:
                        sim_data[i]['max_sim'] = score
                        sim_data[i]['reason_idx'] = idx
        
        # Sort by total score
        sorted_scores = sorted(sim_data.items(), key=lambda x: x[1]['score'], reverse=True)
        top_indices = [i[0] for i in sorted_scores[:5]]
        
        results = []
        for i in top_indices:
             rec = df.iloc[i][['game_id', 'title', 'description', 'cover_image_url']].to_dict()
             
             # Get the reason title
             reason_idx = sim_data[i]['reason_idx']
             if reason_idx != -1:
                 rec['reason'] = df.iloc[reason_idx]['title']
             else:
                 rec['reason'] = "General Popularity"
                 
             results.append(rec)
        
        return jsonify({"recommendations": results})

    except Exception as e:
        print(f"Recommendation Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/sentiment', methods=['POST'])
def sentiment():
    try:
        game_id = request.json.get('game_id')
        if not game_id:
             return jsonify({"error": "Game ID required"}), 400

        conn = get_db_connection()
        if not conn:
             return jsonify({"error": "DB Connection failed"}), 500
        
        cursor = conn.cursor(dictionary=True)
        # Fetch recent reviews
        cursor.execute("SELECT review_text FROM REVIEW WHERE game_id = %s ORDER BY created_date DESC LIMIT 50", (game_id,))
        reviews = cursor.fetchall()
        cursor.close()
        conn.close()

        if not reviews:
             return jsonify({"positive": 0, "negative": 0, "neutral": 0, "score": 0, "total": 0})

        pos_count = 0
        neg_count = 0
        neu_count = 0
        total_polarity = 0

        for r in reviews:
            text = r['review_text']
            if text:
                analysis = TextBlob(text)
                polarity = analysis.sentiment.polarity
                total_polarity += polarity
                
                if polarity > 0.1:
                    pos_count += 1
                elif polarity < -0.1:
                    neg_count += 1
                else:
                    neu_count += 1

        total_analyzed = len(reviews)
        # TextBlob polarity is usually conservative (-0.2 to 0.2). 
        # We multiply by 3 to stretch the curve, so 0.33 becomes a 10/10.
        avg_polarity = total_polarity / total_analyzed
        weighted_score = ((avg_polarity * 3) + 1) * 5 
        
        # Fetch TRUE total count from DB
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM REVIEW WHERE game_id = %s", (game_id,))
        true_total = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        return jsonify({
            "positive": pos_count,
            "negative": neg_count,
            "neutral": neu_count,
            "score": round(min(max(weighted_score, 1.0), 10.0), 1), # Clamp 1.0-10.0
            "total": true_total,
            "analyzed": total_analyzed
        })

    except Exception as e:
        print(f"Sentiment Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Chat Server on port 5001...")
    # Using 5001 to avoid conflict
    app.run(port=5001, debug=True)
