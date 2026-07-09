const productRepository = require("../repositories/product.repository");
const branchRepository = require("../repositories/branch.repository");
const categoryRepository = require("../repositories/category.repository");

class ProductService {
  /**
   * Generate Product Code
   */
  async generateProductCode() {
    const products = await productRepository.findAll();

    const nextNumber = products.length + 1;

    return `PRD${String(nextNumber).padStart(4, "0")}`;
  }

  /**
   * Create Product
   */
  async createProduct(productData, user) {
    // If not SUPER_ADMIN, enforce their own branch
    if (user && user.role !== "SUPER_ADMIN") {
      productData.branchId = user.branchId;
    }

    const branch = await branchRepository.findById(productData.branchId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    const category = await categoryRepository.findById(
      productData.categoryId
    );

    if (!category) {
      throw new Error("Category not found");
    }

    productData.productCode = await this.generateProductCode();
    productData.createdBy = user ? user.id : null;

    if (productData.barcode) {
      const barcodeExists =
        await productRepository.findByBarcode(
          productData.barcode
        );

      if (barcodeExists) {
        throw new Error("Barcode already exists");
      }
    }

    return await productRepository.create(productData);
  }

  /**
   * Get All Products
   */
  async getAllProducts(user) {
    if (user && user.role !== "SUPER_ADMIN") {
      // Find products for branch
      return await productRepository.findByBranch(user.branchId);
    }
    return await productRepository.findAll();
  }

  /**
   * Get Product By ID
   */
  async getProductById(id, user) {
    const product =
      await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    // Branch scope check
    if (user && user.role !== "SUPER_ADMIN" && product.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Product belongs to another branch");
    }

    return product;
  }

  /**
   * Update Product
   */
  async updateProduct(id, updateData, user) {
    const product =
      await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    // Branch scope check
    if (user && user.role !== "SUPER_ADMIN" && product.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Product belongs to another branch");
    }

    if (user && user.role !== "SUPER_ADMIN") {
      updateData.branchId = user.branchId;
    }
    updateData.updatedBy = user ? user.id : null;

    return await productRepository.update(
      id,
      updateData
    );
  }

  /**
   * Delete Product
   */
  async deleteProduct(id, user) {
    const product =
      await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    // Branch scope check
    if (user && user.role !== "SUPER_ADMIN" && product.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Product belongs to another branch");
    }

    return await productRepository.softDelete(id);
  }
}

module.exports = new ProductService();