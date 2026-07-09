const express = require("express");

const router = express.Router();

const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const branchRoutes = require("./branch.routes");
const userRoutes = require("./user.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const inventoryRoutes = require("./inventory.routes");
const customerRoutes = require("./customer.routes");
const supplierRoutes = require("./supplier.routes");
const ingredientRoutes = require("./ingredient.routes");
const stockTransferRoutes = require("./stockTransfer.routes");
const stockAdjustmentRoutes = require("./stockAdjustment.routes");
const billingRoutes = require("./billing.routes");
const reportRoutes = require("./report.routes");

router.use("/health", healthRoutes);

router.use("/auth", authRoutes);

router.use("/branches", branchRoutes);

router.use("/users", userRoutes);

router.use("/categories", categoryRoutes);

router.use("/products", productRoutes);

router.use("/inventory", inventoryRoutes);

router.use("/customers", customerRoutes);

router.use("/suppliers", supplierRoutes);

router.use("/ingredients", ingredientRoutes);

router.use("/stock-transfers", stockTransferRoutes);

router.use("/stock-adjustments", stockAdjustmentRoutes);

router.use("/billing", billingRoutes);

router.use("/reports", reportRoutes);

module.exports = router;