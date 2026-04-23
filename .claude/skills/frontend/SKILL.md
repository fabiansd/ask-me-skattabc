---
name: optimalskatt-frontend
description: Build, maintain, or extend the Optimalskatt Next.js 14 frontend (chat UI, conversation history, sources sidebar, account, info). Use when the user asks to change the UI, add a frontend feature, fix a styling or mobile bug, adjust the design system, work with DaisyUI/Tailwind in this repo, or run/extend the Playwright end-to-end suite.
---

# Optimalskatt Frontend

A reusable workspace guide for frontend work on this repo. Read this whole file before making changes; consult `DESIGN_SYSTEM.md` and `BEHAVIOR_MAP.md` when you need tokens or flow specifics.

## Stack

- **Next.js 14** App Router, React 18, TypeScript, `output: 'standalone'`
- **Tailwind CSS 3** + **DaisyUI 4** (custom `optimalskatt` theme — see `DESIGN_SYSTEM.md`)
- **next-auth** with Google OAuth (`app/api/auth/[...nextauth]/route.ts`)
- **react-markdown** for streamed answers
- **Playwright** for visual + e2e; Jest + RTL for unit/integration
- Local dev DB: Postgres on `localhost:5433` (auto-started by `npm run dev`); Elasticsearch via `flyctl proxy`

## Entry points

| Surface                       | File                                                                     |
| ----------------------------- | ------------------------------------------------------------------------ |
| Root layout + theme + fonts   | `app/layout.tsx`                                                         |
| Global CSS                    | `app/globals.css`                                                        |
| Chat page                     | `app/page.tsx`                                                           |
| Account                       | `app/account/page.tsx`                                                   |
| Info / feedback               | `app/info/page.tsx`                                                      |
| Header                        | `app/src/components/navigation/header.tsx`                               |
| Welcome modal                 | `app/src/components/modals/WelcomeModal.tsx`                             |
| Chat bubbles / stream         | `app/src/components/textManagement/markdownTextDisplay.tsx`              |
| Search textarea               | `app/src/components/chat/SearchInput.tsx`                                |
| Keyword input + tags          | `app/src/components/chat/{KeywordInput,KeywordTags}.tsx`                 |
| Submit button                 | `app/src/components/buttons/SearchButton.tsx`                            |
| Detaljert/Konkret toggle      | `app/src/components/buttons/ToggleModelDepth.tsx`                        |
| Scroll-to-bottom              | `app/src/components/buttons/ScrollToBottomButton.tsx`                    |
| Collapse input toggle         | `app/src/components/buttons/CollapseToggle.tsx`                          |
| Chat layout + sidebar trigger | `app/src/components/layout/ChatLayout.tsx`                               |
| Conversation sidebar          | `app/src/components/navigation/ConversationSidebar.tsx`                  |
| Conversation list + delete    | `app/src/components/layout/ConversationList.tsx`                         |
| Sources drawer                | `app/src/components/navigation/SourcesSidebar.tsx`                       |
| Shared primitives             | `app/src/components/common/` (`Button`, `Card`, `Tooltip`, `IconButton`) |
| Conversation context          | `app/src/contexts/ConversationContext.tsx`                               |

## Data contracts (do NOT change as part of UI work)

The UI talks to these endpoints. Shapes and URLs are frozen — any UI change must preserve them.

- `POST /api/query?auth_id=<id>` — streamed plain text, final chunk is a JSON `{ "conversation_id": number }`. Body: `QueryChatRequest` (`searchText`, `tags?`, `isDetailed`, `conversation_id?`).
- `GET  /api/conversations?auth_id=<id>` → `ConversationsList[]` (`id`, `title`, `lastMessage`, `timestamp`)
- `GET  /api/conversations/:id/messages?auth_id=<id>` → `ConversationMessage[]`
- `DELETE /api/conversations/:id/messages?auth_id=<id>` → `{ success: true }`
- `GET  /api/messages/:id/sources` → `{ sources: ESDocument[] }`
- `POST /api/postgres/feedback` — body: `{ feedback: UserFeedbackInput }`
- `GET  /api/health?username=<id>`

`getUserId(session)` returns `session.user.id` if signed in, else the string `"default"`. Anonymous users are first-class: all endpoints accept `auth_id=default`.

## Guardrails

Do not modify these as part of frontend work:

- `app/api/**`
- `app/src/service/**`
- `app/src/consumers/**`
- `app/src/clients/**` (esUtil types)
- `app/src/interface/**` (API DTOs)
- `prisma/**`
- `instrumentation.ts` (only touch if the dev-bootstrap behavior itself is the task)

Preserve across redesigns:

- All `data-*` attributes the Playwright suite uses (see `BEHAVIOR_MAP.md`)
- The streaming protocol (text chunks with a trailing JSON `{conversation_id}` chunk)
- `sessionStorage` keys: `searchInput`, `keywords`, `currentConversationId`, `welcomeModalDismissed`

