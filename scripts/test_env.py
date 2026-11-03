import sys
import cv2
import PIL
import importlib.util

rembg_installed = importlib.util.find_spec("rembg") is not None

print("PYTHON_VERSION:", sys.version.split()[0])
print("OPENCV_VERSION:", cv2.__version__)
print("PIL_VERSION:", PIL.__version__)
print("REMBG_AVAILABLE:", rembg_installed)
