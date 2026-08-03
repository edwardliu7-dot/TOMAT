import { useState, useEffect } from 'react'
import { TopBar } from '../../components/shared.jsx'
import { useAuth } from '../../AuthContext.jsx'
import { BLP_CATEGORIES, isSedangHaid, blpPeriodKey } from './blpAktivitasData.js'
import { getEffectiveTotalActivities, getEffectiveCompletedCount } from './utils/blpScoring.js'
import { useBlpData } from '../../contexts/BlpDataContext.jsx'

function getSkorForRecord(record, dateStr, haidPeriods = []) {
  const dateObj = new Date(dateStr + 'T00:00:00')
  const total = getEffectiveTotalActivities(dateObj, haidPeriods)
  const done  = getEffectiveCompletedCount(dateObj, record.completedActivities || [], haidPeriods)
  return total > 0 ? Math.round((done / total) * 100) : 0
}

function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function SkorBadge({ skor }) {
  const color = skor >= 80 ? '#10b981' : skor >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: `${color}22`, border: `1.5px solid ${color}55`,
      borderRadius: 12, padding: '4px 12px',
      fontSize: 13, fontWeight: 800, color,
    }}>
      {skor}%
    </div>
  )
}

// ─── Siswa View ──────────────────────────────────────────────────────────────
function SiswaHome({ navigate, student, blpPeriods }) {
  const today = getJakartaToday()
  const todayRecord = student.records?.[today]
  const sedangHaid = isSedangHaid(student.haidPeriods)

  // Check apakah hari ini masuk periode BLP
  const d = new Date(today + 'T00:00:00')
  const key = blpPeriodKey(student.kelas, d.getFullYear(), d.getMonth() + 1)
  const period = blpPeriods[key]
  const dayNum = d.getDate()
  const inPeriod = period ? dayNum >= period.startDay && dayNum <= period.endDay : false

  // Hitung jumlah hari terisi bulan ini
  const thisMonth = today.slice(0, 7)
  const daysFilledThisMonth = Object.keys(student.records || {}).filter(d => d.startsWith(thisMonth)).length

  // Riwayat 5 hari terakhir
  const recentDays = Object.keys(student.records || {}).sort((a, b) => b.localeCompare(a)).slice(0, 5)

  const todayDate = new Date(today + 'T00:00:00')
  const totalActivities = getEffectiveTotalActivities(todayDate, student.haidPeriods || [])
  const activitiesDone = todayRecord
    ? getEffectiveCompletedCount(todayDate, todayRecord.completedActivities || [], student.haidPeriods || [])
    : 0
  const todaySkor = todayRecord
    ? Math.round((activitiesDone / totalActivities) * 100)
    : null

  return (
    <div style={{ padding: '16px 16px 80px' }}>
      {/* Salam & info haid */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: 16, padding: '16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, color: '#6ee7b7', marginBottom: 4 }}>Halo, {student.name}! 👋</div>
        <div style={{ fontSize: 12, color: '#34d399' }}>Kelas: {student.kelas}</div>
        {sedangHaid && (
          <div style={{
            marginTop: 10, padding: '8px 12px', borderRadius: 10,
            background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)',
            fontSize: 12, color: '#f9a8d4',
          }}>
            🌸 Sedang periode haid — aktivitas sholat dikecualikan secara otomatis
          </div>
        )}
      </div>

      {/* Status hari ini */}
      <div style={{
        background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: 16, padding: '16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          AKTIVITAS HARI INI
        </div>
        {!inPeriod && !todayRecord && (
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
            ⏸️ Di luar periode BLP aktif bulan ini.
          </div>
        )}
        {todayRecord ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                {activitiesDone}/{totalActivities} aktivitas
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>sudah diisi hari ini</div>
            </div>
            <SkorBadge skor={todaySkor} />
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 10 }}>
            Belum ada catatan untuk hari ini.
          </div>
        )}
        <button onClick={() => navigate('blp-isi-aktivitas')} style={{
          width: '100%', background: 'linear-gradient(90deg, #10b981, #059669)',
          border: 'none', borderRadius: 12, padding: '13px',
          color: '#fff', fontSize: 14, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {todayRecord ? '✏️ Edit Aktivitas Hari Ini' : '✅ Isi Aktivitas Hari Ini'}
        </button>
      </div>

      {/* Statistik bulan ini */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 10, marginBottom: 16,
      }}>
        <div style={{
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 14, padding: '14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#10b981' }}>{daysFilledThisMonth}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>hari terisi bulan ini</div>
        </div>
        <div style={{
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 14, padding: '14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#10b981' }}>
            {period ? `${period.startDay}–${period.endDay}` : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>periode BLP aktif</div>
        </div>
      </div>

      {/* Tombol navigasi */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <button onClick={() => navigate('blp-riwayat')} style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 14, padding: '14px 10px', color: '#fff',
          fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>📋</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Riwayat BLP</div>
        </button>
        <button onClick={() => navigate('blp-quran')} style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 14, padding: '14px 10px', color: '#fff',
          fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>📖</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Quran Tracker</div>
        </button>
        {student.jenisKelamin !== 'L' && (
          <button onClick={() => navigate('blp-haid')} style={{
            background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)',
            borderRadius: 14, padding: '14px 10px', color: '#fff',
            fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🌸</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Periode Haid</div>
          </button>
        )}
      </div>

      {/* Riwayat singkat */}
      {recentDays.length > 0 && (
        <div style={{
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 16, padding: '14px',
        }}>
          <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
            RIWAYAT TERAKHIR
          </div>
          {recentDays.map(dateStr => {
            const rec = student.records[dateStr]
            const skor = getSkorForRecord(rec, dateStr, student.haidPeriods || [])
            return (
              <div key={dateStr} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ fontSize: 13, color: '#e5e7eb' }}>
                  {new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <SkorBadge skor={skor} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Guru View ───────────────────────────────────────────────────────────────
function GuruHome({ navigate, students, blpPeriods, guru }) {
  const today = getJakartaToday()
  const studentList = Object.values(students)

  const sudahIsi = studentList.filter(s => s.records?.[today])
  const belumIsi = studentList.filter(s => !s.records?.[today])

  const kelas = guru?.kelasWali?.[0] || ''
  const d = new Date(today + 'T00:00:00')
  const key = blpPeriodKey(kelas, d.getFullYear(), d.getMonth() + 1)
  const period = blpPeriods[key]

  return (
    <div style={{ padding: '16px 16px 80px' }}>
      {/* Header guru */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: 16, padding: '16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, color: '#6ee7b7', marginBottom: 4 }}>Wali Kelas: {guru?.name}</div>
        <div style={{ fontSize: 12, color: '#34d399' }}>Kelas: {kelas}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
          Periode aktif: {period ? `${period.startDay}–${period.endDay}` : 'Belum diatur'}
        </div>
      </div>

      {/* Ringkasan hari ini */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 14, padding: '16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#10b981' }}>{sudahIsi.length}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>sudah isi hari ini</div>
        </div>
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14, padding: '16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#ef4444' }}>{belumIsi.length}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>belum isi hari ini</div>
        </div>
      </div>

      {/* Tombol navigasi guru */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <button onClick={() => navigate('blp-guru-daftar')} style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 14, padding: '14px 10px', color: '#fff',
          fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>📊</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Rekap Kelas</div>
        </button>
        <button onClick={() => navigate('blp-guru-daftar')} style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 14, padding: '14px 10px', color: '#fff',
          fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>📅</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Atur Periode</div>
        </button>
      </div>

      {/* List siswa belum isi */}
      {belumIsi.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 16, padding: '14px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
            BELUM ISI HARI INI ({belumIsi.length})
          </div>
          {belumIsi.slice(0, 5).map(s => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: 13, color: '#e5e7eb',
            }}>
              <span>{s.name}</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>—</span>
            </div>
          ))}
          {belumIsi.length > 5 && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, textAlign: 'center' }}>
              +{belumIsi.length - 5} lainnya
            </div>
          )}
        </div>
      )}

      {/* List siswa sudah isi */}
      {sudahIsi.length > 0 && (
        <div style={{
          background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 16, padding: '14px',
        }}>
          <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
            SUDAH ISI HARI INI ({sudahIsi.length})
          </div>
          {sudahIsi.slice(0, 5).map(s => {
            const rec = s.records[today]
            const skor = getSkorForRecord(rec, today, s.haidPeriods || [])
            return (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: 13, color: '#e5e7eb',
              }}>
                <span>{s.name}</span>
                <SkorBadge skor={skor} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function BlpHomeScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const { data, loading, error, loadDashboard } = useBlpData()

  useEffect(() => { loadDashboard() }, [])

  if (loading || !data) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10b981', fontSize: 14, fontWeight: 700 }}>Memuat...</div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
      <div style={{ fontSize: 36 }}>😕</div>
      <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>{error}</div>
      <button onClick={() => window.location.reload()} style={{
        background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px',
        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Coba Lagi</button>
    </div>
  )

  const isSiswa = user?.role === 'siswa'
  const studentData = isSiswa ? Object.values(data.students || {})[0] : null
  const guruData = !isSiswa ? Object.values(data.gurus || {})[0] : null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a12 0%, #0d2d1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title="BLP Harian" onBack={goBack} accentColor="#10b981" />
      {isSiswa && studentData ? (
        <SiswaHome navigate={navigate} student={studentData} blpPeriods={data.blpPeriods || {}} />
      ) : (
        <GuruHome navigate={navigate} students={data.students || {}} blpPeriods={data.blpPeriods || {}} guru={guruData} />
      )}
    </div>
  )
}
