import { defineAgent } from "eve";
import { minimax } from "vercel-minimax-ai-provider";

export default defineAgent({
  model: minimax("MiniMax-M3"),
  modelContextWindowTokens: 1_000_000,
});
