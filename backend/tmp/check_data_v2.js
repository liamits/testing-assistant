import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SystemSetting } from '../src/models/SystemSetting.js';
import { TestCase } from '../src/models/TestCase.js';

dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- SYSTEM SETTINGS ---');
    const settings = await SystemSetting.find({});
    settings.forEach(s => console.log(`${s.key}: ${s.value}`));

    const projectId = '69b5fb35f2941fa0f0a2990d';
    const testCases = await TestCase.find({ projectId }).lean();
    
    console.log('\n--- PARENT TEST CASES ---');
    const parents = testCases.filter(tc => !tc.parentId);
    parents.forEach(p => {
      console.log(`[${p.category.toUpperCase()}] ID: ${p._id}, Title: "${p.title}"`);
      const children = testCases.filter(tc => tc.parentId?.toString() === p._id.toString());
      console.log(`  -> Found ${children.length} children`);
      if (children.length > 0) {
        console.log(`  -> First Child: "${children[0].title}"`);
      }
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
