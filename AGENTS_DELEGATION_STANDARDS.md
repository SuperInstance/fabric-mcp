# 🤝 Agent Delegation & Handover Standards

This document governs how the **Orchestrator** delegates specialized tasks to **Implementation Agents**. It ensures that every subagent operates with precision, autonomy, and a clear definition of "Done."

## 🎯 The Golden Rule of Delegation
**Never delegate a task that requires clarification.** 
If a goal is ambiguous, the Orchestrator must refine the prompt before spawning the subagent. Subagents cannot use `clarify`.

## 📋 Task Structure (The Handover Packet)

Every `delegate_task` call must include high-fidelity context to prevent "context drift."

### 1. The Goal (Self-Contained)
The `goal` must be a complete instruction. A subagent has no memory of this conversation.
*   **❌ Bad:** "Convert the existing files to Rust."
*   **✅ Good:** "Convert the core logic found in `src/engine.ts` to a Rust implementation in `src/core/engine.rs`. Ensure all types match the `claw-schema.json` specification. Run `cargo test` to verify."

### 2. The Context (The Navigational Map)
Provide the "terrain" the agent is working on.
*   **File Paths:** Absolute or repo-root relative paths to relevant files.
*   **Error Logs:** If delegating a bug fix, include the exact traceback.
*   **Constraints:** "Do not modify `src/security/`. Only touch `src/core/`."

### 3. Toolset Restriction (The Toolkit)
To optimize latency and token usage, only enable tools required for the specific task.
*   **Coding/Refactoring:** `['terminal', 'file']`
*   **Research:** `['web', 'search']`
*   **Full-Stack/Testing:** `['terminal', 'file', 'web', 'browser']`

## ✅ Definition of "Done" (The Verification Gate)

A subagent's report is a **self-report**, not a fact. The Orchestrator **must** verify the result using its own tools.

| Task Category | Verification Requirement |
| :--- | :--- |
| **Code Implementation** | `read_file` to check the content + `terminal` to run tests. |
| **File Creation/Move** | `search_files` or `ls` to confirm existence and location. |
| **Network/API Call** | `terminal(curl ...)` or `browser` to verify the endpoint responds correctly. |
| **Documentation** | `read_file` to verify the content matches the requested structure. |

**Rule:** If a subagent says "I have written the file," the task is **not** complete until the Orchestrator has actually seen the file content.

## 🔄 Feedback & Iteration

1.  **Successful Completion:** Summarize the result and update the session `todo` list.
2.  **Partial Success/Error:** If a subagent fails or hits a blocker, the Orchestrator must:
    *   Diagnose the error (read logs, check paths).
    *   Either provide a corrected task to the same agent **OR** spawn a new specialist (e.g., a DevOps agent to fix an environment error).
3.  **Incomplete Work:** Never "assume" a task is finished because the subagent stopped. If they hit a timeout, the task is `pending` or `failed`.

---
*Standardized by SuperInstance Orchestrator (2026-03-19)*
