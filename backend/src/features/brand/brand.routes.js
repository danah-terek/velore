const express = require("express");
const router = express.Router();
const brandController = require("./brand.controller");

// Public routes
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);
router.get("/:id/products", brandController.getProductsByBrand);

// Admin-only routes (add your auth/admin middleware here)
router.post("/", brandController.createBrand);
router.put("/:id", brandController.updateBrand);
router.delete("/:id", brandController.deleteBrand);

module.exports = router;