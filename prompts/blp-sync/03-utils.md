# BLP Sync — Step 3: Utils Files

Buat dua file utility baru:
1. `src/screens/blp/utils/blpScoring.js`
2. `src/screens/blp/utils/rekapExport.js`

---

## File 1: `src/screens/blp/utils/blpScoring.js`

Port dari `src/utils/blpScoring.ts` di GitHub. Hapus type annotations, keep logic identik.

```javascript
// src/screens/blp/utils/blpScoring.js

import { BLP_CATEGORIES, ALL_ACTIVITY_IDS } from '../blpAktivitasData.js'

// r1 (datang tepat waktu) hanya berlaku hari sekolah (Sen-Jum)
export const SCHOOL_ONLY_ACTIVITY_IDS = ['r1']

// rp1 (siapkan perlengkapan) tidak berlaku Sabtu
// (boleh disiapkan malam Minggu untuk Senin)
export const SATURDAY_ONLY_BLOCK_IDS = ['rp1']

// Saat haid: d1 (shalat 5 waktu) dan d5 (baca quran) di-auto-credit
// agar siswi tidak dihukum karena pengecualian syariat
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
```

---

## File 2: `src/screens/blp/utils/rekapExport.js`

Port dari `src/utils/rekapExport.ts` di GitHub. Butuh package `jspdf`, `jspdf-autotable`, `exceljs`, `date-fns`.

Cek apakah sudah ada di `package.json`:
- `jspdf` ✅ (sudah ada)
- `jspdf-autotable` ✅ (sudah ada)
- `exceljs` ✅ (sudah ada)
- `date-fns` ✅ (sudah ada)

```javascript
// src/screens/blp/utils/rekapExport.js

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { BLP_CATEGORIES } from '../blpAktivitasData.js'
import { SCHOOL_ONLY_ACTIVITY_IDS, isSchoolDay, isDateCountedForRecap } from './blpScoring.js'

const TOTAL_DAY_COLS = 31
const BRAND_GREEN = 'FF107C57'
const LIGHT_GREEN = 'FFDCEFE6'
const GREY = 'FFF2F2F2'

function isDayCountedForActivity(day, activityId, kelas, blpPeriods) {
  if (!isDateCountedForRecap(day, kelas, blpPeriods)) return false
  if (SCHOOL_ONLY_ACTIVITY_IDS.includes(activityId) && !isSchoolDay(day)) return false
  return true
}

function buildRekapRows(user, monthDate, blpPeriods) {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const totalDays = getDaysInMonth(monthDate)
  const rows = []

  BLP_CATEGORIES.forEach(cat => {
    const catRows = cat.activities.map((activity, idx) => {
      const counted = daysInMonth.map(day => isDayCountedForActivity(day, activity.id, user.kelas, blpPeriods))
      const marks = daysInMonth.map((day, i) => {
        if (!counted[i]) return false
        const key = format(day, 'yyyy-MM-dd')
        const rec = user.records[key]
        return !!rec && rec.completedActivities.includes(activity.id)
      })
      return {
        no: idx + 1,
        name: activity.name,
        target: activity.target,
        marks, counted,
        capaian: marks.filter(Boolean).length,
        targetCount: counted.filter(Boolean).length,
      }
    })
    rows.push(catRows)
  })

  return { rows, totalDays, daysInMonth }
}

function getSemesterLabel(monthDate) {
  const month = monthDate.getMonth() + 1
  const year = monthDate.getFullYear()
  if (month >= 7) return `SEMESTER 1 T.A ${year}-${year + 1}`
  return `SEMESTER 2 T.A ${year - 1}-${year}`
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadRekapPDF(user, monthDate, blpPeriods) {
  // ... port langsung dari GitHub rekapExport.ts downloadRekapPDF()
  // Lihat: https://raw.githubusercontent.com/edwardliu7-dot/BLP/main/src/utils/rekapExport.ts
}

export async function downloadRekapExcel(user, monthDate, blpPeriods) {
  // ... port langsung dari GitHub rekapExport.ts downloadRekapExcel()
  // Lihat: https://raw.githubusercontent.com/edwardliu7-dot/BLP/main/src/utils/rekapExport.ts
}
```

> **Catatan:** `downloadRekapPDF` dan `downloadRekapExcel` cukup panjang (400+ baris).  
> Salin langsung dari GitHub, hapus TypeScript annotations, ganti `import` relative path ke path workspace.
