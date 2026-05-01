const { body, param, query } = require("express-validator");

// ─── PARAM VALIDATORS ─────────────────────────────────────────────────────────
const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
];

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────
const validateCreateProduct = [
  body("name")
    .isString().withMessage("Name must be a string")
    .trim().notEmpty().withMessage("Name is required"),
  body("price")
    .isDecimal({ decimal_digits: "0,2" }).withMessage("Price must be a valid decimal"),
  body("category_id")
    .isInt({ min: 1 }).withMessage("category_id must be a positive integer"),
  body("brand_id")
    .isInt({ min: 1 }).withMessage("brand_id must be a positive integer"),
  body("description")
    .optional().isString().withMessage("Description must be a string"),
  body("compare_price")
    .optional().isDecimal({ decimal_digits: "0,2" }).withMessage("compare_price must be a valid decimal"),
  body("frame_shape")
    .optional().isString().trim(),
  body("face_shape")
    .optional().isString().trim(),
  body("gender")
    .optional().isIn(["male", "female", "unisex"]).withMessage("gender must be male, female, or unisex"),
  body("material")
    .optional().isString().trim(),
  body("prescription_ready")
    .optional().isBoolean().withMessage("prescription_ready must be a boolean"),
  body("virtual_try_on")
    .optional().isBoolean().withMessage("virtual_try_on must be a boolean"),
  body("is_active")
    .optional().isBoolean().withMessage("is_active must be a boolean"),
  body("is_bundle")
    .optional().isBoolean().withMessage("is_bundle must be a boolean"),
    // Glasses & Sunglasses
  body("lens_width")
    .optional().isFloat({ min: 0 }).withMessage("lens_width must be a positive number"),
  body("bridge_width")
    .optional().isFloat({ min: 0 }).withMessage("bridge_width must be a positive number"),
  body("temple_length")
    .optional().isFloat({ min: 0 }).withMessage("temple_length must be a positive number"),
  // Contact Lenses
  body("diameter")
    .optional().isFloat({ min: 0 }).withMessage("diameter must be a positive number"),
  body("base_curve")
    .optional().isFloat({ min: 0 }).withMessage("base_curve must be a positive number"),
  body("water_content")
    .optional().isFloat({ min: 0, max: 100 }).withMessage("water_content must be between 0 and 100"),
  // Extended description
  body("details")
    .optional({ nullable: true }).isString().withMessage("details must be a string"),
];

// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
const validateUpdateProduct = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  body("name")
    .optional().isString().trim().notEmpty().withMessage("Name cannot be empty"),
  body("price")
    .optional().isDecimal({ decimal_digits: "0,2" }).withMessage("Price must be a valid decimal"),
  body("category_id")
    .optional().isInt({ min: 1 }).withMessage("category_id must be a positive integer"),
  body("brand_id")
    .optional().isInt({ min: 1 }).withMessage("brand_id must be a positive integer"),
  body("description")
    .optional().isString(),
  body("compare_price")
    .optional().isDecimal({ decimal_digits: "0,2" }).withMessage("compare_price must be a valid decimal"),
  body("frame_shape")
    .optional().isString().trim(),
  body("face_shape")
    .optional().isString().trim(),
  body("gender")
    .optional().isIn(["male", "female", "unisex"]).withMessage("gender must be male, female, or unisex"),
  body("material")
    .optional().isString().trim(),
  body("prescription_ready")
    .optional().isBoolean().withMessage("prescription_ready must be a boolean"),
  body("virtual_try_on")
    .optional().isBoolean().withMessage("virtual_try_on must be a boolean"),
  body("is_active")
    .optional().isBoolean().withMessage("is_active must be a boolean"),
  body("is_bundle")
    .optional().isBoolean().withMessage("is_bundle must be a boolean"),
    // Glasses & Sunglasses
  body("lens_width")
    .optional().isFloat({ min: 0 }).withMessage("lens_width must be a positive number"),
  body("bridge_width")
    .optional().isFloat({ min: 0 }).withMessage("bridge_width must be a positive number"),
  body("temple_length")
    .optional().isFloat({ min: 0 }).withMessage("temple_length must be a positive number"),
  // Contact Lenses
  body("diameter")
    .optional().isFloat({ min: 0 }).withMessage("diameter must be a positive number"),
  body("base_curve")
    .optional().isFloat({ min: 0 }).withMessage("base_curve must be a positive number"),
  body("water_content")
    .optional().isFloat({ min: 0, max: 100 }).withMessage("water_content must be between 0 and 100"),
  // Extended description
  body("details")
    .optional({ nullable: true }).isString().withMessage("details must be a string"),
];

// ─── FILTER / SEARCH PRODUCTS ─────────────────────────────────────────────────
const validateFilterProducts = [
  query("search")
    .optional().isString().trim(),
  query("category_id")
    .optional().isInt({ min: 1 }).withMessage("category_id must be a positive integer"),
  query("brand_id")
    .optional().isInt({ min: 1 }).withMessage("brand_id must be a positive integer"),
  query("gender")
    .optional().isIn(["male", "female", "unisex"]).withMessage("gender must be male, female, or unisex"),
  query("frame_shape")
    .optional().isString().trim(),
  query("face_shape")
    .optional().isString().trim(),
  query("material")
    .optional().isString().trim(),
  query("prescription_ready")
    .optional().isBoolean().withMessage("prescription_ready must be a boolean"),
  query("virtual_try_on")
    .optional().isBoolean().withMessage("virtual_try_on must be a boolean"),
  query("min_price")
    .optional().isDecimal({ decimal_digits: "0,2" }).withMessage("min_price must be a valid decimal"),
  query("max_price")
    .optional().isDecimal({ decimal_digits: "0,2" }).withMessage("max_price must be a valid decimal"),
  query("page")
    .optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];

module.exports = {
  validateId,
  validateCreateProduct,
  validateUpdateProduct,
  validateFilterProducts,
};