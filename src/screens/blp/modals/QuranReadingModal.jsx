import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Mic, Square, CheckCircle2, BookOpen, Play, Pause, RotateCcw, Bookmark } from 'lucide-react'
import { SURAH_LIST, getSurah } from '../blpAktivitasData.js'

export default function QuranReadingModal({ activityName, bookmark, onClose, onSubmit }) {
  const [mode, setMode] = useState('ayat')
  const [surahNo, setSurahNo] = useState(bookmark?.surahNo || 1)
  const [ayatFrom, setAyatFrom] = useState(bookmark?.ayat || 1)
  const [ayatTo, setAyatTo] = useState(bookmark?.ayat || 1)
  const [halaman, setHalaman] = useState(bookmark?.halaman || 1)
  const [rangeError, setRangeError] = useState('')

  const [recordState, setRecordState] = useState('idle')
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioDataUrl, setAudioDataUrl] = useState(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [surahText, setSurahText] = useState(null)
  const [textLoading, setTextLoading] = useState(false)
  const [textError, setTextError] = useState('')

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const audioElRef = useRef(null)

  const selectedSurah = useMemo(() => getSurah(surahNo), [surahNo])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!selectedSurah) return
    if (ayatFrom > selectedSurah.ayatCount) setAyatFrom(selectedSurah.ayatCount)
    if (ayatTo > selectedSurah.ayatCount) setAyatTo(selectedSurah.ayatCount)
  }, [selectedSurah])

  useEffect(() => {
    if (mode !== 'ayat') return
    let cancelled = false
    setTextLoading(true)
    setTextError('')
    fetch(`/api/blp/quran/surah/${surahNo}`)
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat teks')
        return res.json()
      })
      .then(data => {
        if (!cancelled) setSurahText(data)
      })
      .catch(() => {
        if (!cancelled) setTextError("Teks Al-Qur'an tidak dapat dimuat. Kamu tetap bisa membaca dari mushaf/aplikasi lain.")
      })
      .finally(() => {
        if (!cancelled) setTextLoading(false)
      })
    return () => { cancelled = true }
  }, [mode, surahNo])

  const applyBookmark = () => {
    if (!bookmark) return
    setMode(bookmark.halaman ? 'halaman' : 'ayat')
    setSurahNo(bookmark.surahNo)
    setAyatFrom(bookmark.ayat)
    setAyatTo(bookmark.ayat)
    if (bookmark.halaman) setHalaman(bookmark.halaman)
  }

  const validateRange = () => {
    if (mode === 'halaman') {
      if (!halaman || halaman < 1 || halaman > 604) {
        setRangeError('Nomor halaman harus antara 1 - 604.')
        return false
      }
      setRangeError('')
      return true
    }
    if (!selectedSurah) {
      setRangeError('Pilih surah terlebih dahulu.')
      return false
    }
    if (ayatFrom < 1 || ayatTo < 1 || ayatFrom > selectedSurah.ayatCount || ayatTo > selectedSurah.ayatCount) {
      setRangeError(`Ayat harus antara 1 - ${selectedSurah.ayatCount} untuk surah ${selectedSurah.nameLatin}.`)
      return false
    }
    if (ayatTo < ayatFrom) {
      setRangeError('Ayat akhir tidak boleh lebih kecil dari ayat awal.')
      return false
    }
    setRangeError('')
    return true
  }

  const startRecording = async () => {
    if (!validateRange()) return
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        const reader = new FileReader()
        reader.onloadend = () => setAudioDataUrl(reader.result)
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }

      recorder.start()
      setRecordState('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000)
    } catch {
      setError('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon telah diberikan.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setRecordState('recorded')
  }

  const resetRecording = () => {
    setAudioUrl(null)
    setAudioDataUrl(null)
    setElapsed(0)
    setIsPlaying(false)
    setRecordState('idle')
  }

  const togglePlayback = () => {
    if (!audioElRef.current) return
    if (isPlaying) {
      audioElRef.current.pause()
    } else {
      audioElRef.current.play()
    }
  }

  const formatTime = secs => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleFinish = () => {
    if (!validateRange()) return
    if (mode === 'halaman') {
      onSubmit(audioDataUrl || null, {
        surahNo,
        surahName: selectedSurah?.nameLatin || '',
        ayatFrom,
        ayatTo,
        halaman,
      })
    } else if (selectedSurah) {
      onSubmit(audioDataUrl || null, {
        surahNo,
        surahName: selectedSurah.nameLatin,
        ayatFrom,
        ayatTo,
        halaman: null,
      })
    }
  }

  const isLocked = recordState !== 'idle'

  const inputStyle = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '10px 12px', fontSize: 14, color: '#0f172a',
    boxSizing: 'border-box', opacity: isLocked ? 0.6 : 1,
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: '24px 24px 0 0',
            width: '100%',
            maxWidth: 512,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 8, background: '#d1fae5', borderRadius: 12 }}>
                  <BookOpen size={20} style={{ color: '#059669' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>Membaca Al-Qur'an</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{activityName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Bookmark */}
            {bookmark && (
              <button
                type="button"
                onClick={applyBookmark}
                disabled={isLocked}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: 16, padding: 12, textAlign: 'left', cursor: 'pointer',
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                <Bookmark size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#92400e' }}>
                  Penanda terakhir: <strong>{bookmark.surahName}</strong>
                  {bookmark.halaman ? ` — Halaman ${bookmark.halaman}` : ` ayat ${bookmark.ayat}`}.
                  {' '}Ketuk untuk lanjutkan dari sini.
                </span>
              </button>
            )}

            {/* Mode tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {['ayat', 'halaman'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    disabled={isLocked}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 12, border: 'none',
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: mode === m ? '#059669' : '#f1f5f9',
                      color: mode === m ? '#fff' : '#64748b',
                      cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    {m === 'ayat' ? 'Surah & Ayat' : 'Halaman'}
                  </button>
                ))}
              </div>

              {mode === 'ayat' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Surah</label>
                  <select
                    value={surahNo}
                    disabled={isLocked}
                    onChange={e => {
                      const no = Number(e.target.value)
                      setSurahNo(no)
                      setAyatFrom(1)
                      setAyatTo(1)
                    }}
                    style={{ ...inputStyle, opacity: isLocked ? 0.6 : 1 }}
                  >
                    {SURAH_LIST.map(s => (
                      <option key={s.no} value={s.no}>
                        {s.no}. {s.nameLatin} — {s.translatedName} ({s.ayatCount} ayat)
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>Ayat dari</label>
                      <input
                        type="number" min={1} max={selectedSurah?.ayatCount || 1}
                        value={ayatFrom} disabled={isLocked}
                        onChange={e => setAyatFrom(Number(e.target.value))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>Ayat sampai</label>
                      <input
                        type="number" min={1} max={selectedSurah?.ayatCount || 1}
                        value={ayatTo} disabled={isLocked}
                        onChange={e => setAyatTo(Number(e.target.value))}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                        Maks. {selectedSurah?.ayatCount || '-'} ayat
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Nomor Halaman (1 - 604)</label>
                  <input
                    type="number" min={1} max={604} value={halaman} disabled={isLocked}
                    onChange={e => setHalaman(Number(e.target.value))}
                    style={{ ...inputStyle, marginTop: 4 }}
                  />
                </div>
              )}

              {rangeError && (
                <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 500, margin: 0 }}>{rangeError}</p>
              )}

              {/* Reading label */}
              <div style={{
                background: '#ecfdf5', border: '1px solid #d1fae5',
                borderRadius: 16, padding: 12, textAlign: 'center',
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: 0 }}>
                  {mode === 'ayat'
                    ? `${selectedSurah?.nameLatin || ''} : Ayat ${ayatFrom}${ayatTo !== ayatFrom ? `-${ayatTo}` : ''}`
                    : `Halaman ${halaman}`}
                </p>
                <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, marginBottom: 0 }}>
                  {mode === 'ayat'
                    ? 'Bacalah ayat di bawah ini, lalu rekam bacaannya.'
                    : "Bacalah bagian ini dari Al-Qur'an/mushaf/aplikasi kamu, lalu rekam bacaannya di bawah."}
                </p>
              </div>

              {/* Ayat text */}
              {mode === 'ayat' && (
                <div style={{
                  background: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: 16, padding: 16, maxHeight: 256,
                  overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                  {textLoading && (
                    <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: 0 }}>Memuat teks ayat...</p>
                  )}
                  {!textLoading && textError && (
                    <p style={{ fontSize: 12, color: '#d97706', textAlign: 'center', margin: 0 }}>{textError}</p>
                  )}
                  {!textLoading && !textError && surahText && selectedSurah && (
                    Array.from({ length: Math.max(0, ayatTo - ayatFrom + 1) }).map((_, i) => {
                      const ayatNo = ayatFrom + i
                      const arabic = surahText.arabic?.[ayatNo - 1]
                      const translation = surahText.translations?.[ayatNo - 1]
                      if (!arabic) return null
                      return (
                        <div key={ayatNo} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <p dir="rtl" lang="ar" style={{
                            textAlign: 'right', fontSize: 22, lineHeight: 1.8,
                            color: '#0f172a', margin: 0,
                            fontFamily: '"Traditional Arabic", "Amiri", serif',
                          }}>
                            {arabic} <span style={{ color: '#059669', fontSize: 14 }}>({ayatNo})</span>
                          </p>
                          {translation && (
                            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{translation}</p>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {/* Mic error */}
            {error && (
              <div style={{
                background: '#fee2e2', color: '#dc2626', padding: 12,
                borderRadius: 12, fontSize: 14, textAlign: 'center',
                border: '1px solid #fecaca',
              }}>
                {error}
              </div>
            )}

            {/* Recording controls */}
            <div style={{
              background: '#f8fafc', borderRadius: 16, padding: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textAlign: 'center' }}>
                🎤 Rekam bacaan <span style={{ color: '#d1d5db' }}>— opsional</span>
              </div>
              {recordState === 'idle' && (
                <>
                  <button
                    onClick={startRecording}
                    style={{
                      width: 64, height: 64, borderRadius: '50%', border: 'none',
                      background: '#ef4444', color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 10px 15px -3px rgba(239,68,68,0.3)',
                    }}
                  >
                    <Mic size={26} />
                  </button>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, margin: 0 }}>
                    Tekan untuk mulai merekam bacaan
                  </p>
                </>
              )}

              {recordState === 'recording' && (
                <>
                  <button
                    onClick={stopRecording}
                    style={{
                      width: 64, height: 64, borderRadius: '50%', border: 'none',
                      background: '#ef4444', color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: 'pulse 1.5s infinite',
                      boxShadow: '0 10px 15px -3px rgba(239,68,68,0.3)',
                    }}
                  >
                    <Square size={22} fill="currentColor" />
                  </button>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', margin: 0 }}>
                    {formatTime(elapsed)} — Sedang merekam...
                  </p>
                </>
              )}

              {recordState === 'recorded' && audioUrl && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={togglePlayback}
                      style={{
                        width: 48, height: 48, borderRadius: '50%', border: 'none',
                        background: '#059669', color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <audio
                      ref={audioElRef}
                      src={audioUrl}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', margin: 0 }}>Rekaman selesai</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{formatTime(elapsed)}</p>
                    </div>
                  </div>
                  <button
                    onClick={resetRecording}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, color: '#94a3b8', fontWeight: 500,
                      background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={12} /> Rekam ulang
                  </button>
                </>
              )}
            </div>

            {/* Finish button */}
            <button
              onClick={handleFinish}
              disabled={recordState !== 'recorded'}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: recordState === 'recorded' ? '#059669' : '#e2e8f0',
                color: recordState === 'recorded' ? '#fff' : '#94a3b8',
                padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: 'none', cursor: recordState === 'recorded' ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
            >
              <CheckCircle2 size={18} />
              Selesai &amp; Tandai Selesai
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
