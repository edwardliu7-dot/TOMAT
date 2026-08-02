/**
 * Eob5AdministrasiScreen.jsx — Administrasi Guru
 * Kelola mata pelajaran, unggah/browse dokumen administrasi, dan bahan ajar.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b',
  dim: 'rgba(245,158,11,0.18)',
  border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7',
  sub: '#92400e',
  card: 'rgba(255,255,255,0.06)',
  green: '#4ade80',
  red: '#f87171',
  blue: '#60a5fa',
}

const inp = {
  background: 'rgba(255,255,255,0.07)',
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '9px 12px',
  color: '#fff',
  fontFamily: 'inherit',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileBase(name) {
  return name.replace(/\.[^.]+$/, '')
}

function safeDate(val) {
  try {
    if (!val) return '-'
    const d = new Date(val)
    if (isNaN(d)) return '-'
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '-' }
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// ─── Tab: Mata Pelajaran & Dokumen ─────────────────────────────────
function AdministrasiTab({ user }) {
  const [subjects, setSubjects] = useState([])
  const [loadingSubj, setLoadingSubj] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [docs, setDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  const [showSubjForm, setShowSubjForm] = useState(false)
  const [editingSubj, setEditingSubj] = useState(null)
  const [subjName, setSubjName] = useState('')
  const [savingSubj, setSavingSubj] = useState(false)

  const [showUpload, setShowUpload] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([]) // {id, file, name, status}
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const [downloading, setDownloading] = useState(null)
  const [previewing, setPreviewing] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  const [msg, setMsg] = useState({ type: '', text: '' })

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 4000) }

  const loadSubjects = useCallback(() => {
    setLoadingSubj(true)
    fetch('/api/eob5/subjects', { credentials: 'include' })
      .then(r => r.json()).then(d => { setSubjects(Array.isArray(d) ? d : []); setLoadingSubj(false) })
      .catch(() => setLoadingSubj(false))
  }, [])

  const loadDocs = useCallback((subjectId) => {
    if (!subjectId) return
    setLoadingDocs(true)
    fetch(`/api/eob5/documents?subjectId=${subjectId}`, { credentials: 'include' })
      .then(r => r.json()).then(d => { setDocs(Array.isArray(d) ? d : []); setLoadingDocs(false) })
      .catch(() => setLoadingDocs(false))
  }, [])

  useEffect(() => { loadSubjects() }, [])
  useEffect(() => { if (selectedSubject) loadDocs(selectedSubject.id) }, [selectedSubject])

  const handleSaveSubject = async () => {
    if (!subjName.trim()) return
    setSavingSubj(true)
    try {
      const url = editingSubj ? `/api/eob5/subjects/${editingSubj.id}` : '/api/eob5/subjects'
      const method = editingSubj ? 'PATCH' : 'POST'
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subjName }),
      })
      if (!r.ok) throw new Error()
      showMsg('ok', editingSubj ? 'Mata pelajaran diperbarui' : 'Mata pelajaran ditambahkan')
      setShowSubjForm(false); setEditingSubj(null); setSubjName('')
      loadSubjects()
    } catch { showMsg('error', 'Gagal menyimpan mata pelajaran') }
    setSavingSubj(false)
  }

  const handleDeleteSubject = async (s) => {
    if (!confirm(`Hapus mata pelajaran "${s.name}"? Semua dokumen di dalamnya akan ikut terhapus.`)) return
    try {
      await fetch(`/api/eob5/subjects/${s.id}`, { method: 'DELETE', credentials: 'include' })
      if (selectedSubject?.id === s.id) setSelectedSubject(null)
      showMsg('ok', 'Mata pelajaran dihapus')
      loadSubjects()
    } catch { showMsg('error', 'Gagal menghapus') }
  }

  const addFiles = (fileList) => {
    const arr = Array.from(fileList)
    setPendingFiles(prev => {
      const existing = new Set(prev.map(p => `${p.file.name}-${p.file.size}`))
      const newEntries = arr
        .filter(f => !existing.has(`${f.name}-${f.size}`))
        .map(f => ({ id: `${f.name}-${f.size}-${Math.random()}`, file: f, name: fileBase(f.name), status: 'pending' }))
      return [...prev, ...newEntries]
    })
  }

  const handleUpload = async () => {
    if (!selectedSubject || pendingFiles.length === 0) return
    setUploading(true)
    let done = 0; let failed = 0
    for (const doc of pendingFiles.filter(d => d.status === 'pending')) {
      setPendingFiles(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'uploading' } : d))
      try {
        const fileData = await readAsBase64(doc.file)
        const r = await fetch('/api/eob5/documents', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: doc.name.trim() || fileBase(doc.file.name),
            subjectId: selectedSubject.id,
            fileData, fileName: doc.file.name,
            fileType: doc.file.type || undefined,
            fileSize: doc.file.size,
          }),
        })
        if (!r.ok) throw new Error()
        setPendingFiles(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'done' } : d))
        done++
      } catch {
        setPendingFiles(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'error' } : d))
        failed++
      }
    }
    if (failed === 0) {
      showMsg('ok', `${done} dokumen berhasil diunggah`)
      setShowUpload(false); setPendingFiles([])
      loadDocs(selectedSubject.id)
    } else {
      showMsg('error', `${failed} dokumen gagal diunggah`)
    }
    setUploading(false)
  }

  const handleDownloadDoc = async (doc) => {
    setDownloading(doc.id)
    try {
      const res = await fetch(`/api/eob5/documents/${doc.id}/file`, { credentials: 'include' })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = doc.file_name || doc.name
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch { showMsg('error', 'Gagal mengunduh dokumen') }
    setDownloading(null)
  }

  const handlePreviewDoc = async (doc) => {
    setPreviewing(doc.id)
    try {
      const res = await fetch(`/api/eob5/documents/${doc.id}/file`, { credentials: 'include' })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPreviewDoc({ name: doc.name, url, fileType: doc.file_type })
    } catch { showMsg('error', 'Gagal membuka dokumen') }
    setPreviewing(null)
  }

  const handleDeleteDoc = async (docId) => {
    if (!confirm('Hapus dokumen ini?')) return
    try {
      await fetch(`/api/eob5/documents/${docId}`, { method: 'DELETE', credentials: 'include' })
      showMsg('ok', 'Dokumen dihapus')
      loadDocs(selectedSubject.id)
    } catch { showMsg('error', 'Gagal menghapus') }
  }

  const FOLDER_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
      {msg.text && (
        <div style={{ background: msg.type === 'ok' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${msg.type === 'ok' ? '#4ade80' : '#ef4444'}`, borderRadius: 10, padding: '10px 14px', color: msg.type === 'ok' ? C.green : C.red, fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      {/* Preview dialog */}
      {previewDoc && (
        <div onClick={() => { URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1e1e2e', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 800, height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewDoc.name}</span>
              <button onClick={() => { URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null) }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {previewDoc.fileType?.startsWith('image/') ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', padding: 16 }}>
                  <img src={previewDoc.url} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
                </div>
              ) : (
                <iframe src={previewDoc.url} title={previewDoc.name} style={{ width: '100%', height: '100%', border: 'none' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 14, flex: 1 }}>
        {/* Sidebar: subjects */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.sub, fontWeight: 700, letterSpacing: 1 }}>MATA PELAJARAN</span>
            <button onClick={() => { setShowSubjForm(!showSubjForm); setEditingSubj(null); setSubjName('') }} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', color: C.primary, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Baru</button>
          </div>

          {showSubjForm && (
            <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, marginBottom: 4 }}>
              <input
                value={subjName}
                onChange={e => setSubjName(e.target.value)}
                placeholder="Nama mata pelajaran"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveSubject()}
                style={{ ...inp, marginBottom: 6, fontSize: 12 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleSaveSubject} disabled={savingSubj} style={{ flex: 1, background: C.primary, border: 'none', borderRadius: 6, padding: '6px', color: '#1a0a00', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {savingSubj ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button onClick={() => { setShowSubjForm(false); setEditingSubj(null); setSubjName('') }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, padding: '6px 8px', color: '#94a3b8', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
              </div>
            </div>
          )}

          {loadingSubj ? (
            <div style={{ color: C.sub, fontSize: 12, padding: '8px 4px' }}>Memuat...</div>
          ) : subjects.length === 0 ? (
            <div style={{ color: C.sub, fontSize: 12, padding: '8px 4px' }}>Belum ada mata pelajaran.</div>
          ) : (
            subjects.map((s, idx) => {
              const col = FOLDER_COLORS[idx % FOLDER_COLORS.length]
              const isActive = selectedSubject?.id === s.id
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSubject(s)}
                  style={{ background: isActive ? `${col}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? col + '60' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', position: 'relative' }}
                >
                  <span style={{ fontSize: 16 }}>📁</span>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? '#fff' : '#cbd5e1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); setEditingSubj(s); setSubjName(s.name); setShowSubjForm(true) }} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 11, cursor: 'pointer', padding: '1px 3px' }} title="Edit">✏</button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteSubject(s) }} style={{ background: 'none', border: 'none', color: C.red, fontSize: 11, cursor: 'pointer', padding: '1px 3px' }} title="Hapus">🗑</button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Main: documents */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedSubject ? (
            <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
              <div style={{ color: C.sub, fontSize: 13 }}>Pilih mata pelajaran di sebelah kiri</div>
              <div style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>untuk melihat dan mengelola dokumen administrasinya.</div>
            </div>
          ) : (
            <div>
              {/* Subject header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1 }}>DOKUMEN ADMINISTRASI</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 2 }}>📁 {selectedSubject.name}</div>
                </div>
                <button
                  onClick={() => setShowUpload(true)}
                  style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', color: C.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  ⬆ Unggah Dokumen
                </button>
              </div>

              {/* Upload panel */}
              {showUpload && (
                <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={e => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
                    style={{ border: `2px dashed ${isDragOver ? C.primary : C.border}`, borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: isDragOver ? C.dim : 'transparent', transition: 'all 0.2s', marginBottom: 10 }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Klik atau seret berkas ke sini</div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>Bisa pilih beberapa berkas sekaligus</div>
                    <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files?.length) { addFiles(e.target.files); e.target.value = '' } }} />
                  </div>

                  {pendingFiles.length > 0 && (
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 10, maxHeight: 200, overflowY: 'auto' }}>
                      {pendingFiles.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderBottom: `1px solid rgba(255,255,255,0.05)`, background: doc.status === 'done' ? 'rgba(74,222,128,0.06)' : doc.status === 'error' ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
                          <span style={{ fontSize: 14, flexShrink: 0 }}>
                            {doc.status === 'pending' ? '📄' : doc.status === 'uploading' ? '⏳' : doc.status === 'done' ? '✅' : '❌'}
                          </span>
                          <input
                            value={doc.name}
                            disabled={doc.status !== 'pending'}
                            onChange={e => setPendingFiles(prev => prev.map(d => d.id === doc.id ? { ...d, name: e.target.value } : d))}
                            style={{ ...inp, height: 28, padding: '3px 8px', fontSize: 12, flex: 1, background: 'transparent', border: 'none' }}
                          />
                          <span style={{ fontSize: 10, color: C.sub, flexShrink: 0 }}>{formatSize(doc.file.size)}</span>
                          {doc.status === 'pending' && (
                            <button onClick={() => setPendingFiles(prev => prev.filter(d => d.id !== doc.id))} style={{ background: 'none', border: 'none', color: C.red, fontSize: 14, cursor: 'pointer' }}>✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowUpload(false); setPendingFiles([]) }} disabled={uploading} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
                    <button
                      onClick={handleUpload}
                      disabled={pendingFiles.filter(d => d.status === 'pending').length === 0 || uploading}
                      style={{ background: pendingFiles.filter(d => d.status === 'pending').length === 0 || uploading ? C.dim : C.primary, border: 'none', borderRadius: 8, padding: '8px 16px', color: '#1a0a00', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {uploading ? '⏳ Mengunggah...' : `⬆ Unggah ${pendingFiles.filter(d => d.status === 'pending').length} Berkas`}
                    </button>
                  </div>
                </div>
              )}

              {/* Document list */}
              {loadingDocs ? (
                <div style={{ color: C.sub, fontSize: 12, padding: 20, textAlign: 'center' }}>Memuat dokumen...</div>
              ) : docs.length === 0 ? (
                <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ color: C.sub, fontSize: 13 }}>Belum ada dokumen di folder ini.</div>
                  <div style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>Klik "Unggah Dokumen" untuk menambahkan.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {docs.map(doc => (
                    <div key={doc.id} style={{ background: C.card, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                        <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>
                          {safeDate(doc.uploaded_at || doc.created_at)}
                          {doc.file_size ? ` · ${formatSize(doc.file_size)}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={() => handlePreviewDoc(doc)} disabled={previewing === doc.id} style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 6, padding: '5px 9px', color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }} title="Preview">
                          {previewing === doc.id ? '⏳' : '👁'}
                        </button>
                        <button onClick={() => handleDownloadDoc(doc)} disabled={downloading === doc.id} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 9px', color: C.primary, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }} title="Unduh">
                          {downloading === doc.id ? '⏳' : '⬇'}
                        </button>
                        <button onClick={() => handleDeleteDoc(doc.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '5px 9px', color: C.red, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }} title="Hapus">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Bahan Ajar ───────────────────────────────────────────────
function BahanAjarTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ judul: '', mataPelajaran: '', kelas: '', deskripsi: '', linkUrl: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [previewing, setPreviewing] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 4000) }

  const loadItems = useCallback(() => {
    setLoading(true)
    fetch('/api/eob5/bahan-ajar', { credentials: 'include' })
      .then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { loadItems() }, [])

  const ff = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.judul.trim()) { showMsg('error', 'Judul wajib diisi'); return }
    setSaving(true)
    try {
      let filePayload = {}
      if (selectedFile) {
        filePayload = {
          fileData: await readAsBase64(selectedFile),
          fileName: selectedFile.name,
          fileType: selectedFile.type || undefined,
          fileSize: selectedFile.size,
        }
      }
      const r = await fetch('/api/eob5/bahan-ajar', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...filePayload }),
      })
      if (!r.ok) throw new Error()
      showMsg('ok', 'Bahan ajar ditambahkan')
      setShowForm(false)
      setForm({ judul: '', mataPelajaran: '', kelas: '', deskripsi: '', linkUrl: '' })
      setSelectedFile(null)
      loadItems()
    } catch { showMsg('error', 'Gagal menyimpan bahan ajar') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus bahan ajar ini?')) return
    try {
      await fetch(`/api/eob5/bahan-ajar/${id}`, { method: 'DELETE', credentials: 'include' })
      showMsg('ok', 'Bahan ajar dihapus')
      loadItems()
    } catch { showMsg('error', 'Gagal menghapus') }
  }

  const handleDownload = async (item) => {
    setDownloading(item.id)
    try {
      const res = await fetch(`/api/eob5/bahan-ajar/${item.id}/file`, { credentials: 'include' })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = item.file_name || item.judul
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch { showMsg('error', 'Gagal mengunduh') }
    setDownloading(null)
  }

  const handlePreview = async (item) => {
    setPreviewing(item.id)
    try {
      const res = await fetch(`/api/eob5/bahan-ajar/${item.id}/file`, { credentials: 'include' })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPreviewDoc({ name: item.judul, url, fileType: item.file_type })
    } catch { showMsg('error', 'Gagal membuka berkas') }
    setPreviewing(null)
  }

  return (
    <div>
      {msg.text && (
        <div style={{ background: msg.type === 'ok' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${msg.type === 'ok' ? '#4ade80' : '#ef4444'}`, borderRadius: 10, padding: '10px 14px', color: msg.type === 'ok' ? C.green : C.red, fontSize: 13, marginBottom: 12 }}>
          {msg.text}
        </div>
      )}

      {previewDoc && (
        <div onClick={() => { URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1e1e2e', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 800, height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{previewDoc.name}</span>
              <button onClick={() => { URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null) }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {previewDoc.fileType?.startsWith('image/') ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', padding: 16 }}>
                  <img src={previewDoc.url} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
                </div>
              ) : (
                <iframe src={previewDoc.url} title={previewDoc.name} style={{ width: '100%', height: '100%', border: 'none' }} />
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.sub }}>📚 Semua guru dapat menambahkan bahan ajar. Hanya unggahan milik sendiri yang dapat dihapus.</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', color: C.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
          {showForm ? '✕ Tutup' : '+ Tambah Bahan Ajar'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 12 }}>Tambah Bahan Ajar</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>JUDUL *</div>
              <input value={form.judul} onChange={e => ff('judul', e.target.value)} placeholder="Judul bahan ajar" style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>MATA PELAJARAN</div>
                <input value={form.mataPelajaran} onChange={e => ff('mataPelajaran', e.target.value)} placeholder="Misal: Matematika" style={inp} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>KELAS</div>
                <input value={form.kelas} onChange={e => ff('kelas', e.target.value)} placeholder="Misal: VII Ibnu Battutah" style={inp} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>DESKRIPSI (OPSIONAL)</div>
              <textarea value={form.deskripsi} onChange={e => ff('deskripsi', e.target.value)} rows={2} placeholder="Keterangan singkat" style={{ ...inp, resize: 'vertical' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>LINK EKSTERNAL (OPSIONAL)</div>
              <input value={form.linkUrl} onChange={e => ff('linkUrl', e.target.value)} placeholder="https://..." style={inp} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>UNGGAH BERKAS (OPSIONAL)</div>
              <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} style={{ ...inp, padding: '6px 10px', fontSize: 12 }} />
              {selectedFile && <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>{selectedFile.name} ({formatSize(selectedFile.size)})</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowForm(false); setForm({ judul: '', mataPelajaran: '', kelas: '', deskripsi: '', linkUrl: '' }); setSelectedFile(null) }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
              <button onClick={handleSave} disabled={saving} style={{ background: saving ? C.dim : C.primary, border: 'none', borderRadius: 8, padding: '8px 16px', color: '#1a0a00', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: C.sub, padding: 32, fontSize: 13 }}>Memuat bahan ajar...</div>
      ) : items.length === 0 ? (
        <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
          <div style={{ color: C.sub, fontSize: 13 }}>Belum ada bahan ajar.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: C.card, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📚</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.judul}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                    {item.mata_pelajaran && <span style={{ background: C.dim, color: C.primary, borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>{item.mata_pelajaran}</span>}
                    {item.kelas && <span style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 4, padding: '1px 6px', fontSize: 9 }}>{item.kelas}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: C.red, fontSize: 16, cursor: 'pointer', flexShrink: 0 }} title="Hapus">🗑</button>
              </div>
              {item.deskripsi && <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.4 }}>{item.deskripsi}</div>}
              <div style={{ display: 'flex', gap: 6, borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 8, marginTop: 'auto' }}>
                <span style={{ fontSize: 10, color: C.sub, flex: 1 }}>📅 {safeDate(item.created_at)}</span>
                {item.link_url && <a href={item.link_url} target="_blank" rel="noopener noreferrer" style={{ color: C.blue, fontSize: 11, textDecoration: 'none' }}>🔗 Buka</a>}
                {item.file_name && (
                  <>
                    <button onClick={() => handlePreview(item)} disabled={previewing === item.id} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{previewing === item.id ? '⏳' : '👁'}</button>
                    <button onClick={() => handleDownload(item)} disabled={downloading === item.id} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{downloading === item.id ? '⏳' : '⬇'}</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function Eob5AdministrasiScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('administrasi')

  if (user?.role !== 'guru') return (
    <div style={{ padding: 60, textAlign: 'center', color: C.red, fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5 }}>GURU</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Administrasi Guru</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'rgba(0,0,0,0.25)', borderBottom: `1px solid ${C.border}`, padding: '0 18px', display: 'flex', gap: 0, flexShrink: 0 }}>
        {[['administrasi', '📁 Administrasi'], ['bahan-ajar', '📚 Bahan Ajar']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ background: 'none', border: 'none', borderBottom: tab === key ? `2px solid ${C.primary}` : '2px solid transparent', padding: '12px 16px', color: tab === key ? C.primary : '#94a3b8', fontWeight: tab === key ? 700 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        {tab === 'administrasi' && <AdministrasiTab user={user} />}
        {tab === 'bahan-ajar' && <BahanAjarTab />}
      </div>
    </div>
  )
}
