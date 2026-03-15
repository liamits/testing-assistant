import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates child test cases based on parent description and business flow.
 * @param {Object} parent - Parent test case data { title, description, flow, category }
 * @returns {Promise<Array>} List of generated test cases
 */
export const generateTestCases = async (parent) => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    You are a professional QA Engineer. Based on the following business context, generate a list of detailed test cases.
    
    PARENT CONTEXT:
    - Title: ${parent.title}
    - Description: ${parent.description}
    - Business Flow: ${parent.flow}
    - Category: ${parent.category.toUpperCase()}

    REQUIREMENTS:
    - Return a JSON array of objects.
    - Each object must have: "title", "description", "steps" (array of {stepNumber, action, expectedResult}), "expectedResult".
    - If category is HAPPY, child test titles MUST end with "successful". Example: "Login successful".
    - Focus on ${parent.category} scenarios.
    
    Output ONLY valid JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown code blocks if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Extract JSON from the text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON. Received: " + text);
    
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Gemini AI Generation Error:", err);
    throw err;
  }
};
