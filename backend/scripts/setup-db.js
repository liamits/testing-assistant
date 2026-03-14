import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';

dotenv.config();

const setupDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = 'admin@test.com';
    const exists = await User.findOne({ email });

    if (!exists) {
      const hashed = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'Admin User',
        email: email,
        password: hashed,
        role: 'admin'
      });
      console.log("Admin account created: admin@test.com / 123456");
    } else {
      console.log("Admin account already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("Setup error:", error);
    process.exit(1);
  }
};

setupDB();
