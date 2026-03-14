import { generateTestCases } from "./generate-testcase.service.js";
import { generatePlaywrightCode } from "./generate-code.service.js";
import { parseInstructionToActions, analyzeBugFromScreenshot } from "./manual-agent.service.js";
import { runActionsWithPlaywright } from "../runner/playwright.service.js";
import { io } from "../../server.js";

export const generateTestCasesHandler = async (req, res, next) => {
  try {
    const { featureDescription, projectContext } = req.body;
    const testCases = await generateTestCases({ featureDescription, projectContext });
    res.json({ testCases });
  } catch (err) { next(err); }
};

export const generateCodeHandler = async (req, res, next) => {
  try {
    const { testCase, baseUrl } = req.body;
    const code = await generatePlaywrightCode({ testCase, baseUrl });
    res.json({ code });
  } catch (err) { next(err); }
};

export const runManualAgentHandler = async (req, res, next) => {
  try {
    const { instruction, sessionId } = req.body;
    // Parse NLP → actions
    const actions = await parseInstructionToActions(instruction);
    // Run với Playwright, stream log qua socket.io
    const results = await runActionsWithPlaywright(actions, io, sessionId);
    res.json({ actions, results });
  } catch (err) { next(err); }
};

export const analyzeBugHandler = async (req, res, next) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const analysis = await analyzeBugFromScreenshot(imageBase64, mimeType);
    res.json({ analysis });
  } catch (err) { next(err); }
};
