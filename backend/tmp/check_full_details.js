import mongoose from 'mongoose';
import { Project } from '../src/models/Project.js';
import { User } from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const projects = await Project.find({}).lean();
    const users = await User.find({}).lean();
    
    console.log('--- USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Email: ${u.email}`);
    });
    
    console.log('\n--- PROJECTS ---');
    projects.forEach(p => {
      console.log(`ID: ${p._id}, Name: ${p.name}, OwnerID: ${p.userId}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
