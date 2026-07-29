---
name: TOMAT pet bonuses
description: Per-skin gameplay multipliers applied server-side; client mirror for UI display
---

## Rule
Each pet skin grants a multiplier applied server-side AFTER the base-cap check:
- **coinMult** — multiplies coin reward in `/api/siswa/player/gain`
- **expMult**  — multiplies EXP reward in `/api/siswa/player/gain`
- **hungerMult** — multiplies food hours in `/api/siswa/pet/feed`

Source of truth: `server/pet-bonuses.js` → `getPetBonus(skinId)`.
Client display only (labels, colors): `src/petBonuses.js` → `getPetBonusDisplay(skinId)`.

## Tiers
| Animal | Bonus type | Skins |
|---|---|---|
| Tomi | +Koin | golden=×1.0, silver=×1.1, cosmic=×1.25, void=×1.5 |
| Kelinsay | +EXP | base=×1.15, senja=×1.25, malam=×1.40 |
| Monyang | +Koin & EXP | base=×1.10, raja=×1.20, kosmik=×1.35 |
| Nananaga | +Stamina (food hrs) | base=×1.25, merah=×1.5, es=×2.0 |

**Why:** Cap check stays at 15 (base, anti-cheat); multiplier applied after so server controls the actual stored amount. Cap must never be raised to match the multiplied value.

**How to apply:** When adding a new skin, add an entry to BOTH `server/pet-bonuses.js` and `src/petBonuses.js`. PetCard in ShopScreen reads from petBonuses.js and renders a bonus badge automatically.
