import { generateTestCases } from "./generate-testcase.service.js";
import { generatePlaywrightCode } from "./generate-code.service.js";
import { parseInstructionToActions, analyzeBugFromScreenshot } from "./manual-agent.service.js";
import { runActionsWithPlaywright } from "../runner/playwright.service.js";
import { io } from "../../server.js";
import { AILog } from "../../models/AILog.js";

export const generateTestCasesHandler = async (req, res, next) => {
  try {
    const { featureDescription, projectContext } = req.body;
    const testCases = await generateTestCases({ featureDescription, projectContext });
    
    await AILog.create({
      userId: req.user?.id,
      prompt: featureDescription,
      response: JSON.stringify(testCases),
      type: 'generate-testcase'
    });

    res.json({ testCases });
  } catch (err) { next(err); }
};

export const generateCodeHandler = async (req, res, next) => {
  try {
    const { testCase, baseUrl } = req.body;
    const code = await generatePlaywrightCode({ testCase, baseUrl });
    
    await AILog.create({
      userId: req.user?.id,
      prompt: JSON.stringify(testCase),
      response: code,
      type: 'generate-code'
    });

    res.json({ code });
  } catch (err) { next(err); }
};

export const runManualAgentHandler = async (req, res, next) => {
  try {
    const { instruction, sessionId } = req.body;
    const actions = await parseInstructionToActions(instruction);
    const results = await runActionsWithPlaywright(actions, io, sessionId);
    
    await AILog.create({
      userId: req.user?.id,
      prompt: instruction,
      response: JSON.stringify(results),
      type: 'analyze-bug' // or another appropriate type
    });

    res.json({ actions, results });
  } catch (err) { next(err); }
};

export const analyzeBugHandler = async (req, res, next) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const analysis = await analyzeBugFromScreenshot(imageBase64, mimeType);
    
    await AILog.create({
      userId: req.user?.id,
      prompt: "[Image Screenshot]",
      response: analysis,
      type: 'analyze-bug'
    });

    res.json({ analysis });
  } catch (err) { next(err); }
};
