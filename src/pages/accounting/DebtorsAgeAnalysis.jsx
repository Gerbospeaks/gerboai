import React, { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  where,
} from "firebase/firestore";
import {
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  RefreshCw,
  Filter,
  Download,
  Eye,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";

const daysDiff = (dueDateIso) => {
  if (!dueDateIso) return 0;
  const now = new Date();
  const due = new Date(dueDateIso);
  return Math.floor((now - due) / (1000 * 60 * 60 * 24));
};

// Age bucket config
const BUCKETS = [
  {
    key: "current",
    label: "Current",
    range: "Not yet due",
    min: -Infinity,
    max: 0,
    bg: "bg-[#f0fdf4]",
    border: "border-[#bbf7d0]",
    text: "text-[#059669]",
    bar: "#059669",
  },
  {
    key: "b30",
    label: "1–30 days",
    range: "1 to 30 days",
    min: 1,
    max: 30,
    bg: "bg-[#fffbeb]",
    border: "border-[#fde68a]",
    text: "text-[#d97706]",
    bar: "#d97706",
  },
  {
    key: "b60",
    label: "31–60 days",
    range: "31 to 60 days",
    min: 31,
    max: 60,
    bg: "bg-[#fff7ed]",
    border: "border-[#fed7aa]",
    text: "text-[#ea580c]",
    bar: "#ea580c",
  },
  {
    key: "b90",
    label: "61–90 days",
    range: "61 to 90 days",
    min: 61,
    max: 90,
    bg: "bg-[#fef2f2]",
    border: "border-[#fecaca]",
    text: "text-[#dc2626]",
    bar: "#dc2626",
  },
  {
    key: "b90plus",
    label: "90+ days",
    range: "Over 90 days",
    min: 91,
    max: Infinity,
    bg: "bg-[#fdf2f8]",
    border: "border-[#f0abfc]",
    text: "text-[#a21caf]",
    bar: "#a21caf",
  },
];

const getBucket = (daysOverdue) => {
  return (
    BUCKETS.find((b) => daysOverdue >= b.min && daysOverdue <= b.max) ||
    BUCKETS[0]
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const RiskBadge = ({ daysOverdue }) => {
  if (daysOverdue <= 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#f0fdf4] text-[#059669]">
        <CheckCircle className="w-3 h-3" />
        Current
      </span>
    );
  if (daysOverdue <= 30)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#fffbeb] text-[#d97706]">
        <Clock className="w-3 h-3" />
        30 days
      </span>
    );
  if (daysOverdue <= 60)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#fff7ed] text-[#ea580c]">
        <AlertTriangle className="w-3 h-3" />
        60 days
      </span>
    );
  if (daysOverdue <= 90)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#fef2f2] text-[#dc2626]">
        <AlertCircle className="w-3 h-3" />
        90 days
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#fdf2f8] text-[#a21caf]">
      <AlertCircle className="w-3 h-3" />
      90+ days
    </span>
  );
};

// ── Build debtor rows from invoices ───────────────────────────────────────────
function buildDebtorMap(invoices) {
  const map = {};

  invoices.forEach((inv) => {
    const name = inv.customer?.name || "Unknown";
    const email = inv.customer?.email || "";
    const dueDate = inv.dates?.dueDate;
    const days = daysDiff(dueDate);
    const balance = inv.totals?.due ?? inv.totals?.total ?? 0;

    if (!map[name]) {
      map[name] = {
        name,
        email,
        invoices: [],
        total: 0,
        current: 0,
        b30: 0,
        b60: 0,
        b90: 0,
        b90plus: 0,
      };
    }

    const bucket = getBucket(days);
    map[name].invoices.push({ ...inv, daysOverdue: days, bucket: bucket.key });
    map[name].total += balance;
    map[name][bucket.key] = (map[name][bucket.key] || 0) + balance;
  });

  return Object.values(map).sort((a, b) => b.total - a.total);
}

