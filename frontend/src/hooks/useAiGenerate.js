import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useAiGenerate() {
  const [loading, setLoading] = useState(false);
  const [generatedCases, setGeneratedCases] = useState([]);

  const generate = async ({ featureDescription, projectContext }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/ai/generate-testcases", {
        featureDescription,
        projectContext,
      });
      setGeneratedCases(data.testCases);
      toast.success(`Đã tạo ${data.testCases.length} test case!`);
      return data.testCases;
    } catch (err) {
      toast.error("AI generate thất bại: " + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async ({ testCase, baseUrl }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/ai/generate-code", { testCase, baseUrl });
      toast.success("Đã tạo Playwright code!");
      return data.code;
    } catch (err) {
      toast.error("Generate code thất bại");
      return "";
    } finally {
      setLoading(false);
    }
  };

  return { generate, generateCode, loading, generatedCases, setGeneratedCases };
}
