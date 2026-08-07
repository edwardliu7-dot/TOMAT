---
name: Mockup sandbox icon compatibility
description: Compatibility lesson for icons used in Canvas mockup previews.
---

Mockup sandbox previews can fail at module load when a requested `lucide-react` icon is not exported by the installed version. Prefer confirmed exports or a self-contained CSS/text fallback for simple symbols.

**Why:** A single missing named export caused the otherwise complete school-map preview to render as a blank error screen.

**How to apply:** When building Canvas mockups, verify unfamiliar icon names against the installed package before using them; avoid relying on icon availability for essential rendering.