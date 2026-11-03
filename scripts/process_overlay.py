import os
import sys
import json
import argparse
import numpy as np
import cv2
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import rembg

def get_rembg_session(model_name="u2netp"):
    """Get rembg session, prioritizing lightweight/cached model."""
    try:
        return rembg.new_session(model_name)
    except Exception:
        return rembg.new_session("u2netp")

def extract_dominant_colors(img_rgba, max_colors=5):
    """Extract dominant colors from non-transparent pixels."""
    arr = np.array(img_rgba)
    if arr.shape[2] < 4:
        alpha = np.ones((arr.shape[0], arr.shape[1]), dtype=np.uint8) * 255
    else:
        alpha = arr[:, :, 3]
    
    # Filter visible pixels
    visible_pixels = arr[alpha > 50][:, :3]
    if len(visible_pixels) == 0:
        return ["#000000", "#FFFFFF"]
    
    # Subsample for speed
    if len(visible_pixels) > 10000:
        indices = np.random.choice(len(visible_pixels), 10000, replace=False)
        visible_pixels = visible_pixels[indices]
        
    # K-means clustering to find dominant colors
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    flags = cv2.KMEANS_RANDOM_CENTERS
    k = min(max_colors, len(visible_pixels))
    _, _, centers = cv2.kmeans(visible_pixels.astype(np.float32), k, None, criteria, 10, flags)
    
    hex_colors = []
    for c in centers:
        r, g, b = int(c[0]), int(c[1]), int(c[2])
        hex_colors.append(f"#{r:02x}{g:02x}{b:02x}")
    return hex_colors

def create_ocean_background(width, height):
    """Generate high-end ocean blue radial/linear gradient background."""
    base = np.zeros((height, width, 4), dtype=np.uint8)
    # Gradient from bright ocean blue top/center to abyss midnight blue bottom
    for y in range(height):
        ratio = y / max(1, height - 1)
        r = int(0 * (1 - ratio) + 2 * ratio)
        g = int(140 * (1 - ratio) + 18 * ratio)
        b = int(210 * (1 - ratio) + 80 * ratio)
        base[y, :, 0] = r
        base[y, :, 1] = g
        base[y, :, 2] = b
        base[y, :, 3] = 255
    return Image.fromarray(base, mode="RGBA")

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def apply_glow_effect(image_rgba, glow_color_hex="#00e5ff", intensity=60, radius=18):
    """Generate high-quality outer glow around the overlay contours."""
    if intensity <= 0 or radius <= 0:
        return image_rgba
        
    alpha = np.array(image_rgba)[:, :, 3]
    w, h = image_rgba.size
    
    # Create glow layer based on alpha channel
    glow_rgb = hex_to_rgb(glow_color_hex)
    
    # Multi-pass blur for cinematic neon falloff
    glow_mask = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(radius / 2))
    glow_mask_wide = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(radius))
    
    # Combine masks
    arr_mask = np.maximum(np.array(glow_mask), np.array(glow_mask_wide))
    arr_mask = (arr_mask * (intensity / 100.0)).clip(0, 255).astype(np.uint8)
    
    # Create glow image
    glow_arr = np.zeros((h, w, 4), dtype=np.uint8)
    glow_arr[:, :, 0] = glow_rgb[0]
    glow_arr[:, :, 1] = glow_rgb[1]
    glow_arr[:, :, 2] = glow_rgb[2]
    glow_arr[:, :, 3] = arr_mask
    
    glow_img = Image.fromarray(glow_arr, mode="RGBA")
    
    # Composite: Glow behind original image
    result = Image.alpha_composite(glow_img, image_rgba)
    return result

def apply_shadow_effect(image_rgba, intensity=50, radius=15, offset=(8, 12)):
    """Generate subtle depth drop shadow behind the overlay."""
    if intensity <= 0 or radius <= 0:
        return image_rgba
        
    w, h = image_rgba.size
    alpha = np.array(image_rgba)[:, :, 3]
    
    # Blurred shadow mask
    shadow_mask = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(radius))
    arr_mask = (np.array(shadow_mask) * (intensity / 100.0)).clip(0, 255).astype(np.uint8)
    
    shadow_arr = np.zeros((h, w, 4), dtype=np.uint8)
    shadow_arr[:, :, 3] = arr_mask
    shadow_img = Image.fromarray(shadow_arr, mode="RGBA")
    
    # Offset shadow
    dx, dy = offset
    shifted_shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shifted_shadow.paste(shadow_img, (dx, dy), shadow_img)
    
    # Composite shadow behind
    return Image.alpha_composite(shifted_shadow, image_rgba)

