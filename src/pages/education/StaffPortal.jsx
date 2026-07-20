import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
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
  Megaphone,
  ShieldAlert,
  BarChart2,
  ClipboardList,
  Wrench,
  Heart,
  Flag,
  Send,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Package,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  dark: "#0f1923",
  darkMid: "#1a2635",
  darkLight: "#243040",
  brand: "#3b82f6",
  brandLight: "#eff6ff",
  brandMid: "#2563eb",
  green: "#10b981",
  greenLight: "#ecfdf5",
  red: "#ef4444",
  redLight: "#fef2f2",
  amber: "#f59e0b",
  amberLight: "#fffbeb",
  purple: "#8b5cf6",
  purpleLight: "#f5f3ff",
  pink: "#ec4899",
  pinkLight: "#fdf2f8",
  teal: "#14b8a6",
  tealLight: "#f0fdfa",
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
const WORKER_URL = "https://r2-upload-worker.v8-auto.workers.dev";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "10:30", "11:30", "12:30"];
const GRADES = [
  "Grade R",
  "Grade 0",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
];
const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

const INCIDENT_TYPES = [
  "Disruptive behaviour",
  "Physical altercation",
  "Bullying",
  "Defiance / disrespect",
  "Property damage",
  "Inappropriate language",
  "Unsafe behaviour",
  "Other",
];

const INCIDENT_SEVERITY = [
  { value: "low", label: "Minor", color: C.amber, bg: C.amberLight },
  { value: "medium", label: "Moderate", color: C.red, bg: C.redLight },
  { value: "high", label: "Serious", color: "#7f1d1d", bg: "#fee2e2" },
];

const WELFARE_CATEGORIES = [
  "Emotional distress",
  "Suspected hunger / neglect",
  "Signs of abuse",
  "Medical concern",
  "Social isolation",
  "Anxiety / withdrawal",
  "Other safeguarding concern",
];

