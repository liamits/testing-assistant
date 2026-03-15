import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend
dotenv.config({ path: path.resolve('d:\\Project\\testing-assistant\\backend\\.env') });

const testCaseSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
}, { strict: false });

const TestCase = mongoose.model('TestCase', testCaseSchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const projectId = "69b5fb35f2941fa0f0a2990d";
    const testCases = await TestCase.find({ projectId });
    console.log(`Found ${testCases.length} test cases for project ${projectId}`);

    testCases.forEach(tc => {
      console.log(`ID: ${tc._id}, Title: ${tc.title}, ParentID: ${tc.parentId || 'None'}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
