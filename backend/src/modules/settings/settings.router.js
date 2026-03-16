import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getSettings, updateSetting } from "./settings.controller.js";

const router = Router();

router.get("/", getSettings);
router.post("/", authMiddleware, updateSetting); // Only auth for now, can add admin check later

export default router;
