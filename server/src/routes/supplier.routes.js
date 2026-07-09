const express = require("express");
const supplierController = require("../controllers/supplier.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * Supplier Routes
 */

router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  supplierController.createSupplier
);

router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  supplierController.getAllSuppliers
);

router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  supplierController.getSupplierById
);

router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  supplierController.updateSupplier
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  supplierController.deleteSupplier
);

module.exports = router;
