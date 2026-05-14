const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const { adminAuthMiddleware } = require("../../shared/middleware/middleware");
const rbac = require("../rbac");
const {
  validateId,
  validateCreateProduct,
  validateUpdateProduct,
  validateFilterProducts,
} = require("./product.validation");

// Public routes
// List/filter products (supports query params)
router.get("/", validateFilterProducts, productController.filterProducts);

// Search products (q=...)
// Must be BEFORE /:id routes
router.get("/search", productController.search);

router.get("/category/:id", validateId, productController.getProductsByCategory);
router.get("/brand/:id", validateId, productController.getProductsByBrand);
router.get("/:id", validateId, productController.getProductById);

// Admin-only routes
router.post("/", adminAuthMiddleware, rbac.requirePermission("write:products"), validateCreateProduct, productController.createProduct);
router.put("/:id", adminAuthMiddleware, rbac.requirePermission("write:products"), validateUpdateProduct, productController.updateProduct);
router.patch("/:id", adminAuthMiddleware, rbac.requirePermission("write:products"), validateUpdateProduct, productController.updateProduct);
router.delete("/:id", adminAuthMiddleware, rbac.requirePermission("delete:products"), validateId, productController.deleteProduct);

module.exports = router;