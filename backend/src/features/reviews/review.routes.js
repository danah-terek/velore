const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");

// Public routes
router.get("/product/:productId", reviewController.getReviewsByProduct);
router.get("/:id", reviewController.getReviewById);

// Auth-protected routes (add your auth middleware here)
router.post("/", reviewController.createReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;