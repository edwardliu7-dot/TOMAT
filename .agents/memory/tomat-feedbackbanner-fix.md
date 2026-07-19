---
name: TOMAT FeedbackBanner dual-prop fix
description: All 69 G8/G9 minigames use a different FeedbackBanner prop pattern than G7 games; the component must support both.
---

## Rule
FeedbackBanner in shared.jsx supports two calling patterns:
- **New (G7 games):** `<FeedbackBanner message="..." isCorrect={bool} extras="..." />` + separate `<Btn onClick={newQ}>`
- **Legacy (G8/G9 games):** `<FeedbackBanner correct={bool} answer={q.answer} onNext={newQ} />`

The component resolves: if `message` is undefined, it generates message from `correct`/`answer`; if `onNext` is provided, it renders a "Misi Berikutnya" button inside the banner.

**Why:** All 69 G8/G9 games were written with the legacy pattern. Before the fix, since `message` was undefined, `FeedbackBanner` returned `null` — games froze after the first answer with no feedback and no way to continue.

**How to apply:** Any new G8/G9 game can use either pattern. Do NOT remove the dual-prop support from FeedbackBanner.

## Also fixed in same session
- **SliderInput label prop:** G8/G9 games pass a `label` prop (e.g. `label={\`Luas = ${val} cm²\`}`) that SliderInput now renders instead of the raw value+unit.
- **ArsitekGame step=50 bug:** step was hardcoded to 50 but answers like 20m, 30m are not multiples of 50. Fixed by using `randomSliderRange` with `step = scale/100` so every answer is always reachable.