## Local dev workflow

```bash
# Full local (needs podman/docker + flyctl for ES)
npm run dev                         # boots Postgres on 5433, migrates, starts Next on 3000

# Pure-UI work with no external services (recommended for styling)
USE_MOCK_DATA=true npm run dev      # /api/query returns a canned streamed answer
```

For anonymous UI-only work: no Google OAuth needed. `getUserId` returns `"default"`, the backend will create/list/delete conversations for that pseudo-user, and with `USE_MOCK_DATA=true` there's no OpenAI or Elasticsearch dependency.

## Playwright harness

Two suites, two configs:

- **Visual** (preview pages only) — `playwright.config.ts` → `e2e/visual/*.spec.ts`
  - Boots the standalone prod build with `ENABLE_DEV_PREVIEWS=true`, renders `/dev/*` preview routes against mocked props, captures screenshots. Run with `npm run test:visual`.
- **E2E flows** (the real app end-to-end) — `playwright.e2e.config.ts` → `e2e/flows/*.spec.ts`
  - Boots `npm run dev` with `USE_MOCK_DATA=true`, exercises the real UI as an anonymous user. Run with `npm run e2e`.

When you change UI, update the specs if behavior changed and run both suites. See `BEHAVIOR_MAP.md` for the full assertion map.

## Design system

Summary: light theme, ivory `#FBF8F1` background, deep navy `#1F3A5F` primary, muted gold `#B08A3E` secondary, burgundy `#7D3C2E` for destructive. Display type: `Fraunces` (serif). Body: `Inter`. Tokens and primitive APIs are in `DESIGN_SYSTEM.md`.

Shared component primitives under `app/src/components/common/` — prefer these over inline Tailwind + DaisyUI classes:

- `<Button variant="primary|secondary|ghost|danger" size="sm|md" loading />`
- `<Card variant="surface|elevated">`
- `<Tooltip text>`
- `<IconButton label>`

## Workflow for a new frontend task

1. Read `BEHAVIOR_MAP.md` to understand what must not break.
2. `git checkout -b <type>/<slug>` off `develop`.
3. Implement. Prefer editing existing components. Use `common/*` primitives. Use theme tokens (`bg-primary`, `text-base-content`) over raw colors.
4. `npm run e2e` and `npm run test:visual` — both must stay green.
5. `npm run lint && npm run type-check && npm run test`.
6. Append a dated entry to the **Progress log** below summarizing what changed and any newly-frozen contracts.

## Progress log

- `2026-04-22` — Skill created during the law-firm redesign. Baseline: dark DaisyUI theme, ad-hoc `bg-sky-700` accents, `position: fixed` mobile hack in `globals.css`, two duplicate ViewSourcesButton renders in `markdownTextDisplay.tsx`. Branch `redesign/law-firm-lightmode` kicks off the revamp described in `.cursor/plans/law-firm-frontend-revamp_*.plan.md`.
- `2026-04-22` — Revamp shipped in one pass. Summary:
  - New light `optimalskatt` DaisyUI theme (ivory / navy / gold / burgundy) defined in `tailwind.config.ts`. Removed duplicate `tailwind.config.js`, `postcss.config.mjs`, `next.config.mjs` stubs that were shadowing the real configs.
  - `next/font` wired for Fraunces (serif) and Inter (sans) with CSS variables `--font-serif` / `--font-sans`. Legacy `bg-sky-700`, `bg-red-500`, `bg-green-600` etc removed. The old `position: fixed` mobile hack in `globals.css` is gone; the layout now uses `min-h-[100dvh]` + flex columns.
  - Created primitives `Button`, `Card`, `IconButton` in `app/src/components/common/`; restyled `Tooltip`.
  - Restyled every component under `buttons/*`, `chat/*`, `layout/*`, `modals/*`, `navigation/*`, `textManagement/*`, plus `/`, `/account`, `/info`.
  - New chat empty-state hero with three example prompts on the main page; streaming caret for in-progress assistant messages.
  - Added `data-testid` selectors throughout — see `BEHAVIOR_MAP.md`. The visual Playwright harness (`e2e/visual/sources-sidebar.spec.ts`) still passes because `SourcesSidebar` keeps its `initialSources` escape hatch and `[data-sidebar="sources"]` root selector.
  - Verified: `npx tsc --noEmit` clean, `npm run lint` zero errors (pre-existing warnings untouched), `npm test` 89/89 pass (snapshots regenerated for `KeywordTags`, `Tooltip`, `ScrollToBottomButton`), `npm run build` succeeds with `SKIP_INSTRUMENTATION=true`.
  - Freeze points carried forward: `getUserId`, all API routes, `sessionStorage` keys, streaming protocol with trailing `{conversation_id}` JSON chunk.

## Additional resources

- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — color tokens, typography scale, spacing, component primitive API
- [`BEHAVIOR_MAP.md`](BEHAVIOR_MAP.md) — every flow the Playwright suite asserts, with selectors
