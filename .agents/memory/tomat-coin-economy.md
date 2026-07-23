---
name: TOMAT coin economy
description: Reward pacing and premium cosmetic scarcity rules.
---

Gameplay correct answers award 15 coins. Game files may retain their legacy 50-coin marker for task-session tracking, but the player context normalizes that marker before persistence, and the server rejects larger gameplay coin grants.

**Why:** The previous 50-coin reward made the shop feel too generous and reduced the prestige of expensive cosmetics.

**How to apply:** Keep reward changes centralized in the player context and server validation. Use high prices plus explicit limited-edition metadata for prestige cosmetics; do not add completion bonuses unless the economy is rebalanced intentionally.