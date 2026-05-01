const { validationResult } = require("express-validator");
const productService = require("./product.service");
const { searchProducts } = require("./product.search");

// ─── SERIALIZE HELPER ─────────────────────────────────────────────────────────
const serializeProduct = (p) => ({
  ...p,
  product_id: p.product_id.toString(),
  price: p.price.toString(),
  compare_price: p.compare_price?.toString() ?? null,
  brands: p.brands ? { ...p.brands, brand_id: p.brands.brand_id.toString() } : null,
  categories: p.categories ? { ...p.categories, category_id: p.categories.category_id.toString() } : null,
  product_variants: p.product_variants?.map((v) => ({
    ...v,
    variant_id: v.variant_id.toString(),
    price_adjustment: v.price_adjustment?.toString() ?? null,
  })) || [],
});

// ✅ SEARCH PRODUCTS
// ✅ SEARCH PRODUCTS - Simple version
const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }
    const products = await searchProducts(q);
    
    // Simple serialization that handles nulls
    const data = products.map(p => ({
      product_id: p.product_id?.toString() || String(p.product_id),
      name: p.name,
      price: p.price?.toString() || '0',
      description: p.description,
      brands: p.brands ? { name: p.brands.name } : null,
      categories: p.categories ? { name: p.categories.name } : null,
      product_variants: p.product_variants || [],
      frame_shape: p.frame_shape,
      image: p.product_variants?.[0]?.images?.[0] || null
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    console.error("search error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to search products" });
  }
};

// ─── GET ALL PRODUCTS ────────────────────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await productService.getAllProducts({ page, limit });

    res.status(200).json({
      success: true,
      data: result.products.map(serializeProduct),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// ─── GET PRODUCT BY ID ────────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: serializeProduct(product) });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

// ─── FILTER / SEARCH PRODUCTS ─────────────────────────────────────────────────
const filterProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await productService.filterProducts(req.query);

    res.status(200).json({
      success: true,
      data: result.products.map(serializeProduct),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    console.error("filterProducts error:", error);
    res.status(500).json({ success: false, message: "Failed to filter products" });
  }
};

// ─── GET PRODUCTS BY CATEGORY ─────────────────────────────────────────────────
const getProductsByCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const products = await productService.getProductsByCategory(req.params.id);
    res.status(200).json({ success: true, data: products.map(serializeProduct) });
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products by category" });
  }
};

// ─── GET PRODUCTS BY BRAND ────────────────────────────────────────────────────
const getProductsByBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const products = await productService.getProductsByBrand(req.params.id);
    res.status(200).json({ success: true, data: products.map(serializeProduct) });
  } catch (error) {
    console.error("getProductsByBrand error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products by brand" });
  }
};

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: serializeProduct(product),
    });
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
};

// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existing = await productService.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updated = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: serializeProduct(updated),
    });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existing = await productService.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await productService.deleteProduct(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

module.exports = {
  search,
  getAllProducts,
  getProductById,
  filterProducts,
  getProductsByCategory,
  getProductsByBrand,
  createProduct,
  updateProduct,
  deleteProduct,
};