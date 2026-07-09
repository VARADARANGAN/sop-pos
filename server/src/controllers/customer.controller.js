const customerService = require("../services/customer.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class CustomerController {
  async createCustomer(req, res) {
    try {
      const customer = await customerService.createCustomer(req.body, req.user);
      return successResponse(res, "Customer created successfully", customer, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllCustomers(req, res) {
    try {
      const customers = await customerService.getAllCustomers();
      return successResponse(res, "Customers fetched successfully", customers);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getCustomerById(req, res) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      return successResponse(res, "Customer fetched successfully", customer);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async updateCustomer(req, res) {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body, req.user);
      return successResponse(res, "Customer updated successfully", customer);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteCustomer(req, res) {
    try {
      await customerService.deleteCustomer(req.params.id);
      return successResponse(res, "Customer deleted successfully");
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getCustomerHistory(req, res) {
    try {
      const history = await customerService.getCustomerHistory(req.params.id);
      return successResponse(res, "Customer history fetched successfully", history);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new CustomerController();
