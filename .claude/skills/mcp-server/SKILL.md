---
name: mcp-server
description: Design, build, extend, debug, or deploy the in-repo MCP server that exposes Norwegian law Elasticsearch indexes as tools to MCP hosts (Claude Desktop, Cursor, OpenAI Responses API). Use when the user mentions "MCP", "mcp-server/", "add an index", "expose a new tool", "law tools", "index registry", or wants to route law-related queries through tool calls instead of the Next.js `/api/query` pipeline.
---

# MCP Server for Law Indexes

This skill keeps all context needed to work on the MCP server that lives alongside the Next.js app and exposes the law Elasticsearch indexes as MCP tools.

## When to invoke this skill

- User asks about the MCP server, its tools, adding an index, or the index registry.
- User wants to add a new search tool, a new filter, or a new transport.
- User wants to debug why the host LLM (Claude Desktop / Cursor / ChatGPT) is picking the wrong tool.
- User wants to deploy or redeploy the MCP server.
- User references `mcp-server/` paths.

On invocation: read this file, then read `.cursor/plans/mcp_server_for_law_indexes_*.plan.md` (newest) for the authoritative plan. Update this skill and the plan as the implementation progresses.

## Mental model (do not forget)

- **MCP is strict tool-calling, not code generation.** The host LLM produces a JSON args object validated by zod/JSON schema; the pre-written TS handler is the only thing that runs. The LLM never imports modules or writes ES DSL.
- **Dynamism = richer param schemas, not DSL.** If a tool feels rigid, the fix is to add filter params to its schema, not to expose raw ES.
- **Routing across indexes is done by the LLM reading tool `description`s.** Investing in those descriptions is the single biggest lever for answer quality. There is no server-side classifier.
- **The MCP server shares code with Next.js.** Both entrypoints import `app/src/consumers/*` and `app/src/clients/*`. No HTTP hop between them.

## Architecture at a glance

```
mcp-server/                        new package, monorepo
├── src/
│   ├── indexRegistry.ts           single source of truth: index -> {esIndex, title, description, filters (zod), exampleQueries}
│   ├── tools.ts                   factory: registry entry -> MCP tool (name = search_<key>, schema = filters, handler = embed + RRF search)
│   ├── server.ts                  builds McpServer, registers all search tools + list_knowledge_bases + fetch_document
│   ├── stdio.ts                   stdio transport entrypoint (Claude Desktop / Cursor)
│   └── http.ts                    Streamable HTTP transport entrypoint (remote use)
├── package.json                   deps: @modelcontextprotocol/sdk, zod, tsx, express
├── tsconfig.json                  extends root, keeps @/app/* alias
├── Dockerfile
└── fly.toml
```

Imports from existing code — do NOT duplicate:
- `@/app/src/consumers/openAiConsumer` — `embedText`, `moderateContent`
- `@/app/src/consumers/esSearchConsumer` — `searchVectorAndRRFKeyword`, `fetchDocumentsByIds`
- `@/app/src/clients/esClient` — client instances
- `@/app/src/constants/esParameters` — `ELASTICSEARCH_INDEX_SKATT` and future index names

## Tools (v1)

| Tool | Purpose | Notes |
|---|---|---|
| `list_knowledge_bases` | Discovery — returns metadata for every registry entry | Let the LLM orient itself |
| `search_raw_law` | Statutes + regulations (current `ELASTICSEARCH_INDEX_SKATT`) | Filters: `query`, `top_k`, `keywords[]`, `department` |
| `search_legal_processings` (future) | Administrative/legal processing docs | Filters: `query`, `top_k`, `year_from`, `year_to` |
| `search_trial_rulings` (future) | Court rulings | Filters: `query`, `top_k`, `year_from`, `year_to`, `court` enum |
| `fetch_document` | Fetch full doc by index+id after seeing a snippet | Wraps `fetchDocumentsByIds` |
| `multi_search` (optional later) | Fan out a query to multiple indexes in parallel | Only if the host LLM doesn't do this well with multiple tool calls |

