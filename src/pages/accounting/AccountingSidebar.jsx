import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Receipt,
  FileText,
  TrendingDown,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calendar,
  BarChart3,
  LogOut,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function AccountingSidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleAddNewCustomer,
  setShowCustomersListModal,
  setShowInvoicesList,
  showInvoicesList,       
  showCustomersListModal,
  documentType,
  savedInvoices,
  handleNewEstimate,
  handleNewInvoiceDoc,
  handleNewQuote,
  businessInfo,
  savedQuotes,
  savedCustomers,
  handleLogout,
}) {
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
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
     {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Collapsed Sidebar */}
      <div
        className={`${
          sidebarOpen ? "hidden" : "hidden md:block"
        } fixed z-40 w-16 md:w-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 h-full print:hidden transition-all duration-300 shadow-2xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6 ">
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4  rounded-xl p-1 shadow-lg">
              <img src={logo} alt="" />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button
              onClick={() => setActiveView("home")} // ADD THIS
              className="group relative p-2 md:p-3 text-cyan-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Home"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-stone-600 to-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Settings"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Settings className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
            </button>

            {!isMobile && (
              <>
                <button
                  onClick={() => setActiveView("financial-overview")}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Financial Dashboard"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => {
                    handleNewInvoiceDoc();
                    setActiveView("invoice");
                  }}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Invoices"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Receipt className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => setShowCustomersListModal(true)}
                  className="group relative p-2 md:p-3 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
                  title="Clients"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Users className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg group-hover:ring-4 group-hover:ring-cyan-500/50 transition-all duration-300">
              <img src={businessInfo.logoUrl} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-50 w-64 md:w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>
                <div className="relative  p-1 rounded-xl shadow-lg">
                  <img
                    src={logo}
                    alt="Company Logo"
                    className="w-8 h-8 md:w-10 md:h-10"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="group p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:rotate-90"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5 md:space-y-2">
            <div
              onClick={() => {
                setActiveView("home");
                setSidebarOpen(false);
              }}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-stone-600/20 hover:to-stone-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>

            <div
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-purple-500/30"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs md:text-sm font-semibold">Settings</span>
            </div>

            <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-slate-700/50">
              <div
                onClick={() => {
                  setActiveView("financial-overview");
                  setSidebarOpen(false);
                }}
                className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-emerald-500/30"
              >
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm font-semibold truncate">
                  Financial Dashboard
                </span>
              </div>

              <div className="mt-2 md:mt-3">
                <div
                  onClick={() => {
                    setIsInvoicingOpen(!isInvoicingOpen);
                    setSidebarOpen(false);
                  }}
                  className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-500/30"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <Receipt className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Invoicing
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
                      isInvoicingOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Conditional rendering with animation */}
                <div
                  className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
                    isInvoicingOpen
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    onClick={() => {
                      handleNewEstimate();
                      setSidebarOpen(false);
                      setActiveView("invoice");
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Create Estimate</span>
                  </div>
                  <div
                    onClick={() => {
                      handleNewInvoiceDoc();
                      setActiveView("invoice");
                      setSidebarOpen(false);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Create Invoice</span>
                  </div>
                  <div
                    onClick={() => {
                      setShowInvoicesList(!showInvoicesList);
                      setSidebarOpen(false);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="truncate">
                          All{" "}
                          {documentType === "estimate"
                            ? "Estimates"
                            : "Invoices"}
                        </span>
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
                        {savedInvoices?.length ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 md:mt-3">
                <div
                  onClick={() => setIsClientsOpen(!isClientsOpen)}
                  className="group flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-pink-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-pink-500/30"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Clients
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
                      isClientsOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Conditional rendering with animation */}
                <div
                  className={`ml-4 md:ml-6 mt-1.5 md:mt-2 space-y-1 border-l-2 border-slate-700/50 pl-3 md:pl-4 overflow-hidden transition-all duration-300 ${
                    isClientsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    onClick={() => {
                      handleAddNewCustomer();
                      setSidebarOpen(false);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="truncate">Add Client</span>
                  </div>
                  <div
                    onClick={() => {
                      setShowCustomersListModal(true);
                      setSidebarOpen(false);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                        <span className="truncate">All Clients</span>
                      </div>
                      <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ml-2">
                        {savedCustomers.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {!isMobile && (
                <>
                  <div
                    onClick={() => {
                      setActiveView("templates");
                      setSidebarOpen(false);
                    }}
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-700/20 rounded-xl cursor-pointer transition-all duration-300 mt-2 border border-transparent hover:border-indigo-500/30"
                  >
                    <FileText className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Invoice Templates
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveView("reports");
                      setSidebarOpen(false);
                    }}
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600/20 hover:to-cyan-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
                  >
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Reports
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveView("expenses");
                      setSidebarOpen(false);
                    }}
                    className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-rose-600/20 hover:to-rose-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-rose-500/30"
                  >
                    <TrendingDown className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm font-semibold truncate">
                      Expenses
                    </span>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center p-4 md:p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
              <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-blue-500/50 transition-all duration-300">
                <img
                  src={businessInfo.logoUrl}
                  alt="Business Logo"
                  className="absolute inset-0 m-auto max-h-[70%] max-w-[70%] object-contain"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {user?.email || "email@example.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 p-2 md:p-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 flex-shrink-0"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
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
