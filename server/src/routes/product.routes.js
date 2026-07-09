const express = require("express");

const router = express.Router();

const productController = require("../controllers/product.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const ROLES = require("../constants/roles");

router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  productController.createProduct
);

router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  productController.getAllProducts
);

router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.CASHIER),
  productController.getProductById
);

router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  productController.updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN),
  productController.deleteProduct
);

module.exports = router;