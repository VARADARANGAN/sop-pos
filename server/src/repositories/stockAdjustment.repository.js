const StockAdjustment = require("../models/StockAdjustment");

class StockAdjustmentRepository {
  async create(data) {
    return await StockAdjustment.create(data);
  }

  async findAll() {
    return await StockAdjustment.find({})
      .populate("branchId", "branchName branchCode")
      .populate("actorId", "firstName lastName email");
  }

  async findByBranch(branchId) {
    return await StockAdjustment.find({ branchId })
      .populate("branchId", "branchName branchCode")
      .populate("actorId", "firstName lastName email");
  }

  async findById(id) {
    return await StockAdjustment.findOne({ _id: id })
      .populate("branchId", "branchName branchCode")
      .populate("actorId", "firstName lastName email");
  }
}

module.exports = new StockAdjustmentRepository();
