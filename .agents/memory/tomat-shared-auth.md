---
name: TOMAT shared login with BLP Harian
description: How TOMAT authenticates against the same external Neon DB/tables as the BLP Harian app.
---

TOMAT reuses BLP Harian's accounts by connecting directly to BLP Harian's Neon Postgres
database (via secret `NEON_DATABASE_URL`, distinct from Replit's own `DATABASE_URL`) and
reading/writing the same `gurus` (guru accounts) and `students` (siswa accounts) tables.

**Why:** the user wants one account system shared across both apps rather than duplicating
user data, and BLP Harian's schema was already fixed and in production use.

**How to apply:**
- Passwords in that DB are stored in **plaintext** (BLP Harian's existing scheme) — TOMAT's
  login/register compares plaintext too. Do not silently switch to hashing; that would break
  cross-app login compatibility unless both apps are migrated together.
- `students` table requires NOT NULL `email` and `whatsapp` columns — registration from TOMAT
  must collect both even though they weren't originally asked for.
- Session store uses `connect-pg-simple` pointed at the same Neon pool (table `tomat_sessions`)
  so sessions survive restarts; `SESSION_SECRET` is required (no insecure fallback).
- Since `students`/`gurus` are shared with BLP Harian, any new profile fields (e.g. `photo_url`,
  `bio` added via idempotent `alter table ... add column if not exists` in `ensureSchema`) become
  visible to BLP Harian too — keep new columns nullable/optional so they don't break that app.
- No file storage/multer configured — profile photos are stored as compressed base64 data URLs
  directly in the `photo_url` text column (client-side canvas resize keeps them under the
  server's enforced size cap before upload).
