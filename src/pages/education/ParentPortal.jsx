import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";
import {
  BookOpen,
  Megaphone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  GraduationCap,
  School,
  ChevronRight,
  FileText,
  Download,
  ExternalLink,
  User,
  Search,
  Lock,
  X,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Award,
  BookMarked,
  ChevronDown,
  ShieldAlert,
  BarChart2,
  Heart,
  Package,
  Flag,
  Star,
} from "lucide-react";

// ── Design tokens — warm editorial palette from SchoolOverview ─────────────
const T = {
  primary: "#1a6b4a",
  primaryLight: "#e8f5ef",
  primaryMid: "#2d8a62",
  accent: "#f59e0b",
  accentLight: "#fef3c7",
  red: "#dc2626",
  redLight: "#fef2f2",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  purple: "#6b46c1",
  purpleLight: "#faf5ff",
  teal: "#0f766e",
  tealLight: "#f0fdfa",
  // ── Warm palette from SchoolOverview ──
  bg: "#f8f7f4",
  surface: "#ffffff",
  surfaceAlt: "#f1efe9",
  border: "#e8e4db",
  text: "#1a1814",
  textMid: "#5c5850",
  textSoft: "#9c9890",
  textFaint: "#c4c0b8",
  ink: "#2d2a26",
  radius: 16,
  shadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
};

const gradeColor = (g) =>
  ({ A: "#15803d", B: "#2563eb", C: "#b45309", D: "#9333ea", E: T.red })[g] ||
  T.textSoft;
const gradeBg = (g) =>
  ({ A: "#f0fdf4", B: "#eff6ff", C: "#fffbeb", D: "#faf5ff", E: T.redLight })[
    g
  ] || T.bg;

