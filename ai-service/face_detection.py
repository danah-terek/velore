import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import logging
import time
import os

from shape_classifier import classify_face_shape

logger = logging.getLogger(__name__)


class FaceAnalyzer:
    
    def __init__(self, min_detection_confidence=0.3):
        base_options = python.BaseOptions(model_asset_buffer=self._get_model())
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
            num_faces=1,
        )
        self.detector = vision.FaceLandmarker.create_from_options(options)
    
    def _get_model(self):
        model_path = os.path.join(os.path.dirname(__file__), "face_landmarker.task")
        if not os.path.exists(model_path):
            import urllib.request
            url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
            logger.info("Downloading face landmarker model...")
            urllib.request.urlretrieve(url, model_path)
        with open(model_path, "rb") as f:
            return f.read()
    
    def load_image(self, image_bytes):
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not load image")
        return img
    
    def preprocess(self, img):
        h, w = img.shape[:2]
        max_dim = 1920
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    def analyze(self, image_bytes):
        start_time = time.time()
        
        try:
            img = self.load_image(image_bytes)
            img_rgb = self.preprocess(img)
            
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
            detection_result = self.detector.detect(mp_image)
            
            if not detection_result.face_landmarks:
                return {
                    'success': False,
                    'face_count': 0,
                    'error': 'No face detected. Please ensure your face is clearly visible.',
                    'processing_time_ms': round((time.time() - start_time) * 1000, 1),
                }
            
            landmarks = detection_result.face_landmarks[0]
            classification = classify_face_shape(landmarks)
            
            return {
                'success': True,
                'face_shape': classification['face_shape'],
                'confidence': classification['confidence'],
                'all_scores': classification['all_scores'],
                'top_shapes': classification['top_shapes'],
                'ratios': classification['ratios'],
                'face_count': len(detection_result.face_landmarks),
                'processing_time_ms': round((time.time() - start_time) * 1000, 1),
                'warnings': [],
            }
            
        except Exception as e:
            logger.error(f"Analysis error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'processing_time_ms': round((time.time() - start_time) * 1000, 1),
            }


analyzer = FaceAnalyzer()


def analyze_face_image(image_bytes):
    return analyzer.analyze(image_bytes)