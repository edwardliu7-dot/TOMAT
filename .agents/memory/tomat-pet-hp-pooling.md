---
name: TOMAT pet HP pooling by pet type
description: pet_hunger_map keys by pet type not skinId; all skins of same animal share one HP pool; golden equip is a special case
---

## Rule
`pet_hunger_map` (jsonb) must be keyed by **pet type** (`tomi` / `kelinsay` / `monyang` / `nananaga`), never by skinId.

Mapping lives in `server/pet-state.js` → `skinToPetType(skinId)`:
- `golden`, `pet_skin_silver`, `pet_skin_cosmic`, `pet_skin_void` → `tomi`
- `pet_kelinsay*` → `kelinsay`
- `pet_monyong*` → `monyang`
- `pet_nananaga*` → `nananaga`

`getHungerUntil(hungerMap, skinId)` reads by pet type first, falls back to old skinId key for backward compat.

**Why:** Skins are cosmetic only; switching between Tomi skins must not reset or isolate HP. Only switching to a different base animal (e.g. Tomi → Kelinsay) accesses a different HP pool.

## Golden skin equip
- `golden` has no `shop_items` row — it is Tomi's built-in base skin, always owned.
- `server/toko.js` `/pakai` has a special case: if `itemId === 'golden'`, skip DB ownership check and set `equipped_pet_skin = 'golden'` directly.
- `ShopScreen.jsx` `buyEquipSkin()` no longer early-returns on `golden`; it skips the buy step but still calls `/pakai`.

**Why:** Users should be able to revert to the default skin after buying premium skins.
