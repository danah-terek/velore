const reviewService = require("./review.service")

// ─── SERIALIZERS ──────────────────────────────────────────────────────────────
// Service already converts BigInts to strings, so these just shape the output.

const serializeProductReview = (r) => ({
  review_id: r.review_id,
  rating: r.rating,
  comment: r.comment,
  status: r.status,
  created_at: r.created_at,
  users: r.users
    ? { user_id: r.users.user_id, name: r.users.name }
    : null,
})

const serializeModerationReview = (r) => ({
  review_id: r.review_id,
  order_id: r.order_id ?? null,
  user_id: r.user_id,
  product_id: r.product_id ?? null,
  rating: r.rating,
  comment: r.comment,
  status: r.status,
  created_at: r.created_at,
  users: r.users
    ? { user_id: r.users.user_id, name: r.users.name, email: r.users.email }
    : null,
  products: r.products
    ? { product_id: r.products.product_id, name: r.products.name }
    : null,
})

// ─── GET REVIEWS BY PRODUCT (public — no auth needed) ────────────────────────
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params
    if (!productId || isNaN(Number(productId))) {
      return res.status(400).json({ success: false, message: "Invalid product ID" })
    }

    const reviews = await reviewService.getReviewsByProduct(productId)
    return res.status(200).json({
      success: true,
      data: reviews.map(serializeProductReview),
    })
  } catch (error) {
    console.error("getReviewsByProduct error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch reviews" })
  }
}

// ─── GET REVIEW BY ID ─────────────────────────────────────────────────────────
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params
    const review = await reviewService.getReviewById(id)
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" })
    }
    return res.status(200).json({ success: true, data: serializeModerationReview(review) })
  } catch (error) {
    console.error("getReviewById error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch review" })
  }
}

// ─── CREATE REVIEW ────────────────────────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { product_id, order_id, rating, comment } = req.body
    const tokenUserId = req.user?.userId

    if (!tokenUserId || !product_id) {
      return res.status(400).json({ success: false, message: "product_id is required", errors: [] })
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5", errors: [] })
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: "Comment is required", errors: [] })
    }

    const review = await reviewService.createReview({
      user_id: tokenUserId,
      product_id,
      order_id,
      rating: Number(rating),
      comment: comment.trim(),
    })

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully. It will appear after moderation.",
      data: review,
      errors: [],
    })
  } catch (error) {
    console.error("createReview error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
      errors: [],
    })
  }
}

// ─── DELETE REVIEW ────────────────────────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await reviewService.getReviewById(id)
    if (!existing) {
      return res.status(404).json({ success: false, message: "Review not found" })
    }
    await reviewService.deleteReview(id)
    return res.status(200).json({ success: true, message: "Review deleted successfully" })
  } catch (error) {
    console.error("deleteReview error:", error)
    return res.status(500).json({ success: false, message: "Failed to delete review" })
  }
}

// ─── GET PENDING REVIEWS (ADMIN) ──────────────────────────────────────────────
const getPendingReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getPendingReviews()
    return res.status(200).json({
      success: true,
      data: reviews.map(serializeModerationReview),
    })
  } catch (error) {
    console.error("getPendingReviews error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch pending reviews" })
  }
}

// ─── GET APPROVED REVIEWS (public — home page testimonials) ───────────────────
const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getApprovedReviews()
    return res.status(200).json({
      success: true,
      data: reviews.map(serializeModerationReview),
    })
  } catch (error) {
    console.error("getApprovedReviews error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch approved reviews" })
  }
}

// ─── APPROVE REVIEW (ADMIN) ───────────────────────────────────────────────────
const approveReview = async (req, res) => {
  try {
    const { id } = req.params
    const review = await reviewService.updateReviewStatus(id, "approved")
    return res.status(200).json({
      success: true,
      message: "Review approved successfully",
      data: serializeModerationReview(review),
    })
  } catch (error) {
    console.error("approveReview error:", error)
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Review not found" })
    }
    return res.status(500).json({ success: false, message: "Failed to approve review" })
  }
}

// ─── REJECT REVIEW (ADMIN) ────────────────────────────────────────────────────
const rejectReview = async (req, res) => {
  try {
    const { id } = req.params
    const review = await reviewService.updateReviewStatus(id, "rejected")
    return res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      data: serializeModerationReview(review),
    })
  } catch (error) {
    console.error("rejectReview error:", error)
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Review not found" })
    }
    return res.status(500).json({ success: false, message: "Failed to reject review" })
  }
}

module.exports = {
  getReviewsByProduct,
  getReviewById,
  createReview,
  deleteReview,
  getPendingReviews,
  getApprovedReviews,
  approveReview,
  rejectReview,
}