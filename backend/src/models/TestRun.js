import mongoose from 'mongoose';

const testRunSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  results: [{
    testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
    status: { type: String, enum: ['PASS', 'FAIL', 'SKIPPED'], default: 'SKIPPED' },
    log: { type: String },
    screenshotUrl: { type: String },
  }],
  createdAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
});

export const TestRun = mongoose.model('TestRun', testRunSchema);
