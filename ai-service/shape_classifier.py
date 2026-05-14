import numpy as np
import logging

logger = logging.getLogger(__name__)


class FaceShapeClassifier:
    
    LANDMARKS = {
        'forehead_top': 10,
        'chin_bottom': 152,
        'nasion': 168,
        'forehead_left': 54,
        'forehead_right': 284,
        'cheek_left': 123,
        'cheek_right': 352,
        'jaw_left': 172,
        'jaw_right': 397,
        'chin_left': 149,
        'chin_right': 377,
    }
    
    def __init__(self):
        self.thresholds = {
            'length_to_width': {'very_long': 1.50, 'slightly_long': 1.35, 'balanced': 1.10, 'short': 0.95},
            'jaw_to_forehead': {'very_narrow': 0.72, 'narrow': 0.80, 'balanced': 0.90, 'wide': 1.02},
            'jaw_to_cheekbone': {'narrow': 0.82, 'balanced': 0.92, 'wide': 1.00},
            'chin_to_jaw': {'pointed': 0.38, 'narrow': 0.50, 'soft': 0.65, 'rounded': 0.78},
            'forehead_to_cheekbone': {'narrow': 0.88, 'balanced': 0.95, 'wide': 1.05},
        }
    
    def calculate_distance(self, p1, p2):
        return np.linalg.norm(p1[:2] - p2[:2])
    
    def get_measurements(self, landmarks):
        points = {}
        for name, idx in self.LANDMARKS.items():
            lm = landmarks[idx]
            points[name] = np.array([lm.x, lm.y, lm.z])
        
        m = {}
        m['face_length'] = self.calculate_distance(points['forehead_top'], points['chin_bottom'])
        m['face_length_nasion'] = self.calculate_distance(points['nasion'], points['chin_bottom'])
        m['forehead_width'] = self.calculate_distance(points['forehead_left'], points['forehead_right'])
        m['cheekbone_width'] = self.calculate_distance(points['cheek_left'], points['cheek_right'])
        m['jaw_width'] = self.calculate_distance(points['jaw_left'], points['jaw_right'])
        m['chin_width'] = self.calculate_distance(points['chin_left'], points['chin_right'])
        return m
    
    def calculate_ratios(self, m):
        eps = 1e-8
        r = {}
        r['length_to_width'] = m['face_length'] / (m['cheekbone_width'] + eps)
        r['length_nasion_to_width'] = m['face_length_nasion'] / (m['cheekbone_width'] + eps)
        r['jaw_to_forehead'] = m['jaw_width'] / (m['forehead_width'] + eps)
        r['jaw_to_cheekbone'] = m['jaw_width'] / (m['cheekbone_width'] + eps)
        r['forehead_to_cheekbone'] = m['forehead_width'] / (m['cheekbone_width'] + eps)
        r['chin_to_jaw'] = m['chin_width'] / (m['jaw_width'] + eps)
        return r
    
    def classify(self, landmarks):
        try:
            m = self.get_measurements(landmarks)
            r = self.calculate_ratios(m)
            t = self.thresholds
            
            scores = {'Round': 0.0, 'Oval': 0.0, 'Square': 0.0, 'Heart': 0.0, 'Rectangle': 0.0}
            
            # Round
            if r['length_to_width'] < 1.15: scores['Round'] += 30
            if r['jaw_to_forehead'] > 0.85: scores['Round'] += 25
            if r['jaw_to_cheekbone'] > 0.85: scores['Round'] += 20
            if r['chin_to_jaw'] > 0.65: scores['Round'] += 25
            
            # Oval
            if 1.10 <= r['length_to_width'] <= 1.45: scores['Oval'] += 35
            if 0.80 <= r['jaw_to_forehead'] <= 1.0: scores['Oval'] += 25
            if 0.85 <= r['forehead_to_cheekbone'] <= 1.05: scores['Oval'] += 20
            if 0.50 <= r['chin_to_jaw'] <= 0.70: scores['Oval'] += 20
            
            # Square
            if r['jaw_to_forehead'] > 0.95: scores['Square'] += 35
            if r['jaw_to_cheekbone'] > 0.90: scores['Square'] += 25
            if r['length_to_width'] < 1.20: scores['Square'] += 20
            if r['chin_to_jaw'] < 0.55: scores['Square'] += 20
            
            # Heart
            if r['jaw_to_forehead'] < 0.75: scores['Heart'] += 35
            if r['chin_to_jaw'] < 0.45: scores['Heart'] += 30
            if r['forehead_to_cheekbone'] > 1.02: scores['Heart'] += 20
            if r['jaw_to_cheekbone'] < 0.85: scores['Heart'] += 15
            
            # Rectangle
            if r['length_to_width'] > 1.45: scores['Rectangle'] += 40
            if r['length_nasion_to_width'] > 1.30: scores['Rectangle'] += 25
            if r['jaw_to_forehead'] < 1.0: scores['Rectangle'] += 20
            if r['forehead_to_cheekbone'] < 1.0: scores['Rectangle'] += 15
            
            total = sum(scores.values())
            if total > 0:
                normalized = {s: round((sc / total) * 100, 1) for s, sc in scores.items()}
            else:
                normalized = {s: 20.0 for s in scores}
            
            sorted_shapes = sorted(normalized.items(), key=lambda x: x[1], reverse=True)
            primary_shape = sorted_shapes[0][0]
            confidence = sorted_shapes[0][1]
            
            return {
                'face_shape': primary_shape,
                'confidence': confidence,
                'all_scores': normalized,
                'top_shapes': [{'shape': s, 'score': sc} for s, sc in sorted_shapes[:3]],
                'ratios': {k: round(v, 3) for k, v in r.items()},
            }
        except Exception as e:
            logger.error(f"Classification failed: {str(e)}")
            raise ValueError(f"Face shape classification failed: {str(e)}")


classifier = FaceShapeClassifier()


def classify_face_shape(landmarks):
    return classifier.classify(landmarks)