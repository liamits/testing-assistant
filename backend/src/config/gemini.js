import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-1.5-flash: free, nhanh, đủ mạnh cho hầu hết tasks
export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
});

// gemini-1.5-pro: mạnh hơn, dùng cho tasks phức tạp
export const geminiPro = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: { temperature: 0.5, maxOutputTokens: 8192 }
});
