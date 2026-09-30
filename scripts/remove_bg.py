import cv2
import numpy as np
import os
import glob

def remove_outer_white_background(img_path, output_path, tolerance=15, blur_radius=1):
    # Load image
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Failed to load {img_path}")
        return

    # Convert to BGR if it has alpha
    if img.shape[2] == 4:
        bgr = img[:, :, :3]
    else:
        bgr = img

    h, w = bgr.shape[:2]

    # Create mask for flood fill: (h + 2, w + 2)
    mask = np.zeros((h + 2, w + 2), np.uint8)

    # Convert to grayscale / difference from white
    diff_from_white = 255 - cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    # Threshold where it's considered pure/near white
    # Anything with diff_from_white <= tolerance is near white
    flood_val = 255
    lo_diff = (tolerance, tolerance, tolerance)
    up_diff = (tolerance, tolerance, tolerance)

    # Target color: pure white
    white_bgr = np.array([255, 255, 255], dtype=np.uint8)

    # Seed floodFill from all borders
    # 1. Top and Bottom edges
    for x in range(0, w, 2):
        if np.max(np.abs(bgr[0, x].astype(int) - 255)) <= tolerance:
            cv2.floodFill(bgr.copy(), mask, (x, 0), 0, loDiff=lo_diff, upDiff=up_diff, flags=4 | (flood_val << 8) | cv2.FLOODFILL_MASK_ONLY)
        if np.max(np.abs(bgr[h-1, x].astype(int) - 255)) <= tolerance:
            cv2.floodFill(bgr.copy(), mask, (x, h-1), 0, loDiff=lo_diff, upDiff=up_diff, flags=4 | (flood_val << 8) | cv2.FLOODFILL_MASK_ONLY)

    # 2. Left and Right edges
    for y in range(0, h, 2):
        if np.max(np.abs(bgr[y, 0].astype(int) - 255)) <= tolerance:
            cv2.floodFill(bgr.copy(), mask, (0, y), 0, loDiff=lo_diff, upDiff=up_diff, flags=4 | (flood_val << 8) | cv2.FLOODFILL_MASK_ONLY)
        if np.max(np.abs(bgr[y, w-1].astype(int) - 255)) <= tolerance:
            cv2.floodFill(bgr.copy(), mask, (w-1, y), 0, loDiff=lo_diff, upDiff=up_diff, flags=4 | (flood_val << 8) | cv2.FLOODFILL_MASK_ONLY)

    # Extract actual mask (crop padding of 1)
    bg_mask = mask[1:h+1, 1:w+1]

    # Invert to get foreground mask: 255 = keep, 0 = remove
    fg_mask = cv2.bitwise_not(bg_mask)

    # Anti-aliasing: smooth edges slightly so no jagged pixelation
    if blur_radius > 0:
        fg_mask = cv2.GaussianBlur(fg_mask, (blur_radius * 2 + 1, blur_radius * 2 + 1), 0)

    # Build BGRA image
    b, g, r = cv2.split(bgr)
    rgba = cv2.merge([b, g, r, fg_mask])

    cv2.imwrite(output_path, rgba)
    print(f"Successfully processed: {output_path} (size: {w}x{h})")

def main():
    decor_dir = "fe/public/images/decor"
    files = [
        "lace-frame-royal.jpg",
        "lace-frame-gold-arch.jpg",
        "scalloped-paper-frame.png",
        "twin-swans-heart.png",
        "vintage-wedding-car.jpg"
    ]

    for fname in files:
        src = os.path.join(decor_dir, fname)
        base, _ = os.path.splitext(fname)
        dst = os.path.join(decor_dir, f"{base}.png")
        # tolerance = 18 for clean extraction without cutting into shadows
        remove_outer_white_background(src, dst, tolerance=18, blur_radius=1)

if __name__ == "__main__":
    main()
