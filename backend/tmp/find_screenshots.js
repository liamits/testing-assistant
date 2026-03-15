import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:\\Project\\testing-assistant\\backend\\.env') });

const testCaseSchema = new mongoose.Schema({}, { strict: false });
const TestCase = mongoose.model('TestCase', testCaseSchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const testCases = await TestCase.find({ screenshotUrl: { $exists: true, $ne: "" } }).lean();
    console.log(`Found ${testCases.length} test cases with screenshots`);
    testCases.forEach(tc => {
      console.log(`ID: ${tc._id}, Title: ${tc.title}, ScreenshotUrl: ${tc.screenshotUrl}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
