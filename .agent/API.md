# API

**No backend API surface.** This is a fully static, client-side Next.js app
(App Router, static export target — README "Verification status": `npm run
build` produces a static export of `/`). No `route.ts`/`route.tsx` handlers
exist under `src/app/`, no server actions, no external service calls (the
dialogue system is fully offline — no AI/LLM API involved).

If server API routes are ever added, document them here (method, path,
request/response shape) and cross-link the relevant `docs/*.md` file for the
feature that needed them — don't let this file drift into a duplicate of the
route source.
