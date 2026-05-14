const reviewService = require("./review.service");

// ─── SERIALIZE HELPER ─────────────────────────────────────────────────────────
const serializeReview = (r) => ({
  ...r,
  feedback_id: r.feedback_id.toString(),
  users: r.users
    ? { ...r.users, user_id: r.users.user_id.toString() }
    : null,
  products: r.products
    ? { ...r.products, product_id: r.products.product_id.toString() }
    : null,
});

const serializeModerationReview = (r) => ({
  review_id: r.review_id.toString(),
  order_id: r.order_id.toString(),
  user_id: r.user_id.toString(),
  product_id: r.product_id ? r.product_id.toString() : null,
  rating: r.rating,
  comment: r.comment,
  status: r.status,
  created_at: r.created_at,
  users: r.users
    ? { user_id: r.users.user_id.toString(), name: r.users.name, email: r.users.email }
    : null,
  products: r.products
  ? { product_id: r.products.product_id.toString(), name: r.products.name }
  : null
});

// ─── GET REVIEWS BY PRODUCT ───────────────────────────────────────────────────
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await reviewService.getReviewsByProduct(productId);
    res.status(200).json({
      success: true,
      data: reviews.map(serializeReview),
    });
  } catch (error) {
    console.error("getReviewsByProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// ─── GET REVIEW BY ID ─────────────────────────────────────────────────────────
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await reviewService.getReviewById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, data: serializeReview(review) });
  } catch (error) {
    console.error("getReviewById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch review" });
  }
};

// ─── CREATE REVIEW ────────────────────────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { product_id, order_id, rating, comment } = req.body;
    const tokenUserId = req.user?.userId;

    if (!tokenUserId || !product_id) {
      return res.status(400).json({ success: false, message: "product_id is required", errors: [] });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5", errors: [] });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: "Comment is required", errors: [] });
    }

    const review = await reviewService.createReview({
      user_id: tokenUserId,
      product_id,
      order_id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: {
        review_id: review.review_id.toString(),
        user_id: review.user_id.toString(),
        product_id: review.product_id.toString(),
        order_id: review.order_id.toString(),
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        created_at: review.created_at
      },
      errors: []
    });
  } catch (error) {
    console.error("createReview error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to submit review", errors: [] });
  }
};

// ─── DELETE REVIEW ────────────────────────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await reviewService.getReviewById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await reviewService.deleteReview(id);
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};

// ─── GET PENDING REVIEWS (ADMIN) ──────────────────────────────────────────────
const getPendingReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getPendingReviews();
    res.status(200).json({
      success: true,
      data: reviews.map(serializeModerationReview),
    });
  } catch (error) {
    console.error("getPendingReviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending reviews" });
  }
};

// ─── GET APPROVED REVIEWS (PUBLIC) ────────────────────────────────────────────
const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getApprovedReviews();
    res.status(200).json({
      success: true,
      data: reviews.map(serializeModerationReview),
    });
  } catch (error) {
    console.error("getApprovedReviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch approved reviews" });
  }
};

// ─── APPROVE / REJECT REVIEW (ADMIN) ──────────────────────────────────────────
const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await reviewService.updateReviewStatus(id, "approved");
    res.status(200).json({
      success: true,
      message: "Review approved successfully",
      data: serializeModerationReview(review),
    });
  } catch (error) {
    console.error("approveReview error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.status(500).json({ success: false, message: "Failed to approve review" });
  }
};

const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await reviewService.updateReviewStatus(id, "rejected");
    res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      data: serializeModerationReview(review),
    });
  } catch (error) {
    console.error("rejectReview error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.status(500).json({ success: false, message: "Failed to reject review" });
  }
};

module.exports = {
  getReviewsByProduct,
  getReviewById,
  createReview,
  deleteReview,
  getPendingReviews,
  getApprovedReviews,
  approveReview,
  rejectReview,
};