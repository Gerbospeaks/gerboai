// components/AppHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardRoute } from "../utils/dashboardRoutes";
import {
  LayoutDashboard, FileText, Settings, LogOut, ChevronDown,
  Bell, Search, Plus, HelpCircle, X, FileSignature, Users,
  Receipt, Briefcase, Zap, CheckCircle2, Clock, AlertCircle,
  Menu, ClipboardList, Wrench, Hammer, Sparkles, ShoppingBag,
  Package, UserPlus,
} from "lucide-react";

// ─── Per-industry Quick Create config ────────────────────────────────────────
/**
 * Each entry maps a dashboardType string to:
 *   label        — human-readable industry name shown in header + user menu
 *   accentColor  — Tailwind bg class applied to the Create button & logo mark
 *   quickCreate  — array of { label, icon, shortcut, view, action }
 *
 * `view`   → passed to your setActiveView() so the correct panel opens
 * `action` → string your parent uses to call handleNewInvoice/handleNewQuote/etc.
 *
 * Both are forwarded via onQuickCreate({ view, action, label }).
 */
const DASHBOARD_CONFIG = {
  mechanics: {
    label: "Mechanics",
    accentColor: "bg-blue-600",
    quickCreate: [
      { label: "New Job Card",    icon: ClipboardList,  shortcut: "J", view: "invoice",          action: "newInvoice"   },
      { label: "New Quote",       icon: FileSignature,  shortcut: "Q", view: "invoice",          action: "newQuote"     },
      { label: "New Customer",    icon: UserPlus,       shortcut: "C", view: null,               action: "newCustomer"  },
      { label: "Purchase Order",  icon: ShoppingBag,    shortcut: "P", view: "purchase-orders",  action: null           },
      { label: "Parts Inventory", icon: Package,        shortcut: "L", view: "parts-inventory",  action: null           },
    ],
  },
  construction: {
    label: "Construction",
    accentColor: "bg-amber-600",
    quickCreate: [
      { label: "New Quote",    icon: FileSignature, shortcut: "Q", view: "quote",    action: "newQuote"    },
      { label: "New Invoice",  icon: FileText,      shortcut: "I", view: "invoice",  action: "newInvoice"  },
      { label: "New Client",   icon: UserPlus,      shortcut: "C", view: null,       action: "newCustomer" },
      { label: "Schedule Job", icon: Briefcase,     shortcut: "S", view: "schedule", action: null          },
      { label: "Reports",      icon: Receipt,       shortcut: "R", view: "reports",  action: null          },
    ],
  },
  cleaning: {
    label: "Cleaning",
    accentColor: "bg-cyan-600",
    quickCreate: [
      { label: "New Quote",   icon: FileSignature, shortcut: "Q", view: "quote",    action: "newQuote"    },
      { label: "New Invoice", icon: FileText,      shortcut: "I", view: "quote",    action: "newInvoice"  },
      { label: "New Client",  icon: UserPlus,      shortcut: "C", view: null,       action: "newCustomer" },
      { label: "New Job",     icon: Sparkles,      shortcut: "J", view: "jobs",     action: null          },
      { label: "Schedule",    icon: Briefcase,     shortcut: "S", view: "schedule", action: null          },
    ],
  },
  carpentry: {
    label: "Carpentry",
    accentColor: "bg-orange-700",
    quickCreate: [
      { label: "New Quote",   icon: FileSignature, shortcut: "Q", view: "quote",       action: "newQuote"    },
      { label: "New Invoice", icon: FileText,      shortcut: "I", view: "quote",       action: "newInvoice"  },
      { label: "New Client",  icon: UserPlus,      shortcut: "C", view: null,          action: "newCustomer" },
      { label: "New Project", icon: Hammer,        shortcut: "P", view: "projects",    action: null          },
      { label: "Work Order",  icon: Wrench,        shortcut: "W", view: "work-orders", action: null          },
    ],
  },
  electrical: {
    label: "Electrical",
    accentColor: "bg-yellow-500",
    quickCreate: [
      { label: "New Quote",   icon: FileSignature, shortcut: "Q", view: "quote",    action: "newQuote"    },
      { label: "New Invoice", icon: FileText,      shortcut: "I", view: "invoice",  action: "newInvoice"  },
      { label: "New Client",  icon: UserPlus,      shortcut: "C", view: null,       action: "newCustomer" },
      { label: "Schedule",    icon: Briefcase,     shortcut: "S", view: "schedule", action: null          },
      { label: "Reports",     icon: Receipt,       shortcut: "R", view: "reports",  action: null          },
    ],
  },
};

