import React, { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Scale,
  Droplets,
  Receipt,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });
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
const CURR_YEAR = new Date().getFullYear();
const YEAR_OPTS = [CURR_YEAR, CURR_YEAR - 1, CURR_YEAR - 2];

const TABS = [
  { id: "report-pnl", label: "Profit & Loss", icon: TrendingUp },
  { id: "report-balance", label: "Balance Sheet", icon: Scale },
  { id: "report-cashflow", label: "Cash Flow", icon: Droplets },
  { id: "report-tax", label: "Tax Summary", icon: Receipt },
];

// Props: user, clientId, clientName, defaultTab
export default function ReportsView({
  user,
  clientId,
  clientName,
  defaultTab = "report-pnl",
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const db = getFirestore();
  const clientBase = ["users", user.uid, "clients", clientId];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-[#e2e8f0] bg-white px-6">
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === id ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "report-pnl" && (
          <PnLReport db={db} clientBase={clientBase} clientName={clientName} />
        )}
        {activeTab === "report-balance" && (
          <BalanceSheet
            db={db}
            clientBase={clientBase}
            clientName={clientName}
          />
        )}
        {activeTab === "report-cashflow" && (
          <CashFlowReport
            db={db}
            clientBase={clientBase}
            clientName={clientName}
          />
        )}
        {activeTab === "report-tax" && (
          <TaxReport db={db} clientBase={clientBase} clientName={clientName} />
        )}
      </div>
    </div>
  );
}

