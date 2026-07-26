---
name: TOMAT profile contract
description: Public profile events and profile updates must preserve normalized identity fields and explicit null updates.
---

Profile targets should be normalized to a lowercase `guru`/`siswa` role before any request or event. A profile object received from the access-checked endpoint can be passed directly to the full profile view; avoid fetching it a second time. Profile update endpoints must distinguish an omitted field from an explicit `null`, so removing a photo actually clears the database value.

**Why:** Profile access failures were amplified by mixed ID/role shapes and a second request from the full-profile action. Photo removal also could not work while SQL used `coalesce`.

**How to apply:** Use the shared target normalizer/helper for communication, modal, full-profile, and notification paths. Keep SQL update expressions conditional on whether a field was supplied.