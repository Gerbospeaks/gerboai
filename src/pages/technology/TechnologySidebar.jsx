import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  BarChart3,
  LogOut,
  FileText,
  FileBarChart,
  CreditCard,
  Star,
  FolderOpen,
  Code2,
  Globe,
  Cpu,
  Layers,
  GitBranch,
  Terminal,
  ShieldCheck,
  Webhook,
  Bell,
  Lock,
  Zap,
  Database,
} from "lucide-react";
import { Bot as GerboAIIcon } from "lucide-react";

import { usePlan, UpgradeModal } from "./planGating";
let _usePlan;
try {
  _usePlan = usePlan;
} catch {
  _usePlan = () => ({
    requirePlan: (_key, action) => action?.(),
    canAccess: () => true,
    currentPlan: "starter",
  });
}

// ─── Logo placeholder — swap for your real import ─────────────────────────────
const logo = null; // import logo from "../../assets/img/logo.png";

export default function TechnologySidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleLogout,
  businessInfo,
  savedProjects,
  savedClients,
  showProjectsList,
  setShowProjectsList,
  setShowClientsModal,
  handleAddNewClient,
  newRequestCount,
}) {
  const planState = _usePlan();

  // ── Sidebar unlocked: ignore real plan restrictions here ────────────────────
  // Every nav item runs its action immediately and nothing shows as locked.
  // Remove this block (and use `planState` directly) to restore normal gating.
  const requirePlan = (_featureKey, action) => action?.();
  const canAccess = () => true;
  const currentPlan = planState.currentPlan;

  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
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

  const goTo = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  // Helper: navigate only if plan allows it
  const gatedGoTo = (featureKey, view, label) =>
    requirePlan(featureKey, () => goTo(view), label);

  // ── Collapsed icon rail ──────────────────────────────────────────────────────
  const iconRailItems = [
    {
      icon: Home,
      title: "Dashboard",
      action: () => setActiveView("home"),
      gated: false,
    },
    {
      icon: Settings,
      title: "Settings",
      action: () => setShowSettings(true),
      gated: false,
    },
    {
      icon: TrendingUp,
      title: "Business Overview",
      action: () =>
        requirePlan(
          "businessOverview",
          () => goTo("overview"),
          "Business Overview",
        ),
      featureKey: "businessOverview",
    },
    {
      icon: GerboAIIcon,
      title: "GerboAI Receptionist",
      action: () => goTo("gerbo-ai"),
      gated: false,
    },
    {
      icon: Code2,
      title: "Projects",
      action: () => goTo("projects"),
      gated: false,
    },
    {
      icon: Users,
      title: "Clients",
      action: () =>
        requirePlan(
          "allClients",
          () => setShowClientsModal?.(true),
          "All Clients",
        ),
      featureKey: "allClients",
    },
    {
      icon: GitBranch,
      title: "Deployments",
      action: () =>
        requirePlan("bookings", () => goTo("deployments"), "Deployments"),
      featureKey: "bookings",
    },
    {
      icon: Globe,
      title: "Domains",
      action: () => requirePlan("portfolio", () => goTo("domains"), "Domains"),
      featureKey: "portfolio",
    },
    {
      icon: Database,
      title: "Databases",
      action: () =>
        requirePlan("packages", () => goTo("databases"), "Databases"),
      featureKey: "packages",
    },
    {
      icon: CreditCard,
      title: "Billing",
      action: () => requirePlan("payments", () => goTo("billing"), "Billing"),
      featureKey: "payments",
    },
    {
      icon: FileBarChart,
      title: "Reports",
      action: () => requirePlan("reports", () => goTo("reports"), "Reports"),
      featureKey: "reports",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      action: () =>
        requirePlan("analytics", () => goTo("analytics"), "Analytics"),
      featureKey: "analytics",
    },
  ];

  // ── Shared sidebar body (header / scrollable nav / footer) ──────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1E2A3A] flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#6366F1] flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            {logo ? (
              <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
            ) : (
              <Cpu className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="text-sm font-semibold text-white tracking-tight truncate">
            {businessInfo?.name || "TechStack"}
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-[#1A2540] rounded-lg transition-all duration-200 flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Plan badge */}
        <div className="flex items-center justify-between mb-4 px-3 py-2 bg-[#111827] rounded-lg border border-[#1E2A3A]">
          <span className="text-xs text-slate-500">Plan</span>
          <div className="flex items-center gap-2">
            <PlanBadge currentPlan={currentPlan} />
            {currentPlan !== "elite" && (
              <button
                onClick={() => requirePlan("elite", () => {}, "Elite plan")}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Upgrade ↑
              </button>
            )}
          </div>
        </div>

        <nav className="space-y-0.5">
          <NavItem
            icon={Home}
            label="Dashboard"
            onClick={() => goTo("home")}
            active={activeView === "home"}
          />
          <NavItem
            icon={Settings}
            label="Settings"
            onClick={() => {
              setShowSettings(true);
              setSidebarOpen(false);
            }}
          />

          <div className="pt-4 mt-3 border-t border-[#1E2A3A] space-y-0.5">
            {/* Overview — gated: elite */}
            <NavItem
              icon={TrendingUp}
              label="Business Overview"
              locked={!canAccess("businessOverview")}
              onClick={() =>
                gatedGoTo("businessOverview", "overview", "Business Overview")
              }
            />
            <NavItem
              icon={GerboAIIcon}
              label="GerboAI Receptionist"
              active={activeView === "gerbo-ai"}
              onClick={() => goTo("gerbo-ai")}
            />

            {/* Projects accordion — free */}
            <Accordion
              icon={Code2}
              label="Projects"
              isOpen={isProjectsOpen}
              onToggle={() => setIsProjectsOpen((p) => !p)}
            >
              <SubItem
                label="New Project"
                onClick={() => goTo("project-new")}
              />
              <SubItem
                label="All Projects"
                badge={savedProjects?.length ?? 0}
                onClick={() => {
                  setShowProjectsList?.((p) => !p);
                  setSidebarOpen(false);
                }}
              />
              <SubItem
                label="Archived"
                onClick={() => goTo("projects-archived")}
              />
            </Accordion>

            {/* Clients accordion — gated: growth */}
            <Accordion
              icon={Users}
              label="Clients"
              isOpen={isClientsOpen}
              onToggle={() => setIsClientsOpen((p) => !p)}
            >
              <SubItem
                label="Add Client"
                locked={!canAccess("addClient")}
                onClick={() =>
                  requirePlan(
                    "addClient",
                    () => {
                      handleAddNewClient?.();
                      setSidebarOpen(false);
                    },
                    "Add Client",
                  )
                }
              />
              <SubItem
                label="All Clients"
                badge={savedClients?.length ?? 0}
                locked={!canAccess("allClients")}
                onClick={() =>
                  requirePlan(
                    "allClients",
                    () => {
                      setShowClientsModal?.(true);
                      setSidebarOpen(false);
                    },
                    "All Clients",
                  )
                }
              />
            </Accordion>

            {/* Templates — gated: growth */}
            <NavItem
              icon={FileText}
              label="Proposal Templates"
              locked={!canAccess("templates")}
              onClick={() =>
                gatedGoTo("templates", "templates", "Proposal Templates")
              }
            />

            {/* Deployments — gated: elite */}
            <NavItem
              icon={GitBranch}
              label="Deployments"
              locked={!canAccess("bookings")}
              onClick={() =>
                gatedGoTo("bookings", "deployments", "Deployments")
              }
              badge={newRequestCount > 0 ? newRequestCount : null}
            />

            {/* Domains — gated: elite */}
            <NavItem
              icon={Globe}
              label="Domains"
              locked={!canAccess("portfolio")}
              onClick={() => gatedGoTo("portfolio", "domains", "Domains")}
            />

            {/* Databases — gated: elite */}
            <NavItem
              icon={Database}
              label="Databases"
              locked={!canAccess("packages")}
              onClick={() => gatedGoTo("packages", "databases", "Databases")}
            />

            {/* Integrations — gated: elite */}
            <NavItem
              icon={Webhook}
              label="Integrations"
              locked={!canAccess("packages")}
              onClick={() =>
                gatedGoTo("packages", "integrations", "Integrations")
              }
            />

            {/* Billing accordion — gated: growth */}
            <Accordion
              icon={CreditCard}
              label="Billing"
              isOpen={isBillingOpen}
              onToggle={() =>
                requirePlan(
                  "payments",
                  () => setIsBillingOpen((p) => !p),
                  "Billing",
                )
              }
              locked={!canAccess("payments")}
            >
              <SubItem
                label="Invoices"
                onClick={() => goTo("billing-invoices")}
              />
              <SubItem
                label="Payment History"
                onClick={() => goTo("billing-history")}
              />
              <SubItem
                label="Subscriptions"
                onClick={() => goTo("billing-subscriptions")}
              />
            </Accordion>

            {/* Reports accordion — gated: elite */}
            <Accordion
              icon={FileBarChart}
              label="Reports"
              isOpen={isReportsOpen}
              onToggle={() =>
                requirePlan(
                  "reports",
                  () => setIsReportsOpen((p) => !p),
                  "Reports",
                )
              }
              locked={!canAccess("reports")}
            >
              <SubItem
                label="Project Reports"
                onClick={() => goTo("report-projects")}
              />
              <SubItem
                label="Revenue Reports"
                onClick={() => goTo("report-revenue")}
              />
              <SubItem
                label="Client Reports"
                onClick={() => goTo("report-clients")}
              />
            </Accordion>

            {/* Analytics accordion — gated: elite */}
            <Accordion
              icon={BarChart3}
              label="Analytics"
              isOpen={isAnalyticsOpen}
              onToggle={() =>
                requirePlan(
                  "analytics",
                  () => setIsAnalyticsOpen((p) => !p),
                  "Analytics",
                )
              }
              locked={!canAccess("analytics")}
            >
              <SubItem
                label="Traffic Trends"
                onClick={() => goTo("analytics-traffic")}
              />
              <SubItem
                label="Revenue Trends"
                onClick={() => goTo("analytics-revenue")}
              />
              <SubItem
                label="Client Insights"
                onClick={() => goTo("analytics-clients")}
              />
            </Accordion>

            {!isMobile && (
              <>
                <NavItem
                  icon={ShieldCheck}
                  label="Security"
                  locked={!canAccess("reports")}
                  onClick={() => gatedGoTo("reports", "security", "Security")}
                />
                <NavItem
                  icon={Terminal}
                  label="Audit Logs"
                  locked={!canAccess("analytics")}
                  onClick={() =>
                    gatedGoTo("analytics", "audit-logs", "Audit Logs")
                  }
                />
                <NavItem
                  icon={Star}
                  label="Reviews"
                  onClick={() => goTo("reviews")}
                />
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E2A3A] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full ring-1 ring-[#1E2A3A] bg-[#1A2540] flex items-center justify-center overflow-hidden flex-shrink-0">
            {businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Business Logo"
                className="max-h-[70%] max-w-[70%] object-contain"
              />
            ) : (
              <Cpu className="w-4 h-4 text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Upgrade modal — renders above everything ──────────────────────── */}
      <UpgradeModal />

      {/* ════════════════════════════════════════════════════════════════
          MOBILE — dim overlay + floating slide-in drawer (margin + rounded)
      ════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden print:hidden">
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`fixed inset-y-3 left-3 z-50 w-64 max-w-[85vw] rounded-2xl shadow-2xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
          }`}
        >
          <div className="bg-[#0A0E1A] h-full rounded-2xl">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP — collapsed icon rail OR expanded panel, both floating
          as rounded cards with vertical + left margin, not full height.
      ════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex print:hidden h-full py-3 pl-3">
        {/* Collapsed icon rail */}
        {!sidebarOpen && (
          <div className="flex flex-col flex-shrink-0 w-16 bg-[#0A0E1A] rounded-2xl h-full shadow-lg z-30">
            <div className="flex flex-col items-center py-5 space-y-3 flex-1 min-h-0">
              {/* Expand toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="group p-2 text-slate-500 hover:text-white hover:bg-[#1A2540] rounded-lg transition-all duration-200"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Logo mark */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#6366F1] flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <Cpu className="w-4 h-4 text-white" />
                )}
              </div>

              <div className="w-8 border-t border-[#1E2A3A] flex-shrink-0" />

              {/* Icon buttons */}
              <div className="flex flex-col items-center space-y-1 w-full px-2 flex-1 overflow-y-auto">
                {iconRailItems.map(
                  ({ icon: Icon, title, action, featureKey }) => {
                    const locked = featureKey && !canAccess(featureKey);
                    return (
                      <button
                        key={title}
                        onClick={action}
                        className="group relative w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#1A2540] rounded-lg transition-all duration-200 flex-shrink-0"
                        title={title}
                      >
                        <Icon className="w-5 h-5" />
                        {locked && (
                          <Lock className="w-2.5 h-2.5 text-slate-600 absolute bottom-1 right-1" />
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Avatar bottom */}
            <div className="flex justify-center pb-5 flex-shrink-0">
              <div className="w-9 h-9 rounded-full ring-1 ring-[#1E2A3A] bg-[#1A2540] flex items-center justify-center overflow-hidden">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    className="w-6 h-6 object-contain"
                    alt="biz"
                  />
                ) : (
                  <Cpu className="w-4 h-4 text-blue-400" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {sidebarOpen && (
          <div className="flex-shrink-0 w-64 bg-[#0A0E1A] rounded-2xl h-full shadow-lg z-30">
            <SidebarContent />
          </div>
        )}
      </div>
    </>
  );
}

// ── Plan badge ────────────────────────────────────────────────────────────────
function PlanBadge({ currentPlan }) {
  const styles = {
    starter: {
      label: "Starter",
      bg: "bg-slate-700/50",
      text: "text-slate-300",
    },
    growth: { label: "Growth", bg: "bg-blue-500/15", text: "text-blue-400" },
    elite: { label: "Elite", bg: "bg-indigo-500/15", text: "text-indigo-400" },
  };
  const s = styles[currentPlan] ?? styles.starter;
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function Accordion({ icon: Icon, label, isOpen, onToggle, children, locked }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full group flex items-center justify-between px-3 py-2 text-slate-400 hover:text-white hover:bg-[#1A2540] rounded-lg transition-all duration-200"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{label}</span>
          {locked && <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`ml-3 mt-0.5 space-y-0.5 border-l border-[#1E2A3A] pl-3.5 overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, active, locked, badge }) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
        active
          ? "bg-[#1A2540] text-white"
          : "text-slate-400 hover:text-white hover:bg-[#1A2540]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{label}</span>
        {locked && <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />}
      </div>
      {badge != null && (
        <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
}

// ── SubItem ───────────────────────────────────────────────────────────────────
function SubItem({ label, onClick, badge, badgeColor, locked }) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between px-3 py-1.5 text-sm text-slate-500 hover:text-white hover:bg-[#1A2540] rounded-lg cursor-pointer transition-all duration-200"
    >
      <span className="flex items-center gap-1.5 truncate">
        {label}
        {locked && <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />}
      </span>
      {badge != null && (
        <span
          className={`${badgeColor ?? "text-blue-400 bg-blue-500/20"} px-1.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
