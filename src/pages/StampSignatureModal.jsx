import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  X,
  Stamp,
  PenLine,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Circle,
  Square,
} from "lucide-react";

// ─── Rectangular stamp (customisable) ────────────────────────────────────────
function RectStamp({
  text = "APPROVED",
  color = "#d32f2f",
  showDate = true,
  rotation = -5,
  size = "medium",
}) {
  const today = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const sizes = {
    small: {
      padding: "8px 16px",
      fontSize: "14px",
      dateSize: "10px",
      border: "2px",
    },
    medium: {
      padding: "12px 22px",
      fontSize: "18px",
      dateSize: "11px",
      border: "3px",
    },
    large: {
      padding: "18px 28px",
      fontSize: "22px",
      dateSize: "13px",
      border: "4px",
    },
  };
  const s = sizes[size] || sizes.medium;

  return (
    <div
      style={{
        display: "inline-block",
        padding: s.padding,
        border: `${s.border} solid ${color}`,
        borderRadius: "8px",
        transform: `rotate(${rotation}deg)`,
        background: `${color}14`,
        fontFamily: "Courier New, monospace",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          outline: `0px solid ${color}`,
          outlineOffset: "2px",
          fontSize: s.fontSize,
          color,
          textTransform: "uppercase",
          letterSpacing: "2px",
          textAlign: "center",
          padding: "2px 4px",
        }}
      >
        {text}
      </div>
      {showDate && (
        <div
          style={{
            fontSize: s.dateSize,
            color,
            textAlign: "center",
            marginTop: "5px",
          }}
        >
          {today}
        </div>
      )}
    </div>
  );
}

// ─── Circular stamp (original) ───────────────────────────────────────────────
function CircleStamp({
  size = 160,
  companyName = "MY COMPANY NAME",
  companyAddress = "",
  dateStr = "",
}) {
  const uid = Math.random().toString(36).slice(2, 8);
  return (
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
      <path id={`tc-${uid}`} d="M 40,150 A 110,110 0 0,1 260,150" fill="none" />
      <text
        fill="#ce1414"
        fontSize="20"
        fontWeight="bold"
        letterSpacing="1.5"
        fontFamily="Courier New,monospace"
        opacity=".85"
      >
        <textPath href={`#tc-${uid}`} startOffset="50%" textAnchor="middle">
          {companyName.toUpperCase()}
        </textPath>
      </text>
      <path id={`bc-${uid}`} d="M 30,150 A 110,110 0 0,0 270,150" fill="none" />
      <text
        fill="#ce1414"
        fontSize="14"
        letterSpacing=".5"
        fontWeight="bold"
        fontFamily="Courier New,monospace"
        opacity=".85"
      >
        <textPath href={`#bc-${uid}`} startOffset="50%" textAnchor="middle">
          {companyAddress}
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
}

// ─── Color presets ────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { value: "#d32f2f", label: "Red", emoji: "🔴" },
  { value: "#1976d2", label: "Blue", emoji: "🔵" },
  { value: "#388e3c", label: "Green", emoji: "🟢" },
  { value: "#7b1fa2", label: "Purple", emoji: "🟣" },
  { value: "#000000", label: "Black", emoji: "⚫" },
  { value: "#f57c00", label: "Orange", emoji: "🟠" },
];

