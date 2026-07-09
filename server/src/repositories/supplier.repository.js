const Supplier = require("../models/Supplier");

class SupplierRepository {
  async create(data) {
    return await Supplier.create(data);
  }

  async findAll() {
    return await Supplier.find({ isDeleted: false })
      .populate("branchId", "branchName branchCode")
      .populate("linkedProducts", "productName productCode")
      .populate("linkedIngredients", "name unit");
  }

  async findByBranch(branchId) {
    return await Supplier.find({ branchId, isDeleted: false })
      .populate("branchId", "branchName branchCode")
      .populate("linkedProducts", "productName productCode")
      .populate("linkedIngredients", "name unit");
  }

  async findById(id) {
    return await Supplier.findOne({ _id: id, isDeleted: false })
      .populate("branchId", "branchName branchCode")
      .populate("linkedProducts", "productName productCode")
      .populate("linkedIngredients", "name unit");
  }

  async update(id, data) {
    return await Supplier.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(id) {
    return await Supplier.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }
}

module.exports = new SupplierRepository();
