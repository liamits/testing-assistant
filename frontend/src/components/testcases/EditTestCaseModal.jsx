"use client";
import { useState, useEffect } from "react";
import { X, Upload, FileText, Save, BrainCircuit } from "lucide-react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";

export default function EditTestCaseModal({ isOpen, onClose, onTestCaseUpdated, testCase }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    flow: "",
    expectedResult: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (testCase) {
      setFormData({
        title: testCase.title || "",
        description: testCase.description || "",
        flow: testCase.flow || "",
        expectedResult: testCase.expectedResult || "",
      });
      setPreview(testCase.screenshotUrl ? `${process.env.NEXT_PUBLIC_API_URL.replace("/api", "")}${testCase.screenshotUrl}` : null);
    }
  }, [testCase]);

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
    console.log("Submitting update for test case:", testCase);
    console.log("ID used:", testCase?._id);
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("flow", formData.flow);
      data.append("expectedResult", formData.expectedResult);
      if (file) data.append("screenshot", file);

      await api.put(`/testcases/${testCase._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Test case updated successfully!");
      onTestCaseUpdated();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.message || "Failed to update test case";
      const errorDetails = err.response?.status === 404 ? `${errorMsg} (ID: ${testCase?._id})` : errorMsg;
      toast.error(errorDetails);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
      <div className="glass w-full max-w-2xl overflow-hidden shadow-2xl border-[var(--border-glass)] animate-slide">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${testCase?.category === 'happy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              <BrainCircuit size={24} />
            </div>
            <h2 className="text-2xl font-bold text-high-contrast uppercase">
              Edit Test Case
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--border-glass)] rounded-full text-muted-contrast hover:text-high-contrast transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted-contrast mb-2 uppercase">Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. User Login"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-500"
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
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-muted-contrast mb-2 uppercase flex items-center gap-2">
                <Upload size={14} /> Attachment
              </label>
              <div className="relative h-[164px] w-full bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-glass)] rounded-xl overflow-hidden group hover:border-blue-500/30 transition-all text-muted-contrast">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center bg-transparent h-full">
                    <Upload className="text-muted-contrast group-hover:text-blue-400 transition-colors" size={32} />
                    <span className="text-xs text-slate-500 mt-2">New screenshot</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              {file && (
                <p className="text-[10px] text-blue-400 font-medium italic mt-1 animate-pulse">
                   💡 Vui lòng ấn 'Update' trước khi tạo test case tự động để lưu ảnh mới.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-contrast mb-2 uppercase flex items-center gap-2">
              <FileText size={14} /> {testCase?.parentId ? "Expected Result" : "Detailed Workflow"}
            </label>
            {testCase?.parentId ? (
              <input
                type="text"
                placeholder="Expected result..."
                value={formData.expectedResult}
                onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
              />
            ) : (
              <textarea
                required
                placeholder="Step by step flow..."
                value={formData.flow}
                onChange={(e) => setFormData({ ...formData, flow: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast h-32 resize-none focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
              />
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-muted-contrast hover:text-high-contrast transition-colors uppercase text-sm font-bold">
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="btn-primary flex items-center gap-2 uppercase text-sm font-bold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
