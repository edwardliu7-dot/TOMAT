---
name: TOMAT MOBA Arena Map v2
description: Layout peta 3-lane resmi dengan koordinat dunia, wall rects, deposit zones, dan jungle tiles.
---

## Map Layout (world 80,000 × 80,000)

| Area | Y range | % |
|------|---------|---|
| Outer wall top | 0–2000 | 0–2.5% |
| Top lane | 2000–13000 | 2.5–16.25% |
| Top divider wall | 13000–15000 | 16.25–18.75% |
| Upper jungle | 15000–33000 | 18.75–41.25% |
| Mid-top wall | 33000–35000 | 41.25–43.75% |
| Mid lane | 35000–45000 | 43.75–56.25% |
| Mid-bot wall | 45000–47000 | 56.25–58.75% |
| Lower jungle | 47000–65000 | 58.75–81.25% |
| Bot divider wall | 65000–67000 | 81.25–83.75% |
| Bot lane | 67000–78000 | 83.75–97.5% |
| Outer wall bot | 78000–80000 | 97.5–100% |

**Gap positions** in each divider: x=18000-22000, x=38000-42000, x=58000-62000 (3 gaps = 4 wall segments per divider row).

## Spawn Positions
- Team A base: x=4000, y=40000 (left, mid lane)
- Team B base: x=76000, y=40000 (right, mid lane)

## Deposit Zones
- Team A attacks RIGHT → lane boxes at x≈73500 (top/mid/bot y) + library at x≈5500
- Team B attacks LEFT → lane boxes at x≈6500 + library at x≈74500
- Lane boxes show `tower.points/100` and hide when `tower.destroyed` (using existing tower state — per-zone tracking is a follow-up)

## Server: Wall Collision
- `MAP_WALLS` array (20 rects) exported from `server/moba/config.js`
- `isBlockedByWall(pos, radius)` in `server/moba/match-manager.js` — nearest-point-on-rect distance check
- Called in `movePlayer()` after arena bounds check

## Server: Node Spawn
- `isInsideAnyJungle(position)` + `isOnWall(position, radius)` in `server/moba/nodes.js`
- Nodes spawn only inside `MAP_LAYOUT.jungleBounds` rectangles

## Client: Visual Elements
- `MobaArena.jsx` world layer order: terrain → grid → outer walls → lane bands → jungle zones → wall segments → trees → rocks → relics → deposit boxes → bases → nodes → players
- CSS classes: `.moba-map-outer`, `.moba-lane-band`, `.moba-jungle-zone`, `.moba-wall-seg`, `.moba-forest-tree`, `.moba-forest-rock`, `.moba-deposit-box`, `.moba-deposit-library`
- 28 trees + 14 rocks scattered across upper/lower jungle at deterministic % positions

**Why:** User requested clear 3-lane MOBA structure (vs prior oval decorative lanes), impassable walls with gaps, and visible task collection boxes at lane ends.

**How to apply:** If adding new game elements to the arena (e.g. objectives, power-ups), place them inside `MAP_LAYOUT.jungleBounds` or lane area bounds. Never place at base positions (x<8000 for A, x>72000 for B).
