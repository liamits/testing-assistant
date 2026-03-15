import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testLatestModel() {
  try {
    console.log("Testing gemini-flash-latest...");
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Say 'AI is working' if you can read this.");
    const response = await result.response;
    console.log("AI Response:", response.text());
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testLatestModel();
