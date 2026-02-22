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

export default function ConstructionSidebar({
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
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
              className="group p-2 md:p-3 text-amber-400 hover:text-white hover:bg-stone-700 rounded-xl transition-all duration-300 hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Logo */}
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl p-1">
              <img
                src={logo}
                className="w-full h-full p-1.5 object-contain"
                alt="logo"
              />
            </div>

            {/* Icon nav */}
            <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
              {[
                {
                  icon: Home,
                  title: "Home",
                  view: "home",
                  color: "from-stone-600 to-stone-700",
                  text: "text-cyan-400",
                },
                {
                  icon: Settings,
                  title: "Settings",
                  action: () => setShowSettings(true),
                  color: "from-orange-600 to-orange-700",
                  text: "text-amber-400",
                },
              ].map(({ icon: Icon, title, view, action, color, text }) => (
                <button
                  key={title}
                  onClick={action ?? (() => goTo(view))}
                  className={`group relative p-2 md:p-3 ${text} hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden`}
                  title={title}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <Icon className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              ))}

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
                    onClick={() => {
                      handleNewInvoice();
                    }}
                    className="group relative p-2 md:p-3 text-amber-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                    title="Quotes & Invoices"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Receipt className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => goTo("clients")}
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
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full ring-2 ring-stone-700 shadow-lg flex items-center justify-center overflow-hidden">
              {businessInfo?.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  className="w-6 h-6 object-contain"
                  alt="biz"
                />
              ) : (
                <div className="w-6 h-6 bg-amber-400 rounded-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded sidebar — fixed overlay on mobile, flex child on desktop ── */}
      {sidebarOpen && (
        <div className="flex-shrink-0 w-64 md:w-72 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 border-r border-stone-700/50 h-full print:hidden shadow-2xl overflow-y-auto z-50 md:relative fixed inset-y-0 left-0">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <img src={logo} className="w-12 h-auto" alt="logo" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-amber-400 hover:text-white hover:bg-stone-700/50 rounded-xl transition-all duration-300 hover:rotate-90"
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
                color="amber"
              />

              <div className="pt-3 mt-3 border-t border-stone-700/50 space-y-1.5">
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
                    className="w-full group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-amber-300 hover:text-white hover:bg-amber-600/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-amber-500/30"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                      <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs md:text-sm font-semibold truncate">
                        Quotes & Invoices
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isQuotesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`ml-6 mt-1.5 space-y-1 border-l-2 border-stone-700/50 pl-4 overflow-hidden transition-all duration-300 ${isQuotesOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
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
                        goTo("invoice");
                      }}
                    />
                    <SubItem
                      label="All Documents"
                      dot="bg-purple-500"
                      badge={savedQuotes?.length ?? 0}
                      badgeColor="from-amber-600 to-orange-600"
                      onClick={() => goTo("quotes-list")}
                    />
                  </div>
                </div>

                {/* Clients accordion */}
                <div>
                  <button
                    onClick={() => setIsClientsOpen((p) => !p)}
                    className="w-full group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-pink-600/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-pink-500/30"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                      <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs md:text-sm font-semibold truncate">
                        Clients
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isClientsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`ml-6 mt-1.5 space-y-1 border-l-2 border-slate-700/50 pl-4 overflow-hidden transition-all duration-300 ${isClientsOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <SubItem
                      label="Add Client"
                      dot="bg-emerald-500"
                      onClick={() => goTo("addClient")}
                    />
                    <SubItem
                      label="All Clients"
                      dot="bg-blue-500"
                      badge={savedCustomers?.length ?? 0}
                      badgeColor="from-pink-600 to-purple-600"
                      onClick={() => goTo("clients")}
                    />
                  </div>
                </div>

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
          <div className="sticky bottom-0 p-4 md:p-5 border-t border-slate-700/50 bg-stone-900">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full ring-2 ring-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    alt="biz"
                    className="max-h-[70%] max-w-[70%] object-contain"
                  />
                ) : (
                  <div className="w-5 h-5 bg-amber-400 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-amber-400/70 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="group text-amber-400 hover:text-white hover:bg-red-600/20 p-2 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0"
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

// ── Tiny helpers to reduce repetition ────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, color }) {
  const colors = {
    cyan: {
      text: "text-cyan-300",
      hover: "hover:from-stone-600/20 hover:to-stone-700/20",
      border: "hover:border-cyan-500/30",
    },
    amber: {
      text: "text-amber-300",
      hover: "hover:from-orange-600/20 hover:to-orange-700/20",
      border: "hover:border-orange-500/30",
    },
    emerald: {
      text: "text-amber-300",
      hover: "hover:from-emerald-600/20 hover:to-emerald-700/20",
      border: "hover:border-emerald-500/30",
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
  const c = colors[color] ?? colors.amber;
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