export default function ParentPortal() {
  const { portalSlug } = useParams();
  const [schoolUid, setSchoolUid] = useState(null);

  const [businessInfo, setBusinessInfo] = useState(null);
  const [homework, setHomework] = useState([]);
  const [notices, setNotices] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [reports, setReports] = useState([]);
  const [permEvents, setPermEvents] = useState([]);
  const [markbook, setMarkbook] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("notices");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [expandedNotice, setExpandedNotice] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);

  const [ttGrade, setTtGrade] = useState("");
  const [ttDay, setTtDay] = useState("Monday");
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [childInput, setChildInput] = useState("");
  const [identityError, setIdentityError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const usersSnap = await getDocs(
          query(collection(db, "users"), where("portalSlug", "==", portalSlug)),
        );
        if (usersSnap.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const uid = usersSnap.docs[0].id;
        setSchoolUid(uid);

        const today = new Date().toISOString().split("T")[0];

        const [
          bizDoc,
          hwSnap,
          nSnap,
          annSnap,
          eSnap,
          stuSnap,
          attSnap,
          ttDoc,
          repSnap,
          permSnap,
          mbSnap,
          incSnap,
        ] = await Promise.all([
          getDoc(doc(db, "users", uid, "settings", "businessInfo")),
          getDocs(
            query(
              collection(db, "users", uid, "homework"),
              orderBy("createdAt", "desc"),
            ),
          ),
          getDocs(
            query(
              collection(db, "users", uid, "notices"),
              orderBy("createdAt", "desc"),
            ),
          ),
          getDocs(
            query(
              collection(db, "users", uid, "announcements"),
              orderBy("createdAt", "desc"),
            ),
          ),
          getDocs(
            query(
              collection(db, "users", uid, "events"),
              orderBy("date", "asc"),
            ),
          ),
          getDocs(collection(db, "users", uid, "students")),
          getDocs(collection(db, "users", uid, "attendance")),
          getDoc(doc(db, "users", uid, "settings", "timetable")),
          getDocs(
            query(
              collection(db, "users", uid, "savedReports"),
              orderBy("savedAt", "desc"),
            ),
          ),
          getDocs(
            query(
              collection(db, "users", uid, "permissionEvents"),
              orderBy("createdAt", "desc"),
            ),
          ),
          getDocs(
            query(
              collection(db, "users", uid, "markbook"),
              orderBy("createdAt", "desc"),
            ),
          ),
          getDocs(
            query(
              collection(db, "users", uid, "incidents"),
              orderBy("createdAt", "desc"),
            ),
          ),
        ]);

        setBusinessInfo(bizDoc.data());
        setHomework(
          hwSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setNotices(
          nSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setAnnouncements(
          annSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setEvents(
          eSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder && d.date >= today),
        );
        setStudents(
          stuSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setAttendance(
          attSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        if (ttDoc.exists()) setTimetable(ttDoc.data());
        setReports(
          repSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder && d.studentName),
        );
        setPermEvents(
          permSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setMarkbook(
          mbSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setIncidents(
          incSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [portalSlug]);

  const handleVerify = () => {
    if (!childInput.trim()) {
      setIdentityError("Please enter your child's full name.");
      return;
    }
    setVerifying(true);
    setIdentityError("");
    const norm = (s) => s.trim().toLowerCase();
    const match = students.find((s) => norm(s.name) === norm(childInput));
    setTimeout(() => {
      setVerifying(false);
      if (match) {
        setVerifiedStudent(match);
        setShowIdentityModal(false);
        setChildInput("");
      } else {
        setIdentityError(
          "No child found with that name. Please check the spelling and try again.",
        );
      }
    }, 500);
  };

  const studentAttendance = verifiedStudent
    ? attendance
        .filter(
          (a) =>
            a.studentId === verifiedStudent.id ||
            a.studentName === verifiedStudent.name,
        )
        .sort((a, b) => (b.date > a.date ? 1 : -1))
        .slice(0, 30)
    : [];
  const attStats = {
    present: studentAttendance.filter((a) => a.status === "present").length,
    absent: studentAttendance.filter((a) => a.status === "absent").length,
    late: studentAttendance.filter((a) => a.status === "late").length,
  };
  const attPercent = studentAttendance.length
    ? Math.round((attStats.present / studentAttendance.length) * 100)
    : null;

  const studentReports = verifiedStudent
    ? reports.filter(
        (r) =>
          r.studentName?.trim().toLowerCase() ===
          verifiedStudent.name.trim().toLowerCase(),
      )
    : [];

  const myPermEvents = verifiedStudent
    ? permEvents.filter((e) => e.grade === verifiedStudent.grade)
    : [];

  const myMarkbook = verifiedStudent
    ? markbook.filter((m) => m.grade === verifiedStudent.grade)
    : [];

  const myIncidents = verifiedStudent
    ? incidents.filter(
        (i) =>
          i.studentId === verifiedStudent.id ||
          i.studentName?.trim().toLowerCase() ===
            verifiedStudent.name.trim().toLowerCase(),
      )
    : [];

  const ttGrades = timetable ? Object.keys(timetable) : [];
  useEffect(() => {
    if (ttGrades.length && !ttGrade) setTtGrade(ttGrades[0]);
  }, [ttGrades.length]);
  const ttPeriods =
    timetable && ttGrade && timetable[ttGrade]
      ? timetable[ttGrade][ttDay] || []
      : [];

  const allNotices = [
    ...notices.map((n) => ({ ...n, _source: "admin" })),
    ...announcements.map((a) => ({
      ...a,
      _source: "teacher",
      type: a.type || "info",
    })),
  ].sort((a, b) => {
    const da = a.createdAt?.seconds || 0;
    const db_ = b.createdAt?.seconds || 0;
    return db_ - da;
  });

  const noticeConfig = {
    important: {
      icon: AlertCircle,
      color: T.red,
      bg: T.redLight,
      label: "Important",
    },
    action: {
      icon: CheckCircle,
      color: "#b45309",
      bg: "#fffbeb",
      label: "Action Required",
    },
    fee: {
      icon: DollarSign,
      color: T.purple,
      bg: T.purpleLight,
      label: "Fee Notice",
    },
    info: { icon: Info, color: T.blue, bg: T.blueLight, label: "Info" },
  };
  const priorityConfig = {
    high: { label: "Urgent", bg: "#fff0f0", color: T.red, dot: T.red },
    medium: {
      label: "Medium",
      bg: "#fffbeb",
      color: "#b45309",
      dot: "#f59e0b",
    },
    low: { label: "Low", bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  };

  const grades = [
    "All",
    ...new Set(homework.map((h) => h.grade).filter(Boolean)),
  ];
  const filteredHW =
    gradeFilter === "All"
      ? homework
      : homework.filter((h) => h.grade === gradeFilter);
  const schoolName =
    businessInfo?.name || businessInfo?.businessName || "School Portal";

  const noticeBadge =
    allNotices.filter((n) => !n.read).length || allNotices.length;

  const allTabs = [
    {
      id: "notices",
      label: "Notices",
      icon: Megaphone,
      count: noticeBadge,
      locked: false,
    },
    {
      id: "homework",
      label: "Homework",
      icon: BookOpen,
      count: homework.length,
      locked: !verifiedStudent,
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      count: events.length,
      locked: false,
    },
    {
      id: "timetable",
      label: "Timetable",
      icon: Clock,
      count: null,
      locked: false,
    },
    {
      id: "reports",
      label: "Reports",
      icon: ClipboardList,
      count: studentReports.length || null,
      locked: !verifiedStudent,
    },
    {
      id: "marks",
      label: "Marks",
      icon: BarChart2,
      count: myMarkbook.length || null,
      locked: !verifiedStudent,
    },
    {
      id: "slips",
      label: "Slips",
      icon: Flag,
      count: myPermEvents.length || null,
      locked: !verifiedStudent,
    },
    {
      id: "behaviour",
      label: "Behaviour",
      icon: ShieldAlert,
      count: myIncidents.length || null,
      locked: !verifiedStudent,
    },
    {
      id: "fees",
      label: "Fees",
      icon: DollarSign,
      count: null,
      locked: !verifiedStudent,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: UserCheck,
      count: null,
      locked: !verifiedStudent,
    },
  ];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: T.bg,
          gap: 14,
        }}
      >
        <style>{fonts + keyframes}</style>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: T.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <School style={{ width: 26, height: 26, color: "#fff" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: T.primary,
                opacity: 0.3,
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <p
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: 13,
            color: T.textSoft,
          }}
        >
          Loading portal…
        </p>
      </div>
    );

  if (notFound)
    return (
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: T.bg,
          gap: 12,
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <style>{fonts + keyframes}</style>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: T.redLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle style={{ width: 28, height: 28, color: T.red }} />
        </div>
        <p
          style={{
            fontFamily: "'Crimson Pro',serif",
            fontSize: 22,
            fontWeight: 600,
            color: T.ink,
            margin: 0,
          }}
        >
          School not found
        </p>
        <p
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: 13,
            color: T.textSoft,
            maxWidth: 280,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          This link doesn't match any school. Please ask your school for the
          correct portal link.
        </p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100svh",
        background: T.bg,
        fontFamily: "'Sora',sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{fonts + keyframes}</style>

      {/* ── IDENTITY MODAL ────────────────────────────────────────────────── */}
      {showIdentityModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,24,20,0.55)",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => {
            setShowIdentityModal(false);
            setIdentityError("");
            setChildInput("");
          }}
        >
          <div
            style={{
              background: T.surface,
              borderRadius: "22px 22px 0 0",
              width: "100%",
              maxWidth: 480,
              padding: "24px 24px calc(env(safe-area-inset-bottom,0px) + 24px)",
              boxShadow: "0 -8px 48px rgba(26,24,20,0.16)",
              animation: "slideUp .25s ease",
              border: `1px solid ${T.border}`,
              borderBottom: "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 99,
                background: T.border,
                margin: "0 auto 20px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  background: T.primaryLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${T.border}`,
                }}
              >
                <User style={{ width: 20, height: 20, color: T.primary }} />
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Crimson Pro',serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: T.ink,
                    lineHeight: 1.2,
                  }}
                >
                  Find your child
                </p>
                <p
                  style={{ margin: "2px 0 0", fontSize: 12, color: T.textSoft }}
                >
                  Enter your child's full name to view their info
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.textSoft,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 7,
                  }}
                >
                  Child's Full Name
                </label>
                <input
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 13,
                    border: `1.5px solid ${identityError ? T.red : T.border}`,
                    fontSize: 15,
                    fontFamily: "'Sora',sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                    color: T.text,
                    background: T.bg,
                  }}
                  placeholder="e.g. Amara Dlamini"
                  value={childInput}
                  onChange={(e) => {
                    setChildInput(e.target.value);
                    setIdentityError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>
              {identityError && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "10px 13px",
                    background: T.redLight,
                    borderRadius: 11,
                    border: "1px solid #fecaca",
                  }}
                >
                  <AlertCircle
                    style={{
                      width: 15,
                      height: 15,
                      color: T.red,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: T.red,
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    {identityError}
                  </p>
                </div>
              )}
              <button
                onClick={handleVerify}
                disabled={verifying}
                style={{
                  padding: "14px",
                  borderRadius: 13,
                  background: T.primary,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: verifying ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: verifying ? 0.75 : 1,
                  fontFamily: "'Sora',sans-serif",
                  letterSpacing: ".01em",
                }}
              >
                <Search style={{ width: 17, height: 17 }} />
                {verifying ? "Searching…" : "View My Child's Info"}
              </button>
              <p
                style={{
                  fontSize: 11,
                  color: T.textFaint,
                  textAlign: "center",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                The name must match exactly what the school has on record.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(160deg,${T.primary} 0%,${T.primaryMid} 100%)`,
          paddingTop: "env(safe-area-inset-top,0px)",
        }}
      >
        <div
          style={{ padding: "20px 20px 0", maxWidth: 640, margin: "0 auto" }}
        >
          {/* Top row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {businessInfo?.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    alt="logo"
                    style={{ width: 30, height: 30, objectFit: "contain" }}
                  />
                ) : (
                  <GraduationCap
                    style={{ width: 22, height: 22, color: "#fff" }}
                  />
                )}
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Crimson Pro',serif",
                    fontSize: 19,
                    fontWeight: 600,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {schoolName}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 2,
                  }}
                >
                  Parent Portal
                </p>
              </div>
            </div>

            {verifiedStudent ? (
              <button
                onClick={() => {
                  setVerifiedStudent(null);
                  setActiveTab("notices");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  borderRadius: 12,
                  padding: "7px 12px",
                  cursor: "pointer",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User style={{ width: 13, height: 13, color: "#fff" }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {verifiedStudent.name}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {verifiedStudent.grade} · Switch
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setShowIdentityModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  borderRadius: 12,
                  padding: "9px 14px",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                <Lock style={{ width: 13, height: 13 }} /> My Child
              </button>
            )}
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: 10, paddingBottom: 20 }}>
            {[
              {
                label: "Homework",
                count: homework.length,
                color: "#6ee7b7",
                tab: "homework",
              },
              {
                label: "Notices",
                count: allNotices.length,
                color: "#fcd34d",
                tab: "notices",
              },
              {
                label: "Events",
                count: events.length,
                color: "#93c5fd",
                tab: "events",
              },
            ].map((s) => (
              <button
                key={s.tab}
                onClick={() => {
                  if (!verifiedStudent && s.tab === "homework") {
                    setShowIdentityModal(true);
                    return;
                  }
                  setActiveTab(s.tab);
                }}
                style={{
                  flex: 1,
                  background:
                    activeTab === s.tab
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(255,255,255,0.10)",
                  border:
                    activeTab === s.tab
                      ? "1.5px solid rgba(255,255,255,0.35)"
                      : "1.5px solid transparent",
                  borderRadius: 13,
                  padding: "10px 8px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all .2s",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Crimson Pro',serif",
                    fontSize: 26,
                    fontWeight: 600,
                    color: s.color,
                    lineHeight: 1,
                  }}
                >
                  {s.count}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {s.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── TABS ────────────────────────────────────────────────────────── */}
        <div
          style={{
            background: T.surface,
            maxWidth: 640,
            margin: "0 auto",
            overflowX: "auto",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              minWidth: "max-content",
              width: "100%",
            }}
          >
            {allTabs.map(({ id, label, icon: Icon, count, locked }) => (
              <button
                key={id}
                onClick={() => {
                  if (locked) {
                    setShowIdentityModal(true);
                    return;
                  }
                  setActiveTab(id);
                }}
                style={{
                  flex: "1 0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "13px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".02em",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderBottom:
                    activeTab === id
                      ? `2.5px solid ${T.primary}`
                      : "2.5px solid transparent",
                  color:
                    activeTab === id
                      ? T.primary
                      : locked
                        ? T.textFaint
                        : T.textSoft,
                  transition: "all .15s",
                  position: "relative",
                  top: 1,
                  whiteSpace: "nowrap",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {locked ? (
                  <Lock style={{ width: 11, height: 11 }} />
                ) : (
                  <Icon style={{ width: 13, height: 13 }} />
                )}
                {label}
                {(count ?? 0) > 0 && (
                  <span
                    style={{
                      background: activeTab === id ? T.primary : T.border,
                      color: activeTab === id ? "#fff" : T.textSoft,
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 99,
                      marginLeft: 2,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 60px" }}
      >
        {/* ══ NOTICES ══════════════════════════════════════════════════════ */}
        {activeTab === "notices" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              animation: "fadeUp .25s ease",
            }}
          >
            {allNotices.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No notices"
                message="No notices posted yet."
                color={T.accentLight}
                iconColor={T.accent}
              />
            ) : (
              allNotices.map((n, i) => {
                const tc = noticeConfig[n.type] || noticeConfig.info;
                const Icon = tc.icon;
                const isExpanded = expandedNotice === n.id + (n._source || "");
                const isTeacher = n._source === "teacher";
                return (
                  <div
                    key={n.id + (n._source || "")}
                    style={{
                      background: T.surface,
                      borderRadius: T.radius,
                      border: `1px solid ${T.border}`,
                      borderLeft: `4px solid ${isTeacher ? T.teal : tc.color}`,
                      boxShadow: T.shadow,
                      animation: `fadeUp .3s ease ${i * 0.04}s both`,
                    }}
                  >
                    <div style={{ padding: "14px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: ".04em",
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: isTeacher ? T.tealLight : tc.bg,
                            color: isTeacher ? T.teal : tc.color,
                          }}
                        >
                          <Icon style={{ width: 10, height: 10 }} />
                          {isTeacher ? `Class Notice` : tc.label}
                        </span>
                        {isTeacher && n.grade && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 99,
                              background: T.primaryLight,
                              color: T.primary,
                            }}
                          >
                            {n.grade}
                          </span>
                        )}
                        {n.pinned && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 99,
                              background: "#fffbeb",
                              color: "#b45309",
                            }}
                          >
                            📌 Pinned
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            color: T.textFaint,
                            marginLeft: "auto",
                          }}
                        >
                          {n.date}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'Crimson Pro',serif",
                          fontSize: 17,
                          fontWeight: 600,
                          color: T.ink,
                          marginBottom: 5,
                          lineHeight: 1.3,
                        }}
                      >
                        {n.title}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: T.textMid,
                          lineHeight: 1.65,
                          display: "-webkit-box",
                          WebkitLineClamp: isExpanded ? "unset" : 3,
                          WebkitBoxOrient: "vertical",
                          overflow: isExpanded ? "visible" : "hidden",
                        }}
                      >
                        {n.body || n.message}
                      </p>
                      {isTeacher && n.postedBy && (
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontFamily: "'Crimson Pro',serif",
                            fontStyle: "italic",
                            fontSize: 13,
                            color: T.textFaint,
                          }}
                        >
                          — {n.postedBy}
                        </p>
                      )}
                      {(n.body || n.message)?.length > 120 && (
                        <button
                          onClick={() =>
                            setExpandedNotice(
                              isExpanded ? null : n.id + (n._source || ""),
                            )
                          }
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            color: isTeacher ? T.teal : tc.color,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px 0",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontFamily: "'Sora',sans-serif",
                          }}
                        >
                          {isExpanded ? "Show less" : "Read more"}
                          <ChevronRight
                            style={{
                              width: 13,
                              height: 13,
                              transform: isExpanded ? "rotate(90deg)" : "none",
                              transition: "transform .2s",
                            }}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══ HOMEWORK ══════════════════════════════════════════════════════ */}
        {activeTab === "homework" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            {grades.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(g)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".04em",
                      border: `1px solid ${gradeFilter === g ? "transparent" : T.border}`,
                      cursor: "pointer",
                      background: gradeFilter === g ? T.primary : T.surface,
                      color: gradeFilter === g ? "#fff" : T.textMid,
                      boxShadow: T.shadow,
                      transition: "all .15s",
                      fontFamily: "'Sora',sans-serif",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
            {filteredHW.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="All caught up!"
                message="No homework assigned yet."
                color={T.primaryLight}
                iconColor={T.primary}
              />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {filteredHW.map((hw, i) => {
                  const p = priorityConfig[hw.priority] || priorityConfig.low;
                  const isOverdue =
                    hw.dueDate &&
                    hw.dueDate < new Date().toISOString().split("T")[0];
                  return (
                    <div
                      key={hw.id}
                      style={{
                        background: T.surface,
                        borderRadius: T.radius,
                        border: `1px solid ${T.border}`,
                        overflow: "hidden",
                        boxShadow: T.shadow,
                        animation: `fadeUp .3s ease ${i * 0.05}s both`,
                      }}
                    >
                      <div
                        style={{
                          height: 4,
                          background: isOverdue ? T.red : p.dot,
                        }}
                      />
                      <div style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 13,
                              background: T.primaryLight,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              border: `1px solid ${T.border}`,
                            }}
                          >
                            <BookOpen
                              style={{
                                width: 18,
                                height: 18,
                                color: T.primary,
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                margin: 0,
                                fontFamily: "'Crimson Pro',serif",
                                fontSize: 17,
                                fontWeight: 600,
                                color: T.ink,
                                lineHeight: 1.3,
                              }}
                            >
                              {hw.title}
                            </p>
                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: 12,
                                color: T.textSoft,
                              }}
                            >
                              {[hw.subject, hw.grade]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            {hw.assignedBy && (
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontFamily: "'Crimson Pro',serif",
                                  fontStyle: "italic",
                                  fontSize: 13,
                                  color: T.textFaint,
                                }}
                              >
                                by {hw.assignedBy}
                              </p>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: ".04em",
                              padding: "4px 10px",
                              borderRadius: 99,
                              background: p.bg,
                              color: p.color,
                              flexShrink: 0,
                            }}
                          >
                            {p.label}
                          </span>
                        </div>
                        {hw.dueDate && (
                          <div
                            style={{
                              marginTop: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              padding: "8px 12px",
                              borderRadius: 10,
                              background: isOverdue ? "#fff0f0" : T.surfaceAlt,
                              border: `1px solid ${isOverdue ? "#fecaca" : T.border}`,
                            }}
                          >
                            <Clock
                              style={{
                                width: 13,
                                height: 13,
                                color: isOverdue ? T.red : T.textSoft,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: isOverdue ? T.red : T.textMid,
                              }}
                            >
                              {isOverdue ? "⚠ Overdue — " : "Due "}
                              {formatDueDate(hw.dueDate)}
                            </span>
                          </div>
                        )}
                        {hw.attachmentUrl && (
                          <div
                            style={{
                              display: "flex",
                              gap: 7,
                              marginTop: 10,
                              flexWrap: "wrap",
                            }}
                          >
                            <a
                              href={hw.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "5px 12px",
                                borderRadius: 99,
                                background: T.blueLight,
                                border: "1px solid #bfdbfe",
                                color: T.blue,
                                fontSize: 11,
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              <ExternalLink style={{ width: 11, height: 11 }} />{" "}
                              View
                            </a>
                            <a
                              href={hw.attachmentUrl}
                              download={hw.attachmentName || "homework.pdf"}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "5px 12px",
                                borderRadius: 99,
                                background: "#f0fdf4",
                                border: "1px solid #86efac",
                                color: "#15803d",
                                fontSize: 11,
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              <Download style={{ width: 11, height: 11 }} />{" "}
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ EVENTS ════════════════════════════════════════════════════════ */}
        {activeTab === "events" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              animation: "fadeUp .25s ease",
            }}
          >
            {events.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Nothing coming up"
                message="No events scheduled."
                color="#ede9fe"
                iconColor={T.purple}
              />
            ) : (
              events.map((ev, i) => {
                const d = new Date(ev.date + "T00:00:00");
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysAway = Math.round((d - today) / 86400000);
                const isClose = daysAway <= 3;
                return (
                  <div
                    key={ev.id}
                    style={{
                      background: T.surface,
                      borderRadius: T.radius,
                      border: `1px solid ${T.border}`,
                      boxShadow: T.shadow,
                      animation: `fadeUp .3s ease ${i * 0.05}s both`,
                    }}
                  >
                    <div
                      style={{
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 58,
                          borderRadius: 14,
                          background: isClose ? "#fff0f0" : T.primaryLight,
                          border: `1.5px solid ${isClose ? "#fecaca" : "#c6e8d9"}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "'Crimson Pro',serif",
                            fontSize: 24,
                            fontWeight: 600,
                            color: isClose ? T.red : T.primary,
                            lineHeight: 1,
                          }}
                        >
                          {d.getDate()}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: ".08em",
                            color: isClose ? "#fc8181" : "#52b98a",
                          }}
                        >
                          {d
                            .toLocaleDateString("en", { month: "short" })
                            .toUpperCase()}
                        </p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "'Crimson Pro',serif",
                            fontSize: 17,
                            fontWeight: 600,
                            color: T.ink,
                          }}
                        >
                          {ev.title}
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: 12,
                            color: T.textSoft,
                          }}
                        >
                          {d.toLocaleDateString("en", { weekday: "long" })}
                          {ev.time ? ` · ${ev.time}` : ""}
                        </p>
                        {ev.description && (
                          <p
                            style={{
                              margin: "3px 0 0",
                              fontSize: 12,
                              color: T.textFaint,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ev.description}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: ".03em",
                          padding: "5px 11px",
                          borderRadius: 99,
                          background:
                            daysAway === 0
                              ? T.red
                              : daysAway <= 3
                                ? "#fff0f0"
                                : T.surfaceAlt,
                          color:
                            daysAway === 0
                              ? "#fff"
                              : daysAway <= 3
                                ? T.red
                                : T.textSoft,
                          flexShrink: 0,
                        }}
                      >
                        {daysAway === 0
                          ? "Today"
                          : daysAway === 1
                            ? "Tomorrow"
                            : `${daysAway}d away`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══ TIMETABLE ═════════════════════════════════════════════════════ */}
        {activeTab === "timetable" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            {!timetable || ttGrades.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No timetable yet"
                message="The school hasn't published a timetable yet."
                color={T.blueLight}
                iconColor={T.blue}
              />
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  {ttGrades.map((g) => (
                    <button
                      key={g}
                      onClick={() => setTtGrade(g)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 700,
                        border: `1px solid ${ttGrade === g ? "transparent" : T.border}`,
                        cursor: "pointer",
                        background: ttGrade === g ? T.primary : T.surface,
                        color: ttGrade === g ? "#fff" : T.textMid,
                        boxShadow: T.shadow,
                        transition: "all .15s",
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    overflowX: "auto",
                    paddingBottom: 4,
                    marginBottom: 14,
                  }}
                >
                  {DAYS.map((day) => {
                    const isToday =
                      day ===
                      new Date().toLocaleDateString("en", { weekday: "long" });
                    return (
                      <button
                        key={day}
                        onClick={() => setTtDay(day)}
                        style={{
                          flexShrink: 0,
                          padding: "8px 14px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          border: `1px solid ${ttDay === day ? "transparent" : T.border}`,
                          cursor: "pointer",
                          background:
                            ttDay === day
                              ? T.primary
                              : isToday
                                ? T.primaryLight
                                : T.surface,
                          color:
                            ttDay === day
                              ? "#fff"
                              : isToday
                                ? T.primary
                                : T.textMid,
                          boxShadow: T.shadow,
                          transition: "all .15s",
                          position: "relative",
                          fontFamily: "'Sora',sans-serif",
                        }}
                      >
                        {day.slice(0, 3)}
                        {isToday && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 4,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background:
                                ttDay === day
                                  ? "rgba(255,255,255,0.8)"
                                  : T.primary,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                {ttPeriods.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title={`No classes on ${ttDay}`}
                    message="Nothing scheduled for this day."
                    color={T.bg}
                    iconColor={T.textFaint}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {ttPeriods.map((period, i) => {
                      const isObj =
                        typeof period === "object" && period !== null;
                      const subject = isObj
                        ? period.subject || period.name || String(period)
                        : String(period);
                      const teacher = isObj ? period.teacher : null;
                      const time = isObj ? period.time : null;
                      const room = isObj ? period.room : null;
                      const accents = [
                        { bg: T.primaryLight, color: T.primary },
                        { bg: T.blueLight, color: T.blue },
                        { bg: T.purpleLight, color: T.purple },
                        { bg: T.accentLight, color: "#b45309" },
                        { bg: "#fff0f0", color: T.red },
                      ];
                      const ac = accents[i % accents.length];
                      return (
                        <div
                          key={i}
                          style={{
                            background: T.surface,
                            borderRadius: T.radius,
                            border: `1px solid ${T.border}`,
                            boxShadow: T.shadow,
                            overflow: "hidden",
                            animation: `fadeUp .3s ease ${i * 0.05}s both`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              padding: "13px 16px",
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 11,
                                background: ac.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                border: `1px solid ${T.border}`,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "'Crimson Pro',serif",
                                  fontSize: 16,
                                  fontWeight: 600,
                                  color: ac.color,
                                }}
                              >
                                {i + 1}
                              </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontFamily: "'Crimson Pro',serif",
                                  fontSize: 17,
                                  fontWeight: 600,
                                  color: T.ink,
                                }}
                              >
                                {subject || "—"}
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  marginTop: 3,
                                  flexWrap: "wrap",
                                }}
                              >
                                {teacher && (
                                  <span
                                    style={{ fontSize: 11, color: T.textSoft }}
                                  >
                                    {teacher}
                                  </span>
                                )}
                                {room && (
                                  <span
                                    style={{ fontSize: 11, color: T.textFaint }}
                                  >
                                    Room {room}
                                  </span>
                                )}
                              </div>
                            </div>
                            {time && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "5px 10px",
                                  borderRadius: 99,
                                  background: T.surfaceAlt,
                                  border: `1px solid ${T.border}`,
                                  flexShrink: 0,
                                }}
                              >
                                <Clock
                                  style={{
                                    width: 11,
                                    height: 11,
                                    color: T.textSoft,
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: T.textMid,
                                  }}
                                >
                                  {time}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ REPORTS ═══════════════════════════════════════════════════════ */}
        {activeTab === "reports" && verifiedStudent && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <SectionHeader
              name={verifiedStudent.name}
              grade={verifiedStudent.grade}
            />

            {studentReports.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No reports yet"
                message="No report cards have been saved for your child yet."
                color={T.purpleLight}
                iconColor={T.purple}
              />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {studentReports.map((rep, i) => {
                  const isExpanded = expandedReport === rep.id;
                  const rd = rep.reportData || {};

                  const comments = [1, 2, 3, 4]
                    .map((n) => ({ term: n, text: rd[`comments${n}`] }))
                    .filter((c) => c.text?.trim());

                  const themeAccents = {
                    classic: "#1d3557",
                    modern: "#1e3a8a",
                    professional: "#111827",
                    playful: "#7c3aed",
                    gradeR: "#7c3aed",
                    grade0: "#db2777",
                    grade1: "#b45309",
                    grade2: "#0369a1",
                    grade3: "#15803d",
                    grade4: "#6d28d9",
                    grade5: "#9a3412",
                    grade6: "#0f4c75",
                    grade7: "#111827",
                  };
                  const accentColor = themeAccents[rep.themeId] || T.primary;

                  return (
                    <div
                      key={rep.id}
                      style={{
                        background: T.surface,
                        borderRadius: T.radius,
                        border: `1px solid ${T.border}`,
                        boxShadow: T.shadow,
                        overflow: "hidden",
                        animation: `fadeUp .3s ease ${i * 0.05}s both`,
                      }}
                    >
                      <div style={{ height: 5, background: accentColor }} />

                      <div style={{ padding: "16px 16px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: 13,
                              background: T.primaryLight,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              border: `1px solid ${T.border}`,
                            }}
                          >
                            <FileText
                              style={{
                                width: 20,
                                height: 20,
                                color: accentColor,
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                margin: 0,
                                fontFamily: "'Crimson Pro',serif",
                                fontSize: 18,
                                fontWeight: 600,
                                color: T.ink,
                              }}
                            >
                              Progress Report
                            </p>
                            <p
                              style={{
                                margin: "3px 0 0",
                                fontSize: 12,
                                color: T.textSoft,
                              }}
                            >
                              Grade {rd.grade || verifiedStudent.grade}
                              {rd.schoolYear ? ` · ${rd.schoolYear}` : ""}
                              {rd.classGrade ? ` · ${rd.classGrade}` : ""}
                            </p>
                            {rd.teacher && (
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontFamily: "'Crimson Pro',serif",
                                  fontStyle: "italic",
                                  fontSize: 13,
                                  color: T.textFaint,
                                }}
                              >
                                {rd.teacher}
                              </p>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "5px 12px",
                              borderRadius: 99,
                              background: T.primaryLight,
                              color: accentColor,
                              flexShrink: 0,
                            }}
                          >
                            {rd.schoolYear || "2026"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 14,
                          }}
                        >
                          {[
                            rd.reportDate && { label: "📅 " + rd.reportDate },
                            rd.principal && { label: "🏫 " + rd.principal },
                            rd.emisNo && { label: "ID: " + rd.emisNo },
                          ]
                            .filter(Boolean)
                            .map(({ label }) => (
                              <span
                                key={label}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "4px 11px",
                                  borderRadius: 99,
                                  background: T.surfaceAlt,
                                  color: T.textMid,
                                  border: `1px solid ${T.border}`,
                                }}
                              >
                                {label}
                              </span>
                            ))}
                        </div>

                        <button
                          onClick={() =>
                            setExpandedReport(isExpanded ? null : rep.id)
                          }
                          style={{
                            marginTop: 12,
                            width: "100%",
                            padding: "9px",
                            borderRadius: 10,
                            background: T.surfaceAlt,
                            border: `1px solid ${T.border}`,
                            fontSize: 12,
                            fontWeight: 700,
                            color: T.textMid,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            fontFamily: "'Sora',sans-serif",
                          }}
                        >
                          <ClipboardList style={{ width: 13, height: 13 }} />
                          {isExpanded
                            ? "Hide comments"
                            : "View teacher comments"}
                          <ChevronDown
                            style={{
                              width: 13,
                              height: 13,
                              transform: isExpanded ? "rotate(180deg)" : "none",
                              transition: "transform .2s",
                            }}
                          />
                        </button>
                      </div>

                      {isExpanded && (
                        <div
                          style={{
                            borderTop: `1px solid ${T.border}`,
                            padding: "14px 16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            background: T.bg,
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 14px",
                              borderRadius: 12,
                              background: T.surface,
                              border: `1px solid ${T.border}`,
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "8px 16px",
                            }}
                          >
                            {[
                              ["Date of Birth", rd.dob],
                              ["EMIS No.", rd.emisNo],
                              ["Class", rd.classGrade],
                              ["Principal", rd.principal],
                              ["Report Date", rd.reportDate],
                              ["School Year", rd.schoolYear],
                            ]
                              .filter(([, v]) => v)
                              .map(([label, value]) => (
                                <div key={label}>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 9,
                                      fontWeight: 600,
                                      color: T.textFaint,
                                      textTransform: "uppercase",
                                      letterSpacing: ".07em",
                                    }}
                                  >
                                    {label}
                                  </p>
                                  <p
                                    style={{
                                      margin: "1px 0 0",
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: T.text,
                                    }}
                                  >
                                    {value}
                                  </p>
                                </div>
                              ))}
                          </div>

                          {comments.length > 0 ? (
                            <>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: T.textSoft,
                                  textTransform: "uppercase",
                                  letterSpacing: ".08em",
                                }}
                              >
                                Teacher Comments
                              </p>
                              {comments.map(({ term, text }) => (
                                <div
                                  key={term}
                                  style={{
                                    padding: "12px 14px",
                                    borderRadius: 12,
                                    background: T.primaryLight,
                                    border: `1px solid #c6e8d9`,
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: "0 0 6px",
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: accentColor,
                                      textTransform: "uppercase",
                                      letterSpacing: ".08em",
                                    }}
                                  >
                                    Term {term}
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontFamily: "'Crimson Pro',serif",
                                      fontSize: 15,
                                      color: T.textMid,
                                      lineHeight: 1.65,
                                    }}
                                  >
                                    {text}
                                  </p>
                                </div>
                              ))}
                            </>
                          ) : (
                            <div
                              style={{
                                padding: "16px",
                                textAlign: "center",
                                color: T.textFaint,
                                fontSize: 13,
                                border: `1.5px dashed ${T.border}`,
                                borderRadius: 12,
                              }}
                            >
                              No teacher comments recorded yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ MARKS ═════════════════════════════════════════════════════════ */}
        {activeTab === "marks" && verifiedStudent && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <SectionHeader
              name={verifiedStudent.name}
              grade={verifiedStudent.grade}
            />
            {myMarkbook.length === 0 ? (
              <EmptyState
                icon={BarChart2}
                title="No marks yet"
                message="No assessment results have been recorded for your child's class yet."
                color={T.blueLight}
                iconColor={T.blue}
              />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {(() => {
                  const subjectMap = {};
                  myMarkbook.forEach((entry) => {
                    const sub = entry.subject;
                    if (!subjectMap[sub]) subjectMap[sub] = [];
                    const studentScore =
                      entry.scores?.[verifiedStudent.id] ??
                      entry.scores?.[verifiedStudent.name];
                    if (studentScore !== undefined && studentScore !== "") {
                      subjectMap[sub].push({
                        assessment: entry.assessment,
                        score: parseFloat(studentScore),
                        total: parseFloat(entry.total || 100),
                        date: entry.date,
                      });
                    }
                  });
                  return Object.entries(subjectMap).map(
                    ([subject, results]) => {
                      if (!results.length) return null;
                      const avg =
                        results.reduce(
                          (a, r) => a + (r.score / r.total) * 100,
                          0,
                        ) / results.length;
                      const avgColor =
                        avg >= 75 ? "#15803d" : avg >= 50 ? "#b45309" : T.red;
                      return (
                        <div
                          key={subject}
                          style={{
                            background: T.surface,
                            borderRadius: T.radius,
                            border: `1px solid ${T.border}`,
                            overflow: "hidden",
                            boxShadow: T.shadow,
                          }}
                        >
                          <div
                            style={{
                              padding: "14px 16px",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: T.blueLight,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                border: `1px solid ${T.border}`,
                              }}
                            >
                              <BookOpen
                                style={{ width: 18, height: 18, color: T.blue }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontFamily: "'Crimson Pro',serif",
                                  fontSize: 18,
                                  fontWeight: 600,
                                  color: T.ink,
                                }}
                              >
                                {subject}
                              </p>
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontSize: 12,
                                  color: T.textSoft,
                                }}
                              >
                                {results.length} assessment
                                {results.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontFamily: "'Crimson Pro',serif",
                                  fontSize: 26,
                                  fontWeight: 600,
                                  color: avgColor,
                                }}
                              >
                                {avg.toFixed(0)}%
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: T.textFaint,
                                  letterSpacing: ".04em",
                                }}
                              >
                                avg
                              </p>
                            </div>
                          </div>
                          <div style={{ borderTop: `1px solid ${T.border}` }}>
                            {results.map((r, ri) => {
                              const pct = (r.score / r.total) * 100;
                              const col =
                                pct >= 75
                                  ? "#15803d"
                                  : pct >= 50
                                    ? "#b45309"
                                    : T.red;
                              return (
                                <div
                                  key={ri}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 16px",
                                    borderBottom:
                                      ri < results.length - 1
                                        ? `1px solid ${T.border}`
                                        : "none",
                                    background: T.surfaceAlt,
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: T.text,
                                      }}
                                    >
                                      {r.assessment}
                                    </p>
                                    <p
                                      style={{
                                        margin: "1px 0 0",
                                        fontSize: 11,
                                        color: T.textFaint,
                                      }}
                                    >
                                      {r.date}
                                    </p>
                                  </div>
                                  <div style={{ textAlign: "right" }}>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontFamily: "'Crimson Pro',serif",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        color: col,
                                      }}
                                    >
                                      {r.score}/{r.total}
                                    </p>
                                    <div
                                      style={{
                                        marginTop: 3,
                                        width: 50,
                                        height: 4,
                                        borderRadius: 99,
                                        background: T.border,
                                        overflow: "hidden",
                                        marginLeft: "auto",
                                      }}
                                    >
                                      <div
                                        style={{
                                          height: "100%",
                                          width: `${Math.min(100, pct)}%`,
                                          background: col,
                                          borderRadius: 99,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    },
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ══ PERMISSION SLIPS ══════════════════════════════════════════════ */}
        {activeTab === "slips" && verifiedStudent && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <SectionHeader
              name={verifiedStudent.name}
              grade={verifiedStudent.grade}
            />
            {myPermEvents.length === 0 ? (
              <EmptyState
                icon={Flag}
                title="No events"
                message="No permission slip events for your child's class yet."
                color={T.tealLight}
                iconColor={T.teal}
              />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {myPermEvents.map((evt, i) => {
                  const myStatus =
                    evt.slips?.[verifiedStudent.id] ||
                    evt.slips?.[verifiedStudent.name] ||
                    "pending";
                  const statusCfg = {
                    returned: {
                      label: "✓ Slip Returned",
                      bg: "#f0fdf4",
                      color: "#15803d",
                      border: "#86efac",
                    },
                    pending: {
                      label: "⏳ Slip Pending",
                      bg: "#fffbeb",
                      color: "#b45309",
                      border: "#fcd34d",
                    },
                    absent: {
                      label: "⚠ Slip Missing",
                      bg: T.redLight,
                      color: T.red,
                      border: "#fca5a5",
                    },
                  }[myStatus] || {
                    label: "Pending",
                    bg: "#fffbeb",
                    color: "#b45309",
                    border: "#fcd34d",
                  };
                  return (
                    <div
                      key={evt.id}
                      style={{
                        background: T.surface,
                        borderRadius: T.radius,
                        border: `1.5px solid ${statusCfg.border}`,
                        boxShadow: T.shadow,
                        overflow: "hidden",
                        animation: `fadeUp .3s ease ${i * 0.05}s both`,
                      }}
                    >
                      <div
                        style={{
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 13,
                            background: T.tealLight,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: `1px solid ${T.border}`,
                          }}
                        >
                          <Flag
                            style={{ width: 20, height: 20, color: T.teal }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontFamily: "'Crimson Pro',serif",
                              fontSize: 17,
                              fontWeight: 600,
                              color: T.ink,
                            }}
                          >
                            {evt.eventName}
                          </p>
                          <p
                            style={{
                              margin: "3px 0 0",
                              fontSize: 12,
                              color: T.textSoft,
                            }}
                          >
                            {evt.eventDate || "Date TBC"}
                            {evt.description ? ` · ${evt.description}` : ""}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: ".03em",
                            padding: "6px 12px",
                            borderRadius: 99,
                            background: statusCfg.bg,
                            color: statusCfg.color,
                            flexShrink: 0,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      {myStatus === "absent" && (
                        <div
                          style={{
                            padding: "10px 16px",
                            background: T.redLight,
                            borderTop: `1px solid #fecaca`,
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: T.red,
                              fontWeight: 500,
                            }}
                          >
                            Please return the signed permission slip to your
                            child's teacher as soon as possible.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ BEHAVIOUR LOG ════════════════════════════════════════════════ */}
        {activeTab === "behaviour" && verifiedStudent && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <SectionHeader
              name={verifiedStudent.name}
              grade={verifiedStudent.grade}
            />

            <div
              style={{
                padding: "12px 14px",
                background: T.blueLight,
                borderRadius: 12,
                border: "1px solid #bfdbfe",
                marginBottom: 16,
                display: "flex",
                gap: 10,
              }}
            >
              <Info
                style={{
                  width: 16,
                  height: 16,
                  color: T.blue,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: T.blue,
                  lineHeight: 1.6,
                }}
              >
                This shows any behaviour incidents logged by your child's
                teacher. Please contact the school if you have questions.
              </p>
            </div>

            {myIncidents.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title="No incidents"
                message="No behaviour incidents have been recorded for your child."
                color={T.primaryLight}
                iconColor={T.primary}
              />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {myIncidents.map((inc, i) => {
                  const sc = {
                    low: { label: "Minor", bg: "#fffbeb", color: "#b45309" },
                    medium: { label: "Moderate", bg: T.redLight, color: T.red },
                    high: { label: "Serious", bg: "#fee2e2", color: "#7f1d1d" },
                  }[inc.severity] || {
                    label: "Minor",
                    bg: "#fffbeb",
                    color: "#b45309",
                  };
                  return (
                    <div
                      key={inc.id}
                      style={{
                        background: T.surface,
                        borderRadius: T.radius,
                        border: `1px solid ${T.border}`,
                        overflow: "hidden",
                        boxShadow: T.shadow,
                        animation: `fadeUp .3s ease ${i * 0.05}s both`,
                      }}
                    >
                      <div style={{ height: 3, background: sc.color }} />
                      <div style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: ".04em",
                              padding: "3px 10px",
                              borderRadius: 99,
                              background: sc.bg,
                              color: sc.color,
                            }}
                          >
                            {sc.label}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: T.textMid,
                            }}
                          >
                            {inc.type}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: T.textFaint,
                              marginLeft: "auto",
                            }}
                          >
                            {inc.date}
                          </span>
                        </div>
                        {inc.description && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              color: T.textMid,
                              lineHeight: 1.6,
                            }}
                          >
                            {inc.description}
                          </p>
                        )}
                        {inc.actionTaken && (
                          <div
                            style={{
                              marginTop: 10,
                              padding: "8px 12px",
                              borderRadius: 9,
                              background: T.primaryLight,
                              border: `1px solid #c6e8d9`,
                            }}
                          >
                            <p
                              style={{
                                margin: "0 0 3px",
                                fontSize: 10,
                                fontWeight: 600,
                                color: T.primary,
                                textTransform: "uppercase",
                                letterSpacing: ".07em",
                              }}
                            >
                              Action Taken
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                color: T.textMid,
                              }}
                            >
                              {inc.actionTaken}
                            </p>
                          </div>
                        )}
                        {inc.parentNotified && (
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <CheckCircle
                              style={{
                                width: 13,
                                height: 13,
                                color: "#15803d",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#15803d",
                              }}
                            >
                              You were notified by the teacher
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ FEES ══════════════════════════════════════════════════════════ */}
        {activeTab === "fees" &&
          verifiedStudent &&
          (() => {
            const fees = verifiedStudent.fees || {};
            const paid = Number(fees.paid || 0);
            const total = Number(fees.total || 0);
            const balance = Math.max(0, total - paid);
            const pct = total
              ? Math.min(100, Math.round((paid / total) * 100))
              : 0;
            const status =
              fees.status ||
              (paid >= total && total > 0
                ? "paid"
                : paid > 0
                  ? "partial"
                  : "unpaid");
            const sc = {
              paid: {
                label: "Paid Up",
                bg: "#f0fdf4",
                color: "#15803d",
                bar: "#22c55e",
              },
              partial: {
                label: "Partial",
                bg: "#fffbeb",
                color: "#b45309",
                bar: "#f59e0b",
              },
              unpaid: {
                label: "Outstanding",
                bg: T.redLight,
                color: T.red,
                bar: T.red,
              },
            }[status] || {
              label: "Unknown",
              bg: T.surfaceAlt,
              color: T.textSoft,
              bar: T.textFaint,
            };
            return (
              <div style={{ animation: "fadeUp .25s ease" }}>
                <SectionHeader
                  name={verifiedStudent.name}
                  grade={verifiedStudent.grade}
                />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div
                    style={{
                      background: T.surface,
                      borderRadius: T.radius,
                      border: `1px solid ${T.border}`,
                      padding: 20,
                      boxShadow: T.shadow,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 18,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'Crimson Pro',serif",
                          fontSize: 18,
                          fontWeight: 600,
                          color: T.ink,
                        }}
                      >
                        Fee Account
                      </p>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: ".04em",
                          padding: "5px 13px",
                          borderRadius: 99,
                          background: sc.bg,
                          color: sc.color,
                        }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: T.textSoft,
                        }}
                      >
                        Payment progress
                      </span>
                      <span
                        style={{
                          fontFamily: "'Crimson Pro',serif",
                          fontSize: 15,
                          fontWeight: 600,
                          color: sc.color,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 12,
                        borderRadius: 99,
                        background: T.surfaceAlt,
                        overflow: "hidden",
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: sc.bar,
                          borderRadius: 99,
                          transition: "width .8s ease",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {[
                      {
                        label: "Total Fees",
                        value: `R ${total.toLocaleString()}`,
                        color: T.textMid,
                        bg: T.surface,
                      },
                      {
                        label: "Amount Paid",
                        value: `R ${paid.toLocaleString()}`,
                        color: "#15803d",
                        bg: "#f0fdf4",
                      },
                      {
                        label: "Balance Due",
                        value: `R ${balance.toLocaleString()}`,
                        color: balance > 0 ? T.red : T.textSoft,
                        bg: balance > 0 ? T.redLight : T.surface,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          textAlign: "center",
                          padding: "14px 8px",
                          borderRadius: 14,
                          background: item.bg,
                          border: `1px solid ${T.border}`,
                          boxShadow: T.shadow,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "'Crimson Pro',serif",
                            fontSize: 18,
                            fontWeight: 600,
                            color: item.color,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.value}
                        </p>
                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: 10,
                            fontWeight: 600,
                            color: T.textFaint,
                            lineHeight: 1.3,
                            letterSpacing: ".04em",
                          }}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: T.blueLight,
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <Info
                      style={{
                        width: 16,
                        height: 16,
                        color: T.blue,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: T.blue,
                        lineHeight: 1.6,
                      }}
                    >
                      Questions about your fee account? Please contact the
                      school office directly.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* ══ ATTENDANCE ════════════════════════════════════════════════════ */}
        {activeTab === "attendance" && verifiedStudent && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <SectionHeader
              name={verifiedStudent.name}
              grade={verifiedStudent.grade}
            />
            {studentAttendance.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title="No records yet"
                message="Attendance hasn't been recorded yet."
                color={T.primaryLight}
                iconColor={T.primary}
              />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      label: "Present",
                      count: attStats.present,
                      bg: "#f0fdf4",
                      color: "#15803d",
                    },
                    {
                      label: "Absent",
                      count: attStats.absent,
                      bg: T.redLight,
                      color: T.red,
                    },
                    {
                      label: "Late",
                      count: attStats.late,
                      bg: "#fffbeb",
                      color: "#b45309",
                    },
                    {
                      label: "Rate",
                      count: attPercent != null ? `${attPercent}%` : "—",
                      bg: T.primaryLight,
                      color: T.primary,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        textAlign: "center",
                        padding: "10px 4px",
                        borderRadius: 12,
                        background: s.bg,
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'Crimson Pro',serif",
                          fontSize: 22,
                          fontWeight: 600,
                          color: s.color,
                        }}
                      >
                        {s.count}
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: 10,
                          fontWeight: 600,
                          color: T.textFaint,
                          letterSpacing: ".04em",
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: T.surface,
                    borderRadius: T.radius,
                    border: `1px solid ${T.border}`,
                    overflow: "hidden",
                    boxShadow: T.shadow,
                  }}
                >
                  {studentAttendance.map((rec, i) => {
                    const cfg = {
                      present: {
                        label: "Present",
                        bg: "#f0fdf4",
                        color: "#15803d",
                        dot: "#22c55e",
                      },
                      absent: {
                        label: "Absent",
                        bg: T.redLight,
                        color: T.red,
                        dot: T.red,
                      },
                      late: {
                        label: "Late",
                        bg: "#fffbeb",
                        color: "#b45309",
                        dot: "#f59e0b",
                      },
                    }[rec.status] || {
                      label: rec.status,
                      bg: T.surfaceAlt,
                      color: T.textSoft,
                      dot: T.textFaint,
                    };
                    return (
                      <div
                        key={rec.id || i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderBottom:
                            i < studentAttendance.length - 1
                              ? `1px solid ${T.border}`
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: cfg.dot,
                            flexShrink: 0,
                          }}
                        />
                        <p
                          style={{
                            margin: 0,
                            flex: 1,
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.text,
                          }}
                        >
                          {formatDate(rec.date)}
                        </p>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: ".04em",
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: cfg.bg,
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: T.textFaint,
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  Showing last {studentAttendance.length} records
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "20px 16px calc(env(safe-area-inset-bottom,0px) + 20px)",
          borderTop: `1px solid ${T.border}`,
          background: T.surface,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Crimson Pro',serif",
            fontSize: 15,
            fontWeight: 600,
            color: T.textSoft,
          }}
        >
          {schoolName} · Parent Portal
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".06em",
            color: T.textFaint,
          }}
        >
          Information is updated in real-time
        </p>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDueDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff <= 7) return `In ${diff} days`;
  return d.toLocaleDateString("en", { day: "numeric", month: "short" });
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function SectionHeader({ name, grade }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
        padding: "10px 14px",
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e8e4db",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "#e8f5ef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e8e4db",
        }}
      >
        <User style={{ width: 16, height: 16, color: "#1a6b4a" }} />
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: "'Crimson Pro',serif",
            fontSize: 16,
            fontWeight: 600,
            color: "#1a1814",
          }}
        >
          {name}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "#9c9890" }}>{grade}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, message, color, iconColor }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "52px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          background: color,
          border: "1px solid #e8e4db",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Icon style={{ width: 26, height: 26, color: iconColor }} />
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: "'Crimson Pro',serif",
          fontSize: 20,
          fontWeight: 600,
          color: "#1a1814",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "#9c9890",
          maxWidth: 240,
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
    </div>
  );
}

// ── Style constants ────────────────────────────────────────────────────────────
const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
  button { font-family:'Sora',sans-serif; }
`;
const keyframes = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes slideUp {
    from { transform:translateY(100%); }
    to   { transform:translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity:.3; transform:scale(.9); }
    50%      { opacity:1;  transform:scale(1.1); }
  }
`;
