// Shared class/grade helpers (server side). Kept in sync with src/kelasUtils.js.

const GRADE_BY_PREFIX = { VII: 7, VIII: 8, IX: 9 }

export function getGradeNumber(kelas) {
  if (!kelas || typeof kelas !== 'string') return null
  const prefix = kelas.trim().split(/\s+/)[0]
  return GRADE_BY_PREFIX[prefix] ?? null
}

// A student in `kelas` may access their own grade and any grade below it
// (e.g. grade 8 -> [7, 8], grade 9 -> [7, 8, 9]).
export function getAccessibleGrades(kelas) {
  const grade = getGradeNumber(kelas)
  if (!grade) return []
  return [7, 8, 9].filter(g => g <= grade)
}

export function getGuruGrades(kelasDiampu) {
  const list = Array.isArray(kelasDiampu) ? kelasDiampu : []
  const grades = new Set()
  for (const k of list) {
    const g = getGradeNumber(k)
    if (g) grades.add(g)
  }
  return [...grades].sort()
}
