---
name: TOMAT push notifications
description: Notification architecture and the required VAPID setup for device push.
---

TOMAT uses a persistent in-app notification center as the reliable baseline, with optional Web Push through a service worker and per-device subscriptions.

**Why:** Browser and HP push requires VAPID credentials and user permission; the in-app center must remain useful when either is unavailable.

**How to apply:** Keep notification creation server-authoritative and role/class-scoped. Configure `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and optionally `VAPID_SUBJECT` as environment secrets before enabling the device push control.