const RESOURCE_CATEGORIES = [
  "Stationery & supplies",
  "Printing / photocopying",
  "Maintenance / repairs",
  "IT / technology",
  "Cleaning",
  "Furniture",
  "Other",
];
const uploadToCloudflare = async (file) => {
  const auth = getAuth();
  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch(`${WORKER_URL}/upload-pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": file.name,
    },
    body: await file.arrayBuffer(),
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json(); // returns { publicUrl, key }
};
export default function StaffPortal() {
  const { portalSlug } = useParams();

  const [uid, setUid] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceDocs, setAttendanceDocs] = useState([]);
  const [timetable, setTimetable] = useState({});

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [activeTab, setActiveTab] = useState("attendance");

  // ── Attendance ─────────────────────────────────────────────────────────────
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceMap, setAttendanceMap] = useState({});
  const [savingAtt, setSavingAtt] = useState(false);
  const [attSaved, setAttSaved] = useState(false);

  // ── Homework ───────────────────────────────────────────────────────────────
const [hwForm, setHwForm] = useState({
  subject: "",
  grade: "",
  title: "",
  dueDate: "",
  priority: "medium",
  attachmentUrl: "",
  attachmentName: "",
});
const [hwFile, setHwFile] = useState(null);         
const hwFileRef = useRef(null);                      
const [savingHw, setSavingHw] = useState(false);
const [hwSaved, setHwSaved] = useState(false);
const [hwError, setHwError] = useState("");
  // ── Timetable ──────────────────────────────────────────────────────────────
  const [ttClass, setTtClass] = useState("");
  const [ttSchedule, setTtSchedule] = useState({});
  const [savingTt, setSavingTt] = useState(false);
  const [ttSaved, setTtSaved] = useState(false);

  // ── Behaviour / incident log ───────────────────────────────────────────────
  const [incForm, setIncForm] = useState({
    studentId: "",
    type: INCIDENT_TYPES[0],
    severity: "low",
    description: "",
    actionTaken: "",
    parentNotified: false,
  });
  const [savingInc, setSavingInc] = useState(false);
  const [incSaved, setIncSaved] = useState(false);
  const [incError, setIncError] = useState("");

  // ── Class announcements ────────────────────────────────────────────────────
  const [annForm, setAnnForm] = useState({
    grade: "",
    title: "",
    body: "",
    pinned: false,
  });
  const [savingAnn, setSavingAnn] = useState(false);
  const [annSaved, setAnnSaved] = useState(false);
  const [annError, setAnnError] = useState("");

  // ── Mark book ─────────────────────────────────────────────────────────────
  const [mbClass, setMbClass] = useState("");
  const [mbSubject, setMbSubject] = useState("");
  const [mbAssessment, setMbAssessment] = useState("");
  const [mbTotal, setMbTotal] = useState("100");
  const [mbScores, setMbScores] = useState({});
  const [savingMb, setSavingMb] = useState(false);
  const [mbSaved, setMbSaved] = useState(false);
  const [mbError, setMbError] = useState("");

  // ── Permission slips ───────────────────────────────────────────────────────
  const [permEvents, setPermEvents] = useState([]);
  const [permForm, setPermForm] = useState({
    eventName: "",
    grade: "",
    eventDate: "",
    description: "",
  });
  const [activePermEvent, setActivePermEvent] = useState(null);
  const [permSlipMap, setPermSlipMap] = useState({});
  const [savingPerm, setSavingPerm] = useState(false);
  const [permSaved, setPermSaved] = useState(false);
  const [permError, setPermError] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  // ── Student welfare flags ──────────────────────────────────────────────────
  const [welfareForm, setWelfareForm] = useState({
    studentId: "",
    category: WELFARE_CATEGORIES[0],
    urgency: "moderate",
    notes: "",
    anonymous: false,
  });
  const [savingWelfare, setSavingWelfare] = useState(false);
  const [welfareSaved, setWelfareSaved] = useState(false);
  const [welfareError, setWelfareError] = useState("");

  // ── Resource requests ──────────────────────────────────────────────────────
  const [resForm, setResForm] = useState({
    category: RESOURCE_CATEGORIES[0],
    item: "",
    quantity: "",
    urgency: "normal",
    notes: "",
  });
  const [savingRes, setSavingRes] = useState(false);
  const [resSaved, setResSaved] = useState(false);
  const [resError, setResError] = useState("");

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

        const [bizDoc, staffSnap, stuSnap, attSnap, ttDoc, permSnap] =
          await Promise.all([
            getDoc(doc(db, "users", schoolUid, "settings", "businessInfo")),
            getDocs(collection(db, "users", schoolUid, "staff")),
            getDocs(collection(db, "users", schoolUid, "students")),
            getDocs(collection(db, "users", schoolUid, "attendance")),
            getDoc(doc(db, "users", schoolUid, "settings", "timetable")),
            getDocs(collection(db, "users", schoolUid, "permissionEvents")),
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
        setPermEvents(
          permSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => !d._placeholder),
        );
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [portalSlug]);
  useEffect(() => {
  if (!schoolName || schoolName === "School") return;

  const manifestData = {
    short_name: schoolName,
    name: `${schoolName} | Solidflo`,
    start_url: window.location.href,
    scope: window.location.pathname,
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#0f1923",
    background_color: "#f1f5f9",
    icons: [
      { src: "/logo192.png", type: "image/png", sizes: "192x192", purpose: "any maskable" },
      { src: "/logo512.png", type: "image/png", sizes: "512x512", purpose: "any maskable" }
    ]
  };

  const blob = new Blob([JSON.stringify(manifestData)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  document.getElementById("manifest-link").setAttribute("href", url);

  return () => URL.revokeObjectURL(url);
}, [schoolName]);
  // ── PIN ────────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (pin.length >= 4) {
      const match = staffList.find((s) => s.pin === pin);
      if (match) {
        setVerifying(true);
        setTimeout(() => {
          setTeacher(match);
          setVerifying(false);
          const firstClass = match.classes?.[0] || GRADES[0];
          setSelectedClass(firstClass);
          setTtClass(firstClass);
          setMbClass(firstClass);
          setHwForm((f) => ({ ...f, grade: firstClass }));
          setAnnForm((f) => ({ ...f, grade: firstClass }));
          setPermForm((f) => ({ ...f, grade: firstClass }));
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

  const myClasses = teacher?.classes || [];

  const classStudents = students
    .filter((s) => s.grade === selectedClass)
    .sort((a, b) => a.name.localeCompare(b.name));

  const mbStudents = students
    .filter((s) => s.grade === mbClass)
    .sort((a, b) => a.name.localeCompare(b.name));

  const allMyStudents = students
    .filter((s) => myClasses.includes(s.grade))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ── Init attendance map ────────────────────────────────────────────────────
  useEffect(() => {
    if (!classStudents.length) return;
    const today = new Date().toISOString().split("T")[0];
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

  // ── Init perm slip map ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activePermEvent) return;
    const evtStudents = students.filter(
      (s) => s.grade === activePermEvent.grade,
    );
    const map = {};
    evtStudents.forEach((s) => {
      map[s.id] = activePermEvent.slips?.[s.id] || "pending";
    });
    setPermSlipMap(map);
  }, [activePermEvent, students]);
useEffect(() => {
  if (!schoolName || schoolName === "School Portal") return; // or "School" for StaffPortal

  const manifestData = {
    short_name: schoolName,
    name: `${schoolName} | Solidflo`,
    start_url: window.location.href,
    scope: window.location.pathname,
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#1a6b4a",
    background_color: "#f8f7f4",
    icons: [
      { src: "/logo192.png", type: "image/png", sizes: "192x192", purpose: "any maskable" },
      { src: "/logo512.png", type: "image/png", sizes: "512x512", purpose: "any maskable" }
    ]
  };

  const blob = new Blob([JSON.stringify(manifestData)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.getElementById("manifest-link");
  if (link) {
    link.setAttribute("href", url);
  } else {
    console.warn("manifest-link tag not found in index.html — dynamic manifest not applied.");
  }

  return () => URL.revokeObjectURL(url);
}, [schoolName]);
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

 // REPLACE WITH:
const saveHomework = async () => {
  if (!hwForm.title || !hwForm.subject) {
    setHwError("Subject and description are required.");
    return;
  }
  setSavingHw(true);
  setHwError("");
  try {
    let attachmentUrl = hwForm.attachmentUrl || null;
    let attachmentName = hwForm.attachmentName || null;

    // ── If a file was selected, upload it first ──
    if (hwFile) {
      const result = await uploadToCloudflare(hwFile);
      attachmentUrl = result.publicUrl;
      attachmentName = hwFile.name;
    }

    const payload = {
      ...hwForm,
      attachmentUrl,
      attachmentName,
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
    setHwFile(null);                                 // ← clear file
    setHwSaved(true);
    setTimeout(() => setHwSaved(false), 3000);
  } catch (e) {
    console.error(e);
    setHwError(e.message || "Failed to save. Please try again.");
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

  // ── Save incident ──────────────────────────────────────────────────────────
  const saveIncident = async () => {
    if (!incForm.studentId) {
      setIncError("Please select a student.");
      return;
    }
    if (!incForm.description.trim()) {
      setIncError("Please describe the incident.");
      return;
    }
    setSavingInc(true);
    setIncError("");
    try {
      const student = students.find((s) => s.id === incForm.studentId);
      await addDoc(collection(db, "users", uid, "incidents"), {
        ...incForm,
        studentName: student?.name || "",
        grade: student?.grade || "",
        date: new Date().toISOString().split("T")[0],
        recordedBy: teacher.name,
        createdAt: serverTimestamp(),
      });
      setIncForm({
        studentId: "",
        type: INCIDENT_TYPES[0],
        severity: "low",
        description: "",
        actionTaken: "",
        parentNotified: false,
      });
      setIncSaved(true);
      setTimeout(() => setIncSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setIncError("Failed to save. Please try again.");
    } finally {
      setSavingInc(false);
    }
  };

  // ── Save announcement ──────────────────────────────────────────────────────
  const saveAnnouncement = async () => {
    if (!annForm.title.trim() || !annForm.body.trim()) {
      setAnnError("Title and message are required.");
      return;
    }
    setSavingAnn(true);
    setAnnError("");
    try {
      await addDoc(collection(db, "users", uid, "announcements"), {
        ...annForm,
        postedBy: teacher.name,
        createdAt: serverTimestamp(),
      });
      setAnnForm({
        grade: myClasses[0] || "",
        title: "",
        body: "",
        pinned: false,
      });
      setAnnSaved(true);
      setTimeout(() => setAnnSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setAnnError("Failed to post. Please try again.");
    } finally {
      setSavingAnn(false);
    }
  };

  // ── Save marks ─────────────────────────────────────────────────────────────
  const saveMarks = async () => {
    if (!mbSubject.trim() || !mbAssessment.trim()) {
      setMbError("Subject and assessment name are required.");
      return;
    }
    if (!mbStudents.length) {
      setMbError("No students in this class.");
      return;
    }
    setSavingMb(true);
    setMbError("");
    try {
      await addDoc(collection(db, "users", uid, "markbook"), {
        grade: mbClass,
        subject: mbSubject,
        assessment: mbAssessment,
        total: parseFloat(mbTotal) || 100,
        scores: mbScores,
        recordedBy: teacher.name,
        date: new Date().toISOString().split("T")[0],
        createdAt: serverTimestamp(),
      });
      setMbScores({});
      setMbAssessment("");
      setMbSaved(true);
      setTimeout(() => setMbSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setMbError("Failed to save. Please try again.");
    } finally {
      setSavingMb(false);
    }
  };

  // ── Create permission event ────────────────────────────────────────────────
  const createPermEvent = async () => {
    if (!permForm.eventName.trim()) {
      setPermError("Event name is required.");
      return;
    }
    setSavingPerm(true);
    setPermError("");
    try {
      const ref = await addDoc(
        collection(db, "users", uid, "permissionEvents"),
        {
          ...permForm,
          createdBy: teacher.name,
          createdAt: serverTimestamp(),
          slips: {},
        },
      );
      const newEvent = {
        id: ref.id,
        ...permForm,
        createdBy: teacher.name,
        slips: {},
      };
      setPermEvents((prev) => [...prev, newEvent]);
      setActivePermEvent(newEvent);
      setCreatingEvent(false);
      setPermSaved(true);
      setTimeout(() => setPermSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setPermError("Failed to create event.");
    } finally {
      setSavingPerm(false);
    }
  };

  // ── Save permission slip statuses ──────────────────────────────────────────
  const savePermSlips = async () => {
    if (!activePermEvent) return;
    setSavingPerm(true);
    try {
      await setDoc(
        doc(db, "users", uid, "permissionEvents", activePermEvent.id),
        { slips: permSlipMap },
        { merge: true },
      );
      setPermSaved(true);
      setTimeout(() => setPermSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPerm(false);
    }
  };

  // ── Save welfare flag ──────────────────────────────────────────────────────
  const saveWelfareFlag = async () => {
    if (!welfareForm.studentId) {
      setWelfareError("Please select a student.");
      return;
    }
    if (!welfareForm.notes.trim()) {
      setWelfareError("Please provide some details.");
      return;
    }
    setSavingWelfare(true);
    setWelfareError("");
    try {
      const student = students.find((s) => s.id === welfareForm.studentId);
      await addDoc(collection(db, "users", uid, "welfareFlags"), {
        ...welfareForm,
        studentName: welfareForm.anonymous ? "Anonymous" : student?.name || "",
        grade: student?.grade || "",
        flaggedBy: welfareForm.anonymous
          ? "Anonymous staff member"
          : teacher.name,
        date: new Date().toISOString().split("T")[0],
        status: "open",
        createdAt: serverTimestamp(),
      });
      setWelfareForm({
        studentId: "",
        category: WELFARE_CATEGORIES[0],
        urgency: "moderate",
        notes: "",
        anonymous: false,
      });
      setWelfareSaved(true);
      setTimeout(() => setWelfareSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setWelfareError("Failed to submit. Please try again.");
    } finally {
      setSavingWelfare(false);
    }
  };

  // ── Save resource request ──────────────────────────────────────────────────
  const saveResourceRequest = async () => {
    if (!resForm.item.trim()) {
      setResError("Please describe what you need.");
      return;
    }
    setSavingRes(true);
    setResError("");
    try {
      await addDoc(collection(db, "users", uid, "resourceRequests"), {
        ...resForm,
        requestedBy: teacher.name,
        date: new Date().toISOString().split("T")[0],
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setResForm({
        category: RESOURCE_CATEGORIES[0],
        item: "",
        quantity: "",
        urgency: "normal",
        notes: "",
      });
      setResSaved(true);
      setTimeout(() => setResSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setResError("Failed to submit. Please try again.");
    } finally {
      setSavingRes(false);
    }
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

  // ── PIN SCREEN ─────────────────────────────────────────────────────────────
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

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  const tabs = [
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "homework", label: "Homework", icon: BookOpen },
    { id: "behaviour", label: "Behaviour", icon: ShieldAlert },
    { id: "announcements", label: "Notices", icon: Megaphone },
    { id: "markbook", label: "Marks", icon: BarChart2 },
    { id: "permissions", label: "Slips", icon: ClipboardList },
    { id: "welfare", label: "Welfare", icon: Heart },
    { id: "resources", label: "Resources", icon: Package },
    { id: "timetable", label: "Timetable", icon: LayoutGrid },
    { id: "profile", label: "Profile", icon: User },
  ];

  const statusStyle = {
    present: { bg: "#ecfdf5", color: "#059669", border: "#6ee7b7" },
    absent: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
    late: { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
  };

  const priorityOpts = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "Urgent" },
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

      {/* TOP BAR */}
      <div
        style={{
          background: C.dark,
          paddingTop: "env(safe-area-inset-top,0px)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
        <div style={{ maxWidth: 900, margin: "0 auto", overflowX: "auto" }}>
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
                  padding: "12px 14px",
                  fontSize: 12,
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
                <Icon style={{ width: 13, height: 13 }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 80px" }}
      >
        {/* ══ ATTENDANCE ════════════════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Mark Attendance"
              subtitle={new Date().toLocaleDateString("en", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            />
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
                <SaveBtn
                  onClick={saveAttendance}
                  saving={savingAtt}
                  saved={attSaved}
                  label="Save Register"
                  savedLabel="Register Saved!"
                />
                {attSaved && (
                  <SuccessNote>
                    ✓ Attendance has been recorded and is visible to parents.
                  </SuccessNote>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ HOMEWORK ══════════════════════════════════════════════════════ */}
        {activeTab === "homework" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Set Homework"
              subtitle="Assign tasks to your class"
            />
            <Card>
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
                    {priorityOpts.map(({ value, label }) => (
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
                          border: `1.5px solid ${hwForm.priority === value ? (value === "low" ? "#059669" : value === "medium" ? "#b45309" : "#dc2626") : "#e2e8f0"}`,
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
              {/* REPLACE WITH: */}
<div style={{ marginTop: 14 }}>
  <Field label="Attach Document (optional)">
    <input
      ref={hwFileRef}
      type="file"
      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      style={{ display: "none" }}
      onChange={(e) => setHwFile(e.target.files?.[0] ?? null)}
    />
    <div
      onClick={() => hwFileRef.current?.click()}
      style={{
        border: `2px dashed ${hwFile ? C.green : C.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        textAlign: "center",
        cursor: "pointer",
        background: hwFile ? C.greenLight : "#f8fafc",
        transition: "all .15s",
      }}
    >
      {hwFile ? (
        <>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.green }}>
            ✓ {hwFile.name}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: C.textSoft }}>
            {(hwFile.size / 1024).toFixed(0)} KB — click to change
          </p>
        </>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.textMid }}>
            Click to upload PDF / document
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: C.textSoft }}>
            PDF, JPG, PNG, DOC supported
          </p>
        </>
      )}
    </div>
    {hwFile && (
      <button
        onClick={() => setHwFile(null)}
        style={{
          marginTop: 6,
          fontSize: 11,
          color: C.red,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        ✕ Remove file
      </button>
    )}
  </Field>
</div>
              {hwError && <ErrorNote>{hwError}</ErrorNote>}
              <SaveBtn
                onClick={saveHomework}
                saving={savingHw}
                saved={hwSaved}
                label="Assign Homework"
                savedLabel="Homework Saved!"
                icon={BookMarked}
                style={{ marginTop: 18 }}
              />
              {hwSaved && (
                <SuccessNote>
                  ✓ Homework is now visible to parents on the portal.
                </SuccessNote>
              )}
            </Card>
          </div>
        )}

        {/* ══ BEHAVIOUR LOG ════════════════════════════════════════════════ */}
        {activeTab === "behaviour" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Behaviour Log"
              subtitle="Record classroom incidents with a full paper trail"
            />
            <Card>
              {/* Severity selector */}
              <Field label="Severity *">
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  {INCIDENT_SEVERITY.map(({ value, label, color, bg }) => (
                    <button
                      key={value}
                      onClick={() =>
                        setIncForm((f) => ({ ...f, severity: value }))
                      }
                      style={{
                        flex: 1,
                        padding: "10px 6px",
                        borderRadius: 11,
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1.5px solid ${incForm.severity === value ? color : C.border}`,
                        background: incForm.severity === value ? bg : "#fff",
                        color: incForm.severity === value ? color : C.textSoft,
                        cursor: "pointer",
                        transition: "all .12s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginTop: 14,
                }}
              >
                <Field label="Student *">
                  <select
                    style={inputSt}
                    value={incForm.studentId}
                    onChange={(e) =>
                      setIncForm((f) => ({ ...f, studentId: e.target.value }))
                    }
                  >
                    <option value="">— Select student —</option>
                    {allMyStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Incident Type *">
                  <select
                    style={inputSt}
                    value={incForm.type}
                    onChange={(e) =>
                      setIncForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 14 }}>
                <Field label="Incident Description *">
                  <textarea
                    style={{
                      ...inputSt,
                      minHeight: 90,
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                    placeholder="Describe what happened, when, and who was involved…"
                    value={incForm.description}
                    onChange={(e) =>
                      setIncForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </Field>
              </div>

              <div style={{ marginTop: 14 }}>
                <Field label="Action Taken">
                  <textarea
                    style={{
                      ...inputSt,
                      minHeight: 70,
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                    placeholder="e.g. Verbal warning given, student moved seats, time out…"
                    value={incForm.actionTaken}
                    onChange={(e) =>
                      setIncForm((f) => ({ ...f, actionTaken: e.target.value }))
                    }
                  />
                </Field>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: C.amberLight,
                  borderRadius: 11,
                  border: `1px solid #fde68a`,
                }}
              >
                <input
                  type="checkbox"
                  id="parentNotified"
                  checked={incForm.parentNotified}
                  onChange={(e) =>
                    setIncForm((f) => ({
                      ...f,
                      parentNotified: e.target.checked,
                    }))
                  }
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: C.amber,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor="parentNotified"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#92400e",
                    cursor: "pointer",
                    lineHeight: 1.4,
                  }}
                >
                  Parent / Guardian has been notified about this incident
                </label>
              </div>

              {incError && <ErrorNote>{incError}</ErrorNote>}
              <SaveBtn
                onClick={saveIncident}
                saving={savingInc}
                saved={incSaved}
                label="Log Incident"
                savedLabel="Incident Logged!"
                icon={Flag}
                style={{ marginTop: 18 }}
              />
              {incSaved && (
                <SuccessNote>
                  ✓ Incident recorded. It is visible to school management.
                </SuccessNote>
              )}
            </Card>
          </div>
        )}

        {/* ══ ANNOUNCEMENTS ════════════════════════════════════════════════ */}
        {activeTab === "announcements" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Class Announcements"
              subtitle="Send notices directly to parents in your class"
            />
            <Card>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <Field label="Class / Grade *">
                  <select
                    style={inputSt}
                    value={annForm.grade}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, grade: e.target.value }))
                    }
                  >
                    {myClasses.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Title *">
                  <input
                    style={inputSt}
                    placeholder="e.g. Swimming on Friday"
                    value={annForm.title}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="Message *">
                <textarea
                  style={{
                    ...inputSt,
                    minHeight: 110,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                  placeholder="Write your notice here… Be clear about dates, items to bring, and any actions parents need to take."
                  value={annForm.body}
                  onChange={(e) =>
                    setAnnForm((f) => ({ ...f, body: e.target.value }))
                  }
                />
              </Field>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: C.brandLight,
                  borderRadius: 11,
                  border: `1px solid #bfdbfe`,
                }}
              >
                <input
                  type="checkbox"
                  id="pinned"
                  checked={annForm.pinned}
                  onChange={(e) =>
                    setAnnForm((f) => ({ ...f, pinned: e.target.checked }))
                  }
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: C.brand,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor="pinned"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.brandMid,
                    cursor: "pointer",
                    lineHeight: 1.4,
                  }}
                >
                  Pin this notice — keeps it at the top of the parent portal
                </label>
              </div>

              {/* Preview */}
              {(annForm.title || annForm.body) && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 16px",
                    background: "#f8fafc",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.textSoft,
                      letterSpacing: ".05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Preview
                  </p>
                  {annForm.title && (
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      {annForm.title}
                    </p>
                  )}
                  {annForm.body && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: C.textMid,
                        lineHeight: 1.6,
                      }}
                    >
                      {annForm.body}
                    </p>
                  )}
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 11,
                      color: C.textSoft,
                    }}
                  >
                    — {teacher.name} · {annForm.grade}
                  </p>
                </div>
              )}

              {annError && <ErrorNote>{annError}</ErrorNote>}
              <SaveBtn
                onClick={saveAnnouncement}
                saving={savingAnn}
                saved={annSaved}
                label="Post Notice"
                savedLabel="Notice Posted!"
                icon={Send}
                style={{ marginTop: 18 }}
              />
              {annSaved && (
                <SuccessNote>
                  ✓ Notice is live and visible to parents in{" "}
                  {annForm.grade || "your class"}.
                </SuccessNote>
              )}
            </Card>
          </div>
        )}

        {/* ══ MARK BOOK ════════════════════════════════════════════════════ */}
        {activeTab === "markbook" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Quick Mark Book"
              subtitle="Enter assessment scores for your class"
            />

            <ClassPicker
              classes={myClasses}
              selected={mbClass}
              onChange={(cls) => {
                setMbClass(cls);
                setMbScores({});
              }}
            />

            <Card style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 80px",
                  gap: 14,
                }}
              >
                <Field label="Subject *">
                  <input
                    style={inputSt}
                    placeholder="e.g. English"
                    value={mbSubject}
                    onChange={(e) => setMbSubject(e.target.value)}
                  />
                </Field>
                <Field label="Assessment Name *">
                  <input
                    style={inputSt}
                    placeholder="e.g. Term 1 Test"
                    value={mbAssessment}
                    onChange={(e) => setMbAssessment(e.target.value)}
                  />
                </Field>
                <Field label="Out of">
                  <input
                    style={inputSt}
                    type="number"
                    min="1"
                    max="1000"
                    value={mbTotal}
                    onChange={(e) => setMbTotal(e.target.value)}
                  />
                </Field>
              </div>
            </Card>

            {mbStudents.length === 0 ? (
              <Empty
                icon={BarChart2}
                title="No students"
                message="No students found in this class."
              />
            ) : (
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
                {/* Average banner */}
                {Object.keys(mbScores).length > 0 &&
                  (() => {
                    const vals = Object.values(mbScores)
                      .filter((v) => v !== "" && !isNaN(v))
                      .map(Number);
                    const avg = vals.length
                      ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(
                          1,
                        )
                      : null;
                    const pct =
                      avg && mbTotal
                        ? ((avg / parseFloat(mbTotal)) * 100).toFixed(0)
                        : null;
                    return avg ? (
                      <div
                        style={{
                          padding: "10px 16px",
                          background: C.brandLight,
                          borderBottom: `1px solid #bfdbfe`,
                          display: "flex",
                          gap: 16,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.brandMid,
                          }}
                        >
                          Class avg: {avg}/{mbTotal}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: pct >= 50 ? C.green : C.red,
                          }}
                        >
                          {pct}%
                        </span>
                        <span style={{ fontSize: 12, color: C.textSoft }}>
                          {vals.length} entered
                        </span>
                      </div>
                    ) : null;
                  })()}

                {mbStudents.map((s, i) => {
                  const score = mbScores[s.id] ?? "";
                  const pct =
                    score !== "" && mbTotal
                      ? (parseFloat(score) / parseFloat(mbTotal)) * 100
                      : null;
                  const scoreColor =
                    pct === null
                      ? C.textSoft
                      : pct >= 75
                        ? C.green
                        : pct >= 50
                          ? C.amber
                          : C.red;
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 16px",
                        borderBottom:
                          i < mbStudents.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: `hsl(${s.id.charCodeAt?.(0) * 37 || 120},60%,88%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
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
                          fontSize: 13,
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
                      {pct !== null && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: scoreColor,
                            minWidth: 36,
                            textAlign: "right",
                          }}
                        >
                          {pct.toFixed(0)}%
                        </span>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          flexShrink: 0,
                        }}
                      >
                        <input
                          type="number"
                          min="0"
                          max={mbTotal}
                          placeholder="—"
                          style={{
                            ...inputSt,
                            width: 70,
                            textAlign: "center",
                            padding: "7px 8px",
                            borderColor:
                              pct !== null
                                ? pct >= 75
                                  ? "#6ee7b7"
                                  : pct >= 50
                                    ? "#fcd34d"
                                    : "#fca5a5"
                                : C.border,
                          }}
                          value={score}
                          onChange={(e) =>
                            setMbScores((m) => ({
                              ...m,
                              [s.id]: e.target.value,
                            }))
                          }
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: C.textSoft,
                            minWidth: 28,
                          }}
                        >
                          /{mbTotal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {mbError && <ErrorNote>{mbError}</ErrorNote>}
            <SaveBtn
              onClick={saveMarks}
              saving={savingMb}
              saved={mbSaved}
              label="Save Marks"
              savedLabel="Marks Saved!"
              icon={BarChart2}
            />
            {mbSaved && (
              <SuccessNote>
                ✓ Assessment results saved to the mark book.
              </SuccessNote>
            )}
          </div>
        )}

        {/* ══ PERMISSION SLIPS ═════════════════════════════════════════════ */}
        {activeTab === "permissions" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Permission Slips"
              subtitle="Track signed consent for outings and events"
            />

            {/* Event list or create */}
            {!activePermEvent && !creatingEvent && (
              <div>
                {permEvents.filter((e) => myClasses.includes(e.grade))
                  .length === 0 ? (
                  <Empty
                    icon={ClipboardList}
                    title="No events yet"
                    message="Create your first permission slip event below."
                  />
                ) : (
                  <div style={{ marginBottom: 14 }}>
                    {permEvents
                      .filter((e) => myClasses.includes(e.grade))
                      .map((evt) => {
                        const evtStudents = students.filter(
                          (s) => s.grade === evt.grade,
                        );
                        const returned = Object.values(evt.slips || {}).filter(
                          (v) => v === "returned",
                        ).length;
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setActivePermEvent(evt)}
                            style={{
                              background: C.surface,
                              borderRadius: C.radius,
                              border: `1px solid ${C.border}`,
                              padding: "14px 16px",
                              marginBottom: 10,
                              boxShadow: C.shadow,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              transition: "box-shadow .15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.boxShadow = C.shadowMd)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.boxShadow = C.shadow)
                            }
                          >
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 13,
                                background: C.tealLight,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <ClipboardList
                                style={{ width: 20, height: 20, color: C.teal }}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: C.text,
                                }}
                              >
                                {evt.eventName}
                              </p>
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontSize: 12,
                                  color: C.textSoft,
                                }}
                              >
                                {evt.grade} · {evt.eventDate || "No date set"}
                              </p>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 16,
                                  fontWeight: 800,
                                  color:
                                    returned === evtStudents.length &&
                                    evtStudents.length > 0
                                      ? C.green
                                      : C.text,
                                }}
                              >
                                {returned}/{evtStudents.length}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  color: C.textSoft,
                                  fontWeight: 600,
                                }}
                              >
                                RETURNED
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
                <button
                  onClick={() => setCreatingEvent(true)}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 13,
                    background: C.dark,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Plus style={{ width: 16, height: 16 }} /> Create New Event
                </button>
              </div>
            )}

            {/* Create event form */}
            {creatingEvent && (
              <Card>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.text,
                    }}
                  >
                    New Event
                  </p>
                  <button
                    onClick={() => setCreatingEvent(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: C.textSoft,
                    }}
                  >
                    <X style={{ width: 18, height: 18 }} />
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <Field label="Event Name *">
                    <input
                      style={inputSt}
                      placeholder="e.g. Zoo Outing"
                      value={permForm.eventName}
                      onChange={(e) =>
                        setPermForm((f) => ({
                          ...f,
                          eventName: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Grade *">
                    <select
                      style={inputSt}
                      value={permForm.grade}
                      onChange={(e) =>
                        setPermForm((f) => ({ ...f, grade: e.target.value }))
                      }
                    >
                      {myClasses.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <Field label="Event Date">
                    <input
                      type="date"
                      style={inputSt}
                      value={permForm.eventDate}
                      onChange={(e) =>
                        setPermForm((f) => ({
                          ...f,
                          eventDate: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Description">
                    <input
                      style={inputSt}
                      placeholder="Brief description…"
                      value={permForm.description}
                      onChange={(e) =>
                        setPermForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                {permError && <ErrorNote>{permError}</ErrorNote>}
                <SaveBtn
                  onClick={createPermEvent}
                  saving={savingPerm}
                  saved={false}
                  label="Create Event"
                  savedLabel="Created!"
                  icon={Plus}
                />
              </Card>
            )}

            {/* Manage slip statuses for an event */}
            {activePermEvent && (
              <div>
                <button
                  onClick={() => setActivePermEvent(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    borderRadius: 10,
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    color: C.textMid,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: 14,
                  }}
                >
                  ← Back to events
                </button>
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
                  <div
                    style={{
                      padding: "14px 16px",
                      borderBottom: `1px solid ${C.border}`,
                      background: "#f8fafc",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 800,
                        color: C.text,
                      }}
                    >
                      {activePermEvent.eventName}
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 12,
                        color: C.textSoft,
                      }}
                    >
                      {activePermEvent.grade} · {activePermEvent.eventDate}
                    </p>
                  </div>
                  {students
                    .filter((s) => s.grade === activePermEvent.grade)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((s, i, arr) => {
                      const status = permSlipMap[s.id] || "pending";
                      return (
                        <div
                          key={s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            borderBottom:
                              i < arr.length - 1
                                ? `1px solid ${C.border}`
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              background: `hsl(${s.id.charCodeAt?.(0) * 37 || 120},60%,88%)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
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
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            {s.name}
                          </p>
                          <div
                            style={{ display: "flex", gap: 6, flexShrink: 0 }}
                          >
                            {[
                              {
                                v: "returned",
                                label: "✓ Returned",
                                color: C.green,
                                bg: C.greenLight,
                                border: "#6ee7b7",
                              },
                              {
                                v: "pending",
                                label: "Pending",
                                color: C.amber,
                                bg: C.amberLight,
                                border: "#fcd34d",
                              },
                              {
                                v: "absent",
                                label: "Missing",
                                color: C.red,
                                bg: C.redLight,
                                border: "#fca5a5",
                              },
                            ].map(({ v, label, color, bg, border }) => {
                              const active = status === v;
                              return (
                                <button
                                  key={v}
                                  onClick={() =>
                                    setPermSlipMap((m) => ({ ...m, [s.id]: v }))
                                  }
                                  style={{
                                    padding: "5px 10px",
                                    borderRadius: 9,
                                    border: `1.5px solid ${active ? border : C.border}`,
                                    background: active ? bg : "#fff",
                                    color: active ? color : C.textSoft,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "all .12s",
                                  }}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <SaveBtn
                  onClick={savePermSlips}
                  saving={savingPerm}
                  saved={permSaved}
                  label="Save Slip Status"
                  savedLabel="Saved!"
                />
                {permSaved && (
                  <SuccessNote>✓ Permission slip tracker updated.</SuccessNote>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ WELFARE FLAGS ════════════════════════════════════════════════ */}
        {activeTab === "welfare" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Student Welfare Flag"
              subtitle="Discreetly report a concern to the school counsellor or management"
            />

            {/* Sensitive notice */}
            <div
              style={{
                padding: "14px 16px",
                background: C.pinkLight,
                borderRadius: 12,
                border: `1px solid #fbcfe8`,
                marginBottom: 16,
                display: "flex",
                gap: 12,
              }}
            >
              <Heart
                style={{
                  width: 18,
                  height: 18,
                  color: C.pink,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#9d174d",
                  }}
                >
                  Confidential &amp; Sensitive
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "#be185d",
                    lineHeight: 1.6,
                  }}
                >
                  This report goes directly to the school principal/counsellor.
                  It is not visible to other staff or parents. Use this for
                  safeguarding concerns that require follow-up.
                </p>
              </div>
            </div>

            <Card>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <Field label="Student *">
                  <select
                    style={inputSt}
                    value={welfareForm.studentId}
                    onChange={(e) =>
                      setWelfareForm((f) => ({
                        ...f,
                        studentId: e.target.value,
                      }))
                    }
                  >
                    <option value="">— Select student —</option>
                    {allMyStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Category *">
                  <select
                    style={inputSt}
                    value={welfareForm.category}
                    onChange={(e) =>
                      setWelfareForm((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                  >
                    {WELFARE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Urgency *">
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  {[
                    {
                      v: "low",
                      label: "Monitor",
                      color: C.green,
                      bg: C.greenLight,
                    },
                    {
                      v: "moderate",
                      label: "Urgent",
                      color: C.amber,
                      bg: C.amberLight,
                    },
                    {
                      v: "high",
                      label: "Immediate",
                      color: C.red,
                      bg: C.redLight,
                    },
                  ].map(({ v, label, color, bg }) => (
                    <button
                      key={v}
                      onClick={() =>
                        setWelfareForm((f) => ({ ...f, urgency: v }))
                      }
                      style={{
                        flex: 1,
                        padding: "10px 6px",
                        borderRadius: 11,
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1.5px solid ${welfareForm.urgency === v ? color : C.border}`,
                        background: welfareForm.urgency === v ? bg : "#fff",
                        color: welfareForm.urgency === v ? color : C.textSoft,
                        cursor: "pointer",
                        transition: "all .12s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <div style={{ marginTop: 14 }}>
                <Field label="Details / Observations *">
                  <textarea
                    style={{
                      ...inputSt,
                      minHeight: 100,
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                    placeholder="Describe what you observed, what the student said, any physical signs, or changes in behaviour. Be as specific as possible."
                    value={welfareForm.notes}
                    onChange={(e) =>
                      setWelfareForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                </Field>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: "#f8fafc",
                  borderRadius: 11,
                  border: `1px solid ${C.border}`,
                }}
              >
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={welfareForm.anonymous}
                  onChange={(e) =>
                    setWelfareForm((f) => ({
                      ...f,
                      anonymous: e.target.checked,
                    }))
                  }
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: C.pink,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor="anonymous"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.textMid,
                    cursor: "pointer",
                    lineHeight: 1.4,
                  }}
                >
                  Submit anonymously — your name will not be shown to management
                </label>
              </div>

              {welfareError && <ErrorNote>{welfareError}</ErrorNote>}
              <SaveBtn
                onClick={saveWelfareFlag}
                saving={savingWelfare}
                saved={welfareSaved}
                label="Submit Welfare Flag"
                savedLabel="Flag Submitted"
                icon={Heart}
                style={{ marginTop: 18 }}
              />
              {welfareSaved && (
                <SuccessNote>
                  ✓ Your concern has been submitted confidentially to
                  management.
                </SuccessNote>
              )}
            </Card>
          </div>
        )}

        {/* ══ RESOURCES ════════════════════════════════════════════════════ */}
        {activeTab === "resources" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <TabHeader
              title="Resource Requests"
              subtitle="Request supplies or report maintenance issues to admin"
            />
            <Card>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <Field label="Category *">
                  <select
                    style={inputSt}
                    value={resForm.category}
                    onChange={(e) =>
                      setResForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    {RESOURCE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Urgency">
                  <select
                    style={inputSt}
                    value={resForm.urgency}
                    onChange={(e) =>
                      setResForm((f) => ({ ...f, urgency: e.target.value }))
                    }
                  >
                    <option value="low">Low — when possible</option>
                    <option value="normal">Normal — this week</option>
                    <option value="urgent">Urgent — today</option>
                  </select>
                </Field>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <Field label="What do you need? *">
                  <input
                    style={inputSt}
                    placeholder="e.g. A4 paper, whiteboard markers, projector bulb…"
                    value={resForm.item}
                    onChange={(e) =>
                      setResForm((f) => ({ ...f, item: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Quantity">
                  <input
                    style={inputSt}
                    placeholder="e.g. 2 reams"
                    value={resForm.quantity}
                    onChange={(e) =>
                      setResForm((f) => ({ ...f, quantity: e.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="Additional Notes">
                <textarea
                  style={{
                    ...inputSt,
                    minHeight: 80,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                  placeholder="Any extra context — room number, urgency reason, preferred brand, etc."
                  value={resForm.notes}
                  onChange={(e) =>
                    setResForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </Field>

              {/* Urgency visual */}
              {resForm.urgency === "urgent" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: C.redLight,
                    borderRadius: 10,
                    border: `1px solid #fecaca`,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <AlertTriangle
                    style={{
                      width: 15,
                      height: 15,
                      color: C.red,
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.red,
                    }}
                  >
                    Urgent requests are escalated immediately to the admin team.
                  </p>
                </div>
              )}

              {resError && <ErrorNote>{resError}</ErrorNote>}
              <SaveBtn
                onClick={saveResourceRequest}
                saving={savingRes}
                saved={resSaved}
                label="Submit Request"
                savedLabel="Request Sent!"
                icon={Package}
                style={{ marginTop: 18 }}
              />
              {resSaved && (
                <SuccessNote>
                  ✓ Your request has been sent to the admin team.
                </SuccessNote>
              )}
            </Card>
          </div>
        )}

        {/* ══ TIMETABLE ════════════════════════════════════════════════════ */}
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
            <SaveBtn
              onClick={saveTimetable}
              saving={savingTt}
              saved={ttSaved}
              label="Save Timetable"
              savedLabel="Timetable Saved!"
            />
            {ttSaved && (
              <SuccessNote>
                ✓ Timetable updated and visible to parents.
              </SuccessNote>
            )}
          </div>
        )}

        {/* ══ PROFILE ══════════════════════════════════════════════════════ */}
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

// ── Shared components ─────────────────────────────────────────────────────────
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

function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: C.radius,
        border: `1px solid ${C.border}`,
        padding: 20,
        boxShadow: C.shadow,
        ...style,
      }}
    >
      {children}
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

function SaveBtn({
  onClick,
  saving,
  saved,
  label,
  savedLabel,
  icon: Icon,
  style: extraStyle,
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving || saved}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: 13,
        background: saved ? C.green : C.brand,
        color: "#fff",
        fontSize: 15,
        fontWeight: 700,
        border: "none",
        cursor: saving || saved ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "background .2s",
        ...extraStyle,
      }}
    >
      {saved ? (
        <>
          <Check style={{ width: 18, height: 18 }} /> {savedLabel}
        </>
      ) : saving ? (
        "Saving…"
      ) : (
        <>
          {Icon && <Icon style={{ width: 16, height: 16 }} />} {label}
        </>
      )}
    </button>
  );
}

function SuccessNote({ children }) {
  return (
    <p
      style={{
        fontSize: 12,
        color: C.green,
        textAlign: "center",
        marginTop: 8,
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  );
}

function ErrorNote({ children }) {
  return (
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
      <p style={{ margin: 0, fontSize: 12, color: C.red, fontWeight: 500 }}>
        {children}
      </p>
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
