// src/components/education/AttendanceTrends.jsx
// Attendance trend reports — weekly + monthly breakdown per student and class.
// Uses attendance records already saved in Firebase by saveAttendance().
//
// Props:
//   userId    — from user?.uid
//   students  — array of student objects (from useFeesFirebase or your students collection)

import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  UserCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

const db = getFirestore();

// ── Token colours ─────────────────────────────────────────────────────────────
const Z = {
  blue: "#0D6EFD",
  blueL: "#E8F0FE",
  green: "#0F7B3F",
  greenL: "#EBF8F1",
  red: "#C0392B",
  redL: "#FDEEEC",
  amber: "#975A00",
  amberL: "#FEF6E4",
  ink: "#1A2133",
  mid: "#4A5568",
  soft: "#8A97A8",
  border: "#DDE3ED",
  bg: "#F0F3F9",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const STATUS_COLOR = {
  present: Z.green,
  absent: Z.red,
  late: Z.amber,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const isoWeek = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const isoMonth = (dateStr) => dateStr?.slice(0, 7);

const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

// ── Mini bar chart (SVG) ─────────────────────────────────────────────────────
const MiniBar = ({ data, maxVal, color }) => {
  const w = 28,
    gap = 5,
    h = 40;
  return (
    <svg
      width={(w + gap) * data.length}
      height={h + 18}
      style={{ overflow: "visible" }}
    >
      {data.map((v, i) => {
        const barH = maxVal ? Math.round((v.val / maxVal) * h) : 0;
        return (
          <g key={i}>
            <rect
              x={i * (w + gap)}
              y={h - barH}
              width={w}
              height={barH || 2}
              rx={4}
              fill={color}
              opacity={0.85}
            />
            <text
              x={i * (w + gap) + w / 2}
              y={h + 14}
              textAnchor="middle"
              fontSize={9}
              fill={Z.soft}
              fontFamily="DM Sans, sans-serif"
            >
              {v.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Attendance dot calendar ───────────────────────────────────────────────────
const DotCalendar = ({ records }) => {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {sorted.map((r) => (
        <div
          key={r.date}
          title={`${r.date}: ${r.status}`}
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: STATUS_COLOR[r.status] || Z.soft,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
};

// ── Student attendance card ───────────────────────────────────────────────────
const StudentCard = ({ student, records }) => {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const rate = pct(present, total);

  const rateColor = rate >= 90 ? Z.green : rate >= 75 ? Z.amber : Z.red;

  const name =
    student.name ||
    `${student.firstName || ""} ${student.lastName || ""}`.trim();

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${Z.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        borderLeft: `4px solid ${rateColor}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: `hsl(${(name.charCodeAt(0) * 47) % 360},65%,88%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: `hsl(${(name.charCodeAt(0) * 47) % 360},45%,35%)`,
          }}
        >
          {name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: Z.ink }}>
              {name}
            </div>
            <div style={{ fontSize: 11, color: Z.soft }}>{student.grade}</div>
            {rate < 75 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10,
                  fontWeight: 700,
                  color: Z.red,
                  background: Z.redL,
                  padding: "1px 8px",
                  borderRadius: 99,
                }}
              >
                <AlertCircle style={{ width: 10, height: 10 }} />
                LOW ATTENDANCE
              </span>
            )}
          </div>

          {/* Stats row */}
          <div
            style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}
          >
            {[
              { label: "Rate", value: `${rate}%`, color: rateColor },
              { label: "Present", value: present, color: Z.green },
              { label: "Absent", value: absent, color: Z.red },
              { label: "Late", value: late, color: Z.amber },
              { label: "Days", value: total, color: Z.soft },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: Z.soft,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Dot calendar */}
          {records.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <DotCalendar records={records} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AttendanceTrends = ({ userId, students = [] }) => {
  const [allRecords, setAllRecords] = useState([]); // [{studentId, date, status}]
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview"); // overview | students | heatmap
  const [gradeFilter, setGradeFilter] = useState("All");
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month

  // ── Load attendance records from Firebase ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const snap = await getDocs(
          query(
            collection(db, "users", userId, "attendance"),
            orderBy("date", "desc"),
          ),
        );
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllRecords(data);
      } catch (e) {
        console.error("AttendanceTrends load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // ── Date range for selected month ──────────────────────────────────────
  const now = new Date();
  const targetDate = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset,
    1,
  );
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const monthLabel = targetDate.toLocaleDateString("en-ZA", {
    month: "long",
    year: "numeric",
  });

  const recordsInMonth = allRecords.filter((r) => {
    if (!r.date) return false;
    const d = new Date(r.date);
    return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  // ── Grade options ──────────────────────────────────────────────────────
  const grades = [
    "All",
    ...new Set(students.map((s) => s.grade).filter(Boolean)),
  ];

  const filteredStudents =
    gradeFilter === "All"
      ? students
      : students.filter((s) => s.grade === gradeFilter);

  // ── Per-student records ────────────────────────────────────────────────
  const recordsForStudent = (studentId) =>
    recordsInMonth.filter(
      (r) => r.studentId === studentId || r.id?.startsWith(studentId),
    );

  // ── Overall stats ──────────────────────────────────────────────────────
  const totalSessions = recordsInMonth.length;
  const totalPresent = recordsInMonth.filter(
    (r) => r.status === "present",
  ).length;
  const totalAbsent = recordsInMonth.filter(
    (r) => r.status === "absent",
  ).length;
  const totalLate = recordsInMonth.filter((r) => r.status === "late").length;
  const overallRate = pct(totalPresent, totalSessions);

  // ── Weekly breakdown for bar chart ────────────────────────────────────
  const weeklyMap = {};
  recordsInMonth.forEach((r) => {
    const wk = `Wk${isoWeek(r.date)}`;
    if (!weeklyMap[wk]) weeklyMap[wk] = { present: 0, absent: 0, late: 0 };
    weeklyMap[wk][r.status] = (weeklyMap[wk][r.status] || 0) + 1;
  });
  const weeklyBars = Object.entries(weeklyMap).map(([label, v]) => ({
    label: label.replace("Wk", "W"),
    val: v.present,
  }));
  const maxWeekly = Math.max(...weeklyBars.map((w) => w.val), 1);

  // ── At-risk students (< 80% this month) ───────────────────────────────
  const atRisk = filteredStudents.filter((s) => {
    const recs = recordsForStudent(s.id);
    if (recs.length === 0) return false;
    const p = recs.filter((r) => r.status === "present").length;
    return pct(p, recs.length) < 80;
  });

  // ── Export CSV ─────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ["Name", "Grade", "Days Recorded", "Present", "Absent", "Late", "Rate %"],
    ];
    filteredStudents.forEach((s) => {
      const recs = recordsForStudent(s.id);
      const p = recs.filter((r) => r.status === "present").length;
      const a = recs.filter((r) => r.status === "absent").length;
      const l = recs.filter((r) => r.status === "late").length;
      const name = s.name || `${s.firstName} ${s.lastName}`;
      rows.push([name, s.grade, recs.length, p, a, l, pct(p, recs.length)]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${monthLabel.replace(" ", "_")}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          color: Z.soft,
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        Loading attendance records...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: Z.ink }}>
            Attendance Trends
          </div>
          <div style={{ fontSize: 12, color: Z.soft, marginTop: 2 }}>
            {totalSessions} sessions recorded
          </div>
        </div>

        {/* Month nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "#fff",
            border: `1px solid ${Z.border}`,
            borderRadius: 10,
            padding: "4px 6px",
          }}
        >
          <button
            onClick={() => setMonthOffset((m) => m - 1)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: Z.soft,
            }}
          >
            <ChevronLeft style={{ width: 15, height: 15 }} />
          </button>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: Z.ink,
              minWidth: 130,
              textAlign: "center",
            }}
          >
            {monthLabel}
          </span>
          <button
            onClick={() => setMonthOffset((m) => Math.min(0, m + 1))}
            disabled={monthOffset === 0}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "none",
              background: "transparent",
              cursor: monthOffset === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: monthOffset === 0 ? Z.border : Z.soft,
            }}
          >
            <ChevronRight style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <button
          onClick={exportCSV}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            background: Z.blueL,
            color: Z.blue,
            border: `1px solid ${Z.border}`,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Download style={{ width: 13, height: 13 }} />
          Export CSV
        </button>
      </div>

      {/* ── Summary stat cards ───────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Attendance Rate",
            value: `${overallRate}%`,
            color:
              overallRate >= 90 ? Z.green : overallRate >= 75 ? Z.amber : Z.red,
            bg:
              overallRate >= 90
                ? Z.greenL
                : overallRate >= 75
                  ? Z.amberL
                  : Z.redL,
          },
          {
            label: "Days Present",
            value: totalPresent,
            color: Z.green,
            bg: Z.greenL,
          },
          {
            label: "Days Absent",
            value: totalAbsent,
            color: Z.red,
            bg: Z.redL,
          },
          {
            label: "Late Arrivals",
            value: totalLate,
            color: Z.amber,
            bg: Z.amberL,
          },
          {
            label: "At-Risk Learners",
            value: atRisk.length,
            color: Z.red,
            bg: Z.redL,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              border: `1px solid ${Z.border}`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: Z.soft,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 6,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly bar chart ─────────────────────────────────────────────── */}
      {weeklyBars.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${Z.border}`,
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: Z.ink,
              marginBottom: 16,
            }}
          >
            Weekly Presence — {monthLabel}
          </div>
          <div style={{ overflowX: "auto" }}>
            <MiniBar data={weeklyBars} maxVal={maxWeekly} color={Z.blue} />
          </div>
          <div style={{ fontSize: 10, color: Z.soft, marginTop: 8 }}>
            Showing number of "present" records per school week
          </div>
        </div>
      )}

      {/* ── At-risk alert ────────────────────────────────────────────────── */}
      {atRisk.length > 0 && (
        <div
          style={{
            background: Z.redL,
            border: `1.5px solid ${Z.red}33`,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <AlertCircle
              style={{ width: 16, height: 16, color: Z.red, flexShrink: 0 }}
            />
            <div style={{ fontSize: 13, fontWeight: 800, color: Z.red }}>
              {atRisk.length} Learner{atRisk.length > 1 ? "s" : ""} Below 80%
              Attendance
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {atRisk.map((s) => {
              const recs = recordsForStudent(s.id);
              const p = recs.filter((r) => r.status === "present").length;
              const name = s.name || `${s.firstName} ${s.lastName}`;
              return (
                <div
                  key={s.id}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 12,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 700, color: Z.ink }}>{name}</span>
                  <span style={{ color: Z.soft }}>{s.grade}</span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: Z.red,
                      background: Z.redL,
                      padding: "1px 7px",
                      borderRadius: 99,
                      fontSize: 11,
                    }}
                  >
                    {pct(p, recs.length)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Grade filter + view tabs ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: Z.ink }}>
          Grade:
        </div>
        {grades.map((g) => (
          <button
            key={g}
            onClick={() => setGradeFilter(g)}
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: gradeFilter === g ? Z.blue : "#f1f5f9",
              color: gradeFilter === g ? "#fff" : Z.mid,
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ── Student cards ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: 10 }}>
        {filteredStudents.length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: Z.soft,
              fontSize: 13,
            }}
          >
            No students found. Make sure students are saved in your database.
          </div>
        )}
        {filteredStudents.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            records={recordsForStudent(s.id)}
          />
        ))}
      </div>

      {recordsInMonth.length === 0 && students.length > 0 && (
        <div
          style={{
            marginTop: 20,
            padding: "20px 24px",
            background: Z.amberL,
            border: `1px solid ${Z.amber}33`,
            borderRadius: 12,
            fontSize: 13,
            color: Z.amber,
            fontWeight: 600,
          }}
        >
          ⚠️ No attendance records found for {monthLabel}. Records are created
          when you save the daily attendance register.
        </div>
      )}
    </div>
  );
};

export default AttendanceTrends;
