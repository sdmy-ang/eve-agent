// Inline reproduction of the apiKeys() AuthFn body from agent/channels/eve.ts
// Same algorithm — same parse-and-lookup behavior. Run with: node scripts/test-api-keys.mjs

function apiKeys(EVE_API_KEYS) {
  const map = new Map();
  for (const pair of (EVE_API_KEYS ?? "").split(",")) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx <= 0) continue;
    map.set(trimmed.slice(idx + 1), trimmed.slice(0, idx));
  }
  return async (request) => {
    const sent = request.headers.get("x-api-key");
    if (!sent || !map.has(sent)) return null;
    return {
      authenticator: "api-key",
      principalId: map.get(sent),
      principalType: "service",
      attributes: {},
    };
  };
}

const fakeRequest = (headerValue) => ({
  headers: {
    get: (name) => (name.toLowerCase() === "x-api-key" ? headerValue : null),
  },
});

async function main() {
  const env =
    "client-a:09fcbf5798d837a22dc8e534b0d2e4a297f0426483ab69e981f9d91aac75edd1," +
    "client-b:2b9e0d4aaaa4fake2222222222222222222222222222222222222222bbbbee";

  const auth = apiKeys(env);

  const cases = [
    { label: "no header", value: null },
    { label: "empty header", value: "" },
    { label: "wrong key", value: "definitely-not-it" },
    { label: "right key (client-a)", value: "09fcbf5798d837a22dc8e534b0d2e4a297f0426483ab69e981f9d91aac75edd1" },
    { label: "right key (client-b)", value: "2b9e0d4aaaa4fake2222222222222222222222222222222222222222bbbbee" },
    { label: "prefix-but-wrong", value: "09fcbf5798d837a2" },
    { label: "case-mismatch", value: "09FCBF5798d837a22dc8e534b0d2e4a297f0426483ab69e981f9d91aac75edd1" },
  ];

  let pass = 0;
  let fail = 0;
  for (const c of cases) {
    const result = await auth(fakeRequest(c.value));
    const ok = c.value && mapHasClient(env, c.value) ? !!result : !result;
    const tag = ok ? "PASS" : "FAIL";
    if (ok) pass++;
    else fail++;
    const summary = result
      ? `accept (principalId="${result.principalId}")`
      : "null (falls through)";
    console.log(`${tag}  ${c.label.padEnd(28)} -> ${summary}`);
  }
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail === 0 ? 0 : 1);
}

function mapHasClient(env, key) {
  for (const pair of env.split(",")) {
    const trimmed = pair.trim();
    const idx = trimmed.indexOf(":");
    if (idx > 0 && trimmed.slice(idx + 1) === key) return true;
  }
  return false;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
