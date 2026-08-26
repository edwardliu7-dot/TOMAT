---
name: Mockup sandbox runtime
description: Runtime requirement for bringing the isolated canvas preview server back online.
---

The mockup sandbox workflow requires a Node.js runtime with npm available in the workflow environment. If its configured `npm run dev` command fails with `npm: command not found`, install an available Node.js module through the environment package/runtime manager, then restart the existing sandbox workflow.

**Why:** The sandbox can retain its dependencies and configuration while the workflow environment loses or lacks the language runtime; changing the component code does not fix this failure.

**How to apply:** Check workflow logs first. Restore Node.js before changing the mockup or replacing the managed workflow.