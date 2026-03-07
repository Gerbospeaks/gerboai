import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  School,
  Lock,
  AlertCircle,
  User,
  BookOpen,
  UserCheck,
  LayoutGrid,
  LogOut,
  Check,
  X,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  Clock,
  Star,
  BookMarked,
  Calendar,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  dark: "#0f1923", // deep slate — professional, authoritative
  darkMid: "#1a2635",
  darkLight: "#243040",
  brand: "#3b82f6", // clear blue accent
  brandLight: "#eff6ff",
  brandMid: "#2563eb",
  green: "#10b981",
  greenLight: "#ecfdf5",
  red: "#ef4444",
  redLight: "#fef2f2",
  amber: "#f59e0b",
  amberLight: "#fffbeb",
  surface: "#ffffff",
  bg: "#f1f5f9",
  border: "#e2e8f0",
  text: "#0f172a",
  textMid: "#475569",
  textSoft: "#94a3b8",
  radius: 14,
  shadow: "0 2px 10px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 20px rgba(0,0,0,0.10)",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "10:30", "11:30", "12:30"];
const GRADES = [
  "Pre-School A",
  "Pre-School B",
  "Grade 1",
  "Grade 2",
  "Grade 3",
];

// ── PIN pad digits ─────────────────────────────────────────────────────────────
const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function StaffPortal() {
  const { portalSlug } = useParams();

  // ── School / auth state ────────────────────────────────────────────────────
  const [uid, setUid] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [teacher, setTeacher] = useState(null); // verified staff doc
  const [students, setStudents] = useState([]); // ALL students
  const [attendanceDocs, setAttendanceDocs] = useState([]);
  const [timetable, setTimetable] = useState({});

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── PIN entry ──────────────────────────────────────────────────────────────
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("attendance");

  // ── Attendance state ───────────────────────────────────────────────────────
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: status }
  const [savingAtt, setSavingAtt] = useState(false);
  const [attSaved, setAttSaved] = useState(false);

  // ── Homework state ─────────────────────────────────────────────────────────
  const [hwForm, setHwForm] = useState({
    subject: "",
    grade: "",
    title: "",
    dueDate: "",
    priority: "medium",
    attachmentUrl: "",
    attachmentName: "",
  });
  const [savingHw, setSavingHw] = useState(false);
  const [hwSaved, setHwSaved] = useState(false);
  const [hwError, setHwError] = useState("");

  // ── Timetable state ────────────────────────────────────────────────────────
  const [ttClass, setTtClass] = useState("");
  const [ttSchedule, setTtSchedule] = useState({});
  const [savingTt, setSavingTt] = useState(false);
  const [ttSaved, setTtSaved] = useState(false);

  // ── Load school ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("portalSlug", "==", portalSlug)),
        );
        if (snap.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const schoolUid = snap.docs[0].id;
        setUid(schoolUid);

        const [bizDoc, staffSnap, stuSnap, attSnap, ttDoc] = await Promise.all([
          getDoc(doc(db, "users", schoolUid, "settings", "businessInfo")),
          getDocs(collection(db, "users", schoolUid, "staff")),
          getDocs(collection(db, "users", schoolUid, "students")),
          getDocs(collection(db, "users", schoolUid, "attendance")),
          getDoc(doc(db, "users", schoolUid, "settings", "timetable")),
        ]);

        const biz = bizDoc.data() || {};
        setSchoolName(biz.name || biz.businessName || "School");
        setLogoUrl(biz.logoUrl || "");
        setStaffList(
          staffSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setStudents(
          stuSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setAttendanceDocs(
          attSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
        setTimetable(ttDoc.exists() ? ttDoc.data() : {});
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [portalSlug]);

  // ── PIN pad handler ────────────────────────────────────────────────────────
  const handlePadPress = (val) => {
    if (val === "⌫") {
      setPin((p) => p.slice(0, -1));
      setPinError("");
      return;
    }
    if (val === "") return;
    if (pin.length >= 6) return;
    setPin((p) => p + val);
  };

  // auto-verify when PIN reaches expected length (try at 4+)
  useEffect(() => {
    if (pin.length >= 4) {
      const match = staffList.find((s) => s.pin === pin);
      if (match) {
        setVerifying(true);
        setTimeout(() => {
          setTeacher(match);
          setVerifying(false);
          // Pre-select first class
          const firstClass = match.classes?.[0] || GRADES[0];
          setSelectedClass(firstClass);
          setTtClass(firstClass);
          setHwForm((f) => ({ ...f, grade: firstClass }));
          // Pre-fill timetable schedule
          setTtSchedule(buildTtSchedule(timetable, firstClass));
        }, 400);
      } else if (pin.length === 6) {
        setPinError("Incorrect PIN. Please try again.");
        setTimeout(() => {
          setPin("");
          setPinError("");
        }, 1200);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const buildTtSchedule = (tt, cls) => {
    const existing = tt?.[cls];
    const empty = DAYS.reduce(
      (acc, d) => ({ ...acc, [d]: Array(TIME_SLOTS.length).fill("") }),
      {},
    );
    return existing ? { ...empty, ...existing } : empty;
  };

  // ── Teacher's classes ──────────────────────────────────────────────────────
  const myClasses = teacher?.classes || [];

  // Students in selected class
  const classStudents = students
    .filter((s) => s.grade === selectedClass)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Initialise attendance map when class changes
  useEffect(() => {
    if (!classStudents.length) return;
    const today = new Date().toISOString().split("T")[0];
    // check if already marked today
    const existing = {};
    attendanceDocs
      .filter(
        (a) =>
          a.date === today && classStudents.find((s) => s.id === a.studentId),
      )
      .forEach((a) => {
        existing[a.studentId] = a.status;
      });
    const map = {};
    classStudents.forEach((s) => {
      map[s.id] = existing[s.id] || "present";
    });
    setAttendanceMap(map);
    setAttSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, students]);

  // ── Save attendance ────────────────────────────────────────────────────────
  const saveAttendance = async () => {
    if (!uid || !classStudents.length) return;
    setSavingAtt(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      await Promise.all(
        classStudents.map((s) =>
          addDoc(collection(db, "users", uid, "attendance"), {
            studentId: s.id,
            studentName: s.name,
            grade: s.grade,
            date: today,
            status: attendanceMap[s.id] || "present",
            markedBy: teacher.name,
            createdAt: serverTimestamp(),
          }),
        ),
      );
      setAttSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAtt(false);
    }
  };

  // ── Save homework ──────────────────────────────────────────────────────────
  const saveHomework = async () => {
    if (!hwForm.title || !hwForm.subject) {
      setHwError("Subject and description are required.");
      return;
    }
    setSavingHw(true);
    setHwError("");
    try {
      const payload = {
        ...hwForm,
        assignedBy: teacher.name,
        createdAt: serverTimestamp(),
      };
      if (!payload.attachmentUrl) {
        delete payload.attachmentUrl;
        delete payload.attachmentName;
      }
      await addDoc(collection(db, "users", uid, "homework"), payload);
      setHwForm({
        subject: "",
        grade: myClasses[0] || "",
        title: "",
        dueDate: "",
        priority: "medium",
        attachmentUrl: "",
        attachmentName: "",
      });
      setHwSaved(true);
      setTimeout(() => setHwSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setHwError("Failed to save. Please try again.");
    } finally {
      setSavingHw(false);
    }
  };

  // ── Save timetable ─────────────────────────────────────────────────────────
  const saveTimetable = async () => {
    if (!uid || !ttClass) return;
    setSavingTt(true);
    try {
      await setDoc(
        doc(db, "users", uid, "settings", "timetable"),
        { [ttClass]: ttSchedule },
        { merge: true },
      );
      setTtSaved(true);
      setTimeout(() => setTtSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingTt(false);
    }
  };

  const setTtCell = (day, idx, val) => {
    setTtSchedule((prev) => {
      const days = [...(prev[day] || Array(TIME_SLOTS.length).fill(""))];
      days[idx] = val;
      return { ...prev, [day]: days };
    });
  };

  // ── Loading / not found ────────────────────────────────────────────────────
  if (loading)
    return (
      <Screen>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: C.dark,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <School style={{ width: 26, height: 26, color: "#fff" }} />
        </div>
        <Dots />
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 13,
            color: C.textSoft,
            marginTop: 8,
          }}
        >
          Loading staff portal…
        </p>
      </Screen>
    );

  if (notFound)
    return (
      <Screen>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: C.redLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <AlertCircle style={{ width: 28, height: 28, color: C.red }} />
        </div>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: C.text,
            margin: 0,
          }}
        >
          School not found
        </p>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 13,
            color: C.textSoft,
            maxWidth: 260,
            textAlign: "center",
            lineHeight: 1.6,
            marginTop: 8,
          }}
        >
          This link doesn't match any school in our system.
        </p>
      </Screen>
    );

  // ── PIN ENTRY SCREEN ───────────────────────────────────────────────────────
  if (!teacher)
    return (
      <div
        style={{
          minHeight: "100svh",
          background: C.dark,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        <style>{fonts + keyframes}</style>

        {/* School branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(255,255,255,0.1)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                style={{ width: 30, height: 30, objectFit: "contain" }}
              />
            ) : (
              <School
                style={{
                  width: 22,
                  height: 22,
                  color: "rgba(255,255,255,0.7)",
                }}
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
              }}
            >
              {schoolName}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                marginTop: 2,
              }}
            >
              Staff Portal
            </p>
          </div>
        </div>

        {/* PIN card */}
        <div
          style={{
            background: C.darkMid,
            borderRadius: 22,
            padding: 28,
            width: "100%",
            maxWidth: 320,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Lock style={{ width: 22, height: 22, color: C.brand }} />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Enter your PIN
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Your school assigned you a 4–6 digit PIN
            </p>
          </div>

          {/* PIN dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  background:
                    i < pin.length ? C.brand : "rgba(255,255,255,0.12)",
                  border: `2px solid ${i < pin.length ? C.brand : "rgba(255,255,255,0.15)"}`,
                  transition: "all .15s",
                  transform: i < pin.length ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {/* Error */}
          {pinError && (
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#fca5a5",
                fontWeight: 500,
                marginBottom: 8,
                animation: "shake .3s ease",
              }}
            >
              {pinError}
            </p>
          )}
          {verifying && (
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: C.brand,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Verifying…
            </p>
          )}

          {/* Number pad */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginTop: 16,
            }}
          >
            {PAD.map((d, i) => (
              <button
                key={i}
                onClick={() => handlePadPress(d)}
                disabled={!d}
                style={{
                  height: 54,
                  borderRadius: 13,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background:
                    d === "⌫"
                      ? "rgba(239,68,68,0.12)"
                      : d === ""
                        ? "transparent"
                        : "rgba(255,255,255,0.06)",
                  color: d === "⌫" ? "#fca5a5" : "#fff",
                  fontSize: d === "⌫" ? 18 : 20,
                  fontWeight: 600,
                  cursor: d ? "pointer" : "default",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  transition: "background .12s",
                }}
                onMouseEnter={(e) => {
                  if (d)
                    e.currentTarget.style.background =
                      d === "⌫"
                        ? "rgba(239,68,68,0.2)"
                        : "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  if (d)
                    e.currentTarget.style.background =
                      d === "⌫"
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(255,255,255,0.06)";
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  // ── STAFF DASHBOARD ────────────────────────────────────────────────────────
  const tabs = [
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "homework", label: "Homework", icon: BookOpen },
    { id: "timetable", label: "Timetable", icon: LayoutGrid },
    { id: "profile", label: "Profile", icon: User },
  ];

  const statusStyle = {
    present: { bg: "#ecfdf5", color: "#059669", border: "#6ee7b7" },
    absent: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
    late: { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
  };

  const priorityOpts = [
    {
      value: "low",
      label: "Low",
      cl: "bg-emerald-50 border-emerald-300 text-emerald-700",
    },
    {
      value: "medium",
      label: "Medium",
      cl: "bg-amber-50 border-amber-300 text-amber-700",
    },
    {
      value: "high",
      label: "Urgent",
      cl: "bg-red-50 border-red-300 text-red-700",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100svh",
        background: C.bg,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{fonts + keyframes}</style>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: C.dark,
          paddingTop: "env(safe-area-inset-top,0px)",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Avatar */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `hsl(${teacher.name.charCodeAt(0) * 7},55%,45%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {teacher.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {teacher.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 1,
                }}
              >
                {teacher.role} · {schoolName}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTeacher(null);
              setPin("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <LogOut style={{ width: 13, height: 13 }} /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 720, margin: "0 auto", overflowX: "auto" }}>
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              minWidth: "max-content",
              width: "100%",
            }}
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  flex: "1 0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderBottom:
                    activeTab === id
                      ? `2.5px solid ${C.brand}`
                      : "2.5px solid transparent",
                  color: activeTab === id ? C.brand : "rgba(255,255,255,0.4)",
                  transition: "all .15s",
                  position: "relative",
                  top: 1,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon style={{ width: 14, height: 14 }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}
      >
        {/* ══ ATTENDANCE TAB ════════════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Mark Attendance"
              subtitle={`${new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}`}
            />

            {/* Class selector */}
            <ClassPicker
              classes={myClasses}
              selected={selectedClass}
              onChange={(cls) => {
                setSelectedClass(cls);
                setAttSaved(false);
              }}
            />

            {classStudents.length === 0 ? (
              <Empty
                icon={UserCheck}
                title="No students"
                message="No students found in this class."
              />
            ) : (
              <div>
                {/* Summary pills */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    {
                      label: "Present",
                      count: Object.values(attendanceMap).filter(
                        (v) => v === "present",
                      ).length,
                      color: C.green,
                      bg: C.greenLight,
                    },
                    {
                      label: "Absent",
                      count: Object.values(attendanceMap).filter(
                        (v) => v === "absent",
                      ).length,
                      color: C.red,
                      bg: C.redLight,
                    },
                    {
                      label: "Late",
                      count: Object.values(attendanceMap).filter(
                        (v) => v === "late",
                      ).length,
                      color: C.amber,
                      bg: C.amberLight,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 12px",
                        borderRadius: 99,
                        background: s.bg,
                        border: `1px solid ${s.color}33`,
                      }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: s.color,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: s.color,
                        }}
                      >
                        {s.count} {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Student rows */}
                <div
                  style={{
                    background: C.surface,
                    borderRadius: C.radius,
                    border: `1px solid ${C.border}`,
                    overflow: "hidden",
                    boxShadow: C.shadow,
                    marginBottom: 14,
                  }}
                >
                  {classStudents.map((s, i) => {
                    const current = attendanceMap[s.id] || "present";
                    return (
                      <div
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderBottom:
                            i < classStudents.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 11,
                            background: `hsl(${s.id.charCodeAt?.(0) * 37 || 120},60%,88%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            color: `hsl(${s.id.charCodeAt?.(0) * 37 || 120},45%,35%)`,
                            flexShrink: 0,
                          }}
                        >
                          {s.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            flex: 1,
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.text,
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.name}
                        </p>
                        {/* Status toggle */}
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          {["present", "absent", "late"].map((st) => {
                            const sc = statusStyle[st];
                            const active = current === st;
                            return (
                              <button
                                key={st}
                                onClick={() =>
                                  setAttendanceMap((m) => ({
                                    ...m,
                                    [s.id]: st,
                                  }))
                                }
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: 9,
                                  border: `1.5px solid ${active ? sc.border : C.border}`,
                                  background: active ? sc.bg : "#fff",
                                  color: active ? sc.color : C.textSoft,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "all .12s",
                                  textTransform: "capitalize",
                                }}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save button */}
                <button
                  onClick={saveAttendance}
                  disabled={savingAtt || attSaved}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 13,
                    background: attSaved ? C.green : C.brand,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    border: "none",
                    cursor: savingAtt || attSaved ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background .2s",
                  }}
                >
                  {attSaved ? (
                    <>
                      <Check style={{ width: 18, height: 18 }} /> Register
                      Saved!
                    </>
                  ) : savingAtt ? (
                    "Saving…"
                  ) : (
                    <>
                      <Save style={{ width: 16, height: 16 }} /> Save Register
                    </>
                  )}
                </button>
                {attSaved && (
                  <p
                    style={{
                      fontSize: 12,
                      color: C.green,
                      textAlign: "center",
                      marginTop: 8,
                      fontWeight: 500,
                    }}
                  >
                    ✓ Attendance has been recorded and is visible to parents.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ HOMEWORK TAB ═════════════════════════════════════════════════ */}
        {activeTab === "homework" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Set Homework"
              subtitle="Assign tasks to your class"
            />

            <div
              style={{
                background: C.surface,
                borderRadius: C.radius,
                border: `1px solid ${C.border}`,
                padding: 20,
                boxShadow: C.shadow,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <Field label="Subject *">
                  <input
                    style={inputSt}
                    placeholder="e.g. Maths"
                    value={hwForm.subject}
                    onChange={(e) =>
                      setHwForm((f) => ({ ...f, subject: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Grade *">
                  <select
                    style={inputSt}
                    value={hwForm.grade}
                    onChange={(e) =>
                      setHwForm((f) => ({ ...f, grade: e.target.value }))
                    }
                  >
                    {myClasses.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Task Description *">
                <input
                  style={{ ...inputSt, width: "100%", boxSizing: "border-box" }}
                  placeholder="e.g. Complete worksheet pages 14–15"
                  value={hwForm.title}
                  onChange={(e) =>
                    setHwForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginTop: 14,
                }}
              >
                <Field label="Due Date">
                  <input
                    type="date"
                    style={inputSt}
                    value={hwForm.dueDate}
                    onChange={(e) =>
                      setHwForm((f) => ({ ...f, dueDate: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Priority">
                  <div style={{ display: "flex", gap: 6 }}>
                    {priorityOpts.map(({ value, label, cl }) => (
                      <button
                        key={value}
                        onClick={() =>
                          setHwForm((f) => ({ ...f, priority: value }))
                        }
                        style={{
                          flex: 1,
                          padding: "8px 4px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          border: `1.5px solid ${hwForm.priority === value ? "currentColor" : "#e2e8f0"}`,
                          cursor: "pointer",
                          transition: "all .12s",
                          background:
                            hwForm.priority === value
                              ? value === "low"
                                ? "#ecfdf5"
                                : value === "medium"
                                  ? "#fffbeb"
                                  : "#fef2f2"
                              : "#fff",
                          color:
                            hwForm.priority === value
                              ? value === "low"
                                ? "#059669"
                                : value === "medium"
                                  ? "#b45309"
                                  : "#dc2626"
                              : C.textSoft,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Optional PDF URL */}
              <div style={{ marginTop: 14 }}>
                <Field label="PDF / Document URL (optional)">
                  <input
                    style={{
                      ...inputSt,
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                    placeholder="https://drive.google.com/..."
                    value={hwForm.attachmentUrl}
                    onChange={(e) =>
                      setHwForm((f) => ({
                        ...f,
                        attachmentUrl: e.target.value,
                      }))
                    }
                  />
                </Field>
                {hwForm.attachmentUrl && (
                  <div style={{ marginTop: 10 }}>
                    <Field label="File Label (optional)">
                      <input
                        style={{
                          ...inputSt,
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                        placeholder='e.g. "Maths Worksheet – Chapter 4"'
                        value={hwForm.attachmentName}
                        onChange={(e) =>
                          setHwForm((f) => ({
                            ...f,
                            attachmentName: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>
                )}
              </div>

              {hwError && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "10px 13px",
                    background: C.redLight,
                    borderRadius: 10,
                    marginTop: 12,
                    border: `1px solid #fecaca`,
                  }}
                >
                  <AlertCircle
                    style={{
                      width: 15,
                      height: 15,
                      color: C.red,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: C.red,
                      fontWeight: 500,
                    }}
                  >
                    {hwError}
                  </p>
                </div>
              )}

              <button
                onClick={saveHomework}
                disabled={savingHw || hwSaved}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 13,
                  background: hwSaved ? C.green : C.brand,
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  cursor: savingHw || hwSaved ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 18,
                  transition: "background .2s",
                }}
              >
                {hwSaved ? (
                  <>
                    <Check style={{ width: 18, height: 18 }} /> Homework Saved!
                  </>
                ) : savingHw ? (
                  "Saving…"
                ) : (
                  <>
                    <BookMarked style={{ width: 16, height: 16 }} /> Assign
                    Homework
                  </>
                )}
              </button>
              {hwSaved && (
                <p
                  style={{
                    fontSize: 12,
                    color: C.green,
                    textAlign: "center",
                    marginTop: 8,
                    fontWeight: 500,
                  }}
                >
                  ✓ Homework is now visible to parents on the portal.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ══ TIMETABLE TAB ════════════════════════════════════════════════ */}
        {activeTab === "timetable" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Class Timetable"
              subtitle="Edit your weekly schedule"
            />

            <ClassPicker
              classes={myClasses}
              selected={ttClass}
              onChange={(cls) => {
                setTtClass(cls);
                setTtSchedule(buildTtSchedule(timetable, cls));
                setTtSaved(false);
              }}
            />

            {/* Grid — scrolls horizontally on mobile */}
            <div
              style={{
                background: C.surface,
                borderRadius: C.radius,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                boxShadow: C.shadow,
                marginBottom: 14,
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    minWidth: 500,
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.textSoft,
                          borderBottom: `1px solid ${C.border}`,
                          width: 52,
                        }}
                      >
                        TIME
                      </th>
                      {DAYS.map((d) => (
                        <th
                          key={d}
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.textMid,
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          {d.slice(0, 3).toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((time, ti) => (
                      <tr
                        key={time}
                        style={{
                          borderBottom:
                            ti < TIME_SLOTS.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 14px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.textSoft,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {time}
                        </td>
                        {DAYS.map((day) => (
                          <td key={day} style={{ padding: "5px 4px" }}>
                            <input
                              style={{
                                width: "100%",
                                padding: "7px 6px",
                                borderRadius: 8,
                                border: `1.5px solid ${C.border}`,
                                fontSize: 12,
                                textAlign: "center",
                                color: C.text,
                                background: "#fff",
                                outline: "none",
                                fontFamily: "'Plus Jakarta Sans',sans-serif",
                                boxSizing: "border-box",
                                transition: "border-color .15s",
                              }}
                              placeholder="—"
                              value={ttSchedule[day]?.[ti] || ""}
                              onChange={(e) =>
                                setTtCell(day, ti, e.target.value)
                              }
                              onFocus={(e) =>
                                (e.target.style.borderColor = C.brand)
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor = C.border)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={saveTimetable}
              disabled={savingTt || ttSaved}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 13,
                background: ttSaved ? C.green : C.brand,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: savingTt || ttSaved ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background .2s",
              }}
            >
              {ttSaved ? (
                <>
                  <Check style={{ width: 18, height: 18 }} /> Timetable Saved!
                </>
              ) : savingTt ? (
                "Saving…"
              ) : (
                <>
                  <Save style={{ width: 16, height: 16 }} /> Save Timetable
                </>
              )}
            </button>
            {ttSaved && (
              <p
                style={{
                  fontSize: 12,
                  color: C.green,
                  textAlign: "center",
                  marginTop: 8,
                  fontWeight: 500,
                }}
              >
                ✓ Timetable updated and visible to parents.
              </p>
            )}
          </div>
        )}

        {/* ══ PROFILE TAB ══════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader title="My Profile" subtitle="Your details on record" />

            <div
              style={{
                background: C.surface,
                borderRadius: C.radius,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                boxShadow: C.shadow,
              }}
            >
              {/* Avatar strip */}
              <div
                style={{
                  background: C.dark,
                  padding: "24px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `hsl(${teacher.name.charCodeAt(0) * 7},55%,45%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {teacher.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {teacher.name}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {teacher.role}
                  </p>
                </div>
              </div>

              {/* Details list */}
              {[
                { label: "Subject / Phase", value: teacher.subject },
                { label: "Phone", value: teacher.phone },
                { label: "Email", value: teacher.email },
                {
                  label: "Status",
                  value:
                    teacher.status === "present"
                      ? "Present today"
                      : "Absent today",
                },
              ]
                .filter((r) => r.value)
                .map((r, i, arr) => (
                  <div
                    key={r.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 20px",
                      borderBottom:
                        i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.textSoft,
                        width: 120,
                        flexShrink: 0,
                      }}
                    >
                      {r.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {r.value}
                    </p>
                  </div>
                ))}

              {/* Classes */}
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.textSoft,
                  }}
                >
                  My Classes
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(teacher.classes || []).map((c) => (
                    <span
                      key={c}
                      style={{
                        padding: "5px 13px",
                        borderRadius: 99,
                        background: C.brandLight,
                        color: C.brandMid,
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1px solid #bfdbfe`,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small shared components ───────────────────────────────────────────────────
function TabHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ margin: "3px 0 0", fontSize: 12, color: C.textSoft }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ClassPicker({ classes, selected, onChange }) {
  if (!classes.length) return null;
  return (
    <div
      style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
    >
      {classes.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            padding: "7px 16px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            background: selected === c ? C.brand : "#fff",
            color: selected === c ? "#fff" : C.textMid,
            boxShadow: C.shadow,
            transition: "all .15s",
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.textMid,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Empty({ icon: Icon, title, message }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Icon style={{ width: 24, height: 24, color: C.textSoft }} />
      </div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: C.textSoft,
          maxWidth: 220,
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
    </div>
  );
}

function Screen({ children }) {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        gap: 8,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      <style>{fonts + keyframes}</style>
      {children}
    </div>
  );
}

function Dots() {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.brand,
            opacity: 0.3,
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputSt = {
  padding: "9px 12px",
  borderRadius: 10,
  border: `1.5px solid #e2e8f0`,
  fontSize: 13,
  color: "#0f172a",
  background: "#f8fafc",
  outline: "none",
  fontFamily: "'Plus Jakarta Sans',sans-serif",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color .15s",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
  button,input,select,textarea { font-family:'Plus Jakarta Sans',sans-serif; }
`;
const keyframes = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity:.3; transform:scale(.9); }
    50%      { opacity:1;  transform:scale(1.1); }
  }
  @keyframes shake {
    0%,100% { transform:translateX(0); }
    25%      { transform:translateX(-6px); }
    75%      { transform:translateX(6px); }
  }
`;
