import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String },
  steps: [{
    stepNumber: { type: Number },
    action: { type: String },
    expectedResult: { type: String },
  }],
  expectedResult: { type: String },
  screenshotUrl: { type: String },
  flow: { type: String },
  category: { type: String, enum: ['happy', 'unhappy'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' }, // For hierarchy
  automationCode: { type: String },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' },
  tags: [String],
}, { timestamps: true });

export const TestCase = mongoose.model('TestCase', testCaseSchema);
