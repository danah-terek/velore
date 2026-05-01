const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const {
  validateId,
  validateCreateProduct,
  validateUpdateProduct,
  validateFilterProducts,
} = require("./product.validation");

// Public routes
router.get("/", validateFilterProducts, productController.filterProducts);
router.get("/search", validateFilterProducts, productController.filterProducts);
router.get("/category/:id", validateId, productController.getProductsByCategory);
router.get("/brand/:id", validateId, productController.getProductsByBrand);
router.get("/:id", validateId, productController.getProductById);

// Admin-only routes (add your auth/admin middleware here)
router.post("/", validateCreateProduct, productController.createProduct);
router.put("/:id", validateUpdateProduct, productController.updateProduct);
router.delete("/:id", validateId, productController.deleteProduct);

module.exports = router;