// ── P & L ─────────────────────────────────────────────────────────────────────
function PnLReport({ db, clientBase, clientName }) {
  const [year, setYear] = useState(CURR_YEAR);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${year}-01-01`,
        endDate = `${year}-12-31`;

      // Pull invoices from the TOP-LEVEL invoices collection tagged with clientId,
      // plus any invoices stored under the client sub-collection
      let invoices = [];
      try {
        const txSnap = await getDocs(
          query(
            collection(db, ...clientBase, "transactions"),
            where("type", "==", "credit"),
          ),
        );
        invoices = txSnap.docs
          .map((d) => d.data())
          .filter(
            (t) =>
              (t.date || "").slice(0, 10) >= startDate &&
              (t.date || "").slice(0, 10) <= endDate,
          );
      } catch (_) {}

      let expenses = [];
      try {
        const expSnap = await getDocs(
          query(
            collection(db, ...clientBase, "transactions"),
            where("type", "==", "debit"),
          ),
        );
        expenses = expSnap.docs
          .map((d) => d.data())
          .filter(
            (t) =>
              (t.date || "").slice(0, 10) >= startDate &&
              (t.date || "").slice(0, 10) <= endDate,
          );
      } catch (_) {}

      const monthly = Array.from({ length: 12 }, (_, i) => {
        const m = String(i + 1).padStart(2, "0");
        const pfx = `${year}-${m}`;
        const rev = invoices
          .filter((t) => (t.date || "").startsWith(pfx))
          .reduce((s, t) => s + (t.amount || 0), 0);
        const exp = expenses
          .filter((t) => (t.date || "").startsWith(pfx))
          .reduce((s, t) => s + (t.amount || 0), 0);
        return {
          month: MONTHS[i],
          revenue: rev,
          expenses: exp,
          profit: rev - exp,
        };
      });

      const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
      const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
      const grossProfit = totalRevenue - totalExpenses;
      const margin =
        totalRevenue > 0
          ? ((grossProfit / totalRevenue) * 100).toFixed(1)
          : "0.0";
      setData({ monthly, totalRevenue, totalExpenses, grossProfit, margin });
    } finally {
      setLoading(false);
    }
  }, [year, clientBase.join(",")]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <ReportHeader
        icon={TrendingUp}
        iconBg="bg-[#f0fdf4]"
        iconColor="text-[#059669]"
        title="Profit & Loss"
        subtitle={`${clientName} · ${year}`}
        controls={
          <YearPicker year={year} onChange={setYear} onRefresh={load} />
        }
      />
      {loading ? (
        <Loading />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Revenue",
                value: `R${fmt(data.totalRevenue)}`,
                icon: ArrowUpRight,
                bg: "bg-[#f0fdf4]",
                color: "text-[#059669]",
              },
              {
                label: "Total Expenses",
                value: `R${fmt(data.totalExpenses)}`,
                icon: ArrowDownRight,
                bg: "bg-[#fef2f2]",
                color: "text-[#dc2626]",
              },
              {
                label: "Net Profit",
                value: `R${fmt(data.grossProfit)}`,
                icon: DollarSign,
                bg: data.grossProfit >= 0 ? "bg-[#eff6ff]" : "bg-[#fef2f2]",
                color:
                  data.grossProfit >= 0 ? "text-[#2563eb]" : "text-[#dc2626]",
              },
              {
                label: "Profit Margin",
                value: `${data.margin}%`,
                icon: BarChart3,
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
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0]">
              <span className="text-sm font-semibold text-[#374151]">
                Monthly Breakdown — {year}
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {["Month", "Revenue", "Expenses", "Net Profit", "Margin"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.monthly.map((row) => {
                  const m =
                    row.revenue > 0
                      ? `${((row.profit / row.revenue) * 100).toFixed(1)}%`
                      : "—";
                  return (
                    <tr
                      key={row.month}
                      className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-semibold text-[#374151]">
                        {row.month}
                      </td>
                      <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                        R{fmt(row.revenue)}
                      </td>
                      <td className="px-5 py-3 text-sm text-[#dc2626] font-medium">
                        R{fmt(row.expenses)}
                      </td>
                      <td
                        className={`px-5 py-3 text-sm font-bold ${row.profit >= 0 ? "text-[#2563eb]" : "text-[#dc2626]"}`}
                      >
                        R{fmt(row.profit)}
                      </td>
                      <td className="px-5 py-3 text-sm text-[#64748b]">{m}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0]">
                  <td className="px-5 py-3 text-sm font-bold text-[#1e293b]">
                    Total
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-[#059669]">
                    R{fmt(data.totalRevenue)}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-[#dc2626]">
                    R{fmt(data.totalExpenses)}
                  </td>
                  <td
                    className={`px-5 py-3 text-sm font-bold ${data.grossProfit >= 0 ? "text-[#2563eb]" : "text-[#dc2626]"}`}
                  >
                    R{fmt(data.grossProfit)}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-[#7c3aed]">
                    {data.margin}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Balance Sheet ─────────────────────────────────────────────────────────────
function BalanceSheet({ db, clientBase, clientName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [coaSnap, bankSnap] = await Promise.all([
        getDocs(collection(db, ...clientBase, "chartOfAccounts")),
        getDocs(collection(db, ...clientBase, "bankAccounts")),
      ]);
      const coa = coaSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const banks = bankSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const cashTotal = banks.reduce((s, b) => s + (b.currentBalance || 0), 0);
      const cashAccounts = banks.map((b) => ({
        name: b.name,
        balance: b.currentBalance || 0,
      }));
      const assetAccounts = coa.filter(
        (a) => a.type === "Asset" && !a.name.toLowerCase().includes("cash"),
      );
      const liabilities = coa.filter((a) => a.type === "Liability");
      const equity = coa.filter((a) => a.type === "Equity");
      const totalAssets =
        cashTotal + assetAccounts.reduce((s, a) => s + (a.balance || 0), 0);
      const totalLiab = liabilities.reduce((s, a) => s + (a.balance || 0), 0);
      const totalEquity = equity.reduce((s, a) => s + (a.balance || 0), 0);
      setData({
        cashAccounts,
        cashTotal,
        assetAccounts,
        liabilities,
        equity,
        totalAssets,
        totalLiab,
        totalEquity,
        netAssets: totalAssets - totalLiab,
      });
    } finally {
      setLoading(false);
    }
  }, [clientBase.join(",")]);

  useEffect(() => {
    load();
  }, [load]);

  const Section = ({ title, color, rows, total }) => (
    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
        <span className={`text-sm font-bold ${color}`}>{title}</span>
        <span className="text-sm font-bold text-[#1e293b]">R{fmt(total)}</span>
      </div>
      <table className="w-full">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc] transition-colors"
            >
              <td className="px-5 py-2.5 text-sm text-[#374151]">{r.name}</td>
              <td className="px-5 py-2.5 text-sm font-semibold text-[#1e293b] text-right">
                R{fmt(r.balance)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={2}
                className="px-5 py-4 text-xs text-center text-[#94a3b8]"
              >
                No entries — add accounts in Chart of Accounts
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-[#f8fafc] border-t border-[#e2e8f0]">
            <td className="px-5 py-3 text-sm font-bold text-[#374151]">
              Total
            </td>
            <td className="px-5 py-3 text-sm font-bold text-[#1e293b] text-right">
              R{fmt(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <ReportHeader
        icon={Scale}
        iconBg="bg-[#eff6ff]"
        iconColor="text-[#2563eb]"
        title="Balance Sheet"
        subtitle={`${clientName} · As at ${new Date().toLocaleDateString("en-ZA")}`}
        controls={
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] text-sm rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        }
      />
      {loading ? (
        <Loading />
      ) : !data ? null : (
        <>
          <div
            className={`px-5 py-4 rounded-xl border flex items-center justify-between ${data.netAssets >= 0 ? "bg-[#f0fdf4] border-[#bbf7d0]" : "bg-[#fef2f2] border-[#fecaca]"}`}
          >
            <div>
              <p className="text-sm font-semibold text-[#1e293b]">Net Assets</p>
              <p className="text-xs text-[#64748b] mt-0.5">
                Business net worth for {clientName}
              </p>
            </div>
            <p
              className={`text-2xl font-black ${data.netAssets >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
            >
              R{fmt(data.netAssets)}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3">
              <Section
                title="Cash & Bank"
                color="text-[#059669]"
                rows={data.cashAccounts}
                total={data.cashTotal}
              />
              <Section
                title="Other Assets"
                color="text-[#2563eb]"
                rows={data.assetAccounts.map((a) => ({
                  name: a.name,
                  balance: a.balance || 0,
                }))}
                total={data.assetAccounts.reduce(
                  (s, a) => s + (a.balance || 0),
                  0,
                )}
              />
              <div className="px-5 py-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-[#2563eb]">
                  Total Assets
                </span>
                <span className="text-sm font-black text-[#1e293b]">
                  R{fmt(data.totalAssets)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <Section
                title="Liabilities"
                color="text-[#dc2626]"
                rows={data.liabilities.map((a) => ({
                  name: a.name,
                  balance: a.balance || 0,
                }))}
                total={data.totalLiab}
              />
              <Section
                title="Equity"
                color="text-[#7c3aed]"
                rows={data.equity.map((a) => ({
                  name: a.name,
                  balance: a.balance || 0,
                }))}
                total={data.totalEquity}
              />
              <div className="px-5 py-3 bg-[#faf5ff] border border-[#e9d5ff] rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-[#7c3aed]">
                  Total Liabilities + Equity
                </span>
                <span className="text-sm font-black text-[#1e293b]">
                  R{fmt(data.totalLiab + data.totalEquity)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Cash Flow ─────────────────────────────────────────────────────────────────
function CashFlowReport({ db, clientBase, clientName }) {
  const [year, setYear] = useState(CURR_YEAR);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${year}-01-01`,
        endDate = `${year}-12-31`;
      const txSnap = await getDocs(
        query(collection(db, ...clientBase, "transactions"), orderBy("date")),
      );
      const allTx = txSnap.docs
        .map((d) => d.data())
        .filter(
          (t) =>
            (t.date || "").slice(0, 10) >= startDate &&
            (t.date || "").slice(0, 10) <= endDate,
        );

      const monthly = Array.from({ length: 12 }, (_, i) => {
        const m = String(i + 1).padStart(2, "0");
        const pfx = `${year}-${m}`;
        const inflows = allTx
          .filter((t) => t.type === "credit" && (t.date || "").startsWith(pfx))
          .reduce((s, t) => s + (t.amount || 0), 0);
        const outflows = allTx
          .filter((t) => t.type === "debit" && (t.date || "").startsWith(pfx))
          .reduce((s, t) => s + (t.amount || 0), 0);
        return { month: MONTHS[i], inflows, outflows, net: inflows - outflows };
      });

      const totalIn = monthly.reduce((s, m) => s + m.inflows, 0);
      const totalOut = monthly.reduce((s, m) => s + m.outflows, 0);
      setData({ monthly, totalIn, totalOut, netCashFlow: totalIn - totalOut });
    } finally {
      setLoading(false);
    }
  }, [year, clientBase.join(",")]);

  useEffect(() => {
    load();
  }, [load]);

  const maxVal = data
    ? Math.max(...data.monthly.map((m) => Math.max(m.inflows, m.outflows)), 1)
    : 1;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <ReportHeader
        icon={Droplets}
        iconBg="bg-[#eff6ff]"
        iconColor="text-[#0891b2]"
        title="Cash Flow"
        subtitle={`${clientName} · ${year}`}
        controls={
          <YearPicker year={year} onChange={setYear} onRefresh={load} />
        }
      />
      {loading ? (
        <Loading />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Inflows",
                value: `R${fmt(data.totalIn)}`,
                color: "text-[#059669]",
                bg: "bg-[#f0fdf4]",
              },
              {
                label: "Total Outflows",
                value: `R${fmt(data.totalOut)}`,
                color: "text-[#dc2626]",
                bg: "bg-[#fef2f2]",
              },
              {
                label: "Net Cash Flow",
                value: `R${fmt(data.netCashFlow)}`,
                color:
                  data.netCashFlow >= 0 ? "text-[#2563eb]" : "text-[#dc2626]",
                bg: data.netCashFlow >= 0 ? "bg-[#eff6ff]" : "bg-[#fef2f2]",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
              >
                <p className="text-xs font-semibold text-[#64748b]">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
            <p className="text-sm font-semibold text-[#374151] mb-4">
              Monthly Cash Flow
            </p>
            <div className="flex items-end gap-2 h-40">
              {data.monthly.map((row) => (
                <div
                  key={row.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full flex gap-0.5 items-end"
                    style={{ height: "120px" }}
                  >
                    <div
                      className="flex-1 bg-[#bbf7d0] rounded-t"
                      style={{
                        height: `${(row.inflows / maxVal) * 100}%`,
                        minHeight: row.inflows > 0 ? "2px" : "0",
                      }}
                    />
                    <div
                      className="flex-1 bg-[#fecaca] rounded-t"
                      style={{
                        height: `${(row.outflows / maxVal) * 100}%`,
                        minHeight: row.outflows > 0 ? "2px" : "0",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#94a3b8]">
                    {row.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#bbf7d0]" />
                <span className="text-xs text-[#64748b]">Inflows</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#fecaca]" />
                <span className="text-xs text-[#64748b]">Outflows</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {["Month", "Inflows", "Outflows", "Net", "Running Total"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let r = 0;
                  return data.monthly.map((row) => {
                    r += row.net;
                    return (
                      <tr
                        key={row.month}
                        className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                      >
                        <td className="px-5 py-3 text-sm font-semibold text-[#374151]">
                          {row.month}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                          R{fmt(row.inflows)}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#dc2626] font-medium">
                          R{fmt(row.outflows)}
                        </td>
                        <td
                          className={`px-5 py-3 text-sm font-bold ${row.net >= 0 ? "text-[#2563eb]" : "text-[#dc2626]"}`}
                        >
                          R{fmt(row.net)}
                        </td>
                        <td
                          className={`px-5 py-3 text-sm font-semibold ${r >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
                        >
                          R{fmt(r)}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tax Summary ───────────────────────────────────────────────────────────────
function TaxReport({ db, clientBase, clientName }) {
  const [year, setYear] = useState(CURR_YEAR);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${year}-01-01`,
        endDate = `${year}-12-31`;
      const txSnap = await getDocs(
        query(collection(db, ...clientBase, "transactions"), orderBy("date")),
      );
      const allTx = txSnap.docs
        .map((d) => d.data())
        .filter(
          (t) =>
            (t.date || "").slice(0, 10) >= startDate &&
            (t.date || "").slice(0, 10) <= endDate,
        );

      const quarters = [
        { label: "Q1 (Jan–Mar)", months: ["01", "02", "03"] },
        { label: "Q2 (Apr–Jun)", months: ["04", "05", "06"] },
        { label: "Q3 (Jul–Sep)", months: ["07", "08", "09"] },
        { label: "Q4 (Oct–Dec)", months: ["10", "11", "12"] },
      ].map((q) => {
        const qTx = allTx.filter((t) =>
          q.months.some((m) => (t.date || "").startsWith(`${year}-${m}`)),
        );
        const revenue = qTx
          .filter((t) => t.type === "credit")
          .reduce((s, t) => s + (t.amount || 0), 0);
        const vatOut = revenue * 0.15;
        const expAmt = qTx
          .filter((t) => t.type === "debit")
          .reduce((s, t) => s + (t.amount || 0), 0);
        const vatIn = expAmt * 0.15;
        return {
          ...q,
          revenue,
          vatOut,
          vatIn,
          netVat: vatOut - vatIn,
          txCount: qTx.length,
        };
      });

      const totals = quarters.reduce(
        (s, q) => ({
          vatOut: s.vatOut + q.vatOut,
          vatIn: s.vatIn + q.vatIn,
          netVat: s.netVat + q.netVat,
          revenue: s.revenue + q.revenue,
        }),
        { vatOut: 0, vatIn: 0, netVat: 0, revenue: 0 },
      );
      setData({ quarters, totals });
    } finally {
      setLoading(false);
    }
  }, [year, clientBase.join(",")]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <ReportHeader
        icon={Receipt}
        iconBg="bg-[#fff7ed]"
        iconColor="text-[#ea580c]"
        title="VAT / Tax Summary"
        subtitle={`${clientName} · ${year} · 15% standard rate`}
        controls={
          <YearPicker year={year} onChange={setYear} onRefresh={load} />
        }
      />
      {loading ? (
        <Loading />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Output VAT (Collected)",
                value: `R${fmt(data.totals.vatOut)}`,
                color: "text-[#dc2626]",
                bg: "bg-[#fef2f2]",
                note: "From credit transactions",
              },
              {
                label: "Input VAT (Paid)",
                value: `R${fmt(data.totals.vatIn)}`,
                color: "text-[#059669]",
                bg: "bg-[#f0fdf4]",
                note: "From debit transactions",
              },
              {
                label: "Net VAT Payable",
                value: `R${fmt(data.totals.netVat)}`,
                color:
                  data.totals.netVat >= 0 ? "text-[#ea580c]" : "text-[#059669]",
                bg: "bg-[#fff7ed]",
                note: data.totals.netVat >= 0 ? "Due to SARS" : "Refund due",
              },
            ].map(({ label, value, color, bg, note }) => (
              <div
                key={label}
                className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
              >
                <p className="text-xs font-semibold text-[#64748b]">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
                <p className="text-xs text-[#94a3b8] mt-1">{note}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0]">
              <span className="text-sm font-semibold text-[#374151]">
                Quarterly VAT201 Summary
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {[
                    "Quarter",
                    "Revenue",
                    "Output VAT",
                    "Input VAT",
                    "Net VAT Due",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.quarters.map((q) => (
                  <tr
                    key={q.label}
                    className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-semibold text-[#374151]">
                      {q.label}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#1e293b]">
                      R{fmt(q.revenue)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#dc2626] font-medium">
                      R{fmt(q.vatOut)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#059669] font-medium">
                      R{fmt(q.vatIn)}
                    </td>
                    <td
                      className={`px-5 py-3 text-sm font-bold ${q.netVat >= 0 ? "text-[#ea580c]" : "text-[#059669]"}`}
                    >
                      R{fmt(q.netVat)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0]">
                  <td className="px-5 py-3 text-sm font-bold text-[#1e293b]">
                    Annual Total
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-[#1e293b]">
                    R{fmt(data.totals.revenue)}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-[#dc2626]">
                    R{fmt(data.totals.vatOut)}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-[#059669]">
                    R{fmt(data.totals.vatIn)}
                  </td>
                  <td
                    className={`px-5 py-3 text-sm font-black ${data.totals.netVat >= 0 ? "text-[#ea580c]" : "text-[#059669]"}`}
                  >
                    R{fmt(data.totals.netVat)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-5 py-4 bg-[#fff7ed] border border-[#fed7aa] rounded-xl text-xs text-[#9a3412]">
            <p className="font-semibold mb-1">⚠ Disclaimer</p>
            <p>
              This is an estimated management summary only. Always verify VAT201
              returns with SARS via a registered tax practitioner before
              submission.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function ReportHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  controls,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1e293b]">{title}</h2>
          <p className="text-xs text-[#64748b]">{subtitle}</p>
        </div>
      </div>
      {controls}
    </div>
  );
}
function YearPicker({ year, onChange, onRefresh }) {
  return (
    <div className="flex items-center gap-2">
      <select
        className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {YEAR_OPTS.map((y) => (
          <option key={y}>{y}</option>
        ))}
      </select>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] text-sm rounded-lg transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Refresh
      </button>
    </div>
  );
}
function Loading() {
  return (
    <div className="text-center py-16 text-[#94a3b8] text-sm">
      Loading report data…
    </div>
  );
}
