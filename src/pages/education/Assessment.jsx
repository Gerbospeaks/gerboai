import React, { useState, useMemo } from "react";
import {
  Plus,
  X,
  Check,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  BarChart2,
  BookOpen,
  Users,
  Award,
  ClipboardList,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Target,
  FileText,
  PenLine,
  Eye,
  MoreVertical,
  RefreshCw,
  Calendar,
} from "lucide-react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GRADES = [
  "Grade R",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
];
const TERMS = ["Term 1", "Term 2", "Term 3", "Term 4"];
const TYPES = ["Test", "Assignment", "Project", "Exam", "Oral", "Practical"];
const SUBJECTS = [
  "Home Language",
  "First Additional Language",
  "Mathematics",
  "Natural Sciences",
  "Social Sciences",
  "Life Skills",
  "Creative Arts",
  "Economic & Management Sciences",
  "Technology",
];

const GRADE_COLORS = {
  A: { bg: "#dcfce7", color: "#15803d", label: "Outstanding" },
  B: { bg: "#dbeafe", color: "#1d4ed8", label: "Meritorious" },
  C: { bg: "#ede9fe", color: "#6d28d9", label: "Substantial" },
  D: { bg: "#fef9c3", color: "#a16207", label: "Adequate" },
  E: { bg: "#ffedd5", color: "#c2410c", label: "Elementary" },
  F: { bg: "#fee2e2", color: "#b91c1c", label: "Not Achieved" },
};

const getLetterGrade = (pct) => {
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  if (pct >= 40) return "E";
  return "F";
};

const getColor = (pct) => {
  if (pct >= 80) return "#15803d";
  if (pct >= 70) return "#1d4ed8";
  if (pct >= 60) return "#6d28d9";
  if (pct >= 50) return "#a16207";
  if (pct >= 40) return "#c2410c";
  return "#b91c1c";
};

