---
name: TOMAT BLP cross-module notifications
description: notifications table has source column; notifyUser() accepts source param; BLP submit notifies guru, BLP review notifies student; bell shows source pill badges.
---

## Rule
All notification sends must pass `source: 'tomat'` (default) or `source: 'blp'` to `notifyUser()`. The `source` column is `TEXT DEFAULT 'tomat'` in the `notifications` table.

## Why
Users see notifications from both TOMAT gameplay and BLP Harian in a single bell. Without a source label, users can't tell which module triggered the notification.

## How to apply
- `notifyUser({ userId, role, type, title, body, url, source })` — `source` defaults to `'tomat'` so all existing callers still work without changes.
- BLP submit (student saves daily checklist) → fire `notifyUser` to the student's wali kelas (`source: 'blp'`, `type: 'blp_submit'`). **Non-blocking**: use `.then().catch()`, don't await before sending HTTP response.
- BLP review (guru marks submission) → fire `notifyUser` to the student (`source: 'blp'`, `type: 'blp_feedback'`). Only send on `isFirstReview` (when `reviewedAt` is newly set).
- `AppNotificationBell` in `shared.jsx`: renders a small pill per notification — BLP = blue `#67E8F9`, TOMAT = green `#9fe3bd`.
