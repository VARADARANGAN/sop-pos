const categoryRepository = require("../repositories/category.repository");

class CategoryService {
  /**
   * Create Category
   */
  async createCategory(categoryData) {

    // Check duplicate category name
    const existingName = await categoryRepository.findByName(
      categoryData.categoryName
    );

    if (existingName) {
      throw new Error("Category name already exists");
    }

    return await categoryRepository.create(categoryData);
  }

  /**
   * Get All Categories
   */
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  /**
   * Get Category By ID
   */
  async getCategoryById(categoryId) {
    const category = await categoryRepository.findById(categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  /**
   * Update Category
   */
  async updateCategory(categoryId, updateData) {
    const category = await categoryRepository.findById(categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    return await categoryRepository.update(categoryId, updateData);
  }

  /**
   * Delete Category
   */
  async deleteCategory(categoryId) {
    const category = await categoryRepository.findById(categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    return await categoryRepository.softDelete(categoryId);
  }
}

module.exports = new CategoryService();