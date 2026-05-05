const {
  checkAndAwardPoints,
  redeemPoints,
  getLoyaltyInfo,
} = require("./loyalty.service");

// GET /loyalty/:userId
async function getLoyalty(req, res) {
  try {
    const userId = BigInt(req.params.userId);
    const data = await getLoyaltyInfo(userId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /loyalty/award
// Body: { userId, orderId }
async function awardPoints(req, res) {
  try {
    const userId = BigInt(req.body.userId);
    const orderId = BigInt(req.body.orderId);

    const result = await checkAndAwardPoints(userId, orderId);

    if (result.awarded) {
      res.json({
        success: true,
        message: `🎉 ${result.pointsEarned} points awarded for reaching ${result.totalOrders} orders!`,
        data: result,
      });
    } else {
      res.json({
        success: true,
        message: "No milestone reached yet, keep ordering!",
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /loyalty/redeem
// Body: { userId, orderId, pointsToRedeem }
async function redeemUserPoints(req, res) {
  try {
    const userId = BigInt(req.body.userId);
    const orderId = BigInt(req.body.orderId);
    const pointsToRedeem = parseInt(req.body.pointsToRedeem);

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid points amount" });
    }

    const result = await redeemPoints(userId, orderId, pointsToRedeem);

    res.json({
      success: true,
      message: `✅ Redeemed ${result.pointsRedeemed} points for $${result.discountApplied} off!`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getLoyaltyByToken(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.user_id || decoded.id;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID not found in token' });
    }

    const data = await getLoyaltyInfo(BigInt(userId));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { getLoyalty, getLoyaltyByToken, awardPoints, redeemUserPoints };