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

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary: "#1a6b4a",
  primaryLight: "#e8f5ef",
  primaryMid: "#2d8a62",
  accent: "#f59e0b",
  accentLight: "#fef3c7",
  red: "#e53e3e",
  redLight: "#fff5f5",
  blue: "#2b6cb0",
  blueLight: "#ebf8ff",
  purple: "#6b46c1",
  purpleLight: "#faf5ff",
  teal: "#0d9488",
  tealLight: "#f0fdfa",
  bg: "#f7f8f9",
  surface: "#ffffff",
  border: "#e8ecf0",
  text: "#1a202c",
  textMid: "#4a5568",
  textSoft: "#718096",
  textFaint: "#a0aec0",
  radius: 16,
  shadow: "0 2px 12px rgba(0,0,0,0.07)",
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

  // ── school data ────────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState(null);
  const [homework, setHomework] = useState([]);
  const [notices, setNotices] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // from staff portal
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [reports, setReports] = useState([]);
  const [permEvents, setPermEvents] = useState([]); // permission slips
  const [markbook, setMarkbook] = useState([]); // mark book entries
  const [incidents, setIncidents] = useState([]); // behaviour log

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("notices");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [expandedNotice, setExpandedNotice] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);

  // ── timetable local filters ────────────────────────────────────────────────
  const [ttGrade, setTtGrade] = useState("");
  const [ttDay, setTtDay] = useState("Monday");
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // ── identity gate ──────────────────────────────────────────────────────────
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [childInput, setChildInput] = useState("");
  const [identityError, setIdentityError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);

  // ── Load school data ───────────────────────────────────────────────────────
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
              collection(db, "users", uid, "reports"),
              where("locked", "==", true),
              orderBy("createdAt", "desc"),
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
            .filter((d) => !d._placeholder),
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

  // ── Verify child name ──────────────────────────────────────────────────────
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

  // ── Derived: attendance for verified student ───────────────────────────────
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

  // ── Derived: reports for verified student ─────────────────────────────────
  const studentReports = verifiedStudent
    ? reports.filter(
        (r) =>
          r.student?.name?.trim().toLowerCase() ===
          verifiedStudent.name.trim().toLowerCase(),
      )
    : [];

  // ── Derived: permission slips for verified student ────────────────────────
  const myPermEvents = verifiedStudent
    ? permEvents.filter((e) => e.grade === verifiedStudent.grade)
    : [];

  // ── Derived: mark book for verified student ───────────────────────────────
  const myMarkbook = verifiedStudent
    ? markbook.filter((m) => m.grade === verifiedStudent.grade)
    : [];

  // ── Derived: incidents for verified student ────────────────────────────────
  const myIncidents = verifiedStudent
    ? incidents.filter(
        (i) =>
          i.studentId === verifiedStudent.id ||
          i.studentName?.trim().toLowerCase() ===
            verifiedStudent.name.trim().toLowerCase(),
      )
    : [];

  // ── Timetable derived ──────────────────────────────────────────────────────
  const ttGrades = timetable ? Object.keys(timetable) : [];
  useEffect(() => {
    if (ttGrades.length && !ttGrade) setTtGrade(ttGrades[0]);
  }, [ttGrades.length]);
  const ttPeriods =
    timetable && ttGrade && timetable[ttGrade]
      ? timetable[ttGrade][ttDay] || []
      : [];

  // ── Merged notices: school notices + staff announcements ──────────────────
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

  // ── Configs ────────────────────────────────────────────────────────────────
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

  // ── Tabs ───────────────────────────────────────────────────────────────────
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

  // ── Loading ────────────────────────────────────────────────────────────────
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
            fontFamily: "'Outfit',sans-serif",
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
            fontFamily: "'Outfit',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: T.text,
            margin: 0,
          }}
        >
          School not found
        </p>
        <p
          style={{
            fontFamily: "'Outfit',sans-serif",
            fontSize: 14,
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
        fontFamily: "'Outfit',sans-serif",
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
            background: "rgba(0,0,0,0.55)",
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
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              animation: "slideUp .25s ease",
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
                }}
              >
                <User style={{ width: 20, height: 20, color: T.primary }} />
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    color: T.text,
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
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.textMid,
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
                    fontFamily: "'Outfit',sans-serif",
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
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  cursor: verifying ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: verifying ? 0.75 : 1,
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
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {schoolName}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
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
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
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
                    color: "rgba(255,255,255,0.65)",
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
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${T.border}`,
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
                  fontSize: 12,
                  fontWeight: 600,
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
        {/* ══ NOTICES (merged admin + teacher announcements) ════════════════ */}
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
                          fontSize: 15,
                          fontWeight: 700,
                          color: T.text,
                          marginBottom: 6,
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
                            fontSize: 11,
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
                      fontSize: 12,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      background: gradeFilter === g ? T.primary : T.surface,
                      color: gradeFilter === g ? "#fff" : T.textMid,
                      boxShadow: T.shadow,
                      transition: "all .15s",
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
                                fontSize: 15,
                                fontWeight: 700,
                                color: T.text,
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
                                  fontSize: 11,
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
                              background: isOverdue ? "#fff0f0" : T.bg,
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
                            fontSize: 22,
                            fontWeight: 800,
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
                            color: isClose ? "#fc8181" : "#52b98a",
                            letterSpacing: ".08em",
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
                            fontSize: 15,
                            fontWeight: 700,
                            color: T.text,
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
                          padding: "5px 11px",
                          borderRadius: 99,
                          background:
                            daysAway === 0
                              ? T.red
                              : daysAway <= 3
                                ? "#fff0f0"
                                : T.bg,
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
                        fontSize: 12,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: ttGrade === g ? T.primary : T.surface,
                        color: ttGrade === g ? "#fff" : T.textMid,
                        boxShadow: T.shadow,
                        transition: "all .15s",
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
                          fontSize: 12,
                          fontWeight: 700,
                          border: "none",
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
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
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
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: T.text,
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
                                  background: T.bg,
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
                message="No report cards have been published for your child yet."
                color={T.purpleLight}
                iconColor={T.purple}
              />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {studentReports.map((rep, i) => {
                  const avg = rep.performance?.average ?? 0;
                  const isExpanded = expandedReport === rep.id;
                  const attPct = rep.attendance?.percentage
                    ? parseFloat(rep.attendance.percentage)
                    : rep.attendance?.days
                      ? Math.round(
                          (rep.attendance.present / rep.attendance.days) * 100,
                        )
                      : null;
                  const perfColor =
                    avg >= 80
                      ? "#15803d"
                      : avg >= 60
                        ? T.blue
                        : avg >= 50
                          ? "#b45309"
                          : T.red;
                  const perfBg =
                    avg >= 80
                      ? "#f0fdf4"
                      : avg >= 60
                        ? T.blueLight
                        : avg >= 50
                          ? "#fffbeb"
                          : T.redLight;
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
                      <div style={{ height: 4, background: perfColor }} />
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
                              width: 44,
                              height: 44,
                              borderRadius: 13,
                              background: perfBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Award
                              style={{
                                width: 20,
                                height: 20,
                                color: perfColor,
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 15,
                                fontWeight: 700,
                                color: T.text,
                              }}
                            >
                              {rep.academicInfo?.term || "Term"} ·{" "}
                              {rep.academicInfo?.year || ""}
                            </p>
                            <p
                              style={{
                                margin: "3px 0 0",
                                fontSize: 12,
                                color: T.textSoft,
                              }}
                            >
                              {rep.student?.gradeLevel || verifiedStudent.grade}
                              {rep.reportNumber
                                ? ` · #${rep.reportNumber}`
                                : ""}
                            </p>
                          </div>
                          <div
                            style={{
                              textAlign: "center",
                              padding: "8px 14px",
                              borderRadius: 12,
                              background: perfBg,
                              flexShrink: 0,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 20,
                                fontWeight: 800,
                                color: perfColor,
                                lineHeight: 1,
                              }}
                            >
                              {avg}%
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 9,
                                fontWeight: 700,
                                color: perfColor,
                                opacity: 0.75,
                              }}
                            >
                              AVERAGE
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                          {[
                            {
                              label: "Subjects",
                              val:
                                rep.performance?.totalSubjects ??
                                rep.subjects?.length ??
                                0,
                              color: T.primary,
                            },
                            {
                              label: "Attendance",
                              val: attPct != null ? `${attPct}%` : "—",
                              color:
                                attPct >= 90
                                  ? "#15803d"
                                  : attPct >= 75
                                    ? T.blue
                                    : T.red,
                            },
                            {
                              label: "Days",
                              val: `${rep.attendance?.present ?? "—"}/${rep.attendance?.days ?? "—"}`,
                              color: T.textMid,
                            },
                          ].map(({ label, val, color }) => (
                            <div
                              key={label}
                              style={{
                                flex: 1,
                                padding: "9px 12px",
                                borderRadius: 11,
                                background: T.bg,
                                border: `1px solid ${T.border}`,
                                textAlign: "center",
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 16,
                                  fontWeight: 800,
                                  color,
                                }}
                              >
                                {val}
                              </p>
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: T.textFaint,
                                }}
                              >
                                {label}
                              </p>
                            </div>
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
                            background: T.bg,
                            border: `1px solid ${T.border}`,
                            fontSize: 12,
                            fontWeight: 700,
                            color: T.textMid,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <TrendingUp style={{ width: 13, height: 13 }} />
                          {isExpanded ? "Hide details" : "View subject marks"}
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
                          }}
                        >
                          {rep.subjects?.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                              <p
                                style={{
                                  margin: "0 0 10px",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: T.textMid,
                                  textTransform: "uppercase",
                                  letterSpacing: ".06em",
                                }}
                              >
                                Subject Results
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                {rep.subjects.map((subj, si) => {
                                  const mark = Number(subj.mark) || 0;
                                  const grade =
                                    subj.grade ||
                                    (mark >= 80
                                      ? "A"
                                      : mark >= 70
                                        ? "B"
                                        : mark >= 60
                                          ? "C"
                                          : mark >= 50
                                            ? "D"
                                            : "E");
                                  return (
                                    <div
                                      key={si}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "9px 12px",
                                        borderRadius: 11,
                                        background: T.bg,
                                        border: `1px solid ${T.border}`,
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: 9,
                                          background: gradeBg(grade),
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color: gradeColor(grade),
                                          }}
                                        >
                                          {grade}
                                        </span>
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                          style={{
                                            margin: 0,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: T.text,
                                          }}
                                        >
                                          {subj.name}
                                        </p>
                                        {subj.comments && (
                                          <p
                                            style={{
                                              margin: "2px 0 0",
                                              fontSize: 11,
                                              color: T.textSoft,
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {subj.comments}
                                          </p>
                                        )}
                                      </div>
                                      <div
                                        style={{
                                          flexShrink: 0,
                                          textAlign: "right",
                                        }}
                                      >
                                        <p
                                          style={{
                                            margin: 0,
                                            fontSize: 14,
                                            fontWeight: 800,
                                            color: gradeColor(grade),
                                          }}
                                        >
                                          {mark}%
                                        </p>
                                        <div
                                          style={{
                                            marginTop: 3,
                                            width: 60,
                                            height: 4,
                                            borderRadius: 99,
                                            background: T.border,
                                            overflow: "hidden",
                                          }}
                                        >
                                          <div
                                            style={{
                                              height: "100%",
                                              width: `${mark}%`,
                                              background: gradeColor(grade),
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
                          )}
                          {rep.teacherComments && (
                            <div
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
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: T.primary,
                                  textTransform: "uppercase",
                                  letterSpacing: ".06em",
                                }}
                              >
                                Teacher's Comments
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  color: T.textMid,
                                  lineHeight: 1.65,
                                }}
                              >
                                {rep.teacherComments}
                              </p>
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

        {/* ══ MARKS (from mark book) ════════════════════════════════════════ */}
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
                {/* Subject summary cards */}
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
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: T.text,
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
                                  fontSize: 20,
                                  fontWeight: 800,
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
                                    background: T.bg,
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
                                        fontSize: 14,
                                        fontWeight: 800,
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
                              fontSize: 15,
                              fontWeight: 700,
                              color: T.text,
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
                            fontSize: 11,
                            fontWeight: 700,
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

            {/* Sensitive notice */}
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
                              fontSize: 11,
                              fontWeight: 700,
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
                                fontWeight: 700,
                                color: T.primary,
                                textTransform: "uppercase",
                                letterSpacing: ".05em",
                              }}
                            >
                              Action Taken
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
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
              bg: T.bg,
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
                          fontSize: 14,
                          fontWeight: 700,
                          color: T.text,
                        }}
                      >
                        Fee Account
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
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
                          fontSize: 11,
                          fontWeight: 700,
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
                        background: T.bg,
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
                            fontSize: 15,
                            fontWeight: 800,
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
                          fontSize: 18,
                          fontWeight: 800,
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
                      bg: T.bg,
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
                            fontSize: 11,
                            fontWeight: 700,
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
            fontSize: 12,
            color: T.textFaint,
            fontWeight: 500,
          }}
        >
          {schoolName} · Parent Portal
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 10,
            color: T.textFaint,
            opacity: 0.6,
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
        border: "1px solid #e8ecf0",
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
        }}
      >
        <User style={{ width: 16, height: 16, color: "#1a6b4a" }} />
      </div>
      <div>
        <p
          style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a202c" }}
        >
          {name}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "#718096" }}>{grade}</p>
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Icon style={{ width: 26, height: 26, color: iconColor }} />
      </div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a202c" }}>
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "#718096",
          maxWidth: 240,
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
    </div>
  );
}

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
  button { font-family:'Outfit',sans-serif; }
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
