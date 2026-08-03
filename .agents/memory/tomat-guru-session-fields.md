---
name: TOMAT guru session fields
description: jabatan/kelas_diampu/wali_kelas_kelas always synced from DB on /me and included in response; fixes stale/missing fields in old sessions.
---

## Rule
`GET /api/auth/me` **always overwrites** `session.jabatan`, `session.kelas_diampu`, and `session.wali_kelas_kelas` from the DB on every call — no conditional guard.

## Why
Old sessions created before these fields were added to the session object have `undefined` for all three. Conditional backfill (`if (!session.jabatan)`) only runs once; if the field is later changed in the DB, the session never picks it up. Always-overwrite ensures:
- Stale sessions are healed on next page load without logout
- jabatan changes (e.g. adding a role) take effect immediately

## How to apply
- Both login response and `/me` response include `jabatan`, `kelas_diampu`, `wali_kelas_kelas` in `guruExtra` so `AuthContext` exposes them as `user.jabatan` etc.
- Client code (GuruEOB5 screens, TOMAT dashboard) reads these from `useAuth().user` — no separate API call needed.
- `hasMateriTerdaftar` is recomputed on every `/me` call from live DB state (subjects table), not cached forever.

## hasMateriTerdaftar gate
Jabatan `'guru'` OR `'guru_mapel'` qualifies — **not** only `'guru_mapel'`. Most teachers have `'guru'` in their jabatan array; requiring `'guru_mapel'` was too strict and locked out valid subject teachers.
