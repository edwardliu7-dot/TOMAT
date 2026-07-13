---
name: TOMAT post-merge setup script
description: What the post-merge script for TOMAT must do (and must NOT do) after a task-agent merge.
---

TOMAT has no `[postMerge]` script configured by default in `.replit` — the first task-agent merge fails with `HOOK_NOT_FOUND` until one is created.

**Fix:** `scripts/post-merge.sh` running `pnpm install --frozen-lockfile` (project uses pnpm, `pnpm-lock.yaml` is the lockfile — not npm/yarn), registered via `setPostMergeConfig({ scriptPath: "scripts/post-merge.sh", timeoutMs: 120000 })`.

**Why no migration step is needed:** TOMAT has no separate migration tool (no drizzle/prisma). `server/schema.js`'s `ensureSchema()` runs `create table if not exists` / `alter table add column if not exists` automatically on every server startup (called from `server/index.js`). So the post-merge script only needs to install deps — schema sync happens naturally when the workflow restarts post-merge.

**How to apply:** If a future merge reports `HOOK_NOT_FOUND` again (e.g. `.replit` got reset), recreate this script and re-register it the same way rather than assuming a migration command is required.
