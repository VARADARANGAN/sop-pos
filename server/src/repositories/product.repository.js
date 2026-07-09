const Product = require("../models/Product");

class ProductRepository {
  /**
   * Create Product
   */
  async create(productData) {
    return await Product.create(productData);
  }

  /**
   * Get All Products
   */
  async findAll() {
    return await Product.find({
      isDeleted: false,
    })
      .populate("branchId", "branchName branchCode")
      .populate("categoryId", "categoryName categoryCode")
      .populate("comboItems.productId", "productName productCode variants");
  }

  /**
   * Get Products by Branch
   */
  async findByBranch(branchId) {
    return await Product.find({
      branchId,
      isDeleted: false,
    })
      .populate("branchId", "branchName branchCode")
      .populate("categoryId", "categoryName categoryCode")
      .populate("comboItems.productId", "productName productCode variants");
  }

  /**
   * Find Product By ID
   */
  async findById(productId) {
    return await Product.findOne({
      _id: productId,
      isDeleted: false,
    })
      .populate("branchId", "branchName branchCode")
      .populate("categoryId", "categoryName categoryCode")
      .populate("comboItems.productId", "productName productCode variants");
  }

  /**
   * Find Product By Code
   */
  async findByCode(productCode) {
    return await Product.findOne({
      productCode,
      isDeleted: false,
    });
  }

  /**
   * Find Product By Barcode
   */
  async findByBarcode(barcode) {
    return await Product.findOne({
      barcode,
      isDeleted: false,
    });
  }

  /**
   * Update Product
   */
  async update(productId, updateData) {
    return await Product.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  /**
   * Soft Delete Product
   */
  async softDelete(productId) {
    return await Product.findByIdAndUpdate(
      productId,
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

module.exports = new ProductRepository();