const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const { adminAuthMiddleware } = require("../../shared/middleware/middleware");

// Public routes
router.get("/approved", reviewController.getApprovedReviews);
router.get("/product/:productId", reviewController.getReviewsByProduct);

// Auth-protected routes (add your auth middleware here)
router.get("/pending", adminAuthMiddleware, reviewController.getPendingReviews);
router.post("/", reviewController.createReview);
router.put("/:id/approve", adminAuthMiddleware, reviewController.approveReview);
router.put("/:id/reject", adminAuthMiddleware, reviewController.rejectReview);
router.get("/:id", reviewController.getReviewById);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;