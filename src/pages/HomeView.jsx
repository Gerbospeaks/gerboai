import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardRoute } from "../utils/dashboardRoutes";
import { getDashboardActions } from "../utils/dashboardActions";
import { useAuth } from "../contexts/AuthContext";
import BusinessSettingsModal from "./BusinessSettingsModal";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  TrendingUp,
  FileText,
  Users,
  Receipt,
  TrendingDown,
  ArrowRight,
  X,
  Clock,
  LayoutDashboard,
  Menu,
} from "lucide-react";

/* ─── Zoho design tokens ─────────────────────────────────────────────────── */
const Z = {
  red: "#e8442a",
  redHover: "#c73b24",
  redLight: "#fdf2f0",
  navy: "#1a2340",
  navyMid: "#2d3a55",
  blue: "#1b6ec2",
  blueLight: "#e8f0fb",
  green: "#1d8348",
  greenLight: "#eafaf1",
  amber: "#b45309",
  amberLight: "#fffbeb",
  border: "#d9dde6",
  bg: "#f4f5f8",
  white: "#ffffff",
  text: "#1a2340",
  textMid: "#4a5568",
  textMuted: "#8a93a6",
  panelHead: "#f0f2f6",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;600;700&display=swap');

  .zh * { font-family: 'Lato', sans-serif; box-sizing: border-box; }

  .zh-shell {
    height: 100vh; width: 100%;
    display: flex; flex-direction: column;
    background: ${Z.bg};
    overflow: hidden;
  }

  .zh-topbar {
    background: ${Z.navy};
    height: 52px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .zh-topbar-left  { display: flex; align-items: center; gap: 10px; }
  .zh-topbar-icon  {
    width: 28px; height: 28px; border-radius: 50%;
    background: ${Z.red};
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .zh-topbar-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: .01em; }
  .zh-topbar-sub   { font-size: 11px; color: rgba(255,255,255,.4); margin-left: 8px; }

  /* Sidebar toggle btn in topbar (only shown when embedded in a dashboard) */
  .zh-topbar-sidebar-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 6px;
    background: transparent; border: 1px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.7); cursor: pointer;
    transition: background .15s, color .15s;
    margin-right: 8px;
  }
  .zh-topbar-sidebar-btn:hover { background: rgba(255,255,255,.1); color: #fff; }

  .zh-body {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 18px 20px 12px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .zh-body::-webkit-scrollbar { width: 6px; }
  .zh-body::-webkit-scrollbar-track { background: transparent; }
  .zh-body::-webkit-scrollbar-thumb { background: ${Z.border}; border-radius: 6px; }

  .zh-section {
    font-size: 10px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: ${Z.textMuted};
    display: flex; align-items: center; gap: 8px;
    margin-bottom: -4px;
  }
  .zh-section::after { content:''; flex:1; height:1px; background:${Z.border}; }

  .zh-kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  }
  @media (max-width: 900px) { .zh-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .zh-kpi-grid { grid-template-columns: repeat(2, 1fr); } }

  .zh-kpi {
    background: ${Z.white};
    border: 1px solid ${Z.border};
    border-radius: 4px;
    padding: 12px 14px;
    transition: box-shadow .15s;
  }
  .zh-kpi:hover { box-shadow: 0 2px 10px rgba(20,26,48,.08); }
  .zh-kpi-top  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .zh-kpi-icon {
    width: 30px; height: 30px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .zh-kpi-trend {
    display: flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: 700;
    padding: 2px 6px; border-radius: 20px;
  }
  .zh-kpi-label { font-size: 10px; color: ${Z.textMuted}; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 3px; }
  .zh-kpi-value { font-size: 20px; font-weight: 700; color: ${Z.text}; line-height: 1.15; }
  .zh-kpi-sub   { font-size: 10px; color: ${Z.textMuted}; margin-top: 3px; }
  .zh-kpi-skel  { height: 22px; background: #eef0f5; border-radius: 3px; animation: zh-pulse 1.4s ease infinite; }

  .zh-mid-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  @media (max-width: 700px) { .zh-mid-row { grid-template-columns: 1fr; } }

  .zh-panel {
    background: ${Z.white};
    border: 1px solid ${Z.border};
    border-radius: 4px; overflow: hidden;
  }
  .zh-panel-head {
    background: ${Z.panelHead};
    border-bottom: 1px solid ${Z.border};
    padding: 8px 14px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .zh-panel-head-title {
    font-size: 11px; font-weight: 700; letter-spacing: .05em;
    text-transform: uppercase; color: ${Z.text};
  }
  .zh-panel-body { padding: 14px; }

  .zh-pending {
    display: flex; align-items: center; gap: 12px;
  }
  .zh-pending-icon {
    width: 36px; height: 36px; border-radius: 4px;
    background: ${Z.amberLight};
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .zh-pending-label { font-size: 10px; color: ${Z.textMuted}; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 2px; }
  .zh-pending-value { font-size: 22px; font-weight: 700; color: ${Z.amber}; line-height: 1; }
  .zh-pending-sub   { font-size: 11px; color: ${Z.textMuted}; margin-top: 3px; }

  .zh-actions-list { display: flex; flex-direction: column; gap: 7px; }
  .zh-action-btn {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px;
    border: 1px solid ${Z.border}; border-radius: 3px;
    background: ${Z.white}; cursor: pointer;
    transition: border-color .15s, background .15s;
    width: 100%;
  }
  .zh-action-btn:hover { border-color: ${Z.blue}; background: ${Z.blueLight}; }
  .zh-action-btn-left { display: flex; align-items: center; gap: 8px; }
  .zh-action-icon {
    width: 24px; height: 24px; border-radius: 3px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .zh-action-label { font-size: 12px; font-weight: 700; color: ${Z.text}; }
  .zh-action-arrow { color: ${Z.textMuted}; transition: transform .15s; }
  .zh-action-btn:hover .zh-action-arrow { transform: translateX(3px); color: ${Z.blue}; }

  .zh-invoices-panel {
    background: ${Z.white};
    border: 1px solid ${Z.border};
    border-radius: 4px; overflow: hidden;
    flex: 1; display: flex; flex-direction: column; min-height: 0;
  }
  .zh-invoices-head {
    background: ${Z.panelHead};
    border-bottom: 1px solid ${Z.border};
    padding: 8px 14px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .zh-view-all {
    font-size: 11px; font-weight: 700; color: ${Z.blue};
    background: none; border: none; cursor: pointer;
    padding: 2px 8px; border-radius: 3px;
    transition: background .15s;
    font-family: 'Lato', sans-serif;
  }
  .zh-view-all:hover { background: ${Z.blueLight}; }

  .zh-invoices-scroll { flex: 1; overflow-y: auto; min-height: 0; }
  .zh-invoices-scroll::-webkit-scrollbar { width: 4px; }
  .zh-invoices-scroll::-webkit-scrollbar-thumb { background: ${Z.border}; border-radius: 4px; }

  .zh-inv-table { width: 100%; border-collapse: collapse; }
  .zh-inv-thead th {
    background: #f9fafb;
    border-bottom: 1px solid ${Z.border};
    padding: 7px 14px;
    text-align: left; font-size: 10px; font-weight: 700;
    color: ${Z.textMid}; text-transform: uppercase; letter-spacing: .06em;
    white-space: nowrap; position: sticky; top: 0; z-index: 1;
  }
  .zh-inv-thead th:last-child { text-align: right; }
  .zh-inv-row { border-bottom: 1px solid ${Z.border}; transition: background .1s; cursor: pointer; }
  .zh-inv-row:last-child { border-bottom: none; }
  .zh-inv-row:hover { background: #f7f9fc; }
  .zh-inv-row td { padding: 9px 14px; font-size: 12px; color: ${Z.textMid}; vertical-align: middle; }
  .zh-inv-num   { font-weight: 700; color: ${Z.text}; white-space: nowrap; }
  .zh-inv-client{ color: ${Z.textMid}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
  .zh-inv-amount{ font-weight: 700; color: ${Z.text}; text-align: right; white-space: nowrap; }

  .zh-badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 20px;
    font-size: 10px; font-weight: 700; white-space: nowrap;
    border: 1px solid transparent;
  }
  .zh-badge-paid    { background: ${Z.greenLight}; color: ${Z.green}; border-color: #b7e4ca; }
  .zh-badge-pending { background: ${Z.amberLight}; color: ${Z.amber}; border-color: #f5d49a; }
  .zh-badge-overdue { background: ${Z.redLight};   color: ${Z.red};   border-color: #f5bdb4; }
  .zh-badge-draft   { background: #eef0f5; color: ${Z.textMid}; border-color: ${Z.border}; }

  .zh-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 36px 16px; text-align: center;
  }
  .zh-empty-icon {
    width: 48px; height: 48px; background: #eef0f5; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; margin-bottom: 10px;
  }
  .zh-empty-title { font-size: 13px; font-weight: 700; color: ${Z.text}; margin-bottom: 4px; }
  .zh-empty-sub   { font-size: 12px; color: ${Z.textMuted}; margin-bottom: 12px; }
  .zh-empty-cta {
    height: 32px; padding: 0 16px;
    background: ${Z.red}; color: #fff;
    border: none; border-radius: 3px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    font-family: 'Lato', sans-serif;
    transition: background .15s;
  }
  .zh-empty-cta:hover { background: ${Z.redHover}; }

  @keyframes zh-pulse {
    0%,100% { opacity: 1 } 50% { opacity: .45 }
  }
  .zh-skel-row {
    height: 38px; background: #eef0f5; border-radius: 3px;
    margin-bottom: 6px; animation: zh-pulse 1.4s ease infinite;
  }
  .zh-skel-row:last-child { margin-bottom: 0; }

  .zh-overlay {
    position: fixed; inset: 0; background: rgba(20,26,48,.55);
    z-index: 9999; display: flex; align-items: center; justify-content: center;
    padding: 16px; animation: zh-fade .18s ease;
  }
  .zh-modal {
    background: ${Z.white}; border-radius: 6px;
    box-shadow: 0 8px 40px rgba(20,26,48,.22);
    width: 100%; max-width: 860px; max-height: 88vh;
    display: flex; flex-direction: column;
    animation: zh-up .2s ease; overflow: hidden;
  }
  .zh-modal-head {
    background: ${Z.navy};
    padding: 13px 20px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .zh-modal-head-left { display: flex; align-items: center; gap: 10px; }
  .zh-modal-icon { width: 28px; height: 28px; border-radius: 50%; background: ${Z.red}; display: flex; align-items: center; justify-content: center; }
  .zh-modal-title { font-size: 14px; font-weight: 700; color: #fff; }
  .zh-modal-sub   { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 1px; }
  .zh-modal-close {
    background: transparent; border: none; cursor: pointer;
    color: rgba(255,255,255,.6); padding: 4px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    transition: color .15s, background .15s;
  }
  .zh-modal-close:hover { color: #fff; background: rgba(255,255,255,.12); }

  .zh-modal-body { flex: 1; overflow-y: auto; min-height: 0; }
  .zh-modal-body::-webkit-scrollbar { width: 6px; }
  .zh-modal-body::-webkit-scrollbar-thumb { background: ${Z.border}; border-radius: 6px; }

  .zh-modal-footer {
    padding: 10px 20px; border-top: 1px solid ${Z.border};
    background: ${Z.white}; display: flex; justify-content: flex-end; flex-shrink: 0;
  }
  .zh-modal-footer-btn {
    height: 32px; padding: 0 16px;
    background: ${Z.white}; color: ${Z.textMid};
    border: 1px solid ${Z.border}; border-radius: 3px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    font-family: 'Lato', sans-serif;
    transition: border-color .15s, color .15s;
  }
  .zh-modal-footer-btn:hover { border-color: ${Z.red}; color: ${Z.red}; }

  .zh-footer {
    flex-shrink: 0;
    padding: 6px 20px;
    border-top: 1px solid ${Z.border};
    background: ${Z.white};
    font-size: 11px; color: ${Z.textMuted};
    text-align: center;
  }

  @keyframes zh-fade { from { opacity:0 } to { opacity:1 } }
  @keyframes zh-up   { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n,
  );

const badgeClass = (s) =>
  s === "paid"
    ? "zh-badge zh-badge-paid"
    : s === "pending"
      ? "zh-badge zh-badge-pending"
      : s === "overdue"
        ? "zh-badge zh-badge-overdue"
        : "zh-badge zh-badge-draft";

/* ─── KPI Card ────────────────────────────────────────────────────────────── */
const KPI = ({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
  trend,
  loading,
}) => (
  <div className="zh-kpi">
    <div className="zh-kpi-top">
      <div className="zh-kpi-icon" style={{ background: iconBg }}>
        <Icon size={15} color={iconColor} />
      </div>
      {trend != null && (
        <span
          className="zh-kpi-trend"
          style={{
            background: trend >= 0 ? Z.greenLight : Z.redLight,
            color: trend >= 0 ? Z.green : Z.red,
          }}
        >
          {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="zh-kpi-label">{title}</div>
    {loading ? (
      <div className="zh-kpi-skel" />
    ) : (
      <div className="zh-kpi-value">{value}</div>
    )}
    {sub && <div className="zh-kpi-sub">{sub}</div>}
  </div>
);

/* ─── Component ──────────────────────────────────────────────────────────── */
/**
 * Props (all optional — used when Home is rendered inside a dashboard):
 *
 *   onNavigate(view, documentType?)
 *     Called by Quick Actions instead of react-router navigate.
 *     `view` matches the dashboard's setActiveView values: "invoice", "quote",
 *     "estimate", "jobcard", etc.
 *     `documentType` is passed so the dashboard can pre-set its document type
 *     before switching views (e.g. "invoice" vs "quote" on the same view).
 *
 *   onGoToDashboard()
 *     Called by the "Go to Dashboard" quick-action button.
 *     If not provided, falls back to react-router navigate.
 *
 *   onSidebarToggle()
 *     Called by the hamburger button in the top bar.
 *     If not provided the button is hidden.
 *
 *   sidebarOpen (bool)
 *     Current sidebar state — used only to show/hide the hamburger icon.
 */
export default function Home({
  onNavigate,
  onGoToDashboard,
  onSidebarToggle,
  sidebarOpen,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showSettings, setShowSettings] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalInvoiced: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true,
  });

  // ── Navigation helper ────────────────────────────────────────────────────
  // When embedded in a dashboard, call onNavigate(view, docType).
  // When standalone (own route), use react-router state.
  const nav = (view, documentType) => {
    if (onNavigate) {
      onNavigate(view, documentType);
    } else {
      navigate(getDashboardRoute(user?.dashboardId), {
        state: { activeView: view },
      });
    }
  };

  // ── "Go to Dashboard" helper ─────────────────────────────────────────────
  const goToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      navigate(getDashboardRoute(user?.dashboardId));
    }
  };

  // ── Document-type-aware action handlers ──────────────────────────────────
  // These pass the documentType so the carpentry dashboard (or any other) can
  // set its own documentType state BEFORE switching views.  The carpentry
  // sidebar uses a single "quote" view for both quotes and invoices, toggled
  // by documentType.
  const handleNewInvoice = () => nav("quote", "invoice");
  const handleNewQuote = () => nav("quote", "quote");
  const handleNewEstimate = () => nav("estimate", "estimate");
  const handleNewJobcard = () => nav("jobcard", "jobcard");

  const { actions } = getDashboardActions(user?.dashboardId, {
    handleNewInvoice,
    handleNewQuote,
    handleNewEstimate,
    handleNewJobcard,
    handleNewInvoiceDoc: handleNewInvoice,
  });

  const actionPalette = [
    { iconBg: Z.navy, iconColor: "#fff" },
    { iconBg: Z.blue, iconColor: "#fff" },
    { iconBg: Z.green, iconColor: "#fff" },
    { iconBg: Z.amber, iconColor: "#fff" },
  ];

  useEffect(() => {
    if (user?.uid) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const invSnap = await getDocs(
        collection(db, "users", user.uid, "invoices"),
      );
      let totalInvoiced = 0,
        pendingPayments = 0,
        invoiceCount = 0;
      const invList = [];

      invSnap.forEach((doc) => {
        const d = doc.data();
        invoiceCount++;
        const amt = parseFloat(d.totals?.total || d.total || 0);
        totalInvoiced += amt;
        if (["pending", "unpaid", "partially_paid"].includes(d.status))
          pendingPayments += parseFloat(
            d.totals?.due || d.totals?.total || d.total || 0,
          );
        invList.push({ id: doc.id, ...d });
      });

      invList.sort((a, b) => {
        const t = (x) => {
          const v =
            x.dates?.invoiceDate ||
            x.dates?.quoteDate ||
            x.createdAt?.toDate?.() ||
            new Date(0);
          return typeof v === "string"
            ? new Date(v).getTime()
            : v.getTime?.() || 0;
        };
        return t(b) - t(a);
      });
      setInvoices(invList);

      let quoteCount = 0;
      try {
        const qSnap = await getDocs(
          collection(db, "users", user.uid, "quotes"),
        );
        quoteCount = qSnap.docs.length;
        setSavedQuotes(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        qSnap.forEach((doc) => {
          const d = doc.data();
          if (d.status === "paid")
            totalInvoiced += parseFloat(d.totals?.total || d.total || 0);
        });
      } catch (_) {}

      let clientCount = 0;
      try {
        const cSnap = await getDocs(
          collection(db, "users", user.uid, "clients"),
        );
        clientCount = cSnap.docs.length;
        setSavedCustomers(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {}

      setStats({
        totalInvoices: invoiceCount,
        totalQuotes: quoteCount,
        totalInvoiced,
        totalClients: clientCount,
        pendingPayments,
        loading: false,
      });
    } catch (e) {
      console.error(e);
      setStats((p) => ({ ...p, loading: false }));
    }
  };

  return (
    <div className="zh">
      <style>{css}</style>
      <div className="zh-shell border">
        {/* ── Top bar ── */}
        <div className="zh-topbar">
          <div className="zh-topbar-left">
            {/* Sidebar hamburger — only shown when embedded in a dashboard */}
            {onSidebarToggle && !sidebarOpen && (
              <button
                className="zh-topbar-sidebar-btn"
                onClick={onSidebarToggle}
                title="Open sidebar"
              >
                <Menu size={15} />
              </button>
            )}
            <div className="zh-topbar-icon">
              <LayoutDashboard size={14} color="#fff" />
            </div>
            <span className="zh-topbar-title">SolidFlo</span>
            <span className="zh-topbar-sub">Home &rsaquo; Dashboard</span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="zh-body">
          {/* KPIs */}
          <div className="zh-section">Overview</div>
          <div className="zh-kpi-grid">
            <KPI
              title="Invoices"
              value={stats.totalInvoices}
              icon={FileText}
              iconBg="#ede9fe"
              iconColor="#6d28d9"
              sub="All time"
              loading={stats.loading}
              trend={12}
            />
            <KPI
              title="Quotes"
              value={stats.totalQuotes}
              icon={Receipt}
              iconBg={Z.blueLight}
              iconColor={Z.blue}
              sub="Generated"
              loading={stats.loading}
            />
            <KPI
              title="Revenue"
              value={fmtCurrency(stats.totalInvoiced)}
              icon={TrendingUp}
              iconBg={Z.greenLight}
              iconColor={Z.green}
              sub="Total invoiced"
              loading={stats.loading}
              trend={8}
            />
            <KPI
              title="Clients"
              value={stats.totalClients}
              icon={Users}
              iconBg={Z.amberLight}
              iconColor={Z.amber}
              sub="Active"
              loading={stats.loading}
            />
          </div>

          {/* Mid row */}
          <div className="zh-section">Actions</div>
          <div className="zh-mid-row">
            {/* Pending payments */}
            <div className="zh-panel">
              <div className="zh-panel-head">
                <span className="zh-panel-head-title">Pending Payments</span>
                <Clock size={13} color={Z.textMuted} />
              </div>
              <div className="zh-panel-body">
                {stats.loading ? (
                  <div className="zh-kpi-skel" style={{ height: 48 }} />
                ) : (
                  <div className="zh-pending">
                    <div className="zh-pending-icon">
                      <Receipt size={17} color={Z.amber} />
                    </div>
                    <div>
                      <div className="zh-pending-label">
                        Outstanding balance
                      </div>
                      <div className="zh-pending-value">
                        {fmtCurrency(stats.pendingPayments)}
                      </div>
                      <div className="zh-pending-sub">
                        Across unpaid invoices
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="zh-panel">
              <div className="zh-panel-head">
                <span className="zh-panel-head-title">Quick Actions</span>
                <ArrowRight size={13} color={Z.textMuted} />
              </div>
              <div className="zh-panel-body">
                <div className="zh-actions-list">
                  {[
                    ...actions,
                    {
                      label: "Go to Dashboard",
                      icon: LayoutDashboard,
                      onClick: goToDashboard,
                    },
                  ].map(({ label, icon: Icon, onClick }, i) => {
                    const pal = actionPalette[i % actionPalette.length];
                    return (
                      <button
                        key={label}
                        className="zh-action-btn"
                        onClick={onClick}
                      >
                        <div className="zh-action-btn-left">
                          <div
                            className="zh-action-icon"
                            style={{ background: pal.iconBg }}
                          >
                            <Icon size={13} color={pal.iconColor} />
                          </div>
                          <span className="zh-action-label">{label}</span>
                        </div>
                        <ArrowRight size={13} className="zh-action-arrow" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent invoices */}
          <div className="zh-section">Recent Invoices</div>
          <div className="zh-invoices-panel">
            <div className="zh-invoices-head">
              <span className="zh-panel-head-title">Recent Invoices</span>
              <button
                className="zh-view-all"
                onClick={() => setShowInvoicesList(true)}
              >
                View all →
              </button>
            </div>
            <div className="zh-invoices-scroll">
              {stats.loading ? (
                <div style={{ padding: "10px 14px" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="zh-skel-row" />
                  ))}
                </div>
              ) : invoices.length === 0 ? (
                <div className="zh-empty">
                  <div className="zh-empty-icon">
                    <FileText size={22} color={Z.textMuted} />
                  </div>
                  <div className="zh-empty-title">No invoices yet</div>
                  <div className="zh-empty-sub">
                    Create your first invoice to get started
                  </div>
                  <button className="zh-empty-cta" onClick={handleNewInvoice}>
                    Create Invoice
                  </button>
                </div>
              ) : (
                <table className="zh-inv-table">
                  <thead className="zh-inv-thead">
                    <tr>
                      <th>Number</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 10).map((inv) => (
                      <tr key={inv.id} className="zh-inv-row">
                        <td className="zh-inv-num">
                          {inv.quoteNumber || inv.invoiceNumber || inv.id}
                        </td>
                        <td className="zh-inv-client">
                          {inv.customer?.name || inv.customerName || "—"}
                        </td>
                        <td>
                          {inv.dates?.invoiceDate || inv.date
                            ? new Date(
                                inv.dates?.invoiceDate || inv.date,
                              ).toLocaleDateString("en-ZA")
                            : "—"}
                        </td>
                        <td>
                          <span className={badgeClass(inv.status)}>
                            {inv.status || "Draft"}
                          </span>
                        </td>
                        <td className="zh-inv-amount">
                          {fmtCurrency(inv.totals?.total || inv.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="zh-footer">
          © 2026 SolidFlo · Modern Invoicing &amp; Billing
        </div>

        {/* ── Business settings ── */}
        {showSettings && (
          <BusinessSettingsModal onClose={() => setShowSettings(false)} />
        )}

        {/* ── All Invoices modal ── */}
        {showInvoicesList && (
          <div
            className="zh-overlay"
            onClick={() => setShowInvoicesList(false)}
          >
            <div className="zh-modal" onClick={(e) => e.stopPropagation()}>
              <div className="zh-modal-head">
                <div className="zh-modal-head-left">
                  <div className="zh-modal-icon">
                    <FileText size={14} color="#fff" />
                  </div>
                  <div>
                    <div className="zh-modal-title">All Invoices</div>
                    <div className="zh-modal-sub">
                      {stats.totalInvoices} record
                      {stats.totalInvoices !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <button
                  className="zh-modal-close"
                  onClick={() => setShowInvoicesList(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="zh-modal-body">
                <table className="zh-inv-table">
                  <thead className="zh-inv-thead">
                    <tr>
                      <th>Number</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="zh-inv-row">
                        <td className="zh-inv-num">
                          {inv.quoteNumber || inv.invoiceNumber || inv.id}
                        </td>
                        <td className="zh-inv-client">
                          {inv.customer?.name || inv.customerName || "—"}
                        </td>
                        <td>
                          {inv.dates?.invoiceDate || inv.date
                            ? new Date(
                                inv.dates?.invoiceDate || inv.date,
                              ).toLocaleDateString("en-ZA")
                            : "—"}
                        </td>
                        <td>
                          <span className={badgeClass(inv.status)}>
                            {inv.status || "Draft"}
                          </span>
                        </td>
                        <td className="zh-inv-amount">
                          {fmtCurrency(inv.totals?.total || inv.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="zh-modal-footer">
                <button
                  className="zh-modal-footer-btn"
                  onClick={() => setShowInvoicesList(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
