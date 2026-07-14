import { defineAgent } from "eve";
import { createOpenAI } from "@ai-sdk/openai";
import { minimax } from "vercel-minimax-ai-provider";

const useOllama = !!process.env.USE_OLLAMA;

const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  apiKey: process.env.OLLAMA_API_KEY ?? "ollama",
});

export default defineAgent({
  model: useOllama
    ? ollama.chat(process.env.OLLAMA_MODEL ?? "llama3.2")
    : minimax("MiniMax-M3"),
  modelContextWindowTokens: useOllama ? 131_072 : 1_000_000,
});