const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const {
  validateId,
  validateCreateProduct,
  validateUpdateProduct,
  validateFilterProducts,
} = require("./product.validation");

// ✅ SEARCH - Must be BEFORE /:id routes
router.get("/search", productController.search);

// Public routes
router.get("/", productController.getAllProducts);
router.get("/filter", validateFilterProducts, productController.filterProducts);
router.get("/category/:id", validateId, productController.getProductsByCategory);
router.get("/brand/:id", validateId, productController.getProductsByBrand);
router.get("/:id", validateId, productController.getProductById);

// Admin-only routes
router.post("/", validateCreateProduct, productController.createProduct);
router.put("/:id", validateUpdateProduct, productController.updateProduct);
router.delete("/:id", validateId, productController.deleteProduct);

module.exports = router;