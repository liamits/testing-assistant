import prisma from "../../config/db.js";

export const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { testCases: true, testRuns: true } } },
      orderBy: { updatedAt: "desc" }
    });
    res.json(projects);
  } catch (err) { next(err); }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        testCases: { orderBy: { createdAt: "desc" } },
        testRuns: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) { next(err); }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: { name, description, userId: req.user.id }
    });
    res.status(201).json(project);
  } catch (err) { next(err); }
};

export const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { name, description }
    });
    res.json(project);
  } catch (err) { next(err); }
};

export const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
};