// ─── Page-window slicer ───────────────────────────────────────────────────────
// Wraps `content` in a fixed A4-height viewport and shifts it up by
// `index * pageHeight` so only that page's worth of content is visible.
// This is what lets a single tall `previewContent` node get sliced into
// several A4 "pages" the same way print pagination would, instead of being
// clipped at the bottom by the outer overflow:hidden container.
function PageWindow({
  content,
  index,
  width,
  height,
  contentHeight,
  marginTop,
}) {
  const sliceHeight = contentHeight ?? height;
  const top = marginTop ?? 0;
  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        background: "white",
      }}
    >
      {/* Content area is inset from both the top and bottom of the page
          by the margin amount, and hard-clipped to exactly `sliceHeight`
          tall. That guarantees a blank strip on both edges of every page —
          nothing from the previous or next slice can ever bleed through,
          so no line of text is ever cropped at a page boundary. */}
      <div
        style={{
          position: "absolute",
          top,
          left: 0,
          width,
          height: sliceHeight,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -index * sliceHeight,
            left: 0,
            width,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

/**
 * StampSignatureModal — multi-page, dual stamp style
 *
 * New props via stampSettings (from BusinessSettingsModal):
 *   stampSettings – { text, color, showDate, size, enabled, stampType: "circle"|"rect" }
 *
 * Pagination:
 *   - If `pages` (array of already-split page nodes) is passed, it's used as-is.
 *   - Otherwise, if `previewContent` is passed, its real rendered height is
 *     measured and it is automatically sliced into as many A4-height pages
 *     as needed — so long invoices/quotes no longer get trimmed to page 1.
 */
export default function StampSignatureModal({
  isOpen,
  onClose,
  onConfirm,
  pages,
  previewContent,
  businessInfo,
  existingConfigs,
  stampSettings: externalStampSettings,
}) {
  const FULL_W = 794;
  const FULL_H = 1123;
  // Reserved blank space at the top and bottom of every page so a line of
  // text never lands exactly on a slice boundary and gets visually cropped.
  const PAGE_MARGIN_TOP = 20;
  const PAGE_MARGIN_BOTTOM = 20;
  const PAGE_CONTENT_H = FULL_H - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM;

  // ── Measure previewContent so we know how many A4 pages it spans ──────
  const measureRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(FULL_H);

  useLayoutEffect(() => {
    if (!isOpen || pages?.length || !previewContent) return;

    const measure = () => {
      if (measureRef.current) {
        setContentHeight(measureRef.current.scrollHeight || FULL_H);
      }
    };

    measure();
    // Re-measure shortly after mount/paint — logos, fonts, or async data
    // (e.g. business info loading into the template) can change the height
    // after the first paint.
    const raf = requestAnimationFrame(measure);
    const timer = setTimeout(measure, 300);

    let ro;
    if (typeof ResizeObserver !== "undefined" && measureRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(measureRef.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      if (ro) ro.disconnect();
    };
  }, [isOpen, previewContent, pages]);

  const computedPageCount = previewContent
    ? Math.max(1, Math.ceil(contentHeight / PAGE_CONTENT_H))
    : 1;

  const pageList = pages?.length
    ? pages
    : previewContent
      ? Array.from({ length: computedPageCount }, (_, i) => (
          <PageWindow
            key={i}
            content={previewContent}
            index={i}
            width={FULL_W}
            height={FULL_H}
            contentHeight={PAGE_CONTENT_H}
            marginTop={PAGE_MARGIN_TOP}
          />
        ))
      : [];

  const totalPages = pageList.length || 1;

  // ── Default stamp customisation ───────────────────────────────────────
  const defaultStampStyle = () => ({
    stampType: externalStampSettings?.stampType ?? "circle", // "circle" | "rect"
    text: externalStampSettings?.text ?? "APPROVED",
    color: externalStampSettings?.color ?? "#d32f2f",
    showDate: externalStampSettings?.showDate ?? true,
    size: externalStampSettings?.size ?? "medium",
    rotation: externalStampSettings?.rotation ?? -5,
  });

  const [stampStyle, setStampStyle] = useState(defaultStampStyle);

  // ── Per-page config ───────────────────────────────────────────────────
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

  useEffect(() => {
    if (isOpen) {
      setPageConfigs(initConfigs());
      setSignatureDataUrl(existingConfigs?.signatureDataUrl ?? null);
      setCurrentPage(1);
      setStampStyle(defaultStampStyle());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingConfigs]);

  // ── Grow pageConfigs when measurement reveals more pages ──────────────
  // On first mount totalPages starts at 1 (before the measurer has run).
  // Once the real height is known and totalPages increases, this fills in
  // default configs for the newly-discovered pages instead of leaving them
  // undefined.
  useEffect(() => {
    setPageConfigs((prev) => {
      let changed = false;
      const next = { ...prev };
      for (let i = 1; i <= totalPages; i++) {
        if (!next[i]) {
          next[i] = defaultPageCfg();
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [totalPages]);

  // ── Current page cfg helpers ──────────────────────────────────────────
  const cfg = pageConfigs[currentPage] ?? defaultPageCfg();

  const setCfg = (updater) =>
    setPageConfigs((prev) => ({
      ...prev,
      [currentPage]:
        typeof updater === "function"
          ? updater(prev[currentPage] ?? defaultPageCfg())
          : updater,
    }));

  // ── Coordinate helpers ────────────────────────────────────────────────
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

  // ── Drag handler ──────────────────────────────────────────────────────
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

  // ── Signature upload ──────────────────────────────────────────────────
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

  const applyToAllPages = () => {
    setPageConfigs((prev) => {
      const next = { ...prev };
      const source = prev[currentPage] ?? defaultPageCfg();
      for (let i = 1; i <= totalPages; i++) next[i] = { ...source };
      return next;
    });
  };

  const removeFromPage = (p) => {
    setPageConfigs((prev) => ({
      ...prev,
      [p]: { ...prev[p], stampEnabled: false, sigEnabled: false },
    }));
  };

  const stampedPageNumbers = Object.entries(pageConfigs)
    .filter(([, c]) => c.stampEnabled || c.sigEnabled)
    .map(([p]) => Number(p))
    .sort((a, b) => a - b);

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
  const companyAddress = [
    businessInfo?.addressLine2,
    businessInfo?.city,
    businessInfo?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  if (!isOpen) return null;

  // ── Stamp renderer (preview inside document) ──────────────────────────
  const StampOverlay = () => {
    if (stampStyle.stampType === "rect") {
      return (
        <RectStamp
          text={stampStyle.text}
          color={stampStyle.color}
          showDate={stampStyle.showDate}
          rotation={stampStyle.rotation}
          size={stampStyle.size}
        />
      );
    }
    return (
      <CircleStamp
        size={toPreviewX(cfg.stamp.size)}
        companyName={companyName}
        companyAddress={companyAddress}
        dateStr={dateStr}
      />
    );
  };

  // ── Sidebar section header ────────────────────────────────────────────
  const SectionLabel = ({ children }) => (
    <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">
      {children}
    </p>
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Hidden measurer — renders the full, un-sliced previewContent
          off-screen so we can read its true height and know how many
          A4 pages it needs. Only mounted when we're doing our own
          auto-pagination (i.e. an explicit `pages` array wasn't supplied). */}
      {!pages?.length && previewContent && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: -99999,
            width: FULL_W,
            visibility: "hidden",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <div ref={measureRef}>{previewContent}</div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* ── Header ────────────────────────────────────────────────── */}
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

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ── Sidebar ───────────────────────────────────────────── */}
          <div className="w-64 flex-shrink-0 border-r border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-5 overflow-y-auto">
            {/* Page navigation */}
            <div>
              <SectionLabel>Pages</SectionLabel>
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
              <SectionLabel>Stamp</SectionLabel>
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

              {/* ── Stamp type switcher ─────────────────────────── */}
              <div className="flex gap-1.5 mb-3">
                {[
                  {
                    value: "circle",
                    icon: <Circle className="w-3.5 h-3.5" />,
                    label: "Round",
                  },
                  {
                    value: "rect",
                    icon: <Square className="w-3.5 h-3.5" />,
                    label: "Rectangle",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setStampStyle((s) => ({ ...s, stampType: opt.value }))
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      stampStyle.stampType === opt.value
                        ? "bg-[#ce1414] text-white border-[#ce1414]"
                        : "bg-white text-[#374151] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* ── Circle-only: size slider ──────────────────────── */}
              {stampStyle.stampType === "circle" && (
                <>
                  <label className="text-xs text-[#64748b] block mb-1">
                    Size
                  </label>
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
                  <span className="text-xs text-[#94a3b8]">
                    {cfg.stamp.size}px
                  </span>
                </>
              )}

              {/* ── Rect-only: customisation controls ────────────── */}
              {stampStyle.stampType === "rect" && (
                <div className="space-y-3 mt-1">
                  {/* Stamp text */}
                  <div>
                    <label className="text-xs text-[#64748b] block mb-1">
                      Stamp text
                    </label>
                    <input
                      type="text"
                      value={stampStyle.text}
                      maxLength={15}
                      onChange={(e) =>
                        setStampStyle((s) => ({
                          ...s,
                          text: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-bold uppercase border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ce1414] bg-white"
                      placeholder="APPROVED"
                    />
                    <span className="text-[10px] text-[#94a3b8]">
                      Max 15 characters
                    </span>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-xs text-[#64748b] block mb-1.5">
                      Color
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.value}
                          title={c.label}
                          onClick={() =>
                            setStampStyle((s) => ({ ...s, color: c.value }))
                          }
                          style={{ background: c.value }}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            stampStyle.color === c.value
                              ? "border-[#1e293b] scale-110"
                              : "border-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="text-xs text-[#64748b] block mb-1">
                      Size
                    </label>
                    <div className="flex gap-1">
                      {["small", "medium", "large"].map((sz) => (
                        <button
                          key={sz}
                          onClick={() =>
                            setStampStyle((s) => ({ ...s, size: sz }))
                          }
                          className={`flex-1 py-1 text-[11px] font-medium rounded-lg border capitalize transition-colors ${
                            stampStyle.size === sz
                              ? "bg-[#ce1414] text-white border-[#ce1414]"
                              : "bg-white text-[#374151] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rotation */}
                  <div>
                    <label className="text-xs text-[#64748b] block mb-1">
                      Rotation: {stampStyle.rotation}°
                    </label>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={stampStyle.rotation}
                      onChange={(e) =>
                        setStampStyle((s) => ({
                          ...s,
                          rotation: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#ce1414]"
                    />
                  </div>

                  {/* Show date */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stampStyle.showDate}
                      onChange={(e) =>
                        setStampStyle((s) => ({
                          ...s,
                          showDate: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-[#ce1414]"
                    />
                    <span className="text-xs text-[#374151]">Include date</span>
                  </label>
                </div>
              )}
            </div>

            {/* Signature */}
            <div>
              <SectionLabel>Signature</SectionLabel>
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
                  className="mt-2 max-h-14 rounded object-contain w-full bg-[#f8fafc]"
                />
              )}
            </div>

            {/* Apply to all / Reset */}
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
                <SectionLabel>Stamped pages</SectionLabel>
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
              Enable stamp/sig per page, drag to reposition. Click{" "}
              <strong>Apply</strong> when done.
            </p>
          </div>

          {/* ── Preview area ───────────────────────────────────────── */}
          <div className="flex-1 overflow-auto bg-[#e2e8f0] p-6 flex flex-col items-center gap-4">
            {/* Page nav bar */}
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

            {/* Document preview */}
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
                {/* Scaled page content — pageList[currentPage - 1] is already
                    a fixed FULL_W x FULL_H window (via PageWindow) when we're
                    auto-paginating, so it fills this container correctly
                    instead of being clipped mid-content. */}
                <div
                  style={{
                    width: FULL_W,
                    height: FULL_H,
                    transformOrigin: "top left",
                    transform: `scale(${containerRef.current ? containerRef.current.clientWidth / FULL_W : 1})`,
                    pointerEvents: "none",
                    userSelect: "none",
                    overflow: "hidden",
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
                      ...(stampStyle.stampType === "circle"
                        ? {
                            width: toPreviewX(cfg.stamp.size),
                            height: toPreviewY(cfg.stamp.size),
                          }
                        : {}),
                      cursor: "grab",
                      zIndex: 10,
                      outline: "0px dashed #ce1414",
                      outlineOffset: 2,
                    }}
                    title="Drag to reposition stamp"
                  >
                    <StampOverlay />
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
                      outline: "0px dashed #2563eb",
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

        {/* ── Footer ────────────────────────────────────────────────── */}
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
            onClick={() =>
              onConfirm({ pageConfigs, signatureDataUrl, stampStyle })
            }
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
