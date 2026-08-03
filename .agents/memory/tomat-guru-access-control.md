---
name: TOMAT Guru Access Control
description: Two-tier access control for guru in TOMAT — guru mapel terdaftar vs read-only guru
---

## Rule
Guru access in TOMAT is split into two tiers:

**Guru Mapel Terdaftar** (full access):
- `session.jabatan.includes('guru_mapel')` AND has at least one row in `subjects` table (`teacher_id = id, deleted_at IS NULL`)
- Stored as `session.user.hasMateriTerdaftar = true`
- Can: create/edit/delete tugas, boss raid, tournament, bab-locks, hafalan

**Guru Lain** (read-only):
- `hasMateriTerdaftar = false`
- Can only: Dashboard, Pantau Kelas, Nilai Siswa, Insight Siswa, Komunikasi, Mode Mengajar

## How to apply
- **Server**: `computeHasMateriTerdaftar(guruId, jabatan)` in `server/auth.js` — computed on login and backfilled in `/me`. `requireGuruMapelTerdaftar` middleware in `server/guru.js` guards all write routes.
- **Client sidebar**: `GURU_NAV_FULL` vs `GURU_NAV_READONLY` in `src/components/Sidebar.jsx` based on `user.hasMateriTerdaftar`
- **Client dashboard**: `MANAGEMENT_TAB_IDS = Set(['tugas','hafalan','kunci','raid','turnamen'])` filters tabs; useEffect redirects to 'home' if on restricted tab; tabContent guards `hasMateriTerdaftar &&`

**Why:** Only the math subject teacher should control student task assignments and events; other staff (wali kelas, kepala sekolah) only need visibility for monitoring.
