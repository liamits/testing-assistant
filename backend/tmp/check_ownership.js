import mongoose from 'mongoose';
import { Project } from '../src/models/Project.js';
import { User } from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const projects = await Project.find({});
    const users = await User.find({});
    
    console.log('--- Users ---');
    users.forEach(u => console.log(`User: ${u.email} (ID: ${u._id})`));
    
    console.log('\n--- Projects ---');
    projects.forEach(p => console.log(`Project: ${p.name} (Owner ID: ${p.userId})`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
