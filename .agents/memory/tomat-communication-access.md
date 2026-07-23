---
name: TOMAT communication access
description: Access rules for private chats and class forums between gurus and students.
---

Private messages are only allowed between a guru and students in the guru's exact assigned classes, or between a student and gurus who teach the student's exact class. Class forums use the same exact-class rule; the server must validate every read and write.

**Why:** class communication contains student-specific conversations and must not become visible across unrelated classes just because a client exposes another class name.

**How to apply:** keep contact lists, forum lists, message reads, and message writes behind server-side role/class checks; do not rely on UI filtering alone.