"use client";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, History, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../../lib/store";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Projects", icon: FolderKanban, href: "/projects" },
    { label: "Latest Runs", icon: History, href: "/runs" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <aside className="w-64 border-r border-[#1e293b] p-6 hidden md:block flex flex-col bg-[#0b0e14] h-screen sticky top-0">
      <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-10 tracking-tight">
        Testing Assistant
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

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 text-red-400 hover:bg-red-400/10 p-3 rounded-xl transition-all font-bold mt-auto w-full text-left"
      >
        <LogOut size={20} /> Log Out
      </button>
    </aside>
  );
}
