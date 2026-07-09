const express = require("express");
const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * Report & Analytics Routes
 */

router.get(
  "/dashboard",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  reportController.getDashboardStats
);

router.get(
  "/sales-by-payment",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  reportController.getSalesByPayment
);

router.get(
  "/cashier-performance",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  reportController.getCashierPerformance
);

router.get(
  "/audit-logs",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  reportController.getAuditLogs
);

module.exports = router;
