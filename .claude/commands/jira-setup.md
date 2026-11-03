---
description: Create Spark project tasks in Jira from SPEC §14 (run once)
argument-hint: <Jira project key, e.g. KAN>
---

Create Spark project tasks in Jira via the `atlassian` MCP server. Project key: `$ARGUMENTS` (if empty — ask me).

1. Read the task table in SPEC.md §14 and human zones in §15.3.
2. Check `searchJiraIssuesUsingJql` (`project = <KEY>`) for existing tasks: if a task with the same `T-xx` prefix already exists, do not create it again.
3. Use `listJiraProjectIssueTypesMetadata` to find the `Task` issue type.
4. For each row in §14 create an issue via `createJiraIssue`:
   - Summary: `T-xx · <task>`.
   - Description: day, slices, "Depends on", links to relevant SPEC sections.
   - Labels: `agent`, `day-N`.
5. Tasks marked **H** (T-07, T-08, T-10, T-11, T-12, T-14) split into two:
   - `T-xx-a · <task>: scaffold and boilerplate` — labels `agent`, `day-N`. Description must list the H-zone files where the agent leaves only types, signatures, Zod schemas, and `throw new Error('TODO(human)')`.
   - `T-xx-b · <task>: implementation (Natallia)` — labels `human`, `day-N`. Description — what the human writes per §15.3. Link to `T-xx-a` via `createJiraIssueLink` (type `Blocks`: a blocks b).
6. Also create `Blocks` links for dependencies from the "Depends on" column, if that link type exists (`listJiraIssueLinkTypes`).
7. Do not delete or modify existing tasks.
8. At the end print a table: Jira key · T-xx · label · depends on.
