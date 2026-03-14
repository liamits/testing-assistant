"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../lib/store";
import { LayoutDashboard, FolderKanban, FlaskConical, History, Plus } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ projects: 0, testCases: 0, runs: 0 });

  return (
    <div className="flex h-screen bg-[#0b0e14]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1e293b] p-6 hidden md:block">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-10">
          Testing Assistant
        </div>
        <nav className="space-y-4">
          <a href="/dashboard" className="flex items-center gap-3 text-blue-400 bg-blue-500/10 p-3 rounded-lg">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="/projects" className="flex items-center gap-3 text-gray-400 hover:text-white p-3 transition-colors">
            <FolderKanban size={20} /> Projects
          </a>
          <a href="/runs" className="flex items-center gap-3 text-gray-400 hover:text-white p-3 transition-colors">
            <History size={20} /> Latest Runs
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
            <p className="text-gray-400 mt-1">Here's what's happening with your projects today.</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Project
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <FolderKanban size={24} />
              </span>
              <span className="text-gray-400 text-sm">Total Projects</span>
            </div>
            <div className="text-3xl font-bold">12</div>
          </div>
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <FlaskConical size={24} />
              </span>
              <span className="text-gray-400 text-sm">Active Test Cases</span>
            </div>
            <div className="text-3xl font-bold">458</div>
          </div>
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-green-500/20 rounded-xl text-green-400">
                <History size={24} />
              </span>
              <span className="text-gray-400 text-sm">Successful Runs</span>
            </div>
            <div className="text-3xl font-bold">89%</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${i === 2 ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="font-medium">Test Run #{i}245 - E-commerce App</div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white underline text-sm">View details</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
