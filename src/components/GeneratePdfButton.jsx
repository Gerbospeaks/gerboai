// components/GeneratePdfButton.jsx
import { useState } from 'react';
import { generatePdf } from '../utils/generatePdf';

export function GeneratePdfButton({ industry, docType, docNumber, data, metadata }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [url,    setUrl]    = useState(null);
  const [error,  setError]  = useState(null);

  async function handleClick() {
    setStatus('loading');
    setError(null);
    try {
      const downloadUrl = await generatePdf({ industry, docType, docNumber, data, metadata });
      setUrl(downloadUrl);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Generating PDF…' : 'Save & Download PDF'}
      </button>

      {status === 'done' && url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-3 text-sm text-amber-700 underline"
        >
          Open PDF ↗
        </a>
      )}

      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}