const express = require("express");
const customerController = require("../controllers/customer.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * Customer Routes
 */

router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  customerController.createCustomer
);

router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  customerController.getAllCustomers
);

router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  customerController.getCustomerById
);

router.get(
  "/:id/history",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  customerController.getCustomerHistory
);

router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  customerController.updateCustomer
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  customerController.deleteCustomer
);

module.exports = router;
