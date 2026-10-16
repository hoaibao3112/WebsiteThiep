from rembg import remove
from PIL import Image
import os
import sys

files_map = [
    ("0a1166c2-0ea7-48b4-869b-1a3549289ec5.jpg", "wax-seal-dove-rose-gold.png"),
    ("57b94328-1fcd-432a-9653-b21899afe601.jpg", "wedding-boarding-pass-gold.png"),
    ("58c20ae6-488d-49f9-892a-884c4428f3cd.jpg", "olive-branch-gold-watercolor.png"),
    ("998ca0d0-1387-490b-b17e-8b655ae56ac9.jpg", "silk-ribbon-bow-champagne.png"),
    ("cda09e2a-e6ea-407d-95f5-4ca3604f6763.jpg", "watercolor-floral-corner-peony.png"),
    ("ddbd01e5-05e3-4743-ae28-904d652fd73d.jpg", "cinema-tickets-vintage-love.png"),
    ("f346cb21-ce7d-4cca-b37c-a138d988dd90.jpg", "vintage-postage-stamps-set.png"),
]

root_dir = "d:/freelancer/WebsiteThiep"
decor_dir = "d:/freelancer/WebsiteThiep/fe/public/images/decor"

os.makedirs(decor_dir, exist_ok=True)

for src_name, clean_name in files_map:
    src_path = os.path.join(root_dir, src_name)
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}", file=sys.stderr)
        continue

    print(f"Processing rembg for: {src_name} -> {clean_name} ...")
    try:
        inp = Image.open(src_path)
        output = remove(inp)
        
        # Save to fe/public/images/decor/
        decor_dst = os.path.join(decor_dir, clean_name)
        output.save(decor_dst, format="PNG")
        print(f"  -> Saved to {decor_dst}")
        
        # Also save to root with same base name + .png
        base_name, _ = os.path.splitext(src_name)
        root_dst = os.path.join(root_dir, f"{base_name}_transparent.png")
        output.save(root_dst, format="PNG")
        print(f"  -> Saved to {root_dst}")
        
    except Exception as e:
        print(f"Error processing {src_name}: {e}", file=sys.stderr)

print("All 7 images processed successfully!")
