"use client";
import { useState, useEffect } from "react";
import { Save, User, Lock, Globe, Shield, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../../lib/store";
import AuthGuard from "../../../components/common/AuthGuard";
import Sidebar from "../../../components/common/Sidebar";
import { toast } from "react-hot-toast";

export default function AdminSettingsPage() {
  const { systemLanguage, updateSystemLanguage, fetchSettings, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // UI-only state for profile/security
  const [profileData, setProfileData] = useState({
    username: user?.name || "Admin",
    email: user?.email || "admin@example.com",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLanguageChange = async (lang) => {
    setLoading(true);
    await updateSystemLanguage(lang);
    setLoading(false);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    toast.success("Hồ sơ đã được lưu (Demo)");
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      return toast.error("Mật khẩu mới không khớp");
    }
    toast.success("Mật khẩu đã được cập nhật (Demo)");
    setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <AuthGuard>
      <div className="flex bg-[#0b0e14]">
        <Sidebar />
        <div className="flex-1 overflow-y-auto h-screen p-8 max-w-5xl mx-auto space-y-8 animate-fade">
        <header>
          <h1 className="text-4xl font-black text-high-contrast mb-2">Cài đặt hệ thống</h1>
          <p className="text-muted-contrast">Quản lý ngôn ngữ, tài khoản và bảo mật của bạn.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Nav */}
          <aside className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold ${activeTab === "general" ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "text-muted-contrast hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <Shield size={20} /> Chung
              </div>
              <ChevronRight size={16} className={activeTab === "general" ? "opacity-100" : "opacity-0"} />
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold ${activeTab === "profile" ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "text-muted-contrast hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <User size={20} /> Hồ sơ
              </div>
              <ChevronRight size={16} className={activeTab === "profile" ? "opacity-100" : "opacity-0"} />
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold ${activeTab === "security" ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "text-muted-contrast hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <Lock size={20} /> Bảo mật
              </div>
              <ChevronRight size={16} className={activeTab === "security" ? "opacity-100" : "opacity-0"} />
            </button>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "general" && (
              <div className="glass p-8 space-y-8 animate-slide">
                <div>
                  <h2 className="text-2xl font-bold text-high-contrast mb-6 flex items-center gap-3">
                    <Globe className="text-blue-400" /> Ngôn ngữ hệ thống
                  </h2>
                  <p className="text-muted-contrast mb-6">Chọn ngôn ngữ mặc định cho toàn bộ ứng dụng và AI hỗ trợ.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleLanguageChange("vi")}
                      disabled={loading}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-2 items-start ${systemLanguage === "vi" ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-white/5 hover:border-white/10"}`}
                    >
                      <span className="text-2xl font-bold text-high-contrast">Tiếng Việt</span>
                      <span className="text-sm text-muted-contrast uppercase tracking-widest font-bold">Mặc định</span>
                    </button>
                    <button 
                      onClick={() => handleLanguageChange("en")}
                      disabled={loading}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-2 items-start ${systemLanguage === "en" ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-white/5 hover:border-white/10"}`}
                    >
                      <span className="text-2xl font-bold text-high-contrast">English</span>
                      <span className="text-sm text-muted-contrast uppercase tracking-widest font-bold">Quốc tế</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit} className="glass p-8 space-y-6 animate-slide">
                <h2 className="text-2xl font-bold text-high-contrast mb-6 flex items-center gap-3">
                  <User className="text-purple-400" /> Thông tin cá nhân
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-muted-contrast mb-2">Tên hiển thị</label>
                    <input 
                      type="text" 
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-contrast mb-2">Email</label>
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2 px-6">
                  <Save size={18} /> Lưu thay đổi
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handleSecuritySubmit} className="glass p-8 space-y-6 animate-slide">
                <h2 className="text-2xl font-bold text-high-contrast mb-6 flex items-center gap-3">
                  <Lock className="text-red-400" /> Bảo mật & Mật khẩu
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-muted-contrast mb-2">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-muted-contrast mb-2">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-muted-contrast mb-2">Xác nhận mật khẩu</label>
                      <input 
                        type="password" 
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-high-contrast focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2 px-6">
                  <Lock size={18} /> Cập nhật mật khẩu
                </button>
              </form>
            )}
          </div>
        </div>
        </div>
      </div>
    </AuthGuard>
  );
}
