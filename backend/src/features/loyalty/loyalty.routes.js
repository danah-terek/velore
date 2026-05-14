const express = require("express");
const router = express.Router();
const {
  getLoyalty,
  getMyLoyalty,
  awardPoints,
  redeemUserPoints,
} = require("./loyalty.controller");

const { authMiddleware, adminAuthMiddleware } = require('../../shared/middleware/middleware')
const rbac = require('../rbac')

// Customer-authenticated routes (current user)
router.get("/points", authMiddleware, getMyLoyalty);
router.post("/redeem", authMiddleware, redeemUserPoints);

// Admin-only routes
router.get("/:userId", adminAuthMiddleware, rbac.requirePermission('read:users'), getLoyalty);
router.post("/award", adminAuthMiddleware, rbac.requirePermission('update:users'), awardPoints);

module.exports = router;