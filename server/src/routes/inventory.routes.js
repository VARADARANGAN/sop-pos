const express = require("express");

const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const ROLES = require("../constants/roles");

router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  inventoryController.createInventory
);

router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  inventoryController.getAllInventory
);

router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  inventoryController.getInventoryById
);

router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  inventoryController.updateInventory
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  inventoryController.deleteInventory
);

module.exports = router;