import { useState, useCallback } from "react";
import { joinSession } from "@/lib/socket";
import api from "@/lib/api";
import { nanoid } from "nanoid";

export function useTestRunner() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const runManualAgent = useCallback(async (instruction) => {
    const sessionId = nanoid();
    setLogs([]);
    setRunning(true);
    setDone(false);

    const socket = joinSession(sessionId);

    socket.on("runner:log", (log) => {
      setLogs((prev) => [...prev, log]);
    });

    socket.on("runner:done", () => {
      setRunning(false);
      setDone(true);
      socket.disconnect();
    });

    try {
      await api.post("/ai/manual-agent", { instruction, sessionId });
    } catch (err) {
      setLogs((prev) => [...prev, { status: "failed", error: err.message }]);
      setRunning(false);
    }
  }, []);

  const reset = () => {
    setLogs([]);
    setDone(false);
  };

  return { runManualAgent, logs, running, done, reset };
}
