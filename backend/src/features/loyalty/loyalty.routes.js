const express = require("express");
const router = express.Router();
console.log('✅ loyalty.routes.js loaded')

const {
  getLoyalty,
  getMyLoyalty,
  awardPoints,
  redeemUserPoints,
} = require("./loyalty.controller");

const { authMiddleware, adminAuthMiddleware } = require('../../shared/middleware/middleware')
const rbac = require('../rbac')

// Customer-authenticated routes (current user)
router.get("/points", (req, res, next) => {
  console.log('🔍 loyalty route hit!')
  next()
}, authMiddleware, getMyLoyalty);
router.post("/redeem", authMiddleware, redeemUserPoints);

// Admin-only routes
router.get("/:userId", adminAuthMiddleware, rbac.requirePermission('read:users'), getLoyalty);
router.post("/award", adminAuthMiddleware, rbac.requirePermission('update:users'), awardPoints);

module.exports = router;