<script setup lang="ts">
const { data, status, send, stop, reset } = useEveAgent();

const isBusy = computed(() => status.value === "submitted" || status.value === "streaming");
const hasError = computed(() => status.value === "error");
const message = ref("");

const messages = computed(() => data.value.messages);

async function handleSubmit() {
  const text = message.value.trim();
  if (!text || isBusy.value) return;
  message.value = "";
  await send({ message: text });
}

function handleReset() {
  reset();
  message.value = "";
}
</script>

<template>
  <div class="chat-container">
    <header class="chat-header">
      <h1>Eve Agent</h1>
      <button
        v-if="messages.length > 0"
        class="reset-btn"
        :disabled="isBusy"
        @click="handleReset"
      >
        New Session
      </button>
    </header>

    <div class="messages">
      <div v-if="messages.length === 0" class="empty-state">
        Start a conversation with the agent.
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message"
        :class="msg.role"
      >
        <span class="role-label">{{ msg.role }}</span>
        <div class="message-parts">
          <template v-for="(part, i) in msg.parts" :key="i">
            <span v-if="part.type === 'text'" class="text-part">{{ part.text }}</span>
            <span v-else-if="part.type === 'reasoning'" class="reasoning-part">
              <em>{{ part.text }}</em>
            </span>
            <span v-else-if="part.type === 'tool-invocation'" class="tool-part">
              [tool: {{ part.toolInvocation.toolName }}]
            </span>
            <span v-else-if="part.type === 'dynamic-tool'" class="tool-part">
              [dynamic tool]
            </span>
          </template>
        </div>
      </div>

      <div v-if="isBusy" class="typing-indicator">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </div>

      <div v-if="hasError" class="error-banner">
        Something went wrong. Try sending again.
      </div>
    </div>

    <form class="composer" @submit.prevent="handleSubmit">
      <input
        v-model="message"
        type="text"
        placeholder="Type a message..."
        :disabled="isBusy"
        autocomplete="off"
      />
      <button type="submit" :disabled="isBusy || !message.trim()">
        Send
      </button>
      <button v-if="isBusy" type="button" class="stop-btn" @click="stop">
        Stop
      </button>
    </form>
  </div>
</template>

<style>
:root {
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --surface-hover: #242424;
  --border: #2e2e2e;
  --text: #e0e0e0;
  --text-muted: #888;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --danger: #ef4444;
  --user-bg: #1e3a5f;
  --assistant-bg: #1a1a1a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

.chat-container {
  max-width: 768px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.chat-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
}

.reset-btn {
  padding: 6px 14px;
  font-size: 0.875rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.reset-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.reset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  margin-top: 40%;
}

.message {
  margin-bottom: 20px;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 85%;
}

.message.user {
  background: var(--user-bg);
  margin-left: auto;
}

.message.assistant {
  background: var(--assistant-bg);
  border: 1px solid var(--border);
}

.message.system,
.message.tool {
  background: transparent;
  border: 1px dashed var(--border);
  font-size: 0.85rem;
  opacity: 0.7;
}

.role-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.message-parts {
  font-size: 0.95rem;
  word-wrap: break-word;
}

.text-part {
  white-space: pre-wrap;
}

.reasoning-part {
  color: var(--text-muted);
  font-style: italic;
}

.tool-part {
  color: var(--accent);
  font-family: monospace;
  font-size: 0.85rem;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.16s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.error-banner {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  border-radius: 8px;
  color: var(--danger);
  font-size: 0.875rem;
}

.composer {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}

.composer input {
  flex: 1;
  padding: 10px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s;
}

.composer input:focus {
  border-color: var(--accent);
}

.composer input:disabled {
  opacity: 0.5;
}

.composer button {
  padding: 10px 20px;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.composer button:hover:not(:disabled) {
  background: var(--accent-hover);
}

.composer button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.composer .stop-btn {
  background: var(--danger);
}

.composer .stop-btn:hover {
  background: #dc2626;
}
</style>