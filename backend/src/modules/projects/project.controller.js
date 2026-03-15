import { Project } from "../../models/Project.js";
import { TestCase } from "../../models/TestCase.js";
import { TestRun } from "../../models/TestRun.js";

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
    const { name, description, baseUrl } = req.body;
    if (!name || !baseUrl) {
      return res.status(400).json({ message: "Project Name and Base URL are required" });
    }

    const project = new Project({ 
      name, 
      description, 
      baseUrl,
      userId: req.user.id 
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
    const { name, description, baseUrl } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, description, baseUrl },
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
