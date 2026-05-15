from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging
import sys
import cv2
import numpy as np
import mediapipe as mp

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from face_detection import FaceAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

# Config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5001"))
MAX_SIZE_MB = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))
ALLOWED_EXTENSIONS = set(os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,webp,jfif").split(","))

app = FastAPI(title="Velore AI Face Analysis")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = FaceAnalyzer()

@app.get("/")
async def root():
    return {"message": "Velore AI Service Running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-face-analysis"}

@app.post("/analyze")
async def analyze_face(file: UploadFile = File(...)):
    print(f"DEBUG: Received file: {file.filename}, content_type: {file.content_type}")
    
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    print(f"DEBUG: Extension: '{ext}', Allowed: {ALLOWED_EXTENSIONS}")
    
    if ext not in ALLOWED_EXTENSIONS:
        print(f"DEBUG: Rejected - invalid extension '{ext}'")
        raise HTTPException(status_code=400, detail=f"Invalid file type: .{ext}")

    contents = await file.read()
    print(f"DEBUG: File read successfully, size: {len(contents)} bytes")

    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        print(f"DEBUG: Rejected - too large: {size_mb:.1f}MB")
        raise HTTPException(status_code=400, detail=f"Image too large: {size_mb:.1f}MB")

    logger.info(f"Analyzing: {file.filename} ({size_mb:.2f}MB)")

    try:
        result = analyzer.analyze(contents)
    except Exception as e:
        print(f"DEBUG: Analysis crashed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Analysis error: {str(e)}")

    if not result["success"]:
        print(f"DEBUG: No face detected: {result.get('error')}")
        raise HTTPException(status_code=422, detail=result.get("error", "Analysis failed"))

    return result


@app.post("/landmarks")
async def get_landmarks(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = analyzer.load_image(contents)          # ✅ consistent loader
        img_rgb = analyzer.preprocess(img)           # ✅ resize + normalize
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        result = analyzer.detector.detect(mp_image)

        if not result.face_landmarks:
            return {"detected": False, "landmarks": None}

        lm = result.face_landmarks[0]
        h, w = img.shape[:2]

        return {
            "detected": True,
            "landmarks": {
                "left_eye":     {"x": lm[33].x * w,  "y": lm[33].y * h},
                "right_eye":    {"x": lm[263].x * w, "y": lm[263].y * h},
                "nose_bridge":  {"x": lm[168].x * w, "y": lm[168].y * h},
                "left_temple":  {"x": lm[234].x * w, "y": lm[234].y * h},
                "right_temple": {"x": lm[454].x * w, "y": lm[454].y * h},
                "image_width":  w,
                "image_height": h
            }
        }
    except Exception as e:
        logger.error(f"Landmark error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)