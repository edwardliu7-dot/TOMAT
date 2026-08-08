---
name: TOMAT demo showcase accounts
description: The internal student accounts used by teachers to preview the complete luxury shop catalog and test the limited MOBA rollout.
---

The TOMAT showcase accounts are real student rows marked with a server-side test-account flag: `tomat` (`tomat-demo`) and `tomat2` (`tomat-demo-2`). They are seeded idempotently, use the shared test password configured for the demo rows, own every shop item, and are the only students in the limited MOBA rollout.

**Why:** Teachers need persistent accounts for previewing and validating all cosmetics and multiplayer flows without granting real students free inventory or exposing synthetic students in student-facing social views.

**How to apply:** Keep the flag-based filtering server-authoritative. Include both accounts in teacher roster, insight, hafalan, and teacher contacts; exclude them from student leaderboard, student profiles, student contacts, forum messages, and class notifications. Keep MOBA access restricted to their IDs until the rollout policy changes.