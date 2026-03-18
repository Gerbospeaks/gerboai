import React, { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Calendar,
  Filter,
  Eye,
  Lock,
  Unlock,
  TrendingUp,
  DollarSign,
  Hash,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";
const today = () => new Date().toISOString().split("T")[0];

// ── Account type config (double-entry normal balances) ────────────────────────
const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const TYPE_META = {
  Asset: { normal: "debit", color: "#2563eb", bg: "#eff6ff" },
  Liability: { normal: "credit", color: "#dc2626", bg: "#fef2f2" },
  Equity: { normal: "credit", color: "#059669", bg: "#f0fdf4" },
  Revenue: { normal: "credit", color: "#7c3aed", bg: "#faf5ff" },
  Expense: { normal: "debit", color: "#ea580c", bg: "#fff7ed" },
};

// ── Journal entry types ───────────────────────────────────────────────────────
const ENTRY_TYPES = [
  { value: "general", label: "General" },
  { value: "adjustment", label: "Adjusting Entry" },
  { value: "closing", label: "Closing Entry" },
  { value: "reversing", label: "Reversing Entry" },
  { value: "opening", label: "Opening Entry" },
  { value: "depreciation", label: "Depreciation" },
  { value: "accrual", label: "Accrual" },
  { value: "prepayment", label: "Prepayment" },
];

// ── Status meta ───────────────────────────────────────────────────────────────
const STATUS_META = {
  draft: { label: "Draft", cls: "bg-[#f1f5f9] text-[#64748b]", icon: Clock },
  posted: {
    label: "Posted",
    cls: "bg-[#f0fdf4] text-[#059669]",
    icon: CheckCircle,
  },
  voided: { label: "Voided", cls: "bg-[#fef2f2] text-[#dc2626]", icon: X },
  reversed: {
    label: "Reversed",
    cls: "bg-[#fffbeb] text-[#d97706]",
    icon: RotateCcw,
  },
};

// ── Generate JE reference number ─────────────────────────────────────────────
async function generateJENumber(db, clientBase) {
  const year = new Date().getFullYear();
  const q = query(
    collection(db, ...clientBase, "journalEntries"),
    orderBy("createdAt", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  let last = 1000;
  if (!snap.empty) {
    const match = snap.docs[0].data().reference?.match(/(\d+)$/);
    if (match) last = Number(match[1]);
  }
  return `JE-${year}-${String(last + 1).padStart(4, "0")}`;
}

// ── Balance check ─────────────────────────────────────────────────────────────
const calcTotals = (lines) => ({
  totalDebit: lines.reduce((s, l) => s + Number(l.debit || 0), 0),
  totalCredit: lines.reduce((s, l) => s + Number(l.credit || 0), 0),
});
const isBalanced = (lines) => {
  const { totalDebit, totalCredit } = calcTotals(lines);
  return Math.abs(totalDebit - totalCredit) < 0.01;
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${meta.cls}`}
    >
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
};

// ── Entry type badge ──────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const t = ENTRY_TYPES.find((e) => e.value === type);
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#f1f5f9] text-[#64748b]">
      {t?.label || type}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// Props: user, clientId, clientName
// ══════════════════════════════════════════════════════════════════════════════
export default function JournalEntries({ user, clientId, clientName }) {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("list"); // list | ledger
  const [expanded, setExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState({});

  const db = getFirestore();
  const clientBase = ["users", user.uid, "clients", clientId];

  // ── Blank form ────────────────────────────────────────────────────────────
  const blankForm = () => ({
    reference: "",
    date: today(),
    entryType: "general",
    description: "",
    lines: [
      {
        accountId: "",
        accountName: "",
        accountType: "",
        debit: "",
        credit: "",
        memo: "",
      },
      {
        accountId: "",
        accountName: "",
        accountType: "",
        debit: "",
        credit: "",
        memo: "",
      },
    ],
    attachmentNote: "",
    isReversalOf: null,
  });

  const [form, setForm] = useState(blankForm());

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user?.uid || !clientId) return;
    setLoading(true);
    try {
      const [jeSnap, coaSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, ...clientBase, "journalEntries"),
            orderBy("date", "desc"),
          ),
        ),
        getDocs(
          query(
            collection(db, ...clientBase, "chartOfAccounts"),
            orderBy("code"),
          ),
        ),
      ]);
      setEntries(jeSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setAccounts(coaSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [user?.uid, clientId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Line helpers ──────────────────────────────────────────────────────────
  const addLine = () =>
    setForm((p) => ({
      ...p,
      lines: [
        ...p.lines,
        {
          accountId: "",
          accountName: "",
          accountType: "",
          debit: "",
          credit: "",
          memo: "",
        },
      ],
    }));

  const removeLine = (i) =>
    setForm((p) => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }));

  const updateLine = (i, field, value) =>
    setForm((p) => ({
      ...p,
      lines: p.lines.map((l, idx) => {
        if (idx !== i) return l;
        const updated = { ...l, [field]: value };
        // Auto-fill account name + type when account selected
        if (field === "accountId") {
          const acc = accounts.find((a) => a.id === value);
          if (acc) {
            updated.accountName = acc.name;
            updated.accountType = acc.type;
          }
        }
        // Enforce mutual exclusivity of debit/credit
        if (field === "debit" && value) updated.credit = "";
        if (field === "credit" && value) updated.debit = "";
        return updated;
      }),
    }));

  const { totalDebit, totalCredit } = calcTotals(form.lines);
  const formBalanced =
    Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;
  const difference = Math.abs(totalDebit - totalCredit);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd = async () => {
    const ref = await generateJENumber(db, clientBase);
    setEditing(null);
    setForm({ ...blankForm(), reference: ref });
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setForm({
      reference: entry.reference || "",
      date: entry.date || today(),
      entryType: entry.entryType || "general",
      description: entry.description || "",
      lines: entry.lines || [],
      attachmentNote: entry.attachmentNote || "",
      isReversalOf: entry.isReversalOf || null,
    });
    setShowModal(true);
  };

  const handleSave = async (status = "draft") => {
    if (form.lines.length < 2) {
      alert("A journal entry needs at least 2 lines.");
      return;
    }
    if (!formBalanced) {
      alert("Debits must equal credits before saving.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        status,
        totalDebit,
        totalCredit,
        updatedAt: serverTimestamp(),
      };
      if (editing) {
        await updateDoc(
          doc(db, ...clientBase, "journalEntries", editing.id),
          payload,
        );
      } else {
        await addDoc(collection(db, ...clientBase, "journalEntries"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handlePost = async (entry) => {
    if (
      !window.confirm(
        `Post journal entry ${entry.reference}? This will lock the entry.`,
      )
    )
      return;
    setPosting((p) => ({ ...p, [entry.id]: true }));
    try {
      await updateDoc(doc(db, ...clientBase, "journalEntries", entry.id), {
        status: "posted",
        postedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update CoA balances based on journal lines
      for (const line of entry.lines || []) {
        if (!line.accountId) continue;
        const accRef = doc(
          db,
          ...clientBase,
          "chartOfAccounts",
          line.accountId,
        );
        const accSnap = await getDocs(
          query(collection(db, ...clientBase, "chartOfAccounts")),
        );
        const accDoc = accSnap.docs.find((d) => d.id === line.accountId);
        if (!accDoc) continue;
        const meta = TYPE_META[accDoc.data().type] || TYPE_META.Asset;
        const current = Number(accDoc.data().balance || 0);
        let delta = 0;

        if (meta.normal === "debit") {
          delta = Number(line.debit || 0) - Number(line.credit || 0);
        } else {
          delta = Number(line.credit || 0) - Number(line.debit || 0);
        }

        await updateDoc(
          doc(db, ...clientBase, "chartOfAccounts", line.accountId),
          { balance: current + delta, updatedAt: serverTimestamp() },
        );
      }
      load();
    } finally {
      setPosting((p) => ({ ...p, [entry.id]: false }));
    }
  };

  const handleVoid = async (entry) => {
    if (!window.confirm(`Void ${entry.reference}? This cannot be undone.`))
      return;
    await updateDoc(doc(db, ...clientBase, "journalEntries", entry.id), {
      status: "voided",
      voidedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    load();
  };

  const handleReverse = async (entry) => {
    if (!window.confirm(`Create a reversing entry for ${entry.reference}?`))
      return;
    const ref = await generateJENumber(db, clientBase);
    const reversedLines = (entry.lines || []).map((l) => ({
      ...l,
      debit: l.credit || "",
      credit: l.debit || "",
      memo: `Reversal: ${l.memo || ""}`.trim(),
    }));
    await addDoc(collection(db, ...clientBase, "journalEntries"), {
      reference: ref,
      date: today(),
      entryType: "reversing",
      description: `Reversal of ${entry.reference}: ${entry.description}`,
      lines: reversedLines,
      status: "draft",
      isReversalOf: entry.id,
      totalDebit: entry.totalCredit,
      totalCredit: entry.totalDebit,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, ...clientBase, "journalEntries", entry.id), {
      status: "reversed",
      reversedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    load();
  };

  const handleDelete = async (entry) => {
    if (entry.status === "posted") {
      alert("Cannot delete a posted entry. Void it instead.");
      return;
    }
    if (!window.confirm("Delete this draft entry?")) return;
    await deleteDoc(doc(db, ...clientBase, "journalEntries", entry.id));
    load();
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchQ =
      e.reference?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.lines?.some((l) => l.accountName?.toLowerCase().includes(q));
    const matchS = filterStatus === "all" || e.status === filterStatus;
    const matchT = filterType === "all" || e.entryType === filterType;
    return matchQ && matchS && matchT;
  });

  const totalPosted = entries.filter((e) => e.status === "posted").length;
  const totalDrafts = entries.filter((e) => e.status === "draft").length;
  const totalPostedDebit = entries
    .filter((e) => e.status === "posted")
    .reduce((s, e) => s + (e.totalDebit || 0), 0);

  // ── Build general ledger view ─────────────────────────────────────────────
  const buildLedger = () => {
    const ledger = {};
    entries
      .filter((e) => e.status === "posted")
      .forEach((entry) => {
        (entry.lines || []).forEach((line) => {
          const name = line.accountName || "Unknown";
          if (!ledger[name]) {
            ledger[name] = {
              name,
              accountType: line.accountType || "",
              lines: [],
              totalDebit: 0,
              totalCredit: 0,
            };
          }
          ledger[name].lines.push({
            ...line,
            date: entry.date,
            reference: entry.reference,
            description: entry.description,
          });
          ledger[name].totalDebit += Number(line.debit || 0);
          ledger[name].totalCredit += Number(line.credit || 0);
        });
      });
    return Object.values(ledger).sort((a, b) => a.name.localeCompare(b.name));
  };

  const ledger = view === "ledger" ? buildLedger() : [];

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">
              Journal Entries
            </h1>
            <p className="text-xs text-[#64748b]">
              {clientName} · {entries.length} entries
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-[#f1f5f9] rounded-lg p-0.5">
            {[
              { id: "list", icon: FileText, label: "Entries" },
              { id: "ledger", icon: BookOpen, label: "Ledger" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === id
                    ? "bg-white text-[#1e293b] shadow-sm"
                    : "text-[#64748b] hover:text-[#374151]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Posted Entries",
            value: totalPosted,
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Drafts",
            value: totalDrafts,
            icon: Clock,
            bg: totalDrafts > 0 ? "bg-[#fffbeb]" : "bg-[#f8fafc]",
            color: totalDrafts > 0 ? "text-[#d97706]" : "text-[#64748b]",
          },
          {
            label: "Total Entries",
            value: entries.length,
            icon: BookOpen,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Posted Debits",
            value: `R${fmt(totalPostedDebit)}`,
            icon: DollarSign,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">
                {label}
              </span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, description or account…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "draft", "posted", "voided", "reversed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filterStatus === s
                  ? "bg-[#2563eb] text-white"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
              }`}
            >
              {s === "all" ? "All" : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        >
          <option value="all">All types</option>
          {ENTRY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* ══ LIST VIEW ══ */}
      {view === "list" && (
        <>
          {loading ? (
            <div className="text-center py-16 text-[#94a3b8] text-sm">
              Loading journal entries…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl">
              <BookOpen className="w-10 h-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm font-medium text-[#94a3b8]">
                No journal entries found
              </p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                Create your first double-entry journal
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => {
                const isExp = expanded[entry.id];
                const balanced = isBalanced(entry.lines || []);

                return (
                  <div
                    key={entry.id}
                    className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                      entry.status === "voided"
                        ? "opacity-60 border-[#fecaca]"
                        : entry.status === "reversed"
                          ? "border-[#fde68a]"
                          : entry.status === "draft"
                            ? "border-[#e2e8f0] border-dashed"
                            : "border-[#e2e8f0]"
                    }`}
                  >
                    {/* Entry header */}
                    <div
                      className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                      onClick={() =>
                        setExpanded((p) => ({ ...p, [entry.id]: !p[entry.id] }))
                      }
                    >
                      {/* Reference + date */}
                      <div className="w-8 h-8 bg-[#eff6ff] rounded-lg flex items-center justify-center flex-shrink-0">
                        {isExp ? (
                          <ChevronDown className="w-4 h-4 text-[#2563eb]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#2563eb]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#2563eb] font-mono">
                            {entry.reference}
                          </span>
                          <StatusBadge status={entry.status} />
                          <TypeBadge type={entry.entryType} />
                          {entry.isReversalOf && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#fffbeb] text-[#d97706]">
                              <RotateCcw className="w-3 h-3" />
                              Reversal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748b] mt-0.5 truncate">
                          {entry.description || "No description"}
                        </p>
                      </div>

                      {/* Date + amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#94a3b8]">
                          {fmtDate(entry.date)}
                        </p>
                        <p className="text-sm font-black text-[#1e293b] mt-0.5">
                          R{fmt(entry.totalDebit || 0)}
                        </p>
                        {!balanced && (
                          <p className="text-[10px] text-[#dc2626] font-semibold">
                            ⚠ Unbalanced
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        className="flex items-center gap-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {entry.status === "draft" && (
                          <>
                            <button
                              onClick={() => handlePost(entry)}
                              disabled={posting[entry.id] || !balanced}
                              title="Post entry"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                            >
                              <Send className="w-3 h-3" />
                              {posting[entry.id] ? "…" : "Post"}
                            </button>
                            <button
                              onClick={() => openEdit(entry)}
                              className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry)}
                              className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {entry.status === "posted" && (
                          <>
                            <button
                              onClick={() => handleReverse(entry)}
                              title="Create reversing entry"
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] text-xs font-semibold rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reverse
                            </button>
                            <button
                              onClick={() => handleVoid(entry)}
                              className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                              title="Void entry"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded lines */}
                    {isExp && (
                      <div className="border-t border-[#f1f5f9]">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                              <th className="px-5 py-2.5 text-left font-semibold text-[#64748b] uppercase tracking-wide">
                                Account
                              </th>
                              <th className="px-5 py-2.5 text-left font-semibold text-[#64748b] uppercase tracking-wide">
                                Type
                              </th>
                              <th className="px-5 py-2.5 text-left font-semibold text-[#64748b] uppercase tracking-wide">
                                Memo
                              </th>
                              <th className="px-5 py-2.5 text-right font-semibold text-[#2563eb] uppercase tracking-wide">
                                Debit (R)
                              </th>
                              <th className="px-5 py-2.5 text-right font-semibold text-[#dc2626] uppercase tracking-wide">
                                Credit (R)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(entry.lines || []).map((line, i) => {
                              const meta = TYPE_META[line.accountType];
                              return (
                                <tr
                                  key={i}
                                  className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]"
                                >
                                  <td className="px-5 py-3">
                                    <span
                                      className="font-semibold"
                                      style={{
                                        color: meta?.color || "#1e293b",
                                      }}
                                    >
                                      {line.accountName || "—"}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    {line.accountType && (
                                      <span
                                        className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px]"
                                        style={{
                                          background: meta?.bg || "#f1f5f9",
                                          color: meta?.color || "#64748b",
                                        }}
                                      >
                                        {line.accountType}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3 text-[#94a3b8]">
                                    {line.memo || "—"}
                                  </td>
                                  <td className="px-5 py-3 text-right">
                                    {Number(line.debit) > 0 ? (
                                      <span className="font-bold text-[#2563eb]">
                                        {fmt(line.debit)}
                                      </span>
                                    ) : (
                                      <span className="text-[#d1d5db]">—</span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3 text-right">
                                    {Number(line.credit) > 0 ? (
                                      <span className="font-bold text-[#dc2626]">
                                        {fmt(line.credit)}
                                      </span>
                                    ) : (
                                      <span className="text-[#d1d5db]">—</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          {/* Totals */}
                          <tfoot>
                            <tr
                              className={`border-t-2 ${balanced ? "border-[#e2e8f0]" : "border-[#fecaca]"}`}
                            >
                              <td
                                colSpan={3}
                                className="px-5 py-3 text-xs font-bold text-[#374151] uppercase tracking-wide"
                              >
                                Totals
                                {!balanced && (
                                  <span className="ml-2 text-[#dc2626]">
                                    ⚠ Out of balance
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-right text-sm font-black text-[#2563eb]">
                                {fmt(entry.totalDebit || 0)}
                              </td>
                              <td className="px-5 py-3 text-right text-sm font-black text-[#dc2626]">
                                {fmt(entry.totalCredit || 0)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>

                        {/* Footer meta */}
                        <div className="px-5 py-2.5 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-between text-xs text-[#94a3b8]">
                          <div className="flex items-center gap-4">
                            {entry.createdAt?.toDate && (
                              <span>
                                Created{" "}
                                {entry.createdAt
                                  .toDate()
                                  .toLocaleDateString("en-ZA")}
                              </span>
                            )}
                            {entry.postedAt?.toDate && (
                              <span>
                                Posted{" "}
                                {entry.postedAt
                                  .toDate()
                                  .toLocaleDateString("en-ZA")}
                              </span>
                            )}
                            {entry.attachmentNote && (
                              <span>📎 {entry.attachmentNote}</span>
                            )}
                          </div>
                          {entry.isReversalOf && (
                            <span className="text-[#d97706]">
                              Reversal of a previous entry
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══ LEDGER VIEW ══ */}
      {view === "ledger" && (
        <div className="space-y-4">
          <div className="px-5 py-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl text-sm text-[#1e40af]">
            <span className="font-semibold">General Ledger</span> — showing all
            posted journal entries grouped by account.
          </div>

          {ledger.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-[#e2e8f0] rounded-xl">
              <BookOpen className="w-10 h-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm font-medium text-[#94a3b8]">
                No posted entries yet
              </p>
            </div>
          ) : (
            ledger.map((account) => {
              const meta = TYPE_META[account.accountType];
              const balance = account.totalDebit - account.totalCredit;
              return (
                <div
                  key={account.name}
                  className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden"
                >
                  <div
                    className="px-5 py-3.5 border-b border-[#e2e8f0] flex items-center justify-between"
                    style={{ background: meta?.bg || "#f8fafc" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="font-bold text-sm"
                        style={{ color: meta?.color || "#1e293b" }}
                      >
                        {account.name}
                      </span>
                      {account.accountType && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: meta?.color + "20" || "#f1f5f9",
                            color: meta?.color || "#64748b",
                          }}
                        >
                          {account.accountType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-xs font-semibold">
                      <span className="text-[#2563eb]">
                        DR: R{fmt(account.totalDebit)}
                      </span>
                      <span className="text-[#dc2626]">
                        CR: R{fmt(account.totalCredit)}
                      </span>
                      <span style={{ color: meta?.color || "#1e293b" }}>
                        Balance: R{fmt(Math.abs(balance))}{" "}
                        {balance >= 0 ? "Dr" : "Cr"}
                      </span>
                    </div>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        {[
                          "Date",
                          "Reference",
                          "Description",
                          "Memo",
                          "Debit",
                          "Credit",
                          "Balance",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left font-semibold text-[#64748b] uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let running = 0;
                        return account.lines.map((line, i) => {
                          const d = Number(line.debit || 0);
                          const c = Number(line.credit || 0);
                          const meta2 = TYPE_META[account.accountType];
                          if (meta2?.normal === "debit") running += d - c;
                          else running += c - d;
                          return (
                            <tr
                              key={i}
                              className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc] transition-colors"
                            >
                              <td className="px-4 py-2.5 text-[#64748b]">
                                {fmtDate(line.date)}
                              </td>
                              <td className="px-4 py-2.5 font-bold text-[#2563eb] font-mono">
                                {line.reference}
                              </td>
                              <td className="px-4 py-2.5 text-[#374151] max-w-[160px] truncate">
                                {line.description}
                              </td>
                              <td className="px-4 py-2.5 text-[#94a3b8]">
                                {line.memo || "—"}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-[#2563eb]">
                                {d > 0 ? fmt(d) : "—"}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-[#dc2626]">
                                {c > 0 ? fmt(c) : "—"}
                              </td>
                              <td
                                className={`px-4 py-2.5 font-bold ${running >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
                              >
                                R{fmt(Math.abs(running))}{" "}
                                {running >= 0 ? "Dr" : "Cr"}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#e2e8f0] bg-[#f8fafc]">
                        <td
                          colSpan={4}
                          className="px-4 py-2.5 text-xs font-bold text-[#374151] uppercase tracking-wide"
                        >
                          Total
                        </td>
                        <td className="px-4 py-2.5 font-black text-[#2563eb]">
                          {fmt(account.totalDebit)}
                        </td>
                        <td className="px-4 py-2.5 font-black text-[#dc2626]">
                          {fmt(account.totalCredit)}
                        </td>
                        <td
                          className={`px-4 py-2.5 font-black ${Math.abs(balance) > 0 ? "text-[#1e293b]" : "text-[#94a3b8]"}`}
                        >
                          R{fmt(Math.abs(balance))} {balance >= 0 ? "Dr" : "Cr"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══ CREATE / EDIT MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-[#e2e8f0] my-4">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#2563eb]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1e293b]">
                    {editing ? "Edit Journal Entry" : "New Journal Entry"}
                  </h2>
                  <p className="text-xs text-[#64748b] font-mono">
                    {form.reference}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Meta fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelCls}>Reference</label>
                  <input
                    className={inputCls}
                    value={form.reference}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, reference: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Date *</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Entry Type</label>
                  <select
                    className={selectCls}
                    value={form.entryType}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, entryType: e.target.value }))
                    }
                  >
                    {ENTRY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Attachment Note</label>
                  <input
                    className={inputCls}
                    value={form.attachmentNote}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, attachmentNote: e.target.value }))
                    }
                    placeholder="Invoice #, receipt…"
                  />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <label className={labelCls}>Description *</label>
                  <input
                    className={inputCls}
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Brief description of this journal entry"
                  />
                </div>
              </div>

              {/* Balance indicator */}
              <div
                className={`px-4 py-3 rounded-xl border flex items-center justify-between ${
                  formBalanced
                    ? "bg-[#f0fdf4] border-[#bbf7d0]"
                    : "bg-[#fef2f2] border-[#fecaca]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {formBalanced ? (
                    <CheckCircle className="w-4 h-4 text-[#059669]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#dc2626]" />
                  )}
                  <span
                    className={`text-sm font-semibold ${formBalanced ? "text-[#166534]" : "text-[#991b1b]"}`}
                  >
                    {formBalanced
                      ? "Entry is balanced ✓"
                      : `Out of balance by R${fmt(difference)}`}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs font-semibold">
                  <span className="text-[#2563eb]">DR: R{fmt(totalDebit)}</span>
                  <span className="text-[#dc2626]">
                    CR: R{fmt(totalCredit)}
                  </span>
                </div>
              </div>

              {/* Journal lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={labelCls + " mb-0"}>Journal Lines *</label>
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <span className="text-[#2563eb] font-semibold">
                      Debit = left side (increases assets/expenses)
                    </span>
                    <span>·</span>
                    <span className="text-[#dc2626] font-semibold">
                      Credit = right side (increases liabilities/equity/revenue)
                    </span>
                  </div>
                </div>

                {/* Lines table */}
                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide w-[35%]">
                          Account
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                          Memo
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#2563eb] uppercase tracking-wide w-[15%]">
                          Debit (R)
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#dc2626] uppercase tracking-wide w-[15%]">
                          Credit (R)
                        </th>
                        <th className="w-8 px-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {form.lines.map((line, i) => (
                        <tr
                          key={i}
                          className="border-b border-[#f8fafc] last:border-0"
                        >
                          <td className="px-3 py-2">
                            {accounts.length > 0 ? (
                              <select
                                className={selectCls + " text-xs py-1.5"}
                                value={line.accountId}
                                onChange={(e) =>
                                  updateLine(i, "accountId", e.target.value)
                                }
                              >
                                <option value="">— Select account —</option>
                                {ACCOUNT_TYPES.map((type) => {
                                  const typeAccounts = accounts.filter(
                                    (a) => a.type === type,
                                  );
                                  if (typeAccounts.length === 0) return null;
                                  return (
                                    <optgroup key={type} label={type}>
                                      {typeAccounts.map((a) => (
                                        <option key={a.id} value={a.id}>
                                          {a.code} — {a.name}
                                        </option>
                                      ))}
                                    </optgroup>
                                  );
                                })}
                              </select>
                            ) : (
                              <input
                                className={inputCls + " text-xs py-1.5"}
                                value={line.accountName}
                                onChange={(e) =>
                                  updateLine(i, "accountName", e.target.value)
                                }
                                placeholder="Account name"
                              />
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className={inputCls + " text-xs py-1.5"}
                              value={line.memo}
                              onChange={(e) =>
                                updateLine(i, "memo", e.target.value)
                              }
                              placeholder="Optional memo"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className={`${inputCls} text-xs py-1.5 ${Number(line.debit) > 0 ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb] font-semibold" : ""}`}
                              value={line.debit}
                              onChange={(e) =>
                                updateLine(i, "debit", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className={`${inputCls} text-xs py-1.5 ${Number(line.credit) > 0 ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626] font-semibold" : ""}`}
                              value={line.credit}
                              onChange={(e) =>
                                updateLine(i, "credit", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-2 py-2">
                            {form.lines.length > 2 && (
                              <button
                                onClick={() => removeLine(i)}
                                className="p-1 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr
                        className={`border-t-2 ${formBalanced ? "border-[#e2e8f0]" : "border-[#fecaca]"}`}
                      >
                        <td className="px-3 py-2.5">
                          <button
                            onClick={addLine}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add line
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-xs font-bold text-[#374151] text-right uppercase tracking-wide">
                          Totals
                        </td>
                        <td className="px-3 py-2.5 text-sm font-black text-[#2563eb]">
                          {fmt(totalDebit)}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-black text-[#dc2626]">
                          {fmt(totalCredit)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Double-entry reminder */}
                <p className="text-[10px] text-[#94a3b8] mt-2">
                  Every journal entry must have equal debits and credits. A line
                  can only have a debit OR credit — not both.
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave("draft")}
                  disabled={saving || !formBalanced}
                  className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                >
                  <Clock className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave("posted")}
                  disabled={saving || !formBalanced}
                  className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  {saving ? "Saving…" : "Save & Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
