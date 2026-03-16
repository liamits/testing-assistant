import { Project } from "../../models/Project.js";
import { TestCase } from "../../models/TestCase.js";
import { TestRun } from "../../models/TestRun.js";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

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

    const templatePath = path.resolve("../frontend/document/testcasse.xlsx");
    
    const workbook = new ExcelJS.Workbook();
    
    if (fs.existsSync(templatePath)) {
      await workbook.xlsx.readFile(templatePath);
    } else {
      console.warn("Template file not found at:", templatePath);
      workbook.addWorksheet("Test Cases");
    }

    const worksheet = workbook.getWorksheet(1) || workbook.addWorksheet("Test Cases");
    
    // Group children by category (Happy first, then Unhappy)
    const happyChildren = testCases.filter(tc => tc.parentId && tc.category === 'happy');
    const unhappyChildren = testCases.filter(tc => tc.parentId && tc.category === 'unhappy');
    
    // If there are no children (only parents), use all test cases
    const exportData = (happyChildren.length || unhappyChildren.length) 
      ? [...happyChildren, ...unhappyChildren] 
      : testCases;

    fillTemplateSheet(worksheet, exportData);

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

function fillTemplateSheet(worksheet, cases) {
  const startRow = 2; // Data starts from Row 2
  const numCases = cases.length;
  const currentRowCount = worksheet.rowCount;

  // 1. Manage Rows: If we have fewer cases than existing rows (excluding header), delete extras.
  // Template has ~1127 rows. We want to keep only numCases + 1 (header).
  if (currentRowCount > startRow + numCases - 1) {
    const rowsToDelete = currentRowCount - (startRow + numCases - 1);
    worksheet.spliceRows(startRow + numCases, rowsToDelete);
  }

  // 2. Clear dummy data in Row 2 if any (Row 2 is where we start)
  // Usually spliceRows handles this if we wanted to be perfectly clean, 
  // but we can just overwrite.

  cases.forEach((tc, idx) => {
    const rowNumber = startRow + idx;
    const row = worksheet.getRow(rowNumber);
    
    // Mapping based on inspect_result.txt and USER feedback
    // Col A (1): No.
    // Col B (2): Title
    // Col F (6): Severity
    // Col G (7): Steps
    // Col I (9): Expected results
    // Col J (10): Status (Test)
    // Col L (12): Note / Evidence (We'll put Severity text here too or just Note)

    row.getCell('A').value = idx + 1; // No.
    row.getCell('B').value = tc.title; // Title
    
    // Severity must be in Column F (6)
    // Map priority (LOW/MEDIUM/HIGH/CRITICAL) to Title Case (High, Medium, Low)
    const priority = tc.priority || 'MEDIUM';
    row.getCell('F').value = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase(); 
    
    // Steps must be in Column G (7)
    row.getCell('G').value = tc.flow || (tc.steps?.map(s => `${s.stepNumber}. ${s.action}`).join('\n')); 
    
    // Expected results in Column I (9)
    row.getCell('I').value = tc.expectedResult; 
    
    // Status (Test) in Column J (10) - User requested to leave it empty
    row.getCell('J').value = ''; 

    // Description is NOT filled as per user request ("Mô tả thì ko cần điền vào mẫu")
    
    // Optional: Note / Evidence in Column L (12)
    // row.getCell('L').value = ''; 

    // Apply borders and alignment to ensure consistency
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 12) { // Only for our data columns
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });

    row.commit();
  });
}
