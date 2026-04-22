// utils/generatePdf.js
import { buildIndustryHTML }   from './buildIndustryHTML';
import { renderHtmlToPdfBlob } from './renderHtmlToPdfBlob';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const WORKER_URL = import.meta.env.VITE_WORKER_URL; // e.g. https://your-worker.workers.dev

// Mirrors your worker's DOC_CONFIG — keep in sync or import from a shared constants file
const DOC_CONFIG = {
  invoice:           { prefix: 'Inv', folder: 'invoices' },
  quote:             { prefix: 'QT',  folder: 'quotes' },
  purchase_order:    { prefix: 'PO',  folder: 'purchase_orders' },
  sick_note:         { prefix: 'SN',  folder: 'sick_notes' },
  jobcard:           { prefix: 'JC',  folder: 'jobcards' },
  waybill:           { prefix: 'WB',  folder: 'waybills' },
  // ... rest of your DOC_CONFIG
};

/**
 * Call this on button click.
 *
 * @param {object} opts
 * @param {string} opts.industry   - e.g. "carpentry"
 * @param {string} opts.docType    - e.g. "invoice"
 * @param {string} opts.docNumber  - e.g. "202675001"
 * @param {object} opts.data       - full document payload
 * @param {object} [opts.metadata] - extra fields saved to Firestore
 * @returns {Promise<string>}      - public download URL
 */
export async function generatePdf({ industry, docType, docNumber, data, metadata = {} }) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // ── 1. Build HTML from your React templates (client-side) ──────────────────
  const html = await buildIndustryHTML(industry, docType, docNumber, data);

  // ── 2. Render HTML → PDF blob (client-side, no Puppeteer) ─────────────────
  const fileName = `${DOC_CONFIG[docType]?.prefix ?? docType}-${docNumber}.pdf`;
  const blob     = await renderHtmlToPdfBlob(html, fileName);

  // ── 3. Upload PDF blob to Cloudflare R2 via /upload-pdf ───────────────────
  const token = await user.getIdToken();
  const uploadRes = await fetch(`${WORKER_URL}/upload-pdf`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/pdf',
      'X-File-Name':   fileName,
    },
    body: blob,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload failed: ${err}`);
  }

  const { publicUrl, key } = await uploadRes.json();

  // ── 4. Save record to Firestore ────────────────────────────────────────────
  const db     = getFirestore();
  const folder = DOC_CONFIG[docType]?.folder ?? docType;

  await setDoc(
    doc(db, 'users', user.uid, folder, docNumber),
    {
      fileName,
      downloadUrl: publicUrl,
      r2Key:       key,
      docType,
      docNumber,
      generatedAt: serverTimestamp(),
      ...metadata,
    }
  );

  return publicUrl;
}