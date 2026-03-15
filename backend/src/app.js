import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRouter from "./modules/auth/auth.router.js";
import projectRouter from "./modules/projects/project.router.js";
import testcaseRouter from "./modules/testcases/testcase.router.js";
import aiRouter from "./modules/ai/ai.router.js";
import runnerRouter from "./modules/runner/runner.router.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/testcases", testcaseRouter);
app.use("/api/ai", aiRouter);
app.use("/api/runner", runnerRouter);

app.use(errorMiddleware);

export default app;
