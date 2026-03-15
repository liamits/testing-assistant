
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from './src/models/User.js';
import { Project } from './src/models/Project.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne();
  if (!user) {
    console.log('No user found');
    process.exit(1);
  }

  const project = await Project.findOne({ userId: user._id });
  if (!project) {
    console.log('No project found for user');
    process.exit(1);
  }

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
  
  const data = {
    userId: user._id.toString(),
    projectId: project._id.toString(),
    token: token
  };

  fs.writeFileSync('test-info.json', JSON.stringify(data, null, 2));
  console.log('Test info saved to test-info.json');

  await mongoose.disconnect();
}

run();
