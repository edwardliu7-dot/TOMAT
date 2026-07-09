---
name: TOMAT profile photo pipeline
description: How profile photo upload (crop + compress) and cross-app data sharing with BLP Harian works.
---

Profile photo upload flow: pick file → show a crop modal (react-easy-crop, round crop, aspect 1) → on confirm, render the cropped area to a canvas → compress the resulting JPEG data URL down to a byte budget (default 1MB) by iteratively lowering quality then resolution.

**Why:** users can upload arbitrarily large images; storing them as base64 in the shared Postgres `students`/`gurus` tables without a hard cap would bloat rows shared with BLP Harian. Crop-before-compress also gives users control over framing instead of a silent center-crop.

**How to apply:** any future avatar/image upload feature in this app should reuse `src/utils/imageUtils.js` (`readFileAsDataUrl`, `getCroppedImage`, `compressDataUrlToLimit`) rather than re-inventing compression.

Cross-app sync: TOMAT and BLP Harian share the same Neon Postgres `students`/`gurus` tables (see tomat-shared-auth.md). `photo_url`/`bio` columns live directly on those shared rows, so writing from either app is instantly visible in the other — no explicit sync/webhook logic is needed or should be added.
