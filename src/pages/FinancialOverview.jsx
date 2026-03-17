import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertCircle,
  Calendar,
  Users,
  PieChart,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";

/* ─── Zoho design tokens ─────────────────────────────────────────────────── */
const Z = {
  red:        "#e8442a",
  redHover:   "#c73b24",
  redLight:   "#fdf2f0",
  navy:       "#1a2340",
  navyMid:    "#2d3a55",
  blue:       "#1b6ec2",
  blueLight:  "#e8f0fb",
  green:      "#1d8348",
  greenLight: "#eafaf1",
  amber:      "#b45309",
  amberLight: "#fffbeb",
  border:     "#d9dde6",
  bg:         "#f4f5f8",
  white:      "#ffffff",
  text:       "#1a2340",
  textMid:    "#4a5568",
  textMuted:  "#8a93a6",
  panelHead:  "#f0f2f6",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap');

  .zfo * { font-family: 'Lato', sans-serif; box-sizing: border-box; }

  /* ── Page shell ── */
  .zfo-page {
    min-height: 100vh;
    background: ${Z.bg};
    padding: 0;
  }

  /* ── Top bar ── */
  .zfo-topbar {
    background: ${Z.navy};
    padding: 0 24px;
    height: 52px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,.08);
    flex-shrink: 0;
  }
  .zfo-topbar-left { display: flex; align-items: center; gap: 10px; }
  .zfo-topbar-icon {
    width: 28px; height: 28px; border-radius: 50%;
    background: ${Z.red};
    display: flex; align-items: center; justify-content: center;
  }
  .zfo-topbar-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: .01em; }
  .zfo-topbar-sub   { font-size: 11px; color: rgba(255,255,255,.45); margin-left: 6px; }

  /* Time-range toggle */
  .zfo-range-group { display: flex; gap: 0; border: 1px solid rgba(255,255,255,.2); border-radius: 4px; overflow: hidden; }
  .zfo-range-btn {
    padding: 0 14px; height: 30px;
    background: transparent; border: none; cursor: pointer;
    font-size: 12px; font-weight: 600; color: rgba(255,255,255,.65);
    transition: background .15s, color .15s;
    font-family: 'Lato', sans-serif;
  }
  .zfo-range-btn:hover  { background: rgba(255,255,255,.1); color: #fff; }
  .zfo-range-btn.active { background: ${Z.red}; color: #fff; }

  /* ── Content area ── */
  .zfo-content { padding: 20px 24px; }

  /* ── Health banner ── */
  .zfo-health {
    background: ${Z.navy};
    border-radius: 5px;
    padding: 18px 24px;
    margin-bottom: 16px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    flex-wrap: wrap;
  }
  .zfo-health-score-wrap { display: flex; align-items: center; gap: 20px; }
  .zfo-health-score {
    font-size: 48px; font-weight: 700; color: #fff;
    line-height: 1;
  }
  .zfo-health-label { font-size: 11px; color: rgba(255,255,255,.5); margin-bottom: 4px; text-transform: uppercase; letter-spacing: .06em; }
  .zfo-health-status { display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700; }
  .zfo-health-status.good     { color: #4ade80; }
  .zfo-health-status.warning  { color: #fbbf24; }
  .zfo-health-status.bad      { color: #f87171; }
  .zfo-health-desc { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 3px; }

  .zfo-collection-ring {
    width: 90px; height: 90px; border-radius: 50%;
    border: 6px solid rgba(255,255,255,.15);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .zfo-collection-ring .val { font-size: 20px; font-weight: 700; color: #fff; line-height: 1; }
  .zfo-collection-ring .lbl { font-size: 9px; color: rgba(255,255,255,.45); margin-top: 3px; text-align: center; text-transform: uppercase; letter-spacing: .05em; }

  /* ── Section title row ── */
  .zfo-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: .07em;
    text-transform: uppercase; color: ${Z.textMuted};
    margin: 20px 0 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .zfo-section-title::after { content:''; flex:1; height:1px; background:${Z.border}; }

  /* ── KPI grid ── */
  .zfo-kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 4px;
  }
  @media (max-width: 900px) { .zfo-kpi-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 560px) { .zfo-kpi-grid { grid-template-columns: 1fr; } }

  .zfo-kpi {
    background: ${Z.white};
    border: 1px solid ${Z.border};
    border-radius: 4px;
    padding: 14px 16px;
    transition: box-shadow .15s;
  }
  .zfo-kpi:hover { box-shadow: 0 2px 12px rgba(20,26,48,.08); }
  .zfo-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .zfo-kpi-icon {
    width: 34px; height: 34px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .zfo-kpi-badge {
    display: flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: 700; padding: 2px 7px;
    border-radius: 20px;
  }
  .zfo-kpi-label { font-size: 11px; color: ${Z.textMuted}; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
  .zfo-kpi-value { font-size: 22px; font-weight: 700; color: ${Z.text}; line-height: 1.15; }
  .zfo-kpi-sub   { font-size: 11px; color: ${Z.textMuted}; margin-top: 4px; }

  /* ── Two-column chart row ── */
  .zfo-chart-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    margin-bottom: 12px;
  }
  @media (max-width: 800px) { .zfo-chart-row { grid-template-columns: 1fr; } }

  /* ── Panel ── */
  .zfo-panel {
    background: ${Z.white};
    border: 1px solid ${Z.border};
    border-radius: 4px;
    overflow: hidden;
  }
  .zfo-panel-head {
    background: ${Z.panelHead};
    border-bottom: 1px solid ${Z.border};
    padding: 10px 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .zfo-panel-head-title { font-size: 12px; font-weight: 700; color: ${Z.text}; text-transform: uppercase; letter-spacing: .05em; }
  .zfo-panel-body { padding: 16px; }

  /* ── Bar chart ── */
  .zfo-bar-row { margin-bottom: 12px; }
  .zfo-bar-row:last-child { margin-bottom: 0; }
  .zfo-bar-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
  .zfo-bar-month { font-size: 12px; font-weight: 600; color: ${Z.textMid}; }
  .zfo-bar-vals  { font-size: 11px; }
  .zfo-bar-track { height: 6px; background: #eef0f5; border-radius: 3px; overflow: hidden; margin-bottom: 3px; }
  .zfo-bar-fill  { height: 100%; border-radius: 3px; transition: width .4s ease; }

  /* ── Legend ── */
  .zfo-legend { display: flex; gap: 16px; padding-top: 12px; border-top: 1px solid ${Z.border}; margin-top: 12px; }
  .zfo-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: ${Z.textMid}; font-weight: 600; }
  .zfo-legend-dot  { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

  /* ── Activity list ── */
  .zfo-activity-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid ${Z.border};
  }
  .zfo-activity-row:last-child { border-bottom: none; padding-bottom: 0; }
  .zfo-activity-icon {
    width: 32px; height: 32px; border-radius: 4px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .zfo-activity-client  { font-size: 13px; font-weight: 600; color: ${Z.text}; }
  .zfo-activity-meta    { font-size: 11px; color: ${Z.textMuted}; margin-top: 2px; }
  .zfo-activity-amount  { font-size: 13px; font-weight: 700; color: ${Z.text}; white-space: nowrap; }
  .zfo-activity-date    { font-size: 11px; color: ${Z.textMuted}; white-space: nowrap; margin-top: 2px; text-align: right; }
  .zfo-activity-right   { text-align: right; flex-shrink: 0; }

  /* ── Top clients ── */
  .zfo-client-row { margin-bottom: 12px; }
  .zfo-client-row:last-child { margin-bottom: 0; }
  .zfo-client-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
  .zfo-client-left { display: flex; align-items: center; gap: 8px; }
  .zfo-client-rank {
    width: 22px; height: 22px; border-radius: 50%;
    background: ${Z.navy}; color: #fff;
    font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .zfo-client-name    { font-size: 13px; font-weight: 600; color: ${Z.text}; }
  .zfo-client-invoices{ font-size: 11px; color: ${Z.textMuted}; }
  .zfo-client-revenue { font-size: 13px; font-weight: 700; color: ${Z.text}; }

  /* ── Empty state ── */
  .zfo-empty { text-align: center; padding: 32px 16px; }
  .zfo-empty-icon { width: 48px; height: 48px; margin: 0 auto 10px; background: #eef0f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .zfo-empty-title { font-size: 13px; font-weight: 700; color: ${Z.textMid}; margin-bottom: 4px; }
  .zfo-empty-sub   { font-size: 12px; color: ${Z.textMuted}; }

  /* ── Spinner ── */
  .zfo-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 60vh; gap: 14px;
  }
  .zfo-spinner {
    width: 36px; height: 36px;
    border: 3px solid ${Z.border};
    border-top-color: ${Z.red};
    border-radius: 50%;
    animation: zfo-spin .7s linear infinite;
  }
  .zfo-loading-text { font-size: 13px; color: ${Z.textMuted}; font-family: 'Lato', sans-serif; }

  @keyframes zfo-spin { to { transform: rotate(360deg) } }

  /* ── Two-column bottom row ── */
  .zfo-bottom-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  @media (max-width: 800px) { .zfo-bottom-row { grid-template-columns: 1fr; } }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  `R ${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const KPICard = ({ icon, iconBg, iconColor, label, value, sub, badge, badgeColor }) => (
  <div className="zfo-kpi">
    <div className="zfo-kpi-top">
      <div className="zfo-kpi-icon" style={{ background: iconBg }}>
        {React.cloneElement(icon, { size: 16, color: iconColor })}
      </div>
      {badge && (
        <span className="zfo-kpi-badge" style={{ background: badgeColor + "22", color: badgeColor }}>
          {badge}
        </span>
      )}
    </div>
    <div className="zfo-kpi-label">{label}</div>
    <div className="zfo-kpi-value">{value}</div>
    {sub && <div className="zfo-kpi-sub">{sub}</div>}
  </div>
);

/* ─── Component ──────────────────────────────────────────────────────────── */
const FinancialOverview = ({ user }) => {
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading]   = useState(true);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0, avgInvoice: 0, invoiceCount: 0,
    outstanding: 0, overdue: 0, paidThisMonth: 0,
    expenses: 0, netProfit: 0, revenueGrowth: 0,
    collectionRate: 0, healthScore: 0,
  });
  const [revenueData,       setRevenueData]       = useState([]);
  const [expenseBreakdown,  setExpenseBreakdown]  = useState([]);
  const [recentActivity,    setRecentActivity]    = useState([]);
  const [topClients,        setTopClients]        = useState([]);

  /* ── Data fetching (unchanged logic) ── */
  useEffect(() => {
    if (!user?.uid) return;
    const fetchFinancialData = async () => {
      setLoading(true);
      const db = getFirestore();
      try {
        const now = new Date();
        let startDate = new Date();
        if (timeRange === "week")       startDate.setDate(now.getDate() - 7);
        else if (timeRange === "month") startDate.setMonth(now.getMonth() - 1);
        else                            startDate.setFullYear(now.getFullYear() - 1);

        const invoicesSnap = await getDocs(collection(db, "users", user.uid, "invoices"));
        let totalRevenue = 0, totalOutstanding = 0, totalOverdue = 0, paidCount = 0;
        let invoicesList = [];

        const processDoc = (doc, isQuote = false) => {
          const d = doc.data();
          invoicesList.push({ id: doc.id, ...d, isQuote });
          const invoiceDate = d.dates?.invoiceDate ? new Date(d.dates.invoiceDate)
            : d.dates?.quoteDate ? new Date(d.dates.quoteDate)
            : d.createdAt?.toDate ? d.createdAt.toDate() : null;
          const dueDate = d.dates?.dueDate ? new Date(d.dates.dueDate)
            : d.dates?.validUntil ? new Date(d.dates.validUntil) : null;
          if (invoiceDate && invoiceDate >= startDate) {
            if (d.status === "paid") { totalRevenue += d.totals?.total || 0; paidCount++; }
            else if (d.status === "pending" || d.status === "partially_paid") {
              const due = d.totals?.due || d.totals?.total || 0;
              totalOutstanding += due;
              if (dueDate && dueDate < now) totalOverdue += due;
            }
          }
        };

        invoicesSnap.forEach((doc) => processDoc(doc));
        try {
          const quotesSnap = await getDocs(collection(db, "users", user.uid, "quotes"));
          quotesSnap.forEach((doc) => processDoc(doc, true));
        } catch {}

        let totalExpenses = 0;
        try {
          const expSnap = await getDocs(collection(db, "users", user.uid, "expenses"));
          expSnap.forEach((doc) => {
            const e = doc.data();
            const d = e.date ? new Date(e.date) : e.createdAt?.toDate ? e.createdAt.toDate() : null;
            if (d && d >= startDate) totalExpenses += e.amount || 0;
          });
        } catch {}

        const invoiceCount   = invoicesList.length;
        const avgInvoice     = paidCount > 0 ? totalRevenue / paidCount : 0;
        const collectionRate = invoiceCount > 0 ? (paidCount / invoiceCount) * 100 : 0;
        const netProfit      = totalRevenue - totalExpenses;
        const healthScore    = calcHealth(collectionRate, totalOverdue, netProfit, totalRevenue);

        // Growth
        let prevRevenue = 0;
        let prevStart = new Date(startDate);
        if (timeRange === "week")       prevStart.setDate(prevStart.getDate() - 7);
        else if (timeRange === "month") prevStart.setMonth(prevStart.getMonth() - 1);
        else                            prevStart.setFullYear(prevStart.getFullYear() - 1);
        invoicesList.forEach((inv) => {
          const d = inv.dates?.invoiceDate ? new Date(inv.dates.invoiceDate)
            : inv.dates?.quoteDate ? new Date(inv.dates.quoteDate)
            : inv.createdAt?.toDate ? inv.createdAt.toDate() : null;
          if (d && d >= prevStart && d < startDate && inv.status === "paid")
            prevRevenue += inv.totals?.total || 0;
        });
        const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        setFinancialData({
          totalRevenue, avgInvoice, invoiceCount,
          outstanding: totalOutstanding, overdue: totalOverdue,
          paidThisMonth: paidCount, expenses: totalExpenses, netProfit,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          collectionRate: Math.round(collectionRate),
          healthScore,
        });

        processRevenueData(invoicesList);
        processRecentActivity(invoicesList, now);
        processTopClients(invoicesList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancialData();
  }, [user, timeRange]);

  const calcHealth = (cr, overdue, netProfit, revenue) => {
    let s = (cr / 100) * 40;
    s += Math.max(0, 30 - (revenue > 0 ? overdue / revenue : 0) * 100);
    s += Math.min(30, revenue > 0 ? (netProfit / revenue) * 100 : 0);
    return Math.round(Math.max(0, Math.min(100, s)));
  };

  const processRevenueData = (invoices) => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { month: d.toLocaleDateString("en-US", { month: "short" }), revenue: 0, expenses: 0 };
    });
    invoices.forEach((inv) => {
      const d = inv.dates?.invoiceDate ? new Date(inv.dates.invoiceDate)
        : inv.dates?.quoteDate ? new Date(inv.dates.quoteDate)
        : inv.createdAt?.toDate ? inv.createdAt.toDate() : null;
      if (!d) return;
      const idx = 5 - ((now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
      if (idx >= 0 && idx < 6 && inv.status === "paid") months[idx].revenue += inv.totals?.total || 0;
    });
    setRevenueData(months);
  };

  const processRecentActivity = (invoices, now) => {
    const activity = invoices
      .filter((i) => i.dates?.invoiceDate || i.dates?.quoteDate || i.createdAt)
      .sort((a, b) => {
        const dA = new Date(a.dates?.invoiceDate || a.dates?.quoteDate || a.createdAt?.toDate?.());
        const dB = new Date(b.dates?.invoiceDate || b.dates?.quoteDate || b.createdAt?.toDate?.());
        return dB - dA;
      })
      .slice(0, 5)
      .map((inv) => {
        const d    = new Date(inv.dates?.invoiceDate || inv.dates?.quoteDate || inv.createdAt?.toDate?.());
        const diff = Math.ceil(Math.abs(now - d) / 86400000);
        const timeAgo = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : diff < 7 ? `${diff}d ago` : `${Math.floor(diff / 7)}w ago`;
        let status = inv.status || "pending";
        let type   = inv.isQuote ? "Quote" : "Invoice";
        if (status === "paid") { type = "Payment"; status = "received"; }
        else if ((inv.dates?.dueDate && new Date(inv.dates.dueDate) < now) ||
                 (inv.dates?.validUntil && new Date(inv.dates.validUntil) < now))
          { type = "Overdue"; status = "overdue"; }
        else status = "sent";
        return { type, client: inv.customer?.name || "Unknown", amount: inv.totals?.total || 0, date: timeAgo, status, documentNumber: inv.quoteNumber || "N/A" };
      });
    setRecentActivity(activity);
  };

  const processTopClients = (invoices) => {
    const map = new Map();
    invoices.forEach((inv) => {
      if (inv.status !== "paid") return;
      const name = inv.customer?.name || "Unknown";
      const r    = inv.totals?.total || 0;
      if (map.has(name)) {
        map.get(name).revenue += r;
        map.get(name).invoices++;
      } else {
        map.set(name, { name, revenue: r, invoices: 1 });
      }
    });
    setTopClients([...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 4));
  };

  /* ── Health status helpers ── */
  const healthStatus = financialData.healthScore >= 80 ? "good"
    : financialData.healthScore >= 60 ? "warning" : "bad";
  const healthLabel  = financialData.healthScore >= 80 ? "Excellent"
    : financialData.healthScore >= 60 ? "Good" : "Needs Attention";
  const healthDesc   = financialData.healthScore >= 80 ? "Business is performing well"
    : financialData.healthScore >= 60 ? "On track — monitor closely" : "Review cash flow immediately";

  /* ── Chart max ── */
  const chartMax = Math.max(...revenueData.map((d) => Math.max(d.revenue, d.expenses)), 1);

  return (
    <div className="zfo">
      <style>{css}</style>
      <div className="zfo-page border ">

        {/* ── Top bar ── */}
        <div className="zfo-topbar">
          <div className="zfo-topbar-left">
            <div className="zfo-topbar-icon">
              <BarChart3 size={14} color="#fff" />
            </div>
            <span className="zfo-topbar-title">Financial Overview</span>
            <span className="zfo-topbar-sub">Analytics &rsaquo; Dashboard</span>
          </div>

          <div className="zfo-range-group">
            {["week", "month", "year"].map((r) => (
              <button
                key={r}
                className={`zfo-range-btn${timeRange === r ? " active" : ""}`}
                onClick={() => setTimeRange(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="zfo-content">
          {loading ? (
            <div className="zfo-loading">
              <div className="zfo-spinner" />
              <span className="zfo-loading-text">Loading financial data…</span>
            </div>
          ) : (
            <>
              {/* ── Health banner ── */}
              <div className="zfo-health">
                <div className="zfo-health-score-wrap">
                  <div>
                    <div className="zfo-health-label">Financial Health Score</div>
                    <div className="zfo-health-score">{financialData.healthScore}</div>
                  </div>
                  <div>
                    <div className={`zfo-health-status ${healthStatus}`}>
                      {healthStatus !== "bad"
                        ? <TrendingUp size={14} />
                        : <TrendingDown size={14} />}
                      {healthLabel}
                    </div>
                    <div className="zfo-health-desc">{healthDesc}</div>
                  </div>
                </div>
                <div className="zfo-collection-ring">
                  <span className="val">{financialData.collectionRate}%</span>
                  <span className="lbl">Collection Rate</span>
                </div>
              </div>

              {/* ── KPI Grid ── */}
              <div className="zfo-section-title">Key Metrics</div>
              <div className="zfo-kpi-grid">
                <KPICard
                  icon={<DollarSign />} iconBg={Z.greenLight} iconColor={Z.green}
                  label="Total Revenue" value={fmt(financialData.totalRevenue)}
                  sub={`This ${timeRange}`}
                  badge={`${financialData.revenueGrowth >= 0 ? "+" : ""}${financialData.revenueGrowth}%`}
                  badgeColor={financialData.revenueGrowth >= 0 ? Z.green : Z.red}
                />
                <KPICard
                  icon={<Clock />} iconBg={Z.amberLight} iconColor={Z.amber}
                  label="Outstanding" value={fmt(financialData.outstanding)}
                  sub={`${financialData.invoiceCount - financialData.paidThisMonth} unpaid invoices`}
                  badge="Pending" badgeColor={Z.amber}
                />
                <KPICard
                  icon={<AlertCircle />} iconBg={Z.redLight} iconColor={Z.red}
                  label="Overdue" value={fmt(financialData.overdue)}
                  sub="Requires immediate action"
                  badge="Urgent" badgeColor={Z.red}
                />
                <KPICard
                  icon={<TrendingUp />} iconBg={Z.blueLight} iconColor={Z.blue}
                  label="Net Profit" value={fmt(financialData.netProfit)}
                  sub="Revenue minus expenses"
                />
                <KPICard
                  icon={<FileText />} iconBg="#f3f0ff" iconColor="#6d28d9"
                  label="Average Invoice" value={fmt(financialData.avgInvoice)}
                  sub="Per paid invoice"
                />
                <KPICard
                  icon={<FileText />} iconBg="#eef0f5" iconColor={Z.navyMid}
                  label="Total Invoices" value={financialData.invoiceCount}
                  sub={`${financialData.paidThisMonth} paid this ${timeRange}`}
                />
              </div>

              {/* ── Charts ── */}
              <div className="zfo-section-title">Revenue Analysis</div>
              <div className="zfo-chart-row">

                {/* Bar chart */}
                <div className="zfo-panel">
                  <div className="zfo-panel-head">
                    <span className="zfo-panel-head-title">Revenue vs Expenses</span>
                    <BarChart3 size={13} color={Z.textMuted} />
                  </div>
                  <div className="zfo-panel-body">
                    {revenueData.map((d, i) => (
                      <div key={i} className="zfo-bar-row">
                        <div className="zfo-bar-meta">
                          <span className="zfo-bar-month">{d.month}</span>
                          <span className="zfo-bar-vals">
                            <span style={{ color: Z.green, fontWeight: 700 }}>R{(d.revenue / 1000).toFixed(0)}k</span>
                            <span style={{ color: Z.textMuted }}> / </span>
                            <span style={{ color: Z.red, fontWeight: 700 }}>R{(d.expenses / 1000).toFixed(0)}k</span>
                          </span>
                        </div>
                        <div className="zfo-bar-track">
                          <div className="zfo-bar-fill" style={{ width: `${(d.revenue / chartMax) * 100}%`, background: Z.green }} />
                        </div>
                        <div className="zfo-bar-track">
                          <div className="zfo-bar-fill" style={{ width: `${(d.expenses / chartMax) * 100}%`, background: Z.red }} />
                        </div>
                      </div>
                    ))}
                    <div className="zfo-legend">
                      <div className="zfo-legend-item"><div className="zfo-legend-dot" style={{ background: Z.green }} />Revenue</div>
                      <div className="zfo-legend-item"><div className="zfo-legend-dot" style={{ background: Z.red }} />Expenses</div>
                    </div>
                  </div>
                </div>

                {/* Pie / breakdown */}
                <div className="zfo-panel">
                  <div className="zfo-panel-head">
                    <span className="zfo-panel-head-title">Expense Breakdown</span>
                    <PieChart size={13} color={Z.textMuted} />
                  </div>
                  <div className="zfo-panel-body">
                    {expenseBreakdown.length > 0 ? (
                      <>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                          <div style={{ position: "relative", width: 140, height: 140 }}>
                            <svg viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
                              {expenseBreakdown.map((e, i) => {
                                const total = expenseBreakdown.reduce((s, x) => s + x.amount, 0);
                                const c = 2 * Math.PI * 80;
                                const dash = `${(e.amount / total) * c} ${c}`;
                                const offset = -expenseBreakdown.slice(0, i).reduce((s, x) => s + (x.amount / total) * c, 0);
                                return <circle key={i} cx="100" cy="100" r="80" fill="none" stroke={e.color} strokeWidth="40" strokeDasharray={dash} strokeDashoffset={offset} />;
                              })}
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: Z.text }}>{fmt(expenseBreakdown.reduce((s, e) => s + e.amount, 0))}</div>
                              <div style={{ fontSize: 10, color: Z.textMuted }}>Total</div>
                            </div>
                          </div>
                        </div>
                        {expenseBreakdown.map((e, i) => {
                          const total = expenseBreakdown.reduce((s, x) => s + x.amount, 0);
                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: e.color }} />
                                <span style={{ fontSize: 12, color: Z.textMid }}>{e.category}</span>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: Z.text }}>{fmt(e.amount)}</div>
                                <div style={{ fontSize: 10, color: Z.textMuted }}>{((e.amount / total) * 100).toFixed(1)}%</div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="zfo-empty">
                        <div className="zfo-empty-icon"><PieChart size={22} color={Z.textMuted} /></div>
                        <div className="zfo-empty-title">No expense data</div>
                        <div className="zfo-empty-sub">Add expenses to see breakdown</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Bottom: Activity + Top Clients ── */}
              <div className="zfo-section-title">Activity</div>
              <div className="zfo-bottom-row">

                {/* Recent Activity */}
                <div className="zfo-panel">
                  <div className="zfo-panel-head">
                    <span className="zfo-panel-head-title">Recent Activity</span>
                    <Calendar size={13} color={Z.textMuted} />
                  </div>
                  <div className="zfo-panel-body">
                    {recentActivity.length > 0 ? recentActivity.map((a, i) => {
                      const iconBg    = a.status === "received" ? Z.greenLight : a.status === "sent" ? Z.blueLight : Z.redLight;
                      const iconColor = a.status === "received" ? Z.green      : a.status === "sent" ? Z.blue      : Z.red;
                      const Icon      = a.status === "received" ? DollarSign   : a.status === "sent" ? FileText    : AlertCircle;
                      return (
                        <div key={i} className="zfo-activity-row">
                          <div className="zfo-activity-icon" style={{ background: iconBg }}>
                            <Icon size={14} color={iconColor} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="zfo-activity-client">{a.client}</div>
                            <div className="zfo-activity-meta">{a.type} · {a.documentNumber}</div>
                          </div>
                          <div className="zfo-activity-right">
                            <div className="zfo-activity-amount">{fmt(a.amount)}</div>
                            <div className="zfo-activity-date">{a.date}</div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="zfo-empty">
                        <div className="zfo-empty-icon"><Calendar size={22} color={Z.textMuted} /></div>
                        <div className="zfo-empty-title">No recent activity</div>
                        <div className="zfo-empty-sub">Create invoices to see activity</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Clients */}
                <div className="zfo-panel">
                  <div className="zfo-panel-head">
                    <span className="zfo-panel-head-title">Top Clients</span>
                    <Users size={13} color={Z.textMuted} />
                  </div>
                  <div className="zfo-panel-body">
                    {topClients.length > 0 ? topClients.map((c, i) => {
                      const maxRev = Math.max(...topClients.map((x) => x.revenue));
                      return (
                        <div key={i} className="zfo-client-row">
                          <div className="zfo-client-meta">
                            <div className="zfo-client-left">
                              <div className="zfo-client-rank">{i + 1}</div>
                              <div>
                                <div className="zfo-client-name">{c.name}</div>
                                <div className="zfo-client-invoices">{c.invoices} invoice{c.invoices !== 1 ? "s" : ""}</div>
                              </div>
                            </div>
                            <div className="zfo-client-revenue">{fmt(c.revenue)}</div>
                          </div>
                          <div className="zfo-bar-track">
                            <div className="zfo-bar-fill" style={{ width: `${(c.revenue / maxRev) * 100}%`, background: Z.navy }} />
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="zfo-empty">
                        <div className="zfo-empty-icon"><Users size={22} color={Z.textMuted} /></div>
                        <div className="zfo-empty-title">No client data yet</div>
                        <div className="zfo-empty-sub">Add paid invoices to see top clients</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
