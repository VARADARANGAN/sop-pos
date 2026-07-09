const express = require("express");

const router = express.Router();

const branchController = require("../controllers/branch.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const ROLES = require("../constants/roles");

/**
 * Create Branch
 */
router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  branchController.createBranch
);

/**
 * Get All Branches
 */
router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  branchController.getAllBranches
);

/**
 * Get Branch By ID
 */
router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  branchController.getBranchById
);

/**
 * Update Branch
 */
router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  branchController.updateBranch
);

/**
 * Delete Branch
 */
router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  branchController.deleteBranch
);

module.exports = router;