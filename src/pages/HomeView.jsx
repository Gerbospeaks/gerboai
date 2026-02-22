import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardRoute } from "../utils/dashboardRoutes";
import { getDashboardActions } from "../utils/dashboardActions";
import { useAuth } from "../contexts/AuthContext";
import BusinessSettingsModal from "./BusinessSettingsModal";
import AppHeader from "./AppHeader";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  TrendingUp, FileText, Users, Receipt,
  TrendingDown, ArrowRight,
} from "lucide-react";

// ── All sidebar paths relative to src/pages/ ─────────────────────────────────
const SIDEBAR_MAP = {
  accounting:   lazy(() => import("./accounting/AccountingSidebar")),
  carpentry:    lazy(() => import("./carpentry/CarpentrySidebar")),
  cleaning:     lazy(() => import("./cleaning/CleaningSidebar")),
  construction: lazy(() => import("./construction/ConstructionSidebar")),
  education:    lazy(() => import("./education/EducationSidebar")),
  electrical:   lazy(() => import("./electrical/ElectricalSidebar")),
  elctrical:    lazy(() => import("./electrical/ElectricalSidebar")),
  flooring:     lazy(() => import("./flooring/FlooringSidebar")),
  health:       lazy(() => import("./health/HealthSidebar")),
  hotel:        lazy(() => import("./hotel/HotelSidebar")),
  hvac:         lazy(() => import("./hvac/HVACSidebar")),
  landscaping:  lazy(() => import("./landscaping/LandscapingSidebar")),
  legal:        lazy(() => import("./legal/LegalSidebar")),
  logistics:    lazy(() => import("./logistics/LogisticsSidebar")),
  mechanics:    lazy(() => import("./mechanics/MechanicsSidebar")),
  painting:     lazy(() => import("./painting/PaintingSidebar")),
  pestcontrol:  lazy(() => import("./pest-contrrol/PestcontrolSidebar")),
  photography:  lazy(() => import("./photography/PhotographySidebar")),
  plumbing:     lazy(() => import("./plumbing/PlumbingSidebar")),
  poolservice:  lazy(() => import("./pool-services/PoolservicesSidebar")),
  realestate:   lazy(() => import("./realEstate/RealEstateSidebar")),
  restaurants:  lazy(() => import("./restaurants/RestaurantsSidebar")),
  retail:       lazy(() => import("./retail/RetailSidebar")),
  security:     lazy(() => import("./security/SecuritySidebar")),
  solar:        lazy(() => import("./solar-installation/SolarSidebar")),
  towing:       lazy(() => import("./towing/TowingSidebar")),
  welding:      lazy(() => import("./welding/WeldingSidebar")),
  windowrepair: lazy(() => import("./window-repair/WindowrepairSidebar")),
};

const buildSidebarProps = (props) => ({ ...props });

