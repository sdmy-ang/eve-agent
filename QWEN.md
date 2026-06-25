# Planning2 — Eve Agent App

## Project Overview

This is an [eve](https://eve.dev) framework application — a filesystem-first AI agent built in TypeScript. The eve framework (by Vercel, beta) lets you define durable agents as ordinary files: instructions, tools, skills, and channels each live in predictable locations under `agent/`.

**Current agent configuration:**
- **Model:** MiniMax-M3 via `vercel-minimax-ai-provider` (direct provider object, not gateway string)
- **Context window:** 1,000,000 tokens
- **Code mode:** enabled (experimental — routes executable tools through a sandboxed code-execution wrapper)
- **Instructions:** Minimal — "You are a helpful assistant." (defined in `agent/instructions.md`)
- **Channel:** `eve` channel with `localDev`, `vercelOidc`, and `placeholderAuth` authentication strategies

The `tmp-repo/` directory contains a vendored copy of Matt Pocock's engineering skills (MIT-licensed): `grill-with-docs`, `tdd`, `to-prd`, and `to-issues`. These define a spec-to-ship workflow chain for agentic coding.

## Tech Stack

| Dependency | Version | Purpose |
|---|---|---|
| `eve` | `^0.13.3` | Agent framework — filesystem-first, durable sessions |
| `ai` | `7.0.0-beta.178` | Vercel AI SDK — model abstraction layer |
| `vercel-minimax-ai-provider` | `^0.0.2` | MiniMax model provider for AI SDK |
| `zod` | `4.4.3` | Schema validation (used by tools and skills) |
| `@vercel/connect` | `0.2.2` | Vercel connection integration |
| `typescript` | `7.0.1-rc` | Type checking (no emit — `noEmit: true`) |
| `@types/node` | `24.x` | Node.js type definitions |

**Runtime:** Node.js 24.x (enforced via `engines` field)

## Building and Running

```bash
npm run dev        # Start dev server (eve dev) — local development with REPL
npm run build      # Build the agent (eve build)
npm run start      # Start the built agent (eve start)
npm run typecheck  # Run TypeScript type checker (tsc, no emit)
```

**Environment variables:** MiniMax API key must be set for the provider. Check `.env*` patterns (git-ignored).

## Project Structure

```
Planning2/
├── package.json              # Scripts, dependencies, path aliases
├── tsconfig.json             # TS config — ES2022, NodeNext, strict
├── AGENTS.md                 # Points to eve docs in node_modules/eve/docs/
├── CLAUDE.md                 # Alias for AGENTS.md
├── .gitignore                # Ignores node_modules, .eve, .env*, .workflow-data, build output
├── .vercelignore             # Vercel deployment exclusions
├── agent/
│   ├── agent.ts              # defineAgent() — model config, experimental flags
│   ├── instructions.md       # System prompt (currently minimal)
│   └── channels/
│       └── eve.ts            # Eve channel with auth strategies
├── tmp-repo/                 # Vendored skills (MIT, Matt Pocock)
│   ├── LICENSE
│   └── skills/engineering/
│       ├── grill-with-docs/  # Interview skill for plan sharpening + ADRs
│       ├── tdd/              # Test-driven development skill
│       ├── to-prd/           # Conversation → PRD → issue tracker
│       └── to-issues/        # PRD → vertical-slice issues
└── node_modules/eve/docs/    # Full eve framework documentation (read before coding)
```

### Path Aliases (package.json `imports`)

- `#*` → `./agent/*` — agent module imports
- `#evals/*` → `./evals/*` — eval test imports

## Development Conventions

### Eve Framework Conventions

1. **Filesystem-first:** A file's location determines its role. No separate registries — add a file and eve discovers it.
2. **Path-derived naming:** `agent/tools/get_weather.ts` → tool named `get_weather`. Never write `name` or `id` fields on `define*` calls.
3. **Before writing code**, always read the relevant guide in `node_modules/eve/docs/` (per AGENTS.md).
4. **`defineAgent` is the root config** in `agent/agent.ts`. `model` is required when `agent.ts` is present.
5. **Instructions go in `agent/instructions.md`** — this is the always-on system prompt.
6. **Channels are root-only** — defined in `agent/channels/`, connect the agent to HTTP, Slack, Discord, etc.
7. **Skills are on-demand** — loaded via `load_skill` tool only when a turn calls for them (progressive disclosure).
8. **Sandbox workspace** — only `skills/` files and `sandbox/workspace/**` files reach the runtime workspace.

### TypeScript Conventions

- **Target:** ES2022, **Module:** NodeNext, **Module resolution:** NodeNext
- **Strict mode** enabled
- **No emit** — `tsc` is for type checking only; eve handles compilation
- **ESM** — `"type": "module"` in package.json

### Vendored Skills (tmp-repo/)

The engineering skills in `tmp-repo/skills/engineering/` define a spec-to-ship workflow chain:

1. **`grill-with-docs`** — Relentless interview to sharpen a plan/design, produces ADRs and glossary
2. **`to-prd`** — Synthesizes conversation into a PRD, publishes to issue tracker
3. **`to-issues`** — Breaks PRD into vertical-slice (tracer-bullet) issues
4. **`tdd`** — Test-driven development with red-green-refactor discipline

These are reference skill definitions (MIT-licensed, by Matt Pocock), not yet integrated into the eve agent's `agent/skills/` directory.

### Key Eve Docs to Read

When working on this project, consult these docs in `node_modules/eve/docs/`:

- `introduction.mdx` — How eve projects are structured
- `agent-config.md` — `defineAgent` fields and model configuration
- `reference/project-layout.md` — Full slot table for `agent/` directory
- `skills.mdx` — How to author skills (markdown vs `defineSkill`)
- `channels/overview.mdx` — Channel system overview
- `getting-started.mdx` — Quick start guide