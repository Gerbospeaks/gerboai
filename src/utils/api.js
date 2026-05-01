import { getAuth } from "firebase/auth";
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://r2-upload-worker.v8-auto.workers.dev';
async function getToken() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  return await user.getIdToken();
}
export async function callClaude({ system, messages, max_tokens = 1000 }) {
  const token = await getToken();
  const res = await fetch(`${WORKER_URL}/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      system,
      messages,
      max_tokens,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Worker error ${res.status}`);
  }

  const data = await res.json();
  return data.text || '';
}

export async function extractInvoiceData(prompt) {
  const token = await getToken();
  const res = await fetch(`${WORKER_URL}/invoice-extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) return null;
  return await res.json().catch(() => null);
}