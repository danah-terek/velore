const prisma = require("../../shared/utils/database");

// ─── BIGINT SAFE HELPER ───────────────────────────────────────────────────────
// Prisma returns BigInt for ID fields. JSON.stringify can't handle BigInt,
// so we convert every BigInt field to string before returning from the service.
const stringifyBigInts = (obj) => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === "bigint") return obj.toString()
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(stringifyBigInts)
  if (typeof obj === "object") {
    const result = {}
    for (const key of Object.keys(obj)) {
      result[key] = stringifyBigInts(obj[key])
    }
    return result
  }
  return obj
}

// ─── GET ALL REVIEWS FOR A PRODUCT (public — no auth, no approval filter) ─────
// Approval only gates the home page testimonials, not the product detail page.
const getReviewsByProduct = async (product_id) => {
  const pid = Number(product_id)
  if (!Number.isInteger(pid) || pid < 1) {
    throw new Error(`Invalid product_id: ${product_id}`)
  }

  const reviews = await prisma.reviews.findMany({
    where: {
      product_id: BigInt(pid),
    },
    orderBy: { created_at: "desc" },
    include: {
      users: {
        select: { user_id: true, name: true },
      },
    },
  })

  // Convert BigInt fields to strings so JSON.stringify works
  return stringifyBigInts(reviews)
}

// ─── GET SINGLE REVIEW ────────────────────────────────────────────────────────
const getReviewById = async (review_id) => {
  const review = await prisma.reviews.findUnique({
    where: { review_id: BigInt(review_id) },
    include: {
      users: { select: { user_id: true, name: true, email: true } },
      products: { select: { product_id: true, name: true } },
    },
  })
  return stringifyBigInts(review)
}

// ─── CREATE REVIEW ────────────────────────────────────────────────────────────
const createReview = async ({ user_id, product_id, order_id, rating, comment }) => {
  const existing = await prisma.reviews.findFirst({
    where: {
      user_id: BigInt(user_id),
      product_id: BigInt(product_id),
    },
  })
  if (existing) throw new Error("You have already reviewed this product")

  const review = await prisma.reviews.create({
    data: {
      user_id: BigInt(user_id),
      product_id: BigInt(product_id),
      order_id: order_id ? BigInt(order_id) : null,
      rating: Number(rating),
      comment,
      status: "pending",
    },
  })
  return stringifyBigInts(review)
}

// ─── DELETE REVIEW ────────────────────────────────────────────────────────────
const deleteReview = async (review_id) => {
  const result = await prisma.reviews.delete({
    where: { review_id: BigInt(review_id) },
  })
  return stringifyBigInts(result)
}

// ─── GET PENDING REVIEWS (ADMIN) ──────────────────────────────────────────────
const getPendingReviews = async () => {
  const reviews = await prisma.reviews.findMany({
    where: { status: "pending" },
    orderBy: { created_at: "desc" },
    include: {
      users: { select: { user_id: true, name: true, email: true } },
      products: { select: { product_id: true, name: true } },
    },
  })
  return stringifyBigInts(reviews)
}

// ─── GET APPROVED REVIEWS (public — home page testimonials) ───────────────────
const getApprovedReviews = async () => {
  const reviews = await prisma.reviews.findMany({
    where: { status: "approved" },
    orderBy: { created_at: "desc" },
    include: {
      users: { select: { user_id: true, name: true } },
      products: { select: { product_id: true, name: true } },
    },
  })
  return stringifyBigInts(reviews)
}

// ─── UPDATE REVIEW STATUS ─────────────────────────────────────────────────────
const updateReviewStatus = async (review_id, status) => {
  const review = await prisma.reviews.update({
    where: { review_id: BigInt(review_id) },
    data: { status },
    include: {
      users: { select: { user_id: true, name: true, email: true } },
      products: { select: { product_id: true, name: true } },
    },
  })
  return stringifyBigInts(review)
}

module.exports = {
  getReviewsByProduct,
  getReviewById,
  createReview,
  deleteReview,
  getPendingReviews,
  getApprovedReviews,
  updateReviewStatus,
}