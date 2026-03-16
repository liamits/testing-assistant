import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SystemSetting } from '../src/models/SystemSetting.js';
import { TestCase } from '../src/models/TestCase.js';

dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const setting = await SystemSetting.findOne({ key: 'systemLanguage' });
    console.log('System Language Setting:', setting);

    const projectId = '69b5fb35f2941fa0f0a2990d';
    const testCases = await TestCase.find({ projectId }).sort({ createdAt: -1 }).limit(20);
    
    console.log('Last 20 Test Cases for Project:');
    testCases.forEach(tc => {
      console.log(`- ID: ${tc._id}, Title: "${tc.title}", Category: ${tc.category}, ParentId: ${tc.parentId || 'None'}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
