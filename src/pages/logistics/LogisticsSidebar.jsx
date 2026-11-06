import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronDown,
  Calendar,
  ShoppingBag,
  LogOut,
  ClipboardList,
  FileText,
  FileBarChart,
  MapPin,
  Receipt,
  CreditCard,
  Truck,
  Package,
  BarChart3,
  Navigation,
  Warehouse,
  Menu,
  X,
  Store,
} from "lucide-react";
import { Bot as GerboAIIcon } from "lucide-react";
import logo from "../../assets/img/logo.png";
import { Plus } from "lucide-react";

export default function LogisticsSidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleNewWaybill,
  handleLogout,
  businessInfo,
  savedWaybills,
  savedCustomers,
  showWaybillsList,
  setShowWaybillsList,
  setShowCustomersListModal,
  handleAddNewCustomer,
  setShowInTransitModal,
  newRequestCount,
}) {
  const [isWaybillsOpen, setIsWaybillsOpen] = useState(false);
  const [isCustomersOpen, setIsCustomersOpen] = useState(false);
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
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
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a2535] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#1d4ed8] rounded-lg flex items-center justify-center flex-shrink-0">
            <img src={logo} className="w-5 h-5 object-contain" alt="logo" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {businessInfo?.businessName || "LogisticsPro"}
            </p>
            <p className="text-[10px] text-[#64748b]">Management Suite</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#1a2535] rounded-lg transition-all flex-shrink-0"
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

        {/* Waybills accordion */}
        <Accordion
          icon={ClipboardList}
          label="Waybills"
          isOpen={isWaybillsOpen}
          onToggle={() => setIsWaybillsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#2563eb]"
            label="Create Waybill"
            onClick={() => {
              handleNewWaybill?.();
              goTo("invoice");
            }}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label="All Waybills"
            badge={savedWaybills?.length ?? 0}
            onClick={() => {
              setShowWaybillsList?.((p) => !p);
              if (isMobile) setSidebarOpen(false);
            }}
          />
          <SubItem
            dot="bg-[#d97706]"
            label="In Transit"
            badge={0}
            badgeBg="bg-[#d97706]"
            onClick={() => {
              setShowInTransitModal?.(true);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>

        {/* Invoices accordion */}
        <Accordion
          icon={Receipt}
          label="Invoices"
          isOpen={isInvoicesOpen}
          onToggle={() => setIsInvoicesOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#2563eb]"
            label="Create Invoice"
            onClick={() => goTo("invoice-new")}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label="All Invoices"
            onClick={() => goTo("invoices-all")}
          />
          <SubItem
            dot="bg-[#dc2626]"
            label="Overdue"
            badge={0}
            badgeBg="bg-[#dc2626]"
            onClick={() => goTo("invoices-overdue")}
          />
        </Accordion>
        <NavItem
          icon={ShoppingBag}
          label="Purchase Orders"
          onClick={() => goTo("purchase-orders")}
          active={activeView === "purchase-orders"}
        />
        <SectionLabel>Customers</SectionLabel>

        {/* Customers accordion */}
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
              handleAddNewCustomer?.();
              if (isMobile) setSidebarOpen(false);
            }}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="All Customers"
            badge={savedCustomers?.length ?? 0}
            badgeBg="bg-[#7c3aed]"
            onClick={() => {
              setShowCustomersListModal?.(true);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>

        <SectionLabel>Operations</SectionLabel>

        <NavItem
          icon={FileText}
          label="Invoice Templates"
          onClick={() => goTo("templates")}
          active={activeView === "templates"}
        />
        <NavItem
          icon={Truck}
          label="Fleet"
          onClick={() => goTo("fleet")}
          active={activeView === "fleet"}
        />
        <NavItem
          icon={MapPin}
          label="Tracking"
          onClick={() => goTo("tracking")}
          active={activeView === "tracking"}
        />
        <NavItem
          icon={Calendar}
          label="Schedule"
          onClick={() => goTo("schedule")}
          active={activeView === "schedule"}
        />
        <NavItem
          icon={Warehouse}
          label="Warehouse"
          onClick={() => goTo("warehouse")}
          active={activeView === "warehouse"}
        />
        <NavItem
          icon={Package}
          label="Cargo"
          onClick={() => goTo("cargo")}
          active={activeView === "cargo"}
        />
        <NavItem
          icon={Navigation}
          label="Route Planner"
          onClick={() => goTo("routes")}
          active={activeView === "routes"}
        />

        {/* Payments accordion */}
        <Accordion
          icon={CreditCard}
          label="Payments"
          isOpen={isPaymentsOpen}
          onToggle={() => setIsPaymentsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#0891b2]"
            label="Process Payment"
            onClick={() => goTo("payment-process")}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="Payment History"
            onClick={() => goTo("payment-history")}
          />
        </Accordion>

        <SectionLabel>Insights</SectionLabel>

        {/* Reports accordion */}
        <Accordion
          icon={FileBarChart}
          label="Reports"
          isOpen={isReportsOpen}
          onToggle={() => setIsReportsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#4f46e5]"
            label="Delivery Reports"
            onClick={() => goTo("report-delivery")}
          />
          <SubItem
            dot="bg-[#0891b2]"
            label="Revenue Reports"
            onClick={() => goTo("report-revenue")}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="Fleet Reports"
            onClick={() => goTo("report-fleet")}
          />
        </Accordion>

        <NavItem
          icon={BarChart3}
          label="Analytics"
          onClick={() => goTo("analytics")}
          active={activeView === "analytics"}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-[#1a2535] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a2535] rounded-full flex items-center justify-center ring-1 ring-[#2d3d52] flex-shrink-0 overflow-hidden">
            {businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="biz"
                className="w-5 h-5 object-contain"
              />
            ) : (
              <Truck className="w-4 h-4 text-[#3b82f6]" />
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

  // ── Mobile bottom nav items ─────────────────────────────────────────────────
  const bottomNavItems = [
    {
      icon: Home,
      label: "Home",
      action: () => goTo("home"),
      active: activeView === "home",
    },
    {
      icon: ClipboardList,
      label: "Waybills",
      action: () => goTo("invoice"),
      active: activeView === "invoice",
    },
    {
      icon: Plus,
      label: "New",
      action: () => {
        handleNewWaybill?.();
        goTo("invoice");
      },
      active: false,
      isPrimary: true,
    },
    {
      icon: Store,
      label: "Services",
      action: () => goTo("marketplace"),
      active: activeView === "marketplace",
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
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0d1520] shadow-2xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </div>

        {/* ── Bottom nav bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1520] border-t border-[#1a2535]">
          <div className="flex items-center justify-around px-2 py-1 pb-safe">
            {bottomNavItems.map(
              ({ icon: Icon, label, action, active, badge, isPrimary }) =>
                isPrimary ? (
                  <button
                    key={label}
                    onClick={action}
                    className="flex flex-col items-center justify-center -mt-5"
                  >
                    <div className="w-14 h-14 bg-[#1d4ed8] hover:bg-[#1e40af] rounded-full flex items-center justify-center shadow-lg shadow-[#1d4ed8]/30 border-4 border-[#0d1520] transition-all active:scale-95">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] text-[#60a5fa] font-semibold mt-0.5">
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
                        <span className="absolute inset-0 bg-[#1d4ed8]/10 rounded-lg" />
                      )}
                      <div className="relative">
                        <Icon
                          className={`w-5 h-5 transition-colors ${
                            active ? "text-[#60a5fa]" : "text-[#64748b]"
                          }`}
                        />
                        {badge != null && (
                          <span className="absolute -top-1.5 -right-2 bg-[#1d4ed8] text-white text-[9px] font-bold px-1 py-px rounded-full leading-none">
                            {badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium transition-colors ${
                        active ? "text-[#60a5fa]" : "text-[#64748b]"
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
          <div className="flex flex-col flex-shrink-0 w-16 bg-[#0d1520] border-r border-[#1a2535] h-full items-center py-4 gap-2 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand"
              className="p-2 text-[#64748b] hover:text-white hover:bg-[#1a2535] rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center my-1">
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
                  icon: ClipboardList,
                  title: "Waybills",
                  action: () => {
                    handleNewWaybill?.();
                    goTo("invoice");
                  },
                  active: activeView === "invoice",
                },
                {
                  icon: Receipt,
                  title: "Invoices",
                  action: () => goTo("invoices-all"),
                  active: activeView === "invoices-all",
                },
                {
                  icon: Users,
                  title: "Customers",
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
                  icon: Truck,
                  title: "Fleet",
                  action: () => goTo("fleet"),
                  active: activeView === "fleet",
                },
                {
                  icon: MapPin,
                  title: "Tracking",
                  action: () => goTo("tracking"),
                  active: activeView === "tracking",
                },
                {
                  icon: Calendar,
                  title: "Schedule",
                  action: () => goTo("schedule"),
                  active: activeView === "schedule",
                },
                {
                  icon: Warehouse,
                  title: "Warehouse",
                  action: () => goTo("warehouse"),
                  active: activeView === "warehouse",
                },
                {
                  icon: Package,
                  title: "Cargo",
                  action: () => goTo("cargo"),
                  active: activeView === "cargo",
                },
                {
                  icon: Navigation,
                  title: "Route Planner",
                  action: () => goTo("routes"),
                  active: activeView === "routes",
                },
                {
                  icon: CreditCard,
                  title: "Payments",
                  action: () => goTo("payment-process"),
                  active: activeView === "payment-process",
                },
                {
                  icon: FileBarChart,
                  title: "Reports",
                  action: () => goTo("report-delivery"),
                  active: false,
                },
                {
                  icon: BarChart3,
                  title: "Analytics",
                  action: () => goTo("analytics"),
                  active: activeView === "analytics",
                },
              ].map(({ icon: Icon, title, action, active }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                    active
                      ? "bg-[#1e3a6e] text-[#60a5fa]"
                      : "text-[#64748b] hover:text-white hover:bg-[#1a2535]"
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
              <div className="w-9 h-9 bg-[#1a2535] rounded-full flex items-center justify-center ring-1 ring-[#2d3d52] overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-5 h-5 object-contain"
                    alt="biz"
                  />
                ) : (
                  <Truck className="w-4 h-4 text-[#3b82f6]" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 bg-[#0d1520] border-r border-[#1a2535] h-full shadow-xl z-30">
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

function NavItem({ icon: Icon, label, onClick, active = false, badge }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
        active
          ? "bg-[#1a2535] text-white"
          : "text-[#94a3b8] hover:bg-[#1a2535] hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate flex-1">{label}</span>
      {badge != null && (
        <span className="bg-[#1d4ed8] text-white text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
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
        className="w-full flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1a2535] rounded-lg transition-all text-sm font-medium"
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

function SubItem({ label, dot, onClick, badge, badgeBg = "bg-[#1d4ed8]" }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-2 py-2 text-[#64748b] hover:text-white hover:bg-[#1a2535] rounded-lg cursor-pointer transition-all text-sm"
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
