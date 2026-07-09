const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/authorize.middleware");
const ROLES = require("../constants/roles");
const router = express.Router();

/**
 * Health Check Route
 * GET /api/v1/health
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SOP Backend API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed successfully!",
    user: req.user,
  });
});

router.get(
  "/admin",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Super Admin!",
    });
  }
);

module.exports = router;