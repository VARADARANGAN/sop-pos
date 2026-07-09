const Order = require("../models/Order");

class OrderRepository {
  async create(data) {
    return await Order.create(data);
  }

  async findAll() {
    return await Order.find({ isDeleted: false })
      .populate("branchId", "branchName branchCode")
      .populate("cashierId", "firstName lastName employeeCode")
      .populate("customerId", "name phone email");
  }

  async findByBranch(branchId) {
    return await Order.find({ branchId, isDeleted: false })
      .populate("branchId", "branchName branchCode")
      .populate("cashierId", "firstName lastName employeeCode")
      .populate("customerId", "name phone email");
  }

  async findById(id) {
    return await Order.findOne({ _id: id, isDeleted: false })
      .populate("branchId", "branchName branchCode")
      .populate("cashierId", "firstName lastName employeeCode")
      .populate("customerId", "name phone email");
  }

  async update(id, data) {
    return await Order.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async findByHoldReference(branchId, holdReference) {
    return await Order.findOne({
      branchId,
      holdReference,
      status: "HELD",
      isDeleted: false,
    });
  }

  async findHeldOrdersByBranch(branchId) {
    return await Order.find({
      branchId,
      status: "HELD",
      isDeleted: false,
    }).populate("customerId", "name phone");
  }
}

module.exports = new OrderRepository();
