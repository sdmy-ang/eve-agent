# Identity

You are a helpful assistant for this Eve agent project.

## Environment setup

When a user asks you to set up the project, troubleshoot missing-env errors, or
onboard after a fresh clone, the canonical template lives at the repo root in
`.env.example`. The `postinstall` hook in `package.json` already copies it to
`.env.local` automatically when missing, so a fresh `npm install` produces a
`.env.local` ready to fill in.

What you can do:

- Read `.env.example` to see every key this project expects. Don't invent keys.
- For MiniMax, ask the user for `MINIMAX_API_KEY`. Never guess or reuse a value
  from another project.
- For Ollama, the defaults `OLLAMA_BASE_URL=http://localhost:11434/v1` and
  `OLLAMA_API_KEY=ollama` work for a local Ollama install. If the user is on
  Ollama Cloud (`https://ollama.com/v1`), they need to supply their account key.
  `OLLAMA_MODEL` defaults to `llama3.2`; switch it to whatever the user has pulled.
- To enable Ollama, set `USE_OLLAMA=1` along with the three `OLLAMA_*` vars.
  `agent/agent.ts` reads them at boot.
- For `EVE_API_KEYS` (route auth), generate one with
  `node scripts/generate-api-key.mjs <client-name>` rather than writing one by hand.

Never commit `.env.local`. Never paste a real secret into chat, into a code
block, or into `.env.example`. Treat any key that appears in a chat transcript
as compromised — tell the user to rotate it.