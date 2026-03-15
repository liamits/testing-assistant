import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:\\Project\\testing-assistant\\backend\\.env') });

const testCaseSchema = new mongoose.Schema({}, { strict: false });
const projectSchema = new mongoose.Schema({}, { strict: false });

const TestCase = mongoose.model('TestCase', testCaseSchema);
const Project = mongoose.model('Project', projectSchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const projects = await Project.find({});
    console.log(`--- PROJECTS (${projects.length}) ---`);
    projects.forEach(p => console.log(`Project ID: ${p._id}, Name: ${p.name}`));

    const testCases = await TestCase.find({});
    console.log(`\n--- TEST CASES (${testCases.length}) ---`);
    testCases.forEach(tc => {
      console.log(`TC ID: ${tc._id}, Title: ${tc.title}, ProjectID: ${tc.projectId}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
