const express = require("express");
const billingController = require("../controllers/billing.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * POS Billing Routes
 */

router.post(
  "/order",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  billingController.checkoutOrder
);

router.post(
  "/order/hold",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  billingController.holdOrder
);

router.get(
  "/order/held",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  billingController.getHeldOrders
);

router.post(
  "/order/:id/checkout",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  billingController.checkoutHeldOrder
);

router.post(
  "/order/:id/split",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  billingController.splitHeldOrder
);

router.post(
  "/order/:id/void",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  billingController.voidOrder
);

module.exports = router;
