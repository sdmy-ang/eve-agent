# Eve Agent Template

A starter template for building AI agents with [Vercel Eve](https://eve.dev) — filesystem-first framework for durable AI agents. Includes a Nuxt (Vue) chat UI frontend.

## Stack

- **Agent framework:** [Eve](https://eve.dev) v0.15+
- **Frontend:** [Nuxt](https://nuxt.com) v4 + `eve/nuxt` module
- **Model:** MiniMax-M3 (via `vercel-minimax-ai-provider`)
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

Create a `.env` file with your model API key:

```sh
AI_GATEWAY_API_KEY=your-key-here
# Or use a direct provider key:
MINIMAX_API_KEY=your-key-here
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

- `agent/channels/eve.ts` walks `apiKeys() -> vercelOidc() -> placeholderAuth()` in order.
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