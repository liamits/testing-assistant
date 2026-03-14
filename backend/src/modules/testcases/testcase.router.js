import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getTestCases, getTestCase,
  createTestCase, updateTestCase,
  deleteTestCase, bulkCreateTestCases
} from "./testcase.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/project/:projectId", getTestCases);
router.get("/:id", getTestCase);
router.post("/", createTestCase);
router.post("/bulk", bulkCreateTestCases);   // dùng khi AI generate nhiều case
router.put("/:id", updateTestCase);
router.delete("/:id", deleteTestCase);

export default router;
