import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prompt: { type: String },
  response: { type: String },
  type: { type: String, enum: ['generate-testcase', 'generate-code', 'analyze-bug'] },
  timestamp: { type: Date, default: Date.now },
});

export const AILog = mongoose.model('AILog', aiLogSchema);
