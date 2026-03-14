import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { startRun, getRunResult } from "./runner.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/start", startRun);
router.get("/:runId", getRunResult);

export default router;
