# Behavior Map

Every user-visible flow the Playwright suite asserts. If you change the UI, this file plus `e2e/flows/*.spec.ts` tell you what must continue to work. Selectors are listed so future redesigns can preserve them.

> Populated at the end of Phase 1 of the revamp. Update alongside any spec change.

## Conventions

- Anonymous user: `getUserId(session)` returns `"default"` when `session` is null. The backend creates the default user on demand.
- Mock mode: `USE_MOCK_DATA=true` makes `/api/query` return a canned stream without calling OpenAI / Elasticsearch. See `tests/mockData.ts`.
- All e2e specs run under `USE_MOCK_DATA=true` and as the anonymous `"default"` user.

## Selectors

Stable selectors the specs rely on (preserve these across redesigns):

- Page chrome
  - `data-testid="app-header"` — header
  - `data-testid="nav-info"`, `data-testid="nav-account"` — header links
  - `a[href="/"]` with text `Optimalskatt` — wordmark
- Chat
  - `data-testid="search-input"` — the main textarea
  - `data-testid="keyword-input"` — keyword text input
  - `data-testid="keyword-add"` — keyword "+"
  - `data-testid="keyword-tag"` — rendered keyword chip
  - `data-testid="toggle-model-depth"` — segmented control root (`data-state="konkret|detaljert"`)
  - `data-testid="submit-query"` — submit button
  - `data-testid="chat-message"` — each bubble, plus `data-role="user|assistant"`
  - `data-testid="view-sources"` — sources button on assistant bubbles
  - `data-testid="collapse-toggle"` — input-area collapse chevron
  - `data-testid="scroll-to-bottom"` — floating scroll button
- Conversations
  - `data-testid="sidebar-toggle"` — left tab to open drawer
  - `data-testid="conversation-sidebar"` — drawer root
  - `data-testid="new-conversation"` — "+ Ny samtale"
  - `data-testid="conversation-item"` — list item (with `aria-current="true"` when selected)
  - `data-testid="delete-conversation"` — trash icon (revealed on hover or tap)
- Sources
  - `data-sidebar="sources"` — drawer root (preserved from pre-revamp)
  - `data-testid="sources-prev"`, `data-testid="sources-next"`
- Welcome
  - `data-testid="welcome-modal"` — modal root
  - `data-testid="welcome-dismiss"` — "Fortsett uten innlogging"

## Flows asserted by `e2e/flows/*.spec.ts`

### `chat.spec.ts`

1. Loads `/`, hero empty state visible.
2. Type a question into `search-input`, submit via button — a user bubble then an assistant bubble appear with streamed mock content.
3. Submit via Enter key; Shift+Enter inserts a newline without submitting.
4. `search-input` is cleared after a successful submission and `sessionStorage.searchInput` is removed.
5. Detaljert/Konkret toggle flips `data-state` and persists across a page reload? (Session-only; not persisted — asserted as not-persisted.)
6. Adding a keyword via "+" renders a `keyword-tag`; clicking a tag removes it; tags are included in the request body as `tags`.
7. `collapse-toggle` hides the input area; clicking again restores it.
8. `scroll-to-bottom` appears when chat content overflows and is scrolled up.

### `conversations.spec.ts`

1. Submitting a first message creates a conversation; the drawer opens and the new item appears at the top.
2. Clicking "+ Ny samtale" clears `currentConversationId` and the chat area; a second submit creates a second conversation.
3. Switching between conversations loads that conversation's messages.
4. Deleting a non-current conversation removes it from the list; count footer updates.
5. Deleting the current conversation resets the view to the empty state and starts a new one.

### `sources.spec.ts`

1. Clicking `view-sources` on an assistant bubble opens `[data-sidebar="sources"]`.
2. Prev/Next cycles through sources; index wraps at both ends.
3. Clicking outside the drawer closes it.

### `welcome.spec.ts`

1. On first unauthed load, `welcome-modal` appears after ≈ 2000 ms.
2. Escape key closes it.
3. Clicking `welcome-dismiss` hides it and sets `sessionStorage.welcomeModalDismissed="true"`.
4. Second load within the same session does NOT show the modal.

### `navigation.spec.ts`

1. Header `nav-info` navigates to `/info`; the manual headings and the feedback textarea render.
2. Typing feedback + Send triggers a POST to `/api/postgres/feedback` and shows a success toast.
3. Header `nav-account` navigates to `/account`; when unauthed the "Logg inn med Google" CTA is visible.

### `mobile.spec.ts`

All of the above against the iPhone 13 viewport (390×844). Additionally:

1. Sidebar drawer is full-width on mobile and has a visible backdrop.
2. Input bar respects `env(safe-area-inset-bottom)`.
3. Scrolling the chat does not cause the address bar / viewport to jump.

## Visual tests (`e2e/visual/*.spec.ts`)

- `sources-sidebar.spec.ts` — renders `/dev/sources-preview` and captures screenshots at mobile/tablet/desktop. Requires `ENABLE_DEV_PREVIEWS=true` on the test server.

Add a new preview page under `app/dev/<name>/` when a component is hard to exercise from the real UI (empty states, loading states, destructive confirms).
