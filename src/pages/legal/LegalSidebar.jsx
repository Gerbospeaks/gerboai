import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Receipt,
  Users,
  ChevronRight,
  ChevronDown,
  Calendar,
  FileText,
  FolderOpen,
  ShoppingBag,
  Scale,
  BookOpen,
  CreditCard,
  FileBarChart,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function LegalSidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleNewInvoice,
  handleNewEstimate,
  handleNewInvoiceDoc,
  handleAddNewCustomer,
  businessInfo,
  savedInvoices,
  savedCustomers,
  showInvoicesList,
  setShowInvoicesList,
  setShowCustomersListModal,
  documentType,
  handleLogout,
}) {
  const [isInvoicingOpen, setIsInvoicingOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobile && sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

  const goTo = (view) => {
    setActiveView(view);
    if (isMobile) setSidebarOpen(false);
  };

  // ── Shared sidebar body ─────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1e2130] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0">
            <img src={logo} className="w-5 h-5 object-contain" alt="logo" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {businessInfo?.businessName || "LegalPro"}
            </p>
            <p className="text-[10px] text-[#64748b]">Management Suite</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#1e2130] rounded-lg transition-all flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <NavItem
          icon={Home}
          label="Home"
          onClick={() => goTo("home")}
          active={activeView === "home"}
        />
        <NavItem
          icon={Settings}
          label="Settings"
          onClick={() => {
            setShowSettings(true);
            if (isMobile) setSidebarOpen(false);
          }}
        />

        <SectionLabel>Finance</SectionLabel>

        <NavItem
          icon={TrendingUp}
          label="Practice Overview"
          onClick={() => goTo("financial-overview")}
          active={activeView === "financial-overview"}
        />

        {/* Cases accordion */}
        <Accordion
          icon={FolderOpen}
          label="Cases"
          isOpen={isInvoicingOpen}
          onToggle={() => setIsInvoicingOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#2563eb]"
            label="Create Estimate"
            onClick={() => {
              handleNewEstimate?.();
              goTo("invoice");
            }}
          />
          <SubItem
            dot="bg-[#059669]"
            label="Create Invoice"
            onClick={() => {
              handleNewInvoiceDoc?.();
              goTo("invoice");
            }}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label={`All ${documentType === "estimate" ? "Estimates" : "Invoices"}`}
            badge={savedInvoices?.length ?? 0}
            onClick={() => {
              setShowInvoicesList?.(!showInvoicesList);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>
         <NavItem icon={ShoppingBag} label="Purchase Orders"
  onClick={() => goTo("purchase-orders")}
  active={activeView === "purchase-orders"} />
        <SectionLabel>Clients</SectionLabel>

        {/* Clients accordion */}
        <Accordion
          icon={Users}
          label="Clients"
          isOpen={isClientsOpen}
          onToggle={() => setIsClientsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#059669]"
            label="Add Client"
            onClick={() => {
              handleAddNewCustomer?.();
              if (isMobile) setSidebarOpen(false);
            }}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="All Clients"
            badge={savedCustomers?.length ?? 0}
            badgeBg="bg-[#7c3aed]"
            onClick={() => {
              setShowCustomersListModal?.(true);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>

        <SectionLabel>Practice</SectionLabel>

        <NavItem
          icon={FileText}
          label="Invoice Templates"
          onClick={() => goTo("templates")}
          active={activeView === "templates"}
        />
        <NavItem
          icon={Scale}
          label="Court Dates"
          onClick={() => goTo("court-dates")}
          active={activeView === "court-dates"}
        />
        <NavItem
          icon={BookOpen}
          label="Legal Research"
          onClick={() => goTo("legal-research")}
          active={activeView === "legal-research"}
        />
        <NavItem
          icon={Receipt}
          label="Billing"
          onClick={() => goTo("billing")}
          active={activeView === "billing"}
        />
        <NavItem
          icon={CreditCard}
          label="Payments"
          onClick={() => goTo("payments")}
          active={activeView === "payments"}
        />
        <NavItem
          icon={FileBarChart}
          label="Reports"
          onClick={() => goTo("reports")}
          active={activeView === "reports"}
        />
        <NavItem
          icon={Calendar}
          label="Calendar"
          onClick={() => goTo("calendar")}
          active={activeView === "calendar"}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e2130] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1e2130] rounded-full flex items-center justify-center ring-1 ring-[#2d3348] flex-shrink-0 overflow-hidden">
            {businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="biz"
                className="w-5 h-5 object-contain"
              />
            ) : (
              <Scale className="w-4 h-4 text-[#3b82f6]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-[#64748b] truncate">
              {user?.email || "email@example.com"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-[#64748b] hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE — hamburger + slide-in drawer
      ════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden print:hidden">
        {/* Hamburger */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="fixed top-3 left-3 z-50 w-9 h-9 bg-[#111320] border border-[#1e2130] text-[#94a3b8] hover:text-white hover:bg-[#1e2130] rounded-lg flex items-center justify-center shadow-lg transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Dim overlay */}
        <div
          className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111320] shadow-2xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP — collapsed icon rail OR expanded panel
      ════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex print:hidden h-full">
        {/* Collapsed icon rail */}
        {!sidebarOpen && (
          <div className="flex flex-col flex-shrink-0 w-16 bg-[#111320] border-r border-[#1e2130] h-full items-center py-4 gap-2 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand"
              className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e2130] rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 bg-[#1e3a5f] rounded-lg flex items-center justify-center my-1">
              <img src={logo} className="w-6 h-6 object-contain" alt="logo" />
            </div>

            <div className="flex flex-col items-center gap-1 w-full px-2 mt-1">
              {[
                {
                  icon: Home,
                  title: "Home",
                  action: () => goTo("home"),
                  active: activeView === "home",
                },
                {
                  icon: Settings,
                  title: "Settings",
                  action: () => setShowSettings(true),
                  active: false,
                },
                {
                  icon: TrendingUp,
                  title: "Practice Overview",
                  action: () => goTo("financial-overview"),
                  active: activeView === "financial-overview",
                },
                {
                  icon: FolderOpen,
                  title: "Cases",
                  action: () => {
                    handleNewInvoice?.();
                    goTo("invoice");
                  },
                  active: activeView === "invoice",
                },
                {
                  icon: Users,
                  title: "Clients",
                  action: () => setShowCustomersListModal?.(true),
                  active: false,
                },
                {
                  icon: FileText,
                  title: "Invoice Templates",
                  action: () => goTo("templates"),
                  active: activeView === "templates",
                },
                {
                  icon: Scale,
                  title: "Court Dates",
                  action: () => goTo("court-dates"),
                  active: activeView === "court-dates",
                },
                {
                  icon: BookOpen,
                  title: "Legal Research",
                  action: () => goTo("legal-research"),
                  active: activeView === "legal-research",
                },
                {
                  icon: Receipt,
                  title: "Billing",
                  action: () => goTo("billing"),
                  active: activeView === "billing",
                },
                {
                  icon: CreditCard,
                  title: "Payments",
                  action: () => goTo("payments"),
                  active: activeView === "payments",
                },
                {
                  icon: FileBarChart,
                  title: "Reports",
                  action: () => goTo("reports"),
                  active: activeView === "reports",
                },
                {
                  icon: Calendar,
                  title: "Calendar",
                  action: () => goTo("calendar"),
                  active: activeView === "calendar",
                },
              ].map(({ icon: Icon, title, action, active }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                    active
                      ? "bg-[#1a2a4a] text-[#60a5fa]"
                      : "text-[#64748b] hover:text-white hover:bg-[#1e2130]"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-[20%] h-[60%] w-[3px] bg-[#60a5fa] rounded-r-full" />
                  )}
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="mt-auto pb-2">
              <div className="w-9 h-9 bg-[#1e2130] rounded-full flex items-center justify-center ring-1 ring-[#2d3348] overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-5 h-5 object-contain"
                    alt="biz"
                  />
                ) : (
                  <Scale className="w-4 h-4 text-[#3b82f6]" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 bg-[#111320] border-r border-[#1e2130] h-full shadow-xl z-30">
            <SidebarContent />
          </div>
        )}
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="pt-3 pb-1">
      <p className="px-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest">
        {children}
      </p>
    </div>
  );
}

function NavItem({ icon: Icon, label, onClick, active = false }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
        active
          ? "bg-[#1e2130] text-white"
          : "text-[#94a3b8] hover:bg-[#1e2130] hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function Accordion({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e2130] rounded-lg transition-all text-sm font-medium"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span>{label}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`ml-7 mt-0.5 space-y-0.5 overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SubItem({ label, dot, onClick, badge, badgeBg = "bg-[#1e3a5f]" }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-2 py-2 text-[#64748b] hover:text-white hover:bg-[#1e2130] rounded-lg cursor-pointer transition-all text-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        {dot && (
          <div className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
        )}
        <span className="truncate">{label}</span>
      </div>
      {badge != null && (
        <span
          className={`${badgeBg} text-white text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ml-2`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
