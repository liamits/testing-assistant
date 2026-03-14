"use client";
import { useState } from "react";
import { useTestRunner } from "@/hooks/useTestRunner";

export default function ManualAgentPanel() {
  const [instruction, setInstruction] = useState("");
  const { runManualAgent, logs, running, done, reset } = useTestRunner();

  const handleRun = () => {
    if (!instruction.trim()) return;
    runManualAgent(instruction);
  };

  const statusColor = {
    running: "text-blue-500",
    passed: "text-green-600",
    failed: "text-red-600",
  };

  const statusIcon = {
    running: "⏳",
    passed: "✓",
    failed: "✗",
  };

  return (
    <div className="bg-white rounded-2xl border p-5">
      <h3 className="font-semibold mb-3">AI Manual Test Agent</h3>
      <p className="text-sm text-gray-500 mb-3">
        Nhập lệnh kiểm thử bằng tiếng Việt hoặc tiếng Anh — AI sẽ tự thực hiện trên browser
      </p>

      <textarea
        className="w-full border rounded-xl p-3 text-sm resize-none h-24 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
        placeholder="VD: Vào trang login, nhập email test@gmail.com và password 123456, click nút đăng nhập, kiểm tra chuyển về trang dashboard"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        disabled={running}
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleRun}
          disabled={running || !instruction.trim()}
          className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {running ? "AI đang chạy..." : "▶ Chạy Manual Test"}
        </button>
        {done && (
          <button onClick={reset} className="px-4 border rounded-xl text-sm hover:bg-gray-50">
            Reset
          </button>
        )}
      </div>

      {logs.length > 0 && (
        <div className="bg-gray-950 rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className={`flex gap-2 ${statusColor[log.status] || "text-gray-400"}`}>
              <span>{statusIcon[log.status] || "•"}</span>
              <span>{log.action?.action} {log.action?.selector || log.action?.value || ""}</span>
              {log.error && <span className="text-red-400 ml-2">— {log.error}</span>}
            </div>
          ))}
          {running && (
            <div className="text-blue-400 animate-pulse">AI đang thực hiện...</div>
          )}
          {done && (
            <div className="text-green-400 mt-2 font-semibold">✓ Hoàn thành</div>
          )}
        </div>
      )}

      {/* Screenshots */}
      {logs.some((l) => l.screenshot) && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-500 font-medium">Screenshots</p>
          {logs.filter((l) => l.screenshot).map((l, i) => (
            <img
              key={i}
              src={l.screenshot}
              alt={`step-${i}`}
              className="rounded-lg border w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
