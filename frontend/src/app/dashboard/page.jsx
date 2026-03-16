"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../lib/store";
import { FolderKanban, FlaskConical, History, Plus } from "lucide-react";
import AuthGuard from "../../components/common/AuthGuard";
import Sidebar from "../../components/common/Sidebar";
import MobileNav from "../../components/common/MobileNav";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function DashboardPage() {
  const { user, systemLanguage } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ 
    totalProjects: 0, 
    activeTestCases: 0, 
    successPercentage: 0, 
    recentActivity: [] 
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/projects/dashboard/stats");
        setStats(data);
      } catch (err) {
        console.error("Fetch stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatRelativeTime = (dateString, lang) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return lang === 'vi' ? 'vừa xong' : 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}${lang === 'vi' ? ' phút' : 'm'} ${lang === 'vi' ? 'trước' : 'ago'}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}${lang === 'vi' ? ' giờ' : 'h'} ${lang === 'vi' ? 'trước' : 'ago'}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}${lang === 'vi' ? ' ngày' : 'd'} ${lang === 'vi' ? 'trước' : 'ago'}`;
    
    return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
  };

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
      <div className="flex flex-col md:flex-row bg-[var(--bg-main)] min-h-screen">
        <MobileNav onOpenSidebar={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-high-contrast">{t.welcome} {user?.name || "User"}!</h1>
              <p className="text-muted-contrast mt-1 text-base md:text-lg">{t.subtitle}</p>
            </div>
            <button className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
              <Plus size={18} /> {t.newProject}
            </button>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                  <FolderKanban size={24} />
                </span>
                <span className="text-muted-contrast text-sm font-medium">{t.totalProjects}</span>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-high-contrast">
                {loading ? <span className="animate-pulse text-slate-500">...</span> : stats.totalProjects}
              </div>
            </div>
            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                  <FlaskConical size={24} />
                </span>
                <span className="text-muted-contrast text-sm font-medium">{t.activeTestCases}</span>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-high-contrast">
                {loading ? <span className="animate-pulse text-slate-500">...</span> : stats.activeTestCases}
              </div>
            </div>
            <div className="glass p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-green-500/20 rounded-xl text-green-400">
                  <History size={24} />
                </span>
                <span className="text-muted-contrast text-sm font-medium">{t.successfulRuns}</span>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-high-contrast">
                {loading ? <span className="animate-pulse text-slate-500">...</span> : `${stats.successPercentage}%`}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-high-contrast mb-6 md:mb-8">{t.recentActivity}</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5"></div>
                  ))}
                </div>
              ) : stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, idx) => (
                  <div key={activity._id || idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-glass)] hover:bg-[var(--border-glass)] transition-colors gap-4">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className={`shrink-0 w-3 h-3 rounded-full shadow-lg ${activity.status === 'FAILED' ? 'bg-red-500 shadow-red-500/50' : 'bg-green-500 shadow-green-500/50'}`} />
                      <div>
                        <div className="font-semibold text-high-contrast text-base md:text-lg line-clamp-1">
                          {activity.name} - {activity.projectId?.name || "Project"}
                        </div>
                        <div className="text-xs md:text-sm text-muted-contrast">{formatRelativeTime(activity.createdAt, systemLanguage)}</div>
                      </div>
                    </div>
                    {/* <button onClick={() => router.push(`/projects/${activity.projectId?._id}`)} className="text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline transition-all text-sm">{t.viewDetails}</button> */}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-contrast border border-dashed border-[var(--border-glass)] rounded-xl">
                  {systemLanguage === 'vi' ? 'Chưa có hoạt động nào gần đây.' : 'No recent activity.'}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