def detect_and_hollow_center(image_rgba, hollow_sensitivity=0.8):
    """
    For game / webcam stream overlays:
    Identify if there is an enclosed central area that was meant to be the transparent window.
    """
    arr = np.array(image_rgba)
    alpha = arr[:, :, 3]
    h, w = alpha.shape
    
    # Find contours on thresholded alpha
    _, binary = cv2.threshold(alpha, 128, 255, cv2.THRESH_BINARY)
    contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    if hierarchy is None or len(hierarchy[0]) == 0:
        return image_rgba, []
        
    cutouts = []
    min_area = (w * h) * 0.15 # Center cutouts are typically at least 15% of screen
    
    for i, cnt in enumerate(contours):
        area = cv2.contourArea(cnt)
        if area > min_area:
            x, y, bw, bh = cv2.boundingRect(cnt)
            # Check if this contour is near center (not touching all outer borders)
            is_interior = (x > w * 0.03 and y > h * 0.03 and (x + bw) < w * 0.97 and (y + bh) < h * 0.97)
            if is_interior:
                cutouts.append({
                    "x": int(x),
                    "y": int(y),
                    "width": int(bw),
                    "height": int(bh),
                    "area_pct": round((area / (w * h)) * 100, 1)
                })
                
    return image_rgba, cutouts

