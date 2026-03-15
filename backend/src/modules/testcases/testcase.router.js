import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getTestCases, getTestCase,
  createTestCase, updateTestCase,
  deleteTestCase, bulkCreateTestCases,
  generateAI
} from "./testcase.controller.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/project/:projectId", getTestCases);
router.get("/:id", getTestCase);
router.post("/", upload.single("screenshot"), createTestCase);
router.post("/bulk", bulkCreateTestCases);
router.put("/:id", upload.single("screenshot"), updateTestCase);
router.post("/:id/generate-ai", generateAI);
router.delete("/:id", deleteTestCase);

export default router;
