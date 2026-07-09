const categoryService = require("../services/category.service");

const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class CategoryController {
  /**
   * Create Category
   */
  async createCategory(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);

      return successResponse(
        res,
        "Category created successfully",
        category,
        201
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }

  /**
   * Get All Categories
   */
  async getAllCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();

      return successResponse(
        res,
        "Categories fetched successfully",
        categories
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }

  /**
   * Get Category By ID
   */
  async getCategoryById(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);

      return successResponse(
        res,
        "Category fetched successfully",
        category
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        404
      );
    }
  }

  /**
   * Update Category
   */
  async updateCategory(req, res) {
    try {
      const category = await categoryService.updateCategory(
        req.params.id,
        req.body
      );

      return successResponse(
        res,
        "Category updated successfully",
        category
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }

  /**
   * Delete Category
   */
  async deleteCategory(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);

      return successResponse(
        res,
        "Category deleted successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }
}

module.exports = new CategoryController();