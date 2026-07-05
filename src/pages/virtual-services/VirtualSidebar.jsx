import React, { useState } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ClipboardList,
  FileText,
  FileBarChart,
  BarChart3,
  Globe,
  LogOut,
} from "lucide-react";
import logo from "../../assets/img/solidflo-logo.png";

/**
 * VirtualSidebar – navigation sidebar for online/virtual service businesses
 * (consultants, coaches, agencies, e-commerce/service marketplaces, etc.)
 *
 * Renders both the collapsed icon rail and the expanded panel; which one is
 * visible is driven entirely by the `sidebarOpen` prop.
 */
export default function VirtualSidebar({
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

      {/* ── Collapsed sidebar (icon rail) ──────────────────────────────── */}
      <div
        className={`${
          sidebarOpen ? "hidden" : "hidden md:block"
        } fixed z-40 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden transition-all duration-300 shadow-xl`}
      >
        <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-violet-600 hover:to-violet-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-violet-500/50 hover:scale-110"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
          </button>

          <div className="w-10 h-10 mb-2">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="w-10 border-t border-slate-600" />

          <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
            <button
              onClick={() => setActiveView("home")}
              className="group relative p-2 md:p-3 text-cyan-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"
              title="Home"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => goTo("financial-overview")}
              className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Business Overview"
            >
              <TrendingUp className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                handleNewInvoice();
                setActiveView("invoice");
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Invoices"
            >
              <ClipboardList className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowCustomersListModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Clients"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => goTo("templates")}
              className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Templates"
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              onClick={() => goTo("reports")}
              className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Reports"
            >
              <FileBarChart className="w-5 h-5" />
            </button>

            <button
              onClick={() => goTo("analytics")}
              className="p-2 text-slate-400 hover:text-white hover:bg-violet-600/80 rounded-lg transition-all duration-200 w-10 h-10 flex items-center justify-center"
              title="Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center">
          <div className="relative group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-violet-700 shadow-lg group-hover:ring-4 group-hover:ring-violet-500/50 transition-all duration-300 overflow-hidden">
              {businessInfo?.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <Globe className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded sidebar ────────────────────────────────────────────── */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-50 w-64 md:w-72 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 h-full print:hidden shadow-2xl overflow-y-auto`}
      >
        <div className="p-4 md:p-6">
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
          <nav className="space-y-1.5 md:space-y-2">
            <div
              onClick={() => goTo("home")}
              className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-600/20 hover:to-slate-700/20 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs md:text-sm font-semibold">Home</span>
            </div>

            <div
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <NavItem
                icon={TrendingUp}
                label="Business Overview"
                onClick={() => goTo("financial-overview")}
                 active={activeView === "financial-overview"}
              />

              {/* Invoices */}
              <Accordion
                icon={ClipboardList}
                label="Invoices"
                isOpen={isInvoicesOpen}
                onToggle={() => setIsInvoicesOpen((p) => !p)}
              >
                <SubItem
                  label="Create Invoice"
                  onClick={() => {
                    handleNewInvoice();
                    setSidebarOpen(false);
                    setActiveView("invoice");
                  }}
                />
                <SubItem
                  label="All Invoices"
                  badge={savedInvoices.length}
                  onClick={() => {
                    setShowInvoicesList(!showInvoicesList);
                    setSidebarOpen(false);
                  }}
                />
              </Accordion>

              {/* Clients */}
              <Accordion
                icon={Users}
                label="Clients"
                isOpen={isClientsOpen}
                onToggle={() => setIsClientsOpen((p) => !p)}
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
                  badge={savedCustomers.length}
                  onClick={() => {
                    setShowCustomersListModal(true);
                    setSidebarOpen(false);
                  }}
                />
              </Accordion>

              <NavItem
                icon={FileText}
                label="Invoice Templates"
                onClick={() => goTo("templates")}
                className="mt-2"
              />

              <NavItem
                icon={FileBarChart}
                label="Reports"
                onClick={() => goTo("reports")}
                 active={activeView === "reports"}
              />

              <NavItem
                icon={BarChart3}
                label="Analytics"
                onClick={() => goTo("analytics")}
                 active={activeView === "analytics"}
              />
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center p-4 md:p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
              <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg group-hover:ring-4 group-hover:ring-violet-500/50 transition-all duration-300 flex items-center justify-center overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    alt="Business Logo"
                    className="max-h-[70%] max-w-[70%] object-contain"
                  />
                ) : (
                  <Globe className="w-5 h-5 text-violet-600" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent truncate">
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-700/50 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

function Accordion({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div className="mt-2">
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      <div
        className={`ml-4 space-y-1 border-l-2 border-slate-700/50 pl-4 overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
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
          <span className="text-violet-300 px-2 py-0.5 rounded-full text-xs font-semibold">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
