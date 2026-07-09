const supplierService = require("../services/supplier.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class SupplierController {
  async createSupplier(req, res) {
    try {
      const supplier = await supplierService.createSupplier(req.body, req.user);
      return successResponse(res, "Supplier created successfully", supplier, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllSuppliers(req, res) {
    try {
      const suppliers = await supplierService.getAllSuppliers(req.user);
      return successResponse(res, "Suppliers fetched successfully", suppliers);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getSupplierById(req, res) {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id, req.user);
      return successResponse(res, "Supplier fetched successfully", supplier);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async updateSupplier(req, res) {
    try {
      const supplier = await supplierService.updateSupplier(req.params.id, req.body, req.user);
      return successResponse(res, "Supplier updated successfully", supplier);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteSupplier(req, res) {
    try {
      await supplierService.deleteSupplier(req.params.id, req.user);
      return successResponse(res, "Supplier deleted successfully");
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new SupplierController();
