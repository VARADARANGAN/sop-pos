const ingredientService = require("../services/ingredient.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class IngredientController {
  async createIngredient(req, res) {
    try {
      const ingredient = await ingredientService.createIngredient(req.body, req.user);
      return successResponse(res, "Ingredient created successfully", ingredient, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllIngredients(req, res) {
    try {
      const ingredients = await ingredientService.getAllIngredients(req.user);
      return successResponse(res, "Ingredients fetched successfully", ingredients);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getIngredientById(req, res) {
    try {
      const ingredient = await ingredientService.getIngredientById(req.params.id, req.user);
      return successResponse(res, "Ingredient fetched successfully", ingredient);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async updateIngredient(req, res) {
    try {
      const ingredient = await ingredientService.updateIngredient(req.params.id, req.body, req.user);
      return successResponse(res, "Ingredient updated successfully", ingredient);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteIngredient(req, res) {
    try {
      await ingredientService.deleteIngredient(req.params.id, req.user);
      return successResponse(res, "Ingredient deleted successfully");
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async toggleCashierAccess(req, res) {
    try {
      const { cashierId, hasAccess } = req.body;
      if (!cashierId || hasAccess === undefined) {
        return errorResponse(res, "cashierId and hasAccess fields are required", 400);
      }

      const cashier = await ingredientService.toggleCashierAccess(cashierId, hasAccess, req.user);
      return successResponse(res, `Ingredient access ${hasAccess ? "granted" : "revoked"} successfully`, cashier);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new IngredientController();
