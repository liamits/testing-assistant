import { TestCase } from "../../models/TestCase.js";
import { generateTestCases } from "../../services/ai.service.js";

export const getTestCases = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { category, search } = req.query;

    const query = { projectId };
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    const testCases = await TestCase.find(query).sort({ createdAt: -1 });
    res.json(testCases);
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const getTestCase = async (req, res, next) => {
  try {
    const tc = await TestCase.findById(req.params.id);
    if (!tc) return res.status(404).json({ message: "Not found" });
    res.json(tc);
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const createTestCase = async (req, res, next) => {
  try {
    const { projectId, title, description, flow, category, parentId } = req.body;
    let screenshotUrl = "";
    if (req.file) {
      screenshotUrl = `/uploads/testcases/${req.file.filename}`;
    }

    const tc = await TestCase.create({
      projectId,
      title,
      description,
      flow,
      category,
      parentId,
      screenshotUrl
    });

    if (!parentId) {
      try {
        const childrenData = await generateTestCases({ title, description, flow, category });
        const children = childrenData.map(child => ({
          ...child,
          projectId,
          parentId: tc._id,
          category
        }));
        await TestCase.insertMany(children);
      } catch (aiErr) {
        console.error("AI Generation failed:", aiErr);
      }
    }

    res.status(201).json(tc);
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const bulkCreateTestCases = async (req, res, next) => {
  try {
    const { projectId, testCases } = req.body;
    const data = testCases.map((tc) => ({ ...tc, projectId }));
    const created = await TestCase.insertMany(data);
    res.status(201).json({ count: created.length });
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const updateTestCase = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.screenshotUrl = `/uploads/testcases/${req.file.filename}`;
    }
    const tc = await TestCase.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!tc) return res.status(404).json({ message: "Not found" });
    res.json(tc);
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const deleteTestCase = async (req, res, next) => {
  try {
    const result = await TestCase.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};
