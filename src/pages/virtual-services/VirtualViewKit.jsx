import React, { useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { X, Loader2, Plus, Sparkles } from "lucide-react";
import { db } from "../../firebase";

/**
 * VirtualViewKit – shared helpers and tiny UI primitives used by the
 * Virtual Services dashboard views (Analytics, Catalogue, Notes, Projects,
 * Schedule).
 *
 * Exports:
 *   Style tokens : inputCls, labelCls, primaryBtn, ghostBtn
 *   Formatting   : fmtR, toISODate, addDays
 *   Components   : LoadingRow, PageHeader, StatCard, Modal, EmptyState
 *   Firestore    : userCol, fetchAll, seedCollection
 */

/* ───────────────────────── Style tokens ───────────────────────── */

export const inputCls =
  "w-full px-3 py-2 text-sm text-[#1e293b] bg-white border border-[#e2e8f0] rounded-lg " +
  "placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 " +
  "focus:border-[#7c3aed] disabled:bg-[#f8fafc] disabled:text-[#94a3b8]";

export const labelCls = "block text-xs font-medium text-[#475569] mb-1";

export const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white " +
  "bg-[#7c3aed] hover:bg-[#6d28d9] rounded-lg transition-colors " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-[#475569] " +
  "bg-white hover:bg-[#f8fafc] border border-[#e2e8f0] rounded-lg transition-colors " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

/* ───────────────────────── Formatting ───────────────────────── */

/** Format a number as South African Rand, e.g. 12500 -> "R 12 500". */
export const fmtR = (n) => {
  const v = Number(n);
  const safe = Number.isFinite(v) ? v : 0;
  const sign = safe < 0 ? "-" : "";
  const abs = Math.abs(Math.round(safe));
  // Plain space as the thousands separator (avoids locale differences).
  return `${sign}R ${String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
};

/** Date -> "YYYY-MM-DD" in the user's LOCAL time zone (not UTC). */
export const toISODate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Returns a NEW Date n days after `date` (n may be negative). */
export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/* ───────────────────────── Components ───────────────────────── */

export const LoadingRow = ({ label = "Loading…" }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#64748b]">
    <Loader2 className="w-4 h-4 animate-spin" />
    {label}
  </div>
);

/** Page title + subtitle on the left, optional action buttons (children) on the right. */
export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div className="min-w-0">
      <h1 className="text-xl font-semibold text-[#1e293b]">{title}</h1>
      {subtitle && <p className="text-sm text-[#64748b] mt-0.5">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2 flex-wrap flex-shrink-0">{children}</div>}
  </div>
);

export const StatCard = ({
  label,
  value,
  color = "text-[#1e293b]",
  bg = "bg-white",
}) => (
  <div className={`${bg} border border-[#e2e8f0] rounded-xl shadow-sm px-4 py-3`}>
    <p className="text-xs font-medium text-[#64748b]">{label}</p>
    <p className={`text-xl font-semibold mt-1 ${color}`}>{value}</p>
  </div>
);

/**
 * Modal dialog.
 *   title    – heading text
 *   onClose  – called on ✕, backdrop click or Escape
 *   footer   – node rendered in a sticky bar (laid out with justify-between)
 *   wide     – larger max width
 */
export const Modal = ({ title, onClose, footer, wide = false, children }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-base font-semibold text-[#1e293b]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Empty-state panel.
 *   icon      – a lucide icon component
 *   onAdd     – optional primary action (label from addLabel)
 *   onSeed    – optional "load sample data" action
 *   seeding   – disables the seed button while it runs
 */
export const EmptyState = ({
  icon: Icon,
  title,
  hint,
  onAdd,
  addLabel = "Add",
  onSeed,
  seeding = false,
}) => (
  <div className="flex flex-col items-center text-center bg-white border border-dashed border-[#cbd5e1] rounded-xl px-6 py-14">
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-[#f5f3ff] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-[#7c3aed]" />
      </div>
    )}
    <h3 className="text-sm font-semibold text-[#1e293b]">{title}</h3>
    {hint && <p className="text-sm text-[#64748b] mt-1 max-w-sm">{hint}</p>}
    {(onAdd || onSeed) && (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
        {onAdd && (
          <button type="button" onClick={onAdd} className={primaryBtn}>
            <Plus className="w-4 h-4" />
            {addLabel}
          </button>
        )}
        {onSeed && (
          <button type="button" onClick={onSeed} disabled={seeding} className={ghostBtn}>
            {seeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {seeding ? "Loading…" : "Load sample data"}
          </button>
        )}
      </div>
    )}
  </div>
);

/* ───────────────────────── Firestore helpers ───────────────────────── */

/** Reference to a per-user subcollection: users/{uid}/{name}. */
export const userCol = (uid, name) => collection(db, "users", uid, name);

/**
 * Fetch every document in a collection as [{ id, ...data }], newest first.
 * Sorting is done client-side so documents without a `createdAt` field are
 * still returned (Firestore's orderBy would silently drop them).
 */
export const fetchAll = async (colRef) => {
  const snap = await getDocs(colRef);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const ms = (r) => {
    const t = r.createdAt;
    if (t?.toMillis) return t.toMillis();
    if (t?.seconds) return t.seconds * 1000;
    return 0;
  };
  return rows.sort((a, b) => ms(b) - ms(a));
};

/**
 * Insert sample documents into a collection. Each gets a createdAt
 * timestamp. They are written last-to-first so that, with newest-first
 * sorting in fetchAll, the samples appear in the order they were defined.
 */
export const seedCollection = async (colRef, items = []) => {
  for (const item of [...items].reverse()) {
    await addDoc(colRef, { ...item, createdAt: serverTimestamp() });
  }
};
