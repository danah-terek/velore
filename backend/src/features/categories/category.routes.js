const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/:id/products", categoryController.getProductsByCategory);

// Admin-only routes (add your auth/admin middleware here)
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;