import { TestRun } from "../../models/TestRun.js";
import { TestCase } from "../../models/TestCase.js";
import { runActionsWithPlaywright } from "./playwright.service.js";
import { parseInstructionToActions } from "../ai/manual-agent.service.js";
import { io } from "../../server.js";

export const startRun = async (req, res, next) => {
  try {
    const { projectId, testCaseIds, sessionId } = req.body;

    const run = await TestRun.create({
      name: `Run ${new Date().toLocaleString("vi-VN")}`,
      projectId,
      status: "RUNNING",
      results: testCaseIds.map((id) => ({ testCaseId: id, status: "SKIPPED" }))
    });

    // Run async
    (async () => {
      try {
        const testCases = await TestCase.find({ _id: { $in: testCaseIds } });
        
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const actions = await parseInstructionToActions(
            tc.steps.map(s => s.action).join(". ")
          );
          const results = await runActionsWithPlaywright(actions, io, sessionId);
          const passed = results.every((r) => r.status === "passed");

          // Update result in array
          await TestRun.updateOne(
            { _id: run._id, "results.testCaseId": tc._id },
            { 
              $set: { 
                "results.$.status": passed ? "PASS" : "FAIL",
                "results.$.log": JSON.stringify(results)
              } 
            }
          );
        }
        
        await TestRun.findByIdAndUpdate(run._id, { 
          status: "COMPLETED", 
          finishedAt: new Date() 
        });
        io?.to(sessionId).emit("run:complete", { runId: run._id });
      } catch (err) {
        console.error("Run error:", err);
        await TestRun.findByIdAndUpdate(run._id, { status: "FAILED" });
      }
    })();

    res.json({ runId: run._id, message: "Run started" });
  } catch (err) { next(err); }
};

export const getRunResult = async (req, res, next) => {
  try {
    const run = await TestRun.findById(req.params.runId).populate("results.testCaseId");
    if (!run) return res.status(404).json({ message: "Run not found" });
    res.json(run);
  } catch (err) { next(err); }
};