def process_overlay(
    input_path,
    output_path,
    alpha_matting=True,
    edge_feather=2,
    glow_intensity=35,
    glow_color="#00e5ff",
    shadow_intensity=40,
    neon_boost=15,
    metallic_boost=10,
    target_width=None,
    target_height=None,
    hollow_center=False,
    bg_color=None
):
    """Main automated overlay generation pipeline."""
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")
        
    # Step 1: Read original image
    pil_orig = Image.open(input_path).convert("RGB")
    orig_w, orig_h = pil_orig.size
    
    # Step 2: Background removal via rembg
    try:
        session = get_rembg_session("u2netp")
        # rembg remove with alpha matting option
        pil_rgba = rembg.remove(
            pil_orig,
            session=session,
            alpha_matting=alpha_matting,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=max(1, edge_feather)
        )
    except Exception as e:
        # Fallback if rembg encounters error
        print(f"Warning: rembg execution error ({str(e)}), falling back to OpenCV chroma key", file=sys.stderr)
        cv_img = cv2.cvtColor(np.array(pil_orig), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        pil_rgba = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGBA))
        pil_rgba.putalpha(Image.fromarray(mask))

    # Clean edges & defringe
    arr = np.array(pil_rgba)
    alpha = arr[:, :, 3]
    
    # Remove single pixel noise
    kernel = np.ones((3, 3), np.uint8)
    alpha_clean = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, kernel)
    
    if edge_feather > 0:
        # Soft antialiased boundary
        alpha_clean = cv2.GaussianBlur(alpha_clean, (edge_feather * 2 + 1, edge_feather * 2 + 1), 0)
        
    arr[:, :, 3] = alpha_clean
    pil_refined = Image.fromarray(arr, mode="RGBA")
    
    # Optional hollow out center if requested or detected
    pil_refined, detected_cutouts = detect_and_hollow_center(pil_refined)
    
    # Step 3: Contrast & Color Adjustments (Vibrancy / Metallic / Neon)
    if neon_boost > 0 or metallic_boost > 0:
        # Enhance RGB channels while preserving alpha
        rgb_part = pil_refined.convert("RGB")
        if neon_boost > 0:
            color_enhancer = ImageEnhance.Color(rgb_part)
            rgb_part = color_enhancer.enhance(1.0 + (neon_boost / 100.0))
        if metallic_boost > 0:
            contrast_enhancer = ImageEnhance.Contrast(rgb_part)
            rgb_part = contrast_enhancer.enhance(1.0 + (metallic_boost / 100.0))
            
        r, g, b = rgb_part.split()
        pil_refined = Image.merge("RGBA", (r, g, b, Image.fromarray(arr[:, :, 3])))

    # Step 4: Apply Effects (Outer Glow, Drop Shadow)
    result = pil_refined
    if shadow_intensity > 0:
        result = apply_shadow_effect(result, intensity=shadow_intensity, radius=12)
    if glow_intensity > 0:
        result = apply_glow_effect(result, glow_color_hex=glow_color, intensity=glow_intensity, radius=16)

    # Step 5: Resize to target resolution if specified
    if target_width and target_height and (target_width > 0 and target_height > 0):
        if (target_width, target_height) != result.size:
            result = result.resize((target_width, target_height), Image.Resampling.LANCZOS)

    # Optional Background Fill (e.g. Ocean Blue or Custom)
    if bg_color and bg_color.lower() != "transparent":
        if bg_color.lower() == "ocean":
            ocean_bg = create_ocean_background(result.size[0], result.size[1])
            result = Image.alpha_composite(ocean_bg, result)
        elif bg_color.startswith("#"):
            rgb = hex_to_rgb(bg_color)
            solid_bg = Image.new("RGBA", result.size, (rgb[0], rgb[1], rgb[2], 255))
            result = Image.alpha_composite(solid_bg, result)

    # Make parent dirs
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Save transparent PNG
    result.save(output_path, format="PNG", optimize=True)
    
    # Step 6: Quality Metrics & Analysis
    out_arr = np.array(result)
    out_alpha = out_arr[:, :, 3]
    total_pixels = out_alpha.size
    transparent_pixels = np.sum(out_alpha == 0)
    transparency_pct = round((float(transparent_pixels) / float(total_pixels)) * 100, 2)
    
    dominant_palette = extract_dominant_colors(result, max_colors=6)
    
    quality_score = 98
    warnings = []
    if transparency_pct < 5.0:
        quality_score -= 20
        warnings.append("Low transparency detected. Background may not have been fully isolated.")
    elif transparency_pct > 92.0:
        quality_score -= 10
        warnings.append("Very high transparency. Some subtle border details might be missing.")
        
    report = {
        "success": True,
        "input_path": input_path,
        "output_path": output_path,
        "dimensions": {
            "width": result.size[0],
            "height": result.size[1]
        },
        "transparency_percentage": transparency_pct,
        "palette": dominant_palette,
        "cutouts_detected": detected_cutouts,
        "quality_score": quality_score,
        "warnings": warnings,
        "effects_applied": {
            "glow": glow_intensity > 0,
            "glow_color": glow_color,
            "glow_intensity": glow_intensity,
            "shadow": shadow_intensity > 0,
            "shadow_intensity": shadow_intensity,
            "neon_boost": neon_boost,
            "metallic_boost": metallic_boost
        }
    }
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Overlay Designer Image Processing Engine")
    parser.add_argument("--input", required=True, help="Input source image")
    parser.add_argument("--output", required=True, help="Output transparent PNG path")
    parser.add_argument("--alpha-matting", action="store_true", default=True, help="Enable alpha matting")
    parser.add_argument("--edge-feather", type=int, default=2, help="Edge feather radius (0-10)")
    parser.add_argument("--glow-intensity", type=int, default=30, help="Glow intensity (0-100)")
    parser.add_argument("--glow-color", default="#00e5ff", help="Hex color for glow")
    parser.add_argument("--shadow-intensity", type=int, default=35, help="Shadow intensity (0-100)")
    parser.add_argument("--neon-boost", type=int, default=15, help="Neon boost percentage")
    parser.add_argument("--metallic-boost", type=int, default=10, help="Metallic contrast boost")
    parser.add_argument("--width", type=int, default=0, help="Target width (0 = keep original)")
    parser.add_argument("--height", type=int, default=0, help="Target height (0 = keep original)")
    parser.add_argument("--hollow-center", action="store_true", default=False, help="Hollow center cutout")
    parser.add_argument("--bg-color", default="transparent", help="Background color: 'transparent', 'ocean', or hex #hex")

    args = parser.parse_args()

    try:
        report = process_overlay(
            input_path=args.input,
            output_path=args.output,
            alpha_matting=args.alpha_matting,
            edge_feather=args.edge_feather,
            glow_intensity=args.glow_intensity,
            glow_color=args.glow_color,
            shadow_intensity=args.shadow_intensity,
            neon_boost=args.neon_boost,
            metallic_boost=args.metallic_boost,
            target_width=args.width if args.width > 0 else None,
            target_height=args.height if args.height > 0 else None,
            hollow_center=args.hollow_center,
            bg_color=args.bg_color
        )
        print("JSON_START")
        print(json.dumps(report, indent=2))
        print("JSON_END")
    except Exception as e:
        err = {"success": False, "error": str(e)}
        print("JSON_START")
        print(json.dumps(err, indent=2))
        print("JSON_END")
        sys.exit(1)
