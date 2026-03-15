"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../lib/store";
import { LayoutDashboard, FolderKanban, FlaskConical, History, Plus, LogOut } from "lucide-react";
import AuthGuard from "../../components/common/AuthGuard";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [stats, setStats] = useState({ projects: 0, testCases: 0, runs: 0 });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#0b0e14]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1e293b] p-6 hidden md:block flex flex-col">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-10">
          Testing Assistant
        </div>
        <nav className="space-y-4 flex-1">
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
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:bg-red-400/10 p-3 rounded-lg transition-colors mt-auto w-full text-left"
        >
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-high-contrast">Welcome back, {user?.name || "User"}!</h1>
            <p className="text-muted-contrast mt-1 text-lg">Here's what's happening with your projects today.</p>
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
              <span className="text-muted-contrast text-sm font-medium">Total Projects</span>
            </div>
            <div className="text-4xl font-extrabold text-high-contrast">12</div>
          </div>
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <FlaskConical size={24} />
              </span>
              <span className="text-muted-contrast text-sm font-medium">Active Test Cases</span>
            </div>
            <div className="text-4xl font-extrabold text-high-contrast">458</div>
          </div>
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-green-500/20 rounded-xl text-green-400">
                <History size={24} />
              </span>
              <span className="text-muted-contrast text-sm font-medium">Successful Runs</span>
            </div>
            <div className="text-4xl font-extrabold text-high-contrast">89%</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass p-8">
          <h2 className="text-2xl font-bold text-high-contrast mb-8">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-5">
                  <div className={`w-3.5 h-3.5 rounded-full shadow-lg ${i === 2 ? 'bg-red-500 shadow-red-500/50' : 'bg-green-500 shadow-green-500/50'}`} />
                  <div>
                    <div className="font-semibold text-high-contrast text-lg">Test Run #{i}245 - E-commerce App</div>
                    <div className="text-sm text-muted-contrast">2 hours ago</div>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline transition-all">View details</button>
              </div>
            ))}
          </div>
        </div>
      </main>
      </div>
    </AuthGuard>
  );
}
