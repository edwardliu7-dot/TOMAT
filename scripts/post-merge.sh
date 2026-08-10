#!/bin/bash
set -e

# CI=true prevents pnpm from prompting when it needs to remove node_modules in a non-TTY environment.
export CI=true

# Install dependencies for the main app.
pnpm install --frozen-lockfile

# Database schema is applied automatically by the app on startup
# (see server/schema.js -> ensureSchema()), so no separate migration step is needed here.
