const aiAdvisorService = require('./ai-advisor.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const aiAdvisorController = {
  analyzeFace: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image provided' });
      }

      let analysisResult;
      try {
        analysisResult = await aiAdvisorService.analyzeFaceShape(req.file.buffer, req.file.originalname);
      } catch (aiError) {
        if (aiError.message.includes('No face detected')) {
          return res.status(422).json({ success: false, error: aiError.message });
        }
        return res.status(502).json({ success: false, error: 'AI service unavailable' });
      }

      await prisma.face_images.create({
        data: {
          user_id: BigInt(Number(userId)),
          image_data: req.file.buffer,
        },
      });

      const faceShape = analysisResult.face_shape;
      const confidence = analysisResult.confidence;
      const recommendations = await aiAdvisorService.getProductRecommendations(faceShape);

      if (recommendations.length > 0) {
        await aiAdvisorService.saveRecommendations(Number(userId), recommendations, faceShape, confidence);
      }

      return res.status(200).json({
        success: true,
        analysis: analysisResult,
        recommendations: recommendations.map((rec) => ({
          product_id: rec.product_id.toString(),
          name: rec.name,
          description: rec.description,
          price: parseFloat(rec.price),
          frame_shape: rec.frame_shape,
          brand: rec.brands?.name || null,
          category: rec.categories?.name || null,
          material: rec.material,
          virtual_try_on: rec.virtual_try_on,
          image: rec.product_variants?.[0]?.images?.[0] || null,
          variants: (rec.product_variants || []).map((v) => ({
            variant_id: v.variant_id.toString(),
            sku: v.sku,
            color_name: v.color_name,
            color_hex: v.color_hex,
            images: v.images,
          })),
        })),
      });
    } catch (error) {
      console.error('Analyze face error:', error);
      return res.status(500).json({ success: false, error: 'Analysis failed' });
    }
  },

  getSupportedFaceShapes: async (req, res) => {
    const mapping = aiAdvisorService.getFaceToFrameMapping();
    const shapes = Object.entries(mapping).map(([shape, data]) => ({
      shape,
      recommended_frames: data.recommended,
      avoid_frames: data.avoid,
    }));
    return res.status(200).json({ success: true, face_shapes: shapes });
  },

  getRecommendationsByShape: async (req, res) => {
    try {
      const validShapes = ['Round', 'Oval', 'Square', 'Heart', 'Rectangle'];
      if (!validShapes.includes(req.params.faceShape)) {
        return res.status(400).json({ success: false, error: 'Invalid face shape' });
      }
      const recommendations = await aiAdvisorService.getProductRecommendations(req.params.faceShape);
      return res.status(200).json({
        success: true,
        recommendations: recommendations.map((rec) => ({
          product_id: rec.product_id.toString(),
          name: rec.name,
          price: parseFloat(rec.price),
          frame_shape: rec.frame_shape,
          brand: rec.brands?.name || null,
          image: rec.product_variants?.[0]?.images?.[0] || null,
        })),
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
    }
  },

  getAnalysisHistory: async (req, res) => {
    try {
      const analyses = await prisma.face_images.findMany({
        where: { user_id: BigInt(Number(req.user.userId)) },
        orderBy: { uploaded_at: 'desc' },
        take: 10,
      });
      return res.status(200).json({
        success: true,
        history: analyses.map((a) => ({
          image_id: a.image_id.toString(),
          uploaded_at: a.uploaded_at,
        })),
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
  },
};

module.exports = aiAdvisorController;