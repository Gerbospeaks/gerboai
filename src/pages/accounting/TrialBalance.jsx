import React, { useState, useEffect, useCallback } from "react";
import { useCurrency as useAppCurrency } from "../../contexts/CurrencyContext";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  Scale,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Download,
  Printer,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";
const today = () => new Date().toISOString().split("T")[0];

// ── Account type config ───────────────────────────────────────────────────────
// In double-entry: Assets & Expenses have DEBIT normal balance
//                  Liabilities, Equity & Revenue have CREDIT normal balance
const TYPE_META = {
  Asset: {
    normal: "debit",
    bg: "bg-[#eff6ff]",
    text: "text-[#2563eb]",
    border: "border-[#bfdbfe]",
    group: "Balance Sheet",
  },
  Liability: {
    normal: "credit",
    bg: "bg-[#fef2f2]",
    text: "text-[#dc2626]",
    border: "border-[#fecaca]",
    group: "Balance Sheet",
  },
  Equity: {
    normal: "credit",
    bg: "bg-[#f0fdf4]",
    text: "text-[#059669]",
    border: "border-[#bbf7d0]",
    group: "Balance Sheet",
  },
  Revenue: {
    normal: "credit",
    bg: "bg-[#faf5ff]",
    text: "text-[#7c3aed]",
    border: "border-[#e9d5ff]",
    group: "Income Statement",
  },
  Expense: {
    normal: "debit",
    bg: "bg-[#fff7ed]",
    text: "text-[#ea580c]",
    border: "border-[#fed7aa]",
    group: "Income Statement",
  },
};

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

