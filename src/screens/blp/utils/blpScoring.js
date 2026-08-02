// src/screens/blp/utils/blpScoring.js
// Port dari blpScoring.ts GitHub — hapus TypeScript annotations, logika identik.

import { BLP_CATEGORIES } from '../blpAktivitasData.js'

export const ALL_ACTIVITY_IDS = BLP_CATEGORIES.flatMap(cat => cat.activities.map(a => a.id))

// r1 (datang tepat waktu) hanya berlaku hari sekolah (Sen-Jum)
export const SCHOOL_ONLY_ACTIVITY_IDS = ['r1']

// rp1 (siapkan perlengkapan) tidak berlaku Sabtu
export const SATURDAY_ONLY_BLOCK_IDS = ['rp1']

// Saat haid: d1 (shalat 5 waktu) dan d5 (baca quran) di-auto-credit
export const HAID_AUTO_CREDIT_IDS = ['d1', 'd5']

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
export function getEffectiveActivityIds(date) {
  return ALL_ACTIVITY_IDS.filter(id => {
    if (SCHOOL_ONLY_ACTIVITY_IDS.includes(id) && !isSchoolDay(date)) return false
    if (SATURDAY_ONLY_BLOCK_IDS.includes(id) && isSaturday(date)) return false
    return true
  })
}

export function getEffectiveTotalActivities(date) {
  return getEffectiveActivityIds(date).length
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

// Hitung berapa aktivitas yang benar-benar dihitung untuk satu hari
// (termasuk auto-credit saat haid)
export function getEffectiveCompletedCount(date, completedActivities, haidPeriods = []) {
  const effective = new Set(getEffectiveActivityIds(date))
  const completed = new Set(completedActivities.filter(id => effective.has(id)))

  if (isHaidDay(date, haidPeriods)) {
    for (const id of HAID_AUTO_CREDIT_IDS) {
      if (effective.has(id)) completed.add(id)
    }
  }

  return completed.size
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
