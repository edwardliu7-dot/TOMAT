#!/bin/bash
set -e

# Install dependencies for the main app.
pnpm install --frozen-lockfile

# Database schema is applied automatically by the app on startup
# (see server/schema.js -> ensureSchema()), so no separate migration step is needed here.