// Fallback for any unlisted type
const DEFAULT_CONFIG = {
  label: "Dashboard",
  accentColor: "bg-blue-600",
  quickCreate: [
    { label: "New Invoice", icon: FileText,      shortcut: "I", view: "invoice",  action: "newInvoice"  },
    { label: "New Quote",   icon: FileSignature, shortcut: "Q", view: "quote",    action: "newQuote"    },
    { label: "New Client",  icon: UserPlus,      shortcut: "C", view: null,       action: "newCustomer" },
    { label: "New Expense", icon: Receipt,       shortcut: "E", view: "expenses", action: null          },
    { label: "New Project", icon: Briefcase,     shortcut: "P", view: "projects", action: null          },
  ],
};

// ─── AppHeader ────────────────────────────────────────────────────────────────
/**
 * Props:
 *   dashboardType   "mechanics"|"construction"|"cleaning"|"carpentry"|"electrical"
 *
 *   sidebarOpen     bool  — lifted sidebar state from parent
 *   setSidebarOpen  fn    — setter from parent (toggles sidebar)
 *
 *   onQuickCreate   fn({ view, action, label })
 *                   Parent decides what to do:
 *                     const { view, action } = args
 *                     if (action === "newInvoice")  handleNewInvoice()
 *                     if (action === "newQuote")    handleNewQuote()
 *                     if (action === "newCustomer") handleAddNewCustomer()
 *                     if (view) setActiveView(view)
 *
 *   actions         array of { label, icon, onClick, variant }  (page-level buttons)
 *   showActions     bool
 *   onSettingsOpen  fn
 *   notifications   array of { id, title, message, type, time, read }
 *   pageTitle       string
 *   plan            "free"|"pro"|"enterprise"
 */
