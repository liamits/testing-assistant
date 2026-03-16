import { Project } from "../../models/Project.js";
import { TestCase } from "../../models/TestCase.js";
import { TestRun } from "../../models/TestRun.js";
import ExcelJS from "exceljs";

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean();
    
    // Thêm count manually hoặc dùng aggregate nếu cần hiệu năng cao
    const projectsWithCount = await Promise.all(projects.map(async (p) => {
      const testCaseCount = await TestCase.countDocuments({ projectId: p._id });
      const testRunCount = await TestRun.countDocuments({ projectId: p._id });
      return { ...p, id: p._id, _count: { testCases: testCaseCount, testRuns: testRunCount } };
    }));

    res.json(projectsWithCount);
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });

    const testCases = await TestCase.find({ projectId: project._id }).sort({ createdAt: -1 });
    const testRuns = await TestRun.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(10);

    res.json({ ...project, id: project._id, testCases, testRuns });
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description, baseUrl, defaultLanguage } = req.body;
    if (!name || !baseUrl) {
      return res.status(400).json({ message: "Project Name and Base URL are required" });
    }

    const project = new Project({ 
      name, 
      description, 
      baseUrl,
      userId: req.user.id,
      defaultLanguage: defaultLanguage || 'vi'
    });
    
    await project.save();
    res.status(201).json({ ...project.toObject(), id: project._id });
  } catch (err) {
    console.error("Error in createProject:", err);
    if (typeof next === "function") {
      next(err);
    } else {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { name, description, baseUrl, defaultLanguage } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, description, baseUrl, defaultLanguage },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ ...project.toObject(), id: project._id });
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await Project.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Project not found" });
    
    // Optionally delete related testcases and testruns
    await TestCase.deleteMany({ projectId: req.params.id });
    await TestRun.deleteMany({ projectId: req.params.id });

    res.json({ message: "Deleted" });
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const exportProjectTestCases = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });

    const testCases = await TestCase.find({ projectId: project._id }).sort({ order: 1, createdAt: 1 }).lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Test Cases");
    
    // Group children by category (Happy first, then Unhappy)
    const happyChildren = testCases.filter(tc => tc.parentId && tc.category === 'happy');
    const unhappyChildren = testCases.filter(tc => tc.parentId && tc.category === 'unhappy');
    
    // If there are no children (only parents), use all test cases
    const exportData = (happyChildren.length || unhappyChildren.length) 
      ? [...happyChildren, ...unhappyChildren] 
      : testCases;

    setupSheet(worksheet, exportData);

    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `Testcases_${project.name.replace(/\s+/g, '_')}.xlsx`;
    const encodedFilename = encodeURIComponent(filename).replace(/['()]/g, escape).replace(/\*/g, '%2A');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Length', buffer.length);

    res.status(200).send(buffer);

  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

function setupSheet(worksheet, cases) {
  worksheet.columns = [
    { header: 'No.', key: 'no', width: 8 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Big function', key: 'bigFunc', width: 15 },
    { header: 'Medium function', key: 'medFunc', width: 15 },
    { header: 'Small function', key: 'smallFunc', width: 15 },
    { header: 'Scenario', key: 'scenario', width: 30 },
    { header: 'Test case ID', key: 'id', width: 15 },
    { header: 'Test step', key: 'step', width: 10 },
    { header: 'Prerequisites', key: 'prereq', width: 20 },
    { header: 'Test Data', key: 'data', width: 15 },
    { header: 'Test Steps', key: 'steps', width: 40 },
    { header: 'Expected Results', key: 'expected', width: 40 },
    { header: 'Status (Test)', key: 'status', width: 15 },
    { header: 'Evidence (Dev)', key: 'evidDev', width: 15 },
    { header: 'Note / Evidence', key: 'note', width: 25 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 30;

  cases.forEach((tc, idx) => {
    worksheet.addRow({
      no: idx + 1,
      title: tc.title,
      scenario: tc.description,
      steps: tc.flow,
      expected: tc.expectedResult,
      status: 'READY'
    });
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  });
}
