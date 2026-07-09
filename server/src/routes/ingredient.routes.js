const express = require("express");
const ingredientController = require("../controllers/ingredient.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const ingredientsAccess = require("../middlewares/ingredientsAccess.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * Ingredient Routes
 */

// Toggle access can only be executed by Admins / Super Admins
router.post(
  "/toggle-access",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  (req, res) => ingredientController.toggleCashierAccess(req, res)
);

// CRUD routes require auth + ingredients access check (which allows cashier with override)
router.post(
  "/",
  authMiddleware,
  ingredientsAccess,
  (req, res) => ingredientController.createIngredient(req, res)
);

router.get(
  "/",
  authMiddleware,
  ingredientsAccess,
  (req, res) => ingredientController.getAllIngredients(req, res)
);

router.get(
  "/:id",
  authMiddleware,
  ingredientsAccess,
  (req, res) => ingredientController.getIngredientById(req, res)
);

router.put(
  "/:id",
  authMiddleware,
  ingredientsAccess,
  (req, res) => ingredientController.updateIngredient(req, res)
);

router.delete(
  "/:id",
  authMiddleware,
  ingredientsAccess,
  (req, res) => ingredientController.deleteIngredient(req, res)
);

module.exports = router;