const AppHeader = ({
  dashboardType  = "mechanics",
  sidebarOpen    = false,
  setSidebarOpen = () => {},
  onQuickCreate  = () => {},
  actions        = [],
  showActions    = true,
  onSettingsOpen,
  notifications  = [],
  pageTitle      = "",
  plan           = "pro",
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showUserMenu,      setShowUserMenu]      = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch,        setShowSearch]        = useState(false);
  const [showQuickCreate,   setShowQuickCreate]   = useState(false);
  const [searchQuery,       setSearchQuery]       = useState("");
  const [localNotifs,       setLocalNotifs]       = useState(notifications);

  const searchRef      = useRef(null);
  const notifRef       = useRef(null);
  const quickCreateRef = useRef(null);
  const userMenuRef    = useRef(null);

  const unreadCount = localNotifs.filter((n) => !n.read).length;
  const dashConfig  = DASHBOARD_CONFIG[dashboardType] ?? DEFAULT_CONFIG;

  // Keep localNotifs fresh when parent passes new ones
  useEffect(() => { setLocalNotifs(notifications); }, [notifications]);

  // Close dropdowns on outside click
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current       && !notifRef.current.contains(e.target))       setShowNotifications(false);
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target)) setShowQuickCreate(false);
      if (userMenuRef.current    && !userMenuRef.current.contains(e.target))    setShowUserMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  // ⌘K → toggle search, Esc → close
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowSearch((p) => !p); }
      if (e.key === "Escape") setShowSearch(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await logout(); navigate("/login"); } catch (e) { console.error(e); }
  };

  const markAllRead  = () => setLocalNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const dismissNotif = (id) => setLocalNotifs((p) => p.filter((n) => n.id !== id));

  const getUserInitials = () => {
    if (user?.name)  return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };
  const getUserDisplayName = () => user?.name || user?.email?.split("@")[0] || "User";

  const getNextDocNumber = () => {
    const invoices = user?.invoices || {};
    const nums = Object.keys(invoices)
      .filter((k) => k !== "businessInfo")
      .map((k) => { const m = invoices[k]?.jobCardNumber?.match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
      .filter(Number.isFinite);
    return `JC-2026-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0")}`;
  };

  const businessName = user?.invoices?.businessInfo?.businessName || "SOLIDFLO";

  const planStyles = { free: "bg-gray-100 text-gray-500", pro: "bg-blue-50 text-blue-600", enterprise: "bg-violet-50 text-violet-600" };
  const planLabel  = { free: "Free", pro: "Pro", enterprise: "Enterprise" };

  const notifIcon = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />,
    warning: <AlertCircle  className="w-4 h-4 text-amber-500  flex-shrink-0 mt-0.5" />,
    info:    <Clock        className="w-4 h-4 text-blue-500   flex-shrink-0 mt-0.5" />,
  };

  const handleQuickCreateItem = (item) => {
    setShowQuickCreate(false);
    onQuickCreate({ view: item.view, action: item.action, label: item.label });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Search overlay ─────────────────────────────────────────── */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}
        >
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder={`Search ${dashConfig.label.toLowerCase()} documents, clients…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              <button onClick={() => setShowSearch(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="px-4 py-4 flex flex-wrap gap-2">
              {["Unpaid", "Overdue", "Last 30 days", "Top clients"].map((hint) => (
                <button
                  key={hint}
                  onClick={() => setSearchQuery(hint)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
            <div className="px-4 pb-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-xs">↵</kbd> to search</span>
              <span className="text-xs text-gray-400"><kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-xs">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 print:hidden">
        <div className="w-full px-3 sm:px-5 h-14 flex items-center gap-2">

          {/* ── Hamburger — controls the sidebar ── */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

         

          {/* Plan badge */}
          {plan && plan !== "free" && (
            <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${planStyles[plan] ?? planStyles.pro}`}>
              {planLabel[plan] ?? plan}
            </span>
          )}

          {/* Breadcrumb */}
          {pageTitle && (
            <>
              <span className="hidden sm:block text-gray-300 select-none text-sm">/</span>
              <span className="hidden sm:block text-sm font-medium text-gray-500 truncate max-w-[160px]">{pageTitle}</span>
            </>
          )}

          {/* Next doc number chip */}
          <span className="hidden lg:inline-flex items-center px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] font-mono text-gray-400">
            {getNextDocNumber()}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* ── Right controls ── */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors group"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
                Search…
                <kbd className="px-1.5 py-0.5 bg-gray-100 group-hover:bg-white rounded font-mono text-[10px] border border-gray-200 transition-colors">⌘K</kbd>
              </span>
            </button>

            {/* + Create */}
            <div className="relative" ref={quickCreateRef}>
              <button
                onClick={() => setShowQuickCreate((p) => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${dashConfig.accentColor} hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-opacity shadow-sm`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create</span>
              </button>

              {showQuickCreate && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      {dashConfig.label} · Quick Create
                    </p>
                  </div>
                  <div className="py-1">
                    {dashConfig.quickCreate.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={() => handleQuickCreateItem(item)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-gray-400" />
                            {item.label}
                          </span>
                          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-400 border border-gray-200">
                            {item.shortcut}
                          </kbd>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Page-level action buttons */}
            {showActions && actions.length > 0 && (
              <div className="flex items-center gap-1">
                {actions.map(({ label, icon: Icon, onClick, variant = "secondary", className: cls }, i) => (
                  <div key={i} className="relative group">
                    <button
                      onClick={onClick}
                      className={cls ?? (variant === "primary"
                        ? `flex items-center gap-1.5 px-3 py-1.5 ${dashConfig.accentColor} text-white text-sm font-semibold rounded-lg hover:opacity-90 shadow-sm`
                        : "flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg bg-white hover:bg-gray-50 transition-colors"
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity sm:hidden z-50">
                      <div className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">{label}</div>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Help */}
            <button
              className="hidden sm:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Help & Support"
              onClick={() => navigate("/help")}
            >
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications((p) => !p)}
                className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed right-3 top-14 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Notifications</p>
                      {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {localNotifs.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      localNotifs.map((n) => (
                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}>
                          {notifIcon[n.type] ?? notifIcon.info}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{n.title}</p>
                            {n.message && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>}
                            {n.time    && <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>}
                          </div>
                          <button onClick={() => dismissNotif(n.id)} className="p-0.5 rounded hover:bg-gray-200 flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => { setShowNotifications(false); navigate("/notifications"); }}
                      className="w-full text-xs text-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-0.5 hidden sm:block" />

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((p) => !p)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden ring-2 ring-white">
                  {user?.photoURL ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" /> : getUserInitials()}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">{getUserDisplayName()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {showUserMenu && (
                <div className="fixed right-3 top-14 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                        {user?.photoURL ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" /> : getUserInitials()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    {/* Industry + plan badges */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${dashConfig.accentColor} text-white`}>
                        {dashConfig.label}
                      </span>
                      {plan && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${planStyles[plan] ?? planStyles.pro}`}>
                          {planLabel[plan] ?? plan}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nav */}
                  <div className="py-1">
                    <button
                      onClick={() => { setShowUserMenu(false); navigate(getDashboardRoute(user?.dashboardId)); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); navigate("/invoices"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {dashboardType === "mechanics" ? "My Job Cards" : "My Documents"}
                    </button>
                    {onSettingsOpen && (
                      <button
                        onClick={() => { setShowUserMenu(false); onSettingsOpen(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        Business Settings
                      </button>
                    )}
                  </div>

                  <div className="border-t border-gray-100" />

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default AppHeader;
