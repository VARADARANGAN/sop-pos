const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/category.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const ROLES = require("../constants/roles");

/**
 * Create Category
 */
router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  categoryController.createCategory
);

/**
 * Get All Categories
 */
router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  categoryController.getAllCategories
);

/**
 * Get Category By ID
 */
router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  categoryController.getCategoryById
);

/**
 * Update Category
 */
router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  categoryController.updateCategory
);

/**
 * Delete Category
 */
router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  categoryController.deleteCategory
);

module.exports = router;