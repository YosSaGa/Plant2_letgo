import os
import random
import sys
import zipfile

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

SEED = 42
random.seed(SEED)

SOURCE_DIR = r"C:\Users\yossa\Downloads\5Plant"
TARGET_DIR = r"C:\Users\yossa\Downloads\5Plant_200"
TARGET_SAMPLE_SIZE = 200

# Mapping zip file and inner folder names to standard thesis class names
# Matches classes.json in src/plant_train/
MAPPING = {
    "Chili.zip": {
        "plant": "Chili",
        "folders": {
            "Cercospora Leaf Spot": "chili_leaf_spot",
            "Leaf Curl Disease": "chili_leaf_curl",
            "healthy leaf": "chili_healthy",
        }
    },
    "Tomato.zip": {
        "plant": "Tomato",
        "folders": {
            "Early_blight": "tomato_early_blight",
            "Septoria_leaf_spot": "tomato_septoria_leaf_spot",
            "healthy": "tomato_healthy",
        }
    },
    "Basil.zip": {
        "plant": "Basil",
        "folders": {
            "Downy_Mildew": "basil_downy_mildew",
            "Leaf_Spot_Fungal": "basil_leaf_spot_fungal",
            "Healthy": "basil_healthy",
        }
    },
    "krapao.zip": {
        "plant": "Krapao",
        "folders": {
            "insect_bite": "krapao_insect_bite",
            "white_spots": "krapao_white_spots",
            "healthy": "krapao_healthy",
        }
    },
    "Lettuce.zip": {
        "plant": "Lettuce",
        "folders": {
            "Bacterial": "lettuce_bacterial",
            "Fungal": "lettuce_fungal",
            "Healthy": "lettuce_healthy",
        }
    }
}

VALID_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.bmp', '.JPG', '.JPEG', '.PNG')

def main():
    os.makedirs(TARGET_DIR, exist_ok=True)
    print("===============================================================")
    print("🚀 SAMPLING DATASET: Exactly 200 images per disease/class")
    print(f"Source: {SOURCE_DIR}")
    print(f"Target: {TARGET_DIR}")
    print("===============================================================\n")

    total_extracted = 0

    for zip_name, info in MAPPING.items():
        zip_path = os.path.join(SOURCE_DIR, zip_name)
        plant_name = info["plant"]
        folder_map = info["folders"]

        if not os.path.exists(zip_path):
            print(f"⚠️ Warning: {zip_path} not found. Skipping.")
            continue

        print(f"📦 Processing [{plant_name}] from {zip_name}...")
        with zipfile.ZipFile(zip_path, 'r') as zf:
            all_files = zf.namelist()

            for zip_folder, std_class in folder_map.items():
                out_dir = os.path.join(TARGET_DIR, plant_name, std_class)
                os.makedirs(out_dir, exist_ok=True)

                # Match files in this category
                matching_files = [
                    f for f in all_files 
                    if not f.endswith('/') and f.lower().endswith(VALID_EXTENSIONS)
                ]

                # Filter by folder
                category_files = []
                for f in matching_files:
                    parts = [p for p in f.replace('\\', '/').split('/') if p]
                    if len(parts) > 1 and parts[0].strip().lower() == zip_folder.lower():
                        category_files.append(f)

                # If krapao, prefer non-transformed real images
                if plant_name == "Krapao":
                    non_trans = [f for f in category_files if "transformed" not in f.lower()]
                    if len(non_trans) >= TARGET_SAMPLE_SIZE:
                        pool = non_trans
                    else:
                        pool = category_files
                else:
                    pool = category_files

                # Random sample 200
                random.shuffle(pool)
                sample_count = min(len(pool), TARGET_SAMPLE_SIZE)
                selected_files = pool[:sample_count]

                # Extract selected files
                extracted_count = 0
                for f_path in selected_files:
                    fname = os.path.basename(f_path)
                    dest_file = os.path.join(out_dir, fname)
                    with zf.open(f_path) as source_f, open(dest_file, "wb") as target_f:
                        target_f.write(source_f.read())
                    extracted_count += 1

                total_extracted += extracted_count
                print(f"   ✓ {std_class:<25}: {extracted_count} images (Total available in zip: {len(category_files)})")

    print(f"\n✅ All sampling complete! Total extracted: {total_extracted} images.")
    print(f"📁 Destination folder: {TARGET_DIR}")

if __name__ == "__main__":
    main()
