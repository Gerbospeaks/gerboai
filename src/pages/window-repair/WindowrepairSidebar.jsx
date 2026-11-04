import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Receipt,
  FileText,
  Calendar,
  BarChart2,
  History,
  StickyNote,
  Grid3x3,
  LogOut,
  Menu,
  Plus,
  Store,
  Wrench,
  Package,
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
  newRequestCount,
}) {
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen] = useState(
    ["projects", "work-orders", "materials"].includes(activeView),
  );
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
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-blue-700/50 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10">
            <Grid3x3 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {businessInfo?.businessName || "Window Repair"}
            </p>
            <p className="text-[10px] text-blue-400">Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
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
          isOpen={isQuotesOpen}
          onToggle={() => setIsQuotesOpen((p) => !p)}
        >
          <SubItem
            dot="bg-blue-500"
            label="Create Quote"
            onClick={() => {
              handleNewQuote();
              goTo("quote");
            }}
          />
          <SubItem
            dot="bg-emerald-500"
            label="Create Invoice"
            onClick={() => {
              handleNewInvoice();
              goTo("quote");
            }}
          />
          <SubItem
            dot="bg-indigo-500"
            label={`All ${documentType === "quote" ? "Quotes" : "Invoices"}`}
            badge={savedQuotes?.length ?? 0}
            onClick={() => {
              setShowQuotesList(!showQuotesList);
              if (isMobile) setSidebarOpen(false);
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
            dot="bg-emerald-500"
            label="Add Client"
            onClick={() => {
              handleAddNewCustomer();
              if (isMobile) setSidebarOpen(false);
            }}
          />
          <SubItem
            dot="bg-pink-500"
            label="All Clients"
            badge={savedCustomers?.length ?? 0}
            badgeBg="bg-pink-600"
            onClick={() => {
              setShowCustomersListModal(true);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>

        <SectionLabel>Operations</SectionLabel>

        {/* Jobs & Installations */}
        <Accordion
          icon={Wrench}
          label="Jobs & Installations"
          isOpen={isJobsOpen}
          onToggle={() => setIsJobsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-sky-400"
            label="Active Jobs"
            onClick={() => goTo("projects")}
          />
          <SubItem
            dot="bg-orange-400"
            label="Work Orders"
            onClick={() => goTo("work-orders")}
          />
          <SubItem
            dot="bg-cyan-400"
            label="Glass & Materials"
            onClick={() => goTo("materials")}
          />
        </Accordion>

        <NavItem
          icon={Package}
          label="Inventory & Stock"
          onClick={() => goTo("inventory")}
          active={activeView === "inventory"}
        />
        <NavItem
          icon={Calendar}
          label="Schedule"
          onClick={() => goTo("schedule")}
          active={activeView === "schedule"}
        />

        <SectionLabel>Tools</SectionLabel>

        <NavItem
          icon={FileText}
          label="Invoice Templates"
          onClick={() => goTo("templates")}
          active={activeView === "templates"}
        />
        <NavItem
          icon={History}
          label="Job History"
          onClick={() => goTo("history-view")}
          active={activeView === "history-view"}
        />
        <NavItem
          icon={StickyNote}
          label="Notes"
          onClick={() => goTo("notes-view")}
          active={activeView === "notes-view"}
        />
        <NavItem
          icon={BarChart2}
          label="Reports & Analytics"
          onClick={() => goTo("reports")}
          active={activeView === "reports"}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-blue-700/50 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700/60 rounded-full flex items-center justify-center ring-1 ring-blue-600 flex-shrink-0 overflow-hidden">
            {businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="logo"
                className="w-5 h-5 object-contain"
              />
            ) : (
              <Grid3x3 className="w-4 h-4 text-blue-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-blue-400 truncate">
              {user?.email || "email@example.com"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Mobile bottom nav items ───────────────────────────────────────────────
  const bottomNavItems = [
    {
      icon: Home,
      label: "Home",
      action: () => goTo("home"),
      active: activeView === "home",
    },
    {
      icon: Receipt,
      label: "Quotes",
      action: () => goTo("quote"),
      active: activeView === "quote",
    },
    {
      icon: Plus,
      label: "New",
      action: () => {
        handleNewInvoice();
        goTo("quote");
      },
      active: false,
      isPrimary: true,
    },
    {
      icon: Store,
      label: "Requests",
      action: () => goTo("incoming-requests"),
      active: activeView === "incoming-requests",
      badge: newRequestCount > 0 ? newRequestCount : null,
    },
    {
      icon: Menu,
      label: "More",
      action: () => setSidebarOpen(true),
      active: false,
    },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE — bottom nav bar + slide-in drawer
      ════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden print:hidden">
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
          className={`fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </div>

        {/* ── Bottom nav bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-blue-900 border-t border-blue-700/50">
          <div className="flex items-center justify-around px-2 py-1 pb-safe">
            {bottomNavItems.map(
              ({ icon: Icon, label, action, active, badge, isPrimary }) =>
                isPrimary ? (
                  <button
                    key={label}
                    onClick={action}
                    className="flex flex-col items-center justify-center -mt-5"
                  >
                    <div className="w-14 h-14 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-blue-900 transition-all active:scale-95">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] text-blue-400 font-semibold mt-0.5">
                      {label}
                    </span>
                  </button>
                ) : (
                  <button
                    key={label}
                    onClick={action}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[56px]"
                  >
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      {active && (
                        <span className="absolute inset-0 bg-blue-500/10 rounded-lg" />
                      )}
                      <div className="relative">
                        <Icon
                          className={`w-5 h-5 transition-colors ${
                            active ? "text-blue-400" : "text-blue-300/50"
                          }`}
                        />
                        {badge != null && (
                          <span className="absolute -top-1.5 -right-2 bg-[#2563eb] text-white text-[9px] font-bold px-1 py-px rounded-full leading-none">
                            {badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium transition-colors ${
                        active ? "text-blue-400" : "text-blue-300/50"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                ),
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP — collapsed icon rail OR expanded panel
      ════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex print:hidden h-full">
        {/* Collapsed icon rail */}
        {!sidebarOpen && (
          <div className="flex flex-col flex-shrink-0 w-16 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 border-r border-blue-700/50 h-full items-center py-4 gap-2 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand"
              className="p-2 text-blue-400 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 rounded-lg flex items-center justify-center my-1 bg-white/10">
              <Grid3x3 className="w-5 h-5 text-white" />
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
                    handleNewInvoice();
                    goTo("quote");
                  },
                },
                {
                  icon: Users,
                  title: "Clients",
                  action: () => setShowCustomersListModal(true),
                },
                {
                  icon: Wrench,
                  title: "Jobs & Installations",
                  action: () => goTo("projects"),
                },
                {
                  icon: Package,
                  title: "Inventory & Stock",
                  action: () => goTo("inventory"),
                },
                {
                  icon: Calendar,
                  title: "Schedule",
                  action: () => goTo("schedule"),
                },
                {
                  icon: FileText,
                  title: "Invoice Templates",
                  action: () => goTo("templates"),
                },
                {
                  icon: History,
                  title: "Job History",
                  action: () => goTo("history-view"),
                },
                {
                  icon: StickyNote,
                  title: "Notes",
                  action: () => goTo("notes-view"),
                },
                {
                  icon: BarChart2,
                  title: "Reports & Analytics",
                  action: () => goTo("reports"),
                },
              ].map(({ icon: Icon, title, action }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className="w-10 h-10 flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="mt-auto pb-2">
              <div className="w-9 h-9 bg-blue-700/60 rounded-full flex items-center justify-center ring-1 ring-blue-600 overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-5 h-5 object-contain"
                    alt="biz"
                  />
                ) : (
                  <Grid3x3 className="w-4 h-4 text-blue-300" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 border-r border-blue-700/50 h-full shadow-xl z-30">
            <SidebarContent />
          </div>
        )}
      </div>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="pt-3 pb-1">
      <p className="px-3 text-[10px] font-bold text-blue-500/70 uppercase tracking-widest">
        {children}
      </p>
    </div>
  );
}

function NavItem({ icon: Icon, label, onClick, active = false, badge = null }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
        active
          ? "bg-blue-700/60 text-white"
          : "text-blue-300 hover:bg-blue-700/40 hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate flex-1">{label}</span>
      {badge != null && (
        <span className="bg-[#2563eb] text-white text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
}

function Accordion({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-blue-300 hover:text-white hover:bg-blue-700/40 rounded-lg transition-all text-sm font-medium"
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
          isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SubItem({ label, dot, onClick, badge, badgeBg = "bg-indigo-600" }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-2 py-2 text-blue-400 hover:text-white hover:bg-blue-700/40 rounded-lg cursor-pointer transition-all text-sm"
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
