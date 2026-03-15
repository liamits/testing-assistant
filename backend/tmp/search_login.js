import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:\\Project\\testing-assistant\\backend\\.env') });

const testCaseSchema = new mongoose.Schema({}, { strict: false });
const TestCase = mongoose.model('TestCase', testCaseSchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const testCases = await TestCase.find({ title: /Login/i }).lean();
    console.log(`Found ${testCases.length} test cases with 'Login' in title`);
    testCases.forEach(tc => {
      console.log(`ID: ${tc._id}, Title: ${tc.title}, ProjectID: ${tc.projectId}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
