import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- USERS ---');
    const users = await db.collection('users').find({}).toArray();
    users.forEach(u => console.log(`User: ${u.email}, _id: ${u._id}`));
    
    console.log('\n--- PROJECTS ---');
    const projects = await db.collection('projects').find({}).toArray();
    projects.forEach(p => console.log(`Project: ${p.name}, _id: ${p._id}, userId: ${p.userId}`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
