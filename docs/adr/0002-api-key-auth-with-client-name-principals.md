# ADR-0002: Custom X-Api-Key auth with client-name principals

- **Status:** Accepted
- **Date:** 2026-07-14
- **Encoded in:** commit `1654b29` ("feat(eve): add api-keys and loopback-gated localDev auth")

## Context

Eve channels resolve requests to a session via an ordered auth walk. The default walk doesn't ship a per-caller API-key authenticator; the eve framework's own docs recommend `vercelOidc()` for Vercel deployments. For local scripts and self-hosted consumers (Nuxt frontend at `localhost:3000`, CI, custom services), we need a stable, auditable way to identify the caller without requiring a Vercel OIDC token.

## Decision

Author a custom `apiKeys(): AuthFn<Request>` in `agent/channels/eve.ts`. It parses `EVE_API_KEYS` as comma-separated `client-name:key` pairs, and on each request looks for `X-Api-Key`. A matching key yields a service-type principal with `principalId = client-name` and `attributes = {}`. The principal lands in `ctx.session.auth.current` so downstream code can audit per caller.

## Consequences

- (+) Stable identity for non-Vercel callers (Nuxt frontend, scripts, services).
- (+) Per-caller audit — log lines and any future rate-limiting can key on `principalId`.
- (+) No code change required to add a new caller — append to `EVE_API_KEYS`.
- (-) Key rotation requires redeploying with a new `EVE_API_KEYS` value. Plan for at least two-key windows during rotation.
- (-) Duplicate `client-name` entries silently overwrite in the parsed map (the latest wins). The companion `scripts/generate-api-key.mjs` rejects duplicates at generation time to mitigate.
- (-) The `attributes: {}` field is currently empty. Future work may want to encode scope or quota there.

## Related

- ADR-0001 — the loopback gate that this auth step complements.