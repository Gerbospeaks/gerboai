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
  Sparkles,
  Star,
  Menu,
  X,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function CleaningSidebar({
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
}) {
  const [isQuotesInvoicesOpen, setIsQuotesInvoicesOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen] = useState(false);
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

  // ── Shared sidebar body ───────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#253347] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <img src={logo} className="w-5 h-5 object-contain" alt="logo" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {businessInfo?.businessName || "Cleaning Co."}
            </p>
            <p className="text-[10px] text-[#64748b]">Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#253347] rounded-lg transition-all flex-shrink-0"
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
          label="Financial Dashboard"
          onClick={() => goTo("financial-overview")}
          active={activeView === "financial-overview"}
        />

        {/* Quotes & Invoices */}
        <Accordion
          icon={Receipt}
          label="Quotes & Invoices"
          isOpen={isQuotesInvoicesOpen}
          onToggle={() => setIsQuotesInvoicesOpen?.((p) => !p)}
        >
          <SubItem
            dot="bg-[#2563eb]"
            label="Create Quote"
            onClick={() => {
              handleNewQuote?.();
              goTo("quote");
            }}
          />
          <SubItem
            dot="bg-[#059669]"
            label="Create Invoice"
            onClick={() => {
              handleNewInvoice?.();
              goTo("quote");
            }}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label={`All ${documentType === "quote" ? "Quotes" : "Invoices"}`}
            badge={savedQuotes?.length ?? 0}
            onClick={() => {
              setShowQuotesList(!showQuotesList);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>

        <SectionLabel>Operations</SectionLabel>

        {/* Cleaning Jobs */}
        <Accordion
          icon={Sparkles}
          label="Cleaning Jobs"
          isOpen={isJobsOpen}
          onToggle={() => setIsJobsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#0891b2]"
            label="Active Jobs"
            onClick={() => goTo("jobs")}
          />
          <SubItem
            dot="bg-[#0d9488]"
            label="Job Checklists"
            onClick={() => goTo("checklists")}
          />
          <SubItem
            dot="bg-[#059669]"
            label="Service Areas"
            onClick={() => goTo("service-areas")}
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

        <SectionLabel>Tools</SectionLabel>

        <NavItem
          icon={Star}
          label="Reviews"
          onClick={() => goTo("reviews")}
          active={activeView === "reviews"}
        />
        <NavItem
          icon={Calendar}
          label="Schedule"
          onClick={() => goTo("schedule")}
          active={activeView === "schedule"}
        />
        <NavItem
          icon={BarChart3}
          label="Reports"
          onClick={() => goTo("reports")}
          active={activeView === "reports"}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-[#253347] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#253347] rounded-full flex items-center justify-center ring-1 ring-[#334155] flex-shrink-0 overflow-hidden">
            {businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="biz"
                className="w-5 h-5 object-contain"
              />
            ) : (
              <div className="w-4 h-4 bg-[#0891b2] rounded-full" />
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
            className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#253347] rounded-lg transition-all flex-shrink-0"
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
            className="fixed top-3 left-3 z-50 w-9 h-9 bg-[#1a2332] border border-[#253347] text-[#94a3b8] hover:text-white hover:bg-[#253347] rounded-lg flex items-center justify-center shadow-lg transition-all"
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
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1a2332] shadow-2xl transform transition-transform duration-300 ease-in-out ${
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
          <div className="flex flex-col flex-shrink-0 w-16 bg-[#1a2332] border-r border-[#253347] h-full items-center py-4 gap-2 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand"
              className="p-2 text-[#64748b] hover:text-white hover:bg-[#253347] rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 bg-[#253347] rounded-lg flex items-center justify-center my-1">
              <img src={logo} className="w-6 h-6 object-contain" alt="logo" />
            </div>

            <div className="flex flex-col items-center gap-1 w-full px-2 mt-1">
              {[
                { icon: Home, title: "Home", action: () => goTo("home") },
                {
                  icon: Settings,
                  title: "Settings",
                  action: () => setShowSettings(true),
                },
                {
                  icon: TrendingUp,
                  title: "Financial Dashboard",
                  action: () => goTo("financial-overview"),
                },
                {
                  icon: Receipt,
                  title: "Quotes & Invoices",
                  action: () => {
                    handleNewInvoice?.();
                    goTo("quote");
                  },
                },
                {
                  icon: Sparkles,
                  title: "Cleaning Jobs",
                  action: () => goTo("jobs"),
                },
                {
                  icon: Users,
                  title: "Clients",
                  action: () => setShowCustomersListModal?.(true),
                },
                {
                  icon: Calendar,
                  title: "Schedule",
                  action: () => goTo("schedule"),
                },
              ].map(({ icon: Icon, title, action }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className="w-10 h-10 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#253347] rounded-lg transition-all"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="mt-auto pb-2">
              <div className="w-9 h-9 bg-[#253347] rounded-full flex items-center justify-center ring-1 ring-[#334155] overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-5 h-5 object-contain"
                    alt="biz"
                  />
                ) : (
                  <div className="w-4 h-4 bg-[#0891b2] rounded-full" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 bg-[#1a2332] border-r border-[#253347] h-full shadow-xl z-30">
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
          ? "bg-[#253347] text-white"
          : "text-[#94a3b8] hover:bg-[#253347] hover:text-white"
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
        className="w-full flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#253347] rounded-lg transition-all text-sm font-medium"
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

function SubItem({ label, dot, onClick, badge, badgeBg = "bg-[#2563eb]" }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-2 py-2 text-[#64748b] hover:text-white hover:bg-[#253347] rounded-lg cursor-pointer transition-all text-sm"
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
