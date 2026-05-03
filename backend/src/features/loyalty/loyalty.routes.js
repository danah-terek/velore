const express = require("express");
const router = express.Router();
const {
  getLoyalty,
  awardPoints,
  redeemUserPoints,
} = require("./loyalty.controller");

// GET /loyalty/:userId  →  get points balance + history
router.get("/:userId", getLoyalty);

// POST /loyalty/award  →  check and award points after order
router.post("/award", awardPoints);

// POST /loyalty/redeem  →  redeem points as discount
router.post("/redeem", redeemUserPoints);

module.exports = router;