import mongoose from 'mongoose';
import { TestCase } from '../src/models/TestCase.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/testing-assistant';

async function checkIntegrity() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const allTestCases = await TestCase.find({}).lean();
    console.log(`Total test cases: ${allTestCases.length}`);

    const tcMap = new Map();
    allTestCases.forEach(tc => tcMap.set(tc._id.toString(), tc));

    const parents = allTestCases.filter(tc => !tc.parentId);
    const children = allTestCases.filter(tc => tc.parentId);
    
    console.log(`Remaining Test Cases: ${allTestCases.length}`);
    console.log(`Parents: ${parents.length}`);
    console.log(`Children: ${children.length}`);
    
    if (parents.length > 0) {
      console.log('Sample Parent Titles:', parents.map(p => p.title).slice(0, 5));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkIntegrity();
