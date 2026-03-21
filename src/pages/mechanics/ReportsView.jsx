import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Receipt,
  CreditCard,
  Car,
  Wrench,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Package,
} from "lucide-react";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n || 0,
  );

const MONTHS = [
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

const PERIOD_OPTIONS = [
  { label: "Last 3 months", value: 3 },
  { label: "Last 6 months", value: 6 },
  { label: "Last 12 months", value: 12 },
];

export default function ReportsView({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(6);

  useEffect(() => {
    if (user?.uid) loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    const db = getFirestore();
    try {
      const [invSnap, quoteSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", user.uid, "invoices"),
            orderBy("createdAt", "desc"),
          ),
        ),
        getDocs(
          query(
            collection(db, "users", user.uid, "quotations"),
            orderBy("createdAt", "desc"),
          ),
        ),
      ]);
      const inv = invSnap.docs.map((d) => ({
        id: d.id,
        _type: "invoice",
        ...d.data(),
      }));
      const quotes = quoteSnap.docs.map((d) => ({
        id: d.id,
        _type: "quotation",
        ...d.data(),
      }));
      setRecords([...inv, ...quotes]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDate = (r) => {
    if (r.createdAt?.toDate) return r.createdAt.toDate();
    if (r.createdAt) return new Date(r.createdAt);
    return new Date(0);
  };

  // ── Derived analytics ──────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(
      now.getFullYear(),
      now.getMonth() - (period - 1),
      1,
    );
    const inPeriod = records.filter((r) => getDate(r) >= cutoff);
    const invoices = inPeriod.filter((r) => r._type === "invoice");

    // Monthly buckets
    const monthBuckets = {};
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      monthBuckets[key] = {
        label: MONTHS[d.getMonth()],
        revenue: 0,
        invoices: 0,
        quotes: 0,
      };
    }
    inPeriod.forEach((r) => {
      const d = getDate(r);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthBuckets[key]) return;
      if (r._type === "invoice") {
        monthBuckets[key].revenue += r.totals?.total || 0;
        monthBuckets[key].invoices += 1;
      } else {
        monthBuckets[key].quotes += 1;
      }
    });
    const monthly = Object.values(monthBuckets);

    // Status breakdown (invoices only)
    const statusMap = {};
    invoices.forEach((r) => {
      const s = r.status || "pending";
      statusMap[s] = (statusMap[s] || 0) + 1;
    });

    // Top clients
    const clientMap = {};
    invoices.forEach((r) => {
      const name = r.customer?.name || "Unknown";
      if (!clientMap[name]) clientMap[name] = { name, total: 0, count: 0 };
      clientMap[name].total += r.totals?.total || 0;
      clientMap[name].count += 1;
    });
    const topClients = Object.values(clientMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    // Service type breakdown
    const serviceMap = {};
    invoices.forEach((r) => {
      (r.items || []).forEach((item) => {
        const t = item.type || "Other";
        serviceMap[t] = (serviceMap[t] || 0) + (item.amount || 0);
      });
    });
    const services = Object.entries(serviceMap)
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total);

    // Top vehicles
    const vehicleMap = {};
    invoices.forEach((r) => {
      const key =
        [r.vehicle?.make, r.vehicle?.model].filter(Boolean).join(" ") ||
        "Unknown";
      if (!vehicleMap[key]) vehicleMap[key] = { label: key, count: 0 };
      vehicleMap[key].count += 1;
    });
    const topVehicles = Object.values(vehicleMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Summary KPIs
    const totalRevenue = invoices.reduce(
      (s, r) => s + (r.totals?.total || 0),
      0,
    );
    const totalPaid = invoices
      .filter((r) => r.status === "paid")
      .reduce((s, r) => s + (r.totals?.total || 0), 0);
    const totalPending = invoices
      .filter((r) => ["pending", "unpaid", "partially_paid"].includes(r.status))
      .reduce((s, r) => s + (r.totals?.due || r.totals?.total || 0), 0);
    const conversionRate =
      inPeriod.length > 0
        ? Math.round((invoices.length / inPeriod.length) * 100)
        : 0;

    // Month-on-month revenue change
    const lastTwo = monthly.slice(-2);
    const momChange =
      lastTwo.length === 2 && lastTwo[0].revenue > 0
        ? Math.round(
            ((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) *
              100,
          )
        : 0;

    const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);

    return {
      monthly,
      totalRevenue,
      totalPaid,
      totalPending,
      conversionRate,
      momChange,
      maxRevenue,
      statusMap,
      topClients,
      services,
      topVehicles,
      invoiceCount: invoices.length,
      quoteCount: inPeriod.filter((r) => r._type === "quotation").length,
    };
  }, [records, period]);

  const STATUS_DISPLAY = {
    paid: { label: "Paid", color: "bg-[#059669]", text: "text-[#059669]" },
    partially_paid: {
      label: "Partial",
      color: "bg-[#d97706]",
      text: "text-[#d97706]",
    },
    pending: {
      label: "Pending",
      color: "bg-[#2563eb]",
      text: "text-[#2563eb]",
    },
    unpaid: { label: "Unpaid", color: "bg-[#dc2626]", text: "text-[#dc2626]" },
    converted: {
      label: "Converted",
      color: "bg-[#7c3aed]",
      text: "text-[#7c3aed]",
    },
  };

  if (loading)
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-[#059669]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">
              Reports & Analytics
            </h1>
            <p className="text-xs text-[#64748b]">Loading data…</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-white border border-[#e2e8f0] rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-white border border-[#e2e8f0] rounded-xl animate-pulse" />
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-[#059669]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">
              Reports & Analytics
            </h1>
            <p className="text-xs text-[#64748b]">
              Business performance overview
            </p>
          </div>
        </div>
        {/* Period picker */}
        <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-xl p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${period === opt.value ? "bg-[#059669] text-white shadow-sm" : "text-[#64748b] hover:text-[#1e293b]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(analytics.totalRevenue),
            icon: TrendingUp,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
            sub:
              analytics.momChange !== 0
                ? `${analytics.momChange > 0 ? "+" : ""}${analytics.momChange}% vs last month`
                : "No change",
            subColor:
              analytics.momChange > 0
                ? "text-[#059669]"
                : analytics.momChange < 0
                  ? "text-[#dc2626]"
                  : "text-[#94a3b8]",
            trend: analytics.momChange,
          },
          {
            label: "Collected",
            value: formatCurrency(analytics.totalPaid),
            icon: CheckCircle,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
            sub: `${analytics.invoiceCount} invoices`,
          },
          {
            label: "Outstanding",
            value: formatCurrency(analytics.totalPending),
            icon: Clock,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
            sub: "Awaiting payment",
          },
          {
            label: "Quote→Invoice",
            value: `${analytics.conversionRate}%`,
            icon: FileText,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
            sub: `${analytics.quoteCount} quotes this period`,
          },
        ].map(
          ({ label, value, icon: Icon, bg, color, sub, subColor, trend }) => (
            <div
              key={label}
              className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {trend !== undefined && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-[#059669]" : trend < 0 ? "text-[#dc2626]" : "text-[#94a3b8]"}`}
                  >
                    {trend > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : trend < 0 ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : null}
                    {trend !== 0 ? `${Math.abs(trend)}%` : "—"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
              <p className="text-lg font-bold text-[#1e293b] truncate">
                {value}
              </p>
              {sub && (
                <p
                  className={`text-[11px] mt-0.5 ${subColor || "text-[#94a3b8]"}`}
                >
                  {sub}
                </p>
              )}
            </div>
          ),
        )}
      </div>

      {/* Revenue bar chart */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1e293b]">
              Monthly Revenue
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Invoice totals per month
            </p>
          </div>
          <span className="text-xs font-semibold text-[#059669] bg-[#f0fdf4] px-2 py-1 rounded-lg">
            {formatCurrency(analytics.totalRevenue)} total
          </span>
        </div>
        <div className="p-5">
          {analytics.maxRevenue === 1 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart2 className="w-8 h-8 text-[#cbd5e1] mb-3" />
              <p className="text-sm text-[#94a3b8]">
                No revenue data in this period
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {analytics.monthly.map((m, i) => {
                const pct =
                  analytics.maxRevenue > 0
                    ? (m.revenue / analytics.maxRevenue) * 100
                    : 0;
                const isLast = i === analytics.monthly.length - 1;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e293b] text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      <div className="font-bold">
                        {formatCurrency(m.revenue)}
                      </div>
                      <div className="text-[#94a3b8]">
                        {m.invoices} inv · {m.quotes} quotes
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${isLast ? "bg-[#059669]" : "bg-[#bfdbfe] group-hover:bg-[#93c5fd]"}`}
                        style={{ height: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#94a3b8] font-medium truncate w-full text-center">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Invoice status breakdown */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <h2 className="text-sm font-semibold text-[#1e293b]">
              Invoice Status
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">Breakdown by status</p>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(analytics.statusMap).length === 0 ? (
              <p className="text-xs text-[#94a3b8] text-center py-6">No data</p>
            ) : (
              Object.entries(analytics.statusMap).map(([status, count]) => {
                const cfg = STATUS_DISPLAY[status] || STATUS_DISPLAY.pending;
                const pct =
                  analytics.invoiceCount > 0
                    ? Math.round((count / analytics.invoiceCount) * 100)
                    : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#374151]">
                        {cfg.label}
                      </span>
                      <span className="text-xs font-bold text-[#1e293b]">
                        {count}{" "}
                        <span className="text-[#94a3b8] font-normal">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cfg.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <h2 className="text-sm font-semibold text-[#1e293b]">
              Top Clients
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              By revenue this period
            </p>
          </div>
          <div className="divide-y divide-[#f1f5f9]">
            {analytics.topClients.length === 0 ? (
              <p className="text-xs text-[#94a3b8] text-center py-10">
                No data
              </p>
            ) : (
              analytics.topClients.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i === 0 ? "bg-[#fef3c7] text-[#d97706]" : i === 1 ? "bg-[#e0e7ff] text-[#4338ca]" : "bg-[#f1f5f9] text-[#64748b]"}`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1e293b] truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-[#94a3b8]">
                      {c.count} invoice{c.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#059669] flex-shrink-0">
                    {formatCurrency(c.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Services breakdown */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <h2 className="text-sm font-semibold text-[#1e293b]">
              Service Mix
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Revenue by line-item type
            </p>
          </div>
          <div className="p-4 space-y-3">
            {analytics.services.length === 0 ? (
              <p className="text-xs text-[#94a3b8] text-center py-6">
                No line-item data
              </p>
            ) : (
              (() => {
                const maxSvc = Math.max(
                  ...analytics.services.map((s) => s.total),
                  1,
                );
                const colors = [
                  "bg-[#2563eb]",
                  "bg-[#059669]",
                  "bg-[#7c3aed]",
                  "bg-[#d97706]",
                  "bg-[#0891b2]",
                ];
                return analytics.services.map((s, i) => {
                  const pct = Math.round((s.total / maxSvc) * 100);
                  return (
                    <div key={s.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#374151] flex items-center gap-1.5">
                          {s.type === "Labor" ? (
                            <Wrench className="w-3 h-3 text-[#2563eb]" />
                          ) : (
                            <Package className="w-3 h-3 text-[#059669]" />
                          )}
                          {s.type}
                        </span>
                        <span className="text-xs font-bold text-[#1e293b]">
                          {formatCurrency(s.total)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>

          {/* Top vehicles */}
          {analytics.topVehicles.length > 0 && (
            <>
              <div className="px-4 pt-2 pb-1 border-t border-[#e2e8f0]">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Car className="w-3 h-3" /> Top Vehicles
                </p>
                {analytics.topVehicles.map((v, i) => (
                  <div
                    key={v.label}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-xs text-[#374151] truncate">
                      {v.label}
                    </span>
                    <span className="text-xs font-semibold text-[#1e293b] ml-2 flex-shrink-0">
                      {v.count}×
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
