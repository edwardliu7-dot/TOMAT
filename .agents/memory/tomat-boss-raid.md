---
name: TOMAT Boss Raid
description: Co-op multiplayer event where a class shares a boss HP pool; guru creates via REST, students attack via Socket.io.
---

## Architecture

- **`server/boss-state.js`**: Shared in-memory Map of active raids. Exports `createBossRaid`, `endBossRaid`, `getBossRaid`, `raidToClient`, `bossRaids`, `setIo`. Called from both `guru.js` (REST) and `multiplayer.js` (socket).
- **`server/index.js`**: `const io = setupMultiplayer(...); setIo(io)` — must return io from setupMultiplayer and pass to boss-state.
- **`server/multiplayer.js`**: Socket handlers `boss:join`, `boss:attack`, `boss:answer` added to the same io.on('connection') block as duel handlers. Reuses `genKatakQ()` for questions.
- **`server/guru.js`**: `GET/POST/DELETE /api/guru/boss-raid` — list, create, end raids.
- **`server/siswa.js`**: `GET /api/siswa/boss-raid` — returns active raid for student's class (or null).

## Client

- **`src/screens/BossRaidScreen.jsx`**: Boss visual + HP bar + attack button (60s cooldown) + question overlay (Katak slider) + participant leaderboard + defeated screen. Route: `boss-raid`.
- **`src/hooks/useBossRaid.js`**: One-shot fetch on mount of `/api/siswa/boss-raid`; returns `{ raid, checked }`.
- **`src/screens/Grade7/8/9ZoneScreen.jsx`**: Import `useBossRaid`, renders pulsing "BOSS RAID AKTIF!" banner when `checked && raid`; tapping navigates to `boss-raid`.
- **`src/screens/GuruDashboardScreen.jsx`**: `RaidTab` component with create-raid form (boss name, emoji, HP) and live HP polling every 8s; renders in "⚔️ Boss Raid" tab.

## Game mechanics

- Damage: 100 HP per correct answer
- Cooldown: 60 seconds per student between attacks
- Question TTL: 30 seconds (unanswered question expires)
- Boss HP range: 100–5000 (guru sets at creation)
- In-memory only (resets on server restart); by design for weekly events
- `boss:defeated` → server keeps raid entry 5 min for late-joiners' celebration screen, then deletes

**Why:**
- Same socket connection as duel — no new infrastructure needed
- Server-authoritative: answer never reaches client before submission
- In-memory keeps it simple; weekly events don't need DB persistence
