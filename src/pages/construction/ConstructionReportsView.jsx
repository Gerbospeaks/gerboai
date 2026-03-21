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
} from "lucide-react";

// ── Component ─────────────────────────────────────────────────────────────────
export default function ConstructionReportsView({ user }) {
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
    (i) => i.status === "pending" || !i.status,
  );
  const totalRevenue = paidInvoices.reduce(
    (s, i) => s + (i.totals?.total || 0),
    0,
  );
  const totalPaid = allDocs.reduce((s, d) => s + (d.totals?.paid || 0), 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.totals?.due || i.totals?.total || 0), 0);
  const conversionRate =
    quotes.length > 0
      ? Math.round(
          (quotes.filter((q) => q.convertedToInvoice).length / quotes.length) *
            100,
        )
      : 0;

  const fmtR = (n) =>
    `R${n.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

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
          Financial and document overview
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Quotes",
            value: quotes.length,
            icon: FileText,
            color: "text-[#ea580c]",
            bg: "bg-[#fff7ed]",
            iconBg: "bg-[#ffedd5]",
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Paid Invoices",
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
            label: "Quote Conversion",
            value: `${conversionRate}%`,
            sub: `${quotes.filter((q) => q.convertedToInvoice).length} of ${quotes.length} converted`,
            color: "text-[#7c3aed]",
            bg: "bg-[#faf5ff]",
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
                pct: invoices.length,
              },
              {
                label: "Partially Paid",
                count: partialInvoices.length,
                amount: partialInvoices.reduce(
                  (s, i) => s + (i.totals?.total || 0),
                  0,
                ),
                cls: "bg-[#d97706]",
                pct: invoices.length,
              },
              {
                label: "Pending",
                count: pendingInvoices.length,
                amount: pendingInvoices.reduce(
                  (s, i) => s + (i.totals?.total || 0),
                  0,
                ),
                cls: "bg-[#2563eb]",
                pct: invoices.length,
              },
            ].map(({ label, count, amount, cls, pct }) => {
              const barPct = pct > 0 ? Math.round((count / pct) * 100) : 0;
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

      {/* Recent invoices table */}
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
                    "Site Type",
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
                  const statusLabel =
                    inv.status === "paid"
                      ? "Paid"
                      : inv.status === "partially_paid"
                        ? "Partial"
                        : "Pending";
                  const balance =
                    (inv.totals?.due ?? inv.totals?.total ?? 0) -
                    (inv.totals?.paid ?? 0);
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-[#ea580c]">
                        {inv.quoteNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {inv.customer?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b]">
                        {inv.siteDetails?.type || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                        {fmtR(inv.totals?.total || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#059669] font-medium">
                        {fmtR(inv.totals?.paid || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#dc2626]">
                        {fmtR(Math.max(0, balance))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${statusCls}`}
                        >
                          {statusLabel}
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

      {/* Recent quotes table */}
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
                    "Site Type",
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
                    <td className="px-4 py-3 text-sm font-semibold text-[#ea580c]">
                      {q.quoteNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {q.customer?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">
                      {q.siteDetails?.type || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">{`R${(q.totals?.total || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`}</td>
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
