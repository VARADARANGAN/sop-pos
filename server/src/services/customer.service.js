const mongoose = require("mongoose");
const customerRepository = require("../repositories/customer.repository");

class CustomerService {
  async createCustomer(data, user) {
    const existing = await customerRepository.findByPhone(data.phone);
    if (existing) {
      throw new Error("Customer phone number already exists");
    }
    data.createdBy = user ? user.id : null;
    return await customerRepository.create(data);
  }

  async getAllCustomers() {
    return await customerRepository.findAll();
  }

  async getCustomerById(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new Error("Customer not found");
    return customer;
  }

  async updateCustomer(id, data, user) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new Error("Customer not found");

    if (data.phone) {
      const existing = await customerRepository.findByPhone(data.phone);
      if (existing && existing._id.toString() !== id) {
        throw new Error("Customer phone number already exists");
      }
    }
    data.updatedBy = user ? user.id : null;
    return await customerRepository.update(id, data);
  }

  async deleteCustomer(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new Error("Customer not found");
    return await customerRepository.softDelete(id);
  }

  async getCustomerHistory(customerId) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    try {
      const Order = mongoose.model("Order");
      return await Order.find({ customerId, isDeleted: false }).sort({ createdAt: -1 });
    } catch (e) {
      return [];
    }
  }
}

module.exports = new CustomerService();
