
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
}, { timestamps: true });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const SystemSetting = mongoose.model('SystemSettingCheck', systemSettingSchema, 'systemsettings');
  const setting = await SystemSetting.findOne({ key: 'systemLanguage' });
  console.log('Current systemLanguage in DB:', setting ? setting.value : 'NOT FOUND');
  await mongoose.disconnect();
}

run().catch(console.error);
