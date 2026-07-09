const Category = require("../models/Category");

class CategoryRepository {
  /**
   * Create Category
   */
  async create(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * Get All Categories
   */
  async findAll() {
    return await Category.find({
      isDeleted: false,
    });
  }

  /**
   * Find Category By ID
   */
  async findById(categoryId) {
    return await Category.findOne({
      _id: categoryId,
      isDeleted: false,
    });
  }

  /**
   * Find Category By Code
   */
  async findByCode(categoryCode) {
    return await Category.findOne({
      categoryCode,
      isDeleted: false,
    });
  }

  /**
   * Find Category By Name
   */
  async findByName(categoryName) {
    return await Category.findOne({
      categoryName,
      isDeleted: false,
    });
  }

  /**
   * Update Category
   */
  async update(categoryId, updateData) {
    return await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  /**
   * Soft Delete Category
   */
  async softDelete(categoryId) {
    return await Category.findByIdAndUpdate(
      categoryId,
      {
        isDeleted: true,
        isActive: false,
      },
      {
        new: true,
      }
    );
  }
}

module.exports = new CategoryRepository();