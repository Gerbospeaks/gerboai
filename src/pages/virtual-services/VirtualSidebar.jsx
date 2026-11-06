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
  FileBarChart,
  BarChart3,
  Globe,
  LogOut,
  ShoppingBag,
  Briefcase,
  Calendar,
  Package,
  StickyNote,
  History,
  Inbox,
  Menu,
  Plus,
} from "lucide-react";
import { Bot as GerboAIIcon } from "lucide-react";
import logo from "../../assets/img/solidflo-logo.png";

/**
 * VirtualSidebar – navigation for online / virtual service businesses.
 * Styled to match MechanicsSidebar: floating rounded navy card, lime accent,
 * mobile bottom nav + slide-in drawer, desktop icon rail / expanded panel.
 *
 * View ids are unchanged so HomeView / AppHeader keep working.
 *
 * NOTE: like MechanicsSidebar, this renders in normal flow (not `fixed`),
 * so place it inside a flex row with the main content, e.g.
 *   <div className="flex h-screen"> <VirtualSidebar .../> <main className="flex-1" /> </div>
 */
export default function VirtualSidebar({
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleNewInvoice,
  handleNewQuote,
  handleLogout,
  businessInfo,
  savedInvoices = [],
  savedQuotes = [],
  savedCustomers = [],
  openDocumentsList, // (type: "quote" | "invoice") => void
  setShowCustomersListModal,
  handleAddNewCustomer,
  newRequestCount = 0,
}) {
  const [openGroup, setOpenGroup] = useState(null); // one accordion open at a time
  const toggle = (g) => setOpenGroup((p) => (p === g ? null : g));
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobile && sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

  const closeOnMobile = () => {
    if (isMobile) setSidebarOpen(false);
  };
  const goTo = (view) => {
    setActiveView(view);
    closeOnMobile();
  };

  const isBuilder = activeView === "invoice" || activeView === "quote";
  const isEngagement = ["projects", "work-orders", "materials"].includes(
    activeView,
  );

  // ── Shared sidebar body (called as a function, not a component, so it
  //    doesn't remount and lose scroll position on every render) ───────────
  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
            <img src={logo} className="w-5 h-5 object-contain" alt="logo" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {businessInfo?.businessName || "Virtual Services"}
            </p>
            <p className="text-[10px] text-[#64748b]">Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          title="Collapse Sidebar"
          className="p-1.5 text-[#64748b] hover:text-white hover:bg-white/5 rounded-lg transition-all flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
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
            closeOnMobile();
          }}
        />

        {/* Finance */}
        <SectionLabel>Finance</SectionLabel>
        <NavItem
          icon={TrendingUp}
          label="Business Overview"
          onClick={() => goTo("financial-overview")}
          active={activeView === "financial-overview"}
        />
        <NavItem
          icon={GerboAIIcon}
          label="GerboAI Receptionist"
          onClick={() => goTo("gerbo-ai")}
          active={activeView === "gerbo-ai"}
        />

        <Accordion
          icon={Receipt}
          label="Quotes & Invoices"
          isOpen={openGroup === "docs"}
          onToggle={() => toggle("docs")}
          active={isBuilder}
        >
          <SubItem
            dot="bg-[#2563eb]"
            label="Create Quote"
            onClick={() => {
              handleNewQuote?.();
              goTo("invoice");
            }}
          />
          <SubItem
            dot="bg-[#059669]"
            label="Create Invoice"
            onClick={() => {
              handleNewInvoice?.();
              goTo("invoice");
            }}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label="All Quotes"
            badge={savedQuotes.length}
            badgeBg="bg-[#7c3aed]"
            onClick={() => {
              openDocumentsList?.("quote");
              closeOnMobile();
            }}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label="All Invoices"
            badge={savedInvoices.length}
            badgeBg="bg-[#7c3aed]"
            onClick={() => {
              openDocumentsList?.("invoice");
              closeOnMobile();
            }}
          />
        </Accordion>

        <NavItem
          icon={ShoppingBag}
          label="Purchase Orders"
          onClick={() => goTo("purchase-orders")}
          active={activeView === "purchase-orders"}
        />
        <NavItem
          icon={FileText}
          label="Invoice Templates"
          onClick={() => goTo("templates")}
          active={activeView === "templates"}
        />

        {/* Operations */}
        <SectionLabel>Operations</SectionLabel>
        <Accordion
          icon={Briefcase}
          label="Engagements"
          isOpen={openGroup === "work"}
          onToggle={() => toggle("work")}
          active={isEngagement}
        >
          <SubItem
            dot="bg-[#2563eb]"
            label="Active Engagements"
            onClick={() => goTo("projects")}
          />
          <SubItem
            dot="bg-[#059669]"
            label="Tasks & Deliverables"
            onClick={() => goTo("work-orders")}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label="Resources & Assets"
            onClick={() => goTo("materials")}
          />
        </Accordion>
        <NavItem
          icon={Calendar}
          label="Schedule"
          onClick={() => goTo("schedule")}
          active={activeView === "schedule"}
        />

        <Accordion
          icon={Users}
          label="Clients"
          isOpen={openGroup === "clients"}
          onToggle={() => toggle("clients")}
        >
          <SubItem
            dot="bg-[#059669]"
            label="Add Client"
            onClick={() => {
              handleAddNewCustomer?.();
              closeOnMobile();
            }}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="All Clients"
            badge={savedCustomers.length}
            badgeBg="bg-[#7c3aed]"
            onClick={() => {
              setShowCustomersListModal?.(true);
              closeOnMobile();
            }}
          />
        </Accordion>

        {/* Tools */}
        <SectionLabel>Tools</SectionLabel>
        <NavItem
          icon={Package}
          label="Service Catalogue"
          onClick={() => goTo("inventory")}
          active={activeView === "inventory"}
        />
        <NavItem
          icon={StickyNote}
          label="Notes"
          onClick={() => goTo("notes-view")}
          active={activeView === "notes-view"}
        />
        <NavItem
          icon={History}
          label="History"
          onClick={() => goTo("history-view")}
          active={activeView === "history-view"}
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

        {/* Network */}
        <SectionLabel>Network</SectionLabel>
        <NavItem
          icon={Inbox}
          label="Incoming Requests"
          onClick={() => goTo("incoming-requests")}
          active={activeView === "incoming-requests"}
          badge={newRequestCount > 0 ? newRequestCount : null}
        />
      </div>

      {/* Footer */}
      <div className="px-3 pt-3 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-3 py-3">
          <div className="w-8 h-8 bg-[#253347] rounded-full flex items-center justify-center ring-1 ring-[#334155] flex-shrink-0 overflow-hidden">
            {businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="logo"
                className="w-5 h-5 object-contain"
              />
            ) : (
              <Globe className="w-4 h-4 text-[#64748b]" />
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
            className="p-1.5 text-[#64748b] hover:text-white hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Desktop collapsed rail entries ────────────────────────────────────────
  const rail = [
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
      title: "Business Overview",
      action: () => goTo("financial-overview"),
      active: activeView === "financial-overview",
    },
    {
      icon: GerboAIIcon,
      title: "GerboAI Receptionist",
      action: () => goTo("gerbo-ai"),
      active: activeView === "gerbo-ai",
    },
    {
      icon: Receipt,
      title: "Quotes & Invoices",
      action: () => {
        handleNewInvoice?.();
        goTo("invoice");
      },
      active: isBuilder,
    },
    {
      icon: ShoppingBag,
      title: "Purchase Orders",
      action: () => goTo("purchase-orders"),
      active: activeView === "purchase-orders",
    },
    {
      icon: Briefcase,
      title: "Engagements",
      action: () => goTo("projects"),
      active: isEngagement,
    },
    {
      icon: Calendar,
      title: "Schedule",
      action: () => goTo("schedule"),
      active: activeView === "schedule",
    },
    {
      icon: Users,
      title: "Clients",
      action: () => setShowCustomersListModal?.(true),
      active: false,
    },
    {
      icon: Package,
      title: "Service Catalogue",
      action: () => goTo("inventory"),
      active: activeView === "inventory",
    },
    {
      icon: StickyNote,
      title: "Notes",
      action: () => goTo("notes-view"),
      active: activeView === "notes-view",
    },
    {
      icon: FileBarChart,
      title: "Reports",
      action: () => goTo("reports"),
      active: activeView === "reports",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      action: () => goTo("analytics"),
      active: activeView === "analytics",
    },
    {
      icon: Inbox,
      title: "Incoming Requests",
      action: () => goTo("incoming-requests"),
      active: activeView === "incoming-requests",
      badge: newRequestCount > 0 ? newRequestCount : null,
    },
  ];

  // ── Mobile bottom nav ─────────────────────────────────────────────────────
  const bottomNavItems = [
    {
      icon: Home,
      label: "Home",
      action: () => goTo("home"),
      active: activeView === "home",
    },
    {
      icon: Receipt,
      label: "Invoices",
      action: () => {
        openDocumentsList?.("invoice");
      },
      active: isBuilder,
    },
    {
      icon: Plus,
      label: "New",
      action: () => {
        handleNewInvoice?.();
        goTo("invoice");
      },
      active: false,
      isPrimary: true,
    },
    {
      icon: Inbox,
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
      {/* ═══ MOBILE — bottom nav bar + slide-in drawer ═══ */}
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
          className={`fixed inset-y-3 left-3 z-50 w-72 bg-[#151a28] rounded-3xl shadow-2xl transform transition-transform duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+0.75rem)]"
          }`}
        >
          {renderContent()}
        </div>

        {/* Bottom nav bar */}
        <div className="fixed bottom-3 left-3 right-3 z-40 bg-[#151a28] rounded-3xl shadow-2xl">
          <div className="flex items-center justify-around px-2 py-1 pb-safe">
            {bottomNavItems.map(
              ({ icon: Icon, label, action, active, badge, isPrimary }) =>
                isPrimary ? (
                  <button
                    key={label}
                    onClick={action}
                    className="flex flex-col items-center justify-center -mt-5"
                  >
                    <div className="w-14 h-14 bg-[#c8f24c] hover:bg-[#bce83a] rounded-full flex items-center justify-center shadow-lg shadow-[#c8f24c]/30 border-4 border-[#151a28] transition-all active:scale-95">
                      <Icon className="w-6 h-6 text-[#151a28]" />
                    </div>
                    <span className="text-[10px] text-[#c8f24c] font-semibold mt-0.5">
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
                        <span className="absolute inset-0 bg-[#c8f24c]/10 rounded-lg" />
                      )}
                      <div className="relative">
                        <Icon
                          className={`w-5 h-5 transition-colors ${active ? "text-[#c8f24c]" : "text-[#64748b]"}`}
                        />
                        {badge != null && (
                          <span className="absolute -top-1.5 -right-2 bg-[#c8f24c] text-[#151a28] text-[9px] font-bold px-1 py-px rounded-full leading-none">
                            {badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium transition-colors ${
                        active ? "text-[#c8f24c]" : "text-[#64748b]"
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

      {/* ═══ DESKTOP — collapsed icon rail OR expanded panel (floating cards) ═══ */}
      <div className="hidden md:flex print:hidden h-full py-3 pl-3">
        {/* Collapsed icon rail */}
        {!sidebarOpen && (
          <div className="flex flex-col flex-shrink-0 w-16 bg-[#151a28] rounded-3xl h-full items-center py-4 gap-2 z-30 shadow-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand"
              className="p-2 text-[#64748b] hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center my-1 flex-shrink-0">
              <img src={logo} className="w-6 h-6 object-contain" alt="logo" />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-1 w-full px-2 mt-1">
              {rail.map(({ icon: Icon, title, action, active, badge }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className={`relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all ${
                    active
                      ? "bg-[#c8f24c] text-[#151a28]"
                      : "text-[#64748b] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {badge != null && (
                    <span className="absolute -top-1 -right-1 bg-[#c8f24c] text-[#151a28] text-[9px] font-bold px-1 py-px rounded-full leading-none ring-2 ring-[#151a28]">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 pb-2 flex-shrink-0">
              <div className="w-9 h-9 bg-[#253347] rounded-full flex items-center justify-center ring-1 ring-[#334155] overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-5 h-5 object-contain"
                    alt="biz"
                  />
                ) : (
                  <Globe className="w-4 h-4 text-[#64748b]" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 bg-[#151a28] rounded-3xl h-full shadow-xl z-30 overflow-hidden">
            {renderContent()}
          </div>
        )}
      </div>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="pt-3 pb-1">
      <p className="px-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest">
        {children}
      </p>
    </div>
  );
}

function NavItem({ icon: Icon, label, onClick, active = false, badge = null }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
        active
          ? "bg-[#c8f24c] text-[#151a28]"
          : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate flex-1">{label}</span>
      {badge != null && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
            active
              ? "bg-[#151a28] text-[#c8f24c]"
              : "bg-[#c8f24c] text-[#151a28]"
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function Accordion({
  icon: Icon,
  label,
  isOpen,
  onToggle,
  children,
  active = false,
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
          active
            ? "bg-white/5 text-white"
            : "text-[#94a3b8] hover:text-white hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#c8f24c]" : ""}`}
          />
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

function SubItem({ label, dot, onClick, badge, badgeBg = "bg-[#2563eb]" }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-2 py-2 text-[#64748b] hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all text-sm"
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
