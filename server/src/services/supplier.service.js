const supplierRepository = require("../repositories/supplier.repository");
const branchRepository = require("../repositories/branch.repository");

class SupplierService {
  async createSupplier(data, user) {
    if (user && user.role !== "SUPER_ADMIN") {
      data.branchId = user.branchId;
    }

    const branch = await branchRepository.findById(data.branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }

    data.createdBy = user ? user.id : null;
    return await supplierRepository.create(data);
  }

  async getAllSuppliers(user) {
    if (user && user.role !== "SUPER_ADMIN") {
      return await supplierRepository.findByBranch(user.branchId);
    }
    return await supplierRepository.findAll();
  }

  async getSupplierById(id, user) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && supplier.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Supplier belongs to another branch");
    }

    return supplier;
  }

  async updateSupplier(id, data, user) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && supplier.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Supplier belongs to another branch");
    }

    if (user && user.role !== "SUPER_ADMIN") {
      data.branchId = user.branchId;
    }
    data.updatedBy = user ? user.id : null;

    return await supplierRepository.update(id, data);
  }

  async deleteSupplier(id, user) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && supplier.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Supplier belongs to another branch");
    }

    return await supplierRepository.softDelete(id);
  }
}

module.exports = new SupplierService();
