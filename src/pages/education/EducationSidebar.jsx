import React, { useState } from "react";
import {
  Home,
  Settings,
  TrendingUp,
  Users,
  ChevronRight,
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
  School,
  X,
  Clock,
  Megaphone,
  BookMarked,
  Plus,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function useDateInfo() {
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return { dayName, dateStr };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EducationSidebar({
  navigate,
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  setShowSettings,
  handleLogout,
  businessInfo,
  savedReports,
  savedStudents,
  showReportsList,
  setShowReportsList,
  onOpenStudentModal,
  onOpenStudentsListModal,
  onOpenNoticeModal,
  onOpenHomeworkModal,
  onOpenAttendanceModal,
  onOpenEventModal,
  onOpenStaffModal,
  onOpenTimetableModal,
}) {
  const [isReportCardsOpen, setIsReportCardsOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isNoticesOpen, setIsNoticesOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);

  const { dayName, dateStr } = useDateInfo();

  const goTo = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const openModal = (fn) => {
    setSidebarOpen(false);
    fn?.();
  };

  // ── Collapsed icon-rail items ─────────────────────────────────────────────
  const iconRailItems = [
    {
      icon: Home,
      title: "Home",
      action: () => goTo("home"),
      color: "from-cyan-600 to-cyan-700",
    },
    {
      icon: Settings,
      title: "Settings",
      action: () => setShowSettings(true),
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: TrendingUp,
      title: "School Overview",
      action: () => goTo("overview"),
      color: "from-indigo-600 to-indigo-700",
    },
    {
      icon: ClipboardList,
      title: "Report Cards",
      action: () => goTo("reports"),
      color: "from-violet-600 to-violet-700",
    },
    {
      icon: FileText,
      title: "Templates",
      action: () => goTo("templates"),
      color: "from-purple-600 to-purple-700",
    },
    {
      icon: Users,
      title: "All Students",
      action: () => openModal(onOpenStudentsListModal),
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: UserCheck,
      title: "Attendance",
      action: () => openModal(onOpenAttendanceModal),
      color: "from-cyan-600 to-cyan-700",
    },
    {
      icon: BookMarked,
      title: "Homework",
      action: () => openModal(onOpenHomeworkModal),
      color: "from-violet-600 to-violet-700",
    },
    {
      icon: Megaphone,
      title: "Notices",
      action: () => openModal(onOpenNoticeModal),
      color: "from-amber-600 to-amber-700",
    },
    {
      icon: BookOpen,
      title: "Curriculum",
      action: () => goTo("curriculum"),
      color: "from-teal-600 to-teal-700",
    },
    {
      icon: Award,
      title: "Assessments",
      action: () => goTo("assessments"),
      color: "from-blue-600 to-blue-700",
    },
   
    {
      icon: Users,
      title: "Staff",
      action: () => goTo("staff"),
      color: "from-slate-600 to-slate-700",
    },
    {
      icon: Calendar,
      title: "Events",
      action: () => openModal(onOpenEventModal),
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: Clock,
      title: "Timetable",
      action: () => openModal(onOpenTimetableModal),
      color: "from-teal-600 to-teal-700",
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Collapsed rail (desktop only) ──────────────────────────────── */}
      {!sidebarOpen && (
        <div className="hidden md:flex flex-col flex-shrink-0 w-16 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden shadow-xl z-30">
          <div className="flex flex-col items-center py-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin">
            {/* Expand toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="group p-2 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 hover:shadow-blue-500/40 hover:shadow-lg hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5 group-hover:animate-pulse" />
            </button>

            {/* School logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
              {businessInfo?.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  alt="Logo"
                  className="w-6 h-6 object-contain rounded"
                />
              ) : (
                <School className="w-5 h-5 text-white" />
              )}
            </div>

            <div className="w-8 border-t border-slate-700" />

            {/* Icon nav */}
            {iconRailItems.map(({ icon: Icon, title, action, color }) => (
              <button
                key={title}
                onClick={action}
                className="group relative p-2 text-slate-400 hover:text-white rounded-xl transition-all duration-300 w-10 h-10 flex items-center justify-center overflow-hidden"
                title={title}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}
                />
                <Icon className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </button>
            ))}
          </div>

          {/* Bottom school avatar */}
          <div className="flex justify-center pb-4">
            <div className="w-10 h-10 bg-white rounded-full ring-2 ring-slate-700 shadow-lg flex items-center justify-center overflow-hidden">
              {businessInfo?.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
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

      {/* ── Expanded sidebar ───────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="flex-shrink-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-full print:hidden shadow-2xl overflow-y-auto z-50 md:relative fixed inset-y-0 left-0 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    alt="Logo"
                    className="w-6 h-6 object-contain rounded"
                  />
                ) : (
                  <School className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate leading-tight">
                  {businessInfo?.name || "Sunshine"}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase truncate">
                  {businessInfo?.tagline || "Learning Centre"}
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Date chip */}
          <div className="px-4 py-3 border-b border-slate-700/40">
            <div className="bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-700/50">
              <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                {dayName.toUpperCase()}
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5">
                {dateStr}
              </div>
            </div>
          </div>

          {/* ── Nav ─────────────────────────────────────────────────────── */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
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
            <NavItem
              icon={TrendingUp}
              label="School Overview"
              onClick={() => goTo("overview")}
              color="indigo"
            />

            <div className="pt-3 mt-3 border-t border-slate-700/50 space-y-0.5">
              {/* ── Report Cards ── */}
              <Accordion
                icon={ClipboardList}
                label="Report Cards"
                isOpen={isReportCardsOpen}
                onToggle={() => setIsReportCardsOpen((p) => !p)}
              >
                <SubItem
                  label="Create Report Card"
                  onClick={() => goTo("reports")}
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

              {/* ── Students ── */}
              <Accordion
                icon={Users}
                label="Students"
                isOpen={isStudentsOpen}
                onToggle={() => setIsStudentsOpen((p) => !p)}
              >
                <SubItem
                  label="Add Student"
                  icon={Plus}
                  onClick={() => openModal(onOpenStudentModal)}
                />
                <SubItem
                  label="All Students"
                  badge={savedStudents?.length ?? 0}
                  onClick={() => openModal(onOpenStudentsListModal)}
                />
              </Accordion>

              {/* ── Attendance ── */}
              <Accordion
                icon={UserCheck}
                label="Attendance"
                isOpen={isAttendanceOpen}
                onToggle={() => setIsAttendanceOpen((p) => !p)}
              >
                <SubItem
                  label="Take Attendance"
                  onClick={() => openModal(onOpenAttendanceModal)}
                />
                <SubItem
                  label="View Register"
                  onClick={() => goTo("attendance")}
                />
              </Accordion>

              {/* ── Notices ── */}
              <Accordion
                icon={Megaphone}
                label="Notices"
                isOpen={isNoticesOpen}
                onToggle={() => setIsNoticesOpen((p) => !p)}
              >
                <SubItem
                  label="New Notice"
                  onClick={() => openModal(onOpenNoticeModal)}
                />
                <SubItem label="All Notices" onClick={() => goTo("notices")} />
              </Accordion>

              {/* ── Homework ── */}
              <Accordion
                icon={BookMarked}
                label="Homework"
                isOpen={false}
                onToggle={() => openModal(onOpenHomeworkModal)}
              />

              {/* ── Staff ── */}
              <Accordion
                icon={UserCheck}
                label="Staff"
                isOpen={isStaffOpen}
                onToggle={() => setIsStaffOpen((p) => !p)}
              >
                <SubItem
                  label="Add Staff Member"
                  onClick={() => openModal(onOpenStaffModal)}
                />
                <SubItem label="View All Staff" onClick={() => goTo("staff")} />
              </Accordion>

              {/* ── Standalone items ── */}
              <NavItem
                icon={Clock}
                label="Timetable"
                onClick={() => openModal(onOpenTimetableModal)}
                color="teal"
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
              <NavItem
                icon={Calendar}
                label="Events"
                onClick={() => openModal(onOpenEventModal)}
                color="blue"
              />

            </div>
          </nav>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="sticky bottom-0 p-4 border-t border-slate-700/50 bg-slate-900 space-y-1">
            <button
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="w-full group flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/40 rounded-lg transition-all duration-200 text-sm"
            >
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full group flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 text-sm"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              <span>Sign Out</span>
            </button>

            {/* User identity chip */}
            <div className="flex items-center gap-2.5 mt-2 px-2 pt-2 border-t border-slate-700/40">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    alt="school"
                    className="w-5 h-5 object-contain rounded"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase() || "P"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || "Principal"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.email || "Admin"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4">
          {children}
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, onClick, color }) {
  const colors = {
    cyan: "text-cyan-300 hover:from-cyan-600/20 hover:to-cyan-700/20 hover:border-cyan-500/30",
    blue: "text-slate-300 hover:from-blue-600/20 hover:to-blue-700/20 hover:border-blue-500/30",
    indigo:
      "text-slate-300 hover:from-indigo-600/20 hover:to-indigo-700/20 hover:border-indigo-500/30",
    purple:
      "text-slate-300 hover:from-purple-600/20 hover:to-purple-700/20 hover:border-purple-500/30",
    teal: "text-slate-300 hover:from-teal-600/20 hover:to-teal-700/20 hover:border-teal-500/30",
    slate:
      "text-slate-300 hover:from-slate-600/20 hover:to-slate-700/20 hover:border-slate-500/30",
    amber:
      "text-amber-300 hover:from-amber-600/20 hover:to-amber-700/20 hover:border-amber-500/30",
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

function SubItem({ label, onClick, badge, icon: Icon }) {
  return (
    <div
      onClick={onClick}
      className="group px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
          <span className="truncate">{label}</span>
        </div>
        {badge != null && (
          <span className="text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
