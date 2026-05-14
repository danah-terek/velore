const express = require("express");
const router = express.Router();
const brandController = require("./brand.controller");
const { adminAuthMiddleware } = require("../../shared/middleware/middleware");
const rbac = require("../rbac");

// Public routes
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);
router.get("/:id/products", brandController.getProductsByBrand);

// Admin-only routes (write)
router.post("/", adminAuthMiddleware, rbac.requirePermission("write:brands"), brandController.createBrand);
router.put("/:id", adminAuthMiddleware, rbac.requirePermission("write:brands"), brandController.updateBrand);
router.patch("/:id", adminAuthMiddleware, rbac.requirePermission("write:brands"), brandController.updateBrand);
router.delete("/:id", adminAuthMiddleware, rbac.requirePermission("write:brands"), brandController.deleteBrand);

module.exports = router;