const getBg = (pct) => {
  if (pct >= 80) return "#dcfce7";
  if (pct >= 70) return "#dbeafe";
  if (pct >= 60) return "#ede9fe";
  if (pct >= 50) return "#fef9c3";
  if (pct >= 40) return "#ffedd5";
  return "#fee2e2";
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_ASSESSMENTS = [
  {
    id: 1,
    title: "Term 1 Maths Test",
    subject: "Mathematics",
    grade: "Grade 3",
    type: "Test",
    term: "Term 1",
    date: "2026-02-14",
    totalMarks: 50,
    status: "graded",
    results: [
      { studentId: 1, studentName: "Amara Dlamini", mark: 44 },
      { studentId: 2, studentName: "Lwazi Mokoena", mark: 38 },
      { studentId: 3, studentName: "Zara Patel", mark: 47 },
      { studentId: 4, studentName: "Ethan van Wyk", mark: 31 },
      { studentId: 5, studentName: "Nandi Zulu", mark: 42 },
      { studentId: 6, studentName: "Sipho Ndlovu", mark: 29 },
    ],
  },
  {
    id: 2,
    title: "Reading Comprehension",
    subject: "Home Language",
    grade: "Grade 2",
    type: "Assignment",
    term: "Term 1",
    date: "2026-02-20",
    totalMarks: 30,
    status: "graded",
    results: [
      { studentId: 7, studentName: "Leila Joubert", mark: 27 },
      { studentId: 8, studentName: "Ayanda Khumalo", mark: 21 },
      { studentId: 9, studentName: "Finn Botha", mark: 25 },
      { studentId: 10, studentName: "Priya Naidoo", mark: 28 },
      { studentId: 11, studentName: "Thabo Sithole", mark: 18 },
    ],
  },
  {
    id: 3,
    title: "Life Skills Project",
    subject: "Life Skills",
    grade: "Grade 1",
    type: "Project",
    term: "Term 1",
    date: "2026-03-05",
    totalMarks: 40,
    status: "pending",
    results: [
      { studentId: 12, studentName: "Aria Smit", mark: null },
      { studentId: 13, studentName: "Bongani Dube", mark: null },
      { studentId: 14, studentName: "Cara Ferreira", mark: null },
    ],
  },
  {
    id: 4,
    title: "Science Investigation",
    subject: "Natural Sciences",
    grade: "Grade 3",
    type: "Practical",
    term: "Term 1",
    date: "2026-03-10",
    totalMarks: 60,
    status: "graded",
    results: [
      { studentId: 1, studentName: "Amara Dlamini", mark: 55 },
      { studentId: 2, studentName: "Lwazi Mokoena", mark: 49 },
      { studentId: 3, studentName: "Zara Patel", mark: 58 },
      { studentId: 4, studentName: "Ethan van Wyk", mark: 41 },
      { studentId: 5, studentName: "Nandi Zulu", mark: 52 },
      { studentId: 6, studentName: "Sipho Ndlovu", mark: 36 },
    ],
  },
];

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon: Icon, trend }) {
  return (
    <div className="card p-5">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {sub}
            </div>
          )}
        </div>
        <div
          style={{ background: color + "18", borderRadius: 12, padding: 10 }}
        >
          <Icon style={{ color, width: 20, height: 20 }} />
        </div>
      </div>
      {trend !== undefined && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 10,
          }}
        >
          {trend > 0 ? (
            <TrendingUp style={{ width: 13, height: 13, color: "#10b981" }} />
          ) : trend < 0 ? (
            <TrendingDown style={{ width: 13, height: 13, color: "#ef4444" }} />
          ) : (
            <Minus style={{ width: 13, height: 13, color: "#94a3b8" }} />
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: trend > 0 ? "#10b981" : trend < 0 ? "#ef4444" : "#94a3b8",
            }}
          >
            {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : "No change"}{" "}
            from last term
          </span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ pct, height = 6, color }) {
  const c = color || getColor(pct);
  return (
    <div
      style={{
        background: "#f1f5f9",
        borderRadius: 99,
        overflow: "hidden",
        height,
      }}
    >
      <div
        style={{
          width: `${Math.min(pct, 100)}%`,
          height: "100%",
          background: c,
          borderRadius: 99,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}

function GradeBadge({ pct }) {
  const letter = getLetterGrade(pct);
  const cfg = GRADE_COLORS[letter];
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: 11,
        padding: "2px 9px",
        borderRadius: 99,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {letter}
    </span>
  );
}

function TypeBadge({ type }) {
  const colors = {
    Test: { bg: "#dbeafe", color: "#1d4ed8" },
    Assignment: { bg: "#ede9fe", color: "#6d28d9" },
    Project: { bg: "#fef9c3", color: "#a16207" },
    Exam: { bg: "#fee2e2", color: "#b91c1c" },
    Oral: { bg: "#dcfce7", color: "#15803d" },
    Practical: { bg: "#ffedd5", color: "#c2410c" },
  };
  const c = colors[type] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        fontWeight: 600,
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 99,
        letterSpacing: ".04em",
        textTransform: "uppercase",
      }}
    >
      {type}
    </span>
  );
}

