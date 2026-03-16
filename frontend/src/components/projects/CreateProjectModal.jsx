"use client";
import { useState } from "react";
import { X, Globe, Plus } from "lucide-react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    baseUrl: "",
    defaultLanguage: "vi",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/projects", formData);

      toast.success("Project created successfully!");
      onProjectCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
      <div className="glass w-full max-w-md overflow-hidden shadow-2xl border-white/10 animate-slide">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-2xl font-bold text-high-contrast">New Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted-contrast hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-muted-contrast mb-2">Project Name</label>
              <input
                required
                type="text"
                placeholder="e.g. AHV Holding API"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-contrast mb-2 flex items-center gap-2">
                <Globe size={14} /> Base URL
              </label>
              <input
                required
                type="url"
                placeholder="https://example.com"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-contrast mb-2">Description</label>
              <textarea
                placeholder="Briefly describe the project..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast h-24 resize-none focus:border-blue-500/50 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-contrast mb-2">Ngôn ngữ mặc định (AI Generation)</label>
              <select
                value={formData.defaultLanguage}
                onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="vi" className="bg-slate-900">Tiếng Việt</option>
                <option value="en" className="bg-slate-900">English</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-muted-contrast hover:text-white transition-colors">
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
