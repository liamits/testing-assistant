"use client";
import { Menu } from "lucide-react";

export default function MobileNav({ onOpenSidebar }) {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border-glass)] bg-[var(--bg-main)] sticky top-0 z-30">
      <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
        Testing Assistant
      </div>
      <button 
        onClick={onOpenSidebar}
        className="p-2 text-gray-400 hover:text-white"
      >
        <Menu size={24} />
      </button>
    </div>
  );
}
