const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      branchId: user.branchId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

module.exports = {
  generateAccessToken,
};