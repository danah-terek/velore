const prisma = require("../../shared/utils/database");

// ─── GET ALL BRANDS ───────────────────────────────────────────────────────────
const getAllBrands = async () => {
  return await prisma.brands.findMany({
    orderBy: { created_at: "asc" },
    select: {
      brand_id: true,
      name: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: { products: true },
      },
    },
  });
};

// ─── GET BRAND BY ID ──────────────────────────────────────────────────────────
const getBrandById = async (brand_id) => {
  return await prisma.brands.findUnique({
    where: { brand_id: BigInt(brand_id) },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
};

// ─── GET PRODUCTS BY BRAND ────────────────────────────────────────────────────
const getProductsByBrand = async (brand_id) => {
  return await prisma.brands.findUnique({
    where: { brand_id: BigInt(brand_id) },
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
          categories: {
            select: { category_id: true, name: true },
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

// ─── CREATE BRAND ─────────────────────────────────────────────────────────────
const createBrand = async ({ name }) => {
  return await prisma.brands.create({
    data: { name },
  });
};

// ─── UPDATE BRAND ─────────────────────────────────────────────────────────────
const updateBrand = async (brand_id, { name }) => {
  return await prisma.brands.update({
    where: { brand_id: BigInt(brand_id) },
    data: { name },
  });
};

// ─── DELETE BRAND ─────────────────────────────────────────────────────────────
const deleteBrand = async (brand_id) => {
  return await prisma.brands.delete({
    where: { brand_id: BigInt(brand_id) },
  });
};

module.exports = {
  getAllBrands,
  getBrandById,
  getProductsByBrand,
  createBrand,
  updateBrand,
  deleteBrand,
};