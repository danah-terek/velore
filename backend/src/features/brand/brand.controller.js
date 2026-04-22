const brandService = require("./brand.service");

// ─── GET ALL BRANDS ───────────────────────────────────────────────────────────
const getAllBrands = async (req, res) => {
  try {
    const brands = await brandService.getAllBrands();

    const serialized = brands.map((b) => ({
      ...b,
      brand_id: b.brand_id.toString(),
    }));

    res.status(200).json({ success: true, data: serialized });
  } catch (error) {
    console.error("getAllBrands error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch brands" });
  }
};

// ─── GET BRAND BY ID ──────────────────────────────────────────────────────────
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await brandService.getBrandById(id);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.status(200).json({
      success: true,
      data: { ...brand, brand_id: brand.brand_id.toString() },
    });
  } catch (error) {
    console.error("getBrandById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch brand" });
  }
};

// ─── GET PRODUCTS BY BRAND ────────────────────────────────────────────────────
const getProductsByBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await brandService.getProductsByBrand(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const serialized = {
      brand_id: result.brand_id.toString(),
      name: result.name,
      products: result.products.map((p) => ({
        ...p,
        product_id: p.product_id.toString(),
        price: p.price.toString(),
        compare_price: p.compare_price?.toString() ?? null,
        categories: p.categories
          ? { ...p.categories, category_id: p.categories.category_id.toString() }
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
    console.error("getProductsByBrand error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products for brand" });
  }
};

// ─── CREATE BRAND ─────────────────────────────────────────────────────────────
const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Brand name is required" });
    }

    const brand = await brandService.createBrand({ name: name.trim() });

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: { ...brand, brand_id: brand.brand_id.toString() },
    });
  } catch (error) {
    console.error("createBrand error:", error);
    res.status(500).json({ success: false, message: "Failed to create brand" });
  }
};

// ─── UPDATE BRAND ─────────────────────────────────────────────────────────────
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Brand name is required" });
    }

    const existing = await brandService.getBrandById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const updated = await brandService.updateBrand(id, { name: name.trim() });

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: { ...updated, brand_id: updated.brand_id.toString() },
    });
  } catch (error) {
    console.error("updateBrand error:", error);
    res.status(500).json({ success: false, message: "Failed to update brand" });
  }
};

// ─── DELETE BRAND ─────────────────────────────────────────────────────────────
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await brandService.getBrandById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    if (existing._count.products > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete brand — it has ${existing._count.products} product(s) assigned to it`,
      });
    }

    await brandService.deleteBrand(id);

    res.status(200).json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.error("deleteBrand error:", error);
    res.status(500).json({ success: false, message: "Failed to delete brand" });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  getProductsByBrand,
  createBrand,
  updateBrand,
  deleteBrand,
};