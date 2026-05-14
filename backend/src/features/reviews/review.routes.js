const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const { adminAuthMiddleware, authMiddleware } = require("../../shared/middleware/middleware");
const rbac = require("../rbac");

// Public routes
router.get("/approved", reviewController.getApprovedReviews);
router.get("/product/:productId", reviewController.getReviewsByProduct);

// Auth-protected routes (add your auth middleware here)
router.get("/pending", adminAuthMiddleware, rbac.requirePermission("read:reviews"), reviewController.getPendingReviews);
router.post("/", authMiddleware, reviewController.createReview);
router.put("/:id/approve", adminAuthMiddleware, rbac.requirePermission("moderate:reviews"), reviewController.approveReview);
router.put("/:id/reject", adminAuthMiddleware, rbac.requirePermission("moderate:reviews"), reviewController.rejectReview);
router.get("/:id", reviewController.getReviewById);
router.delete("/:id", adminAuthMiddleware, rbac.requirePermission("delete:reviews"), reviewController.deleteReview);

module.exports = router;