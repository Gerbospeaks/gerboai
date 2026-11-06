import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FileText,
  ClipboardList,
  Car,
  LogOut,
  Menu,
  Plus,
  FilePlus,
  Mail,
  Shield,
  Package,
  History,
  StickyNote,
  BarChart2,
} from "lucide-react";
import { Bot as GerboAIIcon } from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function TowingSidebar({
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
  savedJobCards,
  savedCustomers,
  showJobCardsList,
  setShowJobCardsList,
  setShowCustomersListModal,
  documentType,
  handleLogout,
  newRequestCount,
  isAdmin,
  setShowUserManagement,
}) {
  const [isJobCardsOpen, setIsJobCardsOpen] = useState(false);
  const [isCustomersOpen, setIsCustomersOpen] = useState(false);
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
  // Called as a function (not used as <Component />) so it doesn't remount
  // on every render and reset the nav scroll position / accordion animations.
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
            <img src={logo} className="w-5 h-5 object-contain" alt="logo" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {businessInfo?.businessName || "Towing"}
            </p>
            <p className="text-[10px] text-[#64748b]">Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
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
            if (isMobile) setSidebarOpen(false);
          }}
        />

        <SectionLabel>Operations</SectionLabel>

        <NavItem
          icon={TrendingUp}
          label="Towing Operations"
          onClick={() => goTo("financial-overview")}
          active={activeView === "financial-overview"}
        />
        <NavItem
          icon={GerboAIIcon}
          label="GerboAI Receptionist"
          onClick={() => goTo("gerbo-ai")}
          active={activeView === "gerbo-ai"}
        />

        {/* Job Cards */}
        <Accordion
          icon={ClipboardList}
          label="Job Cards"
          isOpen={isJobCardsOpen}
          onToggle={() => setIsJobCardsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#2563eb]"
            label="Create Quote"
            onClick={() => {
              handleNewQuote();
              goTo("invoice");
            }}
          />
          <SubItem
            dot="bg-[#059669]"
            label="Create Invoice"
            onClick={() => {
              handleNewInvoice();
              goTo("invoice");
            }}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label={`All ${documentType === "quote" ? "Estimates" : "Service Calls"}`}
            badge={savedJobCards?.length ?? 0}
            onClick={() => {
              setShowJobCardsList(!showJobCardsList);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>

        {/* Customers */}
        <Accordion
          icon={Users}
          label="Customers"
          isOpen={isCustomersOpen}
          onToggle={() => setIsCustomersOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#059669]"
            label="Add Customer"
            onClick={() => {
              handleAddNewCustomer();
              if (isMobile) setSidebarOpen(false);
            }}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="All Customers"
            badge={savedCustomers?.length ?? 0}
            badgeBg="bg-[#7c3aed]"
            onClick={() => {
              setShowCustomersListModal(true);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>

        <SectionLabel>Tools</SectionLabel>

        {/* Desktop-only items */}
        {!isMobile && (
          <>
            <NavItem
              icon={FileText}
              label="Invoice Templates"
              onClick={() => goTo("templates")}
              active={activeView === "templates"}
            />
            <NavItem
              icon={Car}
              label="Vehicles"
              onClick={() => goTo("vehicles")}
              active={activeView === "vehicles"}
            />
          </>
        )}
        <NavItem
          icon={Package}
          label="Parts Inventory"
          onClick={() => goTo("parts-inventory")}
          active={activeView === "parts-inventory"}
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
        <NavItem
          icon={Mail}
          label="Letterheads"
          onClick={() => goTo("letterheads")}
          active={activeView === "letterheads"}
        />
      </div>

      {isAdmin && (
        <div className="px-3">
          <button
            onClick={() => {
              setShowUserManagement?.(true);
              if (isMobile) setSidebarOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-xl w-full transition-all"
          >
            <Shield className="w-4 h-4" />
            Manage Team
          </button>
        </div>
      )}

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
              <Car className="w-4 h-4 text-[#64748b]" />
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

  // ── Mobile bottom nav items ───────────────────────────────────────────────
  const bottomNavItems = [
    {
      icon: Home,
      label: "Home",
      action: () => goTo("home"),
      active: activeView === "home",
    },
    {
      icon: ClipboardList,
      label: "Job Cards",
      action: () => goTo("invoice"),
      active: activeView === "invoice",
    },
    {
      icon: Plus,
      label: "New",
      action: () => {
        handleNewInvoice();
        goTo("invoice");
      },
      active: false,
      isPrimary: true,
    },
    {
      icon: FilePlus,
      label: "Quotes",
      action: () => {
        handleNewQuote();
        goTo("invoice");
      },
      active: false,
      badge: newRequestCount > 0 ? newRequestCount : null,
    },
    {
      icon: Menu,
      label: "More",
      action: () => setSidebarOpen(true),
      active: false,
    },
  ];

  // ── Desktop collapsed rail items ──────────────────────────────────────────
  const railItems = [
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
    },
    {
      icon: TrendingUp,
      title: "Towing Operations",
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
      icon: ClipboardList,
      title: "Job Cards",
      action: () => {
        handleNewInvoice();
        goTo("invoice");
      },
      active: activeView === "invoice",
    },
    {
      icon: Users,
      title: "Customers",
      action: () => setShowCustomersListModal(true),
    },
    {
      icon: FileText,
      title: "Invoice Templates",
      action: () => goTo("templates"),
      active: activeView === "templates",
    },
    {
      icon: Car,
      title: "Vehicles",
      action: () => goTo("vehicles"),
      active: activeView === "vehicles",
    },
    {
      icon: Package,
      title: "Parts Inventory",
      action: () => goTo("parts-inventory"),
      active: activeView === "parts-inventory",
    },
    {
      icon: History,
      title: "Job History",
      action: () => goTo("history-view"),
      active: activeView === "history-view",
    },
    {
      icon: StickyNote,
      title: "Notes",
      action: () => goTo("notes-view"),
      active: activeView === "notes-view",
    },
    {
      icon: BarChart2,
      title: "Reports & Analytics",
      action: () => goTo("reports"),
      active: activeView === "reports",
    },
    {
      icon: Mail,
      title: "Letterheads",
      action: () => goTo("letterheads"),
      active: activeView === "letterheads",
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
          className={`fixed inset-y-3 left-3 z-50 w-72 bg-[#151a28] rounded-3xl shadow-2xl transform transition-transform duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+0.75rem)]"
          }`}
        >
          {renderSidebarContent()}
        </div>

        {/* ── Bottom nav bar ── */}
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
                          className={`w-5 h-5 transition-colors ${
                            active ? "text-[#c8f24c]" : "text-[#64748b]"
                          }`}
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

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP — collapsed icon rail OR expanded panel
          Both float with margin and rounded corners, like a card.
      ════════════════════════════════════════════════════════════════ */}
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

            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center my-1">
              <img src={logo} className="w-6 h-6 object-contain" alt="logo" />
            </div>

            <div className="flex flex-col items-center gap-1 w-full px-2 mt-1">
              {railItems.map(({ icon: Icon, title, action, active }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                    active
                      ? "bg-[#c8f24c] text-[#151a28]"
                      : "text-[#64748b] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowUserManagement?.(true)}
                title="Manage Team"
                className="w-10 h-10 mt-1 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}

            <div className="mt-auto pb-2">
              <div className="w-9 h-9 bg-[#253347] rounded-full flex items-center justify-center ring-1 ring-[#334155] overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-5 h-5 object-contain"
                    alt="biz"
                  />
                ) : (
                  <Car className="w-4 h-4 text-[#64748b]" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 bg-[#151a28] rounded-3xl h-full shadow-xl z-30 overflow-hidden">
            {renderSidebarContent()}
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

function Accordion({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
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
