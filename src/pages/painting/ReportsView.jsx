import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  Layers,
} from "lucide-react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const STATUS_COLORS = {
  paid: {
    bg: "bg-emerald-500",
    text: "text-emerald-400",
    light: "bg-emerald-900/30 border-emerald-700/50",
  },
  partially_paid: {
    bg: "bg-amber-500",
    text: "text-amber-400",
    light: "bg-amber-900/30 border-amber-700/50",
  },
  pending: {
    bg: "bg-blue-500",
    text: "text-blue-400",
    light: "bg-blue-900/30 border-blue-700/50",
  },
  converted: {
    bg: "bg-purple-500",
    text: "text-purple-400",
    light: "bg-purple-900/30 border-purple-700/50",
  },
  overdue: {
    bg: "bg-rose-500",
    text: "text-rose-400",
    light: "bg-rose-900/30 border-rose-700/50",
  },
};

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = "#f59e0b" }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((item, i) => {
        const pct = ((item[valueKey] || 0) / max) * 100;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group"
          >
            <div className="w-full relative" style={{ height: "80px" }}>
              <div
                className="absolute bottom-0 w-full rounded-t transition-all duration-700 ease-out group-hover:opacity-80"
                style={{
                  height: `${pct}%`,
                  backgroundColor: color,
                  minHeight: pct > 0 ? "3px" : "0",
                }}
              />
            </div>
            <span className="text-xs text-stone-500 truncate w-full text-center">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut ─────────────────────────────────────────────────────────────────────
function DonutChart({ segments }) {
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  if (total === 0)
    return (
      <div className="w-32 h-32 rounded-full border-4 border-stone-700 flex items-center justify-center">
        <span className="text-stone-500 text-xs">No data</span>
      </div>
    );

  let cumulative = 0;
  const r = 54;
  const cx = 64,
    cy = 64;
  const circumference = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 128 128" className="w-32 h-32 -rotate-90">
      {segments.map((seg, i) => {
        const pct = (seg.value || 0) / total;
        const dashArray = `${pct * circumference} ${circumference}`;
        const offset = -cumulative * circumference;
        cumulative += pct;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={dashArray}
            strokeDashoffset={offset}
          />
        );
      })}
    </svg>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend, color = "amber" }) {
  const cols = {
    amber: "from-amber-900/40 to-amber-800/20 border-amber-700/40",
    emerald: "from-emerald-900/40 to-emerald-800/20 border-emerald-700/40",
    rose: "from-rose-900/40 to-rose-800/20 border-rose-700/40",
    blue: "from-blue-900/40 to-blue-800/20 border-blue-700/40",
    purple: "from-purple-900/40 to-purple-800/20 border-purple-700/40",
  };
  const iconCols = {
    amber: "bg-amber-500/20 text-amber-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    rose: "bg-rose-500/20 text-rose-400",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
  };
  return (
    <div className={`bg-gradient-to-br ${cols[color]} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconCols[color]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        {trend != null && (
          <span
            className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-stone-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-stone-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main ReportsView ──────────────────────────────────────────────────────────
export default function ReportsView({ user }) {
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("year"); // "month" | "quarter" | "year"

  const db = getFirestore();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const load = async (col) => {
          const q = query(
            collection(db, "users", user.uid, col),
            orderBy("createdAt", "desc"),
            limit(200),
          );
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        };
        const [q, inv, c] = await Promise.all([
          load("quotes"),
          load("invoices"),
          load("clients"),
        ]);
        setQuotes(q);
        setInvoices(inv);
        setCustomers(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const now = new Date();
  const filterByPeriod = (docs) => {
    return docs.filter((d) => {
      if (!d.createdAt) return true;
      const ts = d.createdAt?.toDate
        ? d.createdAt.toDate()
        : new Date(d.createdAt);
      if (period === "month")
        return (
          ts.getMonth() === now.getMonth() &&
          ts.getFullYear() === now.getFullYear()
        );
      if (period === "quarter") {
        const q = Math.floor(now.getMonth() / 3);
        return (
          Math.floor(ts.getMonth() / 3) === q &&
          ts.getFullYear() === now.getFullYear()
        );
      }
      return ts.getFullYear() === now.getFullYear();
    });
  };

  const filteredInvoices = useMemo(
    () => filterByPeriod(invoices),
    [invoices, period],
  );
  const filteredQuotes = useMemo(
    () => filterByPeriod(quotes),
    [quotes, period],
  );

  const totalRevenue = filteredInvoices.reduce(
    (s, i) => s + (i.totals?.paid || 0),
    0,
  );
  const totalOutstanding = filteredInvoices.reduce(
    (s, i) => s + (i.totals?.due || 0),
    0,
  );
  const totalInvoiced = filteredInvoices.reduce(
    (s, i) => s + (i.totals?.total || 0),
    0,
  );
  const paidCount = filteredInvoices.filter((i) => i.status === "paid").length;
  const pendingCount = filteredInvoices.filter(
    (i) => i.status === "pending" || i.status === "partially_paid",
  ).length;

  // Monthly revenue chart (last 6 months)
  const monthlyData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth(),
        y = d.getFullYear();
      const revenue = invoices
        .filter((inv) => {
          const ts = inv.createdAt?.toDate
            ? inv.createdAt.toDate()
            : new Date(inv.createdAt || 0);
          return ts.getMonth() === m && ts.getFullYear() === y;
        })
        .reduce((s, inv) => s + (inv.totals?.paid || 0), 0);
      result.push({ label: MONTHS_SHORT[m], revenue });
    }
    return result;
  }, [invoices]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const counts = { paid: 0, partially_paid: 0, pending: 0, converted: 0 };
    filteredInvoices.forEach((i) => {
      if (counts[i.status] != null) counts[i.status]++;
    });
    return [
      { label: "Paid", value: counts.paid, color: "#10b981" },
      { label: "Partial", value: counts.partially_paid, color: "#f59e0b" },
      { label: "Pending", value: counts.pending, color: "#3b82f6" },
      { label: "Converted", value: counts.converted, color: "#8b5cf6" },
    ].filter((s) => s.value > 0);
  }, [filteredInvoices]);

  // Quote conversion rate
  const conversionRate =
    filteredQuotes.length > 0
      ? Math.round(
          (filteredQuotes.filter((q) => q.convertedToInvoice).length /
            filteredQuotes.length) *
            100,
        )
      : 0;

  // Top clients by invoiced amount
  const topClients = useMemo(() => {
    const map = {};
    filteredInvoices.forEach((inv) => {
      const name = inv.customer?.name || "Unknown";
      map[name] = (map[name] || 0) + (inv.totals?.total || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, [filteredInvoices]);

  const maxClientTotal = Math.max(...topClients.map((c) => c.total), 1);

  // Recent invoices
  const recentInvoices = [...filteredInvoices].slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-stone-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading reports…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-stone-400 text-sm mt-0.5 ml-12">
            Business performance overview
          </p>
        </div>

        {/* Period toggle */}
        <div className="flex items-center bg-stone-800 border border-stone-700 rounded-xl p-1">
          {[
            ["month", "This Month"],
            ["quarter", "Quarter"],
            ["year", "This Year"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === key
                  ? "bg-amber-600 text-white shadow"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon={DollarSign}
          label="Revenue Collected"
          value={fmt(totalRevenue)}
          color="emerald"
        />
        <StatCard
          icon={Receipt}
          label="Total Invoiced"
          value={fmt(totalInvoiced)}
          color="amber"
        />
        <StatCard
          icon={AlertTriangle}
          label="Outstanding"
          value={fmt(totalOutstanding)}
          color="rose"
        />
        <StatCard
          icon={CheckCircle2}
          label="Invoices Paid"
          value={paidCount}
          color="emerald"
          sub={`${pendingCount} pending`}
        />
        <StatCard
          icon={TrendingUp}
          label="Quote Conversion"
          value={`${conversionRate}%`}
          color="purple"
          sub={`${filteredQuotes.length} quotes`}
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-700 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Monthly Revenue (6-month trend)
          </h3>
          <p className="text-xs text-stone-500 mb-5">
            Cash collected per month
          </p>
          {monthlyData.every((d) => d.revenue === 0) ? (
            <div className="h-24 flex items-center justify-center text-stone-500 text-xs">
              No revenue data for this period
            </div>
          ) : (
            <BarChart
              data={monthlyData}
              valueKey="revenue"
              labelKey="label"
              color="#f59e0b"
            />
          )}
        </div>

        {/* Invoice Status Donut */}
        <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            Invoice Status
          </h3>
          <p className="text-xs text-stone-500 mb-4">Breakdown for period</p>
          <div className="flex items-center gap-4">
            <DonutChart segments={statusBreakdown} />
            <div className="space-y-2">
              {statusBreakdown.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-stone-400">{s.label}</span>
                  <span className="text-xs font-bold text-white ml-auto pl-3">
                    {s.value}
                  </span>
                </div>
              ))}
              {statusBreakdown.length === 0 && (
                <p className="text-xs text-stone-500">No invoices yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            Top Clients by Revenue
          </h3>
          <p className="text-xs text-stone-500 mb-5">
            Highest-value clients for period
          </p>
          {topClients.length === 0 ? (
            <div className="text-stone-500 text-xs text-center py-6">
              No invoice data yet
            </div>
          ) : (
            <div className="space-y-3">
              {topClients.map(({ name, total }) => {
                const pct = Math.round((total / maxClientTotal) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-white truncate max-w-[60%]">
                        {name}
                      </span>
                      <span className="text-xs text-amber-400 font-bold">
                        {fmt(total)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Recent Invoices
          </h3>
          <p className="text-xs text-stone-500 mb-4">Latest invoice activity</p>
          {recentInvoices.length === 0 ? (
            <div className="text-stone-500 text-xs text-center py-6">
              No invoices yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => {
                const meta = STATUS_COLORS[inv.status] || STATUS_COLORS.pending;
                return (
                  <div
                    key={inv.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${meta.light} transition-all`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">
                        {inv.quoteNumber || "—"}
                      </p>
                      <p className="text-xs text-stone-400 truncate">
                        {inv.customer?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-xs font-bold text-white">
                        {fmt(inv.totals?.total)}
                      </p>
                      <span className={`text-xs font-bold ${meta.text}`}>
                        {inv.status === "partially_paid"
                          ? "Partial"
                          : inv.status?.charAt(0).toUpperCase() +
                              inv.status?.slice(1) || "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Footer ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 border border-stone-700 rounded-2xl p-5 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-stone-500 text-xs mb-1">Total Quotes</p>
            <p className="text-xl font-bold text-white">
              {filteredQuotes.length}
            </p>
          </div>
          <div>
            <p className="text-stone-500 text-xs mb-1">Total Invoices</p>
            <p className="text-xl font-bold text-white">
              {filteredInvoices.length}
            </p>
          </div>
          <div>
            <p className="text-stone-500 text-xs mb-1">Total Customers</p>
            <p className="text-xl font-bold text-white">
              {customers.filter((c) => !c._placeholder).length}
            </p>
          </div>
          <div>
            <p className="text-stone-500 text-xs mb-1">Collection Rate</p>
            <p className="text-xl font-bold text-white">
              {totalInvoiced > 0
                ? Math.round((totalRevenue / totalInvoiced) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
