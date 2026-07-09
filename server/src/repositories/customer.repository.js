const Customer = require("../models/Customer");

class CustomerRepository {
  async create(data) {
    return await Customer.create(data);
  }

  async findAll() {
    return await Customer.find({ isDeleted: false });
  }

  async findById(id) {
    return await Customer.findOne({ _id: id, isDeleted: false });
  }

  async findByPhone(phone) {
    return await Customer.findOne({ phone, isDeleted: false });
  }

  async update(id, data) {
    return await Customer.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(id) {
    return await Customer.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }
}

module.exports = new CustomerRepository();
