# Context

This repo is an [Eve](https://eve.dev) agent application — a filesystem-first AI agent that runs as a Vercel-deployable Nuxt app. The Eve framework auto-discovers files under `agent/` by their location; the agent's model, instructions, channels, tools, and skills are all defined by what files exist where.

## Glossary

Canonical terms. Use these in commits, issues, ADRs, and code comments. The **Avoid** column lists synonyms that have appeared in this codebase or in casual discussion and should NOT be used in new work — they create ambiguity with adjacent concepts.

| Term | Definition | Avoid |
|---|---|---|
| **Agent** | The Eve `defineAgent()` instance defined at `agent/agent.ts`. The runtime entity that responds to chat. Identified by `model` + `modelContextWindowTokens`. | "bot", "assistant", "service" |
| **Session** | A durable per-conversation state in Eve. Identified by a session id, addressed at `/eve/v1/session*`. | "chat"; "conversation" is fine in user-facing copy, not in technical docs |
| **Tool** | A file under `agent/tools/`, auto-discovered by Eve. Filename = tool name (e.g. `agent/tools/get_weather.ts` → tool `get_weather`). | "function", "action", "command" |
| **Skill** | An on-demand capability loaded via `load_skill`. Markdown under `skills/`, or `defineSkill()` block. Always loaded via progressive disclosure — not eagerly available like a tool. | "subagent", "plugin" (in Eve-specific docs) |
| **Channel** | A transport adapter in `agent/channels/`. Defines how requests reach the agent. This repo currently has only the `eve` HTTP channel. | "endpoint", "route" (in agent-doc context — those are HTTP concepts the channel implements, not Eve concepts) |
| **Authenticator** | A function in an auth walk that resolves a request to a session identity, or returns null to fall through. | "auth handler", "auth middleware" |
| **Auth walk** | The ordered list of authenticators passed to `eveChannel({ auth: [...] })`. First non-null result wins; the rest are skipped. | "auth chain", "auth pipeline" |
| **Principal** | The authenticated entity returned by an authenticator. Has `id`, `type`, `attributes`. | "user" (most principals in this repo are service-type, not human) |
| **API key principal** | A service-type principal keyed by `EVE_API_KEYS=client-name:key`. The `client-name` becomes the `principalId` for per-caller audit in `ctx.session.auth.current`. | — |
| **Loopback auth** | The `localDev()` authenticator. Trusts requests from loopback addresses (127.0.0.1, ::1) and skips API-key checks. Gated by `EVE_ENABLE_LOCAL_DEV=true`; never enable in production. | "dev auth" (ambiguous — could mean anything) |
| **Context window** | The maximum number of tokens the model attends to. Set via `modelContextWindowTokens` in `defineAgent`. 1_000_000 for MiniMax-M3, 131_072 for Ollama. | "max tokens" (Eve exposes the size, not a token-budget concept) |
| **Sandbox workspace** | The runtime file scope: only `skills/` files and `sandbox/workspace/**` files are visible to agent code. | "filesystem", "working dir" |

## Out of scope

- Project-specific UI/UX copy. This file covers technical concepts only.
- Internal Eve framework internals — only the parts surfaced in this repo are defined here.

## How this file is maintained

`/domain-modeling` and `/grill-with-docs` update this file inline when terms get resolved. New glossary entries appear here as decisions land. Avoid-list entries are added when an ambiguous synonym is identified, not preemptively.

## Status

First-pass seed (2026-07-14). Glossary entries were inferred from the current `agent/` layout, `agent/channels/eve.ts`, and the Eve framework docs in `node_modules/eve/docs/`. Expect refinement after the next `/grill-with-docs` or `/domain-modeling` pass.