// ── Print styles ──────────────────────────────────────────────────────────────
const PRINT_STYLES = `@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body * { visibility: hidden !important; }
  #tb-print-area, #tb-print-area * { visibility: visible !important; }
  #tb-print-area { position: absolute; left: 0; top: 0; width: 100%; }
  @page { size: A4 portrait; margin: 20mm; }
}`;

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// Props: user, clientId, clientName
// ══════════════════════════════════════════════════════════════════════════════
export default function TrialBalance({ user, clientId, clientName }) {
  const { formatCurrency: formatVisitorCurrency } = useAppCurrency();
  const fmt = (n) => formatVisitorCurrency(n, "ZAR");
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [collapsed, setCollapsed] = useState({});
  const [showZero, setShowZero] = useState(false);
  const [periodStart, setPeriodStart] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
  );
  const [periodEnd, setPeriodEnd] = useState(today());

  const db = getFirestore();
  const clientBase = ["users", user.uid, "clients", clientId];

  // ── Load chart of accounts + transactions ─────────────────────────────────
  const load = useCallback(async () => {
    if (!user?.uid || !clientId) return;
    setLoading(true);
    try {
      const [coaSnap, txSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, ...clientBase, "chartOfAccounts"),
            orderBy("code"),
          ),
        ),
        getDocs(
          query(collection(db, ...clientBase, "transactions"), orderBy("date")),
        ),
      ]);

      const coa = coaSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const txs = txSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.date >= periodStart && t.date <= periodEnd);

      setAccounts(coa);
      setTransactions(txs);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, clientId, periodStart, periodEnd]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Build trial balance entries ────────────────────────────────────────────
  // Each account gets debits and credits summed from transactions
  // For accounts with no transactions, we use the balance stored in CoA
  const buildTrialBalance = () => {
    // Sum all transactions per category
    const txByCategory = {};
    transactions.forEach((tx) => {
      const cat = tx.category || "Other";
      if (!txByCategory[cat]) txByCategory[cat] = { debit: 0, credit: 0 };
      if (tx.type === "debit")
        txByCategory[cat].debit += Number(tx.amount || 0);
      if (tx.type === "credit")
        txByCategory[cat].credit += Number(tx.amount || 0);
    });

    // Map CoA accounts to TB entries
    return accounts.map((acc) => {
      const meta = TYPE_META[acc.type] || TYPE_META.Asset;
      const storedBal = Number(acc.balance || 0);

      // For accounts linked to transactions via category match
      // (simple heuristic — in a full system you'd use accountId on each tx)
      const relatedTx = transactions.filter(
        (t) =>
          (t.category &&
            acc.name.toLowerCase().includes(t.category.toLowerCase())) ||
          acc.name.toLowerCase().includes((t.category || "").toLowerCase()),
      );

      const txDebit = relatedTx
        .filter((t) => t.type === "debit")
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      const txCredit = relatedTx
        .filter((t) => t.type === "credit")
        .reduce((s, t) => s + Number(t.amount || 0), 0);

      // Use stored balance as base, adjust with transactions
      let debit = 0,
        credit = 0;

      if (meta.normal === "debit") {
        // Debit-normal: balance lives in debit column
        const netBalance = storedBal + txDebit - txCredit;
        if (netBalance >= 0) debit = netBalance;
        else credit = Math.abs(netBalance);
      } else {
        // Credit-normal: balance lives in credit column
        const netBalance = storedBal + txCredit - txDebit;
        if (netBalance >= 0) credit = netBalance;
        else debit = Math.abs(netBalance);
      }

      // Override: if account has its own balance set directly, use it
      if (storedBal > 0 && txDebit === 0 && txCredit === 0) {
        debit = meta.normal === "debit" ? storedBal : 0;
        credit = meta.normal === "credit" ? storedBal : 0;
      }

      return { ...acc, debit, credit, meta };
    });
  };

  const entries = buildTrialBalance();

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalDebits = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredits = entries.reduce((s, e) => s + e.credit, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
  const difference = Math.abs(totalDebits - totalCredits);

  // ── Grouped by type ───────────────────────────────────────────────────────
  const grouped = ACCOUNT_TYPES.reduce((g, type) => {
    g[type] = entries.filter((e) => {
      const matchType = e.type === type;
      const matchSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.code?.includes(search);
      const matchZero = showZero || e.debit > 0 || e.credit > 0;
      return matchType && matchSearch && matchZero;
    });
    return g;
  }, {});

  const filteredEntries =
    filterType === "All"
      ? entries.filter((e) => {
          const matchSearch =
            !search ||
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.code?.includes(search);
          const matchZero = showZero || e.debit > 0 || e.credit > 0;
          return matchSearch && matchZero;
        })
      : grouped[filterType] || [];

  // ── Type subtotals ────────────────────────────────────────────────────────
  const typeSubtotals = ACCOUNT_TYPES.reduce((g, type) => {
    const group = entries.filter((e) => e.type === type);
    g[type] = {
      debit: group.reduce((s, e) => s + e.debit, 0),
      credit: group.reduce((s, e) => s + e.credit, 0),
      count: group.length,
    };
    return g;
  }, {});

  // ── Net profit / (loss) ───────────────────────────────────────────────────
  const totalRevenue = typeSubtotals.Revenue?.credit || 0;
  const totalExpenses = typeSubtotals.Expense?.debit || 0;
  const netProfit = totalRevenue - totalExpenses;

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = PRINT_STYLES;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const toggleCollapse = (type) =>
    setCollapsed((p) => ({ ...p, [type]: !p[type] }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">Trial Balance</h1>
            <p className="text-xs text-[#64748b]">
              {clientName} · {periodStart && fmtDate(periodStart)} —{" "}
              {periodEnd && fmtDate(periodEnd)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-sm rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-sm rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Period selector ── */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-[#374151]">
          <Calendar className="w-4 h-4 text-[#94a3b8]" />
          <span className="font-medium">Period:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <span className="text-[#94a3b8] text-sm">to</span>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        {/* Quick period buttons */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            {
              label: "This Year",
              start: `${new Date().getFullYear()}-01-01`,
              end: today(),
            },
            {
              label: "Last Year",
              start: `${new Date().getFullYear() - 1}-01-01`,
              end: `${new Date().getFullYear() - 1}-12-31`,
            },
            {
              label: "This Month",
              start: `${today().slice(0, 7)}-01`,
              end: today(),
            },
            {
              label: "Q1",
              start: `${new Date().getFullYear()}-01-01`,
              end: `${new Date().getFullYear()}-03-31`,
            },
            {
              label: "Q2",
              start: `${new Date().getFullYear()}-04-01`,
              end: `${new Date().getFullYear()}-06-30`,
            },
            {
              label: "Q3",
              start: `${new Date().getFullYear()}-07-01`,
              end: `${new Date().getFullYear()}-09-30`,
            },
            {
              label: "Q4",
              start: `${new Date().getFullYear()}-10-01`,
              end: `${new Date().getFullYear()}-12-31`,
            },
          ].map(({ label, start, end }) => (
            <button
              key={label}
              onClick={() => {
                setPeriodStart(start);
                setPeriodEnd(end);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                periodStart === start && periodEnd === end
                  ? "bg-[#2563eb] text-white"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Balance status banner ── */}
      <div
        className={`px-5 py-4 rounded-xl border flex items-center justify-between ${
          isBalanced
            ? "bg-[#f0fdf4] border-[#bbf7d0]"
            : "bg-[#fef2f2] border-[#fecaca]"
        }`}
      >
        <div className="flex items-center gap-3">
          {isBalanced ? (
            <CheckCircle className="w-5 h-5 text-[#059669] flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
          )}
          <div>
            <p
              className={`text-sm font-semibold ${isBalanced ? "text-[#166534]" : "text-[#991b1b]"}`}
            >
              {isBalanced
                ? "Trial balance is in balance ✓"
                : `Out of balance by ${fmt(difference)}`}
            </p>
            <p
              className={`text-xs mt-0.5 ${isBalanced ? "text-[#15803d]" : "text-[#dc2626]"}`}
            >
              Total Debits: {fmt(totalDebits)} · Total Credits: {fmt(totalCredits)}
            </p>
          </div>
        </div>
        <div
          className={`text-2xl font-black ${isBalanced ? "text-[#059669]" : "text-[#dc2626]"}`}
        >
          {isBalanced ? "✓" : `−${fmt(difference)}`}
        </div>
      </div>

      {/* ── Summary KPI tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Assets",
            value: `${fmt(typeSubtotals.Asset?.debit || 0)}`,
            icon: TrendingUp,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Total Liabilities",
            value: `${fmt(typeSubtotals.Liability?.credit || 0)}`,
            icon: TrendingDown,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
          {
            label: "Total Revenue",
            value: `${fmt(totalRevenue)}`,
            icon: ArrowUpRight,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
          },
          {
            label: netProfit >= 0 ? "Net Profit" : "Net Loss",
            value: `${fmt(Math.abs(netProfit))}`,
            icon: DollarSign,
            bg: netProfit >= 0 ? "bg-[#f0fdf4]" : "bg-[#fef2f2]",
            color: netProfit >= 0 ? "text-[#059669]" : "text-[#dc2626]",
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

      {/* ── Filters + search ── */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["All", ...ACCOUNT_TYPES].map((t) => {
            const meta = TYPE_META[t];
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                  filterType === t
                    ? t === "All"
                      ? "bg-[#1e293b] text-white border-[#1e293b]"
                      : `${meta?.bg || ""} ${meta?.text || ""} ${meta?.border || ""}`
                    : "bg-[#f1f5f9] text-[#64748b] border-transparent hover:bg-[#e2e8f0]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-xs text-[#64748b] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showZero}
            onChange={(e) => setShowZero(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-[#d1d5db] text-[#2563eb]"
          />
          Show zero balances
        </label>
      </div>

      {/* ── Trial Balance Table ── */}
      {loading ? (
        <div className="text-center py-16 text-[#94a3b8] text-sm">
          Loading trial balance…
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl">
          <BookOpen className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#94a3b8]">
            No chart of accounts found
          </p>
          <p className="text-xs text-[#cbd5e1] mt-1">
            Add accounts in the Chart of Accounts section first
          </p>
        </div>
      ) : (
        <div id="tb-print-area">
          {/* Print header */}
          <div className="hidden print:block mb-6 text-center">
            <h1 className="text-xl font-bold text-[#1e293b]">Trial Balance</h1>
            <p className="text-sm text-[#64748b]">{clientName}</p>
            <p className="text-sm text-[#64748b]">
              For the period {fmtDate(periodStart)} to {fmtDate(periodEnd)}
            </p>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 bg-[#0f172a] text-white text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
              <div className="col-span-1">Code</div>
              <div className="col-span-5">Account Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2 text-right">Debit (R)</div>
              <div className="col-span-2 text-right">Credit (R)</div>
            </div>

            {/* Grouped by account type */}
            {(filterType === "All" ? ACCOUNT_TYPES : [filterType]).map(
              (type) => {
                const group = grouped[type] || [];
                const sub = typeSubtotals[type] || { debit: 0, credit: 0 };
                const meta = TYPE_META[type];
                const isCol = collapsed[type];
                if (group.length === 0 && filterType === "All") return null;

                return (
                  <div key={type}>
                    {/* Section header */}
                    <button
                      onClick={() => toggleCollapse(type)}
                      className={`w-full grid grid-cols-12 px-5 py-3 border-b border-[#e2e8f0] hover:opacity-90 transition-opacity ${meta.bg}`}
                    >
                      <div className="col-span-1" />
                      <div
                        className={`col-span-5 flex items-center gap-2 text-sm font-bold ${meta.text}`}
                      >
                        {isCol ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        {type}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}
                        >
                          {group.length}
                        </span>
                      </div>
                      <div
                        className={`col-span-2 text-xs font-semibold ${meta.text}`}
                      >
                        {TYPE_META[type]?.group}
                      </div>
                      <div
                        className={`col-span-2 text-right text-sm font-bold ${meta.text}`}
                      >
                        {sub.debit > 0 ? fmt(sub.debit) : "—"}
                      </div>
                      <div
                        className={`col-span-2 text-right text-sm font-bold ${meta.text}`}
                      >
                        {sub.credit > 0 ? fmt(sub.credit) : "—"}
                      </div>
                    </button>

                    {/* Account rows */}
                    {!isCol &&
                      group.map((entry, idx) => (
                        <div
                          key={entry.id}
                          className={`grid grid-cols-12 px-5 py-3 border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors ${
                            idx % 2 === 0 ? "" : "bg-[#fafafa]"
                          }`}
                        >
                          <div className="col-span-1 text-xs font-mono text-[#94a3b8] self-center">
                            {entry.code}
                          </div>
                          <div className="col-span-5 self-center">
                            <p className="text-sm font-medium text-[#1e293b]">
                              {entry.name}
                            </p>
                            {entry.subtype && (
                              <p className="text-[10px] text-[#94a3b8] mt-0.5">
                                {entry.subtype}
                              </p>
                            )}
                          </div>
                          <div className="col-span-2 self-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${entry.meta.bg} ${entry.meta.text} border ${entry.meta.border}`}
                            >
                              {entry.type}
                            </span>
                          </div>
                          <div className="col-span-2 text-right self-center">
                            {entry.debit > 0 ? (
                              <span className="text-sm font-semibold text-[#1e293b]">
                                {fmt(entry.debit)}
                              </span>
                            ) : (
                              <span className="text-sm text-[#d1d5db]">—</span>
                            )}
                          </div>
                          <div className="col-span-2 text-right self-center">
                            {entry.credit > 0 ? (
                              <span className="text-sm font-semibold text-[#1e293b]">
                                {fmt(entry.credit)}
                              </span>
                            ) : (
                              <span className="text-sm text-[#d1d5db]">—</span>
                            )}
                          </div>
                        </div>
                      ))}

                    {/* Type subtotal */}
                    {!isCol && group.length > 0 && (
                      <div
                        className={`grid grid-cols-12 px-5 py-2.5 border-b-2 border-[#e2e8f0] ${meta.bg}`}
                      >
                        <div className="col-span-1" />
                        <div
                          className={`col-span-5 text-xs font-bold ${meta.text} uppercase tracking-wide`}
                        >
                          Total {type}
                        </div>
                        <div className="col-span-2" />
                        <div
                          className={`col-span-2 text-right text-sm font-black ${meta.text}`}
                        >
                          {sub.debit > 0 ? fmt(sub.debit) : "—"}
                        </div>
                        <div
                          className={`col-span-2 text-right text-sm font-black ${meta.text}`}
                        >
                          {sub.credit > 0 ? fmt(sub.credit) : "—"}
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}

            {/* Net profit / loss line */}
            {filterType === "All" && (
              <div
                className={`grid grid-cols-12 px-5 py-3 border-b border-[#e2e8f0] ${
                  netProfit >= 0 ? "bg-[#f0fdf4]" : "bg-[#fef2f2]"
                }`}
              >
                <div className="col-span-1" />
                <div
                  className={`col-span-5 text-sm font-bold flex items-center gap-2 ${
                    netProfit >= 0 ? "text-[#059669]" : "text-[#dc2626]"
                  }`}
                >
                  {netProfit >= 0
                    ? "Net Profit for the period"
                    : "Net Loss for the period"}
                  {netProfit >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
                <div className="col-span-2" />
                <div
                  className={`col-span-2 text-right text-sm font-black ${
                    netProfit < 0 ? "text-[#dc2626]" : "text-[#d1d5db]"
                  }`}
                >
                  {netProfit < 0 ? fmt(Math.abs(netProfit)) : "—"}
                </div>
                <div
                  className={`col-span-2 text-right text-sm font-black ${
                    netProfit >= 0 ? "text-[#059669]" : "text-[#d1d5db]"
                  }`}
                >
                  {netProfit >= 0 ? fmt(netProfit) : "—"}
                </div>
              </div>
            )}

            {/* Grand total row */}
            <div className="grid grid-cols-12 bg-[#0f172a] text-white px-5 py-4">
              <div className="col-span-1" />
              <div className="col-span-5 text-sm font-bold uppercase tracking-wide">
                Grand Total
              </div>
              <div className="col-span-2">
                {isBalanced ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#dcfce7] text-[#166534]">
                    <CheckCircle className="w-3 h-3" />
                    Balanced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#fef2f2] text-[#dc2626]">
                    <AlertCircle className="w-3 h-3" />
                    Diff: {fmt(difference)}
                  </span>
                )}
              </div>
              <div
                className={`col-span-2 text-right text-sm font-black ${
                  isBalanced ? "text-[#4ade80]" : "text-[#f87171]"
                }`}
              >
                {fmt(totalDebits)}
              </div>
              <div
                className={`col-span-2 text-right text-sm font-black ${
                  isBalanced ? "text-[#4ade80]" : "text-[#f87171]"
                }`}
              >
                {fmt(totalCredits)}
              </div>
            </div>
          </div>

          {/* ── Accounting equation check ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {/* Assets = Liabilities + Equity */}
            {(() => {
              const assets = typeSubtotals.Asset?.debit || 0;
              const liabilities = typeSubtotals.Liability?.credit || 0;
              const equity = typeSubtotals.Equity?.credit || 0;
              const rhs = liabilities + equity + netProfit;
              const balanced = Math.abs(assets - rhs) < 1;
              return (
                <div
                  className={`px-5 py-4 rounded-xl border ${balanced ? "bg-[#f0fdf4] border-[#bbf7d0]" : "bg-[#fef2f2] border-[#fecaca]"}`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-wide mb-2 ${balanced ? "text-[#059669]" : "text-[#dc2626]"}`}
                  >
                    Accounting Equation
                  </p>
                  <p className="text-xs text-[#64748b] font-mono">
                    Assets = Liabilities + Equity
                  </p>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Assets</span>
                      <span className="font-semibold text-[#2563eb]">
                        {fmt(assets)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">
                        Liabilities + Equity
                      </span>
                      <span className="font-semibold text-[#dc2626]">
                        {fmt(rhs)}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between border-t border-[#e2e8f0] pt-1 font-bold ${balanced ? "text-[#059669]" : "text-[#dc2626]"}`}
                    >
                      <span>Difference</span>
                      <span>{fmt(Math.abs(assets - rhs))}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Income summary */}
            <div className="px-5 py-4 bg-[#faf5ff] border border-[#e9d5ff] rounded-xl">
              <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-wide mb-2">
                Income Summary
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Revenue</span>
                  <span className="font-semibold text-[#7c3aed]">
                    {fmt(totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Expenses</span>
                  <span className="font-semibold text-[#ea580c]">
                    {fmt(totalExpenses)}
                  </span>
                </div>
                <div
                  className={`flex justify-between border-t border-[#e9d5ff] pt-1 font-bold ${netProfit >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
                >
                  <span>{netProfit >= 0 ? "Net Profit" : "Net Loss"}</span>
                  <span>{fmt(Math.abs(netProfit))}</span>
                </div>
              </div>
            </div>

            {/* Accounts summary */}
            <div className="px-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
              <p className="text-xs font-bold text-[#374151] uppercase tracking-wide mb-2">
                Accounts Summary
              </p>
              <div className="space-y-1 text-xs">
                {ACCOUNT_TYPES.map((type) => {
                  const meta = TYPE_META[type];
                  return (
                    <div key={type} className="flex justify-between">
                      <span className="text-[#64748b]">{type}</span>
                      <span className={`font-semibold ${meta.text}`}>
                        {typeSubtotals[type]?.count || 0} accounts
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between border-t border-[#e2e8f0] pt-1 font-bold text-[#1e293b]">
                  <span>Total</span>
                  <span>{accounts.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#64748b] mt-2">
            <p className="font-semibold text-[#374151] mb-1">
              About this report
            </p>
            <p>
              This trial balance is generated from your Chart of Accounts and
              transaction records. Account balances are calculated using
              double-entry bookkeeping principles. Assets and Expenses carry
              debit normal balances; Liabilities, Equity, and Revenue carry
              credit normal balances. Always verify against source documents
              before submission to SARS or external auditors.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
