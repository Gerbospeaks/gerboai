import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { BarChart3 } from "lucide-react";
import { fmtR, LoadingRow, PageHeader, StatCard, EmptyState, userCol, fetchAll } from "./VirtualViewKit";

/**
 * VirtualAnalyticsView – revenue, collections, quote pipeline and service mix,
 * computed from the user's saved invoices, quotes and engagements.
 * (Charts are plain CSS bars so there is no extra chart dependency.)
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const docDate = (d, preferredKey) => {
  const iso = d.dates?.[preferredKey];
  if (iso) {
    const x = new Date(iso);
    if (!isNaN(x)) return x;
  }
  const t = d.createdAt;
  if (t?.toDate) return t.toDate();
  return null;
};

const Bar = ({ label, value, max, right, color = "bg-[#7c3aed]" }) => (
  <div>
    <div className="flex items-center justify-between text-xs mb-1">
      <span className="text-[#374151] font-medium truncate pr-2">{label}</span>
      <span className="text-[#64748b] flex-shrink-0">{right ?? fmtR(value)}</span>
    </div>
    <div className="w-full bg-[#f1f5f9] rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%` }} />
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
    <h3 className="text-sm font-semibold text-[#1e293b] mb-4">{title}</h3>
    {children}
  </div>
);

export default function VirtualAnalyticsView({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const grab = async (name) => {
          const snap = await getDocs(query(collection(db, "users", user.uid, name), orderBy("createdAt", "desc"), limit(500)));
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        };
        const [inv, quo, proj] = await Promise.all([
          grab("invoices"),
          grab("quotes").catch(() => []),
          fetchAll(userCol(user.uid, "projects")).catch(() => []),
        ]);
        setInvoices(inv);
        setQuotes(quo);
        setProjects(proj);
      } catch (e) {
        console.error("Analytics load:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const stats = useMemo(() => {
    const total = (d) => Number(d.totals?.total) || 0;
    const invoiced = invoices.reduce((s, i) => s + total(i), 0);
    const collected = invoices.reduce((s, i) => s + (Number(i.totals?.paid) || 0), 0);
    const outstanding = invoices.reduce((s, i) => s + (Number(i.totals?.due ?? total(i) - (Number(i.totals?.paid) || 0)) || 0), 0);

    // last 6 months, oldest first
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: `${MONTHS[d.getMonth()]}`, value: 0 };
    });
    invoices.forEach((i) => {
      const d = docDate(i, "invoiceDate");
      if (!d) return;
      const b = buckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (b) b.value += total(i);
    });

    const byService = {};
    const byClient = {};
    invoices.forEach((i) => {
      const s = i.event?.type || "Other";
      byService[s] = (byService[s] || 0) + total(i);
      const c = i.customer?.name || "Unknown";
      byClient[c] = (byClient[c] || 0) + total(i);
    });
    const rank = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);

    const quoteValue = quotes.reduce((s, q) => s + total(q), 0);
    const converted = quotes.filter((q) => q.convertedToInvoice || q.status === "converted").length;

    return {
      invoiced,
      collected,
      outstanding,
      rate: invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0,
      buckets,
      services: rank(byService, 6),
      clients: rank(byClient, 5),
      quoteValue,
      converted,
      conversion: quotes.length ? Math.round((converted / quotes.length) * 100) : 0,
    };
  }, [invoices, quotes]);

  if (loading) return <LoadingRow label="Crunching your numbers…" />;

  if (!invoices.length && !quotes.length && !projects.length) {
    return (
      <div className="space-y-5">
        <PageHeader title="Analytics" subtitle="Revenue, collections and pipeline" />
        <EmptyState icon={BarChart3} title="Nothing to analyse yet" hint="Save a few quotes and invoices and your numbers will appear here." />
      </div>
    );
  }

  const maxMonth = Math.max(...stats.buckets.map((b) => b.value), 0);
  const maxService = stats.services[0]?.[1] || 0;
  const maxClient = stats.clients[0]?.[1] || 0;
  const active = projects.filter((p) => p.status === "active");
  const activeBudget = active.reduce((s, p) => s + (p.budget || 0), 0);
  const activeSpent = active.reduce((s, p) => s + (p.spent || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Analytics" subtitle="Revenue, collections and pipeline" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Invoiced" value={fmtR(stats.invoiced)} color="text-[#7c3aed]" bg="bg-[#f5f3ff]" />
        <StatCard label="Collected" value={fmtR(stats.collected)} color="text-[#059669]" bg="bg-[#f0fdf4]" />
        <StatCard label="Outstanding" value={fmtR(stats.outstanding)} color="text-[#dc2626]" bg="bg-[#fef2f2]" />
        <StatCard label="Collection rate" value={`${stats.rate}%`} color="text-[#2563eb]" bg="bg-[#eff6ff]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Invoiced per month (last 6)">
          <div className="flex items-end gap-3 h-40">
            {stats.buckets.map((b) => (
              <div key={b.key} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[10px] text-[#64748b] mb-1">{b.value ? fmtR(Math.round(b.value)) : ""}</span>
                <div className="w-full bg-[#7c3aed] rounded-t-md" style={{ height: `${maxMonth > 0 ? Math.max(b.value ? 4 : 0, (b.value / maxMonth) * 100) : 0}%` }} />
                <span className="text-[11px] text-[#94a3b8] mt-1.5">{b.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Revenue by service">
          {stats.services.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.services.map(([name, v]) => <Bar key={name} label={name} value={v} max={maxService} />)}
            </div>
          )}
        </Card>

        <Card title="Top clients">
          {stats.clients.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.clients.map(([name, v]) => <Bar key={name} label={name} value={v} max={maxClient} color="bg-[#2563eb]" />)}
            </div>
          )}
        </Card>

        <Card title="Pipeline & delivery">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#f8fafc] rounded-lg p-3">
              <p className="text-[11px] text-[#94a3b8] uppercase font-semibold">Quotes</p>
              <p className="text-lg font-bold text-[#1e293b]">{quotes.length}</p>
              <p className="text-xs text-[#64748b]">{fmtR(stats.quoteValue)} quoted</p>
            </div>
            <div className="bg-[#f8fafc] rounded-lg p-3">
              <p className="text-[11px] text-[#94a3b8] uppercase font-semibold">Quote to invoice</p>
              <p className="text-lg font-bold text-[#059669]">{stats.conversion}%</p>
              <p className="text-xs text-[#64748b]">{stats.converted} converted</p>
            </div>
            <div className="bg-[#f8fafc] rounded-lg p-3">
              <p className="text-[11px] text-[#94a3b8] uppercase font-semibold">Active engagements</p>
              <p className="text-lg font-bold text-[#1e293b]">{active.length}</p>
              <p className="text-xs text-[#64748b]">{fmtR(activeBudget)} budgeted</p>
            </div>
            <div className="bg-[#f8fafc] rounded-lg p-3">
              <p className="text-[11px] text-[#94a3b8] uppercase font-semibold">Billed on active</p>
              <p className="text-lg font-bold text-[#7c3aed]">{activeBudget > 0 ? Math.round((activeSpent / activeBudget) * 100) : 0}%</p>
              <p className="text-xs text-[#64748b]">{fmtR(activeSpent)} of budget</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
