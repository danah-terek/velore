const prisma = require("../../shared/utils/database");

const POINTS_PER_MILESTONE = 100;
const ORDER_MILESTONE = 5;
const POINTS_TO_DOLLAR = 10;

const serialize = (obj) => JSON.parse(JSON.stringify(obj, (_, v) =>
  typeof v === 'bigint' ? v.toString() : v
))

async function checkAndAwardPoints(userId, orderId) {
  const completedOrdersCount = await prisma.orders.count({
    where: {
      user_id: Number(userId),
      status: "delivered",
    },
  });

  if (completedOrdersCount % ORDER_MILESTONE === 0) {
    const [_, updatedUser] = await prisma.$transaction([
      prisma.loyalty_transactions.create({
        data: {
          user_id: Number(userId),
          points: POINTS_PER_MILESTONE,
          type: "earned",
          order_id: Number(orderId),
        },
      }),
      prisma.users.update({
        where: { user_id: Number(userId) },
        data: {
          loyalty_points: {
            increment: POINTS_PER_MILESTONE,
          },
        },
      }),
    ]);

    return {
      pointsAwarded: true,
      pointsEarned: POINTS_PER_MILESTONE,
      totalPoints: updatedUser.loyalty_points,
      totalOrders: completedOrdersCount,
    };
  }

  const ordersUntilNext = ORDER_MILESTONE - (completedOrdersCount % ORDER_MILESTONE)

  return { 
    pointsAwarded: false,
    ordersUntilNext,
  };
}

async function redeemPoints(userId, orderId, pointsToRedeem) {
  const user = await prisma.users.findUnique({
    where: { user_id: Number(userId) },
    select: { loyalty_points: true },
  });

  if (!user) throw new Error("User not found");

  if (user.loyalty_points < pointsToRedeem) {
    throw new Error(`Not enough points. You have ${user.loyalty_points} points`);
  }

  const discountAmount = pointsToRedeem / POINTS_TO_DOLLAR;

  await prisma.$transaction([
    prisma.loyalty_transactions.create({
      data: {
        user_id: Number(userId),
        points: -pointsToRedeem,
        type: "redeemed",
        order_id: Number(orderId),
      },
    }),
    prisma.users.update({
      where: { user_id: Number(userId) },
      data: { loyalty_points: { decrement: pointsToRedeem } },
    }),
    prisma.orders.update({
      where: { order_id: Number(orderId) },
      data: {
        points_redeemed: pointsToRedeem,
        discount_from_points: discountAmount,
      },
    }),
  ]);

  // 🛍️ Send redeem notification
  const { sendNotification } = require('../notifications/notification.service')
  await sendNotification(
    userId,
    `🛍️ Your ${pointsToRedeem} points ($${discountAmount.toFixed(2)} off) were applied to your order!`,
    'loyalty_redeem'
  )

  return {
    pointsRedeemed: pointsToRedeem,
    discountApplied: discountAmount,
    remainingPoints: user.loyalty_points - pointsToRedeem,
  };
}

async function getLoyaltyInfo(userId) {
  const user = await prisma.users.findUnique({
    where: { user_id: Number(userId) },
    select: { loyalty_points: true },
  });

  const transactions = await prisma.loyalty_transactions.findMany({
    where: { user_id: Number(userId) },
    orderBy: { created_at: "desc" },
  });

  return serialize({
    currentPoints: Number(user?.loyalty_points ?? 0),
    dollarValue: Number(user?.loyalty_points ?? 0) / POINTS_TO_DOLLAR,
    transactions,
  });
}

module.exports = { checkAndAwardPoints, redeemPoints, getLoyaltyInfo };