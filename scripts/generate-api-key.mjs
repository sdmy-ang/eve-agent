#!/usr/bin/env node
// Generate an X-Api-Key for the eve channel and append it to .env.local.
// Usage: node scripts/generate-api-key.mjs <client-name> [client-name2 ...]
//        node scripts/generate-api-key.mjs                  # prompts via readline

import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as readline from "node:readline/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, "..", ".env.local");
const KEY_REGEX = /^[A-Za-z0-9_-]+$/;

function generateKey() {
  return randomBytes(32).toString("hex");
}

function parseEnvKeys(line) {
  const value = line.split("=")[1] ?? "";
  return value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

function formatKeys(pairs) {
  return pairs.map(([name, key]) => `${name}:${key}`).join(",");
}

function updateEnvFile(clientName, newKey) {
  const content = readFileSync(ENV_PATH, "utf8");
  const lines = content.split(/\r?\n/);

  let existingPairs = [];
  let lineIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("EVE_API_KEYS=")) {
      lineIdx = i;
      existingPairs = parseEnvKeys(lines[i]).map((entry) => {
        const idx = entry.indexOf(":");
        return idx > 0 ? [entry.slice(0, idx), entry.slice(idx + 1)] : [entry, ""];
      });
      break;
    }
  }

  const dup = existingPairs.find(([n]) => n === clientName);
  if (dup) {
    console.error(`Error: client "${clientName}" already exists in EVE_API_KEYS.`);
    console.error(`  Existing key: ${dup[1].slice(0, 4)}...${dup[1].slice(-4)}`);
    console.error(`  To rotate, remove the entry first or use a different name.`);
    process.exit(1);
  }

  existingPairs.push([clientName, newKey]);
  const newLine = `EVE_API_KEYS=${formatKeys(existingPairs)}`;

  if (lineIdx >= 0) {
    lines[lineIdx] = newLine;
  } else {
    lines.push("");
    lines.push("# Route-auth API keys for agent/channels/eve.ts");
    lines.push("# Format: client-name:key,client-name:key (comma-separated)");
    lines.push("# The client sends the key via the X-Api-Key header.");
    lines.push(newLine);
  }

  writeFileSync(ENV_PATH, lines.join("\r\n"), "utf8");
}

async function main() {
  const args = process.argv.slice(2);
  let clientNames = args;

  if (clientNames.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await rl.question("Client name (e.g. frontend, cli, dashboard): ");
    rl.close();
    clientNames = [answer.trim()];
  }

  for (const name of clientNames) {
    if (!KEY_REGEX.test(name)) {
      console.error(`Error: client name "${name}" contains invalid characters.`);
      console.error("  Allowed: letters, digits, hyphens, underscores.");
      process.exit(1);
    }

    const key = generateKey();
    updateEnvFile(name, key);
    console.log(`Added client "${name}" to .env.local`);
    console.log(`  X-Api-Key: ${key}`);
    console.log();
  }

  console.log("Done. Share the key(s) with the respective clients.");
  console.log("Restart the eve dev server for changes to take effect.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});