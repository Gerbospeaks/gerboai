import React, { useMemo, useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  UserCheck,
  Calendar,
  BookOpen,
  Megaphone,
  AlertCircle,
  CheckCircle,
  Activity,
} from "lucide-react";

const T = {
  bg: "#f8f7f4",
  surface: "#ffffff",
  surfaceAlt: "#f1efe9",
  border: "#e8e4db",
  text: "#1a1814",
  textMid: "#5c5850",
  textSoft: "#9c9890",
  ink: "#2d2a26",
  indigo: "#4338ca",
  indigoL: "#eef2ff",
  green: "#15803d",
  greenL: "#f0fdf4",
  amber: "#b45309",
  amberL: "#fffbeb",
  red: "#dc2626",
  redL: "#fef2f2",
  teal: "#0f766e",
  tealL: "#f0fdfa",
  radius: 16,
  shadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');`;

const KEYFRAMES = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes countUp {
    from { opacity:0; transform:scale(.85); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes barGrow {
    from { width: 0%; }
  }
`;

// ── Responsive media queries injected as a CSS string ────────────────────────
const RESPONSIVE_CSS = `
  .so-page {
    padding: 28px 24px 60px;
  }
  .so-h1 {
    font-size: 34px;
  }
  .so-stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
  .so-main-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  .so-card-wide {
    grid-column: span 2;
  }
  .so-cal-inner {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 640px) {
    .so-page {
      padding: 18px 14px 48px;
    }
    .so-h1 {
      font-size: 26px;
    }
    /* 2-column stats on mobile */
    .so-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .so-stat-value {
      font-size: 17px !important;
    }
    /* Single-column main grid */
    .so-main-grid {
      grid-template-columns: 1fr;
    }
    /* Wide card must NOT span 2 on mobile */
    .so-card-wide {
      grid-column: span 1;
    }
    /* Stack calendar mini-cal + list vertically */
    .so-cal-inner {
      grid-template-columns: 1fr;
    }
    /* Tighten card padding */
    .so-card {
      padding: 16px 14px 14px !important;
    }
    /* Staff "present / absent" mini-cards */
    .so-staff-tiles {
      gap: 8px;
    }
    /* Attendance bars — give a bit more height room */
    .so-att-bars {
      height: 80px;
    }
  }

  @media (min-width: 641px) and (max-width: 900px) {
    .so-stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .so-main-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    /* On tablet, wide card spans 2 only if 2-col fits */
    .so-card-wide {
      grid-column: span 2;
    }
  }
`;

// ── Hook: track window width ─────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function SchoolOverview({
  uid,
  students,
  staff,
  attendance,
  events,
  homework,
  notices,
  businessInfo = {},
}) {
  students = Array.isArray(students) ? students : Object.values(students || {});
  staff = Array.isArray(staff) ? staff : Object.values(staff || {});
  attendance = Array.isArray(attendance)
    ? attendance
    : Object.values(attendance || {});
  events = Array.isArray(events) ? events : Object.values(events || {});
  homework = Array.isArray(homework) ? homework : Object.values(homework || {});
  notices = Array.isArray(notices) ? notices : Object.values(notices || {});

  const winWidth = useWindowWidth();
  const isMobile = winWidth <= 640;
  const isTablet = winWidth > 640 && winWidth <= 900;

  const [calMonth, setCalMonth] = useState(() => new Date());
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // ── Derived: students ───────────────────────────────────────────────────
  const totalStudents = students.filter((s) => !s._placeholder).length;

  const byGrade = useMemo(() => {
    const map = {};
    students
      .filter((s) => !s._placeholder)
      .forEach((s) => {
        const g = s.grade || "Unassigned";
        map[g] = (map[g] || 0) + 1;
      });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [students]);

  // ── Derived: fees ───────────────────────────────────────────────────────
  const feesData = useMemo(() => {
    let totalDue = 0,
      totalPaid = 0,
      fullyPaid = 0,
      outstanding = 0;
    students
      .filter((s) => !s._placeholder && s.fees)
      .forEach((s) => {
        const paid = Number(s.fees.paid || 0);
        const total = Number(s.fees.total || 0);
        totalDue += total;
        totalPaid += paid;
        if (paid >= total && total > 0) fullyPaid++;
        else if (paid < total) outstanding++;
      });
    return {
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
      fullyPaid,
      outstanding,
      pct: totalDue ? Math.round((totalPaid / totalDue) * 100) : 0,
    };
  }, [students]);

  // ── Derived: staff ──────────────────────────────────────────────────────
  const activeStaff = staff.filter(
    (s) => !s._placeholder && s.status !== "absent",
  );
  const absentStaff = staff.filter(
    (s) => !s._placeholder && s.status === "absent",
  );

  // ── Derived: attendance ─────────────────────────────────────────────────
  const attData = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    return last7.map((date) => {
      const recs = attendance.filter((a) => a.date === date && !a._placeholder);
      const present = recs.filter((a) => a.status === "present").length;
      const total = recs.length;
      return {
        date,
        present,
        total,
        pct: total ? Math.round((present / total) * 100) : null,
        label: new Date(date + "T12:00:00").toLocaleDateString("en", {
          weekday: "short",
        }),
      };
    });
  }, [attendance]);

  const todayAtt = attData[6];
  const weekPct = useMemo(() => {
    const valid = attData.filter((d) => d.total > 0);
    if (!valid.length) return null;
    return Math.round(valid.reduce((s, d) => s + d.pct, 0) / valid.length);
  }, [attData]);

  // ── Derived: events ─────────────────────────────────────────────────────
  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => !e._placeholder && e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 8),
    [events],
  );

  // ── Derived: homework ───────────────────────────────────────────────────
  const hwThisWeek = useMemo(() => {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const wkStr = weekAgo.toISOString().split("T")[0];
    return homework.filter(
      (h) => !h._placeholder && (h.dueDate >= wkStr || !h.dueDate),
    ).length;
  }, [homework]);

  // ── Calendar helpers ────────────────────────────────────────────────────
  const calYear = calMonth.getFullYear();
  const calMon = calMonth.getMonth();
  const firstDay = new Date(calYear, calMon, 1).getDay();
  const daysInMonth = new Date(calYear, calMon + 1, 0).getDate();
  const eventDates = new Set(
    events.filter((e) => !e._placeholder).map((e) => e.date),
  );

  const prevMonth = () =>
    setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const fmt = (n) =>
    `R ${Number(n).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Shorten currency on very small screens
  const fmtShort = (n) => {
    const v = Number(n);
    if (!isMobile) return fmt(v);
    if (v >= 1_000_000) return `R${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `R${(v / 1_000).toFixed(1)}k`;
    return `R${v.toFixed(0)}`;
  };

  const maxGrade = Math.max(...byGrade.map(([, c]) => c), 1);

  return (
    <div
      className="so-page"
      style={{
        background: T.bg,
        minHeight: "100vh",
        fontFamily: "'Sora',sans-serif",
        WebkitFontSmoothing: "antialiased",
        boxSizing: "border-box",
      }}
    >
      <style>{FONTS + KEYFRAMES + RESPONSIVE_CSS}</style>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div
        style={{
          marginBottom: isMobile ? 18 : 28,
          animation: "fadeUp .3s ease",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            color: T.textSoft,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {businessInfo.name || "School"} ·{" "}
          {today.toLocaleDateString("en", {
            weekday: isMobile ? "short" : "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1
          className="so-h1"
          style={{
            margin: 0,
            fontFamily: "'Crimson Pro',serif",
            fontWeight: 600,
            color: T.ink,
            lineHeight: 1.1,
          }}
        >
          School Overview
        </h1>
      </div>

      {/* ── TOP STATS STRIP ─────────────────────────────────────────────── */}
      <div
        className="so-stats-grid"
        style={{
          display: "grid",
          gap: isMobile ? 8 : 12,
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        {[
          {
            label: "Students",
            value: totalStudents,
            icon: Users,
            color: T.indigo,
            bg: T.indigoL,
          },
          {
            label: "Staff Present",
            value: `${activeStaff.length}/${staff.filter((s) => !s._placeholder).length}`,
            icon: UserCheck,
            color: T.green,
            bg: T.greenL,
          },
          {
            label: "Fees Collected",
            value: fmtShort(feesData.totalPaid),
            icon: DollarSign,
            color: T.teal,
            bg: T.tealL,
          },
          {
            label: "Outstanding",
            value: fmtShort(feesData.balance),
            icon: AlertCircle,
            color: feesData.balance > 0 ? T.red : T.green,
            bg: feesData.balance > 0 ? T.redL : T.greenL,
          },
          {
            label: "Attendance",
            value: todayAtt?.pct != null ? `${todayAtt.pct}%` : "—",
            icon: Activity,
            color: T.amber,
            bg: T.amberL,
          },
          {
            label: "HW This Week",
            value: `${hwThisWeek} tasks`,
            icon: BookOpen,
            color: T.indigo,
            bg: T.indigoL,
          },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div
            key={label}
            style={{
              background: T.surface,
              borderRadius: T.radius,
              padding: isMobile ? "14px 12px 12px" : "18px 18px 16px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              animation: `fadeUp .3s ease ${i * 0.05}s both`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 600,
                  color: T.textSoft,
                  letterSpacing: ".04em",
                  /* Truncate long labels on very small screens */
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "calc(100% - 36px)",
                }}
              >
                {label.toUpperCase()}
              </p>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: 14, height: 14, color }} />
              </div>
            </div>
            <p
              className="so-stat-value"
              style={{
                margin: 0,
                fontSize: isMobile ? 17 : 22,
                fontWeight: 800,
                color: T.ink,
                animation: "countUp .4s ease",
                letterSpacing: "-.02em",
                lineHeight: 1.1,
                /* Prevent overflow of long currency strings */
                overflowWrap: "break-word",
                wordBreak: "break-word",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <div
        className="so-main-grid"
        style={{ display: "grid", gap: isMobile ? 12 : 16 }}
      >
        {/* ══ Students by class ══════════════════════════════════════════ */}
        <Card
          title="Students by Class"
          icon={Users}
          iconColor={T.indigo}
          iconBg={T.indigoL}
          isMobile={isMobile}
        >
          {byGrade.length === 0 ? (
            <Empty msg="No students added yet" />
          ) : (
            byGrade.map(([grade, count]) => (
              <div key={grade} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: T.text }}
                  >
                    {grade}
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: T.indigo }}
                  >
                    {count}{" "}
                    <span style={{ color: T.textSoft, fontWeight: 400 }}>
                      student{count !== 1 ? "s" : ""}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 99,
                    background: T.surfaceAlt,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      background: `linear-gradient(90deg,${T.indigo},#818cf8)`,
                      width: `${(count / maxGrade) * 100}%`,
                      animation: "barGrow .6s ease",
                    }}
                  />
                </div>
              </div>
            ))
          )}
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${T.border}`,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, color: T.textSoft, fontWeight: 600 }}>
              TOTAL
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>
              {totalStudents} students · {byGrade.length} class
              {byGrade.length !== 1 ? "es" : ""}
            </span>
          </div>
        </Card>

        {/* ══ Fees overview ═══════════════════════════════════════════════ */}
        <Card
          title="Fees Overview"
          icon={DollarSign}
          iconColor={T.teal}
          iconBg={T.tealL}
          isMobile={isMobile}
        >
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "'Crimson Pro',serif",
                fontSize: isMobile ? 36 : 42,
                fontWeight: 600,
                color: T.ink,
              }}
            >
              {feesData.pct}%
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: T.textSoft,
                fontWeight: 500,
              }}
            >
              of total fees collected
            </p>
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 99,
              background: T.surfaceAlt,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                background: `linear-gradient(90deg,${T.teal},#34d399)`,
                width: `${feesData.pct}%`,
                animation: "barGrow .8s ease",
              }}
            />
          </div>
          {[
            {
              label: "Total Fees Due",
              value: fmt(feesData.totalDue),
              color: T.textMid,
            },
            {
              label: "Total Collected",
              value: fmt(feesData.totalPaid),
              color: T.green,
            },
            {
              label: "Balance Outstanding",
              value: fmt(feesData.balance),
              color: feesData.balance > 0 ? T.red : T.green,
            },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom: `1px solid ${T.border}`,
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: T.textMid,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {r.label}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: r.color,
                  textAlign: "right",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                {r.value}
              </span>
            </div>
          ))}
          <div
            style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}
          >
            <Pill
              label={`${feesData.fullyPaid} fully paid`}
              color={T.green}
              bg={T.greenL}
            />
            <Pill
              label={`${feesData.outstanding} outstanding`}
              color={T.red}
              bg={T.redL}
            />
          </div>
        </Card>

        {/* ══ Attendance 7-day chart ═══════════════════════════════════════ */}
        <Card
          title="Attendance — Last 7 Days"
          icon={Activity}
          iconColor={T.amber}
          iconBg={T.amberL}
          isMobile={isMobile}
        >
          {weekPct != null && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "'Crimson Pro',serif",
                  fontSize: isMobile ? 28 : 36,
                  fontWeight: 600,
                  color: T.ink,
                }}
              >
                {weekPct}%
              </span>
              <span
                style={{ fontSize: 12, color: T.textSoft, fontWeight: 500 }}
              >
                avg this week
              </span>
            </div>
          )}
          <div
            className="so-att-bars"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: isMobile ? 4 : 6,
              height: 90,
              marginBottom: 8,
            }}
          >
            {attData.map((d, i) => {
              const h = d.pct != null ? Math.max((d.pct / 100) * 90, 4) : 6;
              const isToday = d.date === todayStr;
              const barColor =
                d.pct == null
                  ? T.border
                  : d.pct >= 80
                    ? T.green
                    : d.pct >= 60
                      ? T.amber
                      : T.red;
              return (
                <div
                  key={d.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {d.pct != null && (
                    <span
                      style={{
                        fontSize: isMobile ? 8 : 9,
                        fontWeight: 700,
                        color: T.textSoft,
                      }}
                    >
                      {d.pct}%
                    </span>
                  )}
                  <div
                    style={{
                      width: "100%",
                      height: h,
                      borderRadius: 5,
                      background: barColor,
                      opacity: d.pct == null ? 0.3 : 1,
                      animation: `barGrow .5s ease ${i * 0.06}s both`,
                      outline: isToday ? `2px solid ${T.amber}` : "none",
                      outlineOffset: 1,
                    }}
                  />
                  <span
                    style={{
                      fontSize: isMobile ? 9 : 10,
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? T.amber : T.textSoft,
                    }}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}
          >
            <Pill label="≥80% good" color={T.green} bg={T.greenL} />
            <Pill label="60–79% fair" color={T.amber} bg={T.amberL} />
            <Pill label="<60% low" color={T.red} bg={T.redL} />
          </div>
        </Card>

        {/* ══ Staff today ══════════════════════════════════════════════════ */}
        <Card
          title="Staff Today"
          icon={UserCheck}
          iconColor={T.green}
          iconBg={T.greenL}
          isMobile={isMobile}
        >
          <div
            className="so-staff-tiles"
            style={{ display: "flex", gap: 10, marginBottom: 16 }}
          >
            <div
              style={{
                flex: 1,
                background: T.greenL,
                borderRadius: 12,
                padding: "12px 14px",
                border: "1px solid #86efac",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Crimson Pro',serif",
                  fontSize: 28,
                  fontWeight: 600,
                  color: T.green,
                }}
              >
                {activeStaff.length}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: T.green,
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                Present
              </p>
            </div>
            <div
              style={{
                flex: 1,
                background: absentStaff.length > 0 ? T.redL : T.greenL,
                borderRadius: 12,
                padding: "12px 14px",
                border: `1px solid ${absentStaff.length > 0 ? "#fca5a5" : "#86efac"}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Crimson Pro',serif",
                  fontSize: 28,
                  fontWeight: 600,
                  color: absentStaff.length > 0 ? T.red : T.green,
                }}
              >
                {absentStaff.length}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: absentStaff.length > 0 ? T.red : T.green,
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                Absent
              </p>
            </div>
          </div>

          {absentStaff.length > 0 && (
            <>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.textSoft,
                  letterSpacing: ".06em",
                }}
              >
                ABSENT TODAY
              </p>
              {absentStaff.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: `hsl(${s.name?.charCodeAt(0) * 7 || 0},50%,85%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: `hsl(${s.name?.charCodeAt(0) * 7 || 0},40%,35%)`,
                      flexShrink: 0,
                    }}
                  >
                    {s.name
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.text,
                      }}
                    >
                      {s.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: T.textSoft }}>
                      {s.role}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          {absentStaff.length === 0 && activeStaff.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                background: T.greenL,
                borderRadius: 10,
                border: "1px solid #86efac",
              }}
            >
              <CheckCircle
                style={{ width: 15, height: 15, color: T.green, flexShrink: 0 }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.green,
                }}
              >
                All staff present today 🎉
              </p>
            </div>
          )}

          {staff.filter((s) => !s._placeholder).length === 0 && (
            <Empty msg="No staff added yet" />
          )}
        </Card>

        {/* ══ School calendar (wide) ═══════════════════════════════════════ */}
        <Card
          title="School Calendar"
          icon={Calendar}
          iconColor={T.indigo}
          iconBg={T.indigoL}
          wide
          isMobile={isMobile}
          isTablet={isTablet}
        >
          {/* Inner grid: side-by-side on ≥641 px, stacked on mobile */}
          <div
            className="so-cal-inner"
            style={{
              display: "grid",
              gap: isMobile ? 20 : 20,
            }}
          >
            {/* Mini calendar */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <button
                  onClick={prevMonth}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: T.textMid,
                    touchAction: "manipulation",
                  }}
                >
                  ‹
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>
                  {calMonth.toLocaleDateString("en", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={nextMonth}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: T.textMid,
                    touchAction: "manipulation",
                  }}
                >
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7,1fr)",
                  gap: 2,
                  marginBottom: 4,
                }}
              >
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.textSoft,
                      padding: "3px 0",
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7,1fr)",
                  gap: 2,
                }}
              >
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dStr = `${calYear}-${String(calMon + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday = dStr === todayStr;
                  const hasEvt = eventDates.has(dStr);
                  return (
                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        padding: "5px 2px",
                        borderRadius: 7,
                        background: isToday ? T.indigo : "transparent",
                        position: "relative",
                        cursor: hasEvt ? "pointer" : "default",
                        /* Bigger tap target on mobile */
                        minHeight: isMobile ? 30 : "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: isMobile ? 12 : 11,
                          fontWeight: isToday ? 700 : hasEvt ? 600 : 400,
                          color: isToday
                            ? "#fff"
                            : hasEvt
                              ? T.indigo
                              : T.textMid,
                        }}
                      >
                        {day}
                      </span>
                      {hasEvt && !isToday && (
                        <div
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: T.indigo,
                            marginTop: 1,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming events list */}
            <div>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.textSoft,
                  letterSpacing: ".06em",
                }}
              >
                UPCOMING EVENTS
              </p>
              {upcomingEvents.length === 0 ? (
                <Empty msg="No upcoming events" />
              ) : (
                upcomingEvents.slice(0, 5).map((e) => {
                  const daysAway = Math.ceil(
                    (new Date(e.date + "T12:00:00") - today) / 86400000,
                  );
                  return (
                    <div
                      key={e.id || e.title}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: "8px 0",
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          flexShrink: 0,
                          textAlign: "center",
                          background: daysAway <= 3 ? T.redL : T.indigoL,
                          borderRadius: 9,
                          padding: "4px 0",
                          border: `1px solid ${daysAway <= 3 ? "#fecaca" : "#c7d2fe"}`,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 800,
                            color: daysAway <= 3 ? T.red : T.indigo,
                            lineHeight: 1,
                          }}
                        >
                          {new Date(e.date + "T12:00:00").getDate()}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 9,
                            fontWeight: 600,
                            color: daysAway <= 3 ? T.red : T.indigo,
                          }}
                        >
                          {new Date(e.date + "T12:00:00")
                            .toLocaleDateString("en", { month: "short" })
                            .toUpperCase()}
                        </p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {e.title}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: T.textSoft,
                          }}
                        >
                          {daysAway === 0
                            ? "Today"
                            : daysAway === 1
                              ? "Tomorrow"
                              : `In ${daysAway} days`}
                          {e.time ? ` · ${e.time}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* ══ Recent notices ═══════════════════════════════════════════════ */}
        <Card
          title="Recent Notices"
          icon={Megaphone}
          iconColor={T.amber}
          iconBg={T.amberL}
          isMobile={isMobile}
        >
          {notices.filter((n) => !n._placeholder).length === 0 ? (
            <Empty msg="No notices yet" />
          ) : (
            notices
              .filter((n) => !n._placeholder)
              .slice(0, 4)
              .map((n, i) => {
                const typeColors = {
                  important: { bg: "#fef2f2", color: T.red, border: "#fecaca" },
                  action: { bg: "#fffbeb", color: T.amber, border: "#fcd34d" },
                  fee: { bg: T.tealL, color: T.teal, border: "#99f6e4" },
                  info: { bg: T.indigoL, color: T.indigo, border: "#c7d2fe" },
                };
                const tc = typeColors[n.type] || typeColors.info;
                return (
                  <div
                    key={n.id || i}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: i < 3 ? `1px solid ${T.border}` : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        flexShrink: 0,
                        borderRadius: 99,
                        background: tc.color,
                        marginTop: 2,
                        alignSelf: "stretch",
                        minHeight: 32,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 3,
                          flexWrap: "wrap",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 700,
                            color: T.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          {n.title}
                        </p>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 99,
                            background: tc.bg,
                            color: tc.color,
                            border: `1px solid ${tc.border}`,
                            flexShrink: 0,
                          }}
                        >
                          {n.type || "info"}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: T.textSoft,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {n.message}
                      </p>
                    </div>
                  </div>
                );
              })
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Shared small components ───────────────────────────────────────────────────
function Card({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  children,
  wide,
  isMobile,
  isTablet,
}) {
  return (
    <div
      className={`so-card ${wide ? "so-card-wide" : ""}`}
      style={{
        background: T.surface,
        borderRadius: T.radius + 2,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        padding: "20px 20px 18px",
        // JS fallback for wide: on desktop span 2, on mobile/tablet controlled by CSS class
        animation: "fadeUp .35s ease both",
        minWidth: 0, // prevent grid blowout
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon style={{ width: 16, height: 16, color: iconColor }} />
        </div>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Pill({ label, color, bg }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 99,
        background: bg,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {label}
    </span>
  );
}

function Empty({ msg }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: T.textSoft,
          fontStyle: "italic",
        }}
      >
        {msg}
      </p>
    </div>
  );
}
