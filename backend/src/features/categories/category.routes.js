const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const { adminAuthMiddleware } = require("../../shared/middleware/middleware");
const rbac = require("../rbac");

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/:id/products", categoryController.getProductsByCategory);

// Admin-only routes (write)
router.post("/", adminAuthMiddleware, rbac.requirePermission("write:categories"), categoryController.createCategory);
router.put("/:id", adminAuthMiddleware, rbac.requirePermission("write:categories"), categoryController.updateCategory);
router.patch("/:id", adminAuthMiddleware, rbac.requirePermission("write:categories"), categoryController.updateCategory);
router.delete("/:id", adminAuthMiddleware, rbac.requirePermission("write:categories"), categoryController.deleteCategory);

module.exports = router;