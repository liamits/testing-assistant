"use client";
import { useState } from "react";
import { useAiGenerate } from "@/hooks/useAiGenerate";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AiGenerateModal({ projectId, projectContext, onSaved, onClose }) {
  const [description, setDescription] = useState("");
  const { generate, loading, generatedCases, setGeneratedCases } = useAiGenerate();
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) return toast.error("Nhập mô tả tính năng trước");
    await generate({ featureDescription: description, projectContext });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await api.post("/testcases/bulk", { projectId, testCases: generatedCases });
      toast.success("Đã lưu tất cả test case!");
      onSaved?.();
      onClose?.();
    } catch {
      toast.error("Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">AI Generate Test Cases</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <textarea
          className="w-full border rounded-xl p-3 text-sm resize-none h-28 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Mô tả tính năng cần test... VD: Trang login có form email và password, nhấn submit gọi API /auth/login"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? "AI đang tạo..." : "✨ Generate với Gemini AI"}
        </button>

        {generatedCases.length > 0 && (
          <>
            <div className="space-y-2 mb-4">
              {generatedCases.map((tc, i) => (
                <div key={i} className="border rounded-xl p-3 text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{tc.title}</span>
                    <div className="flex gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tc.priority === "HIGH" || tc.priority === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                          : tc.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>{tc.priority}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{tc.type}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">{tc.expectedResult}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full bg-green-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : `Lưu tất cả ${generatedCases.length} test case`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
