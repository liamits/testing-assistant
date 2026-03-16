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
    
    ### MANDATORY OUTPUT LANGUAGE: ${language === 'vi' ? 'VIETNAMESE (TIẾNG VIỆT)' : 'ENGLISH'}
    ### ALL FIELDS (TITLE, DESCRIPTION, STEPS, EXPECTED RESULT) MUST BE IN ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.
    ### DO NOT USE ANY ENGLISH IF THE OUTPUT LANGUAGE IS VIETNAMESE.
    ### IMPORTANT: IGNORE the language of the provided PARENT CONTEXT. Even if the Title or Description below is in English, YOU MUST respond in ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.

    PARENT CONTEXT:
    - Title: ${parent.title}
    - Description: ${parent.description}
    - Business Flow: ${parent.flow}
    - Category: ${parent.category.toUpperCase()}

    CRITICAL REQUIREMENTS BY CATEGORY:
    ${parent.category.toUpperCase() === 'HAPPY' ? `
    - THIS IS A HAPPY CASE GENERATION.
    - Generate ONLY happy path scenarios (successful outcomes).
    - child test titles MUST end with the suffix "${language === 'vi' ? 'thành công' : 'successful'}". 
    ${language === 'vi' ? '- Ví dụ tiêu đề: "Đăng nhập thành công", "Thêm sản phẩm thành công".' : '- Example titles: "Login successful", "Add product successful".'}
    - Do NOT include any error cases, invalid inputs, edge cases, or negative scenarios.
    ` : `
    - THIS IS AN UNHAPPY CASE GENERATION.
    - Generate ONLY unhappy path scenarios (failures, error states, invalid inputs, edge cases).
    - child test titles MUST end with the suffix "${language === 'vi' ? 'thất bại' : 'failed'}".
    ${language === 'vi' ? '- Ví dụ tiêu đề: "Đăng nhập thất bại", "Thanh toán thất bại".' : '- Example titles: "Login failed", "Payment failed".'}
    - Do NOT include any successful or happy path scenarios.
    - FOR FORMS/INPUTS: Generate separate test cases for each individual required field being empty (e.g., if there are email and password fields, create one case for "Empty Email" and one for "Empty Password").
    - Ensure there is also a "All fields empty" case.
    `}

    GENERAL REQUIREMENTS:
    - Return a JSON array of objects.
    - Each object must have: "title", "description", "steps" (array of {stepNumber, action, expectedResult}), "expectedResult".
    - IMPORTANT: All text content (title, description, action, expectedResult) MUST be in ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.
    
    ### FINAL MANDATORY INSTRUCTION:
    - YOU MUST WRITE EVERYTHING IN ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.
    - ${language === 'vi' ? 'TUYỆT ĐỐI KHÔNG DÙNG TIẾNG ANH. Không dùng "failed", "success", "click", "button". Dùng từ tiếng Việt tương đương.' : 'DO NOT USE VIETNAMESE.'}
    
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
      
      ### MANDATORY OUTPUT LANGUAGE: ${language === 'vi' ? 'VIETNAMESE (TIẾNG VIỆT)' : 'ENGLISH'}
      ### ALL FIELDS (TITLE, DESCRIPTION, STEPS, EXPECTED RESULT) MUST BE IN ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.
      ### DO NOT USE ANY ENGLISH IF THE OUTPUT LANGUAGE IS VIETNAMESE.
      ### IMPORTANT: IGNORE the language of the text in the screenshot. Even if the UI on screen is in English, YOU MUST respond in ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.

      CATEGORY: ${category.toUpperCase()}

      CRITICAL REQUIREMENTS BY CATEGORY:
      ${category.toUpperCase() === 'HAPPY' ? `
      - THIS IS A HAPPY CASE GENERATION.
      - Generate ONLY happy path scenarios (successful outcomes).
      - child test titles MUST end with the suffix "${language === 'vi' ? 'thành công' : 'successful'}".
      ${language === 'vi' ? '- Ví dụ tiêu đề: "Đăng nhập thành công", "Thêm sản phẩm thành công".' : '- Example titles: "Login successful", "Add product successful".'}
      - Do NOT include any error cases, invalid inputs, edge cases, or negative scenarios.
      ` : `
      - THIS IS AN UNHAPPY CASE GENERATION.
      - Generate ONLY unhappy path scenarios (failures, error states, invalid inputs, edge cases).
      - child test titles MUST end with the suffix "${language === 'vi' ? 'thất bại' : 'failed'}".
      ${language === 'vi' ? '- Ví dụ tiêu đề: "Đăng nhập thất bại", "Thanh toán thất bại".' : '- Example titles: "Login failed", "Payment failed".'}
      - Do NOT include any successful or happy path scenarios.
      - FOR FORMS/INPUTS: Generate separate test cases for each individual required field being empty (e.g., if there are email and password fields, create one case for "Empty Email" and one for "Empty Password").
      - Ensure there is also a "All fields empty" case.
      `}

      GENERAL REQUIREMENTS:
      - Return a JSON array of objects.
      - Each object must have: "title", "description", "steps" (array of {stepNumber, action, expectedResult}), "expectedResult".
      - Identify buttons, inputs, links, and text elements to derive meaningful actions.
      
      ### FINAL MANDATORY INSTRUCTION:
      - YOU MUST WRITE EVERYTHING IN ${language === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.
      - ${language === 'vi' ? 'TUYỆT ĐỐI KHÔNG DÙNG TIẾNG ANH. Không dùng "failed", "success", "click", "button". Dùng từ tiếng Việt tương đương.' : 'DO NOT USE VIETNAMESE.'}
      - ${language === 'vi' ? 'Nếu bạn dùng tiếng Anh, hệ thống sẽ bị lỗi. Hãy dùng 100% TIẾNG VIỆT.' : ''}

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

export const translateTestCases = async (testCases, targetLanguage) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const languageName = targetLanguage === 'vi' ? 'Vietnamese' : 'English';
  
  const prompt = `
    You are a professional QA Engineer and translator. 
    Translate the following list of test cases into ${languageName}.
    
    ### MANDATORY RULES:
    1. MAINTAIN the EXACT SAME JSON structure.
    2. Translate "title", "description", and each step's "action" and "expectedResult".
    3. KEEP technical terms meaningful (e.g., if target is Vietnamese, use appropriate tech Vietnamese).
    4. ENSURE Title suffixes are consistent:
       - If Happy Case: Use "${targetLanguage === 'vi' ? 'thành công' : 'successful'}"
       - If Unhappy Case: Use "${targetLanguage === 'vi' ? 'thất bại' : 'failed'}"
    5. Return ONLY the translated JSON array.

    TEST CASES TO TRANSLATE:
    ${JSON.stringify(testCases.map(tc => ({
      id: tc._id,
      title: tc.title,
      description: tc.description,
      steps: tc.steps,
      expectedResult: tc.expectedResult,
      category: tc.category
    })), null, 2)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("AI Translation Error:", err);
    throw new Error("Failed to translate test cases with AI");
  }
};
