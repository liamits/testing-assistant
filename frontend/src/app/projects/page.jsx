"use client";
import { useEffect, useState } from "react";
import { FolderKanban, MoreVertical, Plus, Search, Filter } from "lucide-react";
import api from "../../lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/projects");
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex h-screen bg-[#0b0e14]">
      {/* Sidebar - same as dashboard for now */}
      <aside className="w-64 border-r border-[#1e293b] p-6 hidden md:block">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-10">
          Testing Assistant
        </div>
        <nav className="space-y-4">
          <a href="/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white p-3 transition-colors">
            <FolderKanban size={20} /> Dashboard
          </a>
          <a href="/projects" className="flex items-center gap-3 text-blue-400 bg-blue-500/10 p-3 rounded-lg">
            <FolderKanban size={20} /> Projects
          </a>
          {/* ... other nav items */}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Projects</h1>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Project
          </button>
        </header>

        {/* Filters & Search */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" placeholder="Search projects..." className="input-field pl-10" />
          </div>
          <button className="glass px-4 flex items-center gap-2 text-gray-400">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? projects.map((p) => (
              <div key={p.id} className="glass p-6 hover:border-blue-500/50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                    <FolderKanban size={24} />
                  </div>
                  <button className="text-gray-500 hover:text-white">
                    <MoreVertical size={20} />
                  </button>
                </div>
                <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                  {p.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-blue-400 font-medium px-2 py-1 bg-blue-500/10 rounded">
                    {p._count?.testCases || 0} Test Cases
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated 2h ago
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-full glass p-20 text-center">
                <div className="text-gray-400 text-lg mb-4">No projects found</div>
                <button className="btn-primary mx-auto">Click here to create your first project</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
