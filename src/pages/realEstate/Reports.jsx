import React, { useState, useEffect } from "react";
import {
  FileBarChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  CreditCard,
  Receipt,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

const fmt = (n) =>
  `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtShort = (n) => {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `£${(v / 1_000).toFixed(0)}K`;
  return fmt(v);
};

const MONTH_NAMES = [
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

export default function Reports({ user }) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("this_year");
  const [data, setData] = useState({
    invoices: [],
    commissions: [],
    properties: [],
    clients: [],
  });

  useEffect(() => {
    if (user?.uid) loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    const db = getFirestore();
    try {
      const [invSnap, comSnap, propSnap, clientSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", user.uid, "invoices"),
            orderBy("createdAt", "desc"),
          ),
        ),
        getDocs(collection(db, "users", user.uid, "commissions")),
        getDocs(collection(db, "users", user.uid, "properties")),
        getDocs(collection(db, "users", user.uid, "clients")),
      ]);
      setData({
        invoices: invSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        commissions: comSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        properties: propSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        clients: clientSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => !c._placeholder),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived metrics ─────────────────────────────────────────────────────
  const now = new Date();
  const filterByPeriod = (items, dateField) => {
    return items.filter((item) => {
      const raw = item[dateField];
      if (!raw) return false;
      const d = raw.toDate ? raw.toDate() : new Date(raw);
      if (period === "this_month")
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      if (period === "last_month") {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
          d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
        );
      }
      if (period === "this_year") return d.getFullYear() === now.getFullYear();
      if (period === "last_year")
        return d.getFullYear() === now.getFullYear() - 1;
      return true;
    });
  };

  const filteredInvoices = filterByPeriod(data.invoices, "createdAt");
  const filteredCommissions = filterByPeriod(data.commissions, "createdAt");

  const totalRevenue = filteredInvoices.reduce(
    (s, i) => s + Number(i.totals?.total || 0),
    0,
  );
  const totalPaid = filteredInvoices.reduce(
    (s, i) => s + Number(i.totals?.paid || 0),
    0,
  );
  const totalOutstanding = filteredInvoices.reduce(
    (s, i) => s + Number(i.totals?.due || 0),
    0,
  );
  const totalCommissions = filteredCommissions.reduce(
    (s, c) =>
      c.status === "received" ? s + Number(c.commissionAmount || 0) : s,
    0,
  );
  const pendingCommissions = filteredCommissions.reduce(
    (s, c) =>
      ["pending", "invoiced"].includes(c.status)
        ? s + Number(c.commissionAmount || 0)
        : s,
    0,
  );

  const invoicesByStatus = {
    paid: filteredInvoices.filter((i) => i.status === "paid").length,
    pending: filteredInvoices.filter((i) => i.status === "pending").length,
    partially_paid: filteredInvoices.filter(
      (i) => i.status === "partially_paid",
    ).length,
    overdue: filteredInvoices.filter((i) => i.status === "overdue").length,
  };

  // Monthly revenue breakdown (for chart)
  const monthlyRevenue = Array.from({ length: 12 }, (_, m) => {
    const total = data.invoices
      .filter((i) => {
        const raw = i.createdAt;
        const d = raw?.toDate ? raw.toDate() : new Date(raw || 0);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === m;
      })
      .reduce((s, i) => s + Number(i.totals?.total || 0), 0);
    return { month: MONTH_NAMES[m], total };
  });
  const maxMonthly = Math.max(...monthlyRevenue.map((m) => m.total), 1);

  // Property status breakdown
  const propByStatus = [
    "available",
    "under_offer",
    "sold",
    "let",
    "withdrawn",
  ].reduce((acc, s) => {
    acc[s] = data.properties.filter((p) => p.status === s).length;
    return acc;
  }, {});

  const propStatusLabels = {
    available: { label: "Available", color: "bg-[#059669]" },
    under_offer: { label: "Under Offer", color: "bg-[#d97706]" },
    sold: { label: "Sold", color: "bg-[#2563eb]" },
    let: { label: "Let", color: "bg-[#7c3aed]" },
    withdrawn: { label: "Withdrawn", color: "bg-[#94a3b8]" },
  };

  const periodLabel = {
    this_month: "This Month",
    last_month: "Last Month",
    this_year: "This Year",
    last_year: "Last Year",
    all_time: "All Time",
  }[period];

  const Skeleton = () => (
    <div className="h-6 bg-[#f1f5f9] rounded animate-pulse w-24" />
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1e293b]">
            Business Reports
          </h2>
          <p className="text-xs text-[#64748b]">
            Financial overview · {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="last_year">Last Year</option>
            <option value="all_time">All Time</option>
          </select>
          <button
            onClick={loadAll}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#d1d5db] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: fmtShort(totalRevenue),
            icon: TrendingUp,
            iconBg: "bg-[#f0fdf4]",
            iconColor: "text-[#059669]",
            sub: `${filteredInvoices.length} invoices`,
          },
          {
            label: "Collected",
            value: fmtShort(totalPaid),
            icon: CheckCircle,
            iconBg: "bg-[#eff6ff]",
            iconColor: "text-[#2563eb]",
            sub: "Paid invoices",
          },
          {
            label: "Outstanding",
            value: fmtShort(totalOutstanding),
            icon: Clock,
            iconBg: "bg-[#fffbeb]",
            iconColor: "text-[#d97706]",
            sub: "Unpaid balance",
          },
          {
            label: "Commissions Earned",
            value: fmtShort(totalCommissions),
            icon: CreditCard,
            iconBg: "bg-[#faf5ff]",
            iconColor: "text-[#7c3aed]",
            sub: `£${fmtShort(pendingCommissions)} pending`,
          },
        ].map(({ label, value, icon: Icon, iconBg, iconColor, sub }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
              >
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
            <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
            {loading ? (
              <Skeleton />
            ) : (
              <p className="text-lg font-bold text-[#1e293b]">{value}</p>
            )}
            {!loading && <p className="text-xs text-[#94a3b8] mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Monthly revenue chart + Invoice breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="md:col-span-2 bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1e293b]">
                Monthly Revenue
              </h3>
              <p className="text-xs text-[#94a3b8]">{now.getFullYear()}</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#94a3b8]" />
          </div>
          {loading ? (
            <div className="h-40 bg-[#f8fafc] rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {monthlyRevenue.map(({ month, total }) => {
                const heightPct =
                  total > 0 ? Math.max((total / maxMonthly) * 100, 4) : 2;
                const isCurrent = MONTH_NAMES[now.getMonth()] === month;
                return (
                  <div
                    key={month}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <div className="relative flex-1 w-full flex items-end">
                      <div
                        className={`w-full rounded-t transition-all duration-300 group-hover:opacity-80 ${isCurrent ? "bg-[#2563eb]" : "bg-[#bfdbfe]"}`}
                        style={{ height: `${heightPct}%` }}
                        title={fmt(total)}
                      />
                    </div>
                    <span
                      className={`text-xs ${isCurrent ? "font-bold text-[#2563eb]" : "text-[#94a3b8]"}`}
                    >
                      {month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invoice status breakdown */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b]">
              Invoice Status
            </h3>
            <Receipt className="w-4 h-4 text-[#94a3b8]" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-[#f8fafc] rounded animate-pulse"
                />
              ))}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-8">
              No invoices in this period
            </p>
          ) : (
            <div className="space-y-3">
              {[
                {
                  label: "Paid",
                  count: invoicesByStatus.paid,
                  bar: "bg-[#059669]",
                  text: "text-[#059669]",
                },
                {
                  label: "Pending",
                  count: invoicesByStatus.pending,
                  bar: "bg-[#d97706]",
                  text: "text-[#d97706]",
                },
                {
                  label: "Partial",
                  count: invoicesByStatus.partially_paid,
                  bar: "bg-[#2563eb]",
                  text: "text-[#2563eb]",
                },
                {
                  label: "Overdue",
                  count: invoicesByStatus.overdue,
                  bar: "bg-[#dc2626]",
                  text: "text-[#dc2626]",
                },
              ].map(({ label, count, bar, text }) => {
                const pct = filteredInvoices.length
                  ? Math.round((count / filteredInvoices.length) * 100)
                  : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#374151]">{label}</span>
                      <span className={`text-xs font-bold ${text}`}>
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${bar} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Property portfolio + Client & commission summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property breakdown */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b]">
              Property Portfolio
            </h3>
            <Building2 className="w-4 h-4 text-[#94a3b8]" />
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-[#f8fafc] rounded animate-pulse"
                />
              ))}
            </div>
          ) : data.properties.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-8">
              No properties added
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(propByStatus).map(([status, count]) => {
                if (!count) return null;
                const cfg = propStatusLabels[status];
                const pct = Math.round((count / data.properties.length) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#374151]">
                        {cfg.label}
                      </span>
                      <span className="text-xs font-bold text-[#1e293b]">
                        {count}{" "}
                        <span className="text-[#94a3b8] font-normal">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cfg.color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
                <span className="text-[#64748b]">Total properties</span>
                <span className="font-bold text-[#1e293b]">
                  {data.properties.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Summary table */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b]">Summary</h3>
            <FileBarChart className="w-4 h-4 text-[#94a3b8]" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-[#f8fafc] rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-[#f1f5f9]">
              {[
                {
                  label: "Total Clients",
                  value: data.clients.length,
                  color: "text-[#1e293b]",
                },
                {
                  label: "Total Invoices Issued",
                  value: filteredInvoices.length,
                  color: "text-[#1e293b]",
                },
                {
                  label: "Revenue Invoiced",
                  value: fmt(totalRevenue),
                  color: "text-[#1e293b]",
                },
                {
                  label: "Revenue Collected",
                  value: fmt(totalPaid),
                  color: "text-[#059669]",
                },
                {
                  label: "Balance Outstanding",
                  value: fmt(totalOutstanding),
                  color: "text-[#d97706]",
                },
                {
                  label: "Commissions Received",
                  value: fmt(totalCommissions),
                  color: "text-[#7c3aed]",
                },
                {
                  label: "Commissions Pending",
                  value: fmt(pendingCommissions),
                  color: "text-[#d97706]",
                },
                {
                  label: "Active Properties",
                  value: propByStatus.available || 0,
                  color: "text-[#059669]",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-xs text-[#64748b]">{label}</span>
                  <span className={`text-sm font-semibold ${color}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent invoices mini-list */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Recent Invoices — {periodLabel}
          </h3>
          <span className="text-xs text-[#94a3b8]">
            {filteredInvoices.length} total
          </span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-[#f8fafc] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#94a3b8]">
            No invoices for this period
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {filteredInvoices.slice(0, 10).map((inv) => {
              const statusColor =
                inv.status === "paid"
                  ? "text-[#059669] bg-[#dcfce7]"
                  : inv.status === "partially_paid"
                    ? "text-[#92400e] bg-[#fef3c7]"
                    : "text-[#1e40af] bg-[#dbeafe]";
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#f8fafc] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1e293b]">
                      {inv.invoiceNumber || inv.id}
                    </p>
                    <p className="text-xs text-[#64748b]">
                      {inv.client?.name || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor}`}
                    >
                      {inv.status === "partially_paid"
                        ? "Partial"
                        : inv.status || "Pending"}
                    </span>
                    <span className="text-sm font-bold text-[#1e293b]">
                      {fmt(inv.totals?.total || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
