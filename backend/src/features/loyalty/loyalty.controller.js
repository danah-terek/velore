const {
  checkAndAwardPoints,
  redeemPoints,
  getLoyaltyInfo,
} = require("./loyalty.service");

function jsonSuccess(res, data, message = null) {
  return res.json({ success: true, message, data });
}

function jsonError(res, status, message, errors = []) {
  return res.status(status).json({ success: false, message, errors });
}

// GET /api/v1/loyalty/:userId (admin-only)
async function getLoyalty(req, res) {
  try {
    const userId = req.params.userId;
    const data = await getLoyaltyInfo(Number(userId));
    return jsonSuccess(res, data);
  } catch (error) {
    return jsonError(res, 500, error.message);
  }
}

// GET /api/v1/loyalty/points (customer-auth: current user)
async function getMyLoyalty(req, res) {
  try {
    console.log('🔍 getMyLoyalty called, user:', req.user)
    const userId = req.user?.userId;
    if (!userId) return jsonError(res, 401, 'Unauthorized');
    const data = await getLoyaltyInfo(Number(userId));
    console.log('🔍 loyalty data:', JSON.stringify(data))
    return jsonSuccess(res, data);
  } catch (error) {
    console.error('🔴 getMyLoyalty error:', error.message, error.stack)
    return jsonError(res, 500, error.message);
  }
}

// POST /api/v1/loyalty/award (admin-only)
async function awardPoints(req, res) {
  try {
    const { userId: rawUserId, orderId: rawOrderId } = req.body || {};
    if (!rawUserId || !rawOrderId) {
      return jsonError(res, 400, 'userId and orderId are required');
    }
    const result = await checkAndAwardPoints(Number(rawUserId), Number(rawOrderId));
    if (result.awarded) {
      return jsonSuccess(res, result, `${result.pointsEarned} points awarded`)
    } else {
      return jsonSuccess(res, result, "No milestone reached yet");
    }
  } catch (error) {
    return jsonError(res, 500, error.message);
  }
}

// POST /api/v1/loyalty/redeem (customer-auth: current user)
async function redeemUserPoints(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return jsonError(res, 401, 'Unauthorized');
    const { orderId: rawOrderId, pointsToRedeem: rawPoints } = req.body || {};
    if (!rawOrderId || rawPoints === undefined) {
      return jsonError(res, 400, 'orderId and pointsToRedeem are required');
    }
    const pointsToRedeem = parseInt(rawPoints);
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return jsonError(res, 400, "Invalid points amount");
    }
    const result = await redeemPoints(Number(userId), Number(rawOrderId), pointsToRedeem);
    return jsonSuccess(res, result, `Redeemed ${result.pointsRedeemed} points for $${result.discountApplied} off`);
  } catch (error) {
    return jsonError(res, 400, error.message);
  }
}

module.exports = { getLoyalty, getMyLoyalty, awardPoints, redeemUserPoints };