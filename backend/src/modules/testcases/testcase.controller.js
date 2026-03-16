import mongoose from 'mongoose';
import fs from "fs";
import path from "path";
import { TestCase } from "../../models/TestCase.js";
import { generateTestCases, generateTestCasesFromImage } from "../../services/ai.service.js";

export const getTestCases = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { category, search } = req.query;

    const query = { projectId };
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    const testCases = await TestCase.find(query).sort({ order: 1, createdAt: -1 });
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
      category: category || 'HAPPY', // Ensure category is set
      parentId,
      screenshotUrl
    });

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
    const logData = `[${new Date().toISOString()}] PUT /api/testcases/${req.params.id} body: ${JSON.stringify(req.body)}\n`;
    fs.appendFileSync(path.resolve("tmp/debug_log.txt"), logData);
    
    const updateData = { ...req.body };
    if (req.file) {
      updateData.screenshotUrl = `/uploads/testcases/${req.file.filename}`;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      const msg = `Invalid ID format: ${req.params.id}`;
      fs.appendFileSync(path.resolve("tmp/debug_log.txt"), `[ERROR] ${msg}\n`);
      return res.status(400).json({ message: msg });
    }

    const tc = await TestCase.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!tc) {
      const msg = `Test case not found with ID: ${req.params.id}`;
      fs.appendFileSync(path.resolve("tmp/debug_log.txt"), `[ERROR] ${msg}\n`);
      return res.status(404).json({ message: "Not found" });
    }
    res.json(tc);
  } catch (err) {
    fs.appendFileSync(path.resolve("tmp/debug_log.txt"), `[EXCEPTION] ${err.message}\n`);
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

export const bulkDeleteTestCases = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "IDs must be an array" });
    }
    const result = await TestCase.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Deleted ${result.deletedCount} test cases` });
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const generateAI = async (req, res, next) => {
  try {
    const { id } = req.params;
    fs.appendFileSync(path.resolve("tmp/debug_log.txt"), `[${new Date().toISOString()}] POST /api/testcases/${id}/generate-ai\n`);
    const tc = await TestCase.findById(id);
    if (!tc) return res.status(404).json({ message: "Test case not found" });

    if (!tc.screenshotUrl) {
      return res.status(400).json({ message: "No screenshot found for this test case. Please upload one first." });
    }

    const imagePath = path.resolve(tc.screenshotUrl.startsWith("/") ? tc.screenshotUrl.slice(1) : tc.screenshotUrl);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Screenshot file not found on server" });
    }

    // Generate test cases from image
    const childrenData = await generateTestCasesFromImage(imagePath, tc.category);
    
    // Save as children
    const children = childrenData.map(child => ({
      ...child,
      projectId: tc.projectId,
      parentId: tc._id,
      category: tc.category
    }));

    const created = await TestCase.insertMany(children);
    
    res.json({ 
      message: `Successfully generated ${created.length} test cases from image.`,
      children: created 
    });
  } catch (err) {
    console.error("Manual AI Generation Error:", err);
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};

export const reorderTestCases = async (req, res, next) => {
  try {
    const { orders } = req.body; // Array of { id, order }
    console.log("Reorder request received, items count:", orders?.length);
    
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: "Orders must be an array" });
    }

    const bulkOps = orders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order }
      }
    }));

    if (bulkOps.length > 0) {
      await TestCase.bulkWrite(bulkOps);
    }
    res.json({ message: "Reordered successfully" });
  } catch (err) {
    if (typeof next === "function") next(err);
    else res.status(500).json({ message: err.message });
  }
};
