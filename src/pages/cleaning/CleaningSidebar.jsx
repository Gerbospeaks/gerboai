import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Receipt,
  ShoppingBag,
  Users,
  ChevronRight,
  ChevronDown,
  Calendar,
  BarChart3,
  LogOut,
  Sparkles,
  Star,
  Menu,
  X,
  FileText,
  StickyNote,
  History,
  Bell,
  CalendarDays,
  UserCheck,
  Package,
  CheckSquare,
  MapPin,
  Truck,
  Repeat,
  ClipboardList,
  LayoutTemplate,
  TrendingDown,
  Landmark,
  DollarSign,
  Store,
} from "lucide-react";
import logo from "../../assets/img/logo.png";
import AIInvoiceWindow from "../AIInvoiceWindow";

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
  savedQuotes = [],
  savedCustomers = [],
  handleLogout,
  showQuotesList,
  setShowQuotesList,
  setShowCustomersListModal,
  handleAddNewCustomer,
  newRequestCount,
  documentType = "quote",
  // AI window controls — accept both naming conventions
  setShowAIWindow,
  setAiWindowOpen,
}) {
  const [isQuotesInvoicesOpen, setIsQuotesInvoicesOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
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

  const openAI = () => {
    if (setShowAIWindow) setShowAIWindow(true);
    else if (setAiWindowOpen) setAiWindowOpen(true);
    if (isMobile) setSidebarOpen(false);
  };

  // ── Shared sidebar body ───────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden">
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
            setShowSettings?.(true);
            if (isMobile) setSidebarOpen(false);
          }}
        />

        {/* ── FINANCE ── */}
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
          onToggle={() => setIsQuotesInvoicesOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#2563eb]"
            label="Create Quote"
            active={activeView === "quote" && documentType === "quote"}
            onClick={() => {
              handleNewQuote?.();
              goTo("quote");
            }}
          />
          <SubItem
            dot="bg-[#059669]"
            label="Create Invoice"
            active={activeView === "quote" && documentType === "invoice"}
            onClick={() => {
              handleNewInvoice?.();
              goTo("quote");
            }}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label={`All ${documentType === "invoice" ? "Invoices" : "Quotes"}`}
            badge={savedQuotes.length}
            onClick={() => {
              setShowQuotesList?.((prev) => !prev);
              if (isMobile) setSidebarOpen(false);
            }}
          />
          <SubItem
            dot="bg-[#dc2626]"
            label="Credit Notes"
            onClick={() => goTo("credit-notes")}
            active={activeView === "credit-notes"}
          />
          <SubItem
            dot="bg-[#0891b2]"
            label="Recurring Invoices"
            onClick={() => goTo("recurring-invoices")}
            active={activeView === "recurring-invoices"}
          />
        </Accordion>

        <NavItem
          icon={ShoppingBag}
          label="Purchase Orders"
          onClick={() => goTo("purchase-orders")}
          active={activeView === "purchase-orders"}
        />
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
            badge={savedCustomers.length}
            badgeBg="bg-[#7c3aed]"
            onClick={() => {
              setShowCustomersListModal?.(true);
              if (isMobile) setSidebarOpen(false);
            }}
          />
          <SubItem
            dot="bg-[#d97706]"
            label="Client Ratings"
            onClick={() => goTo("client-ratings")}
            active={activeView === "client-ratings"}
          />
        </Accordion>

        {/* ── OPERATIONS ── */}
        <SectionLabel>Operations</SectionLabel>

        {/* Cleaning Jobs */}
        <Accordion
          icon={Sparkles}
          label="Cleaning Jobs"
          isOpen={isJobsOpen}
          onToggle={() => setIsJobsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#059669]"
            label="New Job"
            onClick={() => goTo("job-new")}
            active={activeView === "job-new"}
          />
          <SubItem
            dot="bg-[#0891b2]"
            label="All Jobs"
            onClick={() => goTo("jobs")}
            active={activeView === "jobs"}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="Job Calendar"
            onClick={() => goTo("job-calendar")}
            active={activeView === "job-calendar"}
          />
          <SubItem
            dot="bg-[#d97706]"
            label="Recurring Jobs"
            onClick={() => goTo("recurring-jobs")}
            active={activeView === "recurring-jobs"}
          />
          <SubItem
            dot="bg-[#0d9488]"
            label="Job Checklists"
            onClick={() => goTo("checklists")}
            active={activeView === "checklists"}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label="Checklist Templates"
            onClick={() => goTo("checklist-templates")}
            active={activeView === "checklist-templates"}
          />
        </Accordion>

        {/* Staff */}
        <Accordion
          icon={UserCheck}
          label="Staff"
          isOpen={isStaffOpen}
          onToggle={() => setIsStaffOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#059669]"
            label="Add Staff Member"
            onClick={() => goTo("staff-new")}
            active={activeView === "staff-new"}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="All Staff"
            onClick={() => goTo("staff")}
            active={activeView === "staff"}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label="Staff Schedule"
            onClick={() => goTo("staff-schedule")}
            active={activeView === "staff-schedule"}
          />
          <SubItem
            dot="bg-[#d97706]"
            label="Attendance & Hours"
            onClick={() => goTo("staff-attendance")}
            active={activeView === "staff-attendance"}
          />
          <SubItem
            dot="bg-[#dc2626]"
            label="Staff Performance"
            onClick={() => goTo("staff-performance")}
            active={activeView === "staff-performance"}
          />
        </Accordion>

        <NavItem
          icon={MapPin}
          label="Service Areas"
          onClick={() => goTo("service-areas")}
          active={activeView === "service-areas"}
        />

        <NavItem
          icon={Package}
          label="Supplies & Inventory"
          onClick={() => goTo("supplies")}
          active={activeView === "supplies"}
        />

        <NavItem
          icon={CheckSquare}
          label="Quality Control"
          onClick={() => goTo("quality-control")}
          active={activeView === "quality-control"}
        />

        <NavItem
          icon={Truck}
          label="Fleet / Vehicles"
          onClick={() => goTo("fleet")}
          active={activeView === "fleet"}
        />

        {/* ── ACCOUNTING ── */}
        <SectionLabel>Accounting</SectionLabel>
        <NavItem
          icon={Landmark}
          label="Banking"
          onClick={() => goTo("banking")}
          active={activeView === "banking"}
        />

        {/* ── TOOLS ── */}
        <SectionLabel>Tools</SectionLabel>

        <NavItem
          icon={CalendarDays}
          label="Schedule"
          onClick={() => goTo("schedule")}
          active={activeView === "schedule"}
        />
        <NavItem
          icon={LayoutTemplate}
          label="Templates"
          onClick={() => goTo("templates")}
          active={activeView === "templates"}
        />
        <NavItem
          icon={Star}
          label="Client Reviews"
          onClick={() => goTo("reviews")}
          active={activeView === "reviews"}
        />

        <NavItem
          icon={StickyNote}
          label="Notes"
          onClick={() => goTo("notes-view")}
          active={activeView === "notes-view"}
        />
        <NavItem
          icon={Bell}
          label="Reminders"
          onClick={() => goTo("reminders")}
          active={activeView === "reminders"}
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
              {user?.displayName || user?.name || "User"}
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

        {/* Drawer — floats with margin instead of running edge to edge */}
        <div
          className={`fixed inset-y-3 left-3 z-50 w-72 max-w-[85vw] rounded-2xl shadow-2xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
          }`}
        >
          <SidebarContent />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP — collapsed icon rail OR expanded panel
          Both float as rounded cards with vertical margin, not full height.
      ════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex print:hidden h-full py-3 pl-3">
        {/* Collapsed icon rail */}
        {!sidebarOpen && (
          <div className="flex flex-col flex-shrink-0 w-16 bg-[#1a2332] rounded-2xl h-full items-center py-4 gap-2 z-30 shadow-lg">
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
                  action: () => setShowSettings?.(true),
                },
                {
                  icon: Sparkles,
                  title: "AI Assistant",
                  action: openAI,
                  ai: true,
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
                    handleNewQuote?.();
                    goTo("quote");
                  },
                },
                {
                  icon: Sparkles,
                  title: "Cleaning Jobs",
                  action: () => goTo("jobs"),
                },
                {
                  icon: UserCheck,
                  title: "Staff",
                  action: () => goTo("staff"),
                },
                {
                  icon: Users,
                  title: "Clients",
                  action: () => setShowCustomersListModal?.(true),
                },
                {
                  icon: CalendarDays,
                  title: "Schedule",
                  action: () => goTo("schedule"),
                },
                {
                  icon: Package,
                  title: "Supplies",
                  action: () => goTo("supplies"),
                },
                {
                  icon: BarChart3,
                  title: "Reports",
                  action: () => goTo("report-pnl"),
                },
                {
                  icon: LayoutTemplate,
                  title: "Templates",
                  action: () => goTo("templates"),
                },

                {
                  icon: StickyNote,
                  title: "Notes",
                  action: () => goTo("notes-view"),
                },
              ].map(({ icon: Icon, title, action, ai }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                    ai
                      ? "text-[#a78bfa] hover:text-white hover:bg-[#7c3aed]"
                      : "text-[#64748b] hover:text-white hover:bg-[#253347]"
                  }`}
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
          <div className="flex-shrink-0 w-64 bg-[#1a2332] rounded-2xl h-full shadow-lg z-30">
            <SidebarContent />
          </div>
        )}
      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
        active
          ? "bg-[#253347] text-white"
          : "text-[#94a3b8] hover:bg-[#253347] hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate flex-1">{label}</span>
      {badge != null && (
        <span className="bg-[#059669] text-white text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
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
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SubItem({
  label,
  dot,
  onClick,
  badge,
  badgeBg = "bg-[#2563eb]",
  active = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-all text-sm ${
        active
          ? "bg-[#253347] text-white"
          : "text-[#64748b] hover:text-white hover:bg-[#253347]"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {dot && (
          <div className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
        )}
        <span className="truncate">{label}</span>
      </div>
      {badge != null && badge > 0 && (
        <span
          className={`${badgeBg} text-white text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ml-2`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
