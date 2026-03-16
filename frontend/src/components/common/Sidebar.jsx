import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, History, Settings, LogOut, X, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../../lib/store";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, systemLanguage, theme, toggleTheme } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const translations = {
    vi: {
      dashboard: "Bảng điều khiển",
      projects: "Dự án",
      runs: "Lượt chạy gần đây",
      settings: "Cài đặt",
      logout: "Đăng xuất"
    },
    en: {
      dashboard: "Dashboard",
      projects: "Projects",
      runs: "Latest Runs",
      settings: "Settings",
      logout: "Log Out"
    }
  };

  const t = translations[systemLanguage || 'vi'];

  const navItems = [
    { label: t.dashboard, icon: LayoutDashboard, href: "/dashboard" },
    { label: t.projects, icon: FolderKanban, href: "/projects" },
    { label: t.runs, icon: History, href: "/runs" },
    { label: t.settings, icon: Settings, href: "/admin/settings" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-50
        w-64 h-screen 
        bg-[var(--sidebar-bg)] border-r border-white/5 
        p-6 flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex justify-between items-center mb-10">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
            Testing Assistant
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? "text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={20} /> {item.label}
              </a>
            );
          })}
        </nav>

        <div className="space-y-3 mt-auto">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-muted-contrast hover:text-high-contrast hover:bg-white/5 w-full text-left"
          >
            {theme === "dark" ? (
              <><Sun size={20} /> Light Mode</>
            ) : (
              <><Moon size={20} /> Dark Mode</>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 hover:bg-red-400/10 p-3 rounded-xl transition-all font-bold w-full text-left"
          >
            <LogOut size={20} /> {t.logout}
          </button>
        </div>
      </aside>
    </>
  );
}
