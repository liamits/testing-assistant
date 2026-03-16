import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Project } from '../src/models/Project.js';
import { TestCase } from '../src/models/TestCase.js';

dotenv.config();

async function debugExport(projectId) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const project = await Project.findById(projectId).lean();
    if (!project) {
      console.log('Project not found');
      return;
    }

    const testCases = await TestCase.find({ projectId: project._id }).sort({ order: 1, createdAt: 1 }).lean();
    console.log(`Found ${testCases.length} test cases`);

    const parentCases = testCases.filter(tc => !tc.parentId);
    console.log(`Found ${parentCases.length} parent cases`);

    const usedSheetNames = new Set();
    parentCases.forEach(parent => {
      let baseName = parent.title.substring(0, 31).replace(/[\[\]\?\*\\\/]/g, '').trim() || "Sheet";
      let actualSheetName = baseName;
      let counter = 1;

      while (usedSheetNames.has(actualSheetName)) {
        const suffix = `_${counter}`;
        actualSheetName = baseName.substring(0, 31 - suffix.length) + suffix;
        counter++;
      }

      console.log(`Parent: "${parent.title}" -> Final Sheet Name: "${actualSheetName}"`);
      usedSheetNames.add(actualSheetName);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

const projectId = '69b5fb35f2941fa0f0a2990d';
debugExport(projectId);
