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
  FileText,
  ClipboardList,
  Building2,
  Key,
  CreditCard,
  FileBarChart,
  LogOut,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function RealEstateSidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleNewInvoice,
  handleAddNewCustomer,
  businessInfo,
  savedInvoices,
  savedCustomers,
  showInvoicesList,
  setShowInvoicesList,
  setShowCustomersListModal,
  handleLogout,
}) {
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Collapsed sidebar (icon rail) ─────────────────────────────── */}
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
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4 rounded-xl p-1 shadow-lg">
                <img
                  src={logo}
                  className="w-full h-full object-contain"
                  alt="logo"
                />
              </div>
            </div>

            <div className="w-10 border-t border-slate-600" />

            {/* Icon nav */}
            <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
              {[
                { icon: Home, title: "Home", action: () => goTo("home") },
                {
                  icon: Settings,
                  title: "Settings",
                  action: () => setShowSettings(true),
                },
                {
                  icon: TrendingUp,
                  title: "Business Overview",
                  action: () => goTo("financial-overview"),
                },
                {
                  icon: ClipboardList,
                  title: "Invoices",
                  action: () => handleNewInvoice(),
                },
                {
                  icon: Users,
                  title: "Clients",
                  action: () => setShowCustomersListModal(true),
                },
                {
                  icon: Building2,
                  title: "Properties",
                  action: () => goTo("properties"),
                },
                {
                  icon: FileText,
                  title: "Invoice Templates",
                  action: () => goTo("templates"),
                },
                {
                  icon: Key,
                  title: "Listings",
                  action: () => goTo("listings"),
                },
                {
                  icon: Receipt,
                  title: "Transactions",
                  action: () => goTo("transactions"),
                },
                {
                  icon: CreditCard,
                  title: "Commissions",
                  action: () => goTo("commissions"),
                },
                {
                  icon: FileBarChart,
                  title: "Reports",
                  action: () => goTo("reports"),
                },
              ].map(({ icon: Icon, title, action }) => (
                <button
                  key={title}
                  onClick={action}
                  className="group relative p-2 text-slate-400 hover:text-white hover:bg-blue-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
                  title={title}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Business logo bottom */}
          <div className="flex justify-center pb-4 md:pb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-cyan-700 shadow-lg overflow-hidden">
              {businessInfo?.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  className="w-6 h-6 object-contain"
                  alt="biz"
                />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded sidebar ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="flex-shrink-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden shadow-2xl overflow-y-auto z-50 md:relative fixed inset-y-0 left-0">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <img
                src={logo}
                className="w-16 h-12 object-contain rounded-lg"
                alt="logo"
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
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
                color="stone"
              />
              <NavItem
                icon={Settings}
                label="Settings"
                onClick={() => {
                  setShowSettings(true);
                  setSidebarOpen(false);
                }}
                color="slate"
              />

              <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
                <NavItem
                  icon={TrendingUp}
                  label="Business Overview"
                  onClick={() => goTo("financial-overview")}
                  color="blue"
                />

                {/* Invoices accordion */}
                <div>
                  <button
                    onClick={() => setIsInvoicesOpen((p) => !p)}
                    className="w-full group flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <ClipboardList className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        Invoices
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isInvoicesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4 overflow-hidden transition-all duration-300 ${isInvoicesOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <SubItem
                      label="Create Invoice"
                      onClick={() => {
                        handleNewInvoice();
                        setSidebarOpen(false);
                      }}
                    />
                    <SubItem
                      label="All Invoices"
                      badge={savedInvoices?.length ?? 0}
                      onClick={() => {
                        setShowInvoicesList(!showInvoicesList);
                        setSidebarOpen(false);
                      }}
                    />
                    <SubItem
                      label="Pending Payment"
                      onClick={() => goTo("pending")}
                    />
                    <SubItem label="Overdue" onClick={() => goTo("overdue")} />
                  </div>
                </div>

                {/* Clients accordion */}
                <div>
                  <button
                    onClick={() => setIsClientsOpen((p) => !p)}
                    className="w-full group flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Users className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        Clients
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isClientsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4 overflow-hidden transition-all duration-300 ${isClientsOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <SubItem
                      label="Add Client"
                      onClick={() => {
                        handleAddNewCustomer();
                        setSidebarOpen(false);
                      }}
                    />
                    <SubItem
                      label="All Clients"
                      badge={savedCustomers?.length ?? 0}
                      onClick={() => {
                        setShowCustomersListModal(true);
                        setSidebarOpen(false);
                      }}
                    />
                  </div>
                </div>

                <NavItem
                  icon={Building2}
                  label="Properties"
                  onClick={() => goTo("properties")}
                  color="slate"
                />
                <NavItem
                  icon={FileText}
                  label="Invoice Templates"
                  onClick={() => goTo("templates")}
                  color="slate"
                />
                <NavItem
                  icon={Key}
                  label="Listings"
                  onClick={() => goTo("listings")}
                  color="slate"
                />
                <NavItem
                  icon={Receipt}
                  label="Transactions"
                  onClick={() => goTo("transactions")}
                  color="slate"
                />
                <NavItem
                  icon={CreditCard}
                  label="Commissions"
                  onClick={() => goTo("commissions")}
                  color="slate"
                />
                <NavItem
                  icon={FileBarChart}
                  label="Reports"
                  onClick={() => goTo("reports")}
                  color="slate"
                />
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
                    <Building2 className="w-5 h-5 text-blue-500" />
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, color }) {
  const colors = {
    stone: {
      text: "text-cyan-300",
      hover: "hover:bg-stone-600/20",
      border: "hover:border-cyan-500/30",
    },
    slate: {
      text: "text-slate-300",
      hover: "hover:bg-slate-700/50",
      border: "hover:border-slate-500/30",
    },
    blue: {
      text: "text-slate-300",
      hover: "hover:bg-blue-600/20 hover:border-l-4 hover:border-blue-500",
      border: "hover:border-blue-500/30",
    },
  };
  const c = colors[color] ?? colors.slate;
  return (
    <div
      onClick={onClick}
      className={`group flex items-center space-x-3 px-3 py-2.5 ${c.text} hover:text-white ${c.hover} rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${c.border}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
      <span className="text-sm font-medium truncate">{label}</span>
    </div>
  );
}

function SubItem({ label, onClick, badge }) {
  return (
    <div
      onClick={onClick}
      className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {badge != null && (
          <span className="text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
