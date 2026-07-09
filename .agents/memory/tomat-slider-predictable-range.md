---
name: TOMAT slider answer-position bug
description: Why SliderInput ranges in minigames must be randomized per-question, not computed with fixed padding around the answer.
---

When a minigame's slider range (`min`/`max` passed to `SliderInput`) is computed as a fixed
offset from the answer (e.g. `max = answer + 5`, or symmetric padding like
`floor((lo-8)/5)*5` .. `ceil((hi+8)/5)*5`), the answer ends up sitting at the same relative
position on the slider every single time (e.g. always in the middle, or always 5 units from
the right edge). Students quickly learn to guess by slider-handle position instead of doing
the math — this defeats the purpose of the game.

**Why:** Reported by the user after shipping the first round of slider-based minigame
redesigns (TermometerGame and several G8 sequence games) — the "always centered" pattern
was immediately noticeable and exploitable.

**How to apply:** Always compute slider range with `randomSliderRange(mustInclude, {step,
minPad, maxPad})` from `src/components/shared.jsx`, called once inside `genQ()` (so the
range is part of the randomized question state, not recomputed every render). It applies
independent random left/right padding within `[minPad, maxPad]`, so the answer's position
varies question to question. Never hardcode `answer ± constant` as a slider bound.
