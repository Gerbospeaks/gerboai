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
  Calendar,
  BarChart3,
  Grid3x3,
  LogOut,
} from "lucide-react";

export default function WindowRepairSidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleNewQuote,
  handleNewInvoice,
  handleAddNewCustomer,
  businessInfo,
  savedQuotes,
  savedCustomers,
  showQuotesList,
  setShowQuotesList,
  setShowCustomersListModal,
  documentType,
  handleLogout,
}) {
  const [isQuotesInvoicesOpen, setIsQuotesInvoicesOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
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

      {/* ── Collapsed sidebar (icon rail) ─────────────────────────────── */}
      {!sidebarOpen && (
        <div className="hidden md:flex flex-col flex-shrink-0 w-16 md:w-20 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 border-r border-blue-700/50 h-full print:hidden shadow-2xl z-30">
          <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6 flex-1">
            {/* Expand toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="group p-2 md:p-3 text-blue-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
            </button>

            {/* Brand icon */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4 rounded-xl p-1 shadow-lg">
                <Grid3x3 className="w-full h-full text-white p-1.5" />
              </div>
            </div>

            {/* Icon nav */}
            <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
              <button
                onClick={() => goTo("home")}
                className="group relative p-2 md:p-3 text-blue-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                title="Home"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="group relative p-2 md:p-3 text-blue-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                title="Settings"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Settings className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
              </button>

              {!isMobile && (
                <>
                  <button
                    onClick={() => goTo("financial-overview")}
                    className="group relative p-2 md:p-3 text-blue-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Financial Dashboard"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => { handleNewInvoice(); goTo("quote"); }}
                    className="group relative p-2 md:p-3 text-blue-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Quotes & Invoices"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Receipt className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => setShowCustomersListModal(true)}
                    className="group relative p-2 md:p-3 text-blue-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Clients"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Users className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Business logo bottom */}
          <div className="flex justify-center pb-4 md:pb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-700 shadow-lg overflow-hidden">
              {businessInfo?.logoUrl ? (
                <img src={businessInfo.logoUrl} className="w-6 h-6 object-contain" alt="biz" />
              ) : (
                <Grid3x3 className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded sidebar ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="flex-shrink-0 w-64 md:w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 border-r border-blue-700/50 h-full print:hidden shadow-2xl overflow-y-auto z-50 md:relative fixed inset-y-0 left-0">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300" />
                <div className="relative p-1 rounded-xl shadow-lg">
                  <Grid3x3 className="w-10 h-12 md:w-16 md:h-12 text-white p-2" />
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="group p-2 text-blue-400 hover:text-white hover:bg-blue-700/50 rounded-xl transition-all duration-300 hover:rotate-90"
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
                color="slate"
              />
              <NavItem
                icon={Settings}
                label="Settings"
                onClick={() => { setShowSettings(true); setSidebarOpen(false); }}
                color="indigo"
              />

              <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-blue-700/50 space-y-1.5 md:space-y-2">
                <NavItem
                  icon={TrendingUp}
                  label="Financial Dashboard"
                  onClick={() => goTo("financial-overview")}
                  color="emerald"
                />

                {/* Quotes & Invoices accordion */}
                <div>
                  <button
                    onClick={() => setIsQuotesInvoicesOpen((p) => !p)}
                    className="w-full group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-blue-300 hover:text-white hover:bg-orange-600/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-500/30"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                      <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs md:text-sm font-semibold truncate">Quotes & Invoices</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isQuotesInvoicesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-blue-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${isQuotesInvoicesOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <SubItem
                      dot="bg-blue-500"
                      label="Create Quote"
                      onClick={() => { handleNewQuote(); goTo("quote"); }}
                    />
                    <SubItem
                      dot="bg-emerald-500"
                      label="Create Invoice"
                      onClick={() => { handleNewInvoice(); goTo("quote"); }}
                    />
                    <SubItem
                      dot="bg-purple-500"
                      label={`All ${documentType === "quote" ? "Quotes" : "Invoices"}`}
                      badge={savedQuotes?.length ?? 0}
                      badgeColor="from-blue-600 to-indigo-600"
                      onClick={() => { setShowQuotesList(!showQuotesList); if (isMobile) setSidebarOpen(false); }}
                    />
                  </div>
                </div>

                {/* Clients accordion */}
                <div>
                  <button
                    onClick={() => setIsClientsOpen((p) => !p)}
                    className="w-full group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-blue-300 hover:text-white hover:bg-pink-600/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-pink-500/30"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                      <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs md:text-sm font-semibold truncate">Clients</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isClientsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-blue-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${isClientsOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <SubItem
                      dot="bg-emerald-500"
                      label="Add Client"
                      onClick={() => { handleAddNewCustomer(); if (isMobile) setSidebarOpen(false); }}
                    />
                    <SubItem
                      dot="bg-blue-500"
                      label="All Clients"
                      badge={savedCustomers?.length ?? 0}
                      badgeColor="from-pink-600 to-purple-600"
                      onClick={() => { setShowCustomersListModal(true); if (isMobile) setSidebarOpen(false); }}
                    />
                  </div>
                </div>

                {/* Desktop-only */}
                {!isMobile && (
                  <>
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
          <div className="sticky bottom-0 flex justify-center px-4 py-4 md:py-5 border-t border-blue-700/50 bg-blue-900">
            <div className="flex items-center space-x-2 md:space-x-3 w-full">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-blue-700 shadow-lg group-hover:ring-4 group-hover:ring-blue-500/50 transition-all duration-300 flex items-center justify-center overflow-hidden">
                  {businessInfo?.logoUrl ? (
                    <img
                      src={businessInfo.logoUrl}
                      alt="Business Logo"
                      className="max-h-[70%] max-w-[70%] object-contain"
                    />
                  ) : (
                    <Grid3x3 className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-blue-400 truncate">
                  {user?.email || "email@example.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="group text-blue-400 hover:text-white hover:bg-red-600/20 p-2 md:p-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0"
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, color }) {
  const colors = {
    slate: {
      text: "text-blue-300",
      hover: "hover:bg-slate-600/20",
      border: "hover:border-blue-500/30",
    },
    indigo: {
      text: "text-blue-300",
      hover: "hover:bg-indigo-600/20",
      border: "hover:border-indigo-500/30",
    },
    emerald: {
      text: "text-blue-300",
      hover: "hover:bg-emerald-600/20",
      border: "hover:border-emerald-500/30",
    },
    blue: {
      text: "text-blue-300",
      hover: "hover:bg-blue-600/20",
      border: "hover:border-blue-500/30",
    },
  };
  const c = colors[color] ?? colors.blue;
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

function SubItem({ label, dot, onClick, badge, badgeColor }) {
  return (
    <div
      onClick={onClick}
      className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-blue-400 hover:text-white hover:bg-blue-700/30 rounded-lg cursor-pointer transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          {dot && (
            <div className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0 group-hover:scale-150 transition-transform duration-300`} />
          )}
          <span className="truncate">{label}</span>
        </div>
        {badge != null && (
          <span
            className={`bg-gradient-to-r ${badgeColor} text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}