import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calendar,
  BarChart3,
  LogOut,
  ClipboardList,
  FileText,
  BookOpen,
  Award,
  UserCheck,
  GraduationCap,
  Bell,
  Library,
} from "lucide-react";
import logo from "../../assets/img/logo.png";

export default function EducationSidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleLogout,
  schoolInfo,
  savedReports,
  savedStudents,
  showReportsList,
  setShowReportsList,
  setShowStudentsListModal,
  handleAddNewStudent,
}) {
  const [isReportCardsOpen, setIsReportCardsOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const goTo = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Collapsed sidebar (icon rail) — flex child, NOT fixed ─────── */}
      {!sidebarOpen && (
        <div className="hidden md:flex flex-col flex-shrink-0 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden shadow-xl z-30">
          <div className="flex flex-col items-center py-4 md:py-6 space-y-4 md:space-y-6 flex-1">
            {/* Expand toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="group p-2 md:p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
            </button>

            {/* Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-4 rounded-xl p-1 shadow-lg">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="w-10 border-t border-slate-600" />

            {/* Icon nav */}
            <div className="flex flex-col items-center space-y-3 md:space-y-4 w-full px-2 md:px-3">
              {[
                {
                  icon: Home,
                  title: "Home",
                  action: () => setActiveView("home"),
                  color: "from-stone-600 to-stone-700",
                  text: "text-cyan-400",
                },
                {
                  icon: Settings,
                  title: "Settings",
                  action: () => setShowSettings(true),
                  color: "from-blue-600 to-blue-700",
                  text: "text-slate-400",
                },
                {
                  icon: TrendingUp,
                  title: "School Overview",
                  action: () => goTo("overview"),
                  color: "from-indigo-600 to-indigo-700",
                  text: "text-slate-400",
                },
                {
                  icon: ClipboardList,
                  title: "Report Cards",
                  action: () => goTo("reportCard"),
                  color: "from-violet-600 to-violet-700",
                  text: "text-slate-400",
                },
                {
                  icon: FileText,
                  title: "Templates",
                  action: () => goTo("templates"),
                  color: "from-purple-600 to-purple-700",
                  text: "text-slate-400",
                },
                {
                  icon: Users,
                  title: "Students",
                  action: () => setShowStudentsListModal?.(true),
                  color: "from-blue-600 to-blue-700",
                  text: "text-slate-400",
                },
                {
                  icon: Calendar,
                  title: "Attendance",
                  action: () => goTo("attendance"),
                  color: "from-cyan-600 to-cyan-700",
                  text: "text-slate-400",
                },
                {
                  icon: BookOpen,
                  title: "Curriculum",
                  action: () => goTo("curriculum"),
                  color: "from-teal-600 to-teal-700",
                  text: "text-slate-400",
                },
                {
                  icon: Award,
                  title: "Assessments",
                  action: () => goTo("assessments"),
                  color: "from-blue-600 to-blue-700",
                  text: "text-slate-400",
                },
                {
                  icon: BarChart3,
                  title: "Analytics",
                  action: () => goTo("analytics"),
                  color: "from-indigo-600 to-indigo-700",
                  text: "text-slate-400",
                },
                {
                  icon: UserCheck,
                  title: "Staff",
                  action: () => goTo("staff"),
                  color: "from-slate-600 to-slate-700",
                  text: "text-slate-400",
                },
              ].map(({ icon: Icon, title, action, color, text }) => (
                <button
                  key={title}
                  onClick={action}
                  className={`group relative p-2 md:p-3 ${text} hover:text-white rounded-xl transition-all duration-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden`}
                  title={title}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <Icon className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </div>

          {/* School logo bottom */}
          <div className="flex justify-center pb-4 md:pb-6">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center overflow-hidden">
              {schoolInfo?.logoUrl ? (
                <img
                  src={schoolInfo.logoUrl}
                  className="w-6 h-6 object-contain"
                  alt="school"
                />
              ) : (
                <GraduationCap className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded sidebar — flex child on desktop, fixed overlay on mobile ── */}
      {sidebarOpen && (
        <div className="flex-shrink-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden shadow-2xl overflow-y-auto z-50 md:relative fixed inset-y-0 left-0">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <img
                src={logo}
                alt="School Logo"
                className="w-16 h-12 object-contain rounded-lg"
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              <NavItem
                icon={Home}
                label="Home"
                onClick={() => goTo("home")}
                color="cyan"
              />
              <NavItem
                icon={Settings}
                label="Settings"
                onClick={() => {
                  setShowSettings(true);
                  setSidebarOpen(false);
                }}
                color="blue"
              />

              <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
                <NavItem
                  icon={TrendingUp}
                  label="School Overview"
                  onClick={() => goTo("overview")}
                  color="indigo"
                />

                {/* Report Cards accordion */}
                <Accordion
                  icon={ClipboardList}
                  label="Report Cards"
                  isOpen={isReportCardsOpen}
                  onToggle={() => setIsReportCardsOpen((p) => !p)}
                >
                  <SubItem
                    label="Create Report Card"
                    onClick={() => goTo("reportCard")}
                  />
                  <SubItem
                    label="All Reports"
                    badge={savedReports?.length ?? 0}
                    onClick={() => {
                      setShowReportsList?.((p) => !p);
                      setSidebarOpen(false);
                    }}
                  />
                </Accordion>

                <NavItem
                  icon={FileText}
                  label="Templates"
                  onClick={() => goTo("templates")}
                  color="purple"
                />

                {/* Students accordion */}
                <Accordion
                  icon={Users}
                  label="Students"
                  isOpen={isStudentsOpen}
                  onToggle={() => setIsStudentsOpen((p) => !p)}
                >
                  <SubItem
                    label="Add Student"
                    onClick={() => {
                      handleAddNewStudent?.();
                      setSidebarOpen(false);
                    }}
                  />
                  <SubItem
                    label="All Students"
                    badge={savedStudents?.length ?? 0}
                    onClick={() => {
                      setShowStudentsListModal?.(true);
                      setSidebarOpen(false);
                    }}
                  />
                </Accordion>

                <NavItem
                  icon={Calendar}
                  label="Attendance"
                  onClick={() => goTo("attendance")}
                  color="blue"
                />
                <NavItem
                  icon={BookOpen}
                  label="Curriculum"
                  onClick={() => goTo("curriculum")}
                  color="teal"
                />
                <NavItem
                  icon={Award}
                  label="Assessments"
                  onClick={() => goTo("assessments")}
                  color="blue"
                />

                {/* Analytics accordion */}
                <Accordion
                  icon={BarChart3}
                  label="Analytics"
                  isOpen={isAnalyticsOpen}
                  onToggle={() => setIsAnalyticsOpen((p) => !p)}
                >
                  <SubItem
                    label="Performance"
                    onClick={() => goTo("analytics-performance")}
                  />
                  <SubItem
                    label="Attendance Trends"
                    onClick={() => goTo("analytics-attendance")}
                  />
                  <SubItem
                    label="Grade Reports"
                    onClick={() => goTo("analytics-grades")}
                  />
                </Accordion>

                <NavItem
                  icon={UserCheck}
                  label="Staff"
                  onClick={() => goTo("staff")}
                  color="slate"
                />
                <NavItem
                  icon={Library}
                  label="Library"
                  onClick={() => goTo("library")}
                  color="indigo"
                />
                <NavItem
                  icon={Bell}
                  label="Notices"
                  onClick={() => goTo("notices")}
                  color="blue"
                />
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 border-t border-slate-700/50 bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {schoolInfo?.logoUrl ? (
                  <img
                    src={schoolInfo.logoUrl}
                    alt="School Logo"
                    className="max-h-[70%] max-w-[70%] object-contain"
                  />
                ) : (
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "Teacher"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || "teacher@school.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="group text-slate-400 hover:text-white hover:bg-red-600/20 p-2 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/30 flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Accordion wrapper ─────────────────────────────────────────────────────────
function Accordion({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full group flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium truncate">{label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, onClick, color }) {
  const colors = {
    cyan: "text-cyan-300 hover:from-stone-600/20 hover:to-stone-700/20 hover:border-cyan-500/30",
    blue: "text-slate-300 hover:from-blue-600/20 hover:to-blue-700/20 hover:border-blue-500/30",
    indigo:
      "text-slate-300 hover:from-indigo-600/20 hover:to-indigo-700/20 hover:border-indigo-500/30",
    purple:
      "text-slate-300 hover:from-purple-600/20 hover:to-purple-700/20 hover:border-purple-500/30",
    teal: "text-slate-300 hover:from-teal-600/20 hover:to-teal-700/20 hover:border-teal-500/30",
    slate:
      "text-slate-300 hover:from-slate-600/20 hover:to-slate-700/20 hover:border-slate-500/30",
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div
      onClick={onClick}
      className={`group flex items-center space-x-3 px-3 py-2.5 ${c} hover:text-white hover:bg-gradient-to-r rounded-lg cursor-pointer transition-all duration-200 border border-transparent`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
      <span className="text-sm font-medium truncate">{label}</span>
    </div>
  );
}

// ── SubItem ───────────────────────────────────────────────────────────────────
function SubItem({ label, onClick, badge }) {
  return (
    <div
      onClick={onClick}
      className="group px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="truncate">{label}</span>
        {badge != null && (
          <span className="text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
