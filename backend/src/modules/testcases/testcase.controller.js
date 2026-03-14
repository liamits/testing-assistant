import prisma from "../../config/db.js";

export const getTestCases = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { priority, type, status, search } = req.query;

    const testCases = await prisma.testCase.findMany({
      where: {
        projectId,
        ...(priority && { priority }),
        ...(type && { type }),
        ...(status && { status }),
        ...(search && { title: { contains: search, mode: "insensitive" } })
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(testCases);
  } catch (err) { next(err); }
};

export const getTestCase = async (req, res, next) => {
  try {
    const tc = await prisma.testCase.findUnique({ where: { id: req.params.id } });
    if (!tc) return res.status(404).json({ message: "Not found" });
    res.json(tc);
  } catch (err) { next(err); }
};

export const createTestCase = async (req, res, next) => {
  try {
    const tc = await prisma.testCase.create({ data: req.body });
    res.status(201).json(tc);
  } catch (err) { next(err); }
};

export const bulkCreateTestCases = async (req, res, next) => {
  try {
    const { projectId, testCases } = req.body;
    const created = await prisma.testCase.createMany({
      data: testCases.map((tc) => ({ ...tc, projectId }))
    });
    res.status(201).json({ count: created.count });
  } catch (err) { next(err); }
};

export const updateTestCase = async (req, res, next) => {
  try {
    const tc = await prisma.testCase.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(tc);
  } catch (err) { next(err); }
};

export const deleteTestCase = async (req, res, next) => {
  try {
    await prisma.testCase.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
};
