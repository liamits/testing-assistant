"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../lib/store";
import { FolderKanban, FlaskConical, History, Plus } from "lucide-react";
import AuthGuard from "../../components/common/AuthGuard";
import Sidebar from "../../components/common/Sidebar";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, systemLanguage } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ projects: 0, testCases: 0, runs: 0 });

  const translations = {
    vi: {
      welcome: "Chào mừng trở lại,",
      subtitle: "Dưới đây là những gì đang diễn ra với các dự án của bạn hôm nay.",
      newProject: "Dự án mới",
      totalProjects: "Tổng số dự án",
      activeTestCases: "Số kịch bản kiểm thử",
      successfulRuns: "Lượt chạy thành công",
      recentActivity: "Hoạt động gần đây",
      viewDetails: "Xem chi tiết"
    },
    en: {
      welcome: "Welcome back,",
      subtitle: "Here's what's happening with your projects today.",
      newProject: "New Project",
      totalProjects: "Total Projects",
      activeTestCases: "Active Test Cases",
      successfulRuns: "Successful Runs",
      recentActivity: "Recent Activity",
      viewDetails: "View Details"
    }
  };

  const t = translations[systemLanguage || 'vi'];


  return (
    <AuthGuard>
      <div className="flex bg-[#0b0e14]">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
           <div>
            <h1 className="text-3xl font-bold text-high-contrast">{t.welcome} {user?.name || "User"}!</h1>
            <p className="text-muted-contrast mt-1 text-lg">{t.subtitle}</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} /> {t.newProject}
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <FolderKanban size={24} />
              </span>
              <span className="text-muted-contrast text-sm font-medium">{t.totalProjects}</span>
            </div>
            <div className="text-4xl font-extrabold text-high-contrast">12</div>
          </div>
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <FlaskConical size={24} />
              </span>
              <span className="text-muted-contrast text-sm font-medium">{t.activeTestCases}</span>
            </div>
            <div className="text-4xl font-extrabold text-high-contrast">458</div>
          </div>
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-green-500/20 rounded-xl text-green-400">
                <History size={24} />
              </span>
              <span className="text-muted-contrast text-sm font-medium">{t.successfulRuns}</span>
            </div>
            <div className="text-4xl font-extrabold text-high-contrast">89%</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass p-8">
                <h2 className="text-2xl font-bold text-high-contrast mb-8">{t.recentActivity}</h2>
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
                <button className="text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline transition-all">{t.viewDetails}</button>
              </div>
            ))}
          </div>
        </div>
      </main>
      </div>
    </AuthGuard>
  );
}
