"use client";
import { useState, useEffect } from "react";
import { X, Globe, Save } from "lucide-react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";

export default function EditProjectModal({ isOpen, onClose, onProjectUpdated, project }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    baseUrl: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        baseUrl: project.baseUrl || "",
      });
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/projects/${project.id || project._id}`, formData);
      toast.success("Project updated successfully!");
      onProjectUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
      <div className="glass w-full max-w-md overflow-hidden shadow-2xl border-[var(--border-glass)] animate-slide">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
          <h2 className="text-2xl font-bold text-high-contrast">Edit Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--border-glass)] rounded-full text-muted-contrast hover:text-high-contrast transition-colors">
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
                className="w-full bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-500"
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
                className="w-full bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-500"
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
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-muted-contrast hover:text-high-contrast transition-colors">
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
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
