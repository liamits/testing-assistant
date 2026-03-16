"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, MoreVertical, Plus, Search, Filter, Trash2, Edit, LogOut } from "lucide-react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import EditProjectModal from "../../components/projects/EditProjectModal";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import AuthGuard from "../../components/common/AuthGuard";
import Sidebar from "../../components/common/Sidebar";
import MobileNav from "../../components/common/MobileNav";
import { useAuthStore } from "../../lib/store";

export default function ProjectsPage() {
  const { logout, systemLanguage } = useAuthStore();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const translations = {
    vi: {
      title: "Dự án",
      createProject: "Tạo dự án mới",
      searchPlaceholder: "Tìm kiếm dự án theo tên...",
      filters: "Lọc",
      scenariosCount: "kịch bản kiểm thử",
      modified: "Cập nhật",
      ago: "trước",
      emptyTitle: "Không tìm thấy dự án",
      emptySubtitle: "Danh sách dự án của bạn đang trống. Hãy bắt đầu tạo dự án đầu tiên.",
      initializeProject: "Khởi tạo dự án",
      editProject: "Chỉnh sửa dự án",
      deleteProject: "Xóa dự án",
      loadingText: "Đang tải dữ liệu dự án..."
    },
    en: {
      title: "Projects",
      createProject: "Create Project",
      searchPlaceholder: "Search projects by name...",
      filters: "Filters",
      scenariosCount: "test scenarios",
      modified: "Modified",
      ago: "ago",
      emptyTitle: "Void Detected",
      emptySubtitle: "Your project landscape is empty. Let's seed your first testing environment.",
      initializeProject: "Initialize Project",
      editProject: "Edit Project",
      deleteProject: "Delete Project",
      loadingText: "Crunching project data..."
    }
  };

  const t = translations[systemLanguage || 'vi'];
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/projects/${deleteId}`);
      toast.success("Project deleted");
      setIsDeleteModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete project");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row bg-[var(--bg-main)] min-h-screen">
        <MobileNav onOpenSidebar={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-high-contrast tracking-tight">{t.title}</h1>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6 w-full sm:w-auto justify-center">
              <Plus size={20} strokeWidth={3} /> {t.createProject}
            </button>
          </header>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 md:mb-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-contrast group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 pl-12 pr-4 text-high-contrast placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-base md:text-lg" 
              />
            </div>
            <button className="glass px-6 py-3 sm:py-0 flex items-center gap-2 text-high-contrast font-bold hover:bg-white/10 transition-colors justify-center">
              <Filter size={20} /> {t.filters}
            </button>
          </div>

          {/* Project Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4">
              <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <div className="text-muted-contrast text-base md:text-lg font-medium">{t.loadingText}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.length > 0 ? projects.map((p) => (
                <div 
                  key={p.id || p._id} 
                  onClick={() => router.push(`/projects/${p.id || p._id}`)}
                  className="glass p-6 md:p-8 hover:transform hover:-translate-y-1 transition-all duration-300 border-white/5 group hover:border-blue-500/30 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 md:p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                    <FolderKanban size={28} strokeWidth={2.5} />
                  </div>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === (p.id || p._id) ? null : (p.id || p._id));
                        }}
                        className="text-muted-contrast hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <MoreVertical size={24} />
                    </button>
                      
                      {openMenuId === (p.id || p._id) && (
                        <div className="absolute right-0 mt-2 w-44 md:w-48 glass border-white/10 shadow-2xl z-10 py-2 animate-fade overflow-hidden">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(p);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-high-contrast hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <Edit size={16} className="text-blue-400" /> {t.editProject}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id || p._id, p.name);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                          >
                            <Trash2 size={16} /> {t.deleteProject}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-high-contrast mb-2 md:mb-3 tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">{p.name}</h3>
                  <p className="text-muted-contrast text-sm md:text-base leading-relaxed line-clamp-2 mb-6 md:mb-8 font-medium">
                    {p.description || "Establish a robust foundation for this testing project."}
                  </p>
                  <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs md:text-sm text-blue-400 font-bold bg-blue-500/10 px-2 md:px-3 py-1 rounded-full border border-blue-500/10">
                        {p._count?.testCases || 0} {t.scenariosCount}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-500 font-semibold italic">
                      {t.modified} 2h {t.ago}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="col-span-full glass p-12 md:p-24 text-center border-dashed border-white/10 flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-600">
                    <FolderKanban size={40} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-high-contrast mb-3">{t.emptyTitle}</h2>
                  <p className="text-muted-contrast text-base md:text-lg mb-8 md:mb-10 max-w-md mx-auto">
                    {t.emptySubtitle}
                  </p>
                  <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl">
                    <Plus size={24} strokeWidth={3} /> {t.initializeProject}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <CreateProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onProjectCreated={fetchProjects}
        />

        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProjectUpdated={fetchProjects}
          project={selectedProject}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteName}"? All associated data will be permanently removed.`}
          loading={deleteLoading}
        />
      </div>
    </AuthGuard>
  );
}
