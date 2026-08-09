# BLP Sync — Step 1: Database Migration

Migrasi ID aktivitas di kolom `completed_activities` (JSONB array) pada tabel `daily_records`.

---

## Mapping ID Lama → Baru

### Dari 5R lama (prefix-based) ke ID GitHub
| ID Lama | ID Baru |
|---------|---------|
| `d_shalat5waktu` | `d1` |
| `d_dzikir_bada` | `d2` |
| `d_sholawat` | `d3` |
| `d_dhuha` | `d4` |
| `d_baca_quran` | `d5` |
| `d_rawatib` | `d6` |
| `d_infaq` | `d7` |
| `d_doa_ortu` | `d8` |
| `r_tepat_waktu` | `r1` |
| `r_tanggung_jawab` | `r2` |
| `r_tahajud` | `r3` |
| `r_olahraga` | `r4` |
| `rs_belajar` | `rs1` |
| `rs_hafal_quran` | `rs2` |
| `rs_internet_positif` | `rs3` |
| `rs_hafal_hadits` | `rs4` |
| `rf_sholat_taubat` | `rf1` |
| `rf_istighfar` | `rf2` |
| `rf_evaluasi_diri` | `rf3` |
| `rc_siapkan` | `rp1` |
| `rc_bantu` | `rp2` |
| `rc_kerja` | `rp3` |
| `rc_peka` | `rp4` |

### Dari AKTIVITAS_LIST lama (simple IDs) ke ID GitHub
| ID Lama | ID Baru | Catatan |
|---------|---------|---------|
| `subuh`, `dzuhur`, `ashar`, `maghrib`, `isya` | `d1` | 5 shalat fardhu → 1 checklist berjamaah |
| `dhuha` | `d4` | |
| `tahajud` | `r3` | |
| `rawatib` | `d6` | |
| `quran` | `d5` | |
| `dzikir_p`, `dzikir_s` | `d2` | |
| `hafalan` | `rs2` | |
| `infaq` | `d7` | |

---

## SQL Migration

Tambahkan fungsi ini ke `server/schema.js` dalam `ensureSchema()`, setelah pembuatan tabel, agar berjalan otomatis saat server start:

```javascript
// Migrate BLP activity IDs to GitHub canonical IDs
// Safe to run multiple times — only updates rows that still contain old IDs.
const ID_MAP = {
  'd_shalat5waktu': 'd1', 'd_dzikir_bada': 'd2', 'd_sholawat': 'd3',
  'd_dhuha': 'd4', 'd_baca_quran': 'd5', 'd_rawatib': 'd6',
  'd_infaq': 'd7', 'd_doa_ortu': 'd8',
  'r_tepat_waktu': 'r1', 'r_tanggung_jawab': 'r2',
  'r_tahajud': 'r3', 'r_olahraga': 'r4',
  'rs_belajar': 'rs1', 'rs_hafal_quran': 'rs2',
  'rs_internet_positif': 'rs3', 'rs_hafal_hadits': 'rs4',
  'rf_sholat_taubat': 'rf1', 'rf_istighfar': 'rf2', 'rf_evaluasi_diri': 'rf3',
  'rc_siapkan': 'rp1', 'rc_bantu': 'rp2', 'rc_kerja': 'rp3', 'rc_peka': 'rp4',
  // Old simple AKTIVITAS_LIST
  'subuh': 'd1', 'dzuhur': 'd1', 'ashar': 'd1', 'maghrib': 'd1', 'isya': 'd1',
  'dhuha': 'd4', 'tahajud': 'r3', 'rawatib': 'd6', 'quran': 'd5',
  'dzikir_p': 'd2', 'dzikir_s': 'd2', 'hafalan': 'rs2', 'infaq': 'd7',
}

const OLD_IDS = Object.keys(ID_MAP).map(id => `'${id}'`).join(', ')

// Only update rows that contain at least one old ID
await pool.query(`
  UPDATE daily_records
  SET completed_activities = (
    SELECT to_jsonb(
      ARRAY(
        SELECT DISTINCT mapped
        FROM (
          SELECT
            CASE
              WHEN id = 'd_shalat5waktu' THEN 'd1'
              WHEN id = 'd_dzikir_bada'  THEN 'd2'
              WHEN id = 'd_sholawat'     THEN 'd3'
              WHEN id = 'd_dhuha'        THEN 'd4'
              WHEN id = 'd_baca_quran'   THEN 'd5'
              WHEN id = 'd_rawatib'      THEN 'd6'
              WHEN id = 'd_infaq'        THEN 'd7'
              WHEN id = 'd_doa_ortu'     THEN 'd8'
              WHEN id = 'r_tepat_waktu'    THEN 'r1'
              WHEN id = 'r_tanggung_jawab' THEN 'r2'
              WHEN id = 'r_tahajud'        THEN 'r3'
              WHEN id = 'r_olahraga'       THEN 'r4'
              WHEN id = 'rs_belajar'          THEN 'rs1'
              WHEN id = 'rs_hafal_quran'      THEN 'rs2'
              WHEN id = 'rs_internet_positif' THEN 'rs3'
              WHEN id = 'rs_hafal_hadits'     THEN 'rs4'
              WHEN id = 'rf_sholat_taubat' THEN 'rf1'
              WHEN id = 'rf_istighfar'     THEN 'rf2'
              WHEN id = 'rf_evaluasi_diri' THEN 'rf3'
              WHEN id = 'rc_siapkan' THEN 'rp1'
              WHEN id = 'rc_bantu'   THEN 'rp2'
              WHEN id = 'rc_kerja'   THEN 'rp3'
              WHEN id = 'rc_peka'    THEN 'rp4'
              WHEN id IN ('subuh','dzuhur','ashar','maghrib','isya') THEN 'd1'
              WHEN id = 'dhuha'    THEN 'd4'
              WHEN id = 'tahajud'  THEN 'r3'
              WHEN id = 'rawatib'  THEN 'd6'
              WHEN id = 'quran'    THEN 'd5'
              WHEN id IN ('dzikir_p','dzikir_s') THEN 'd2'
              WHEN id = 'hafalan'  THEN 'rs2'
              WHEN id = 'infaq'    THEN 'd7'
              ELSE id
            END AS mapped
          FROM jsonb_array_elements_text(completed_activities) AS id
        ) sub
      )
    )
  )
  WHERE completed_activities IS NOT NULL
    AND completed_activities != '[]'::jsonb
    AND completed_activities::text ~ '(d_|r_|rs_|rf_|rc_|subuh|dzuhur|ashar|maghrib|isya|dhuha|tahajud|rawatib|quran|dzikir|hafalan|infaq)'
`)

console.log('[schema] BLP activity ID migration complete')
```

---

## Cara Menerapkan

1. Buka `server/schema.js`
2. Di dalam fungsi `ensureSchema()`, tambahkan SQL di atas setelah semua `CREATE TABLE IF NOT EXISTS`
3. Restart server — migrasi akan berjalan otomatis saat startup
4. Aman dijalankan berulang kali (idempotent)