export default function Home() {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [showSettings, setShowSettings]         = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [activeView, setActiveView]             = useState("home");
  const [invoices, setInvoices]                 = useState([]);
  const [businessInfo, setBusinessInfo]         = useState({ logoUrl: "" });
  const [savedQuotes, setSavedQuotes]           = useState([]);
  const [savedCustomers, setSavedCustomers]     = useState([]);

  const [stats, setStats] = useState({
    totalInvoices: 0, totalQuotes: 0,
    totalInvoiced: 0, totalClients: 0,
    pendingPayments: 0, loading: true,
  });

  const navigateToDashboard = (view) =>
    navigate(getDashboardRoute(user?.dashboardId), { state: { activeView: view } });

  const handleNewInvoice  = () => navigateToDashboard("invoice");
  const handleNewQuote    = () => navigateToDashboard("quote");
  const handleNewEstimate = () => navigateToDashboard("estimate");
  const handleNewInvoiceDoc = () => navigateToDashboard("invoiceDoc");
  const handleNewJobcard  = () => navigateToDashboard("jobcard");
  const handleLogout      = async () => {
    try { await logout(); navigate("/login"); }
    catch (e) { console.error(e); }
  };

  const { actions } = getDashboardActions(user?.dashboardId, {
    handleNewInvoice, handleNewQuote, handleNewEstimate, handleNewJobcard,handleNewInvoiceDoc,
  });

  // ── Resolve sidebar — log to help debug ──────────────────────────────────
  const dashboardId = user?.dashboardId;
  const DashboardSidebar = dashboardId ? (SIDEBAR_MAP[dashboardId] ?? null) : null;

  // Uncomment to debug: console.log("dashboardId:", dashboardId, "sidebar found:", !!DashboardSidebar);

  const sidebarProps = buildSidebarProps({
    navigate, user, activeView, setActiveView,
    sidebarOpen, setSidebarOpen,
    showSettings, setShowSettings,
    handleNewInvoice, handleNewQuote, handleNewEstimate, handleNewJobcard,
    businessInfo, savedQuotes, savedCustomers, handleLogout,
  });

  useEffect(() => { if (user?.uid) fetchBusinessStats(); }, [user]);

  const fetchBusinessStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const invoicesSnap = await getDocs(collection(db, "users", user.uid, "invoices"));
      let totalInvoiced = 0, pendingPayments = 0, invoiceCount = 0;
      const invoicesList = [];

      invoicesSnap.forEach((doc) => {
        const d = doc.data(); invoiceCount++;
        const amount = parseFloat(d.totals?.total || d.total || 0);
        totalInvoiced += amount;
        if (["pending","unpaid","partially_paid"].includes(d.status))
          pendingPayments += parseFloat(d.totals?.due || d.totals?.total || d.total || 0);
        invoicesList.push({ id: doc.id, ...d });
      });

      invoicesList.sort((a, b) => {
        const t = (x) => {
          const v = x.dates?.invoiceDate || x.dates?.quoteDate || x.createdAt?.toDate?.() || new Date(0);
          return typeof v === "string" ? new Date(v).getTime() : v.getTime?.() || 0;
        };
        return t(b) - t(a);
      });
      setInvoices(invoicesList);

      let quoteCount = 0;
      try {
        const qSnap = await getDocs(collection(db, "users", user.uid, "quotes"));
        quoteCount = qSnap.docs.length;
        setSavedQuotes(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        qSnap.forEach(doc => {
          const d = doc.data();
          if (d.status === "paid") totalInvoiced += parseFloat(d.totals?.total || d.total || 0);
        });
      } catch (_) {}

      let clientCount = 0;
      try {
        const cSnap = await getDocs(collection(db, "users", user.uid, "clients"));
        clientCount = cSnap.docs.length;
        setSavedCustomers(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (_) {}

      setStats({ totalInvoices: invoiceCount, totalQuotes: quoteCount, totalInvoiced, totalClients: clientCount, pendingPayments, loading: false });
    } catch (e) {
      console.error(e);
      setStats(p => ({ ...p, loading: false }));
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n);

  const statusStyles = (s) =>
    s === "paid"    ? "bg-emerald-100 text-emerald-700" :
    s === "pending" ? "bg-yellow-100 text-yellow-700"  :
                      "bg-red-100 text-red-700";

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle, loading, trend }) => (
    <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${gradient}`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-0.5">{title}</p>
        {loading
          ? <div className="h-6 bg-gray-100 rounded animate-pulse" />
          : <>
              <p className="text-lg md:text-xl font-bold text-gray-900 leading-tight truncate">{value}</p>
              {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </>}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-gray-50">

      

      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Sidebar ── */}
        {DashboardSidebar ? (
          <Suspense fallback={
            <div className="w-16 md:w-20 bg-stone-900 flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <DashboardSidebar {...sidebarProps} />
          </Suspense>
        ) : (
          // Debug: shows when dashboardId doesn't match any sidebar
          <div className="hidden">
            No sidebar for dashboardId: {dashboardId}
          </div>
        )}

        {/* ── Main ── */}
        <div className="flex-1 overflow-hidden flex flex-col px-2 md:px-4 py-2 md:py-4 gap-2 md:gap-3 min-h-0">
       
          <div className="grid grid-cols-4 gap-2 md:gap-3 flex-shrink-0">
            <StatCard title="Invoices" value={stats.totalInvoices} icon={FileText}
              gradient="bg-gradient-to-br from-purple-600 to-purple-700" subtitle="All time"
              loading={stats.loading} trend={12} />
            <StatCard title="Quotes" value={stats.totalQuotes} icon={Receipt}
              gradient="bg-gradient-to-br from-cyan-600 to-cyan-700" subtitle="Generated"
              loading={stats.loading} />
            <StatCard title="Revenue" value={formatCurrency(stats.totalInvoiced)} icon={TrendingUp}
              gradient="bg-gradient-to-br from-emerald-600 to-emerald-700" subtitle="Total invoiced"
              loading={stats.loading} trend={8} />
            <StatCard title="Clients" value={stats.totalClients} icon={Users}
              gradient="bg-gradient-to-br from-orange-600 to-orange-700" subtitle="Active"
              loading={stats.loading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 flex-shrink-0">
            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Pending Payments</p>
                {stats.loading
                  ? <div className="h-6 bg-gray-100 rounded animate-pulse w-32" />
                  : <>
                      <p className="text-xl md:text-2xl font-bold text-orange-600 leading-tight truncate">
                        {formatCurrency(stats.pendingPayments)}
                      </p>
                      <p className="text-xs text-gray-400">Outstanding invoices</p>
                    </>}
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Actions</p>
              <div className="flex gap-2">
                {actions.map(({ label, icon: Icon, onClick }, i) => {
                  const colors = [
                    { bg: "bg-purple-50", hover: "hover:bg-purple-100", border: "border-purple-200", icon: "bg-purple-600", text: "text-purple-900", arrow: "text-purple-500" },
                    { bg: "bg-cyan-50",   hover: "hover:bg-cyan-100",   border: "border-cyan-200",   icon: "bg-cyan-600",   text: "text-cyan-900",   arrow: "text-cyan-500"   },
                  ];
                  const c = colors[i] ?? colors[0];
                  return (
                    <button key={label} onClick={onClick}
                      className={`flex-1 flex items-center justify-between px-3 py-2 ${c.bg} ${c.hover} border ${c.border} rounded-lg transition-all group`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 ${c.icon} rounded flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className={`text-xs font-semibold ${c.text} truncate`}>{label}</span>
                      </div>
                      <ArrowRight className={`w-3 h-3 ${c.arrow} group-hover:translate-x-0.5 transition-transform flex-shrink-0`} />
                    </button>
                  );
                })}
                <button onClick={() => navigate(getDashboardRoute(user?.dashboardId))}
                  className="flex-1 flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all group">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-900 truncate">Dashboard</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900">Recent Invoices</h3>
              <button onClick={() => setShowInvoicesList(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {stats.loading ? (
                [1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-6">
                  <div className="w-12 h-12 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-gray-900 font-semibold text-sm mb-1">No invoices yet</h4>
                  <p className="text-gray-500 text-xs mb-3">Create your first invoice to get started</p>
                  <button onClick={handleNewInvoice}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors">
                    Create Invoice
                  </button>
                </div>
              ) : (
                invoices.slice(0, 8).map((invoice) => (
                  <div key={invoice.id}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {invoice.quoteNumber || invoice.invoiceNumber || invoice.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusStyles(invoice.status)}`}>
                          {invoice.status || "Draft"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1 truncate">
                          <Users className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{invoice.customer?.name || invoice.customerName || "No customer"}</span>
                        </span>
                        {(invoice.dates?.invoiceDate || invoice.date) && (
                          <span className="flex-shrink-0">
                            {new Date(invoice.dates?.invoiceDate || invoice.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(invoice.totals?.total || invoice.total || 0)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-shrink-0 text-center text-gray-400 text-xs pb-1">
            © 2026 SolidFlo • Modern Invoicing & Billing
          </div>
        </div>
      </div>

      {showSettings && <BusinessSettingsModal onClose={() => setShowSettings(false)} />}

      {showInvoicesList && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Invoices</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {stats.totalInvoices} {stats.totalInvoices === 1 ? "invoice" : "invoices"} found
                </p>
              </div>
              <button onClick={() => setShowInvoicesList(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
              {invoices.map((invoice) => (
                <div key={invoice.id}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-200 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900 font-semibold text-sm truncate">
                          {invoice.quoteNumber || invoice.invoiceNumber || invoice.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusStyles(invoice.status)}`}>
                          {invoice.status || "Draft"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {invoice.customer?.name || invoice.customerName || "No customer"}
                        </span>
                        {(invoice.dates?.invoiceDate || invoice.date) && (
                          <span>{new Date(invoice.dates?.invoiceDate || invoice.date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-base font-bold text-gray-900">
                        {formatCurrency(invoice.totals?.total || invoice.total || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}