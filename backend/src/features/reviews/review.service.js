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
const createReview = async ({ user_id, product_id, order_id, rating, comment }) => {
    return await prisma.reviews.create({
      data: {
        user_id: BigInt(user_id),
        product_id: BigInt(product_id),
        order_id: BigInt(order_id),
        rating: Number(rating),
        comment,
        status: "pending"
      }
    });
  };

// ─── DELETE REVIEW ────────────────────────────────────────────────────────────
const deleteReview = async (feedback_id) => {
  return await prisma.feedback.delete({
    where: { feedback_id: Number(feedback_id) },
  });
};

// ─── GET PENDING REVIEWS (ADMIN) ──────────────────────────────────────────────
const getPendingReviews = async () => {
  return await prisma.reviews.findMany({
    where: { status: "pending" },
    orderBy: { created_at: "desc" },
    include: {
      users: {
        select: { user_id: true, name: true, email: true },
      },
      orders: {
        select: { order_id: true, status: true, order_date: true },
      },
    },
  });
};

// ─── GET APPROVED REVIEWS (PUBLIC) ────────────────────────────────────────────
const getApprovedReviews = async () => {
  return await prisma.reviews.findMany({
    where: { status: "approved" },
    orderBy: { created_at: "desc" },
    include: {
      users: {
        select: { user_id: true, name: true },
      },
      orders: {
        select: { order_id: true },
      },
    },
  });
};

// ─── UPDATE REVIEW STATUS ─────────────────────────────────────────────────────
const updateReviewStatus = async (review_id, status) => {
  return await prisma.reviews.update({
    where: { review_id: BigInt(review_id) },
    data: { status },
    include: {
      users: {
        select: { user_id: true, name: true, email: true },
      },
      orders: {
        select: { order_id: true, status: true },
      },
    },
  });
};

module.exports = {
  getReviewsByProduct,
  getReviewById,
  createReview,
  deleteReview,
  getPendingReviews,
  getApprovedReviews,
  updateReviewStatus,
};