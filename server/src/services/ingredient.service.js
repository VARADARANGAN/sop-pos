const ingredientRepository = require("../repositories/ingredient.repository");
const branchRepository = require("../repositories/branch.repository");
const User = require("../models/User");
const { logAction } = require("../utils/auditLogger");

class IngredientService {
  async createIngredient(data, user) {
    if (user && user.role !== "SUPER_ADMIN") {
      data.branchId = user.branchId;
    }

    const branch = await branchRepository.findById(data.branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }

    data.createdBy = user ? user.id : null;
    return await ingredientRepository.create(data);
  }

  async getAllIngredients(user) {
    if (user && user.role !== "SUPER_ADMIN") {
      return await ingredientRepository.findByBranch(user.branchId);
    }
    return await ingredientRepository.findAll();
  }

  async getIngredientById(id, user) {
    const ingredient = await ingredientRepository.findById(id);
    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && ingredient.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Ingredient belongs to another branch");
    }

    return ingredient;
  }

  async updateIngredient(id, data, user) {
    const ingredient = await ingredientRepository.findById(id);
    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && ingredient.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Ingredient belongs to another branch");
    }

    if (user && user.role !== "SUPER_ADMIN") {
      data.branchId = user.branchId;
    }
    data.updatedBy = user ? user.id : null;

    return await ingredientRepository.update(id, data);
  }

  async deleteIngredient(id, user) {
    const ingredient = await ingredientRepository.findById(id);
    if (!ingredient) {
      throw new Error("Ingredient not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && ingredient.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Ingredient belongs to another branch");
    }

    return await ingredientRepository.softDelete(id);
  }

  async toggleCashierAccess(cashierId, hasAccess, adminUser) {
    const cashier = await User.findOne({ _id: cashierId, isDeleted: false });
    if (!cashier) {
      throw new Error("Cashier not found");
    }

    // Branch scoping
    if (adminUser.role !== "SUPER_ADMIN" && cashier.branchId.toString() !== adminUser.branchId.toString()) {
      throw new Error("Access denied: Cashier belongs to another branch");
    }

    cashier.hasIngredientsAccess = hasAccess;
    await cashier.save();

    await logAction({
      actorId: adminUser.id,
      actorName: `${adminUser.firstName} ${adminUser.lastName}`,
      action: hasAccess ? "INGREDIENTS_ACCESS_GRANT" : "INGREDIENTS_ACCESS_REVOKE",
      entity: "User",
      entityId: cashier._id,
      metadata: { cashierEmail: cashier.email },
    });

    return cashier;
  }
}

module.exports = new IngredientService();
