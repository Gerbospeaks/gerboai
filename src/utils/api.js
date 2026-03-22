// src/utils/api.js
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = 'llama-3.3-70b-instruct-fp8-fast'; // or 'llama3.1', 'llama3', etc.

export async function callClaude({ system, messages, max_tokens = 1000 }) {
  // Prepend system message into the messages array (Ollama uses role: 'system')
  const ollamaMessages = [
    { role: 'system', content: system },
    ...messages.map(m => ({
      role: m.role, // 'user' or 'assistant' — Ollama uses same names
      content: m.content,
    })),
  ];

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: ollamaMessages,
      stream: false,
      options: {
        num_predict: max_tokens,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Ollama error ${res.status}`);
  }

  const data = await res.json();
  return data.message?.content || '';
}
