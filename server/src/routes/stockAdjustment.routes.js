const express = require("express");
const stockAdjustmentController = require("../controllers/stockAdjustment.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * Stock Adjustment Routes
 */

router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  stockAdjustmentController.createAdjustment
);

router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  stockAdjustmentController.getAllAdjustments
);

router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  stockAdjustmentController.getAdjustmentById
);

module.exports = router;
