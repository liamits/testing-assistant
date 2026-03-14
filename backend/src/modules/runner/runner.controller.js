import prisma from "../../config/db.js";
import { runActionsWithPlaywright } from "./playwright.service.js";
import { parseInstructionToActions } from "../ai/manual-agent.service.js";
import { io } from "../../server.js";

export const startRun = async (req, res, next) => {
  try {
    const { projectId, testCaseIds, sessionId } = req.body;

    // Create TestRun record
    const run = await prisma.testRun.create({
      data: {
        name: `Run ${new Date().toLocaleString("vi-VN")}`,
        projectId,
        status: "RUNNING",
        items: {
          create: testCaseIds.map((id) => ({ testCaseId: id, status: "PENDING" }))
        }
      },
      include: { items: { include: { testCase: true } } }
    });

    // Run async — don't await, stream via socket
    (async () => {
      for (const item of run.items) {
        const tc = item.testCase;
        const actions = await parseInstructionToActions(
          tc.steps.join(". ")
        );
        const results = await runActionsWithPlaywright(actions, io, sessionId);
        const passed = results.every((r) => r.status === "passed");

        await prisma.testRunItem.update({
          where: { id: item.id },
          data: {
            status: passed ? "PASSED" : "FAILED",
            log: JSON.stringify(results)
          }
        });
      }
      await prisma.testRun.update({
        where: { id: run.id },
        data: { status: "PASSED", finishedAt: new Date() }
      });
      io?.to(sessionId).emit("run:complete", { runId: run.id });
    })();

    res.json({ runId: run.id, message: "Run started" });
  } catch (err) { next(err); }
};

export const getRunResult = async (req, res, next) => {
  try {
    const run = await prisma.testRun.findUnique({
      where: { id: req.params.runId },
      include: { items: { include: { testCase: true } } }
    });
    if (!run) return res.status(404).json({ message: "Run not found" });
    res.json(run);
  } catch (err) { next(err); }
};