// ── Mini horizontal bar ───────────────────────────────────────────────────────
function AgingBar({ debtor, total }) {
  if (total <= 0) return null;
  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full min-w-[80px]">
      {BUCKETS.map((b) => {
        const val = debtor[b.key] || 0;
        const pct = (val / total) * 100;
        if (pct < 0.5) return null;
        return (
          <div
            key={b.key}
            title={`${b.label}: R${fmt(val)}`}
            style={{ width: `${pct}%`, background: b.bar }}
          />
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// Props: user  (reads from top-level users/{uid}/invoices)
// ══════════════════════════════════════════════════════════════════════════════
export default function DebtorsAgeAnalysis({ user }) {
  const [debtors, setDebtors] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBucket, setFilterBucket] = useState("all");
  const [sortBy, setSortBy] = useState("total"); // total | name | b90plus
  const [expanded, setExpanded] = useState({});
  const [asAt, setAsAt] = useState(today());

  const db = getFirestore();

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  // ── Load unpaid/partial invoices ──────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      // Pull all non-paid invoices
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "invoices"),
          orderBy("createdAt", "desc"),
        ),
      );
      const raw = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (inv) =>
            inv.status !== "paid" &&
            inv.status !== "voided" &&
            inv.documentType !== "estimate" &&
            (inv.totals?.due ?? inv.totals?.total ?? 0) > 0,
        );

      setAllInvoices(raw);
      setDebtors(buildDebtorMap(raw));
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const grandTotal = debtors.reduce((s, d) => s + d.total, 0);
  const bucketTotals = BUCKETS.reduce((acc, b) => {
    acc[b.key] = debtors.reduce((s, d) => s + (d[b.key] || 0), 0);
    return acc;
  }, {});

  const overdueTotal =
    (bucketTotals.b30 || 0) +
    (bucketTotals.b60 || 0) +
    (bucketTotals.b90 || 0) +
    (bucketTotals.b90plus || 0);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = debtors
    .filter((d) => {
      const matchQ =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase());
      const matchB = filterBucket === "all" || (d[filterBucket] || 0) > 0;
      return matchQ && matchB;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "b90plus") return (b.b90plus || 0) - (a.b90plus || 0);
      return b.total - a.total;
    });

  const toggleExpand = (name) =>
    setExpanded((p) => ({ ...p, [name]: !p[name] }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#fef2f2] rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-[#dc2626]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">
              Debtors Age Analysis
            </h1>
            <p className="text-xs text-[#64748b]">
              {debtors.length} debtors · {allInvoices.length} outstanding
              invoices · As at {fmtDate(asAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={asAt}
            onChange={(e) => setAsAt(e.target.value)}
            className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-sm rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Summary KPI tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total outstanding */}
        <div className="sm:col-span-1 bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#64748b]">
            Total Outstanding
          </p>
          <p className="text-xl font-black text-white mt-1">
            R{fmt(grandTotal)}
          </p>
          <p className="text-[10px] text-[#475569] mt-1">
            {allInvoices.length} invoices
          </p>
        </div>
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            onClick={() =>
              setFilterBucket(filterBucket === b.key ? "all" : b.key)
            }
            className={`${b.bg} border ${b.border} rounded-xl p-4 text-left transition-all hover:shadow-md ${filterBucket === b.key ? "ring-2 ring-offset-1 shadow-md" : ""}`}
            style={filterBucket === b.key ? { ringColor: b.bar } : {}}
          >
            <p className={`text-xs font-semibold text-[#64748b]`}>{b.label}</p>
            <p className={`text-xl font-black mt-1 ${b.text}`}>
              R{fmt(bucketTotals[b.key])}
            </p>
            <p className="text-[10px] text-[#94a3b8] mt-1">
              {grandTotal > 0
                ? ((bucketTotals[b.key] / grandTotal) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </button>
        ))}
      </div>

      {/* ── Overdue risk banner ── */}
      {overdueTotal > 0 && (
        <div className="px-5 py-4 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#991b1b]">
                R{fmt(overdueTotal)} is overdue across{" "}
                {
                  debtors.filter((d) => d.b30 || d.b60 || d.b90 || d.b90plus)
                    .length
                }{" "}
                debtors
              </p>
              <p className="text-xs text-[#dc2626] mt-0.5">
                R{fmt(bucketTotals.b90plus)} is over 90 days — consider
                escalating collection
              </p>
            </div>
          </div>
          <div className="text-sm font-bold text-[#dc2626]">
            {grandTotal > 0
              ? ((overdueTotal / grandTotal) * 100).toFixed(1)
              : 0}
            % overdue
          </div>
        </div>
      )}

      {/* ── Visual aging distribution bar ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">
          Portfolio Age Distribution
        </p>
        <div className="flex h-6 rounded-xl overflow-hidden w-full gap-0.5">
          {BUCKETS.map((b) => {
            const pct =
              grandTotal > 0 ? (bucketTotals[b.key] / grandTotal) * 100 : 0;
            if (pct < 0.5) return null;
            return (
              <div
                key={b.key}
                title={`${b.label}: R${fmt(bucketTotals[b.key])} (${pct.toFixed(1)}%)`}
                className="flex items-center justify-center text-white text-[10px] font-bold transition-all hover:opacity-90 cursor-pointer rounded-sm"
                style={{
                  width: `${pct}%`,
                  background: b.bar,
                  minWidth: "20px",
                }}
                onClick={() =>
                  setFilterBucket(filterBucket === b.key ? "all" : b.key)
                }
              >
                {pct > 5 ? `${pct.toFixed(0)}%` : ""}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {BUCKETS.map((b) => (
            <div key={b.key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: b.bar }} />
              <span className="text-xs text-[#64748b]">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search + sort ── */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search debtors by name or email…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748b]">Sort:</span>
          {[
            { v: "total", label: "Balance" },
            { v: "b90plus", label: "90+ first" },
            { v: "name", label: "Name" },
          ].map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setSortBy(v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                sortBy === v
                  ? "bg-[#dc2626] text-white"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {filterBucket !== "all" && (
          <button
            onClick={() => setFilterBucket("all")}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-xs font-semibold rounded-lg hover:bg-[#fee2e2] transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>

      {/* ── Main debtors table ── */}
      {loading ? (
        <div className="text-center py-16 text-[#94a3b8] text-sm">
          Loading debtors…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl">
          <CheckCircle className="w-10 h-10 text-[#bbf7d0] mb-3" />
          <p className="text-sm font-medium text-[#94a3b8]">
            {search || filterBucket !== "all"
              ? "No debtors match your filters"
              : "All invoices are paid — no outstanding debtors"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="w-8 px-3 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                    Debtor
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                    Current
                  </th>
                  {BUCKETS.slice(1).map((b) => (
                    <th
                      key={b.key}
                      className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide ${b.text}`}
                    >
                      {b.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#1e293b] uppercase tracking-wide">
                    Total Due
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                    Aging
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((debtor) => {
                  const isExpanded = expanded[debtor.name];
                  // Determine worst bucket for risk
                  const worstDays = debtor.invoices.reduce(
                    (max, inv) => Math.max(max, inv.daysOverdue),
                    0,
                  );

                  return (
                    <React.Fragment key={debtor.name}>
                      {/* Debtor row */}
                      <tr
                        onClick={() => toggleExpand(debtor.name)}
                        className={`border-b border-[#f8fafc] cursor-pointer transition-colors ${
                          isExpanded ? "bg-[#f8fafc]" : "hover:bg-[#f8fafc]"
                        }`}
                      >
                        <td className="px-3 py-3.5 text-[#94a3b8]">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#2563eb]" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-sm font-semibold text-[#1e293b]">
                              {debtor.name}
                            </p>
                            <p className="text-xs text-[#94a3b8]">
                              {debtor.email || "—"} · {debtor.invoices.length}{" "}
                              invoice{debtor.invoices.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm text-[#059669] font-medium">
                          {debtor.current > 0 ? `R${fmt(debtor.current)}` : "—"}
                        </td>
                        {BUCKETS.slice(1).map((b) => (
                          <td
                            key={b.key}
                            className={`px-4 py-3.5 text-right text-sm font-medium ${debtor[b.key] > 0 ? b.text : "text-[#d1d5db]"}`}
                          >
                            {debtor[b.key] > 0 ? `R${fmt(debtor[b.key])}` : "—"}
                          </td>
                        ))}
                        <td className="px-4 py-3.5 text-right text-sm font-black text-[#1e293b]">
                          R{fmt(debtor.total)}
                        </td>
                        <td className="px-4 py-3.5 min-w-[100px]">
                          <AgingBar debtor={debtor} total={debtor.total} />
                        </td>
                        <td className="px-4 py-3.5">
                          <RiskBadge daysOverdue={worstDays} />
                        </td>
                      </tr>

                      {/* Expanded invoice rows */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-0 py-0 bg-[#f8fafc] border-b border-[#e2e8f0]"
                          >
                            <div className="px-8 py-3">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-[#e2e8f0]">
                                    {[
                                      "Invoice #",
                                      "Date",
                                      "Due Date",
                                      "Days Overdue",
                                      "Invoice Total",
                                      "Amount Paid",
                                      "Balance Due",
                                      "Status",
                                    ].map((h) => (
                                      <th
                                        key={h}
                                        className="pb-2 text-left font-semibold text-[#64748b] uppercase tracking-wide pr-4"
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {debtor.invoices
                                    .sort(
                                      (a, b) => b.daysOverdue - a.daysOverdue,
                                    )
                                    .map((inv) => {
                                      const bucket = getBucket(inv.daysOverdue);
                                      return (
                                        <tr
                                          key={inv.id}
                                          className="border-b border-[#f1f5f9] last:border-0"
                                        >
                                          <td
                                            className={`py-2 pr-4 font-bold ${bucket.text}`}
                                          >
                                            {inv.invoiceNumber || "—"}
                                          </td>
                                          <td className="py-2 pr-4 text-[#64748b]">
                                            {fmtDate(inv.dates?.invoiceDate)}
                                          </td>
                                          <td className="py-2 pr-4 text-[#64748b]">
                                            {fmtDate(inv.dates?.dueDate)}
                                          </td>
                                          <td className="py-2 pr-4">
                                            {inv.daysOverdue <= 0 ? (
                                              <span className="text-[#059669]">
                                                Not due yet
                                              </span>
                                            ) : (
                                              <span
                                                className={`font-bold ${bucket.text}`}
                                              >
                                                {inv.daysOverdue} days
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 pr-4 text-[#374151]">
                                            R{fmt(inv.totals?.total)}
                                          </td>
                                          <td className="py-2 pr-4 text-[#059669]">
                                            R{fmt(inv.totals?.paid)}
                                          </td>
                                          <td
                                            className={`py-2 pr-4 font-bold ${bucket.text}`}
                                          >
                                            R
                                            {fmt(
                                              inv.totals?.due ??
                                                inv.totals?.total,
                                            )}
                                          </td>
                                          <td className="py-2 pr-4">
                                            <span
                                              className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${bucket.bg} ${bucket.text} border ${bucket.border}`}
                                            >
                                              {bucket.label}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                                {/* Sub-total */}
                                <tfoot>
                                  <tr className="border-t border-[#e2e8f0]">
                                    <td
                                      colSpan={6}
                                      className="pt-2 text-[#64748b] font-semibold"
                                    >
                                      Debtor total
                                    </td>
                                    <td className="pt-2 font-black text-[#1e293b]">
                                      R{fmt(debtor.total)}
                                    </td>
                                    <td />
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Grand totals footer */}
              <tfoot>
                <tr className="border-t-2 border-[#e2e8f0] bg-[#0f172a]">
                  <td
                    colSpan={2}
                    className="px-4 py-3.5 text-sm font-bold text-white"
                  >
                    Grand Total ({filtered.length} debtors)
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold text-[#4ade80]">
                    R{fmt(filtered.reduce((s, d) => s + d.current, 0))}
                  </td>
                  {BUCKETS.slice(1).map((b) => (
                    <td
                      key={b.key}
                      className="px-4 py-3.5 text-right text-sm font-bold text-white"
                    >
                      R{fmt(filtered.reduce((s, d) => s + (d[b.key] || 0), 0))}
                    </td>
                  ))}
                  <td className="px-4 py-3.5 text-right text-sm font-black text-white">
                    R{fmt(filtered.reduce((s, d) => s + d.total, 0))}
                  </td>
                  <td colSpan={2} className="px-4 py-3.5">
                    <AgingBar
                      debtor={{
                        current: filtered.reduce((s, d) => s + d.current, 0),
                        b30: filtered.reduce((s, d) => s + (d.b30 || 0), 0),
                        b60: filtered.reduce((s, d) => s + (d.b60 || 0), 0),
                        b90: filtered.reduce((s, d) => s + (d.b90 || 0), 0),
                        b90plus: filtered.reduce(
                          (s, d) => s + (d.b90plus || 0),
                          0,
                        ),
                      }}
                      total={filtered.reduce((s, d) => s + d.total, 0)}
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Bucket breakdown cards ── */}
      {!loading && debtors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {BUCKETS.map((b) => {
            const debtorsInBucket = debtors.filter((d) => (d[b.key] || 0) > 0);
            return (
              <div
                key={b.key}
                className={`${b.bg} border ${b.border} rounded-xl p-4`}
              >
                <p
                  className={`text-xs font-bold ${b.text} uppercase tracking-wide`}
                >
                  {b.label}
                </p>
                <p className={`text-lg font-black mt-1 ${b.text}`}>
                  R{fmt(bucketTotals[b.key])}
                </p>
                <p className="text-xs text-[#94a3b8] mt-1">
                  {debtorsInBucket.length} debtor
                  {debtorsInBucket.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-2 space-y-0.5">
                  {debtorsInBucket.slice(0, 3).map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[10px] text-[#64748b] truncate max-w-[90px]">
                        {d.name}
                      </span>
                      <span className={`text-[10px] font-semibold ${b.text}`}>
                        R{fmt(d[b.key])}
                      </span>
                    </div>
                  ))}
                  {debtorsInBucket.length > 3 && (
                    <p className="text-[10px] text-[#94a3b8]">
                      +{debtorsInBucket.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SARS / accounting note ── */}
      <div className="px-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#64748b]">
        <p className="font-semibold text-[#374151] mb-1">About this report</p>
        <p>
          Days overdue is calculated from the invoice due date to today.
          "Current" means the due date has not yet passed. Aging buckets follow
          standard SA accounting practice: 30, 60, 90, and 90+ days. Only unpaid
          and partially paid tax invoices are included — estimates and fully
          paid invoices are excluded.
        </p>
      </div>
    </div>
  );
}

// ── X icon inline ─────────────────────────────────────────────────────────────
function X({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
