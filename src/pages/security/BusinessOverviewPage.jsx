import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  DollarSign,
  FileText,
  UserCheck,
  Building,
  TrendingUp,
  Download,
} from "lucide-react";

const db = getFirestore();

export default function BusinessOverviewPage({ user }) {
  const [data, setData] = useState({
    clients: [],
    guards: [],
    sites: [],
    invoices: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchAll = async () => {
      try {
        const [clientsSnap, guardsSnap, sitesSnap, invoicesSnap] =
          await Promise.all([
            getDocs(collection(db, "users", user.uid, "clients")),
            getDocs(collection(db, "users", user.uid, "guards")),
            getDocs(collection(db, "users", user.uid, "sites")),
            getDocs(collection(db, "users", user.uid, "invoices")),
          ]);
        setData({
          clients: clientsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          guards: guardsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          sites: sitesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          invoices: invoicesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const parseAmount = (str) => {
    if (!str) return 0;
    return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
  };

  const fmt = (n) =>
    `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;

  const monthlyRevenue = data.invoices
    .filter((i) => i.status === "Paid" || i.status === "Outstanding")
    .reduce((a, i) => a + parseAmount(i.amount), 0);

  const paidRevenue = data.invoices
    .filter((i) => i.status === "Paid")
    .reduce((a, i) => a + parseAmount(i.amount), 0);
  const outstandingRevenue = data.invoices
    .filter((i) => i.status === "Outstanding")
    .reduce((a, i) => a + parseAmount(i.amount), 0);
  const overdueRevenue = data.invoices
    .filter((i) => i.status === "Overdue")
    .reduce((a, i) => a + parseAmount(i.amount), 0);

  const activeClients = data.clients.filter((c) => c.status === "Active");
  const deployedGuards = data.guards.filter(
    (g) => g.status === "On Duty" || g.site !== "Unassigned",
  );

  // Revenue by client
  const revenueByClient = data.clients
    .filter((c) => c.value)
    .sort((a, b) => parseAmount(b.value) - parseAmount(a.value))
    .slice(0, 6);

  const maxClientRevenue = revenueByClient.length
    ? Math.max(...revenueByClient.map((c) => parseAmount(c.value)))
    : 1;

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">
            Business Overview
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Financial performance and business metrics
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg hover:bg-[#f8fafc]">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: loading ? "…" : fmt(monthlyRevenue),
            icon: DollarSign,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Active Contracts",
            value: loading ? "…" : activeClients.length,
            icon: FileText,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Guards Deployed",
            value: loading ? "…" : deployedGuards.length,
            icon: UserCheck,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
          },
          {
            label: "Sites Secured",
            value: loading ? "…" : data.sites.length,
            icon: Building,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-xs font-semibold text-[#059669] flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
              </span>
            </div>
            {loading ? (
              <div className="h-6 bg-[#f1f5f9] rounded animate-pulse mb-1" />
            ) : (
              <p className="text-lg font-bold text-[#1e293b]">{value}</p>
            )}
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Invoice summary */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
          Invoice Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-[#f0fdf4] rounded-xl">
            <p className="text-xl font-bold text-[#059669]">
              {loading ? "…" : fmt(paidRevenue)}
            </p>
            <p className="text-xs text-[#64748b] mt-1">Paid</p>
          </div>
          <div className="text-center p-4 bg-[#eff6ff] rounded-xl">
            <p className="text-xl font-bold text-[#2563eb]">
              {loading ? "…" : fmt(outstandingRevenue)}
            </p>
            <p className="text-xs text-[#64748b] mt-1">Outstanding</p>
          </div>
          <div className="text-center p-4 bg-[#fef2f2] rounded-xl">
            <p className="text-xl font-bold text-[#dc2626]">
              {loading ? "…" : fmt(overdueRevenue)}
            </p>
            <p className="text-xs text-[#64748b] mt-1">Overdue</p>
          </div>
        </div>
      </div>

      {/* Two-column metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Revenue by client */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Revenue by Client
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-[#f8fafc] rounded animate-pulse"
                />
              ))}
            </div>
          ) : revenueByClient.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-6">
              No client revenue data yet. Add clients with a monthly value.
            </p>
          ) : (
            <div className="space-y-3">
              {revenueByClient.map(({ id, name, value }) => {
                const amt = parseAmount(value);
                const pct = Math.round((amt / maxClientRevenue) * 100);
                return (
                  <div key={id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#374151] truncate max-w-[180px]">
                        {name}
                      </span>
                      <span className="text-xs font-semibold text-[#1e293b] ml-2 whitespace-nowrap">
                        {value}
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Key Business Metrics */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Key Business Metrics
          </h3>
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
            <div className="space-y-3">
              {[
                { label: "Total Clients", value: data.clients.length },
                { label: "Active Clients", value: activeClients.length },
                { label: "Total Guards", value: data.guards.length },
                {
                  label: "On Duty Now",
                  value: data.guards.filter((g) => g.status === "On Duty")
                    .length,
                },
                { label: "Total Sites", value: data.sites.length },
                {
                  label: "High Risk Sites",
                  value: data.sites.filter((s) => s.risk === "High").length,
                },
                { label: "Total Invoices", value: data.invoices.length },
                {
                  label: "Paid Invoices",
                  value: data.invoices.filter((i) => i.status === "Paid")
                    .length,
                },
                {
                  label: "Outstanding Invoices",
                  value: fmt(outstandingRevenue),
                },
                {
                  label: "Overdue Amount",
                  value: overdueRevenue > 0 ? fmt(overdueRevenue) : "None",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 border-b border-[#f1f5f9] last:border-0"
                >
                  <span className="text-sm text-[#64748b]">{label}</span>
                  <span className="text-sm font-bold text-[#1e293b]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Clients list */}
      {!loading && activeClients.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Active Client Contracts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {[
                    "Client",
                    "Contact",
                    "Sites",
                    "Guards",
                    "Monthly Value",
                    "Contract Since",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeClients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {c.contact || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {c.sites || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {c.guards || 0}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#059669]">
                      {c.value || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">
                      {c.contract || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
