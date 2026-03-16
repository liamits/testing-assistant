"use client";
import { X, AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
      <div className="glass w-full max-w-md overflow-hidden shadow-2xl border-[var(--border-glass)] animate-slide">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-high-contrast uppercase tracking-wider">
              {title || "Confirm Delete"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--border-glass)] rounded-full text-muted-contrast hover:text-high-contrast transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-muted-contrast leading-relaxed text-center">
            {message || "Are you sure you want to delete this item? This action cannot be undone."}
          </p>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-3 rounded-xl bg-[var(--bg-card)] text-muted-contrast hover:text-high-contrast hover:bg-[var(--border-glass)] transition-all uppercase text-sm font-bold border border-[var(--border-glass)]"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={onConfirm}
              className="flex-1 px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white transition-all uppercase text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
