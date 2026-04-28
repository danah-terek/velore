const prisma = require("../../shared/utils/database");

// ─── GET ALL CATEGORIES ───────────────────────────────────────────────────────
const getAllCategories = async () => {
  return await prisma.categories.findMany({
    orderBy: { created_at: "asc" },
    select: {
      category_id: true,
      name: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: { products: true },
      },
    },
  });
};

// ─── GET CATEGORY BY ID ───────────────────────────────────────────────────────
const getCategoryById = async (category_id) => {
  return await prisma.categories.findUnique({
    where: { category_id: Number(category_id) },  // ✅ Fixed
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
};

// ─── GET PRODUCTS BY CATEGORY ─────────────────────────────────────────────────
const getProductsByCategory = async (category_id) => {
  return await prisma.categories.findUnique({
    where: { category_id: Number(category_id) },  // ✅ Fixed
    include: {
      products: {
        where: { is_active: true },
        select: {
          product_id: true,
          name: true,
          description: true,
          price: true,
          compare_price: true,
          frame_shape: true,
          gender: true,
          material: true,
          prescription_ready: true,
          virtual_try_on: true,
          brands: {
            select: { brand_id: true, name: true },
          },
          product_variants: {
            select: {
              variant_id: true,
              color_name: true,
              color_hex: true,
              price_adjustment: true,
              stock_quantity: true,
              images: true,
            },
          },
        },
      },
    },
  });
};

// ─── CREATE CATEGORY ──────────────────────────────────────────────────────────
const createCategory = async ({ name }) => {
  return await prisma.categories.create({
    data: { name },
  });
};

// ─── UPDATE CATEGORY ──────────────────────────────────────────────────────────
const updateCategory = async (category_id, { name }) => {
  return await prisma.categories.update({
    where: { category_id: Number(category_id) },  // ✅ Fixed
    data: { name },
  });
};

// ─── DELETE CATEGORY ──────────────────────────────────────────────────────────
const deleteCategory = async (category_id) => {
  return await prisma.categories.delete({
    where: { category_id: Number(category_id) },  // ✅ Fixed
  });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};