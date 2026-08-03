// src/screens/blp/utils/blpScoring.js

import { BLP_CATEGORIES, ALL_ACTIVITY_IDS } from '../blpAktivitasData.js'

// r1 (datang tepat waktu) hanya berlaku hari sekolah (Sen-Jum)
export const SCHOOL_ONLY_ACTIVITY_IDS = ['r1']

// rp1 (siapkan perlengkapan) tidak berlaku Sabtu
// (boleh disiapkan malam Minggu untuk Senin)
export const SATURDAY_ONLY_BLOCK_IDS = ['rp1']

// Saat haid: semua aktivitas sholat DIKECUALIKAN dari total maupun hitungan
// (tidak dihitung, bukan di-auto-credit) — sama seperti r1 di hari libur
export const HAID_EXCLUDED_IDS = BLP_CATEGORIES
  .flatMap(cat => cat.activities)
  .filter(a => a.sholat)
  .map(a => a.id)
// = ['d1','d2','d4','d6','r3','rf1']

// Alias untuk backward-compat (tidak lagi dipakai dalam scoring)
export const HAID_AUTO_CREDIT_IDS = HAID_EXCLUDED_IDS

export function isSchoolDay(date) {
  const dow = date.getDay() // 0=Minggu, 6=Sabtu
  return dow >= 1 && dow <= 5
}

export function isSaturday(date) {
  return date.getDay() === 6
}

export function isSunday(date) {
  return date.getDay() === 0
}

// ID aktivitas yang berlaku untuk tanggal tertentu
// isHaid=true → aktivitas sholat dikeluarkan dari daftar (sama seperti r1 di hari libur)
export function getEffectiveActivityIds(date, isHaid = false) {
  return ALL_ACTIVITY_IDS.filter(id => {
    if (SCHOOL_ONLY_ACTIVITY_IDS.includes(id) && !isSchoolDay(date)) return false
    if (SATURDAY_ONLY_BLOCK_IDS.includes(id) && isSaturday(date)) return false
    if (isHaid && HAID_EXCLUDED_IDS.includes(id)) return false
    return true
  })
}

export function getEffectiveTotalActivities(date, haidPeriods = []) {
  return getEffectiveActivityIds(date, isHaidDay(date, haidPeriods)).length
}

export function dateToKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isHaidDay(date, haidPeriods = []) {
  if (!haidPeriods || haidPeriods.length === 0) return false
  const key = dateToKey(date)
  return haidPeriods.some(p => p.startDate <= key && (p.endDate === null || p.endDate >= key))
}

// Hitung berapa aktivitas yang benar-benar selesai untuk satu hari
// Aktivitas sholat saat haid otomatis tidak ada dalam daftar efektif (dikecualikan)
export function getEffectiveCompletedCount(date, completedActivities, haidPeriods = []) {
  const effective = new Set(getEffectiveActivityIds(date, isHaidDay(date, haidPeriods)))
  return (completedActivities || []).filter(id => effective.has(id)).length
}

export function getBlpPeriodKey(kelas, year, month) {
  return `${kelas}__${year}-${String(month).padStart(2, '0')}`
}

export function getBlpPeriodKeyForDate(kelas, date) {
  return getBlpPeriodKey(kelas, date.getFullYear(), date.getMonth() + 1)
}

// Apakah tanggal ini masuk periode aktif BLP kelas tersebut?
// Jika belum dikonfigurasi → semua hari dianggap aktif (backward-compatible)
export function isDateWithinActivePeriod(date, kelas, blpPeriods) {
  if (!blpPeriods) return true
  const period = blpPeriods[getBlpPeriodKeyForDate(kelas, date)]
  if (!period) return true
  const day = date.getDate()
  return day >= period.startDay && day <= period.endDay
}

export function isDateCountedForRecap(date, kelas, blpPeriods) {
  return isDateWithinActivePeriod(date, kelas, blpPeriods)
}
