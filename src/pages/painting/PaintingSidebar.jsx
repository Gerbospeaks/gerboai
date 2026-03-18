import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Receipt,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ShoppingBag,
  Calendar,
  BarChart3,
  LogOut,
  Palette,
  Paintbrush,
  Layers,
  Package,
  ClipboardList,
  Ruler,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function PaintingSidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleNewInvoice,
  handleNewQuote,
  businessInfo,
  savedQuotes,
  savedCustomers,
  handleLogout,
  showQuotesList,
  setShowQuotesList,
  setShowCustomersListModal,
  handleAddNewCustomer,
  documentType,
  isQuotesInvoicesOpen2,
  setIsQuotesInvoicesOpen2,
}) {
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
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
        <div className="hidden md:flex flex-col flex-shrink-0 w-16 md:w-20 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 border-r border-stone-700/50 h-full print:hidden shadow-2xl z-30">
          <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6 flex-1">
            {/* Expand toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="group p-2 md:p-3 text-amber-400 hover:text-white hover:bg-gradient-to-r hover:from-stone-600 hover:to-stone-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
            </button>

            {/* Logo */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4 rounded-xl p-1 shadow-lg">
                <img
                  src={logo}
                  className="w-full h-full text-white p-1.5"
                  alt="logo"
                />
              </div>
            </div>

            {/* Icon nav */}
            <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
              <button
                onClick={() => setActiveView("home")}
                className="group relative p-2 md:p-3 text-cyan-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                title="Home"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-stone-600 to-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                title="Settings"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Settings className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
              </button>

              {!isMobile && (
                <>
                  <button
                    onClick={() => setActiveView("financial-overview")}
                    className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Financial Dashboard"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>

                  <button
                    onClick={() => {
                      handleNewInvoice();
                      setActiveView("quote");
                    }}
                    className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Quotes & Invoices"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Receipt className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>

                  <button
                    onClick={() => setActiveView("projects")}
                    className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Paint Projects"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Paintbrush className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>

                  <button
                    onClick={() => setShowCustomersListModal(true)}
                    className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Clients"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Users className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Business logo bottom */}
          <div className="flex justify-center pb-4 md:pb-6">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center ring-2 ring-stone-700 shadow-lg group-hover:ring-4 group-hover:ring-amber-500/50 transition-all duration-300 overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-6 h-6 object-contain"
                    alt="biz"
                  />
                ) : (
                  <Palette className="w-5 h-5 text-rose-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded sidebar — flex child on desktop, fixed overlay on mobile ── */}
      {sidebarOpen && (
        <div className="flex-shrink-0 w-64 md:w-72 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 border-r border-stone-700/50 h-full print:hidden shadow-2xl overflow-y-auto z-50 md:relative fixed inset-y-0 left-0">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300" />
                <div className="relative p-1 rounded-xl shadow-lg">
                  <img src={logo} className="w-12 h-auto" alt="logo" />
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="group p-2 text-amber-400 hover:text-white hover:bg-stone-700/50 rounded-xl transition-all duration-300 hover:rotate-90"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="space-y-1.5 md:space-y-2">
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
                color="orange"
              />

              <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-stone-700/50 space-y-1.5">
                <NavItem
                  icon={TrendingUp}
                  label="Financial Dashboard"
                  onClick={() => goTo("financial-overview")}
                  color="emerald"
                />

                {/* Quotes & Invoices accordion */}
                <Accordion
                  icon={Receipt}
                  label="Quotes & Invoices"
                  isOpen={isQuotesInvoicesOpen2}
                  onToggle={() => setIsQuotesInvoicesOpen2?.((p) => !p)}
                  accentColor="amber"
                >
                  <SubItem
                    label="Create Quote"
                    dot="bg-amber-500"
                    onClick={() => {
                      handleNewQuote();
                      goTo("quote");
                    }}
                  />
                  <SubItem
                    label="Create Invoice"
                    dot="bg-emerald-500"
                    onClick={() => {
                      handleNewInvoice();
                      goTo("quote");
                    }}
                  />
                  <SubItem
                    label={`All ${documentType === "quote" ? "Quotes" : "Invoices"}`}
                    dot="bg-purple-500"
                    badge={savedQuotes?.length ?? 0}
                    badgeColor="from-amber-600 to-orange-600"
                    onClick={() => {
                      setShowQuotesList?.((p) => !p);
                      setSidebarOpen(false);
                    }}
                  />
                </Accordion>
<NavItem icon={ShoppingBag} label="Purchase Orders"
  onClick={() => goTo("purchase-orders")}
  active={activeView === "purchase-orders"} />
                {/* Paint Projects accordion */}
                <Accordion
                  icon={Paintbrush}
                  label="Paint Projects"
                  isOpen={isProjectsOpen}
                  onToggle={() => setIsProjectsOpen((p) => !p)}
                  accentColor="rose"
                >
                  <SubItem
                    label="Active Projects"
                    dot="bg-rose-500"
                    onClick={() => goTo("projects")}
                  />
                  <SubItem
                    label="Colour Consultations"
                    dot="bg-pink-400"
                    onClick={() => goTo("consultations")}
                  />
                  <SubItem
                    label="Surface Estimates"
                    dot="bg-amber-400"
                    onClick={() => goTo("estimates")}
                  />
                  <SubItem
                    label="Job Checklists"
                    dot="bg-orange-400"
                    onClick={() => goTo("checklists")}
                  />
                </Accordion>

                {/* Clients accordion */}
                <Accordion
                  icon={Users}
                  label="Clients"
                  isOpen={isClientsOpen}
                  onToggle={() => setIsClientsOpen((p) => !p)}
                  accentColor="pink"
                >
                  <SubItem
                    label="Add Client"
                    dot="bg-emerald-500"
                    onClick={() => {
                      handleAddNewCustomer?.();
                      setSidebarOpen(false);
                    }}
                  />
                  <SubItem
                    label="All Clients"
                    dot="bg-blue-500"
                    badge={savedCustomers?.length ?? 0}
                    badgeColor="from-pink-600 to-purple-600"
                    onClick={() => {
                      setShowCustomersListModal?.(true);
                      setSidebarOpen(false);
                    }}
                  />
                </Accordion>

                {!isMobile && (
                  <>
                    <NavItem
                      icon={Package}
                      label="Paint & Materials"
                      onClick={() => goTo("inventory")}
                      color="stone"
                    />
                    <NavItem
                      icon={Layers}
                      label="Colour Library"
                      onClick={() => goTo("colours")}
                      color="rose"
                    />
                    <NavItem
                      icon={Ruler}
                      label="Area Calculator"
                      onClick={() => goTo("calculator")}
                      color="indigo"
                    />
                    <NavItem
                      icon={Calendar}
                      label="Schedule"
                      onClick={() => goTo("schedule")}
                      color="indigo"
                    />
                    <NavItem
                      icon={BarChart3}
                      label="Reports"
                      onClick={() => goTo("reports")}
                      color="blue"
                    />
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 md:p-6 border-t border-slate-700/50 bg-gradient-to-t from-stone-900 to-transparent backdrop-blur-sm">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-amber-500/50 transition-all duration-300 flex items-center justify-center overflow-hidden">
                  {businessInfo?.logoUrl ? (
                    <img
                      src={businessInfo.logoUrl}
                      alt="Business Logo"
                      className="max-h-[70%] max-w-[70%] object-contain"
                    />
                  ) : (
                    <Palette className="w-5 h-5 text-rose-500" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-amber-400 truncate">
                  {user?.email || "email@example.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="group text-amber-400 hover:text-white hover:bg-red-600/20 p-2 md:p-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0"
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
const accentMap = {
  amber: {
    text: "text-amber-300",
    hover: "hover:from-amber-600/20 hover:to-amber-700/20",
    border: "hover:border-amber-500/30",
  },
  rose: {
    text: "text-rose-300",
    hover: "hover:from-rose-600/20 hover:to-rose-700/20",
    border: "hover:border-rose-500/30",
  },
  pink: {
    text: "text-slate-300",
    hover: "hover:from-pink-600/20 hover:to-pink-700/20",
    border: "hover:border-pink-500/30",
  },
};

function Accordion({
  icon: Icon,
  label,
  isOpen,
  onToggle,
  accentColor,
  children,
}) {
  const c = accentMap[accentColor] ?? accentMap.amber;
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 ${c.text} hover:text-white hover:bg-gradient-to-r ${c.hover} rounded-xl cursor-pointer transition-all duration-300 border border-transparent ${c.border}`}
      >
        <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xs md:text-sm font-semibold truncate">
            {label}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-stone-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
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
    cyan: {
      text: "text-cyan-300",
      hover: "hover:from-stone-600/20 hover:to-stone-700/20",
      border: "hover:border-cyan-500/30",
    },
    orange: {
      text: "text-amber-300",
      hover: "hover:from-orange-600/20 hover:to-orange-700/20",
      border: "hover:border-orange-500/30",
    },
    emerald: {
      text: "text-amber-300",
      hover: "hover:from-emerald-600/20 hover:to-emerald-700/20",
      border: "hover:border-emerald-500/30",
    },
    rose: {
      text: "text-amber-300",
      hover: "hover:from-rose-600/20 hover:to-rose-700/20",
      border: "hover:border-rose-500/30",
    },
    stone: {
      text: "text-amber-300",
      hover: "hover:from-stone-600/20 hover:to-stone-700/20",
      border: "hover:border-stone-500/30",
    },
    indigo: {
      text: "text-amber-300",
      hover: "hover:from-indigo-600/20 hover:to-indigo-700/20",
      border: "hover:border-indigo-500/30",
    },
    blue: {
      text: "text-amber-300",
      hover: "hover:from-blue-600/20 hover:to-blue-700/20",
      border: "hover:border-blue-500/30",
    },
  };
  const c = colors[color] ?? colors.orange;
  return (
    <div
      onClick={onClick}
      className={`group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 ${c.text} hover:text-white hover:bg-gradient-to-r ${c.hover} rounded-xl cursor-pointer transition-all duration-300 border border-transparent ${c.border}`}
    >
      <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
      <span className="text-xs md:text-sm font-semibold truncate">{label}</span>
    </div>
  );
}

// ── SubItem ───────────────────────────────────────────────────────────────────
function SubItem({ label, dot, onClick, badge, badgeColor }) {
  return (
    <div
      onClick={onClick}
      className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-amber-400 hover:text-white hover:bg-stone-700/30 rounded-lg cursor-pointer transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <div
            className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0 group-hover:scale-150 transition-transform duration-300`}
          />
          <span className="truncate">{label}</span>
        </div>
        {badge != null && (
          <span
            className={`bg-gradient-to-r ${badgeColor} text-white px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ml-2`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
