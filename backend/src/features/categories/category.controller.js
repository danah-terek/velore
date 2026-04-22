const categoryService = require("./category.service");

// ─── GET ALL CATEGORIES ───────────────────────────────────────────────────────
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    // Convert BigInt to string for JSON serialization
    const serialized = categories.map((c) => ({
      ...c,
      category_id: c.category_id.toString(),
    }));

    res.status(200).json({ success: true, data: serialized });
  } catch (error) {
    console.error("getAllCategories error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// ─── GET CATEGORY BY ID ───────────────────────────────────────────────────────
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      data: { ...category, category_id: category.category_id.toString() },
    });
  } catch (error) {
    console.error("getCategoryById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch category" });
  }
};

// ─── GET PRODUCTS BY CATEGORY ─────────────────────────────────────────────────
const getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await categoryService.getProductsByCategory(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Serialize all BigInt fields
    const serialized = {
      category_id: result.category_id.toString(),
      name: result.name,
      products: result.products.map((p) => ({
        ...p,
        product_id: p.product_id.toString(),
        price: p.price.toString(),
        compare_price: p.compare_price?.toString() ?? null,
        brands: p.brands
          ? { ...p.brands, brand_id: p.brands.brand_id.toString() }
          : null,
        product_variants: p.product_variants.map((v) => ({
          ...v,
          variant_id: v.variant_id.toString(),
          price_adjustment: v.price_adjustment?.toString() ?? null,
        })),
      })),
    };

    res.status(200).json({ success: true, data: serialized });
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products for category" });
  }
};

// ─── CREATE CATEGORY ──────────────────────────────────────────────────────────
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = await categoryService.createCategory({ name: name.trim() });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { ...category, category_id: category.category_id.toString() },
    });
  } catch (error) {
    console.error("createCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

// ─── UPDATE CATEGORY ──────────────────────────────────────────────────────────
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existing = await categoryService.getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const updated = await categoryService.updateCategory(id, { name: name.trim() });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: { ...updated, category_id: updated.category_id.toString() },
    });
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

// ─── DELETE CATEGORY ──────────────────────────────────────────────────────────
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await categoryService.getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (existing._count.products > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete category — it has ${existing._count.products} product(s) assigned to it`,
      });
    }

    await categoryService.deleteCategory(id);

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};