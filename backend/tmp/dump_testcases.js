import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:\\Project\\testing-assistant\\backend\\.env') });

const testCaseSchema = new mongoose.Schema({}, { strict: false });
const TestCase = mongoose.model('TestCase', testCaseSchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const projectId = "69b5fb35f2941fa0f0a2990d";
    const testCases = await TestCase.find({ projectId }).lean();
    console.log(JSON.stringify(testCases, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
