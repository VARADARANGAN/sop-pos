const User = require("../models/User");

const ingredientsAccess = async (req, res, next) => {
  try {
    const user = req.user; // populated by authMiddleware
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    if (user.role === "SUPER_ADMIN" || user.role === "BRANCH_ADMIN") {
      return next();
    }

    if (user.role === "CASHIER") {
      const dbUser = await User.findOne({ _id: user.id, isDeleted: false });
      if (dbUser && dbUser.hasIngredientsAccess) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden: You do not have access to ingredients",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization checks",
    });
  }
};

module.exports = ingredientsAccess;
