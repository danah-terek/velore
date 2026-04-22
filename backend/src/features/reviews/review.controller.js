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
    const { user_id, product_id, comment } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({ success: false, message: "user_id and product_id are required" });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: "Comment is required" });
    }

    const review = await reviewService.createReview({
      user_id,
      product_id,
      comment: comment.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: { ...review, feedback_id: review.feedback_id.toString() },
    });
  } catch (error) {
    console.error("createReview error:", error);
    res.status(500).json({ success: false, message: "Failed to submit review" });
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

module.exports = {
  getReviewsByProduct,
  getReviewById,
  createReview,
  deleteReview,
};