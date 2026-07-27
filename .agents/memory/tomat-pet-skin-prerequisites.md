---
name: TOMAT pet skin prerequisites
description: Animal pet skins are gated by ownership of their matching base pet.
---

Pet skins for an animal must require ownership of that animal's base pet before purchase or equip. The client should show the locked state and the server must enforce the same prerequisite transactionally.

**Why:** A skin is a cosmetic variant, not a standalone pet; allowing it before the base pet creates an inconsistent collection and bypasses the intended progression.

**How to apply:** Store the prerequisite in shop-item metadata, check it in both buy and equip endpoints, and mirror the ownership check in the shop card UI.