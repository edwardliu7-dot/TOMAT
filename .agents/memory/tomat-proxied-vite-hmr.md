---
name: TOMAT proxied Vite HMR
description: Constraint for serving TOMAT through Express and the Replit preview proxy during development.
---

When TOMAT runs through the Express server with Vite middleware behind a proxy, disable Vite HMR for that middleware server instead of hard-coding a client port. The preview can otherwise try `127.0.0.1:443`, repeatedly reconnect, and leave the browser with 503 asset requests while the app appears stuck on its splash screen.

**Why:** The browser cannot reach the container-local HMR endpoint through the preview proxy, while the application does not need live module replacement to function.

**How to apply:** Keep the production-like Express workflow on `hmr: false`; if HMR is reintroduced, derive the client host/port from the actual proxy rather than using a fixed local port.