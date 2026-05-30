const { PrismaClient } = require('@prisma/client');
const FormData = require('form-data');
const axios = require('axios');

const prisma = new PrismaClient();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_TIMEOUT = 30000;

const FACE_TO_FRAME_MAPPING = {
  Round: {
    recommended: ['rectangle', 'square', 'geometric', 'cat-eye', 'wayfarer'],
    avoid: ['round', 'oval'],
  },
  Oval: {
    recommended: ['rectangle', 'square', 'round', 'cat-eye', 'aviator', 'geometric', 'wayfarer', 'oval'],
    avoid: [],
  },
  Square: {
    recommended: ['round', 'oval', 'cat-eye', 'aviator', 'rimless'],
    avoid: ['square', 'rectangle'],
  },
  Heart: {
    recommended: ['aviator', 'rimless', 'round', 'oval', 'cat-eye'],
    avoid: ['rectangle', 'square'],
  },
  Rectangle: {
    recommended: ['round', 'aviator', 'wayfarer', 'cat-eye', 'oversized'],
    avoid: ['small', 'narrow'],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSpecs(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Matches a product against recommended shapes.
 * Handles:
 *  - Case differences  ("Rectangle" vs "rectangle")
 *  - Comma-separated values ("oval, round, heart")
 * Reads frame_shape from specifications JSON (the dedicated column is NULL).
 */
function matchesShape(product, recommended) {
  const specs = parseSpecs(product.specifications);
  const raw = specs?.frame_shape;
  if (!raw) return false;

  const shapes = String(raw)
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return shapes.some((shape) => recommended.includes(shape));
}

// ─── Service ──────────────────────────────────────────────────────────────────

const aiAdvisorService = {
  analyzeFaceShape: async (imageBuffer, fileName) => {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: fileName || 'selfie.jpg',
      contentType: 'image/jpeg',
    });

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
        headers: formData.getHeaders(),
        timeout: AI_SERVICE_TIMEOUT,
        validateStatus: (status) => status < 500,
      });

      if (response.status === 400) {
        throw new Error(response.data.detail || 'Invalid image file');
      }

      if (response.status === 422) {
        throw new Error(response.data.detail || 'No face detected in the image');
      }

      if (!response.data.success || !response.data.face_shape) {
        throw new Error(response.data.detail || 'Face analysis failed');
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        const detail = error.response.data?.detail || 'Analysis failed';
        throw new Error(detail);
      }
      throw error;
    }
  },

  getProductRecommendations: async (faceShape) => {
    const mapping = FACE_TO_FRAME_MAPPING[faceShape];
    if (!mapping) return [];

    // Fetch all active optical glasses + sunglasses (no lenses)
    const allProducts = await prisma.products.findMany({
      where: {
        is_active: true,
        category_id: { in: [1, 2] },
      },
      include: {
        brands: { select: { name: true } },
        categories: { select: { name: true } },
        product_variants: {
          where: { stock_quantity: { gt: 0 } },
          take: 5,
        },
      },
    });

    // Filter by frame_shape inside specifications JSON
    const matched = allProducts.filter((p) => matchesShape(p, mapping.recommended));

    return matched.slice(0, 12);
  },

  saveRecommendations: async (userId, recommendations, faceShape, confidence) => {
    const records = recommendations.map((rec) => ({
      user_id: BigInt(userId),
      product_id: rec.product_id,
      face_shape: faceShape,
      confidence: confidence ? confidence / 100 : null,
      recom_date: new Date(),
    }));

    await prisma.ai_recommendations.createMany({
      data: records,
      skipDuplicates: true,
    });
  },

  getFaceToFrameMapping: () => FACE_TO_FRAME_MAPPING,
};

module.exports = aiAdvisorService;