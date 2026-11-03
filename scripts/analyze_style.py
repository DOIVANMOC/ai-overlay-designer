import os
import sys
import json
import argparse
import numpy as np
import cv2
from PIL import Image

def rgb_to_hex(r, g, b):
    return f"#{int(r):02x}{int(g):02x}{int(b):02x}"

def analyze_style_image(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    pil_img = Image.open(image_path).convert("RGB")
    w, h = pil_img.size
    np_arr = np.array(pil_img)

    # 1. Color Palette via K-Means
    pixels = np_arr.reshape(-1, 3).astype(np.float32)
    if len(pixels) > 10000:
        idx = np.random.choice(len(pixels), 10000, replace=False)
        pixels = pixels[idx]

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    flags = cv2.KMEANS_RANDOM_CENTERS
    k = 5
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, flags)

    # Count occurrences
    counts = np.bincount(labels.flatten())
    sorted_idx = np.argsort(counts)[::-1]

    colors = []
    for i in sorted_idx:
        c = centers[i]
        hex_c = rgb_to_hex(c[0], c[1], c[2])
        pct = round(float(counts[i]) / float(len(labels)) * 100, 1)
        colors.append({"hex": hex_c, "percentage": pct})

    # 2. Lighting & Contrast Analysis
    gray = cv2.cvtColor(np_arr, cv2.COLOR_RGB2GRAY)
    mean_brightness = float(np.mean(gray))
    std_contrast = float(np.std(gray))
    
    # 3. Edge detection for complexity
    edges = cv2.Canny(gray, 100, 200)
    edge_density = float(np.sum(edges > 0)) / float(edges.size)

    # 4. Detect style genre based on hues and characteristics
    hsv = cv2.cvtColor(np_arr, cv2.COLOR_RGB2HSV)
    h_channel = hsv[:, :, 0]
    s_channel = hsv[:, :, 1]
    v_channel = hsv[:, :, 2]
    
    mean_sat = float(np.mean(s_channel))
    mean_val = float(np.mean(v_channel))

    # Determine theme
    # Check for gold/yellow: Hue 20-35, Sat > 100
    gold_mask = (h_channel >= 15) & (h_channel <= 40) & (s_channel > 80)
    gold_ratio = np.sum(gold_mask) / edges.size

    # Check for cyan/magenta (Cyberpunk): Cyan hue 85-100, Magenta 140-170
    cyber_mask = ((h_channel >= 80) & (h_channel <= 105) & (s_channel > 100)) | \
                 ((h_channel >= 140) & (h_channel <= 170) & (s_channel > 100))
    cyber_ratio = np.sum(cyber_mask) / edges.size

    # Check for red/orange (Esports aggressive)
    esports_mask = ((h_channel <= 15) | (h_channel >= 165)) & (s_channel > 120)
    esports_ratio = np.sum(esports_mask) / edges.size

    if cyber_ratio > 0.08:
        theme = "Cyberpunk / Neon Futuristic"
        aesthetic = "High-tech luminescent borders, sharp geometric cuts, neon glow falloff"
        suggested_glow = "#00e5ff"
        metallic = 20
        neon = 35
    elif gold_ratio > 0.08:
        theme = "Mecha Gold / Luxury Armor"
        aesthetic = "Chiseled golden metallic bevels, luxury armor plating, warm ambient illumination"
        suggested_glow = "#ffd700"
        metallic = 40
        neon = 15
    elif esports_ratio > 0.08:
        theme = "Esports Aggressive / High Octane"
        aesthetic = "Angular carbon fiber framing, high contrast warning streaks, dynamic edges"
        suggested_glow = "#ff1744"
        metallic = 25
        neon = 25
    elif mean_brightness < 60 and mean_sat < 50:
        theme = "Dark Minimalist / Stealth Tech"
        aesthetic = "Subtle matte textures, discreet wireframe borders, clean functional hierarchy"
        suggested_glow = "#71717a"
        metallic = 15
        neon = 5
    elif mean_brightness > 180:
        theme = "Minimalist Light / Clean Studio"
        aesthetic = "Crisp white studio accents, glassmorphic soft shadows, modern typography layout"
        suggested_glow = "#3b82f6"
        metallic = 10
        neon = 10
    else:
        theme = "Modern Streaming HUD"
        aesthetic = "Balanced gaming frame with modular webcam window and status indicators"
        suggested_glow = colors[1]["hex"] if len(colors) > 1 else "#00e5ff"
        metallic = 15
        neon = 20

    # 5. Detect Layout Cutout Candidates
    # Threshold dark areas that might be game window
    _, inv_thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(inv_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    layout_elements = []
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > (w * h * 0.05): # Over 5% screen area
            x, y, bw, bh = cv2.boundingRect(cnt)
            aspect = bw / float(bh) if bh > 0 else 1.0
            
            elem_type = "Main Game Viewport"
            if 1.6 <= aspect <= 1.9 and area < (w * h * 0.4):
                elem_type = "16:9 Webcam / Secondary Box"
            elif 0.5 <= aspect <= 0.7:
                elem_type = "9:16 Vertical Webcam Box"
            elif aspect > 3.0:
                elem_type = "Ticker / Sponsor Banner"
            elif aspect < 0.4:
                elem_type = "Chat / Leaderboard Column"

            layout_elements.append({
                "type": elem_type,
                "x": int(x),
                "y": int(y),
                "width": int(bw),
                "height": int(bh),
                "area_pct": round((area / (w * h)) * 100, 1)
            })

    result = {
        "success": True,
        "image_path": image_path,
        "width": w,
        "height": h,
        "theme": theme,
        "aesthetic": aesthetic,
        "palette": colors,
        "dominant_glow_color": suggested_glow,
        "metrics": {
            "brightness": round(mean_brightness, 1),
            "contrast": round(std_contrast, 1),
            "saturation": round(mean_sat, 1),
            "edge_density": round(edge_density * 100, 2)
        },
        "suggested_settings": {
            "glow_intensity": min(80, max(15, int(mean_sat * 0.5))),
            "glow_color": suggested_glow,
            "shadow_intensity": 45,
            "metallic_boost": metallic,
            "neon_boost": neon,
            "edge_feather": 2
        },
        "layout_elements": layout_elements[:5]
    }
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Overlay Designer Style Analyzer")
    parser.add_argument("--image", required=True, help="Input image to analyze")
    args = parser.parse_args()

    try:
        report = analyze_style_image(args.image)
        print("JSON_START")
        print(json.dumps(report, indent=2))
        print("JSON_END")
    except Exception as e:
        err = {"success": False, "error": str(e)}
        print("JSON_START")
        print(json.dumps(err, indent=2))
        print("JSON_END")
        sys.exit(1)

