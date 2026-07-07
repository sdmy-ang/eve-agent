import { eveChannel } from "eve/channels/eve";
import {
  type AuthFn,
  placeholderAuth,
  vercelOidc,
} from "eve/channels/auth";

function apiKeys(): AuthFn<Request> {
  const map = new Map<string, string>();
  for (const pair of (process.env.EVE_API_KEYS ?? "").split(",")) {
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
      principalId: map.get(sent)!,
      principalType: "service",
      attributes: {},
    };
  };
}

export default eveChannel({
  auth: [
    apiKeys(),
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // This placeholder will not allow browser requests in production.
    // Replace it with your app's auth provider, like Auth.js or Clerk,
    // or use none() for a public demo.
    placeholderAuth(),
  ],
});
