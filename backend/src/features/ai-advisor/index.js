const express = require('express');
const router = express.Router();
const aiAdvisorController = require('./ai-advisor.controller');
const { authMiddleware } = require('../../shared/middleware');
const { uploadFaceImage } = require('../../shared/middleware');

// Public routes
router.get('/face-shapes', aiAdvisorController.getSupportedFaceShapes);
router.get('/recommendations/:faceShape', aiAdvisorController.getRecommendationsByShape);

// Protected routes
router.post('/analyze', authMiddleware, uploadFaceImage, aiAdvisorController.analyzeFace);
router.get('/history', authMiddleware, aiAdvisorController.getAnalysisHistory);

module.exports = router;