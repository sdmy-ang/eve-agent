# ADR-0001: Loopback-gated localDev auth

- **Status:** Accepted
- **Date:** 2026-07-14
- **Encoded in:** commit `1654b29` ("feat(eve): add api-keys and loopback-gated localDev auth")

## Context

Eve's `localDev()` authenticator accepts any request from a loopback address (127.0.0.1, ::1) and skips further auth. The eve dev TUI relies on it. In production this is dangerous: a co-resident attacker (malicious dep, RCE in another service, DNS rebinding) can reach `127.0.0.1` and bypass the API-key / OIDC checks that gate `/eve/v1/session*`.

## Decision

Include `localDev()` in the auth walk only when `EVE_ENABLE_LOCAL_DEV=true`. Leave the env var unset (or "false") in production. The default `auth: [...]` array in `agent/channels/eve.ts` reads:

```ts
...(process.env.EVE_ENABLE_LOCAL_DEV === "true" ? [localDev()] : []),
apiKeys(),
vercelOidc(),
placeholderAuth(),
```

## Consequences

- (+) Production deploys (Vercel, self-hosted) skip the loopback bypass by default.
- (+) The eve dev TUI still works locally when the dev opts in via env var.
- (-) The dev TUI requires explicit opt-in. New contributors will hit auth errors until they set the env var; documented in README.
- (-) If `EVE_ENABLE_LOCAL_DEV=true` is ever set in production (env leak, misconfigured dashboard), the protection is gone. Treat any prod deployment with that var set as compromised.

## Related

- ADR-0002 — the `apiKeys()` step that loopback would bypass.