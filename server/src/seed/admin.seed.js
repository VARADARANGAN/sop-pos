const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");

const ROLES = require("../constants/roles");
const USER_STATUS = require("../constants/status");

const seedAdmin = async () => {
  try {
    await connectDB();

    let existingAdmin = await User.findOne({
      role: ROLES.SUPER_ADMIN,
    });

    if (existingAdmin) {
      console.log("⚙️ Super Admin already exists. Resetting password and clearing failed attempts...");
      existingAdmin.password = "Admin@123";
      existingAdmin.failedLoginAttempts = 0;
      existingAdmin.accountLockedUntil = null;
      existingAdmin.status = USER_STATUS.ACTIVE;
      await existingAdmin.save();
      console.log("✅ Super Admin password reset successfully to: Admin@123");
      await mongoose.connection.close();
      process.exit(0);
    }

    const admin = new User({
      employeeCode: "EMP0001",
      firstName: "Super",
      lastName: "Admin",
      email: "admin@sop.com",
      password: "Admin@123",
      role: ROLES.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE
    });

    await admin.save();

    console.log("🎉 Super Admin created successfully!");
    console.log("Email: admin@sop.com");
    console.log("Password: Admin@123");

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
