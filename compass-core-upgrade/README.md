# Compass Core Upgrade

This upgrade converts the existing university-information prototype into the beginning of a **personal direction and progression system**.

## What is included

- Evidence-based career exploration engine
- Possible-futures recommendations without acceptance probabilities
- Safe practical career experiments
- Dream-path readiness categories
- Weekly action planning
- Parent summary and conversation prompts
- Specialised Compass Buddy system prompt
- Claude/Vercel API endpoint with a local fallback
- React prototype component and responsive CSS
- Safer university, scholarship, and country-data shells with verification metadata

## Important design decision

The previous data files contained changing tuition, visa, deadline, work-rule, and scholarship details as static facts. This upgrade intentionally marks those categories as unverified until they are connected to official sources and freshness tracking.

## Suggested integration

For a Vite React project:

1. Put `components/CompassDirectionPrototype.jsx` inside `src/components/`.
2. Put `lib`, `data`, `prompts`, and `styles` inside `src/`.
3. Render the component from your router or `App.jsx`.
4. Put `api/advisor.js` in the project-level `api/` directory for Vercel serverless functions.
5. Set `ANTHROPIC_API_KEY` in Vercel environment variables.
6. Optionally set `ANTHROPIC_MODEL`.

```jsx
import CompassDirectionPrototype from "./components/CompassDirectionPrototype";

export default function App() {
  return <CompassDirectionPrototype />;
}
```

## What I still need to merge this into the live app

Upload the full repository or at least:

- `package.json`
- `src/App.jsx` or equivalent
- router files
- page components
- authentication/database files

Without those files, this bundle is intentionally isolated so it does not break your current deployment.
