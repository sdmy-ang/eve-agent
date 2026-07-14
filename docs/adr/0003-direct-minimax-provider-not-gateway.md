# ADR-0003: Direct MiniMax provider, not gateway

- **Status:** Accepted
- **Date:** 2026-07-14
- **Encoded in:** current `agent/agent.ts`

## Context

The Vercel AI SDK supports two ways to wire a model: a gateway string (e.g. `gateway("provider/model")`) or a direct provider object (e.g. `minimax("MiniMax-M3")`). The gateway adds routing, caching, and a single billing surface at the cost of an extra hop and a dependency on gateway availability.

## Decision

Use `vercel-minimax-ai-provider`'s `minimax("MiniMax-M3")` direct provider object. The agent reads its API key from `MINIMAX_API_KEY` directly. No AI gateway is in the request path.

## Consequences

- (+) One fewer dependency in the call path — no gateway outage mode to design for.
- (+) Direct provider pricing/billing — what MiniMax charges is what we pay.
- (-) No gateway-side request caching. If we add multiple model providers later, each brings its own key.
- (-) Switching providers requires editing `agent/agent.ts`, not just env vars. The `USE_OLLAMA` toggle (see ADR-0004) is the deliberate exception.

## Related

- ADR-0004 — the offline/local-dev provider toggle.