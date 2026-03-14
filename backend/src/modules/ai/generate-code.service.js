import { geminiFlash } from "../../config/gemini.js";

export async function generatePlaywrightCode({ testCase, baseUrl = "" }) {
  const prompt = `
Bạn là automation test engineer.
Hãy viết Playwright test code (JavaScript) cho test case sau:

Title: ${testCase.title}
Steps: ${testCase.steps.join("\n")}
Expected Result: ${testCase.expectedResult}
Base URL: ${baseUrl || "http://localhost:3000"}

Yêu cầu:
- Dùng @playwright/test
- Dùng async/await
- Có screenshot khi fail
- Code clean, có comment

Chỉ trả về code JavaScript, không có markdown.
  `.trim();

  const result = await geminiFlash.generateContent(prompt);
  return result.response.text().replace(/```javascript|```js|```/g, "").trim();
}
