from rembg import remove
from PIL import Image
import os

decor_dir = "fe/public/images/decor"
user_uploaded_dir = "C:/Users/PC/.gemini/antigravity-ide/brain/abe3438a-2435-4ca5-b2d2-55e3c18a4890/.user_uploaded"

tasks = [
    # (source_file, target_png_name)
    ("media_1790773239063.png", "twin-swans-heart.png"),
    ("media_1790773263782.jpg", "vintage-wedding-car.png"),
    ("media_1790773152105.jpg", "lace-frame-royal.png"),
    ("media_1790773173878.jpg", "lace-frame-gold-arch.png"),
    ("media_1790773203918.png", "scalloped-paper-frame.png"),
]

for src_name, dst_name in tasks:
    src_path = os.path.join(user_uploaded_dir, src_name)
    dst_path = os.path.join(decor_dir, dst_name)
    print(f"Processing {src_name} -> {dst_name} ...")
    inp = Image.open(src_path)
    output = remove(inp)
    output.save(dst_path)
    print(f"Saved {dst_path} successfully!")

print("All 5 assets processed with rembg AI!")
