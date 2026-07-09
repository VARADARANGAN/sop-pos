const Ingredient = require("../models/Ingredient");

class IngredientRepository {
  async create(data) {
    return await Ingredient.create(data);
  }

  async findAll() {
    return await Ingredient.find({ isDeleted: false }).populate("branchId", "branchName branchCode");
  }

  async findByBranch(branchId) {
    return await Ingredient.find({ branchId, isDeleted: false }).populate("branchId", "branchName branchCode");
  }

  async findById(id) {
    return await Ingredient.findOne({ _id: id, isDeleted: false }).populate("branchId", "branchName branchCode");
  }

  async update(id, data) {
    return await Ingredient.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(id) {
    return await Ingredient.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }
}

module.exports = new IngredientRepository();
