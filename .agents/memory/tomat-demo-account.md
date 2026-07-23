---
name: TOMAT demo showcase account
description: The internal student account used by teachers to preview the complete luxury shop catalog.
---

The TOMAT showcase account is a real student row marked with a server-side test-account flag. It is seeded idempotently, owns every shop item, and has the limited Aurum Sovereign and Celestia Relic cosmetics equipped.

**Why:** Teachers need a persistent account for previewing and validating all cosmetics without granting real students free inventory or exposing a synthetic student in student-facing social views.

**How to apply:** Keep the flag-based filtering server-authoritative. Include the account in teacher roster, insight, hafalan, and teacher contacts; exclude it from student leaderboard, student profiles, student contacts, forum messages, and class notifications.