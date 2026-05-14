# AI Module Plan (Face Shape → Recommendations)

This plan reflects the current repo:
- AI service exists but is a stub (`ai-service/app.py`)
- Schema already contains AI-related tables:
  - `ai_recommendations` (user↔product, face_shape, confidence)
  - `face_images` (raw bytes stored in DB; high privacy risk)

## Preferred architecture (no direct DB access from AI service)

1) Frontend uploads an image to backend  
2) Backend validates + forwards to AI service  
3) AI service returns a face shape + confidence  
4) Backend stores analysis/recommendations in PostgreSQL using Prisma  
5) Backend returns recommendations to frontend

## AI service (FastAPI) — what to implement next

Existing endpoints:
- `GET /health`
- `GET /`

Missing endpoints (required):
- `POST /classify-face-shape`
  - content type: `multipart/form-data`
  - field: `image` (file)
  - response:
    - `face_shape` (string)
    - `confidence` (0..1)
    - optional debug/landmark metadata (dev only)

Dependencies already present:
- `mediapipe`, `opencv-python`, `numpy`, `python-multipart`

Current limitations:
- `shape_classifier.py` is empty
- `face_detection.py` is empty

## Backend (Express) — integration endpoints (planned)

Add:
- `POST /api/v1/ai/analyze-face`
  - accepts multipart image
  - forwards to AI service URL (`AI_SERVICE_URL`)
  - stores result (carefully: avoid storing raw face image unless needed)

Add:
- `GET /api/v1/ai/recommendations`
  - returns product recommendations for the current user/session

## Data/privacy policy (senior-project quality)

Face data is sensitive. Recommended policy:
- do not store raw face images by default
- if stored, store encrypted or store object-storage references
- add retention policy and deletion path

