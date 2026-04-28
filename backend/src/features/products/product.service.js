const prisma = require("../../shared/utils/database");

// ─── SHARED PRODUCT SELECT ────────────────────────────────────────────────────
const productSelect = {
  product_id: true,
  name: true,
  description: true,
  price: true,
  compare_price: true,
  frame_shape: true,
  face_shape: true,
  gender: true,
  material: true,
  prescription_ready: true,
  virtual_try_on: true,
  is_active: true,
  is_bundle: true,
  created_at: true,
  updated_at: true,
  brands: {
    select: { brand_id: true, name: true },
  },
  categories: {
    select: { category_id: true, name: true },
  },
  product_variants: {
    select: {
      variant_id: true,
      sku: true,
      color_name: true,
      color_hex: true,
      size: true,
      price_adjustment: true,
      stock_quantity: true,
      low_stock_alert: true,
      images: true,
    },
  },
};

// ─── GET ALL PRODUCTS ─────────────────────────────────────────────────────────
const getAllProducts = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where: { is_active: true },
      select: productSelect,
      orderBy: { created_at: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.products.count({ where: { is_active: true } }),
  ]);
  return { products, total, page: Number(page), limit: Number(limit) };
};

// ─── GET PRODUCT BY ID ────────────────────────────────────────────────────────
const getProductById = async (product_id) => {
  return await prisma.products.findUnique({
    where: { product_id: Number(product_id) },
    select: productSelect,
  });
};

// ─── FILTER / SEARCH PRODUCTS ─────────────────────────────────────────────────
const filterProducts = async (filters) => {
  const {
    search,
    category_id,
    brand_id,
    gender,
    frame_shape,
    face_shape,
    material,
    prescription_ready,
    virtual_try_on,
    min_price,
    max_price,
    page = 1,
    limit = 20,
  } = filters;

  const where = {
    is_active: true,
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
    ...(category_id && { category_id: Number(category_id) }),
    ...(brand_id && { brand_id: Number(brand_id) }),
    ...(gender && { gender }),
    ...(frame_shape && { frame_shape }),
    ...(face_shape && { face_shape }),
    ...(material && { material }),
    ...(prescription_ready !== undefined && {
      prescription_ready: prescription_ready === "true",
    }),
    ...(virtual_try_on !== undefined && {
      virtual_try_on: virtual_try_on === "true",
    }),
    ...((min_price || max_price) && {
      price: {
        ...(min_price && { gte: min_price }),
        ...(max_price && { lte: max_price }),
      },
    }),
  };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where,
      select: productSelect,
      orderBy: { created_at: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.products.count({ where }),
  ]);

  return { products, total, page: Number(page), limit: Number(limit) };
};

// ─── GET PRODUCTS BY CATEGORY ─────────────────────────────────────────────────
const getProductsByCategory = async (category_id) => {
  return await prisma.products.findMany({
    where: { category_id: Number(category_id), is_active: true },
    select: productSelect,
    orderBy: { created_at: "desc" },
  });
};

// ─── GET PRODUCTS BY BRAND ────────────────────────────────────────────────────
const getProductsByBrand = async (brand_id) => {
  return await prisma.products.findMany({
    where: { brand_id: Number(brand_id), is_active: true },
    select: productSelect,
    orderBy: { created_at: "desc" },
  });
};

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────
const createProduct = async (data) => {
  return await prisma.products.create({
    data: {
      ...data,
      category_id: Number(data.category_id),
      brand_id: Number(data.brand_id),
    },
    select: productSelect,
  });
};

// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
const updateProduct = async (product_id, data) => {
  return await prisma.products.update({
    where: { product_id: Number(product_id) },
    data: {
      ...data,
      ...(data.category_id && { category_id: Number(data.category_id) }),
      ...(data.brand_id && { brand_id: Number(data.brand_id) }),
    },
    select: productSelect,
  });
};

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────
const deleteProduct = async (product_id) => {
  return await prisma.products.delete({
    where: { product_id: Number(product_id) },
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  filterProducts,
  getProductsByCategory,
  getProductsByBrand,
  createProduct,
  updateProduct,
  deleteProduct,
};