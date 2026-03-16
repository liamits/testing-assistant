import { SystemSetting } from "../../models/SystemSetting.js";

export const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.find();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    // Default values if not found in DB
    if (!settingsMap.systemLanguage) settingsMap.systemLanguage = 'vi';
    
    res.json(settingsMap);
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const updateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    
    let setting = await SystemSetting.findOne({ key });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await SystemSetting.create({ key, value });
    }
    
    res.json({ message: "Setting updated", key, value });
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};
