
import os

def reconstruct_final():
    print("Reconstructing final data.sql...")
    
    # Files
    base_file = "submission/base_data.sql"
    premium_file = "submission/premium_reviews.sql"
    final_file = "submission/data.sql"
    
    # Check existence
    if not os.path.exists(base_file):
        print(f"Error: {base_file} missing. Please run scripts/extract_base_data.py first.")
        # Or auto-run it?
        import extract_base_data
        extract_base_data.extract_base_data()
        
    if not os.path.exists(premium_file):
        print(f"Warning: {premium_file} missing. Only using base data.")
        premium_content = ""
    else:
        with open(premium_file, "r", encoding="utf-8") as f:
            premium_content = f.read()
            
    with open(base_file, "r", encoding="utf-8") as f:
        base_content = f.read()
        
    # Merge
    # Ensure newline separation
    final_content = base_content + "\n\n" + premium_content
    
    with open(final_file, "w", encoding="utf-8") as f:
        f.write(final_content)
        
    print(f"Success: {final_file} created.")
    print("Next Steps:")
    print("1. docker cp submission/data.sql gamehub-mysql:/data.sql")
    print("2. docker exec -i gamehub-mysql mysql -ugamehub -pgamehub123 gamehub -e \"source /data.sql\"")

if __name__ == "__main__":
    reconstruct_final()
