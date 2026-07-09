const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const bcrypt = require("bcrypt");

async function test() {
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ email: "admin@sop.com" }).select("+password");
    if (!user) {
      console.log("User not found!");
      process.exit(1);
    }

    console.log("User found:", user.email);
    console.log("Hashed password in DB:", user.password);

    const isMatch = await bcrypt.compare("Admin@123", user.password);
    console.log("bcrypt.compare test with 'Admin@123':", isMatch);

    const modelMatch = await user.comparePassword("Admin@123");
    console.log("user.comparePassword test with 'Admin@123':", modelMatch);

    // Let's print out if failed attempts or lockout is present
    console.log("Failed attempts:", user.failedLoginAttempts);
    console.log("Locked until:", user.accountLockedUntil);
    console.log("Status:", user.status);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

test();
