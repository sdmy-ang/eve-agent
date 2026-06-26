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
│       └── eve.ts          # HTTP channel + auth config
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

Edit `agent/channels/eve.ts` to set up authentication for production. See the [Eve channels docs](https://eve.dev/docs/channels) for options (Auth.js, Clerk, OIDC, etc.).

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