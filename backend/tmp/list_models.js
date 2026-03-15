import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env") });

async function list() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Using Key:", key ? "EXISTS" : "MISSING");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log("Models found:", data.models.length);
      data.models.forEach(m => {
        if (m.name.includes("flash") || m.name.includes("pro")) {
          console.log(`- ${m.name} (${m.displayName}) methods: ${m.supportedGenerationMethods}`);
        }
      });
    } else {
      console.log("No models field in response:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

list();
