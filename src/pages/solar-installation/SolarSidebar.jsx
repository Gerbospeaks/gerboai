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
  LogOut,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function SolarSidebar({
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
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);
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
        <div className="hidden md:flex flex-col flex-shrink-0 w-16 md:w-20 bg-gradient-to-b from-orange-900 via-orange-800 to-orange-900 border-r border-orange-700/50 h-full print:hidden shadow-2xl z-30">
          <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6 flex-1">
            {/* Expand toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="group p-2 md:p-3 text-amber-400 hover:text-white hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
            </button>

            {/* Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4 rounded-xl p-1 shadow-lg">
                <img src={logo} className="w-full h-full object-contain" alt="logo" />
              </div>
            </div>

            {/* Icon nav */}
            <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
              <button
                onClick={() => goTo("home")}
                className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                title="Home"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                title="Settings"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Settings className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
              </button>

              {!isMobile && (
                <>
                  <button
                    onClick={() => goTo("financial-overview")}
                    className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Financial Dashboard"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => { handleNewInvoice(); goTo("quote"); }}
                    className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Quotes & Invoices"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Receipt className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => setShowCustomersListModal(true)}
                    className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Clients"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Users className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Business logo bottom */}
          <div className="flex justify-center pb-4 md:pb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center ring-2 ring-orange-700 shadow-lg overflow-hidden">
              {businessInfo?.logoUrl ? (
                <img src={businessInfo.logoUrl} className="w-6 h-6 object-contain" alt="biz" />
              ) : (
                <div className="w-6 h-6 bg-amber-300 rounded-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded sidebar ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="flex-shrink-0 w-64 md:w-72 bg-gradient-to-b from-orange-900 via-orange-800 to-orange-900 border-r border-orange-700/50 h-full print:hidden shadow-2xl overflow-y-auto z-50 md:relative fixed inset-y-0 left-0">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <img src={logo} className="w-16 h-12 object-contain rounded-lg" alt="logo" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="group p-2 text-amber-400 hover:text-white hover:bg-orange-700/50 rounded-xl transition-all duration-300 hover:rotate-90"
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
                color="orange"
              />
              <NavItem
                icon={Settings}
                label="Settings"
                onClick={() => { setShowSettings(true); setSidebarOpen(false); }}
                color="amber"
              />

              <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-orange-700/50 space-y-1.5 md:space-y-2">
                <NavItem
                  icon={TrendingUp}
                  label="Financial Dashboard"
                  onClick={() => goTo("financial-overview")}
                  color="emerald"
                />

                {/* Quotes & Invoices accordion */}
                <div>
                  <button
                    onClick={() => setIsQuotesOpen((p) => !p)}
                    className="w-full group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-orange-600/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-500/30"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                      <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs md:text-sm font-semibold truncate">Quotes & Invoices</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isQuotesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-orange-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${isQuotesOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <SubItem
                      dot="bg-amber-500"
                      label="Create Quote"
                      onClick={() => { handleNewQuote(); goTo("quote"); }}
                    />
                    <SubItem
                      dot="bg-emerald-500"
                      label="Create Invoice"
                      onClick={() => { handleNewInvoice(); goTo("quote"); }}
                    />
                    <SubItem
                      dot="bg-orange-500"
                      label={`All ${documentType === "quote" ? "Quotes" : "Invoices"}`}
                      badge={savedQuotes?.length ?? 0}
                      badgeColor="from-amber-600 to-orange-600"
                      onClick={() => { setShowQuotesList(!showQuotesList); if (isMobile) setSidebarOpen(false); }}
                    />
                  </div>
                </div>

                {/* Clients accordion */}
                <div>
                  <button
                    onClick={() => setIsClientsOpen((p) => !p)}
                    className="w-full group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-yellow-600/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-yellow-500/30"
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
                    className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-orange-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${isClientsOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <SubItem
                      dot="bg-emerald-500"
                      label="Add Client"
                      onClick={() => { handleAddNewCustomer(); if (isMobile) setSidebarOpen(false); }}
                    />
                    <SubItem
                      dot="bg-yellow-500"
                      label="All Clients"
                      badge={savedCustomers?.length ?? 0}
                      badgeColor="from-yellow-600 to-orange-600"
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
                      color="blue"
                    />
                    <NavItem
                      icon={BarChart3}
                      label="Reports"
                      onClick={() => goTo("reports")}
                      color="purple"
                    />
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 px-4 py-4 md:py-5 border-t border-orange-700/50 bg-orange-900">
            <div className="flex items-center space-x-2 md:space-x-3 w-full">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-orange-700 shadow-lg group-hover:ring-4 group-hover:ring-amber-500/50 transition-all duration-300 flex items-center justify-center overflow-hidden">
                  {businessInfo?.logoUrl ? (
                    <img
                      src={businessInfo.logoUrl}
                      alt="Business Logo"
                      className="max-h-[70%] max-w-[70%] object-contain"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-amber-400 rounded-full" />
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, color }) {
  const colors = {
    orange: {
      text: "text-amber-300",
      hover: "hover:bg-orange-600/20",
      border: "hover:border-orange-500/30",
    },
    amber: {
      text: "text-amber-300",
      hover: "hover:bg-amber-600/20",
      border: "hover:border-amber-500/30",
    },
    emerald: {
      text: "text-amber-300",
      hover: "hover:bg-emerald-600/20",
      border: "hover:border-emerald-500/30",
    },
    blue: {
      text: "text-amber-300",
      hover: "hover:bg-blue-600/20",
      border: "hover:border-blue-500/30",
    },
    purple: {
      text: "text-amber-300",
      hover: "hover:bg-purple-600/20",
      border: "hover:border-purple-500/30",
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

function SubItem({ label, dot, onClick, badge, badgeColor }) {
  return (
    <div
      onClick={onClick}
      className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-amber-400 hover:text-white hover:bg-orange-700/30 rounded-lg cursor-pointer transition-all duration-300"
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