Do NOT expose `answer_question`. The host LLM composes answers from tool results.

## Adding a new index — checklist

1. Add an entry to `mcp-server/src/indexRegistry.ts` with `esIndex`, `title`, a strong `description` (include USE/DO NOT USE hints), `filters` zod schema, and 1–3 `exampleQueries`.
2. If the filter has keys beyond `query`/`top_k`/`keywords`, extend the filter-to-ES translator in `tools.ts` (e.g. `year_from` -> range filter on `published_at`).
3. Test locally via Claude Desktop: run `npx tsx mcp-server/src/stdio.ts`, ask a question, verify the host picks the new tool.
4. Deploy the HTTP transport to Fly if the index should be available remotely.
5. Update the "Tools (v1)" table in this skill and the "Tools to expose" section in the plan file.

## Transports

- **stdio** (`stdio.ts`) — for Claude Desktop / Cursor. Registered in `~/Library/Application Support/Claude/claude_desktop_config.json` as `npx tsx <repo>/mcp-server/src/stdio.ts`. Uses the repo's `.env.local` via dotenv load at entrypoint.
- **Streamable HTTP** (`http.ts`) — express-based, bearer-token middleware, deployed as a second Fly app. Follows the existing multi-app pattern (see `CLAUDE.md` lines 85-100, same as `elasticsearch/fly.toml`). Deploy from root: `flyctl deploy --config mcp-server/fly.toml --dockerfile mcp-server/Dockerfile --remote-only`.

## Deployment notes

- Secrets reused from the main app: `OPENAI_API_KEY`, `ELASTICSEARCH_URL`, `ELASTIC_PASSWORD`.
- New secret: `MCP_BEARER_TOKEN` for the HTTP transport.
- Never expose HTTP transport without the bearer middleware.

## Implementation status

Status legend: `[ ]` todo, `[~]` in progress, `[x]` done.

- [ ] **scaffold** — `mcp-server/` package, `package.json`, `tsconfig.json`, install `@modelcontextprotocol/sdk` + `zod` + `tsx`.
- [ ] **registry** — `indexRegistry.ts` with `raw_law` entry.
- [ ] **tools** — `tools.ts` factory + filter-to-ES translator.
- [ ] **server** — `server.ts` registering tools, `list_knowledge_bases`, `fetch_document`.
- [ ] **stdio** — `stdio.ts` entrypoint + Claude Desktop config snippet in README.
- [ ] **http** — `http.ts` streamable-HTTP entrypoint + bearer middleware.
- [ ] **deploy** — `Dockerfile` + `fly.toml` + first deploy.
- [ ] **docs** — Update root `README.md` and `CLAUDE.md` with MCP section.

Update this list in place as work progresses. When a todo is done, flip it to `[x]` and add a one-line note below it if anything surprising came up.

## References

- Plan file: `.cursor/plans/mcp_server_for_law_indexes_*.plan.md` (most recent).
- Current query pipeline this replaces for LLM hosts: `app/src/service/chat/queryService.ts` lines 18-79.
- Existing index constant: `app/src/constants/esParameters.ts`.
- TS SDK: https://github.com/modelcontextprotocol/typescript-sdk.

## Known gotchas

- The existing `searchVectorAndRRFKeyword` uses `getCloudClient()` and passes `body:` (v7-style). When extending with new filter clauses, add them inside the `retriever.rrf.retrievers` array as additional `standard.query.bool` entries, not as a top-level `filter`.
- `embedText` uses the OpenAI model from `openAiParameters.ts`. Any new index must be embedded with the same model; otherwise the vector search is meaningless.
- Conversation history injection from `queryService.ts` lines 37-54 is probably unnecessary in MCP — the host LLM already carries context. Only reintroduce if tool results regress.
