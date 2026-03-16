import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates child test cases based on parent description and business flow.
 * @param {Object} parent - Parent test case data { title, description, flow, category }
 * @param {string} language - 'vi' or 'en'
 * @returns {Promise<Array>} List of generated test cases
 */
export const generateTestCases = async (parent, language = 'vi') => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
    You are a professional QA Engineer. Based on the following business context, generate a list of detailed test cases.
    
    PARENT CONTEXT:
    - Title: ${parent.title}
    - Description: ${parent.description}
    - Business Flow: ${parent.flow}
    - Category: ${parent.category.toUpperCase()}
    - OUTPUT LANGUAGE: ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}

    CRITICAL REQUIREMENTS BY CATEGORY:
    ${parent.category.toUpperCase() === 'HAPPY' ? `
    - THIS IS A HAPPY CASE GENERATION.
    - Generate ONLY happy path scenarios (successful outcomes).
    - child test titles MUST end with "successful". Example: "Login successful".
    - Do NOT include any error cases, invalid inputs, edge cases, or negative scenarios.
    ` : `
    - THIS IS AN UNHAPPY CASE GENERATION.
    - Generate ONLY unhappy path scenarios (failures, error states, invalid inputs, edge cases).
    - child test titles MUST end with "failed". Example: "Login failed - wrong password".
    - Do NOT include any successful or happy path scenarios.
    `}

    GENERAL REQUIREMENTS:
    - Return a JSON array of objects.
    - Each object must have: "title", "description", "steps" (array of {stepNumber, action, expectedResult}), "expectedResult".
    - IMPORTANT: All text content (title, description, action, expectedResult) MUST be in ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.
    
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

/**
 * Generates test cases by analyzing a screenshot using Gemini Vision.
 * @param {string} imagePath - Path to the screenshot file
 * @param {string} category - 'happy' or 'unhappy'
 * @param {string} language - 'vi' or 'en'
 * @returns {Promise<Array>} List of generated test cases
 */
export const generateTestCasesFromImage = async (imagePath, category, language = 'vi') => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    const prompt = `
      You are an expert QA Engineer. Analyze the provided screenshot of a web application.
      Based ONLY on what you see in the image, generate a list of detailed test cases for this specific screen.
      
      CATEGORY: ${category.toUpperCase()}
      OUTPUT LANGUAGE: ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}

      CRITICAL REQUIREMENTS BY CATEGORY:
      ${category.toUpperCase() === 'HAPPY' ? `
      - THIS IS A HAPPY CASE GENERATION.
      - Generate ONLY happy path scenarios (successful outcomes).
      - child test titles MUST end with "successful".
      - Do NOT include any error cases, invalid inputs, edge cases, or negative scenarios.
      ` : `
      - THIS IS AN UNHAPPY CASE GENERATION.
      - Generate ONLY unhappy path scenarios (failures, error states, invalid inputs, edge cases).
      - child test titles MUST end with "failed".
      - Do NOT include any successful or happy path scenarios.
      `}

      GENERAL REQUIREMENTS:
      - Return a JSON array of objects.
      - Each object must have: "title", "description", "steps" (array of {stepNumber, action, expectedResult}), "expectedResult".
      - Identify buttons, inputs, links, and text elements to derive meaningful actions.
      - IMPORTANT: All text content (title, description, action, expectedResult) MUST be in ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.
      
      Output ONLY valid JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/png", // Assuming png/jpeg, usually handled by multer
        },
      },
    ]);

    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON.");
    
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Gemini Vision Error:", err);
    throw err;
  }
};
