import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  X,
  Stamp,
  PenLine,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

/**
 * StampSignatureModal — multi-page version
 *
 * Props:
 *   isOpen          – boolean
 *   onClose         – () => void
 *   onConfirm       – (pageConfigs, sharedSignatureDataUrl) => void
 *   pages           – Array of React nodes, one per page (e.g. [<TemplateRenderer />, <JobCardTemplate />])
 *                     OR pass a single previewContent for backwards-compat (treated as page 1)
 *   previewContent  – React node (legacy single-page fallback)
 *   businessInfo    – { businessName, email, ... }
 *   existingConfigs – previously saved { pageConfigs: {1: cfg, 2: cfg}, signatureDataUrl } (optional)
 */
export default function StampSignatureModal({
  isOpen,
  onClose,
  onConfirm,
  pages,
  previewContent,
  businessInfo,
  existingConfigs,
}) {
  const FULL_W = 794;
  const FULL_H = 1123;

  // Normalise pages array — fall back to single previewContent
  const pageList = pages?.length
    ? pages
    : previewContent
      ? [previewContent]
      : [];
  const totalPages = pageList.length || 1;

  // ── Per-page config ────────────────────────────────────────────────────
  const defaultPageCfg = () => ({
    stampEnabled: false,
    stamp: { x: 550, y: 780, size: 160 },
    sigEnabled: false,
    sig: { x: 45, y: 740 },
  });

  const initConfigs = () => {
    if (existingConfigs?.pageConfigs) return existingConfigs.pageConfigs;
    const c = {};
    for (let i = 1; i <= totalPages; i++) c[i] = defaultPageCfg();
    return c;
  };

  const [pageConfigs, setPageConfigs] = useState(initConfigs);
  const [signatureDataUrl, setSignatureDataUrl] = useState(
    existingConfigs?.signatureDataUrl ?? null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const sigFileRef = useRef(null);
  const containerRef = useRef(null);

  // Re-init if modal opens fresh or existingConfigs changes
  useEffect(() => {
    if (isOpen) {
      setPageConfigs(initConfigs());
      setSignatureDataUrl(existingConfigs?.signatureDataUrl ?? null);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingConfigs]);

  // ── Current page cfg helpers ───────────────────────────────────────────
  const cfg = pageConfigs[currentPage] ?? defaultPageCfg();

  const setCfg = (updater) =>
    setPageConfigs((prev) => ({
      ...prev,
      [currentPage]:
        typeof updater === "function"
          ? updater(prev[currentPage] ?? defaultPageCfg())
          : updater,
    }));

  // ── Coordinate helpers ─────────────────────────────────────────────────
  const toPreviewX = useCallback(
    (x) =>
      containerRef.current
        ? (x / FULL_W) * containerRef.current.clientWidth
        : 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, currentPage],
  );
  const toPreviewY = useCallback(
    (y) =>
      containerRef.current
        ? (y / FULL_H) * containerRef.current.clientHeight
        : 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, currentPage],
  );
  const toFullX = (px) =>
    containerRef.current
      ? (px / containerRef.current.clientWidth) * FULL_W
      : px;
  const toFullY = (py) =>
    containerRef.current
      ? (py / containerRef.current.clientHeight) * FULL_H
      : py;

  // ── Drag handler ───────────────────────────────────────────────────────
  const makeDragHandler = (cfgKey) => (e) => {
    e.preventDefault();
    const cont = containerRef.current;
    if (!cont) return;
    const rect = cont.getBoundingClientRect();
    const getClient = (ev) => (ev.touches ? ev.touches[0] : ev);
    const t = getClient(e);
    const startX = t.clientX;
    const startY = t.clientY;
    const snap = pageConfigs[currentPage] ?? defaultPageCfg();
    const startElX = (snap[cfgKey].x / FULL_W) * rect.width;
    const startElY = (snap[cfgKey].y / FULL_H) * rect.height;

    const onMove = (ev) => {
      ev.preventDefault();
      const tc = getClient(ev);
      const dx = tc.clientX - startX;
      const dy = tc.clientY - startY;
      const newPxX = Math.max(0, Math.min(startElX + dx, rect.width));
      const newPxY = Math.max(0, Math.min(startElY + dy, rect.height));
      setCfg((prev) => ({
        ...prev,
        [cfgKey]: { ...prev[cfgKey], x: toFullX(newPxX), y: toFullY(newPxY) },
      }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  // ── Signature upload ───────────────────────────────────────────────────
  const handleSigUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSignatureDataUrl(ev.target.result);
      setCfg((p) => ({ ...p, sigEnabled: true }));
    };
    reader.readAsDataURL(file);
  };

  // ── Apply stamp/sig to ALL pages at once ──────────────────────────────
  const applyToAllPages = () => {
    setPageConfigs((prev) => {
      const next = { ...prev };
      const source = prev[currentPage] ?? defaultPageCfg();
      for (let i = 1; i <= totalPages; i++) {
        next[i] = { ...source };
      }
      return next;
    });
  };

  // ── Remove stamp from a specific page ────────────────────────────────
  const removeFromPage = (p) => {
    setPageConfigs((prev) => ({
      ...prev,
      [p]: { ...prev[p], stampEnabled: false, sigEnabled: false },
    }));
  };

  // ── Stamped pages list ────────────────────────────────────────────────
  const stampedPageNumbers = Object.entries(pageConfigs)
    .filter(([, c]) => c.stampEnabled || c.sigEnabled)
    .map(([p]) => Number(p))
    .sort((a, b) => a - b);

  // ── Date string ───────────────────────────────────────────────────────
  const dateStr = (() => {
    const now = new Date();
    const mo = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    return `${String(now.getDate()).padStart(2, "0")} ${mo[now.getMonth()]} ${now.getFullYear()}`;
  })();

  const companyName = businessInfo?.businessName ?? "MY COMPANY NAME";
  const companyEmail = businessInfo?.email ?? businessInfo?.primaryEmail ?? "";

  if (!isOpen) return null;

  // ── Stamp SVG ─────────────────────────────────────────────────────────
  const StampSVG = ({ size = 160 }) => (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      style={{ display: "block" }}
    >
      <circle
        cx="150"
        cy="150"
        r="145"
        fill="none"
        stroke="#ce1414"
        strokeWidth="5"
        opacity=".85"
      />
      <circle
        cx="150"
        cy="150"
        r="138"
        fill="none"
        stroke="#ce1414"
        strokeWidth="3"
        opacity=".85"
      />
      <circle
        cx="150"
        cy="150"
        r="100"
        fill="none"
        stroke="#ce1414"
        strokeWidth="3"
        opacity=".85"
      />
      <path
        id={`tc-modal-${currentPage}`}
        d="M 40,150 A 110,110 0 0,1 260,150"
        fill="none"
      />
      <text
        fill="#ce1414"
        fontSize="20"
        fontWeight="bold"
        letterSpacing="1.5"
        fontFamily="Courier New,monospace"
        opacity=".85"
      >
        <textPath
          href={`#tc-modal-${currentPage}`}
          startOffset="50%"
          textAnchor="middle"
        >
          {companyName.toUpperCase()}
        </textPath>
      </text>
      <path
        id={`bc-modal-${currentPage}`}
        d="M 30,150 A 110,110 0 0,0 270,150"
        fill="none"
      />
      <text
        fill="#ce1414"
        fontSize="14"
        letterSpacing=".5"
        fontWeight="bold"
        fontFamily="Courier New,monospace"
        opacity=".85"
      >
        <textPath
          href={`#bc-modal-${currentPage}`}
          startOffset="50%"
          textAnchor="middle"
        >
          {companyEmail}
        </textPath>
      </text>
      <text
        x="35"
        y="170"
        fill="#ce1414"
        fontSize="16"
        opacity=".85"
        textAnchor="middle"
      >
        ★
      </text>
      <text
        x="265"
        y="170"
        fill="#ce1414"
        fontSize="16"
        opacity=".85"
        textAnchor="middle"
      >
        ★
      </text>
      <text
        x="150"
        y="160"
        fill="#e74c3c"
        fontSize="18"
        fontWeight="bold"
        letterSpacing="1.5"
        fontFamily="Courier New,monospace"
        opacity=".85"
        textAnchor="middle"
      >
        {dateStr}
      </text>
    </svg>
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#ce1414] rounded-lg flex items-center justify-center">
              <Stamp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1e293b]">
                Stamp &amp; Signature
              </h2>
              <p className="text-xs text-[#64748b]">
                Page {currentPage} of {totalPages} · Drag overlays to reposition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ── Left sidebar ────────────────────────────────────────── */}
          <div className="w-56 flex-shrink-0 border-r border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-4 overflow-y-auto">
            {/* Page navigation */}
            <div>
              <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">
                Pages
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-white border border-[#e2e8f0] rounded-lg text-[#374151] hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center text-xs font-semibold text-[#1e293b] bg-white border border-[#e2e8f0] rounded-lg py-1.5">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-white border border-[#e2e8f0] rounded-lg text-[#374151] hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stamp toggle */}
            <div>
              <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">
                Stamp
              </p>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={cfg.stampEnabled}
                  onChange={(e) =>
                    setCfg((p) => ({ ...p, stampEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#ce1414]"
                />
                <span className="text-sm text-[#374151]">
                  Show on this page
                </span>
              </label>
              <label className="text-xs text-[#64748b] block mb-1">Size</label>
              <input
                type="range"
                min="80"
                max="240"
                step="10"
                value={cfg.stamp.size}
                onChange={(e) =>
                  setCfg((p) => ({
                    ...p,
                    stamp: { ...p.stamp, size: Number(e.target.value) },
                  }))
                }
                className="w-full accent-[#ce1414]"
                disabled={!cfg.stampEnabled}
              />
              <span className="text-xs text-[#94a3b8]">{cfg.stamp.size}px</span>
            </div>

            {/* Signature toggle */}
            <div>
              <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">
                Signature
              </p>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={cfg.sigEnabled}
                  onChange={(e) =>
                    setCfg((p) => ({ ...p, sigEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#2563eb]"
                  disabled={!signatureDataUrl}
                />
                <span className="text-sm text-[#374151]">
                  Show on this page
                </span>
              </label>
              <button
                onClick={() => sigFileRef.current?.click()}
                className="flex items-center gap-1.5 w-full px-3 py-2 bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#374151] text-xs font-medium rounded-lg transition-colors"
              >
                <PenLine className="w-3.5 h-3.5" />
                {signatureDataUrl ? "Replace image" : "Upload signature"}
              </button>
              <input
                type="file"
                accept="image/*"
                ref={sigFileRef}
                className="hidden"
                onChange={handleSigUpload}
              />
              {signatureDataUrl && (
                <img
                  src={signatureDataUrl}
                  alt="sig preview"
                  className="mt-2 max-h-14 rounded border border-[#e2e8f0] object-contain w-full bg-[#f8fafc]"
                />
              )}
            </div>

            {/* Apply to all + Reset */}
            <div className="space-y-2">
              <button
                onClick={applyToAllPages}
                className="flex items-center gap-1.5 w-full px-3 py-2 bg-[#eff6ff] border border-[#bfdbfe] hover:bg-[#dbeafe] text-[#1d4ed8] text-xs font-medium rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Apply to all pages
              </button>
              <button
                onClick={() => setCfg(defaultPageCfg())}
                className="flex items-center gap-1.5 w-full px-3 py-2 bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#374151] text-xs font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset this page
              </button>
            </div>

            {/* Stamped pages list */}
            {stampedPageNumbers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">
                  Stamped pages
                </p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {stampedPageNumbers.map((p) => (
                    <div
                      key={p}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg"
                    >
                      <button
                        onClick={() => setCurrentPage(p)}
                        className="text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8]"
                      >
                        Page {p}
                        {pageConfigs[p]?.sigEnabled && signatureDataUrl && (
                          <span className="ml-1 text-[#64748b]">+ sig</span>
                        )}
                      </button>
                      <button
                        onClick={() => removeFromPage(p)}
                        className="p-0.5 text-[#94a3b8] hover:text-[#dc2626] rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              Navigate pages above, enable stamp/sig per page, drag to position.
              Click <strong>Apply</strong> when done.
            </p>
          </div>

          {/* ── Preview area ────────────────────────────────────────── */}
          <div className="flex-1 overflow-auto bg-[#e2e8f0] p-6 flex flex-col items-center gap-4">
            {/* Page nav bar above preview */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl px-4 py-2 shadow-sm flex-shrink-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-[#374151] hover:text-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => {
                      const hasStamp =
                        pageConfigs[p]?.stampEnabled ||
                        pageConfigs[p]?.sigEnabled;
                      return (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                            p === currentPage
                              ? "bg-[#ce1414] text-white"
                              : hasStamp
                                ? "bg-[#fef2f2] text-[#ce1414] border border-[#fecaca]"
                                : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    },
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1 text-[#374151] hover:text-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Document preview with draggable overlays */}
            <div
              style={{
                position: "relative",
                width: "210mm",
                maxWidth: "100%",
                aspectRatio: `${FULL_W} / ${FULL_H}`,
                flexShrink: 0,
              }}
            >
              <div
                ref={containerRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "white",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                  overflow: "hidden",
                }}
              >
                {/* Scaled page content */}
                <div
                  style={{
                    width: FULL_W,
                    minHeight: FULL_H,
                    transformOrigin: "top left",
                    transform: `scale(${
                      containerRef.current
                        ? containerRef.current.clientWidth / FULL_W
                        : 1
                    })`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {pageList[currentPage - 1] ?? null}
                </div>

                {/* Draggable stamp */}
                {cfg.stampEnabled && (
                  <div
                    onMouseDown={makeDragHandler("stamp")}
                    onTouchStart={makeDragHandler("stamp")}
                    style={{
                      position: "absolute",
                      left: toPreviewX(cfg.stamp.x),
                      top: toPreviewY(cfg.stamp.y),
                      width: toPreviewX(cfg.stamp.size),
                      height: toPreviewY(cfg.stamp.size),
                      cursor: "grab",
                      zIndex: 10,
                      outline: "2px dashed #ce1414",
                      outlineOffset: 2,
                    }}
                    title="Drag to reposition stamp"
                  >
                    <StampSVG size={toPreviewX(cfg.stamp.size)} />
                  </div>
                )}

                {/* Draggable signature */}
                {cfg.sigEnabled && signatureDataUrl && (
                  <div
                    onMouseDown={makeDragHandler("sig")}
                    onTouchStart={makeDragHandler("sig")}
                    style={{
                      position: "absolute",
                      left: toPreviewX(cfg.sig.x),
                      top: toPreviewY(cfg.sig.y),
                      cursor: "grab",
                      zIndex: 10,
                      outline: "2px dashed #2563eb",
                      outlineOffset: 2,
                    }}
                    title="Drag to reposition signature"
                  >
                    <img
                      src={signatureDataUrl}
                      alt="signature"
                      style={{
                        maxWidth: 140,
                        maxHeight: 70,
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        borderBottom: "1px dashed #333",
                        marginTop: 2,
                        width: 140,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f1f5f9]"
            >
              Cancel
            </button>
            {stampedPageNumbers.length > 0 && (
              <span className="text-xs text-[#64748b]">
                {stampedPageNumbers.length} page
                {stampedPageNumbers.length > 1 ? "s" : ""} stamped
              </span>
            )}
          </div>
          <button
            onClick={() => onConfirm({ pageConfigs, signatureDataUrl })}
            className="flex items-center gap-2 px-5 py-2 bg-[#ce1414] hover:bg-[#b01212] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            Apply &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
