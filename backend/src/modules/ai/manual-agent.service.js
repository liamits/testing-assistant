import { geminiFlash } from "../../config/gemini.js";

export async function parseInstructionToActions(instruction) {
  const prompt = `
Bạn là automation test agent.
Chuyển câu lệnh kiểm thử sau thành mảng browser actions JSON.

Câu lệnh: "${instruction}"

Các action hợp lệ:
- { "action": "navigate", "value": "url" }
- { "action": "fill", "selector": "css-selector", "value": "text" }
- { "action": "click", "selector": "css-selector" }
- { "action": "wait", "ms": 1000 }
- { "action": "screenshot", "name": "tên ảnh" }
- { "action": "expect_url", "value": "/path" }
- { "action": "expect_text", "selector": "css", "value": "text mong đợi" }
- { "action": "expect_visible", "selector": "css-selector" }

Ví dụ output:
[
  { "action": "navigate", "value": "http://localhost:3000/login" },
  { "action": "fill", "selector": "#email", "value": "test@gmail.com" },
  { "action": "fill", "selector": "#password", "value": "123456" },
  { "action": "click", "selector": "button[type=submit]" },
  { "action": "wait", "ms": 1000 },
  { "action": "expect_url", "value": "/dashboard" },
  { "action": "screenshot", "name": "after-login" }
]

Chỉ trả về JSON array, không có text khác.
  `.trim();

  const result = await geminiFlash.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

export async function analyzeBugFromScreenshot(imageBase64, mimeType = "image/png") {
  const model = (await import("../../config/gemini.js")).geminiFlash;

  const result = await model.generateContent([
    {
      inlineData: { data: imageBase64, mimeType }
    },
    {
      text: `Bạn là QA Engineer. Hãy phân tích screenshot này và mô tả:
1. Bug/lỗi gì đang xảy ra
2. Mức độ nghiêm trọng (Critical/High/Medium/Low)
3. Bước tái hiện có thể xảy ra
4. Gợi ý cách fix

Trả về JSON: { "title": "", "severity": "", "description": "", "steps": [], "suggestion": "" }`
    }
  ]);

  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}
