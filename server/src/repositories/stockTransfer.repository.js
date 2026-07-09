const StockTransfer = require("../models/StockTransfer");

class StockTransferRepository {
  async create(data) {
    return await StockTransfer.create(data);
  }

  async findAll() {
    return await StockTransfer.find({ isDeleted: false })
      .populate("fromBranchId", "branchName branchCode")
      .populate("toBranchId", "branchName branchCode")
      .populate("requestedBy", "firstName lastName email")
      .populate("approvedBy", "firstName lastName email");
  }

  async findByBranch(branchId) {
    return await StockTransfer.find({
      $or: [{ fromBranchId: branchId }, { toBranchId: branchId }],
      isDeleted: false,
    })
      .populate("fromBranchId", "branchName branchCode")
      .populate("toBranchId", "branchName branchCode")
      .populate("requestedBy", "firstName lastName email")
      .populate("approvedBy", "firstName lastName email");
  }

  async findById(id) {
    return await StockTransfer.findOne({ _id: id, isDeleted: false })
      .populate("fromBranchId", "branchName branchCode")
      .populate("toBranchId", "branchName branchCode")
      .populate("requestedBy", "firstName lastName email")
      .populate("approvedBy", "firstName lastName email");
  }

  async update(id, data) {
    return await StockTransfer.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
}

module.exports = new StockTransferRepository();
