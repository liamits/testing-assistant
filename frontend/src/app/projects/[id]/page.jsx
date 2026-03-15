"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ChevronRight, FileText, CheckCircle, AlertCircle, Play, Trash2, Edit, BrainCircuit, GripVertical, Download, LogOut } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../../lib/api";
import { toast } from "react-hot-toast";
import AddTestCaseModal from "../../../components/testcases/AddTestCaseModal";
import EditTestCaseModal from "../../../components/testcases/EditTestCaseModal";
import DeleteConfirmationModal from "../../../components/common/DeleteConfirmationModal";
import { StrictModeDroppable } from "../../../components/common/StrictModeDroppable";
import AuthGuard from "../../../components/common/AuthGuard";
import { useAuthStore } from "../../../lib/store";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const [project, setProject] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("happy");
  const [selectedParentId, setSelectedParentId] = useState(null);
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

  const openModal = (category, parentId = null) => {
    setModalCategory(category);
    setSelectedParentId(parentId);
    setIsModalOpen(true);
  };

  const handleEditTestCase = (tc) => {
    setSelectedTestCase(tc);
    setIsEditModalOpen(true);
  };

  const handleGenerateAI = async (tc) => {
    if (!tc.screenshotUrl) {
      toast.error("Vui lòng tải ảnh lên trước khi tạo test case tự động!");
      return;
    }

    const toastId = toast.loading("AI đang quét ảnh...");
    try {
      const res = await api.post(`/testcases/${tc._id}/generate-ai`);
      toast.success(res.data.message || "Đã tạo test case thành công!", { id: toastId });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi quét AI", { id: toastId });
    }
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

  const handleExportExcel = async () => {
    const toastId = toast.loading("Đang chuẩn bị file Excel...");
    try {
      console.log("Starting Excel export for project:", id);
      const response = await api.get(`/projects/${id}/export`, {
        responseType: 'blob',
      });
      
      console.log("Direct response headers:", response.headers);
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Testcases_${(project?.name || 'Project')}.xlsx`.replace(/\s+/g, '_');
      
      if (contentDisposition) {
        // Try filename* (UTF-8) first, then standard filename
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
        const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
        
        if (filenameStarMatch && filenameStarMatch[1]) {
          fileName = decodeURIComponent(filenameStarMatch[1]);
        } else if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1];
        }
      }

      console.log("Determined fileName:", fileName);
      console.log("Response data type:", response.data.constructor.name);
      console.log("Blob size:", response.data.size);
      
      // Ensure the blob has the correct Excel MIME type
      const excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([response.data], { type: excelType });
      
      console.log("Final Blob type:", blob.type);
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', fileName);
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      // Extended cleanup
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 2000);
      
      toast.success("Đã tải xuống file Excel!", { id: toastId });
    } catch (err) {
      console.error("EXCEL EXPORT ERROR:", err);
      toast.error("Lỗi khi xuất file Excel", { id: toastId });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;
    
    if (type === "testcase") {
      const allItems = Array.from(testCases);
      const happy = allItems.filter(tc => !tc.parentId && tc.category === 'happy').sort((a,b) => (a.order||0) - (b.order||0));
      const unhappy = allItems.filter(tc => !tc.parentId && tc.category === 'unhappy').sort((a,b) => (a.order||0) - (b.order||0));
      
      const sourceList = source.droppableId === 'happy' ? happy : unhappy;
      const destList = destination.droppableId === 'happy' ? happy : unhappy;
      
      const [reorderedItem] = sourceList.splice(source.index, 1);
      
      if (source.droppableId !== destination.droppableId) {
        reorderedItem.category = destination.droppableId;
      }
      
      destList.splice(destination.index, 0, reorderedItem);

      // Re-calculate orders for affected lists
      const updatedOrders = [];
      happy.forEach((item, idx) => {
        item.order = idx;
        updatedOrders.push({ id: item._id, order: idx });
      });
      unhappy.forEach((item, idx) => {
        item.order = idx;
        updatedOrders.push({ id: item._id, order: idx });
      });

      setTestCases([...allItems]);

      try {
        await api.put("/testcases/reorder", { orders: updatedOrders });
        toast.success("Order updated");
      } catch (err) {
        console.error(err);
        toast.error("Failed to save order");
        fetchData();
      }
    } else if (type === "step") {
      const parentId = source.droppableId.replace("steps-", "");
      const allItems = Array.from(testCases);
      const children = allItems.filter(tc => tc.parentId === parentId).sort((a,b) => (a.order||0) - (b.order||0));
      
      const [reorderedStep] = children.splice(source.index, 1);
      children.splice(destination.index, 0, reorderedStep);

      const orders = children.map((item, index) => {
        item.order = index;
        return { id: item._id, order: index };
      });
      
      setTestCases([...allItems]);

      try {
        await api.put("/testcases/reorder", { orders });
      } catch (err) {
        console.error(err);
        fetchData();
      }
    }
  };

  const handleDelete = () => {
    confirmDeleteProject();
  };

  const happyCases = testCases.filter(tc => tc.category === 'happy' && !tc.parentId);
  const unhappyCases = testCases.filter(tc => tc.category === 'unhappy' && !tc.parentId);

  if (loading) return <div className="p-8 text-high-contrast">Loading...</div>;

  return (
    <AuthGuard>
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
           <button onClick={handleExportExcel} className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-2 font-bold uppercase text-sm shadow-lg shadow-green-500/20">
            <Download size={18} /> Export Excel
          </button>
           <button className="btn-secondary flex items-center gap-2">
            <Play size={18} /> Run All Tests
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500/10 transition-colors flex items-center gap-2 font-bold uppercase text-sm"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
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
            
            <StrictModeDroppable droppableId="happy" type="testcase">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3 min-h-[100px]"
                >
                  {happyCases.length > 0 ? (
                    happyCases.map((tc, index) => (
                      <Draggable key={tc._id} draggableId={tc._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? 'z-50' : ''}`}
                          >
                            <TestCaseCard 
                              testCase={tc} 
                              allCases={testCases} 
                              onEdit={handleEditTestCase}
                              onDelete={confirmDeleteTestCase}
                              onGenerateAI={handleGenerateAI}
                              onAddStep={() => openModal(tc.category, tc._id)}
                              dragHandleProps={provided.dragHandleProps}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No happy cases yet.</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
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

            <StrictModeDroppable droppableId="unhappy" type="testcase">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3 min-h-[100px]"
                >
                  {unhappyCases.length > 0 ? (
                    unhappyCases.map((tc, index) => (
                      <Draggable key={tc._id} draggableId={tc._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? 'z-50' : ''}`}
                          >
                            <TestCaseCard 
                              testCase={tc} 
                              allCases={testCases} 
                              onEdit={handleEditTestCase}
                              onDelete={confirmDeleteTestCase}
                              onGenerateAI={handleGenerateAI}
                              onAddStep={() => openModal(tc.category, tc._id)}
                              dragHandleProps={provided.dragHandleProps}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No unhappy cases yet.</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </section>
        </div>
      </DragDropContext>

      <AddTestCaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTestCaseCreated={fetchData}
        projectId={id}
        category={modalCategory}
        parentId={selectedParentId}
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
    </AuthGuard>
  );
}

function TestCaseCard({ testCase, allCases, onEdit, onDelete, onGenerateAI, onAddStep, dragHandleProps, isDragging }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const children = allCases.filter(c => c.parentId === testCase._id).sort((a, b) => (a.order||0) - (b.order||0));

  return (
    <div className={`group border rounded-xl overflow-hidden transition-all ${isDragging ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div {...dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing">
            <GripVertical size={16} />
          </div>
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
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onGenerateAI(testCase); }}
              className="p-1.5 hover:bg-purple-500/10 rounded-lg text-purple-400 transition-colors"
              title="Tạo test case tự động bằng AI"
            >
              <BrainCircuit size={16} />
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
          <StrictModeDroppable droppableId={`steps-${testCase._id}`} type="step">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {children.length > 0 ? (
                  children.map((child, idx) => (
                    <Draggable key={child._id} draggableId={child._id} index={idx}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group/step flex gap-3 text-sm p-2 rounded-lg transition-colors ${snapshot.isDragging ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-black/10 hover:bg-white/5'}`}
                        >
                          <div {...provided.dragHandleProps} className="text-slate-700 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                            <GripVertical size={14} />
                          </div>
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
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic p-2">No steps yet. Use AI or add manually.</div>
                )}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>

          <button 
            onClick={(e) => { e.stopPropagation(); onAddStep(); }}
            className="w-full mt-2 p-2 border border-dashed border-white/10 rounded-lg text-xs text-muted-contrast hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Manual Step
          </button>
        </div>
      )}
    </div>
  );
}
