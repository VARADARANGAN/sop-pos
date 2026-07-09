const productService = require("../services/product.service");

const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class ProductController {
  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(
        req.body,
        req.user
      );

      return successResponse(
        res,
        "Product created successfully",
        product,
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

  async getAllProducts(req, res) {
    try {
      const products =
        await productService.getAllProducts(req.user);

      return successResponse(
        res,
        "Products fetched successfully",
        products
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }

  async getProductById(req, res) {
    try {
      const product =
        await productService.getProductById(
          req.params.id,
          req.user
        );

      return successResponse(
        res,
        "Product fetched successfully",
        product
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        404
      );
    }
  }

  async updateProduct(req, res) {
    try {
      const product =
        await productService.updateProduct(
          req.params.id,
          req.body,
          req.user
        );

      return successResponse(
        res,
        "Product updated successfully",
        product
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(
        req.params.id,
        req.user
      );

      return successResponse(
        res,
        "Product deleted successfully"
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

module.exports = new ProductController();