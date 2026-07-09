const mongoose = require("mongoose");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const AuditLog = require("../models/AuditLog");
const User = require("../models/User");

class ReportService {
  /**
   * Get Dashboard stats
   */
  async getDashboardStats(user) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const branchFilter = {};
    if (user.role !== "SUPER_ADMIN") {
      branchFilter.branchId = new mongoose.Types.ObjectId(user.branchId);
    }

    // 1. Today's Sales and Orders Count
    const todayOrders = await Order.aggregate([
      {
        $match: {
          status: "COMPLETED",
          isDeleted: false,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          ...branchFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const salesStats = todayOrders[0] || { totalRevenue: 0, orderCount: 0 };

    // 2. Low stock count
    const lowStockQuery = {
      isDeleted: false,
      $expr: { $lte: ["$currentStock", "$reorderLevel"] },
    };
    if (user.role !== "SUPER_ADMIN") {
      lowStockQuery.branchId = new mongoose.Types.ObjectId(user.branchId);
    }

    const lowStockCount = await Inventory.countDocuments(lowStockQuery);

    // 3. Top selling items (overall history, filtered by branch)
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: "COMPLETED",
          isDeleted: false,
          ...branchFilter,
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]);

    // 4. Low stock products detail list
    const lowStockDetails = await Inventory.find(lowStockQuery)
      .populate("productId", "productName productCode")
      .populate("branchId", "branchName")
      .limit(10);

    return {
      todayRevenue: salesStats.totalRevenue,
      todayOrders: salesStats.orderCount,
      lowStockCount,
      topProducts,
      lowStockDetails,
    };
  }

  /**
   * Get Sales by Payment Method
   */
  async getSalesByPayment(startDate, endDate, user) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const branchFilter = {};
    if (user.role !== "SUPER_ADMIN") {
      branchFilter.branchId = new mongoose.Types.ObjectId(user.branchId);
    }

    const report = await Order.aggregate([
      {
        $match: {
          status: "COMPLETED",
          isDeleted: false,
          createdAt: { $gte: start, $lte: end },
          ...branchFilter,
        },
      },
      { $unwind: "$payments" },
      {
        $group: {
          _id: "$payments.method",
          totalAmount: { $sum: "$payments.amount" },
          transactionsCount: { $sum: 1 },
        },
      },
    ]);

    // Format data cleanly
    const methods = { CASH: 0, CARD: 0, UPI: 0 };
    report.forEach((item) => {
      if (methods[item._id] !== undefined) {
        methods[item._id] = item.totalAmount;
      }
    });

    return Object.keys(methods).map((key) => ({
      method: key,
      amount: methods[key],
    }));
  }

  /**
   * Get Cashier Performance
   */
  async getCashierPerformance(startDate, endDate, user) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const branchFilter = {};
    if (user.role !== "SUPER_ADMIN") {
      branchFilter.branchId = new mongoose.Types.ObjectId(user.branchId);
    }

    const performance = await Order.aggregate([
      {
        $match: {
          status: "COMPLETED",
          isDeleted: false,
          createdAt: { $gte: start, $lte: end },
          ...branchFilter,
        },
      },
      {
        $group: {
          _id: "$cashierId",
          billsProcessed: { $sum: 1 },
          revenue: { $sum: "$grandTotal" },
          totalDiscount: { $sum: "$discount" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "cashierInfo",
        },
      },
      { $unwind: "$cashierInfo" },
      {
        $project: {
          _id: 1,
          billsProcessed: 1,
          revenue: 1,
          totalDiscount: 1,
          cashierName: { $concat: ["$cashierInfo.firstName", " ", "$cashierInfo.lastName"] },
          employeeCode: "$cashierInfo.employeeCode",
          averageBillValue: {
            $cond: [
              { $gt: ["$billsProcessed", 0] },
              { $divide: ["$revenue", "$billsProcessed"] },
              0,
            ],
          },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return performance;
  }

  /**
   * Get Immutable Audit Logs (Super Admin only)
   */
  async getAuditLogs() {
    return await AuditLog.find({})
      .populate("actorId", "firstName lastName email employeeCode")
      .sort({ timestamp: -1 });
  }
}

module.exports = new ReportService();
