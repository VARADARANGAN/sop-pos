const inventoryService = require("../services/inventory.service");

const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class InventoryController {
  async createInventory(req, res) {
    try {
      const inventory =
        await inventoryService.createInventory(req.body, req.user);

      return successResponse(
        res,
        "Inventory created successfully",
        inventory,
        201
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllInventory(req, res) {
    try {
      const inventory =
        await inventoryService.getAllInventory(req.user);

      return successResponse(
        res,
        "Inventory fetched successfully",
        inventory
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getInventoryById(req, res) {
    try {
      const inventory =
        await inventoryService.getInventoryById(req.params.id, req.user);

      return successResponse(
        res,
        "Inventory fetched successfully",
        inventory
      );
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async updateInventory(req, res) {
    try {
      const inventory =
        await inventoryService.updateInventory(
          req.params.id,
          req.body,
          req.user
        );

      return successResponse(
        res,
        "Inventory updated successfully",
        inventory
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteInventory(req, res) {
    try {
      await inventoryService.deleteInventory(req.params.id, req.user);

      return successResponse(
        res,
        "Inventory deleted successfully"
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new InventoryController();