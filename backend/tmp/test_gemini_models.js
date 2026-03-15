import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // There is no direct listModels in the main SDK usually, but let's try to see if we can find it
    console.log("Checking API Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    
    // We can't easily list models with the standard @google/generative-ai SDK easily without extra rest calls
    // But we can try to use one and see
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Model object created for gemini-1.5-flash");
    
    // Try another common name
    const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("Model object created for gemini-pro");

    // Actually, let's just try to do a very simple generate content with flash 1.5
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash!");
  } catch (err) {
    console.error("Error with gemini-1.5-flash:", err.message);
    
    try {
        const modelLatest = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        await modelLatest.generateContent("test");
        console.log("Success with gemini-1.5-flash-latest!");
    } catch (err2) {
        console.error("Error with gemini-1.5-flash-latest:", err2.message);
    }
  }
}

listModels();
