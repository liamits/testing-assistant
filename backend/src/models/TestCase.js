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
  automationCode: { type: String },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  type: { type: String, enum: ['POSITIVE', 'NEGATIVE', 'EDGE'], default: 'POSITIVE' },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

testCaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const TestCase = mongoose.model('TestCase', testCaseSchema);
