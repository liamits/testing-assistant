import { TestCase } from "../../models/TestCase.js";

export const getTestCases = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { priority, type, status, search } = req.query;

    const query = { projectId };
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    const testCases = await TestCase.find(query).sort({ createdAt: -1 });
    res.json(testCases);
  } catch (err) { next(err); }
};

export const getTestCase = async (req, res, next) => {
  try {
    const tc = await TestCase.findById(req.params.id);
    if (!tc) return res.status(404).json({ message: "Not found" });
    res.json(tc);
  } catch (err) { next(err); }
};

export const createTestCase = async (req, res, next) => {
  try {
    const tc = await TestCase.create(req.body);
    res.status(201).json(tc);
  } catch (err) { next(err); }
};

export const bulkCreateTestCases = async (req, res, next) => {
  try {
    const { projectId, testCases } = req.body;
    const data = testCases.map((tc) => ({ ...tc, projectId }));
    const created = await TestCase.insertMany(data);
    res.status(201).json({ count: created.length });
  } catch (err) { next(err); }
};

export const updateTestCase = async (req, res, next) => {
  try {
    const tc = await TestCase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tc) return res.status(404).json({ message: "Not found" });
    res.json(tc);
  } catch (err) { next(err); }
};

export const deleteTestCase = async (req, res, next) => {
  try {
    const result = await TestCase.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
};
