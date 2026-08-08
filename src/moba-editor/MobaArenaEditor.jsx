import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './moba-arena-editor.css'

const GRID_SIZE = 20
const ARENA_TILE_SIZE = 16
const ARENA_TILES = 1250
const LAYOUT_STORAGE_KEY = 'smartisa-hidden-moba-arena-layout'

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function assetLabel(asset) {
  return asset.filename.replace(/-[a-f0-9]{8}(?=\.[^.]+$)/i, '').replace(/\.[^.]+$/, '')
}

function loadLayout() {
  try {
    const stored = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function getCellKey(row, column) {
  return `${row}-${column}`
}

export default function MobaArenaEditor() {
  const [assets, setAssets] = useState([])
  const [placements, setPlacements] = useState(loadLayout)
  const [selectedAssetId, setSelectedAssetId] = useState(null)
  const [selectedPlacementId, setSelectedPlacementId] = useState(null)
  const [movingPlacementId, setMovingPlacementId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [notice, setNotice] = useState(null)
  const [dragOverCell, setDragOverCell] = useState(null)
  const fileInputRef = useRef(null)

  const assetById = useMemo(
    () => new Map(assets.map(asset => [asset.id, asset])),
    [assets],
  )

  const refreshAssets = useCallback(async () => {
    setLoadingAssets(true)
    try {
      const response = await fetch('/api/internal/assets')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Asset gagal dimuat.')
      setAssets(data.assets || [])
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Asset gagal dimuat.' })
    } finally {
      setLoadingAssets(false)
    }
  }, [])

  useEffect(() => {
    refreshAssets()
  }, [refreshAssets])

  useEffect(() => {
    window.__hideSplash?.()
  }, [])

  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(placements))
  }, [placements])

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      if (!selectedPlacementId) return
      event.preventDefault()
      setPlacements(current => current.filter(item => item.id !== selectedPlacementId))
      setSelectedPlacementId(null)
      setMovingPlacementId(null)
      setNotice({ type: 'success', text: 'Asset dihapus dari arena.' })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPlacementId])

  const showNotice = (type, text) => {
    setNotice({ type, text })
    window.setTimeout(() => {
      setNotice(current => current?.text === text ? null : current)
    }, 3600)
  }

  const handleUpload = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('asset', file)

    try {
      const response = await fetch('/api/internal/upload-asset', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload asset gagal.')
      setAssets(current => [data.asset, ...current.filter(asset => asset.id !== data.asset.id)])
      setSelectedAssetId(data.asset.id)
      setMovingPlacementId(null)
      showNotice('success', `${assetLabel(data.asset)} siap ditempatkan.`)
    } catch (error) {
      showNotice('error', error.message || 'Upload asset gagal.')
    } finally {
      setUploading(false)
    }
  }

  const placeAsset = (row, column, placementId = movingPlacementId) => {
    const cellKey = getCellKey(row, column)
    if (placementId) {
      const occupiedByOther = placements.find(item => (
        item.id !== placementId && item.row === row && item.column === column
      ))
      if (occupiedByOther) {
        setSelectedPlacementId(occupiedByOther.id)
        setSelectedAssetId(occupiedByOther.assetId)
        setMovingPlacementId(occupiedByOther.id)
        setDragOverCell(null)
        showNotice('info', 'Kotak sudah terisi. Asset yang ada dipilih untuk dipindahkan.')
        return
      }
      setPlacements(current => current.map(item => (
        item.id === placementId ? { ...item, row, column } : item
      )))
      setSelectedPlacementId(placementId)
      setMovingPlacementId(null)
      setDragOverCell(null)
      showNotice('success', `Asset dipindahkan ke C${column + 1} · B${row + 1}.`)
      return
    }

    if (!selectedAssetId) {
      showNotice('info', 'Pilih asset dari sidebar terlebih dahulu.')
      return
    }

    const occupiedBy = placements.find(item => item.row === row && item.column === column)
    if (occupiedBy) {
      setSelectedPlacementId(occupiedBy.id)
      setMovingPlacementId(occupiedBy.id)
      setSelectedAssetId(occupiedBy.assetId)
      showNotice('info', 'Asset dipilih. Klik kotak lain untuk memindahkannya.')
      return
    }

    const placement = {
      id: `${selectedAssetId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      assetId: selectedAssetId,
      row,
      column,
    }
    setPlacements(current => [...current, placement])
    setSelectedPlacementId(placement.id)
    showNotice('success', `Asset ditempatkan di C${column + 1} · B${row + 1}.`)
  }

  const startMoving = (event, placement) => {
    event.stopPropagation()
    setSelectedPlacementId(placement.id)
    setSelectedAssetId(placement.assetId)
    setMovingPlacementId(placement.id)
    event.dataTransfer?.setData('text/plain', placement.id)
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (event, row, column) => {
    event.preventDefault()
    const placementId = event.dataTransfer?.getData('text/plain') || movingPlacementId
    if (!placementId) return
    placeAsset(row, column, placementId)
  }

  const clearArena = () => {
    if (!placements.length) return
    setPlacements([])
    setSelectedPlacementId(null)
    setMovingPlacementId(null)
    showNotice('success', 'Semua asset di arena telah dihapus.')
  }

  const resetSelection = () => {
    setSelectedAssetId(null)
    setSelectedPlacementId(null)
    setMovingPlacementId(null)
  }

  return (
    <main className="moba-editor">
      <header className="moba-editor__topbar">
        <div className="moba-editor__brand">
          <a className="moba-editor__back" href="/" aria-label="Kembali ke TOMAT">←</a>
          <div className="moba-editor__mark">✦</div>
          <div>
            <div className="moba-editor__eyebrow">SMARTISA · INTERNAL TOOL</div>
            <h1>MOBA Arena Editor</h1>
          </div>
        </div>
        <div className="moba-editor__top-actions">
          <span className="moba-editor__status"><i /> LOCAL WORKSPACE</span>
          <button className="moba-editor__ghost-button" type="button" onClick={resetSelection}>Reset pilihan</button>
          <button className="moba-editor__clear-button" type="button" onClick={clearArena}>Clear arena</button>
        </div>
      </header>

      {notice && <div className={`moba-editor__notice moba-editor__notice--${notice.type}`}>{notice.text}</div>}

      <div className="moba-editor__workspace">
        <aside className="moba-editor__sidebar">
          <section className="moba-editor__panel moba-editor__panel--upload">
            <div className="moba-editor__panel-heading">
              <div>
                <span className="moba-editor__section-kicker">ASSET MANAGER</span>
                <h2>Visual library</h2>
              </div>
              <span className="moba-editor__count">{assets.length.toString().padStart(2, '0')}</span>
            </div>
            <p className="moba-editor__panel-copy">Upload gambar Pet, obstacle, atau dekorasi arena dari perangkatmu.</p>
            <input
              ref={fileInputRef}
              className="moba-editor__file-input"
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              onChange={handleUpload}
            />
            <button
              className="moba-editor__upload-button"
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="moba-editor__upload-icon">{uploading ? '…' : '↑'}</span>
              <span>
                <strong>{uploading ? 'Mengunggah…' : 'Upload asset'}</strong>
                <small>PNG / JPG · maksimal 10 MB</small>
              </span>
            </button>
          </section>

          <section className="moba-editor__panel moba-editor__panel--library">
            <div className="moba-editor__library-heading">
              <h2>Library</h2>
              <button type="button" onClick={refreshAssets} title="Muat ulang asset">↻</button>
            </div>
            <p className="moba-editor__hint">
              {selectedAssetId ? 'Asset aktif siap ditempatkan.' : 'Klik thumbnail untuk memilih asset.'}
            </p>
            <div className="moba-editor__asset-list">
              {loadingAssets && <div className="moba-editor__empty">Memuat library…</div>}
              {!loadingAssets && !assets.length && (
                <div className="moba-editor__empty">
                  <span>▧</span>
                  Belum ada asset.<br />Upload gambar pertama untuk mulai.
                </div>
              )}
              {assets.map(asset => (
                <button
                  type="button"
                  key={asset.id}
                  className={`moba-editor__asset-card${selectedAssetId === asset.id ? ' is-selected' : ''}`}
                  onClick={() => {
                    setSelectedAssetId(asset.id)
                    setSelectedPlacementId(null)
                    setMovingPlacementId(null)
                  }}
                >
                  <span className="moba-editor__asset-thumb">
                    <img src={asset.url} alt={assetLabel(asset)} />
                    {selectedAssetId === asset.id && <b>✓</b>}
                  </span>
                  <span className="moba-editor__asset-meta">
                    <strong>{assetLabel(asset)}</strong>
                    <small>{formatBytes(asset.size)}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="moba-editor__panel moba-editor__panel--tips">
            <span className="moba-editor__section-kicker">QUICK GUIDE</span>
            <div className="moba-editor__tip"><b>01</b><span>Pilih asset, lalu klik kotak arena.</span></div>
            <div className="moba-editor__tip"><b>02</b><span>Drag asset yang sudah ada untuk memindahkannya.</span></div>
            <div className="moba-editor__tip"><b>03</b><span>Pilih asset di arena, lalu tekan Delete untuk menghapus.</span></div>
          </section>
        </aside>

        <section className="moba-editor__stage">
          <div className="moba-editor__stage-header">
            <div>
              <span className="moba-editor__section-kicker">ARENA CANVAS</span>
              <h2>Untitled battlefield <span>· Draft</span></h2>
            </div>
            <div className="moba-editor__coordinates">
              <span><i className="moba-editor__legend moba-editor__legend--grid" />20 × 20 preview · tile {ARENA_TILE_SIZE}px · {ARENA_TILES} × {ARENA_TILES}</span>
              <span><i className="moba-editor__legend moba-editor__legend--active" />{placements.length} placed</span>
            </div>
          </div>

          <div className="moba-editor__canvas-shell">
            <div className="moba-editor__ruler moba-editor__ruler--top" aria-hidden="true">
              {Array.from({ length: GRID_SIZE }, (_, index) => <span key={index}>{index + 1}</span>)}
            </div>
            <div className="moba-editor__arena-row">
              <div className="moba-editor__ruler moba-editor__ruler--left" aria-hidden="true">
                {Array.from({ length: GRID_SIZE }, (_, index) => <span key={index}>{String.fromCharCode(65 + index)}</span>)}
              </div>
              <div className="moba-editor__grid" role="grid" aria-label={`Preview 20 kali 20 untuk arena ${ARENA_TILES} kali ${ARENA_TILES} tile`}>
                {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
                  const row = Math.floor(index / GRID_SIZE)
                  const column = index % GRID_SIZE
                  const cellKey = getCellKey(row, column)
                  const placement = placements.find(item => item.row === row && item.column === column)
                  const asset = placement ? assetById.get(placement.assetId) : null
                  return (
                    <button
                      type="button"
                      role="gridcell"
                      key={cellKey}
                      className={`moba-editor__cell${dragOverCell === cellKey ? ' is-drag-over' : ''}${placement ? ' has-asset' : ''}`}
                      onClick={() => placeAsset(row, column)}
                      onDragOver={event => {
                        event.preventDefault()
                        setDragOverCell(cellKey)
                      }}
                      onDragLeave={() => setDragOverCell(null)}
                      onDrop={event => {
                        setDragOverCell(null)
                        handleDrop(event, row, column)
                      }}
                    >
                      {placement && asset && (
                        <span
                          className={`moba-editor__placed-asset${selectedPlacementId === placement.id ? ' is-selected' : ''}`}
                          draggable
                          onClick={event => {
                            event.stopPropagation()
                            setSelectedPlacementId(placement.id)
                            setSelectedAssetId(placement.assetId)
                            setMovingPlacementId(placement.id)
                            showNotice('info', 'Asset dipilih. Klik kotak lain untuk memindahkannya.')
                          }}
                          onDragStart={event => startMoving(event, placement)}
                          title={`${assetLabel(asset)} · C${column + 1}, B${row + 1}`}
                        >
                          <img src={asset.url} alt={assetLabel(asset)} />
                          {selectedPlacementId === placement.id && <em>×</em>}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="moba-editor__stage-footer">
            <div className={`moba-editor__selection${selectedAssetId ? ' has-selection' : ''}`}>
              <span className="moba-editor__selection-preview">
                {selectedAssetId && assetById.get(selectedAssetId)
                  ? <img src={assetById.get(selectedAssetId).url} alt="" />
                  : '＋'}
              </span>
              <span>
                <small>{movingPlacementId ? 'MOVING ASSET' : 'ACTIVE ASSET'}</small>
                <strong>{selectedAssetId && assetById.get(selectedAssetId) ? assetLabel(assetById.get(selectedAssetId)) : 'None selected'}</strong>
              </span>
            </div>
            <div className="moba-editor__save-note"><span>⌘</span> Layout tersimpan otomatis di browser</div>
          </div>
        </section>
      </div>
    </main>
  )
}