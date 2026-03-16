import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  baseUrl: { type: String, required: true },
  screenshotUrl: { type: String },
  businessFlow: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  defaultLanguage: { type: String, enum: ['vi', 'en'], default: 'vi' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
