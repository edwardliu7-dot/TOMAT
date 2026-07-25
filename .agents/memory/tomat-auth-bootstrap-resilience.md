---
name: TOMAT auth bootstrap resilience
description: The startup session check must fail fast so temporary database or session-store outages do not deadlock the UI.
---

The initial authentication/session request must have a client-side timeout and the server database pool must have connection/query timeouts. On failure, the app should clear the checking state and show the login screen rather than keeping the splash screen indefinitely.

**Why:** The app renders no UI while `checking` is true; an unresolved `/api/auth/me` request therefore looks like a permanently frozen application even though the web server is running.

**How to apply:** Preserve bounded timeouts whenever changing the auth bootstrap request, session store, or database connection settings. Keep login errors visible to the user so a transient outage is distinguishable from invalid credentials.