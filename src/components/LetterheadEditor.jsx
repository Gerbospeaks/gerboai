import React, { useState } from "react";
import { Printer, FileDown, Mail, Pencil, Eye, Loader2 } from "lucide-react";
import LetterheadRenderer, {
  LETTERHEAD_DEFAULT_DATA,
} from "./LetterheadRenderer";
import LetterheadTemplateSelector from "./LetterheadTemplateSelector";
import useBusinessInfo from "./useBusinessInfo";

/**
 * LetterheadEditor
 * The combined preview + editing window for a chosen letterhead template.
 *
 * - Loads businessInfo (logo, business name, address, phones, email,
 *   website) from users/{uid}/settings/businessInfo — the exact doc
 *   Business Settings writes to — and passes it down read-only. This is
 *   never editable from inside the letterhead; the single source of
 *   truth is Business Settings.
 * - Holds the active template id + that template's editable *letter*
 *   data (currently just body text) in React state, in-memory only —
 *   resets on reload, per the brief.
 * - Toggles between "edit" (textarea overlaid on the design) and
 *   "preview" (clean read-only render, what would actually print).
 * - Print / Save as PDF / Email act on the rendered page.
 *
 * user: the logged-in user object — used both to load businessInfo and
 * passed through to LetterheadTemplateSelector for its Firestore-backed
 * purchased-template list.
 */
export default function LetterheadEditor({ user }) {
  const [templateId, setTemplateId] = useState("racing");
  const [dataByTemplate, setDataByTemplate] = useState(LETTERHEAD_DEFAULT_DATA);
  const [mode, setMode] = useState("edit"); // "edit" | "preview"

  const { businessInfo, loading: businessInfoLoading } = useBusinessInfo(
    user?.uid,
  );

  const data =
    dataByTemplate[templateId] ?? LETTERHEAD_DEFAULT_DATA[templateId];

  const handleDataChange = (nextData) => {
    setDataByTemplate((prev) => ({ ...prev, [templateId]: nextData }));
  };

  const handleTemplateChange = (nextId) => {
    setTemplateId(nextId);
    // Seed default data for a template the user hasn't touched yet
    setDataByTemplate((prev) =>
      prev[nextId]
        ? prev
        : { ...prev, [nextId]: LETTERHEAD_DEFAULT_DATA[nextId] },
    );
  };

  const needsPage2 = (data.bodyPage1 || "").length > 1800; // rough heuristic, matches original split-page intent

  const handlePrint = () => {
    window.print();
  };

  const handleSavePdf = () => {
    window.alert(
      'To save as PDF:\n\n1. Click Print\n2. Choose "Save as PDF" as the printer\n3. Click Save',
    );
    window.print();
  };

  const handleEmail = () => {
    const subject = `Letter from ${businessInfo.businessName || "your business"}`;
    const body = encodeURIComponent(data.bodyPage1 || "");
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1623]">
      {/* ── Top toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#253347] bg-[#1a2332] print:hidden">
        <div className="flex items-center gap-3">
          <LetterheadTemplateSelector
            user={user}
            selectedTemplate={templateId}
            onTemplateChange={handleTemplateChange}
          />

          {/* Edit / Preview toggle */}
          <div className="flex items-center bg-[#0f1623] border border-[#253347] rounded-lg p-1">
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === "edit"
                  ? "bg-[#2563eb] text-white"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === "preview"
                  ? "bg-[#2563eb] text-white"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#3498db] hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleSavePdf}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#e74c3c] hover:opacity-90 transition-opacity"
          >
            <FileDown className="w-4 h-4" />
            Save as PDF
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#27ae60] hover:opacity-90 transition-opacity"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>
      </div>

      {/* ── Hint row + missing-business-info nudge ── */}
      {!businessInfoLoading && !businessInfo.businessName && (
        <div className="px-4 py-2 bg-[#3a2a1a] border-b border-[#5c3d1a] print:hidden flex items-center gap-2 text-xs text-[#f0b860]">
          Your business name and logo aren't set yet — add them in Business
          Settings and they'll appear on this letterhead automatically.
        </div>
      )}

      {/* ── Canvas ── */}
      <div className="flex-1 overflow-auto py-8 px-4">
        {businessInfoLoading ? (
          <div className="flex items-center justify-center gap-2 text-[#64748b] text-sm py-20">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading business details...
          </div>
        ) : (
          <div className="mx-auto" style={{ width: "210mm" }}>
            <div className="mb-6">
              <LetterheadRenderer
                templateId={templateId}
                data={data}
                businessInfo={businessInfo}
                onChange={handleDataChange}
                mode={mode}
                page={1}
              />
            </div>

            {needsPage2 && (
              <LetterheadRenderer
                templateId={templateId}
                data={data}
                businessInfo={businessInfo}
                onChange={handleDataChange}
                mode={mode}
                page={2}
              />
            )}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
        }
      `}</style>
    </div>
  );
}
