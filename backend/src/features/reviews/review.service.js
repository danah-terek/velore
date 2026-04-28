const prisma = require("../../shared/utils/database");

// ─── GET ALL REVIEWS FOR A PRODUCT ────────────────────────────────────────────
const getReviewsByProduct = async (product_id) => {
  return await prisma.feedback.findMany({
    where: { product_id: Number(product_id) },
    orderBy: { feedback_date: "desc" },
    select: {
      feedback_id: true,
      comment: true,
      feedback_date: true,
      users: {
        select: { user_id: true, name: true, email: true },
      },
    },
  });
};

// ─── GET SINGLE REVIEW ────────────────────────────────────────────────────────
const getReviewById = async (feedback_id) => {
  return await prisma.feedback.findUnique({
    where: { feedback_id: Number(feedback_id) },
    select: {
      feedback_id: true,
      comment: true,
      feedback_date: true,
      users: {
        select: { user_id: true, name: true, email: true },
      },
      products: {
        select: { product_id: true, name: true },
      },
    },
  });
};

// ─── CREATE REVIEW ────────────────────────────────────────────────────────────
const createReview = async ({ user_id, product_id, comment }) => {
  return await prisma.feedback.create({
    data: {
      user_id: Number(user_id),
      product_id: Number(product_id),
      comment,
    },
  });
};

// ─── DELETE REVIEW ────────────────────────────────────────────────────────────
const deleteReview = async (feedback_id) => {
  return await prisma.feedback.delete({
    where: { feedback_id: Number(feedback_id) },
  });
};

module.exports = {
  getReviewsByProduct,
  getReviewById,
  createReview,
  deleteReview,
};