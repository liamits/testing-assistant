import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getProjects, getProject,
  createProject, updateProject, deleteProject,
  exportProjectTestCases, translateProjectTestCases
} from "./project.controller.js";


const router = Router();
router.use(authMiddleware);

router.get("/", getProjects);
router.get("/:id", getProject);
router.get("/:id/export", exportProjectTestCases);
router.post("/:id/translate", translateProjectTestCases);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
