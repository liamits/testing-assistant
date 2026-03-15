"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ChevronRight, FileText, CheckCircle, AlertCircle, Play, MoreVertical, Trash2, Edit } from "lucide-react";
import api from "../../../lib/api";
import { toast } from "react-hot-toast";
import AddTestCaseModal from "../../../components/testcases/AddTestCaseModal";
import EditTestCaseModal from "../../../components/testcases/EditTestCaseModal";
import DeleteConfirmationModal from "../../../components/common/DeleteConfirmationModal";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("happy");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'project' | 'testcase', id: string, name: string }
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    console.log("Fetching project data for ID:", id);
    try {
      const [pRes, tcRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/testcases/project/${id}`)
      ]);
      console.log("Project Response:", pRes.data);
      console.log("TestCases Response:", tcRes.data);
      setProject(pRes.data);
      setTestCases(tcRes.data);
    } catch (err) {
      console.error("Fetch Data Error:", err);
      toast.error("Failed to fetch project details");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category) => {
    setModalCategory(category);
    setIsModalOpen(true);
  };

  const handleEditTestCase = (tc) => {
    setSelectedTestCase(tc);
    setIsEditModalOpen(true);
  };

  const confirmDeleteProject = () => {
    setDeleteTarget({ type: 'project', id: id, name: project?.name });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTestCase = (tc) => {
    setDeleteTarget({ type: 'testcase', id: tc._id, name: tc.title });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'project') {
        console.log("Deleting project:", deleteTarget.id);
        await api.delete(`/projects/${deleteTarget.id}`);
        toast.success("Project deleted");
        router.push("/projects");
      } else {
        console.log("Deleting test case:", deleteTarget.id);
        await api.delete(`/testcases/${deleteTarget.id}`);
        toast.success("Test case deleted");
        fetchData();
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`Failed to delete ${deleteTarget.type}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = () => {
    confirmDeleteProject();
  };

  const happyCases = testCases.filter(tc => tc.category === 'happy' && !tc.parentId);
  const unhappyCases = testCases.filter(tc => tc.category === 'unhappy' && !tc.parentId);

  if (loading) return <div className="p-8 text-high-contrast">Loading...</div>;

  return (
    <div className="p-8 space-y-8 animate-fade">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-high-contrast mb-2">{project?.name}</h1>
          <p className="text-muted-contrast max-w-2xl">{project?.description}</p>
        </div>
        <div className="flex gap-4">
           <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500/10 transition-colors flex items-center gap-2 font-bold uppercase text-sm">
            <Trash2 size={18} /> Delete Project
          </button>
           <button className="btn-secondary flex items-center gap-2">
            <Play size={18} /> Run All Tests
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Happy Cases Section */}
        <section className="glass p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-green-400">
              <CheckCircle size={20} /> Happy Cases
            </h2>
            <button 
              onClick={() => openModal("happy")}
              className="p-2 hover:bg-white/5 rounded-lg text-muted-contrast transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-3">
            {happyCases.length > 0 ? (
              happyCases.map(tc => (
                <TestCaseCard 
                  key={tc._id} 
                  testCase={tc} 
                  allCases={testCases} 
                  onEdit={handleEditTestCase}
                  onDelete={confirmDeleteTestCase}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No happy cases yet.</p>
            )}
          </div>
        </section>

        {/* Unhappy Cases Section */}
        <section className="glass p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-400">
              <AlertCircle size={20} /> Unhappy Cases
            </h2>
            <button 
              onClick={() => openModal("unhappy")}
              className="p-2 hover:bg-white/5 rounded-lg text-muted-contrast transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {unhappyCases.length > 0 ? (
              unhappyCases.map(tc => (
                <TestCaseCard 
                  key={tc._id} 
                  testCase={tc} 
                  allCases={testCases} 
                  onEdit={handleEditTestCase}
                  onDelete={confirmDeleteTestCase}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No unhappy cases yet.</p>
            )}
          </div>
        </section>
      </div>

      <AddTestCaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTestCaseCreated={fetchData}
        projectId={id}
        category={modalCategory}
      />

      <EditTestCaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTestCaseUpdated={fetchData}
        testCase={selectedTestCase}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type === 'project' ? 'Project' : 'Test Case'}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action will remove all associated data and cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}

function TestCaseCard({ testCase, allCases, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const children = allCases.filter(c => c.parentId === testCase._id);

  return (
    <div className="group border border-white/5 bg-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${testCase.category === 'happy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <FileText size={18} />
          </div>
          <div>
            <h4 className="font-bold text-high-contrast group-hover:text-blue-400 transition-colors uppercase">
              {testCase.title}
            </h4>
            <p className="text-xs text-muted-contrast line-clamp-1">{testCase.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(testCase); }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(testCase); }}
              className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
          {children.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-muted-contrast uppercase">
              {children.length} steps
            </span>
          )}
          <ChevronRight 
            size={18} 
            className={`text-muted-contrast transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-4 bg-black/20 animate-slide-down">
          {children.length > 0 ? (
            children.map((child, idx) => (
              <div key={child._id} className="group/step flex gap-3 text-sm p-2 hover:bg-white/5 rounded-lg transition-colors">
                <span className="text-slate-500 font-mono w-4">{idx + 1}.</span>
                <div>
                  <div className="text-high-contrast font-medium">{child.title}</div>
                  <div className="text-muted-contrast text-xs">{child.expectedResult}</div>
                </div>
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/step:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(child); }}
                    className="p-1 hover:bg-white/10 rounded text-blue-400/70 hover:text-blue-400"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(child); }}
                    className="p-1 hover:bg-red-500/10 rounded text-red-400/70 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 italic p-2">Generating children test cases...</div>
          )}
        </div>
      )}
    </div>
  );
}
