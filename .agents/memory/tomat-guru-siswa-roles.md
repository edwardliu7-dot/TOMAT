---
name: TOMAT guru/siswa role split
description: How tugas/nilai/bab-lock scoping and grade-access hierarchy work between guru and siswa roles.
---

- Grade number is derived from the leading roman-numeral token in a `kelas` string (VII=7, VIII=8, IX=9). A siswa can access their own grade + all lower grades (not higher); a guru's accessible grades are the union of grades across their `kelas_diampu`.
- `bab_locks` are keyed by grade number + bab (not exact kelas/section), since grade-zone game content is shared across all sections of a grade.
- `tugas` (tasks) are scoped to a guru's exact `kelas` (section name), matching `students.kelas` exactly — not by grade.
- Nilai (grade) submission is one-attempt only (unique `tugas_id, student_id`, second submission returns 409) and the server always computes `score`/`total_questions` from the stored `tugas` row, never trusting client-supplied totals — this closes a score-tampering hole found during review.
- `nilai` table has DB-level CHECK constraints (`correct_count <= total_questions`, `score` 0-100, etc.) added idempotently via a `do $do$ ... $do$` block in `ensureSchema()`, since `ALTER TABLE ADD CONSTRAINT IF NOT EXISTS` isn't valid Postgres syntax.
