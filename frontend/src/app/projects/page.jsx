import { FolderKanban, MoreVertical, Plus, Search, Filter, Trash2, Edit, LogOut } from "lucide-react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import EditProjectModal from "../../components/projects/EditProjectModal";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import AuthGuard from "../../components/common/AuthGuard";
import { useAuthStore } from "../../lib/store";

export default function ProjectsPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
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
    console.log("handleConfirmDelete initiated for project ID:", deleteId);
    try {
      console.log("Calling API to delete project:", deleteId);
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
      <div className="flex h-screen bg-transparent">
      {/* Sidebar - unified with dashboard theme */}
      <aside className="w-64 border-r border-white/5 p-6 hidden md:block glass rounded-none flex flex-col">
        <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-12 tracking-tight">
          TEST ASSIST
        </div>
        <nav className="space-y-3 flex-1">
          <a href="/dashboard" className="flex items-center gap-3 text-muted-contrast hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all font-medium">
            <FolderKanban size={20} /> Dashboard
          </a>
          <a href="/projects" className="flex items-center gap-3 text-white bg-blue-500/20 p-3 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/10 font-bold">
            <FolderKanban size={20} /> Projects
          </a>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:bg-red-400/10 p-3 rounded-xl transition-all font-bold mt-auto w-full text-left"
        >
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-high-contrast tracking-tight">Projects</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
            <Plus size={20} strokeWidth={3} /> Create Project
          </button>
        </header>

        {/* Filters & Search */}
        <div className="flex gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-contrast group-focus-within:text-blue-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search projects by name..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-high-contrast placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-lg" 
            />
          </div>
          <button className="glass px-6 flex items-center gap-2 text-high-contrast font-bold hover:bg-white/10 transition-colors">
            <Filter size={20} /> Filters
          </button>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <div className="text-muted-contrast text-lg font-medium">Crunching project data...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.length > 0 ? projects.map((p) => (
              <div 
                key={p.id || p._id} 
                onClick={() => router.push(`/projects/${p.id || p._id}`)}
                className="glass p-8 hover:transform hover:-translate-y-1 transition-all duration-300 border-white/5 group hover:border-blue-500/30 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
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
                      <div className="absolute right-0 mt-2 w-48 glass border-white/10 shadow-2xl z-10 py-2 animate-fade overflow-hidden">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(p);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-high-contrast hover:bg-white/5 flex items-center gap-3 transition-colors"
                        >
                          <Edit size={16} className="text-blue-400" /> Edit Project
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id || p._id, p.name);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 size={16} /> Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-high-contrast mb-3 tracking-tight group-hover:text-blue-400 transition-colors">{p.name}</h3>
                <p className="text-muted-contrast text-base leading-relaxed line-clamp-2 mb-8 font-medium">
                  {p.description || "Establish a robust foundation for this testing project."}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10">
                      {p._count?.testCases || 0} Test Scenarios
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold italic">
                    Modified 2h ago
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-full glass p-24 text-center border-dashed border-white/10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-600">
                  <FolderKanban size={40} />
                </div>
                <h2 className="text-2xl font-bold text-high-contrast mb-3">Void Detected</h2>
                <p className="text-muted-contrast text-lg mb-10 max-w-md mx-auto">
                  Your project landscape is empty. Let's seed your first testing environment.
                </p>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-8 py-4 text-xl">
                  <Plus size={24} strokeWidth={3} /> Initialize Project
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
