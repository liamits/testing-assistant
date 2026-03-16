"use client";
import { useState } from "react";
import { X, Upload, FileText, Plus, BrainCircuit } from "lucide-react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../lib/store";

export default function AddTestCaseModal({ isOpen, onClose, onTestCaseCreated, projectId, category, parentId = null }) {
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    flow: "",
    expectedResult: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("projectId", projectId);
      data.append("category", category);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("flow", formData.flow);
      data.append("expectedResult", formData.expectedResult);
      if (parentId) data.append("parentId", parentId);
      if (file) data.append("screenshot", file);

      await api.post("/testcases", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Test case created! You can now generate steps from the screenshot in the edit modal.");
      onTestCaseCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create test case");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndGenerate = async () => {
    if (!formData.title) {
      toast.error("Vui lòng nhập tiêu đề!");
      return;
    }
    setLoading(true);
    setGenLoading(true);

    try {
      // 1. Create the test case first
      const data = new FormData();
      data.append("projectId", projectId);
      data.append("category", category);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("flow", formData.flow);
      if (file) data.append("screenshot", file);

      const res = await api.post("/testcases", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newTestCase = res.data;

      // 2. Trigger AI generation
      if (file) {
        toast.loading("Đang tạo test case con bằng AI...", { id: "ai-gen" });
        const { systemLanguage } = useAuthStore.getState();
        await api.post(`/testcases/${newTestCase._id}/generate-ai`, { language: systemLanguage });
        toast.success("Đã tạo test case cha và con thành công!", { id: "ai-gen" });
      } else {
        toast.success("Đã tạo test case cha! (Không có ảnh để quét AI)");
      }

      onTestCaseCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi tạo và quét AI", { id: "ai-gen" });
    } finally {
      setLoading(false);
      setGenLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
      <div className="glass w-full max-w-2xl overflow-hidden shadow-2xl border-white/10 animate-slide">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${category === 'happy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              <BrainCircuit size={24} />
            </div>
            <h2 className="text-2xl font-bold text-high-contrast uppercase">
              Add {category} Case
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted-contrast hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`space-y-4 ${parentId ? 'md:col-span-2' : ''}`}>
              <div>
                <label className="block text-sm font-bold text-muted-contrast mb-2 uppercase">
                  {parentId ? "Step Title" : "Parent Title"}
                </label>
                <input
                  required
                  type="text"
                  placeholder={parentId ? "e.g. Click Login Button" : "e.g. User Login"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-contrast mb-2 uppercase">Description</label>
                <textarea
                  placeholder="Functionality overview..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast h-24 resize-none focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {parentId && (
                <div>
                  <label className="block text-sm font-bold text-muted-contrast mb-2 uppercase">Expected Result</label>
                  <input
                    type="text"
                    placeholder="e.g. User should be redirected to dashboard"
                    value={formData.expectedResult}
                    onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              )}
            </div>

            {!parentId && (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-muted-contrast mb-2 uppercase flex items-center gap-2">
                  <Upload size={14} /> Attachment
                </label>
                <div className="relative h-[164px] w-full bg-white/5 border-2 border-dashed border-white/10 rounded-xl overflow-hidden group hover:border-blue-500/30 transition-all">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-transparent h-full">
                      <Upload className="text-muted-contrast group-hover:text-blue-400 transition-colors" size={32} />
                      <span className="text-xs text-slate-500 mt-2">Screenshot for AI analysis</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {!parentId && (
            <div>
              <label className="block text-sm font-bold text-muted-contrast mb-2 uppercase flex items-center gap-2">
                <FileText size={14} /> Detailed Workflow
              </label>
              <textarea
                placeholder="Step by step flow for AI to expand (Optional)..."
                value={formData.flow}
                onChange={(e) => setFormData({ ...formData, flow: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast h-32 resize-none focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-muted-contrast hover:text-white transition-colors uppercase text-sm font-bold">
              Cancel
            </button>
            <button
              disabled={loading || genLoading}
              type="submit"
              className="px-6 py-2 rounded-xl text-muted-contrast hover:text-white transition-colors uppercase text-sm font-bold"
            >
              {loading && !genLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus size={18} className="inline mr-2" />
              )}
              {parentId ? "Create Step" : "Chỉ tạo cha"}
            </button>

            {!parentId && (
              <button
                type="button"
                disabled={loading || genLoading}
                onClick={handleCreateAndGenerate}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-all flex items-center gap-2 uppercase text-sm font-bold shadow-lg shadow-purple-500/20"
              >
                {genLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <BrainCircuit size={18} />
                )}
                Tạo & Quét AI
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
