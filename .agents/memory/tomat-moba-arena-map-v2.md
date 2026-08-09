---
name: TOMAT MOBA arena map v2
description: Diagonal X-map layout replacing the old 3-lane horizontal map; spawn corners, deposit zones, flip mechanic for Team B.
---

# TOMAT MOBA Arena Map v2 — Diagonal X Design

**Map size**: 80,000 × 80,000 world units

## Layout
- **River** (blue, transparent water): main diagonal, top-LEFT → bottom-RIGHT (y ≈ x). `halfWidth: 7,000`. Spawns scrolls + is traversable.
- **Lane** (gray path): anti-diagonal, top-RIGHT → bottom-LEFT (y ≈ 80,000 − x). `halfWidth: 6,000`. Traversable.
- **Jungle** (forest): 4 triangular zones between the diagonals. Scrolls spawn here too.
- **Spawn border**: outer 7.5% of map (each side) = gray border area in CSS.

## Team Spawns
- **Team A**: (4,500, 74,000) = bottom-left corner
- **Team B**: (74,000, 4,500) = top-right corner

## Team B Flip Mechanic (client-side)
- `isFlipped = self?.teamId === 'teamB'`
- `toPosition(pos, arena, flip)` — when flip=true: `x = 100−x, y = 100−y`
- Movement direction negated for Team B: `{ x: -dx, y: -dy }`
- All dynamic elements (nodes, players, deposit boxes, bases, minimap dots) use flip
- Static terrain (river/lane CSS diagonals) is 180°-symmetric so no flip needed

**Why:** Both teams see themselves at bottom-left on their screens. Symmetric UX.

## Deposit Zones (server: DEPOSIT_ZONES)
- **Team A** scores at: `az-1` (9k,8k), `az-2` (7k,13.5k) [top-left border], `az-ctr` (43k,33k) [center upper]
- **Team B** scores at: `bz-1` (71k,66.5k), `bz-2` (73k,71k) [bottom-right border], `bz-ctr` (35k,45.5k) [center lower]
- Libraries: `al-base` (5k,75k) = Team A bottom-left, `bl-base` (75k,5k) = Team B top-right
- After flip, Team B sees their deposit boxes at the same relative position as Team A sees theirs (top-left of screen) ✓

## Walls
- Only outer boundary (4 walls). No horizontal lane dividers. River + lane fully traversable.

## Node Spawn (jungleBounds)
- Single rect: { minX:6k, maxX:74k, minY:6k, maxY:74k } — whole playable area (forest + river + lane)

## CSS Classes
- `.moba-diagonal-river` — 141.5% wide, 10% tall, `rotate(45deg)`, animated water flow
- `.moba-diagonal-lane` — 141.5% wide, 8% tall, `rotate(-45deg)`, gray path
- `.moba-map-outer--*` — 7.5% thick (was 2.5%)
- `.moba-jungle-map-lane` + `.moba-jungle-map-river` — minimap indicators, same rotation logic

## Tree/Rock Positions
Trees in 4 triangular zones (% coordinates):
- TOP: [25,12], [50,10], [75,12], [38,20], [62,20]
- BOTTOM: [25,88], [50,90], [75,88], [38,80], [62,80]
- LEFT: [11,30], [11,50], [11,70], [21,40], [21,60]
- RIGHT: [89,30], [89,50], [89,70], [79,40], [79,60]

**Why safe:** All positions satisfy |y−x| > 10% (away from river) and |y−(100−x)| > 10% (away from lane).
