import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  generateTestCasesHandler,
  generateCodeHandler,
  runManualAgentHandler,
  analyzeBugHandler
} from "./ai.controller.js";

const router = Router();

router.use(authMiddleware);

// POST /api/ai/generate-testcases
router.post("/generate-testcases", generateTestCasesHandler);

// POST /api/ai/generate-code
router.post("/generate-code", generateCodeHandler);

// POST /api/ai/manual-agent
router.post("/manual-agent", runManualAgentHandler);

// POST /api/ai/analyze-bug
router.post("/analyze-bug", analyzeBugHandler);

export default router;
