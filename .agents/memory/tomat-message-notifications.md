---
name: TOMAT message notifications
description: Durable rules for unread chat and forum notifications.
---

Unread communication notifications use the latest message ID as the read marker, not a client-provided timestamp. The server derives the latest ID from the authorized conversation and stores it per user, role, and conversation.

**Why:** PostgreSQL timestamps can have microsecond precision while browser timestamps round to milliseconds, which can leave the newest message incorrectly marked unread.

**How to apply:** keep unread counts server-authoritative, poll them periodically for the header/dashboard badge, and mark a conversation read only after the server confirms the latest message ID.