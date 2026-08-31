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
  BarChart3,
  LogOut,
  FileText,
  FileBarChart,
  CreditCard,
  ShoppingBag,
  Bed,
  BedDouble,
  CalendarCheck,
  Plus,
  DoorOpen,
  KeyRound,
  Utensils,
  Star,
  Menu,
  X,
  Store,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function HotelSidebar({
  navigate,
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
  savedGuests,
  showInvoicesList,
  setShowInvoicesList,
  setShowGuestsListModal,
  handleAddNewGuest,
  newRequestCount,
  setShowCheckInOutModal,
}) {
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
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
    <div className="flex flex-col h-full rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1e2535] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#1d4ed8] rounded-lg flex items-center justify-center flex-shrink-0">
            <img src={logo} className="w-5 h-5 object-contain" alt="logo" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {businessInfo?.businessName || "HotelPro"}
            </p>
            <p className="text-[10px] text-[#64748b]">Management Suite</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#1e2535] rounded-lg transition-all flex-shrink-0"
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
            onClick={() => {
              handleNewInvoice?.();
              
            }}
          />
          <SubItem
            dot="bg-[#7c3aed]"
            label="All Invoices"
            badge={savedInvoices?.length ?? 0}
            onClick={() => {
              setShowInvoicesList?.((p) => !p);
              if (isMobile) setSidebarOpen(false);
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

        <SectionLabel>Guests</SectionLabel>

        {/* Guests accordion */}
        <Accordion
          icon={Users}
          label="Guests"
          isOpen={isGuestsOpen}
          onToggle={() => setIsGuestsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#059669]"
            label="Add Guest"
            onClick={() => {
              handleAddNewGuest?.();
              if (isMobile) setSidebarOpen(false);
            }}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="All Guests"
            badge={savedGuests?.length ?? 0}
            badgeBg="bg-[#1d4ed8]"
            onClick={() => {
              setShowGuestsListModal?.(true);
              if (isMobile) setSidebarOpen(false);
            }}
          />
        </Accordion>

        <SectionLabel>Operations</SectionLabel>

        <NavItem
          icon={Calendar}
          label="Reservations"
          onClick={() => goTo("reservations")}
          active={activeView === "reservations"}
        />
        <NavItem
          icon={Utensils}
          label="Restaurant / Bar"
          onClick={() => goTo("restaurant")}
          active={activeView === "restaurant"}
        />
        <NavItem
          icon={Bed}
          label="Room Management"
          onClick={() => goTo("rooms")}
          active={activeView === "rooms"}
        />
        <NavItem
          icon={DoorOpen}
          label="Check-In / Out"
          onClick={() => setShowCheckInOutModal?.(true)}
        />

       
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
            label="Occupancy Report"
            onClick={() => goTo("report-occupancy")}
          />
          <SubItem
            dot="bg-[#0891b2]"
            label="Revenue Report"
            onClick={() => goTo("report-revenue")}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="Guest Report"
            onClick={() => goTo("report-guests")}
          />
        </Accordion>

        {/* Analytics accordion */}
        <Accordion
          icon={BarChart3}
          label="Analytics"
          isOpen={isAnalyticsOpen}
          onToggle={() => setIsAnalyticsOpen((p) => !p)}
        >
          <SubItem
            dot="bg-[#4f46e5]"
            label="Booking Trends"
            onClick={() => goTo("analytics-bookings")}
          />
          <SubItem
            dot="bg-[#0891b2]"
            label="Revenue Trends"
            onClick={() => goTo("analytics-revenue")}
          />
          <SubItem
            dot="bg-[#2563eb]"
            label="Guest Insights"
            onClick={() => goTo("analytics-guests")}
          />
        </Accordion>

        
        <NavItem
          icon={Star}
          label="Reviews"
          onClick={() => goTo("reviews")}
          active={activeView === "reviews"}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e2535] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1e2535] rounded-full flex items-center justify-center ring-1 ring-[#2d3a52] flex-shrink-0 overflow-hidden">
            {businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="business"
                className="w-5 h-5 object-contain"
              />
            ) : (
              <KeyRound className="w-4 h-4 text-[#3b82f6]" />
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
            className="fixed top-3 left-3 z-50 w-9 h-9 bg-[#0f1623] border border-[#1e2535] text-[#94a3b8] hover:text-white hover:bg-[#1e2535] rounded-xl flex items-center justify-center shadow-lg transition-all"
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
          <div className="flex flex-col flex-shrink-0 w-16 bg-[#0f1623] rounded-2xl h-full items-center py-4 gap-2 z-30 shadow-lg">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand"
              className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e2535] rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center my-1">
              <img src={logo} className="w-6 h-6 object-contain" alt="logo" />
            </div>

            <div className="flex flex-col items-center gap-1 w-full px-2 mt-1 overflow-y-auto">
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
                  icon: Receipt,
                  title: "Invoices",
                  action: () => handleNewInvoice?.(),
                  
                },
                {
                  icon: FileText,
                  title: "Templates",
                  action: () => goTo("templates"),
                  active: activeView === "templates",
                },
                {
                  icon: Users,
                  title: "Guests",
                  action: () => setShowGuestsListModal?.(true),
                  active: false,
                },
                {
                  icon: Calendar,
                  title: "Reservations",
                  action: () => goTo("reservations"),
                  active: activeView === "reservations",
                },
                {
                  icon: Bed,
                  title: "Room Management",
                  action: () => goTo("rooms"),
                  active: activeView === "rooms",
                },
                 {
                  icon: Utensils,
                  title: "Restaurant / Bar",
                  action: () => goTo("restaurant"),
                  active: activeView === "restaurant",
                },
                {
                  icon: DoorOpen,
                  title: "Check-In / Out",
                  action: () => setShowCheckInOutModal?.(true),
                  active: false,
                },
                
                {
                  icon: FileBarChart,
                  title: "Reports",
                  action: () => goTo("report-occupancy"),
                  active: false,
                },
                {
                  icon: BarChart3,
                  title: "Analytics",
                  action: () => goTo("analytics-bookings"),
                  active: false,
                },
               
                {
                  icon: Star,
                  title: "Reviews",
                  action: () => goTo("reviews"),
                  active: activeView === "reviews",
                },
              ].map(({ icon: Icon, title, action, active }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                    active
                      ? "bg-[#c6f135] text-[#0f1623]"
                      : "text-[#64748b] hover:text-white hover:bg-[#1e2535]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="mt-auto pb-2">
              <div className="w-9 h-9 bg-[#1e2535] rounded-full flex items-center justify-center ring-1 ring-[#2d3a52] overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-5 h-5 object-contain"
                    alt="business"
                  />
                ) : (
                  <KeyRound className="w-4 h-4 text-[#3b82f6]" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 bg-[#0f1623] rounded-2xl h-full shadow-lg z-30">
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
        active
          ? "bg-[#c6f135] text-[#0f1623]"
          : "text-[#94a3b8] hover:bg-[#1e2535] hover:text-white"
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
        className="w-full flex items-center justify-between px-3 py-2.5 text-[#94a3b8] hover:text-white hover:bg-[#1e2535] rounded-xl transition-all text-sm font-medium"
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
      className="flex items-center justify-between px-2 py-2 text-[#64748b] hover:text-white hover:bg-[#1e2535] rounded-xl cursor-pointer transition-all text-sm"
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
export function MobileBottomNav({
  activeView,
  setActiveView,
  handleNewInvoice,
  setShowCheckInOutModal,
}) {
  const navItems = [
    {
      icon: Home,
      label: "Home",
      action: () => setActiveView("home"),
      active: activeView === "home",
    },
    {
      icon: BedDouble,
      label: "Rooms",
      action: () => setActiveView("rooms"),
      active: activeView === "rooms",
    },
    {
      icon: Plus,
      label: "Invoice",
      action: () => handleNewInvoice(),
      active: activeView === "invoice",
      isPrimary: true,
    },
    {
      icon: CalendarCheck,
      label: "Check-In",
      action: () => setShowCheckInOutModal(true),
      active: false,
    },
    {
      icon: Receipt,
      label: "Invoices",
      action: () => setActiveView("reservations"),
      active: activeView === "reservations",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#0a0f1e] rounded-2xl shadow-lg print:hidden">
      <div className="flex items-center justify-around px-2 py-1 pb-safe">
        {navItems.map(({ icon: Icon, label, action, active, isPrimary }) =>
          isPrimary ? (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-14 h-14 bg-[#d97706] hover:bg-[#b45309] rounded-full flex items-center justify-center shadow-lg shadow-[#d97706]/30 border-4 border-[#0a0f1e] transition-all active:scale-95">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] text-[#d97706] font-semibold mt-0.5">
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
                  <span className="absolute inset-0 bg-[#d97706]/10 rounded-lg" />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-[#d97706]" : "text-[#64748b]"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? "text-[#d97706]" : "text-[#64748b]"
                }`}
              >
                {label}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
