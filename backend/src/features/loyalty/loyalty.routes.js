const express = require("express");
const router = express.Router();
const {
  getLoyalty,
  getLoyaltyByToken,
  awardPoints,
  redeemUserPoints,
} = require("./loyalty.controller");

router.get("/points", getLoyaltyByToken);
router.get("/:userId", getLoyalty);
router.post("/award", awardPoints);
router.post("/redeem", redeemUserPoints);

module.exports = router;