// ─── NEW ASSESSMENT MODAL ─────────────────────────────────────────────────────
function NewAssessmentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    subject: SUBJECTS[0],
    grade: GRADES[0],
    type: TYPES[0],
    term: TERMS[0],
    date: new Date().toISOString().split("T")[0],
    totalMarks: 100,
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      totalMarks: Number(form.totalMarks),
      id: Date.now(),
      status: "pending",
      results: [],
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              New Assessment
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              Create a test, assignment or project
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              padding: 7,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X style={{ width: 15, height: 15, color: "#64748b" }} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Title */}
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b778c",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                display: "block",
                marginBottom: 5,
              }}
            >
              Assessment Title *
            </label>
            <input
              className="input"
              placeholder="e.g. Term 1 Mathematics Test"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Subject + Type */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b778c",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Subject
              </label>
              <select
                className="input"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b778c",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Type
              </label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grade + Term */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b778c",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Grade
              </label>
              <select
                className="input"
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
              >
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b778c",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Term
              </label>
              <select
                className="input"
                value={form.term}
                onChange={(e) => set("term", e.target.value)}
              >
                {TERMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Total Marks */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b778c",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Date
              </label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b778c",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Total Marks
              </label>
              <input
                className="input"
                type="number"
                min={1}
                max={1000}
                value={form.totalMarks}
                onChange={(e) => set("totalMarks", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px 18px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!form.title.trim()}
          >
            <Check style={{ width: 14, height: 14 }} />
            Create Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GRADE ENTRY MODAL ────────────────────────────────────────────────────────
function GradeEntryModal({ assessment, onClose, onSave }) {
  const [results, setResults] = useState(
    assessment.results.length > 0
      ? assessment.results.map((r) => ({ ...r }))
      : [{ studentId: Date.now(), studentName: "", mark: "" }],
  );

  const updateResult = (idx, key, val) => {
    setResults((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r)),
    );
  };

  const addRow = () =>
    setResults((prev) => [
      ...prev,
      { studentId: Date.now(), studentName: "", mark: "" },
    ]);
  const removeRow = (idx) =>
    setResults((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const cleaned = results.filter((r) => r.studentName.trim());
    onSave({
      ...assessment,
      results: cleaned.map((r) => ({
        ...r,
        mark: r.mark === "" || r.mark === null ? null : Number(r.mark),
      })),
      status: "graded",
    });
    onClose();
  };

  const avg = useMemo(() => {
    const valid = results.filter(
      (r) => r.mark !== "" && r.mark !== null && !isNaN(r.mark),
    );
    if (!valid.length) return null;
    return (
      valid.reduce((s, r) => s + Number(r.mark), 0) / valid.length
    ).toFixed(1);
  }, [results]);

  const avgPct = avg ? ((avg / assessment.totalMarks) * 100).toFixed(0) : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 620,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
              {assessment.title}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>
              {assessment.grade} · {assessment.subject} · Out of{" "}
              {assessment.totalMarks}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {avgPct && (
              <div
                style={{
                  background: getBg(Number(avgPct)),
                  color: getColor(Number(avgPct)),
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 8,
                }}
              >
                Class avg: {avg} ({avgPct}%)
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: 8,
                padding: 7,
                cursor: "pointer",
                display: "flex",
              }}
            >
              <X style={{ width: 15, height: 15, color: "#64748b" }} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                {[
                  "#",
                  "Student Name",
                  `Mark (/${assessment.totalMarks})`,
                  "%",
                  "Grade",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const pct =
                  r.mark !== "" && r.mark !== null && !isNaN(r.mark)
                    ? Math.round((Number(r.mark) / assessment.totalMarks) * 100)
                    : null;
                return (
                  <tr
                    key={r.studentId}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "8px 14px",
                        fontSize: 12,
                        color: "#94a3b8",
                        fontWeight: 600,
                        width: 32,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ padding: "8px 14px", minWidth: 160 }}>
                      <input
                        className="input"
                        style={{ height: 30, fontSize: 12 }}
                        placeholder="Student name"
                        value={r.studentName}
                        onChange={(e) =>
                          updateResult(i, "studentName", e.target.value)
                        }
                      />
                    </td>
                    <td style={{ padding: "8px 14px", width: 120 }}>
                      <input
                        className="input"
                        style={{
                          height: 30,
                          fontSize: 13,
                          fontWeight: 700,
                          width: 90,
                        }}
                        type="number"
                        min={0}
                        max={assessment.totalMarks}
                        placeholder="—"
                        value={r.mark ?? ""}
                        onChange={(e) =>
                          updateResult(i, "mark", e.target.value)
                        }
                      />
                    </td>
                    <td style={{ padding: "8px 14px", width: 60 }}>
                      {pct !== null && (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: getColor(pct),
                          }}
                        >
                          {pct}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "8px 14px", width: 60 }}>
                      {pct !== null && <GradeBadge pct={pct} />}
                    </td>
                    <td style={{ padding: "8px 10px", width: 36 }}>
                      <button
                        onClick={() => removeRow(i)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 6,
                          display: "flex",
                        }}
                      >
                        <Trash2
                          style={{ width: 13, height: 13, color: "#cbd5e1" }}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <div
          style={{
            padding: "10px 20px",
            borderTop: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          <button
            className="btn-ghost"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={addRow}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Add Student
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px 16px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Check style={{ width: 14, height: 14 }} />
            Save Marks
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ASSESSMENT DETAIL PANEL ──────────────────────────────────────────────────
function AssessmentDetail({ assessment, onEdit, onClose }) {
  const graded = assessment.results.filter(
    (r) => r.mark !== null && r.mark !== "",
  );
  const avg = graded.length
    ? graded.reduce((s, r) => s + Number(r.mark), 0) / graded.length
    : 0;
  const avgPct = assessment.totalMarks
    ? Math.round((avg / assessment.totalMarks) * 100)
    : 0;
  const highest = graded.length
    ? Math.max(...graded.map((r) => Number(r.mark)))
    : 0;
  const lowest = graded.length
    ? Math.min(...graded.map((r) => Number(r.mark)))
    : 0;
  const pass = graded.filter(
    (r) => (r.mark / assessment.totalMarks) * 100 >= 50,
  ).length;

  const distributionBuckets = ["F", "E", "D", "C", "B", "A"];
  const dist = distributionBuckets.map((grade) => ({
    grade,
    count: graded.filter(
      (r) =>
        getLetterGrade(Math.round((r.mark / assessment.totalMarks) * 100)) ===
        grade,
    ).length,
    cfg: GRADE_COLORS[grade],
  }));
  const maxDist = Math.max(...dist.map((d) => d.count), 1);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 700,
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                {assessment.title}
              </span>
              <TypeBadge type={assessment.type} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background:
                    assessment.status === "graded" ? "#dcfce7" : "#fef9c3",
                  color: assessment.status === "graded" ? "#15803d" : "#a16207",
                  borderRadius: 99,
                  padding: "2px 8px",
                }}
              >
                {assessment.status === "graded" ? "✓ Graded" : "⏳ Pending"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {assessment.grade} · {assessment.subject} · {assessment.term} ·{" "}
              {assessment.date}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onEdit}
              className="btn-ghost"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              <PenLine style={{ width: 13, height: 13 }} /> Edit Marks
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: 8,
                padding: 7,
                cursor: "pointer",
                display: "flex",
              }}
            >
              <X style={{ width: 15, height: 15, color: "#64748b" }} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: 20 }}>
          {graded.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "#94a3b8",
              }}
            >
              <ClipboardList
                style={{
                  width: 36,
                  height: 36,
                  margin: "0 auto 12px",
                  opacity: 0.4,
                }}
              />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                No marks entered yet
              </div>
              <div style={{ fontSize: 12 }}>
                Click "Edit Marks" to start capturing results
              </div>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {[
                  {
                    label: "Class Average",
                    value: `${avg.toFixed(1)}`,
                    sub: `${avgPct}%`,
                    color: getColor(avgPct),
                  },
                  {
                    label: "Highest Mark",
                    value: highest,
                    sub: `${Math.round((highest / assessment.totalMarks) * 100)}%`,
                    color: "#15803d",
                  },
                  {
                    label: "Lowest Mark",
                    value: lowest,
                    sub: `${Math.round((lowest / assessment.totalMarks) * 100)}%`,
                    color: "#b91c1c",
                  },
                  {
                    label: "Pass Rate",
                    value: `${pass}/${graded.length}`,
                    sub: `${Math.round((pass / graded.length) * 100)}%`,
                    color: "#1d4ed8",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "#f8fafc",
                      borderRadius: 10,
                      padding: "12px 14px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 4,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: s.color,
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}
                    >
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grade distribution bar chart */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 20,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 12,
                  }}
                >
                  Grade Distribution
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-end",
                    height: 64,
                  }}
                >
                  {dist.map(({ grade, count, cfg }) => (
                    <div
                      key={grade}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: cfg.color,
                        }}
                      >
                        {count > 0 ? count : ""}
                      </div>
                      <div
                        style={{
                          width: "100%",
                          background: count > 0 ? cfg.bg : "#e2e8f0",
                          borderRadius: 4,
                          transition: "height .3s",
                          border: `1px solid ${count > 0 ? cfg.color + "44" : "transparent"}`,
                          height:
                            count > 0
                              ? `${Math.max((count / maxDist) * 48, 8)}px`
                              : "4px",
                        }}
                      />
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: count > 0 ? cfg.color : "#cbd5e1",
                        }}
                      >
                        {grade}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student results table */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 10,
                }}
              >
                Student Results
              </div>
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Student", "Mark", "%", "Grade", "Progress"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "9px 14px",
                              textAlign: "left",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#94a3b8",
                              letterSpacing: ".06em",
                              textTransform: "uppercase",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {[...graded]
                      .sort((a, b) => Number(b.mark) - Number(a.mark))
                      .map((r, i) => {
                        const pct = Math.round(
                          (Number(r.mark) / assessment.totalMarks) * 100,
                        );
                        return (
                          <tr
                            key={r.studentId}
                            style={{
                              borderBottom:
                                i < graded.length - 1
                                  ? "1px solid #f1f5f9"
                                  : "none",
                            }}
                          >
                            <td style={{ padding: "10px 14px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 9,
                                }}
                              >
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    background: `hsl(${(r.studentId * 37) % 360},65%,88%)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: `hsl(${(r.studentId * 37) % 360},50%,35%)`,
                                    flexShrink: 0,
                                  }}
                                >
                                  {r.studentName
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#0f172a",
                                  }}
                                >
                                  {r.studentName}
                                </span>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "10px 14px",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              {r.mark}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: getColor(pct),
                                }}
                              >
                                {pct}%
                              </span>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <GradeBadge pct={pct} />
                            </td>
                            <td style={{ padding: "10px 14px", minWidth: 100 }}>
                              <ProgressBar pct={pct} />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ASSESSMENT VIEW ─────────────────────────────────────────────────────
export default function Assessment() {
  const [assessments, setAssessments] = useState(SEED_ASSESSMENTS);
  const [showNew, setShowNew] = useState(false);
  const [grading, setGrading] = useState(null); // assessment being graded
  const [viewing, setViewing] = useState(null); // assessment being viewed
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterTerm, setFilterTerm] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // "list" | "analytics"

  // ── computed stats ──────────────────────────────────────────────────────────
  const allGraded = assessments.filter((a) => a.status === "graded");
  const totalStudentResults = allGraded.flatMap((a) =>
    a.results.filter((r) => r.mark !== null),
  );

  const overallAvgPct = useMemo(() => {
    if (!totalStudentResults.length) return 0;
    const pcts = totalStudentResults.map((r) => {
      const a = allGraded.find((a) => a.results.includes(r));
      return a ? (Number(r.mark) / a.totalMarks) * 100 : 0;
    });
    return Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
  }, [assessments]);

  const passCount = totalStudentResults.filter((r) => {
    const a = allGraded.find((a) => a.results.includes(r));
    return a ? (Number(r.mark) / a.totalMarks) * 100 >= 50 : false;
  }).length;

  const passRate = totalStudentResults.length
    ? Math.round((passCount / totalStudentResults.length) * 100)
    : 0;

  // ── filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      assessments.filter((a) => {
        if (filterGrade !== "All" && a.grade !== filterGrade) return false;
        if (filterTerm !== "All" && a.term !== filterTerm) return false;
        if (filterStatus !== "All" && a.status !== filterStatus) return false;
        if (filterType !== "All" && a.type !== filterType) return false;
        if (
          search &&
          !a.title.toLowerCase().includes(search.toLowerCase()) &&
          !a.subject.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [assessments, filterGrade, filterTerm, filterStatus, filterType, search],
  );

  const handleSaveNew = (data) => setAssessments((prev) => [data, ...prev]);

  const handleSaveGrades = (updated) =>
    setAssessments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );

  const handleDelete = (id) => {
    if (!window.confirm("Delete this assessment?")) return;
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  };

  // Per-subject analytics
  const subjectStats = useMemo(() => {
    return SUBJECTS.map((subj) => {
      const subjAssessments = allGraded.filter((a) => a.subject === subj);
      const results = subjAssessments.flatMap((a) =>
        a.results
          .filter((r) => r.mark !== null)
          .map((r) => ({ mark: r.mark, total: a.totalMarks })),
      );
      if (!results.length) return null;
      const avgPct = Math.round(
        results.reduce((s, r) => s + (Number(r.mark) / r.total) * 100, 0) /
          results.length,
      );
      return {
        subject: subj,
        avgPct,
        count: results.length,
        assessmentCount: subjAssessments.length,
      };
    })
      .filter(Boolean)
      .sort((a, b) => b.avgPct - a.avgPct);
  }, [assessments]);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
            Assessments
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {assessments.length} assessments · {allGraded.length} graded ·{" "}
            {assessments.filter((a) => a.status === "pending").length} pending
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          <Plus style={{ width: 15, height: 15 }} />
          New Assessment
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
        }}
      >
        <StatCard
          label="Total Assessments"
          value={assessments.length}
          sub={`${allGraded.length} graded`}
          color="#4f46e5"
          icon={ClipboardList}
        />
        <StatCard
          label="Class Average"
          value={`${overallAvgPct}%`}
          sub="across all subjects"
          color="#0ea5e9"
          icon={BarChart2}
          trend={3}
        />
        <StatCard
          label="Pass Rate"
          value={`${passRate}%`}
          sub={`${passCount} of ${totalStudentResults.length} results`}
          color="#10b981"
          icon={Award}
          trend={-2}
        />
        <StatCard
          label="Pending Grading"
          value={assessments.filter((a) => a.status === "pending").length}
          sub="need marks entered"
          color="#f59e0b"
          icon={Clock}
        />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "#f1f5f9",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {[
          { id: "list", label: "Assessment List", icon: ClipboardList },
          { id: "analytics", label: "Analytics", icon: BarChart2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: activeTab === tab.id ? "#fff" : "transparent",
              color: activeTab === tab.id ? "#0f172a" : "#64748b",
              boxShadow:
                activeTab === tab.id ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              transition: "all .15s",
            }}
          >
            <tab.icon style={{ width: 13, height: 13 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ LIST TAB ══════════════════════════════════════════════════════════ */}
      {activeTab === "list" && (
        <>
          {/* Filters */}
          <div
            className="card p-4"
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Search */}
            <div
              style={{ position: "relative", flex: "1 1 180px", minWidth: 160 }}
            >
              <Search
                style={{
                  position: "absolute",
                  left: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 13,
                  height: 13,
                  color: "#94a3b8",
                }}
              />
              <input
                className="input"
                style={{ paddingLeft: 28, height: 32, fontSize: 12 }}
                placeholder="Search assessments…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter dropdowns */}
            {[
              {
                label: "Grade",
                value: filterGrade,
                set: setFilterGrade,
                opts: ["All", ...GRADES],
              },
              {
                label: "Term",
                value: filterTerm,
                set: setFilterTerm,
                opts: ["All", ...TERMS],
              },
              {
                label: "Status",
                value: filterStatus,
                set: setFilterStatus,
                opts: ["All", "graded", "pending"],
              },
              {
                label: "Type",
                value: filterType,
                set: setFilterType,
                opts: ["All", ...TYPES],
              },
            ].map((f) => (
              <select
                key={f.label}
                className="input"
                style={{
                  flex: "0 0 auto",
                  height: 32,
                  fontSize: 12,
                  paddingRight: 28,
                  minWidth: 110,
                }}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
              >
                {f.opts.map((o) => (
                  <option key={o} value={o}>
                    {f.label === "Status" && o !== "All"
                      ? o === "graded"
                        ? "✓ Graded"
                        : "⏳ Pending"
                      : o === "All"
                        ? `All ${f.label}s`
                        : o}
                  </option>
                ))}
              </select>
            ))}

            {/* Reset */}
            {(filterGrade !== "All" ||
              filterTerm !== "All" ||
              filterStatus !== "All" ||
              filterType !== "All" ||
              search) && (
              <button
                className="btn-ghost"
                style={{ height: 32, padding: "0 10px", fontSize: 11 }}
                onClick={() => {
                  setFilterGrade("All");
                  setFilterTerm("All");
                  setFilterStatus("All");
                  setFilterType("All");
                  setSearch("");
                }}
              >
                <RefreshCw style={{ width: 12, height: 12 }} /> Reset
              </button>
            )}
          </div>

          {/* Assessment list */}
          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <ClipboardList
                style={{
                  width: 36,
                  height: 36,
                  margin: "0 auto 12px",
                  color: "#cbd5e1",
                }}
              />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 4,
                }}
              >
                No assessments found
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                Try adjusting your filters or create a new assessment
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((a) => {
                const graded = a.results.filter(
                  (r) => r.mark !== null && r.mark !== "",
                );
                const avg = graded.length
                  ? graded.reduce((s, r) => s + Number(r.mark), 0) /
                    graded.length
                  : null;
                const avgPct =
                  avg !== null ? Math.round((avg / a.totalMarks) * 100) : null;

                return (
                  <div
                    key={a.id}
                    className="card"
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Left: icon */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background:
                          a.status === "graded" ? "#dcfce7" : "#fef9c3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {a.status === "graded" ? (
                        <CheckCircle
                          style={{ width: 18, height: 18, color: "#15803d" }}
                        />
                      ) : (
                        <Clock
                          style={{ width: 18, height: 18, color: "#a16207" }}
                        />
                      )}
                    </div>

                    {/* Centre: info */}
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          flexWrap: "wrap",
                          marginBottom: 3,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {a.title}
                        </span>
                        <TypeBadge type={a.type} />
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {a.grade} · {a.subject} · {a.term} · {a.date} · /
                        {a.totalMarks} marks
                      </div>
                    </div>

                    {/* Stats chips */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#94a3b8",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: ".05em",
                          }}
                        >
                          Students
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#0f172a",
                          }}
                        >
                          {a.results.length}
                        </div>
                      </div>
                      {avgPct !== null && (
                        <>
                          <div
                            style={{
                              width: 1,
                              height: 28,
                              background: "#e2e8f0",
                            }}
                          />
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#94a3b8",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: ".05em",
                              }}
                            >
                              Avg
                            </div>
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: getColor(avgPct),
                              }}
                            >
                              {avgPct}%
                            </div>
                          </div>
                          <div
                            style={{
                              width: 1,
                              height: 28,
                              background: "#e2e8f0",
                            }}
                          />
                          <GradeBadge pct={avgPct} />
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        className="btn-ghost"
                        style={{ padding: "5px 11px", fontSize: 11 }}
                        onClick={() => setViewing(a)}
                      >
                        <Eye style={{ width: 12, height: 12 }} /> View
                      </button>
                      <button
                        className="btn-primary"
                        style={{ padding: "5px 11px", fontSize: 11 }}
                        onClick={() => setGrading(a)}
                      >
                        <PenLine style={{ width: 12, height: 12 }} />
                        {a.status === "graded" ? "Edit Marks" : "Enter Marks"}
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{
                          padding: 7,
                          borderRadius: 8,
                          background: "none",
                          border: "1.5px solid #fee2e2",
                          cursor: "pointer",
                          display: "flex",
                          color: "#ef4444",
                        }}
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══ ANALYTICS TAB ═════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {/* Subject performance */}
          <div className="card p-5" style={{ gridColumn: "span 2" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 4,
              }}
            >
              Performance by Subject
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              Average percentage across all graded assessments
            </div>
            {subjectStats.length === 0 ? (
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                  textAlign: "center",
                  padding: "24px 0",
                }}
              >
                No graded assessments yet
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {subjectStats.map((s) => (
                  <div key={s.subject}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        {s.subject}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          {s.count} results · {s.assessmentCount} assessments
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: getColor(s.avgPct),
                          }}
                        >
                          {s.avgPct}%
                        </span>
                        <GradeBadge pct={s.avgPct} />
                      </div>
                    </div>
                    <ProgressBar pct={s.avgPct} height={8} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grade distribution donut-style summary */}
          <div className="card p-5">
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 4,
              }}
            >
              Overall Grade Distribution
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              All student results combined
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["A", "B", "C", "D", "E", "F"].map((grade) => {
                const cfg = GRADE_COLORS[grade];
                const count = totalStudentResults.filter((r) => {
                  const a = allGraded.find((a) => a.results.includes(r));
                  return (
                    a &&
                    getLetterGrade(
                      Math.round((Number(r.mark) / a.totalMarks) * 100),
                    ) === grade
                  );
                }).length;
                const pct = totalStudentResults.length
                  ? Math.round((count / totalStudentResults.length) * 100)
                  : 0;
                return (
                  <div
                    key={grade}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: cfg.bg,
                        border: `1px solid ${cfg.color}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: cfg.color,
                        }}
                      >
                        {grade}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                          {cfg.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: cfg.color,
                          }}
                        >
                          {count} ({pct}%)
                        </span>
                      </div>
                      <ProgressBar pct={pct} height={5} color={cfg.color} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent assessments summary */}
          <div className="card p-5">
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 4,
              }}
            >
              Recent Results
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
              Latest graded assessments
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {allGraded.slice(0, 4).map((a) => {
                const graded = a.results.filter((r) => r.mark !== null);
                const avg = graded.length
                  ? graded.reduce((s, r) => s + Number(r.mark), 0) /
                    graded.length
                  : 0;
                const avgPct = Math.round((avg / a.totalMarks) * 100);
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: "#f8fafc",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => setViewing(a)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {a.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {a.grade} · {a.date}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: getColor(avgPct),
                        }}
                      >
                        {avgPct}%
                      </div>
                      <GradeBadge pct={avgPct} />
                    </div>
                  </div>
                );
              })}
              {allGraded.length === 0 && (
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: 12,
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No graded assessments yet
                </div>
              )}
            </div>
          </div>

          {/* At-risk students */}
          <div className="card p-5">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <AlertCircle
                style={{ width: 14, height: 14, color: "#ef4444" }}
              />
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                Needs Attention
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
              Students below 50% average
            </div>
            {(() => {
              const atRisk = [];
              const studentMap = {};
              allGraded.forEach((a) => {
                a.results
                  .filter((r) => r.mark !== null)
                  .forEach((r) => {
                    const pct = (Number(r.mark) / a.totalMarks) * 100;
                    if (!studentMap[r.studentName])
                      studentMap[r.studentName] = [];
                    studentMap[r.studentName].push(pct);
                  });
              });
              Object.entries(studentMap).forEach(([name, pcts]) => {
                const avg = pcts.reduce((s, p) => s + p, 0) / pcts.length;
                if (avg < 50) atRisk.push({ name, avg: Math.round(avg) });
              });
              atRisk.sort((a, b) => a.avg - b.avg);
              if (!atRisk.length)
                return (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    🎉 No students below 50%!
                  </div>
                );
              return atRisk.slice(0, 5).map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#fee2e2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#b91c1c",
                      flexShrink: 0,
                    }}
                  >
                    {s.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {s.name}
                    </div>
                    <ProgressBar pct={s.avg} height={4} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#b91c1c",
                      flexShrink: 0,
                    }}
                  >
                    {s.avg}%
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showNew && (
        <NewAssessmentModal
          onClose={() => setShowNew(false)}
          onSave={handleSaveNew}
        />
      )}
      {grading && (
        <GradeEntryModal
          assessment={grading}
          onClose={() => setGrading(null)}
          onSave={(data) => {
            handleSaveGrades(data);
            setGrading(null);
          }}
        />
      )}
      {viewing && (
        <AssessmentDetail
          assessment={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setGrading(viewing);
            setViewing(null);
          }}
        />
      )}
    </div>
  );
}
