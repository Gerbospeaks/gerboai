// src/utils/api.js
// ─────────────────────────────────────────────────────────────────
// Central helper for calling the Anthropic proxy Cloud Function.
// Import this instead of calling api.anthropic.com directly.
// ─────────────────────────────────────────────────────────────────

// After you deploy the function, replace this URL with the one
// Firebase prints:  "Function URL (anthropicProxy): https://..."
const PROXY_URL = import.meta.env.VITE_ANTHROPIC_PROXY_URL
  || 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/anthropicProxy';

/**
 * Send a message to Claude through the Firebase proxy.
 *
 * @param {object} options
 * @param {string}   options.system   - System prompt
 * @param {Array}    options.messages - Chat history array
 * @param {string}  [options.model]   - Defaults to claude-sonnet-4-20250514
 * @param {number}  [options.max_tokens] - Defaults to 1000
 * @returns {Promise<string>} The assistant's reply text
 */
export async function callClaude({ system, messages, model, max_tokens = 1000 }) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:      model || 'claude-sonnet-4-20250514',
      max_tokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Proxy error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}