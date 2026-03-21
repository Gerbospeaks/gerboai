import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import {
  BarChart3,
  DollarSign,
  FileText,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  Zap,
  AlertTriangle,
} from "lucide-react";

export default function ElectricalReportsView({ user }) {
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load both collections independently ───────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [qSnap, iSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, "users", user.uid, "quotes"),
              orderBy("createdAt", "desc"),
              limit(200),
            ),
          ),
          getDocs(
            query(
              collection(db, "users", user.uid, "invoices"),
              orderBy("createdAt", "desc"),
              limit(200),
            ),
          ),
        ]);
        setQuotes(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setInvoices(iSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Reports load:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  // ── Derived stats ─────────────────────────────────────────────────
  const allDocs = [...quotes, ...invoices];
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const partialInvoices = invoices.filter((i) => i.status === "partially_paid");
  const pendingInvoices = invoices.filter(
    (i) => !i.status || i.status === "pending",
  );
  const totalRevenue = paidInvoices.reduce(
    (s, i) => s + (i.totals?.total || 0),
    0,
  );
  const totalPaid = allDocs.reduce((s, d) => s + (d.totals?.paid || 0), 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.totals?.due ?? i.totals?.total ?? 0), 0);
  const conversionRate =
    quotes.length > 0
      ? Math.round(
          (quotes.filter((q) => q.convertedToInvoice).length / quotes.length) *
            100,
        )
      : 0;

  // Electrical-specific breakdowns
  const emergencyJobs = [...quotes, ...invoices].filter(
    (d) => d.propertyDetails?.urgency === "Emergency",
  );
  const urgentJobs = [...quotes, ...invoices].filter(
    (d) => d.propertyDetails?.urgency === "Urgent",
  );

  const workCategoryTotals = {};
  [...quotes, ...invoices].forEach((doc) => {
    (doc.items || []).forEach((item) => {
      const cat = item.workCategory || "Other";
      workCategoryTotals[cat] =
        (workCategoryTotals[cat] || 0) + (item.totalAmount || 0);
    });
  });
  const topCategories = Object.entries(workCategoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const fmtR = (n) =>
    `R${(n || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading reports…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#1e293b]">Reports</h1>
        <p className="text-xs text-[#64748b] mt-0.5">
          Financial and job overview
        </p>
      </div>

      {/* Emergency / Urgent banner */}
      {(emergencyJobs.length > 0 || urgentJobs.length > 0) && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#991b1b]">
              High-priority jobs on record
            </p>
            <p className="text-xs text-[#dc2626] mt-0.5">
              {emergencyJobs.length > 0 && `${emergencyJobs.length} emergency`}
              {emergencyJobs.length > 0 && urgentJobs.length > 0 && " · "}
              {urgentJobs.length > 0 && `${urgentJobs.length} urgent`}
              {" quotes/invoices found"}
            </p>
          </div>
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Quotes",
            value: quotes.length,
            icon: FileText,
            color: "text-[#d97706]",
            bg: "bg-[#fffbeb]",
            iconBg: "bg-[#fef3c7]",
          },
          {
            label: "Total Invoices",
            value: invoices.length,
            icon: Receipt,
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
            iconBg: "bg-[#dbeafe]",
          },
          {
            label: "Total Revenue",
            value: fmtR(totalRevenue),
            icon: DollarSign,
            color: "text-[#059669]",
            bg: "bg-[#f0fdf4]",
            iconBg: "bg-[#dcfce7]",
          },
          {
            label: "Outstanding",
            value: fmtR(totalOutstanding),
            icon: Clock,
            color: "text-[#dc2626]",
            bg: "bg-[#fef2f2]",
            iconBg: "bg-[#fee2e2]",
          },
        ].map(({ label, value, icon: Icon, color, bg, iconBg }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                {label}
              </p>
              <div
                className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Paid",
            value: paidInvoices.length,
            sub: `${fmtR(totalPaid)} collected`,
            color: "text-[#059669]",
            bg: "bg-[#f0fdf4]",
          },
          {
            label: "Partially Paid",
            value: partialInvoices.length,
            sub: "Awaiting balance",
            color: "text-[#d97706]",
            bg: "bg-[#fffbeb]",
          },
          {
            label: "Conversion",
            value: `${conversionRate}%`,
            sub: `${quotes.filter((q) => q.convertedToInvoice).length}/${quotes.length} converted`,
            color: "text-[#7c3aed]",
            bg: "bg-[#faf5ff]",
          },
          {
            label: "Emergency",
            value: emergencyJobs.length,
            sub: "Callouts on record",
            color:
              emergencyJobs.length > 0 ? "text-[#dc2626]" : "text-[#059669]",
            bg: emergencyJobs.length > 0 ? "bg-[#fef2f2]" : "bg-[#f0fdf4]",
          },
        ].map(({ label, value, sub, color, bg }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Invoice status breakdown */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#64748b]" />
          <span className="text-sm font-semibold text-[#374151]">
            Invoice Status Breakdown
          </span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
            <p className="text-sm text-[#94a3b8]">No invoices yet</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {[
              {
                label: "Paid",
                count: paidInvoices.length,
                amount: paidInvoices.reduce(
                  (s, i) => s + (i.totals?.total || 0),
                  0,
                ),
                cls: "bg-[#059669]",
              },
              {
                label: "Partially Paid",
                count: partialInvoices.length,
                amount: partialInvoices.reduce(
                  (s, i) => s + (i.totals?.total || 0),
                  0,
                ),
                cls: "bg-[#d97706]",
              },
              {
                label: "Pending",
                count: pendingInvoices.length,
                amount: pendingInvoices.reduce(
                  (s, i) => s + (i.totals?.total || 0),
                  0,
                ),
                cls: "bg-[#2563eb]",
              },
            ].map(({ label, count, amount, cls }) => {
              const barPct =
                invoices.length > 0
                  ? Math.round((count / invoices.length) * 100)
                  : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cls}`} />
                      <span className="text-sm text-[#374151] font-medium">
                        {label}
                      </span>
                      <span className="text-xs text-[#94a3b8]">({count})</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1e293b]">
                      {fmtR(amount)}
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                    <div
                      className={`${cls} h-2 rounded-full transition-all`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top work categories by revenue */}
      {topCategories.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#d97706]" />
            <span className="text-sm font-semibold text-[#374151]">
              Top Work Categories by Revenue
            </span>
          </div>
          <div className="p-5 space-y-3">
            {topCategories.map(([cat, total], i) => {
              const maxVal = topCategories[0][1];
              const barPct =
                maxVal > 0 ? Math.round((total / maxVal) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#94a3b8] w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#374151] font-medium">
                        {cat}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#1e293b]">
                      {fmtR(total)}
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                    <div
                      className="bg-[#d97706] h-1.5 rounded-full transition-all"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent invoices */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#64748b]" />
          <span className="text-sm font-semibold text-[#374151]">
            Recent Invoices
          </span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#94a3b8]">
            No invoices yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {[
                    "Invoice #",
                    "Client",
                    "Type",
                    "Urgency",
                    "Total",
                    "Paid",
                    "Balance",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 10).map((inv) => {
                  const statusCls =
                    inv.status === "paid"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : inv.status === "partially_paid"
                        ? "bg-[#fef3c7] text-[#92400e]"
                        : "bg-[#dbeafe] text-[#1e40af]";
                  const urgency = inv.propertyDetails?.urgency || "Standard";
                  const urgencyCls =
                    urgency === "Emergency"
                      ? "bg-[#fef2f2] text-[#991b1b]"
                      : urgency === "Urgent"
                        ? "bg-[#fff7ed] text-[#9a3412]"
                        : "bg-[#f1f5f9] text-[#475569]";
                  const balance =
                    (inv.totals?.due ?? inv.totals?.total ?? 0) -
                    (inv.totals?.paid ?? 0);
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-[#d97706]">
                        {inv.quoteNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {inv.customer?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b]">
                        {inv.propertyDetails?.type || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${urgencyCls}`}
                        >
                          {urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                        {fmtR(inv.totals?.total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#059669] font-medium">
                        {fmtR(inv.totals?.paid)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#dc2626]">
                        {fmtR(Math.max(0, balance))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${statusCls}`}
                        >
                          {inv.status === "partially_paid"
                            ? "Partial"
                            : inv.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent quotes */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#64748b]" />
          <span className="text-sm font-semibold text-[#374151]">
            Recent Quotes
          </span>
        </div>
        {quotes.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#94a3b8]">
            No quotes yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {[
                    "Quote #",
                    "Client",
                    "Type",
                    "Power (A)",
                    "Value",
                    "Converted",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.slice(0, 10).map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-[#d97706]">
                      {q.quoteNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {q.customer?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">
                      {q.propertyDetails?.type || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {q.propertyDetails?.powerRating
                        ? `${q.propertyDetails.powerRating}A`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                      {fmtR(q.totals?.total)}
                    </td>
                    <td className="px-4 py-3">
                      {q.convertedToInvoice ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[#059669] font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          {q.convertedToInvoiceNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">
                          Not converted
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                      {q.dates?.quoteDate
                        ? new Date(q.dates.quoteDate).toLocaleDateString(
                            "en-ZA",
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
