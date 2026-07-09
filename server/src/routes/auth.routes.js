const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * Authentication Routes
 */
router.post("/login", (req, res) => authController.login(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));
router.post("/forgot-password", (req, res) => authController.forgotPassword(req, res));
router.post("/reset-password", (req, res) => authController.resetPassword(req, res));
router.post("/change-password", authMiddleware, (req, res) => authController.changePassword(req, res));
router.post("/unlock/:id", authMiddleware, authorize(ROLES.SUPER_ADMIN), (req, res) => authController.unlockUser(req, res));
router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));

module.exports = router;