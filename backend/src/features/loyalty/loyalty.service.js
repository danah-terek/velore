const prisma = require("../../shared/utils/database");

const POINTS_PER_MILESTONE = 10;  // points earned every 5 orders
const ORDER_MILESTONE = 5;        // every 5 orders
const POINTS_TO_DOLLAR = 10;      // 10 points = $1

// Check completed orders and award points if milestone reached
async function checkAndAwardPoints(userId, orderId) {
  // Count how many completed orders this user has
  const completedOrdersCount = await prisma.orders.count({
    where: {
      user_id: userId,
      status: "delivered",
    },
  });

  // Check if they hit a milestone (5, 10, 15, 20 ...)
  if (completedOrdersCount % ORDER_MILESTONE === 0) {
    // Award 10 points
    await prisma.$transaction([
      // Log the transaction
      prisma.loyalty_transactions.create({
        data: {
          user_id: userId,
          points: POINTS_PER_MILESTONE,
          type: "earned",
          order_id: orderId,
        },
      }),
      // Update user's total points
      prisma.users.update({
        where: { user_id: userId },
        data: {
          loyalty_points: {
            increment: POINTS_PER_MILESTONE,
          },
        },
      }),
    ]);

    return {
      awarded: true,
      pointsEarned: POINTS_PER_MILESTONE,
      totalOrders: completedOrdersCount,
    };
  }

  return { awarded: false };
}

// Redeem points as discount at checkout
async function redeemPoints(userId, orderId, pointsToRedeem) {
  // Get user's current points
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { loyalty_points: true },
  });

  if (!user) throw new Error("User not found");

  if (user.loyalty_points < pointsToRedeem) {
    throw new Error(
      `Not enough points. You have ${user.loyalty_points} points`
    );
  }

  // Calculate discount ( 10 points = $1 )
  const discountAmount = pointsToRedeem / POINTS_TO_DOLLAR;

  // Apply everything in one transaction
  await prisma.$transaction([
    // Log the redemption
    prisma.loyalty_transactions.create({
      data: {
        user_id: userId,
        points: -pointsToRedeem, // negative because spending
        type: "redeemed",
        order_id: orderId,
      },
    }),
    // Deduct points from user
    prisma.users.update({
      where: { user_id: userId },
      data: {
        loyalty_points: {
          decrement: pointsToRedeem,
        },
      },
    }),
    // Save discount info on the order
    prisma.orders.update({
      where: { order_id: orderId },
      data: {
        points_redeemed: pointsToRedeem,
        discount_from_points: discountAmount,
      },
    }),
  ]);

  return {
    pointsRedeemed: pointsToRedeem,
    discountApplied: discountAmount,
    remainingPoints: user.loyalty_points - pointsToRedeem,
  };
}

// Get user's points balance and transaction history
async function getLoyaltyInfo(userId) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { loyalty_points: true },
  });

  const transactions = await prisma.loyalty_transactions.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  return {
    currentPoints: user?.loyalty_points ?? 0,
    dollarValue: (user?.loyalty_points ?? 0) / POINTS_TO_DOLLAR,
    transactions,
  };
}

module.exports = { checkAndAwardPoints, redeemPoints, getLoyaltyInfo };