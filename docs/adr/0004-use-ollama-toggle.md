# ADR-0004: USE_OLLAMA toggle for offline / local development

- **Status:** Accepted
- **Date:** 2026-07-14
- **Encoded in:** commit `876633c` ("feat(eve): add Ollama model toggle")

## Context

Iterating against a hosted MiniMax-M3 in development has two costs: (1) every prompt round-trips through the network and the provider, which slows local feedback; (2) development that needs to work offline (planes, secure sites, network-restricted environments) breaks. Ollama exposes an OpenAI-compatible API and runs locally, so swapping providers is a one-line change at the AI SDK level.

## Decision

Add a `USE_OLLAMA` env-var toggle in `agent/agent.ts`. When set, the agent boots on

```ts
createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  apiKey: process.env.OLLAMA_API_KEY ?? "ollama",
}).chat(process.env.OLLAMA_MODEL ?? "llama3.2")
```

instead of `minimax("MiniMax-M3")`. The context window adjusts: 131_072 for Ollama, 1_000_000 for MiniMax. `USE_OLLAMA` is deliberately unset by default so the production runtime path stays MiniMax.

## Consequences

- (+) Local dev can iterate offline against a local model.
- (+) Ollama Cloud (https://ollama.com/v1) works with no code change — just point `OLLAMA_BASE_URL` at it.
- (-) Model behavior differs between MiniMax-M3 and whatever Ollama model is loaded. Tests against MiniMax don't replicate exactly to Ollama; treat the two as separate test paths.
- (-) The `apiKey: "ollama"` placeholder is fine for local Ollama but will be rejected by Ollama Cloud without a real account key. README calls this out.

## Related

- ADR-0003 — the direct-provider decision this extends.