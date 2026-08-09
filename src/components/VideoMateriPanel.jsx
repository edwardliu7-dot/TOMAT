import React, { useEffect, useMemo, useState } from 'react'
import { GRADE_BAB_LABELS } from '../gamesCatalog'

const IPA_BAB_LABELS = {
  7: { I: 'BAB I: Besaran dan Pengukuran', II: 'BAB II: Zat dan Perubahannya', III: 'BAB III: Suhu, Pemuaian, dan Kalor', IV: 'BAB IV: Gaya dan Gerak' },
  8: { I: 'BAB I: Pengenalan Sel', II: 'BAB II: Pencernaan & Peredaran Darah', III: 'BAB III: Pernapasan & Ekskresi' },
  9: { I: 'BAB I: Sistem Koordinasi & Homeostasis', II: 'BAB II: Zat Adiktif & Psikotropika', III: 'BAB III: Sistem Reproduksi' },
}

function babLabel(grade, subject, bab) {
  return (subject === 'ipa' ? IPA_BAB_LABELS : GRADE_BAB_LABELS)[grade]?.[bab] || `BAB ${bab}`
}

function VideoFrame({ video, compact = false }) {
  if (!video?.youtubeVideoId) return null
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '16 / 9',
      borderRadius: compact ? 12 : 16, overflow: 'hidden',
      background: '#05070b', border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <iframe
        title={video.title}
        src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?rel=0`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

export default function VideoMateriPanel({ grade, subject, selectedBab = null, accent = '#67E8F9' }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    fetch(`/api/siswa/video-materi?grade=${grade}&subject=${subject}`, { credentials: 'include' })
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Video materi belum dapat dimuat.')
        return data
      })
      .then(data => {
        if (!mounted) return
        const next = data.videos || []
        setVideos(next)
        setActiveId(current => next.some(video => video.id === current) ? current : next[0]?.id || null)
      })
      .catch(err => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [grade, subject])

  const visibleVideos = useMemo(
    () => selectedBab ? videos.filter(video => video.bab === selectedBab) : videos,
    [selectedBab, videos],
  )
  const activeVideo = visibleVideos.find(video => video.id === activeId) || visibleVideos[0] || null

  if (loading) {
    return <div style={{ color: '#64748B', fontSize: 12, padding: '12px 0' }}>Memuat video materi…</div>
  }
  if (error) {
    return <div style={{ color: '#FCA5A5', fontSize: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '10px 12px' }}>{error}</div>
  }
  if (visibleVideos.length === 0) return null

  return (
    <section style={{
      margin: '14px 0 20px', padding: 14, borderRadius: 18,
      background: 'linear-gradient(145deg, rgba(15,23,42,0.96), rgba(17,24,39,0.92))',
      border: `1px solid ${accent}44`, boxShadow: `0 10px 30px ${accent}12`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 24, lineHeight: 1 }}>🎬</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 900 }}>Video Materi</div>
          <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 3 }}>
            Tonton penjelasan dari gurumu sebelum mulai bermain.
          </div>
        </div>
        <span style={{ color: accent, fontSize: 10, fontWeight: 800, background: `${accent}18`, padding: '5px 8px', borderRadius: 99 }}>
          {visibleVideos.length} VIDEO
        </span>
      </div>

      <VideoFrame video={activeVideo} />
      <div style={{ marginTop: 10 }}>
        <div style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>{activeVideo.title}</div>
        {activeVideo.description && (
          <div style={{ color: '#94A3B8', fontSize: 11, lineHeight: 1.5, marginTop: 4 }}>{activeVideo.description}</div>
        )}
      </div>

      {visibleVideos.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingTop: 12, scrollbarWidth: 'thin' }}>
          {visibleVideos.map(video => (
            <button
              type="button"
              key={video.id}
              onClick={() => setActiveId(video.id)}
              style={{
                flex: '0 0 auto', maxWidth: 190, textAlign: 'left',
                border: `1px solid ${video.id === activeVideo.id ? accent : 'rgba(255,255,255,0.08)'}`,
                background: video.id === activeVideo.id ? `${accent}18` : 'rgba(255,255,255,0.04)',
                color: video.id === activeVideo.id ? '#fff' : '#94A3B8',
                borderRadius: 10, padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{ color: accent, fontSize: 9, fontWeight: 800, marginBottom: 3 }}>
                {babLabel(grade, subject, video.bab)}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export { VideoFrame, IPA_BAB_LABELS }