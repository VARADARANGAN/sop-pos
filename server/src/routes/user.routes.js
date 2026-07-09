const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const ROLES = require("../constants/roles");

/**
 * Create User
 */
router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  userController.createUser
);

/**
 * Get All Users
 */
router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  userController.getAllUsers
);

/**
 * Get User By ID
 */
router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  userController.getUserById
);

/**
 * Update User
 */
router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  userController.updateUser
);

/**
 * Delete User
 */
router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  userController.deleteUser
);

module.exports = router;