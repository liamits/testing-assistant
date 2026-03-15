import mongoose from 'mongoose';
import { Project } from '../src/models/Project.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const projects = await Project.find({});
    console.log('Total Projects found in DB:', projects.length);
    console.log('Projects:', JSON.stringify(projects, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
