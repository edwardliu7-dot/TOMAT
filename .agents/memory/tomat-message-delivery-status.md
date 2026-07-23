---
name: TOMAT message delivery status
description: Delivery and read semantics for private communication.
---

Private message status is server-authoritative: a message is sent when inserted, delivered when the recipient's active app polls the authorized unread endpoint (or loads the private chat), and read when the recipient opens that conversation and the server advances the read marker.

**Why:** Browser polling cannot guarantee a separate transport acknowledgement, while authenticated app polling is a reliable product-level signal that the recipient's app is active and received the message.

**How to apply:** Keep delivery/read timestamps on `pesan_pribadi`, update them only through authenticated communication routes, and display sent as one check, delivered as two gray checks, and read as two cyan checks.