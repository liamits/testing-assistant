import { geminiFlash } from "../../config/gemini.js";

export async function generateTestCases({ featureDescription, projectContext = "" }) {
  const prompt = `
Bạn là QA Engineer chuyên nghiệp.
${projectContext ? `Context dự án: ${projectContext}` : ""}

Tính năng cần viết test case: "${featureDescription}"

Hãy sinh ra danh sách test case chi tiết theo format JSON bên dưới.
Bao gồm: test positive, negative, edge case.

[
  {
    "title": "Tên test case ngắn gọn",
    "description": "Mô tả ngắn",
    "steps": ["Bước 1", "Bước 2", "Bước 3"],
    "expectedResult": "Kết quả mong đợi",
    "priority": "HIGH | MEDIUM | LOW | CRITICAL",
    "type": "POSITIVE | NEGATIVE | EDGE"
  }
]

Chỉ trả về JSON array, không có text hay markdown khác.
  `.trim();

  const result = await geminiFlash.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}
