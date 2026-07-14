# Eve Agent Template

A starter template for building AI agents with [Vercel Eve](https://eve.dev) — filesystem-first framework for durable AI agents. Includes a Nuxt (Vue) chat UI frontend.

## Stack

- **Agent framework:** [Eve](https://eve.dev) v0.23+
- **Frontend:** [Nuxt](https://nuxt.com) v4 + `eve/nuxt` module
- **Model:** MiniMax-M3 (via `vercel-minimax-ai-provider`); swap to Ollama with `USE_OLLAMA=1`
- **Language:** TypeScript
- **Node:** 24+

## Project Structure

```
├── agent/
│   ├── agent.ts            # Agent definition (model, config)
│   ├── instructions.md     # System prompt
│   └── channels/
│       └── eve.ts          # HTTP channel + X-Api-Key auth config
├── scripts/
│   ├── generate-api-key.mjs # Generate and append API keys to .env.local
│   └── test-api-keys.mjs    # Unit test for the apiKeys() AuthFn
├── app.vue                 # Nuxt chat UI (useEveAgent hook)
├── nuxt.config.ts          # Nuxt config with eve/nuxt module + devtools timeline
├── package.json
└── tsconfig.json
```

## Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Set environment variables

Create a `.env.local` (gitignored) with the variables you need:

```sh
# Required for the default MiniMax-M3 model
MINIMAX_API_KEY=your-key-here

# Optional: switch to a local or Ollama Cloud model instead of MiniMax
USE_OLLAMA=1
OLLAMA_BASE_URL=http://localhost:11434/v1   # Ollama Cloud: https://ollama.com/v1
OLLAMA_API_KEY=ollama                        # placeholder for local; Ollama Cloud uses your account key
OLLAMA_MODEL=llama3.2

# Optional: allow the eve dev TUI to connect via loopback. NEVER set in production.
EVE_ENABLE_LOCAL_DEV=true
```

### 3. Run the dev server

```sh
# Disable Nuxt telemetry prompt (one-time)
set NUXT_TELEMETRY_DISABLED=1

# Start Nuxt + Eve agent together
npm run dev
```

Open `http://localhost:3000` — the chat UI connects to the Eve agent on the same origin.

### 4. Build for production

```sh
npm run build
npm run preview
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Nuxt dev server (includes Eve agent) |
| `npm run build` | Build Nuxt + Eve for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run dev:agent` | Start Eve agent dev server only (no UI) |
| `npm run build:agent` | Build Eve agent only |
| `npm run start:agent` | Start the built Eve agent server |

## Customization

### Change the model

Edit `agent/agent.ts`:

```ts
import { defineAgent } from "eve";
import { openai } from "@ai-sdk/openai";

export default defineAgent({
  model: openai("gpt-4o"),
});
```

See all available providers in the [Eve docs](https://eve.dev/docs/introduction).

### Switch to Ollama

Set `USE_OLLAMA=1` (alongside `OLLAMA_BASE_URL` / `OLLAMA_API_KEY` / `OLLAMA_MODEL`) and `agent/agent.ts` will boot on the OpenAI-compatible Ollama endpoint instead of MiniMax. The context window adjusts automatically (131_072 for Ollama, 1_000_000 for MiniMax). Useful for offline development against a local model.

### Update the system prompt

Edit `agent/instructions.md` — this is the agent's identity and behavior.

### Configure auth

The eve channel uses a custom `X-Api-Key` authenticator. Clients must send a valid key in the `X-Api-Key` header on every `/eve/v1/session*` request. Keys are stored in `.env.local` as `EVE_API_KEYS=client-name:key,client-name:key`.

**Generate a new client key:**

```sh
node scripts/generate-api-key.mjs <client-name>
# e.g. node scripts/generate-api-key.mjs frontend
```

The script generates a 256-bit hex key, appends it to `.env.local`, and prints the key to share with the client. Duplicate client names are rejected.

**How it works:**

- `agent/channels/eve.ts` walks `localDev() (conditional) -> apiKeys() -> vercelOidc() -> placeholderAuth()` in order.
- If `EVE_ENABLE_LOCAL_DEV=true`, `localDev()` is prepended for the eve dev TUI. **Leave it unset/false in production** — `localDev()` accepts any request from a loopback address and skips API-key checks, so a co-resident attacker (malicious dep, RCE in another service, DNS rebinding) could otherwise bypass auth via SSRF.
- `apiKeys()` parses `EVE_API_KEYS` and maps each key to a `principalId` (the client name) for per-caller audit in `ctx.session.auth.current`.
- Missing or invalid keys fall through to `vercelOidc()` (Vercel infra) then `placeholderAuth()` (401 in production).
- `GET /eve/v1/health` is always public (no auth required).

See the [Eve auth docs](https://eve.dev/docs/guides/auth-and-route-protection) for the full route auth model.

## Deploy

This template deploys as a single project on Vercel — the Nuxt app and Eve agent run on the same origin.

```sh
# Vercel
vercel
```

For self-hosted (non-Vercel):

```sh
EVE_NUXT_PRODUCTION_ORIGIN=https://your-domain.com npm run build
npm run preview
```

## Resources

- [Eve Documentation](https://eve.dev/docs/introduction)
- [Eve Nuxt Guide](https://eve.dev/docs/guides/frontend/nuxt)
- [Vercel AI SDK](https://ai-sdk.dev)
- [Nuxt Documentation](https://nuxt.com)

## License

MIT