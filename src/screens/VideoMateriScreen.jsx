import React, { useMemo, useState } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import VideoMateriPanel from '../components/VideoMateriPanel'
import { useAuth } from '../AuthContext'
import { getAccessibleGradesForUser } from '../kelasUtils'

const SUBJECTS = [
  { id: 'matematika', label: 'Matematika', icon: '📐', accent: '#FBBF24' },
  { id: 'ipa', label: 'IPA', icon: '🔬', accent: '#34D399' },
]

const GRADE_LABELS = { 7: 'Kelas VII', 8: 'Kelas VIII', 9: 'Kelas IX' }

export default function VideoMateriScreen({ goBack }) {
  const { user } = useAuth()
  const accessibleGrades = getAccessibleGradesForUser(user)
  const [subject, setSubject] = useState('matematika')
  const [grade, setGrade] = useState(accessibleGrades[accessibleGrades.length - 1] || 7)
  const activeSubject = SUBJECTS.find(item => item.id === subject) || SUBJECTS[0]
  const safeGrade = accessibleGrades.includes(grade) ? grade : accessibleGrades[accessibleGrades.length - 1] || 7

  const gradeOptions = useMemo(
    () => accessibleGrades.map(value => ({ value, label: GRADE_LABELS[value] || `Kelas ${value}` })),
    [accessibleGrades],
  )

  return (
    <div className="video-materi-screen">
      <style>{`
        .video-materi-screen {
          min-height: 100dvh;
          color: #F8FAFC;
          background:
            radial-gradient(circle at 85% 0%, rgba(103,232,249,.12), transparent 34%),
            linear-gradient(180deg, #081525 0%, #0F172A 100%);
        }
        .video-materi-screen__content {
          width: min(100% - 32px, 980px);
          margin: 0 auto;
          padding: 18px 0 44px;
        }
        .video-materi-screen__intro {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
        }
        .video-materi-screen__icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          border-radius: 15px;
          background: linear-gradient(135deg, #164E63, #0E7490);
          box-shadow: 0 8px 24px rgba(14,116,144,.24);
          font-size: 24px;
        }
        .video-materi-screen h1 { margin: 0; font-size: clamp(20px, 3vw, 28px); letter-spacing: -.03em; }
        .video-materi-screen__intro p { margin: 5px 0 0; color: #94A3B8; font-size: 12px; line-height: 1.5; }
        .video-materi-screen__filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .video-materi-screen__filter {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 52px;
          padding: 9px 12px;
          border: 1px solid rgba(148,163,184,.14);
          border-radius: 14px;
          background: rgba(15,23,42,.78);
        }
        .video-materi-screen__filter label {
          display: block;
          color: #64748B;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .video-materi-screen__filter select {
          width: 100%;
          margin-top: 3px;
          border: 0;
          outline: 0;
          color: #F8FAFC;
          background: transparent;
          font: 800 13px inherit;
          cursor: pointer;
        }
        .video-materi-screen__filter option { color: #0F172A; }
        .video-materi-screen__subject-icon { font-size: 20px; }
        @media (max-width: 520px) {
          .video-materi-screen__content { width: min(100% - 24px, 980px); padding-top: 14px; }
          .video-materi-screen__filters { grid-template-columns: 1fr; }
        }
      `}</style>
      <PlayerHeader />
      <TopBar title="🎬 Video Materi" onBack={goBack} accentColor={activeSubject.accent} />
      <main className="video-materi-screen__content">
        <div className="video-materi-screen__intro">
          <div className="video-materi-screen__icon" aria-hidden="true">🎬</div>
          <div>
            <h1>Belajar lewat video</h1>
            <p>Pilih kelas dan mata pelajaran untuk menonton penjelasan dari gurumu.</p>
          </div>
        </div>

        <div className="video-materi-screen__filters">
          <div className="video-materi-screen__filter">
            <span className="video-materi-screen__subject-icon">{activeSubject.icon}</span>
            <div style={{ flex: 1 }}>
              <label htmlFor="video-subject">Mata pelajaran</label>
              <select id="video-subject" value={subject} onChange={event => setSubject(event.target.value)}>
                {SUBJECTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
          </div>
          <div className="video-materi-screen__filter">
            <span className="video-materi-screen__subject-icon">🏫</span>
            <div style={{ flex: 1 }}>
              <label htmlFor="video-grade">Kelas tersedia</label>
              <select id="video-grade" value={safeGrade} onChange={event => setGrade(Number(event.target.value))}>
                {gradeOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <VideoMateriPanel
          key={`${safeGrade}-${subject}`}
          grade={safeGrade}
          subject={subject}
          accent={activeSubject.accent}
          showEmpty
        />
      </main>
    </div>
  )
}