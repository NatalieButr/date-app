---
description: Pick the next agent task from Jira (or a specified one) and implement it
argument-hint: [Jira issue key, e.g. KAN-7]
---

Work with Jira via the `atlassian` MCP server.

## 1. Pick a task

- If a key was passed (`$ARGUMENTS`) — fetch that issue via `getJiraIssue`.
- Otherwise search via `searchJiraIssuesUsingJql`: `labels = agent AND statusCategory = "To Do" ORDER BY created ASC` in the Spark project. Take the first one whose blocking issues (`is blocked by`) are all Done.
- If the issue has label `human` — stop and tell me it is my task.
- Show me the key, title and description, and find it in SPEC §14.

## 2. Plan (no code yet)

- Read the relevant SPEC sections (§4, §15, and the feature section) and CLAUDE.md.
- Draft a plan: which files you will create or change, which public API exports you will add, which H-zone files will get only a scaffold with `TODO(human)`.
- **Wait for my "ok".** Do not write code before confirmation.

## 3. Implementation

- After "ok" move the issue to In Progress via `listJiraIssueTransitions` + `transitionJiraIssue`.
- Create a branch `feature/<key>-<short-name>` from the main branch (`main`).
- Implement the task following CLAUDE.md rules. H zones — scaffold only.
- Run `npm run check` and bring it to green. If the task changes UI — add or update an e2e test in `e2e/` and run `npm run test:e2e`. Do not run `npm run seed` or `npm run eval`.
- Commit: `<type>(<key>): <what was done>`.
- Run the `code-reviewer` subagent on the branch. Fix every Blocker and every Should fix (or explain in the report why not), commit the fixes, and run the review again. Repeat until the verdict is APPROVE, at most 3 rounds; if it is still REQUEST_CHANGES after that, stop and show me the report. Never edit H-zone files beyond the scaffold to satisfy the reviewer — list those findings for me instead.
- If `origin` is configured — push the branch; if `gh` is available — open a PR to the main branch with the final review summary in the description. Do not merge yourself.

## 4. Jira report

- Add a comment via `addOrEditJiraIssueComment`: what was done, changed slices, new public API exports, remaining `TODO(human)` and `TODO(spec)`, final review verdict and any "Notes for Natallia", PR link (if any).
- Move the issue to In Review. If that status does not exist — leave it In Progress and tell me.
- Never move the issue to Done: that is my responsibility after review.
