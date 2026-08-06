---
name: TOMAT Multiplayer — Duel
description: Architecture and key decisions for the real-time Katak Duel multiplayer feature (Socket.io, lobby, server-authoritative scoring).
---

## Design

- **Transport**: Socket.io v4 attached to `http.createServer(app)` in `server/index.js`; Vite dev middleware still uses the same Express app — no conflicts observed (Socket.io path is `/socket.io`, Vite HMR uses clientPort 443 via Replit proxy).
- **Session sharing**: Express session middleware is extracted to a variable and passed to `setupMultiplayer(httpServer, sessionMiddleware)` which calls `io.engine.use()` to inject it — `socket.request.session.user` works the same as in REST routes.
- **Only students** (`user.role === 'siswa'`) can connect; unauthenticated sockets are disconnected immediately.

## Room management (`server/multiplayer.js`)

- Rooms live in a `Map<code, Room>` — purely in-memory, no DB.
- 6-char code from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars).
- 30-minute TTL; cleaned every 5 min via `setInterval`.
- Max 2 players per room; self-duel blocked by userId check.
- `leaveAllRooms(socket, io)` called on `disconnect` and explicit `duel:leave` event.

## Question generation

- `genKatakQ()` in `server/multiplayer.js` mirrors `SubmarineGame.jsx genQ()` — answer is never sent to client.
- Jump 2–7, start within `[-15+jump, 15-jump]`, isForward random.
- MAX_ROUNDS = 7; most-correct-answers wins; draw on tie.

## Countdown

- Server emits `duel:countdown` { count: 3 } → { count: 2 } → { count: 1 } at 1s intervals, then `startRound`.
- Client shows big countdown overlay; actual game starts when `duel:question` arrives.

## Client files

- `src/socket.js` — singleton `io()` instance; `connectSocket()` / `disconnectSocket()`.
- `src/screens/LobbyScreen.jsx` — phases: menu → waiting (host) / menu → ready (joiner) → countdown → game.
  - Uses refs (`roomCodeRef`, `myIndexRef`) to avoid stale closures in socket event handlers.
  - When `duel:question` fires, calls `onStart({ code, myIndex, question, round, maxRounds, scores })`.
- `src/screens/DuelKatakScreen.jsx` — slider with throttled `duel:slider-move` (80ms), `duel:answer` for confirmation.
  - Receives first question via props from `duelState` (App.jsx state); subsequent rounds via socket listener.
  - Ghost frog (🔥) shows opponent position in real-time; answer result overlay on confirmation.
- `src/App.jsx` — `duelState` state in `PlayerExperience`; routes `duel-lobby` → LobbyScreen, `duel-katak` → DuelKatakScreen.
- `src/screens/Grade7ZoneScreen.jsx` — `⚔️ Mode Duel` pill button appears below Katak Pelompat card (hidden when bab locked).

**Why:**
- Server-authoritative: client never sees the answer, server validates and scores — prevents position-guessing cheats.
- Singleton socket: prevents duplicate connections when navigating back and forth.
- Stale-closure fix via refs: socket event handlers registered once in useEffect cannot see React state updates without refs.

## Recovery and timing

- Arena events are not durable. Register client listeners before emitting readiness/join events, and have the server resend the currently active question when a player reconnects or re-enters the arena.
- Duel/tournament speed tie-breaks must use server-recorded cumulative answer time, with each question's start timestamp set when the question is emitted. Never trust client clocks or UI timing.

**Why:**
- A socket can reconnect or a fast second player can trigger the first question before the React screen has subscribed. Without server-side recovery, the player sees a stuck arena or cannot answer even though the match is live.

**How to apply:**
- Any new real-time match mode should keep active question state server-side, update connection-scoped socket IDs on reconnect, and use explicit event handlers for cleanup rather than broad `off(event)` calls.
