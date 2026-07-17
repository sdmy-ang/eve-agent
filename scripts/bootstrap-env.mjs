#!/usr/bin/env node
// Bootstrap `.env.local` from the committed `.env.example` template on a
// fresh clone. Runs as a `postinstall` step. Safe to re-run — never
// overwrites an existing `.env.local`.

import { existsSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const template = resolve(root, ".env.example");
const target = resolve(root, ".env.local");

if (!existsSync(template)) {
  console.warn("[bootstrap-env] No .env.example found at repo root — skipping.");
  console.warn("            (Did you forget to commit the template?)");
  process.exit(0);
}

if (existsSync(target)) {
  console.log("[bootstrap-env] .env.local already exists — leaving it alone.");
  process.exit(0);
}

copyFileSync(template, target);
console.log("[bootstrap-env] Created .env.local from .env.example.");
console.log("                Fill in your API keys, then run: npm run dev");