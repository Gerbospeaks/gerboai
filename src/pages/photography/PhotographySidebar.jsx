import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calendar,
  BarChart3,
  LogOut,
  ClipboardList,
  FileText,
  FileBarChart,
  Package,
  CreditCard,
  Camera,
  Image,
  Film,
  Star,
  FolderOpen,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function PhotographySidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleNewInvoice,
  handleLogout,
  businessInfo,
  savedInvoices,
  savedCustomers,
  showInvoicesList,
  setShowInvoicesList,
  setShowCustomersListModal,
  handleAddNewCustomer,
}) {
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const goTo = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Collapsed sidebar (icon rail) — flex child, NOT fixed ─────── */}
      {!sidebarOpen && (
        <div className="hidden md:flex flex-col flex-shrink-0 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden shadow-xl z-30">
          <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6 flex-1">
            {/* Expand toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
            </button>

            {/* Logo */}
            <div className="w-10 h-10 mb-2">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <div className="w-10 border-t border-slate-600" />

            {/* Icon nav */}
            <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
              {[
                {
                  icon: Home,
                  title: "Home",
                  action: () => setActiveView("home"),
                  text: "text-cyan-400",
                  color: "from-stone-600 to-stone-700",
                },
                {
                  icon: Settings,
                  title: "Settings",
                  action: () => setShowSettings(true),
                  text: "text-slate-400",
                  color: "from-blue-600 to-blue-700",
                },
                {
                  icon: TrendingUp,
                  title: "Business Overview",
                  action: () => goTo("financial-overview"),
                  text: "text-slate-400",
                  color: "from-indigo-600 to-indigo-700",
                },
                {
                  icon: ClipboardList,
                  title: "Invoices",
                  action: () => handleNewInvoice?.(),
                  text: "text-slate-400",
                  color: "from-blue-600 to-blue-700",
                },
                {
                  icon: Users,
                  title: "Clients",
                  action: () => setShowCustomersListModal?.(true),
                  text: "text-slate-400",
                  color: "from-blue-600 to-blue-700",
                },
                {
                  icon: FileText,
                  title: "Invoice Templates",
                  action: () => goTo("templates"),
                  text: "text-slate-400",
                  color: "from-violet-600 to-violet-700",
                },
                {
                  icon: Calendar,
                  title: "Bookings",
                  action: () => goTo("bookings"),
                  text: "text-slate-400",
                  color: "from-cyan-600 to-cyan-700",
                },
                {
                  icon: Image,
                  title: "Portfolio",
                  action: () => goTo("portfolio"),
                  text: "text-slate-400",
                  color: "from-blue-600 to-blue-700",
                },
                {
                  icon: Package,
                  title: "Packages",
                  action: () => goTo("packages"),
                  text: "text-slate-400",
                  color: "from-indigo-600 to-indigo-700",
                },
                {
                  icon: CreditCard,
                  title: "Payments",
                  action: () => goTo("payments"),
                  text: "text-slate-400",
                  color: "from-blue-600 to-blue-700",
                },
                {
                  icon: FileBarChart,
                  title: "Reports",
                  action: () => goTo("reports"),
                  text: "text-slate-400",
                  color: "from-indigo-600 to-indigo-700",
                },
                {
                  icon: BarChart3,
                  title: "Analytics",
                  action: () => goTo("analytics"),
                  text: "text-slate-400",
                  color: "from-blue-600 to-blue-700",
                },
              ].map(({ icon: Icon, title, action, text, color }) => (
                <button
                  key={title}
                  onClick={action}
                  className={`group relative p-2 ${text} hover:text-white rounded-xl transition-all duration-300 w-10 h-10 flex items-center justify-center overflow-hidden`}
                  title={title}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <Icon className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Business logo bottom */}
          <div className="flex justify-center pb-4 md:pb-6">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center overflow-hidden">
              {businessInfo?.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  className="w-6 h-6 object-contain"
                  alt="biz"
                />
              ) : (
                <Camera className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded sidebar — flex child on desktop, fixed overlay on mobile ── */}
      {sidebarOpen && (
        <div className="flex-shrink-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden shadow-2xl overflow-y-auto z-50 md:relative fixed inset-y-0 left-0">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <img
                src={logo}
                alt="Business Logo"
                className="w-16 h-12 object-contain rounded-lg"
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              <NavItem
                icon={Home}
                label="Home"
                onClick={() => goTo("home")}
                color="cyan"
              />
              <NavItem
                icon={Settings}
                label="Settings"
                onClick={() => {
                  setShowSettings(true);
                  setSidebarOpen(false);
                }}
                color="blue"
              />

              <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
                <NavItem
                  icon={TrendingUp}
                  label="Business Overview"
                  onClick={() => goTo("financial-overview")}
                  color="indigo"
                />

                {/* Invoices accordion */}
                <Accordion
                  icon={ClipboardList}
                  label="Invoices"
                  isOpen={isInvoicesOpen}
                  onToggle={() => setIsInvoicesOpen((p) => !p)}
                >
                  <SubItem
                    label="Create Invoice"
                    onClick={() => {
                      handleNewInvoice?.();
                      goTo("invoice");
                    }}
                  />
                  <SubItem
                    label="All Invoices"
                    badge={savedInvoices?.length ?? 0}
                    onClick={() => {
                      setShowInvoicesList?.((p) => !p);
                      setSidebarOpen(false);
                    }}
                  />
                  <SubItem
                    label="Pending Payment"
                    onClick={() => goTo("invoices-pending")}
                  />
                </Accordion>

                {/* Clients accordion */}
                <Accordion
                  icon={Users}
                  label="Clients"
                  isOpen={isClientsOpen}
                  onToggle={() => setIsClientsOpen((p) => !p)}
                >
                  <SubItem
                    label="Add Client"
                    onClick={() => {
                      handleAddNewCustomer?.();
                      setSidebarOpen(false);
                    }}
                  />
                  <SubItem
                    label="All Clients"
                    badge={savedCustomers?.length ?? 0}
                    onClick={() => {
                      setShowCustomersListModal?.(true);
                      setSidebarOpen(false);
                    }}
                  />
                </Accordion>

                <NavItem
                  icon={FileText}
                  label="Invoice Templates"
                  onClick={() => goTo("templates")}
                  color="blue"
                />
                <NavItem
                  icon={Calendar}
                  label="Bookings"
                  onClick={() => goTo("bookings")}
                  color="cyan"
                />
                <NavItem
                  icon={Image}
                  label="Portfolio"
                  onClick={() => goTo("portfolio")}
                  color="blue"
                />
                <NavItem
                  icon={Package}
                  label="Packages"
                  onClick={() => goTo("packages")}
                  color="indigo"
                />

                {/* Payments accordion */}
                <Accordion
                  icon={CreditCard}
                  label="Payments"
                  isOpen={isPaymentsOpen}
                  onToggle={() => setIsPaymentsOpen((p) => !p)}
                >
                  <SubItem
                    label="Process Payment"
                    onClick={() => goTo("payment-process")}
                  />
                  <SubItem
                    label="Payment History"
                    onClick={() => goTo("payment-history")}
                  />
                  <SubItem
                    label="Deposits"
                    badgeColor="text-amber-300"
                    badge={0}
                    onClick={() => goTo("deposits")}
                  />
                </Accordion>

                {/* Reports accordion */}
                <Accordion
                  icon={FileBarChart}
                  label="Reports"
                  isOpen={isReportsOpen}
                  onToggle={() => setIsReportsOpen((p) => !p)}
                >
                  <SubItem
                    label="Booking Reports"
                    onClick={() => goTo("report-bookings")}
                  />
                  <SubItem
                    label="Revenue Reports"
                    onClick={() => goTo("report-revenue")}
                  />
                  <SubItem
                    label="Client Reports"
                    onClick={() => goTo("report-clients")}
                  />
                </Accordion>

                {/* Analytics accordion */}
                <Accordion
                  icon={BarChart3}
                  label="Analytics"
                  isOpen={isAnalyticsOpen}
                  onToggle={() => setIsAnalyticsOpen((p) => !p)}
                >
                  <SubItem
                    label="Booking Trends"
                    onClick={() => goTo("analytics-bookings")}
                  />
                  <SubItem
                    label="Revenue Trends"
                    onClick={() => goTo("analytics-revenue")}
                  />
                  <SubItem
                    label="Client Insights"
                    onClick={() => goTo("analytics-clients")}
                  />
                </Accordion>

                {!isMobile && (
                  <>
                    <NavItem
                      icon={Film}
                      label="Gallery Deliveries"
                      onClick={() => goTo("deliveries")}
                      color="blue"
                    />
                    <NavItem
                      icon={FolderOpen}
                      label="Shoot Archive"
                      onClick={() => goTo("archive")}
                      color="indigo"
                    />
                    <NavItem
                      icon={Star}
                      label="Reviews"
                      onClick={() => goTo("reviews")}
                      color="blue"
                    />
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 md:p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-blue-500/50 transition-all duration-300 flex items-center justify-center overflow-hidden">
                  {businessInfo?.logoUrl ? (
                    <img
                      src={businessInfo.logoUrl}
                      alt="Business Logo"
                      className="max-h-[70%] max-w-[70%] object-contain"
                    />
                  ) : (
                    <Camera className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || "email@example.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="group text-slate-400 hover:text-white hover:bg-red-600/20 p-2 md:p-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Accordion wrapper ─────────────────────────────────────────────────────────
function Accordion({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full group flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium truncate">{label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, color }) {
  const colors = {
    cyan: "text-cyan-300 hover:from-stone-600/20 hover:to-stone-700/20 hover:border-cyan-500/30",
    blue: "text-slate-300 hover:from-blue-600/20 hover:to-blue-700/20 hover:border-blue-500/30",
    indigo:
      "text-slate-300 hover:from-indigo-600/20 hover:to-indigo-700/20 hover:border-indigo-500/30",
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div
      onClick={onClick}
      className={`group flex items-center space-x-3 px-3 py-2.5 ${c} hover:text-white hover:bg-gradient-to-r rounded-lg cursor-pointer transition-all duration-200 border border-transparent`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
      <span className="text-sm font-medium truncate">{label}</span>
    </div>
  );
}

// ── SubItem ───────────────────────────────────────────────────────────────────
function SubItem({ label, onClick, badge, badgeColor }) {
  return (
    <div
      onClick={onClick}
      className="group px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="truncate">{label}</span>
        {badge != null && (
          <span
            className={`${badgeColor ?? "text-blue-300"} px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
