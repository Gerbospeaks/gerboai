import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import logo from "../../assets/img/solidflo-logo.png";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import StampOverlay, { AllPagesStampOverlay } from "../StampOverlay";
import AIInvoiceWindow from "../AIInvoiceWindow";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useFeesFirebase } from "../../hooks/useFeesFirebase";
import EducationSidebar from "./EducationSidebar";
import AttendanceTrends from "./AttendanceTrends";
import DocumentsVault from "./DocumentsVault";
import { MedicalAlert } from "./StudentMedicalSection";
import Assessment from "./Assessment";
import Curriculum from "./Curriculum";
import LibraryView from "./LibraryView";
import {
  BehaviourLogView,
  MarkBookView,
  PermissionSlipView,
  WelfareFlagsView,
  ResourceRequestsView,
} from "./StaffDataViews";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Printer, Download } from "lucide-react";
import { db } from "../../firebase";
import StudentsListModal from "./StudentsListModal";
import SignatureStamp from "../SignatureStamp";
import SchoolOverview from "./SchoolOverview";
import Reports from "./Reports";
import {
  useNotices,
  useHomework,
  useAttendance,
  useEvents,
  useStaff,
  useFees,
  useTimetable,
  seedMockData,
} from "./firebaseEducation";
import {
  NoticeModal,
  HomeworkModal,
  AttendanceModal,
  EventModal,
  StaffModal,
  StudentModal,
  TimetableModal,
} from "./Educationmodals";
import FeesViewFirebase from "./FeesViewFirebase";
import {
  Home,
  Settings,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Award,
  BarChart3,
  ShieldAlert,
  BarChart2,
  Package,
  Menu,
  Plus,
  Send,
  Save,
  X,
  Library,
  Edit,
  Sparkles,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  UserCheck,
  Eye,
  GraduationCap,
  Bell,
  DollarSign,
  Clock,
  CheckSquare,
  AlertCircle,
  MessageSquare,
  Star,
  Activity,
  Coffee,
  Sun,
  Sunset,
  BookMarked,
  Megaphone,
  CreditCard,
  School,
  Baby,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Hash,
  Smile,
  ChevronUp,
  ArrowRight,
  Check,
  Trash2,
  PenLine,
  Image,
  Paperclip,
  RefreshCw,
  Target,
  Zap,
  Heart,
  Shield,
  Music,
  Palette,
  Calculator,
  Globe,
  FlaskConical,
  Dumbbell,
  TreePine,
  Blocks,
} from "lucide-react";

// ─── MOCK DATA (seed only — real data comes from Firebase) ────────────────────
const MOCK_STUDENTS = [
  {
    id: "mock1",
    name: "Amara Dlamini",
    grade: "Grade 2",
    age: 7,
    parent: "Nomvula Dlamini",
    phone: "071 234 5678",
    email: "nomvula@email.com",
    fees: { paid: 1200, total: 1500, status: "partial" },
    photo: null,
  },
];

const MOCK_STAFF = [
  {
    id: "smock1",
    name: "Mrs. Sarah Johnson",
    role: "Grade 1 Teacher",
    subject: "Foundation Phase",
    phone: "082 111 2222",
    email: "sarah@school.com",
    status: "present",
    classes: ["Grade 1", "Grade 2"],
  },
];

const MOCK_EVENTS = [
  {
    id: "emock1",
    title: "Sports Day",
    date: "2026-03-15",
    time: "08:00",
    type: "event",
    color: "emerald",
    description: "Annual inter-house sports competition",
  },
];

const MOCK_TIMETABLE = {
  "Grade R": {
    Monday: [
      "Circle Time",
      "Phonics",
      "Snack",
      "Art & Craft",
      "Free Play",
      "Story Time",
    ],
    Tuesday: [
      "Circle Time",
      "Numbers",
      "Snack",
      "Music",
      "Free Play",
      "Story Time",
    ],
    Wednesday: [
      "Circle Time",
      "Phonics",
      "Snack",
      "PE/Movement",
      "Free Play",
      "Story Time",
    ],
    Thursday: [
      "Circle Time",
      "Numbers",
      "Snack",
      "Art & Craft",
      "Free Play",
      "Story Time",
    ],
    Friday: [
      "Circle Time",
      "Show & Tell",
      "Snack",
      "Music",
      "Free Play",
      "Goodbye Circle",
    ],
  },
  "Grade 1": {
    Monday: [
      "English",
      "Maths",
      "Break",
      "Life Skills",
      "Afrikaans",
      "Reading",
    ],
    Tuesday: ["Maths", "English", "Break", "Natural Science", "Art", "Phonics"],
    Wednesday: ["English", "Maths", "Break", "PE", "Afrikaans", "Library"],
    Thursday: [
      "Maths",
      "Life Skills",
      "Break",
      "English",
      "Natural Science",
      "Reading",
    ],
    Friday: ["English", "Maths", "Break", "Music", "Show & Tell", "Pack Up"],
  },
  "Grade 2": {
    Monday: [
      "English",
      "Maths",
      "Break",
      "Life Skills",
      "Afrikaans",
      "Reading",
    ],
    Tuesday: [
      "Maths",
      "English",
      "Break",
      "Natural Science",
      "Art",
      "Social Studies",
    ],
    Wednesday: ["English", "Maths", "Break", "PE", "Afrikaans", "Library"],
    Thursday: [
      "Maths",
      "Social Studies",
      "Break",
      "English",
      "Natural Science",
      "Reading",
    ],
    Friday: [
      "English",
      "Maths",
      "Break",
      "Music",
      "Creative Writing",
      "Pack Up",
    ],
  },
  "Grade 3": {
    Monday: [
      "English",
      "Maths",
      "Break",
      "Life Skills",
      "Afrikaans",
      "Reading",
    ],
    Tuesday: [
      "Maths",
      "English",
      "Break",
      "Natural Science",
      "Technology",
      "Social Studies",
    ],
    Wednesday: ["English", "Maths", "Break", "PE", "Afrikaans", "Library"],
    Thursday: [
      "Maths",
      "Social Studies",
      "Break",
      "English",
      "Natural Science",
      "Reading",
    ],
    Friday: [
      "English",
      "Maths",
      "Break",
      "Music",
      "Creative Project",
      "Pack Up",
    ],
  },
};

const MOCK_HOMEWORK = [
  {
    id: "hw1",
    subject: "Maths",
    grade: "Grade 2",
    title: "Addition worksheet pg 14",
    dueDate: "2026-03-07",
    assignedBy: "Mr. Nkosi",
    priority: "medium",
  },
  {
    id: "hw2",
    subject: "English",
    grade: "Grade 1",
    title: "Read pages 10-12 of reader",
    dueDate: "2026-03-07",
    assignedBy: "Mrs. Johnson",
    priority: "low",
  },
  {
    id: "hw3",
    subject: "Natural Science",
    grade: "Grade 3",
    title: "Draw the life cycle of a frog",
    dueDate: "2026-03-10",
    assignedBy: "Mrs. Olivier",
    priority: "high",
  },
];

const MOCK_NOTICES = [
  {
    id: "n1",
    title: "School closed on Friday 21 March",
    type: "important",
    date: "2026-03-06",
    recipient: "All Parents",
    message:
      "Please note that school will be closed on Human Rights Day, Friday 21 March 2026.",
    read: false,
  },
  {
    id: "n2",
    title: "Sports Day permission slip",
    type: "action",
    date: "2026-03-05",
    recipient: "All Parents",
    message:
      "Please return the attached permission slip and R50 participation fee by Wednesday 12 March.",
    read: false,
  },
  {
    id: "n3",
    title: "Reminder: Fee payment due",
    type: "fee",
    date: "2026-03-04",
    recipient: "Selected Parents",
    message:
      "This is a friendly reminder that Term 1 school fees are due by 7 March 2026.",
    read: true,
  },
];

const TIME_SLOTS = ["08:00", "09:00", "10:00", "10:30", "11:30", "12:30"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CLASSES = ["Grade R", "Grade 0", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];

const SUBJECT_ICONS = {
  Maths: Calculator,
  English: BookOpen,
  Afrikaans: Globe,
  Art: Palette,
  Music: Music,
  PE: Dumbbell,
  "Natural Science": FlaskConical,
  "PE/Movement": Dumbbell,
  Phonics: BookMarked,
  Numbers: Calculator,
  "Circle Time": Smile,
  "Story Time": BookOpen,
  "Life Skills": Heart,
  "Social Studies": Globe,
  Technology: Zap,
  "Free Play": Blocks,
  Library: BookMarked,
  "Show & Tell": Megaphone,
  Reading: BookOpen,
  Snack: Coffee,
  "Art & Craft": Palette,
  "Creative Writing": PenLine,
  "Creative Project": Star,
  Break: Coffee,
  "Pack Up": CheckSquare,
  "Goodbye Circle": Heart,
  "Foundation Phase": School,
};

// ─── HELPER ───────────────────────────────────────────────────────────────────
const generateReportCardNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const term = Math.ceil((new Date().getMonth() + 1) / 3);
  const reportsRef = collection(db, "users", userId, "reports");
  const q = query(reportsRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 0;
  if (!snapshot.empty) {
    const match = snapshot.docs[0].data().reportNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `RC-${year}-T${term}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const VIEW_TO_DOC_TYPE = {
  invoice: "invoice",
  quote: "estimate",
  estimate: "estimate",
  jobcard: "estimate",
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
const EducationDashboard = () => {
  const { user, authUser } = useAuth();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [documentType, setDocumentType] = useState("reports");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Grade 1");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState("invoice");

  const todayISO = new Date().toISOString().split("T")[0];
  const today = new Date();
  const dayName = today.toLocaleDateString("en-ZA", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── Firebase hooks (real data) ───────────────────────────────────────────────
  const { notices, setNotices, saveNotice, markNoticeRead, deleteNotice } =
    useNotices(user?.uid);
  const { homework, setHomework, saveHomework, deleteHomework } = useHomework(
    user?.uid,
  );
  const { attendance, setAttendance, saveAttendance, saveAllAttendance } =
    useAttendance(user?.uid, todayISO);
  const { events, saveEvent, deleteEvent } = useEvents(user?.uid);
  const { staff, updateStaff, saveStaff, deleteStaff } = useStaff(user?.uid);
  const { timetable, saveTimetable } = useTimetable(user?.uid);
  const {
    students: feeStudents,
    totalFees,
    collectedFees,
    recordPayment,
    getStudentPayments,
  } = useFeesFirebase(user?.uid);

  // ── Students: real Firebase with live listener ───────────────────────────────
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [showStampModal, setShowStampModal] = useState(false);
const [stampConfig, setStampConfig] = useState(null);
  useEffect(() => {
    if (!user?.uid) return;
    setStudentsLoading(true);
    const q = query(
      collection(db, "users", user.uid, "students"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setStudentsLoading(false);
      },
      () => setStudentsLoading(false),
    );
    return unsub;
  }, [user?.uid]);

  // ── Report cards ────────────────────────────────────────────────────────────
  const [reportId, setReportId] = useState(null);
  const [reportNumber, setReportNumber] = useState("");
  const [savedReports, setSavedReports] = useState([]);
  const [showReportsList, setShowReportsList] = useState(false);
  const [studentName, setStudentName] = useState("John Smith");
  const [studentId, setStudentId] = useState("STU-2026-001");
  const [gradeLevel, setGradeLevel] = useState("Grade 3");
  const [dateOfBirth, setDateOfBirth] = useState("2015-03-15");
  const [parentName, setParentName] = useState("Mary Smith");
  const [parentEmail, setParentEmail] = useState("mary.smith@email.com");
  const [parentPhone, setParentPhone] = useState("082 123 4567");
  const [parentAddress, setParentAddress] = useState(
    "123 Main Street, Johannesburg, 2001",
  );
  const [term, setTerm] = useState("Term 1");
  const [academicYear, setAcademicYear] = useState("2026");
  const [teacherComments, setTeacherComments] = useState(
    "John is a hardworking student.",
  );
  const [attendanceDays, setAttendanceDays] = useState("65");
  const [attendancePresent, setAttendancePresent] = useState("63");
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    name: "",
    mark: "",
    comments: "",
  });
  const [inputMode, setInputMode] = useState("manual");

  // ── Modals ───────────────────────────────────────────────────────────────────
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showStudentsListModal, setShowStudentsListModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  // ── Forms ────────────────────────────────────────────────────────────────────
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    message: "",
    recipient: "All Parents",
    type: "info",
  });
  const [newHomework, setNewHomework] = useState({
    subject: "",
    grade: "Grade 1",
    title: "",
    dueDate: "",
    priority: "medium",
  });

  // ── Business info ────────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SUNSHINE PRIMARY SCHOOL",
    addressLine1: "45 EDUCATION AVENUE",
    city: "JOHANNESBURG",
    postalCode: "2196",
    primaryPhone: "011 234 5678",
    logoUrl: "",
    principalName: "Mrs. Zoey Mor",
  });

  // ── Derived counts ───────────────────────────────────────────────────────────
  const presentCount = useMemo(
    () => Object.values(attendance).filter((v) => v === "present").length,
    [attendance],
  );
  const absentCount = useMemo(
    () => Object.values(attendance).filter((v) => v === "absent").length,
    [attendance],
  );
  const lateCount = useMemo(
    () => Object.values(attendance).filter((v) => v === "late").length,
    [attendance],
  );
  const unreadNotices = useMemo(
    () => notices.filter((n) => !n.read).length,
    [notices],
  );
const bottomNavItems = [
  { id: "home",       icon: Home,        label: "Home"       },
  { id: "students",   icon: Baby,        label: "Students"   },
  { id: "attendance", icon: UserCheck,   label: "Attendance" },
  { id: "fees",       icon: CreditCard,  label: "Fees"       },
  { id: "notices",    icon: Megaphone,   label: "Notices"    },
];
  // ── Effects ──────────────────────────────────────────────────────────────────

  // Seed mock data once for new education users
  useEffect(() => {
    const seedIfNew = async () => {
      if (!user?.uid) return;
      const userDocRef = doc(db, "users", user.uid);
      const snap = await getDoc(userDocRef);
      const data = snap.data();
      if (data?.dashboardType === "education" && !data?.seeded) {
        await seedMockData(
          user.uid,
          MOCK_STUDENTS,
          MOCK_STAFF,
          MOCK_EVENTS,
          MOCK_HOMEWORK,
          MOCK_NOTICES,
          MOCK_TIMETABLE,
        );
        await setDoc(userDocRef, { seeded: true }, { merge: true });
      }
    };
    seedIfNew();
  }, [user?.uid]);

  // Load school/business info
  useEffect(() => {
    const loadSchoolInfo = async () => {
      if (!user?.uid) return;
      const bizSnap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      const userSnap = await getDoc(doc(db, "users", user.uid));
      setBusinessInfo({
        ...bizSnap.data(),
        name: bizSnap.data()?.businessName || "",
        tagline: bizSnap.data()?.tagline || "Learning Centre",
        logoUrl: bizSnap.data()?.logoUrl || "",
        portalSlug: userSnap.data()?.portalSlug || null,
      });
    };
    loadSchoolInfo();
  }, [user?.uid]);

  // Close sidebar on small screens
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  // Students
  const handleAddNewStudent = () => {
    setSelectedStudent(null);
    setShowStudentModal(true);
  };
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const saveStudent = async (studentData) => {
    if (!user?.uid) return;
    if (selectedStudent?.id) {
      await updateDoc(
        doc(db, "users", user.uid, "students", selectedStudent.id),
        {
          ...studentData,
          updatedAt: serverTimestamp(),
        },
      );
    } else {
      await addDoc(collection(db, "users", user.uid, "students"), {
        ...studentData,
        createdAt: serverTimestamp(),
      });
    }
    // onSnapshot listener auto-refreshes students
  };

  const handleDeleteStudent = async (studentId) => {
    if (!user?.uid) return;
    if (!window.confirm("Delete this student? This cannot be undone.")) return;
    await deleteDoc(doc(db, "users", user.uid, "students", studentId));
  };

  // Staff (real Firebase)
  const handleStaffStatusToggle = (id, status) => updateStaff(id, { status });

  const handleSaveStaff = async (staffData) => {
    await saveStaff(staffData);
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    await deleteStaff(id);
  };

  // Attendance
  const handleAttendanceToggle = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    saveAttendance(studentId, status);
  };
  const handleSaveRegister = () => saveAllAttendance(attendance);

  // Events (real Firebase)
  const handleAddEvent = (eventData) => saveEvent(eventData);
  const handleDeleteEvent = (id) => deleteEvent(id);

  // Homework (real Firebase)
  const handleAddHomework = (hwData) => saveHomework(hwData || newHomework);
  const handleDeleteHomework = (id) => deleteHomework(id);

  // Notices (real Firebase)
  const handleSendNotice = (noticeData) => saveNotice(noticeData || noticeForm);
  const handleMarkRead = (id) => markNoticeRead(id);
  const handleDeleteNotice = (id) => deleteNotice(id);

  // Reports
  const loadSavedReports = async () => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "reports"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    setSavedReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const calculateGrade = (mark) => {
    if (mark >= 80) return "A";
    if (mark >= 70) return "B";
    if (mark >= 60) return "C";
    if (mark >= 50) return "D";
    return "E";
  };

  const calculateAverage = () => {
    if (!subjects.length) return 0;
    return (
      subjects.reduce((s, sub) => s + sub.mark, 0) / subjects.length
    ).toFixed(1);
  };

  const buildReportPayload = (numberToUse) => ({
    reportNumber: numberToUse,
    locked: true,
    status: "completed",
    academicInfo: {
      term,
      year: academicYear,
      issueDate: new Date().toISOString(),
    },
    student: { name: studentName, studentId, gradeLevel, dateOfBirth },
    parent: {
      name: parentName,
      email: parentEmail,
      phone: parentPhone,
      address: parentAddress,
    },
    subjects,
    performance: {
      average: calculateAverage(),
      totalSubjects: subjects.length,
    },
    attendance: {
      days: Number(attendanceDays),
      present: Number(attendancePresent),
      percentage: (
        (Number(attendancePresent) / Number(attendanceDays)) *
        100
      ).toFixed(1),
    },
    teacherComments,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const handleSaveReport = async () => {
    if (!user?.uid) return;
    let numberToUse = reportNumber;
    if (!reportId) {
      numberToUse = await generateReportCardNumber(user.uid);
      setReportNumber(numberToUse);
    }
    const reportData = buildReportPayload(numberToUse);
    if (reportId) {
      await updateDoc(doc(db, "users", user.uid, "reports", reportId), {
        ...reportData,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "reports"),
        reportData,
      );
      setReportId(ref.id);
    }
    alert("Report card saved successfully");
    loadSavedReports();
  };

  const loadReport = (report) => {
    setReportId(report.id);
    setReportNumber(report.reportNumber || "");
    setStudentName(report.student?.name || "");
    setStudentId(report.student?.studentId || "");
    setGradeLevel(report.student?.gradeLevel || "");
    setDateOfBirth(report.student?.dateOfBirth || "");
    setParentName(report.parent?.name || "");
    setParentEmail(report.parent?.email || "");
    setParentPhone(report.parent?.phone || "");
    setParentAddress(report.parent?.address || "");
    setTerm(report.academicInfo?.term || "");
    setAcademicYear(report.academicInfo?.year || "");
    setSubjects(report.subjects || []);
    setTeacherComments(report.teacherComments || "");
    setAttendanceDays(report.attendance?.days || "");
    setAttendancePresent(report.attendance?.present || "");
    setShowReportsList(false);
  };

  const openAI = (view) => {
    setAiDocType(VIEW_TO_DOC_TYPE[view] || "invoice");
    setAiWindowOpen(true);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  const navigate = (id) => {
    setActiveView(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // ── Nav items ────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "home", label: "Today's Overview", icon: Home },
    { id: "students", label: "Students", icon: Baby },
    {
      id: "attendance",
      label: "Attendance",
      icon: UserCheck,
      badge: `${presentCount}/${students.length}`,
    },
    { id: "timetable", label: "Timetable", icon: Clock },
    {
      id: "homework",
      label: "Homework & Tasks",
      icon: BookMarked,
      badge: homework.filter((h) => h.priority === "high").length || null,
    },
    {
      id: "notices",
      label: "Parent Notices",
      icon: Megaphone,
      badge: unreadNotices || null,
    },
    { id: "documents", label: "Documents & Compliance", icon: Shield },
    { id: "fees", label: "Fee Tracking", icon: CreditCard },
    { id: "staff", label: "Staff", icon: Users },
    { id: "events", label: "Events & Calendar", icon: Calendar },
    { id: "curriculum", label: "Curriculum", icon: BookOpen },
    { id: "assessment", label: "Assessments", icon: Award },
    { id: "reports", label: "Report Cards", icon: ClipboardList },
    { id: "behaviour", label: "Behaviour Log", icon: ShieldAlert },
    { id: "markbook", label: "Mark Book", icon: BarChart2 },
    { id: "library", label: "Library", icon: Library },
    { id: "slips", label: "Permission Slips", icon: ClipboardList },
    { id: "welfare", label: "Welfare Flags", icon: Heart },
    { id: "resources", label: "Resource Requests", icon: Package },
    { id: "trends", label: "Attendance Trends", icon: TrendingUp },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}
      className="flex h-[100dvh] bg-slate-100 overflow-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');
        :root {
          --brand: #4f46e5;
          --brand-light: #eef2ff;
          --brand-mid: #818cf8;
          --accent: #f59e0b;
          --success: #10b981;
          --danger: #ef4444;
          --warning: #f59e0b;
          --sidebar-w: 260px;
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .pill { display:inline-flex; align-items:center; gap:4px; padding:2px 10px; border-radius:999px; font-size:11px; font-weight:600; }
        .card { background:#fff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.04); }
        .btn-primary { background:var(--brand); color:#fff; border:none; border-radius:10px; padding:8px 18px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:opacity .15s; }
        .btn-primary:hover { opacity:.88; }
        .btn-ghost { background:transparent; border:1.5px solid #e2e8f0; border-radius:10px; padding:8px 14px; font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:6px; color:#475569; transition:background .15s; }
        .btn-ghost:hover { background:#f8fafc; }
        .btn-danger { background:#fee2e2; color:#dc2626; border:none; border-radius:8px; padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:4px; }
        .btn-danger:hover { background:#fecaca; }
        .status-present { background:#dcfce7; color:#16a34a; }
        .status-absent  { background:#fee2e2; color:#dc2626; }
        .status-late    { background:#fef9c3; color:#ca8a04; }
        .status-paid    { background:#dcfce7; color:#16a34a; }
        .status-partial { background:#fef9c3; color:#ca8a04; }
        .status-unpaid  { background:#fee2e2; color:#dc2626; }
        .nav-item { display:flex; align-items:center; gap:10px; padding:9px 14px; border-radius:12px; cursor:pointer; transition:all .15s; color:#64748b; font-size:13.5px; font-weight:500; position:relative; }
        .nav-item:hover { background:#f1f5f9; color:#1e293b; }
        .nav-item.active { background:var(--brand-light); color:var(--brand); font-weight:700; }
        .input { width:100%; padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; transition:border .15s; font-family:inherit; }
        .input:focus { border-color:var(--brand); }
        select.input { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:28px; }
        .timetable-cell { padding:6px 8px; border-radius:8px; font-size:11.5px; font-weight:500; text-align:center; min-height:44px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
        .priority-high   { background:#fee2e2; color:#dc2626; }
        .priority-medium { background:#fef9c3; color:#b45309; }
        .priority-low    { background:#dcfce7; color:#16a34a; }
        @media print { .no-print { display:none !important; } .card { box-shadow:none; border:1px solid #e2e8f0; } }
      `}</style>

      {/* ── SIDEBAR ── */}
      <EducationSidebar
        navigate={navigate}
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowSettings={setShowSettings}
        handleLogout={handleLogout}
        businessInfo={businessInfo}
        savedReports={savedReports}
        savedStudents={students}
        showReportsList={showReportsList}
        setShowReportsList={setShowReportsList}
        onOpenStudentModal={() => {
          setSelectedStudent(null);
          setShowStudentModal(true);
        }}
        onOpenStudentsListModal={() => setShowStudentsListModal(true)}
        onOpenNoticeModal={() => setShowNoticeModal(true)}
        onOpenHomeworkModal={() => setShowHomeworkModal(true)}
        onOpenAttendanceModal={() => setShowAttendanceModal(true)}
        onOpenEventModal={() => setShowEventModal(true)}
        onOpenStaffModal={() => setShowStaffModal(true)}
        onOpenTimetableModal={() => setShowTimetableModal(true)}
      />

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-h-0 transition-all duration-300">
        {/* Top bar */}
        <header className="no-print bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {navItems.find((n) => n.id === activeView)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500">
              <Bell className="w-5 h-5" />
              {unreadNotices > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    background: "#ef4444",
                    borderRadius: "50%",
                    display: "block",
                  }}
                />
              )}
            </button>
          </div>
        </header>

        {showSettings && (
          <BusinessSettingsModal onClose={() => setShowSettings(false)} />
        )}

        {/* ── CONTENT ── */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">
          {/* HOME */}
          {activeView === "home" && (
            <HomeView
              dayName={dayName}
              presentCount={presentCount}
              absentCount={absentCount}
              lateCount={lateCount}
              totalStudents={students.length}
              unreadNotices={unreadNotices}
              notices={notices}
              events={events}
              collectedFees={collectedFees ?? 0}
              totalFees={totalFees ?? 0}
              homework={homework}
              staff={staff}
              navigate={navigate}
              businessInfo={businessInfo}
              students={students}
            />
          )}

          {/* STUDENTS — full CRUD view using real Firebase data */}
          {activeView === "students" && (
            <StudentsView
              students={students}
              loading={studentsLoading}
              onAdd={handleAddNewStudent}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {/* ATTENDANCE — real students + real Firebase attendance */}
          {activeView === "attendance" && (
            <AttendanceView
              students={students}
              attendance={attendance}
              onToggle={handleAttendanceToggle}
              onSaveRegister={handleSaveRegister}
              presentCount={presentCount}
              absentCount={absentCount}
              lateCount={lateCount}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              dateStr={dateStr}
            />
          )}

          {/* TIMETABLE */}
          {activeView === "timetable" && (
            <TimetableView
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />
          )}

          {/* HOMEWORK — real Firebase */}
          {activeView === "homework" && (
            <HomeworkView
              homework={homework}
              newHomework={newHomework}
              setNewHomework={setNewHomework}
              showForm={showHomeworkForm}
              setShowForm={setShowHomeworkForm}
              onAdd={handleAddHomework}
              onDelete={handleDeleteHomework}
            />
          )}

          {/* NOTICES — real Firebase */}
          {activeView === "notices" && (
            <NoticesView
              notices={notices}
              showForm={showNoticeForm}
              setShowForm={setShowNoticeForm}
              noticeForm={noticeForm}
              setNoticeForm={setNoticeForm}
              students={students}
              businessInfo={businessInfo}
              onSend={handleSendNotice}
              onMarkRead={handleMarkRead}
              onDelete={handleDeleteNotice}
            />
          )}

          {/* DOCUMENTS */}
          {activeView === "documents" && (
            <div className="card p-6">
              <div style={{ marginBottom: 16 }}>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Documents & Compliance
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  Track your SA ECD registration documents and access government
                  portals.
                </p>
              </div>
              <DocumentsVault user={user} />
            </div>
          )}

          {/* FEES — real Firebase via FeesViewFirebase */}
          {activeView === "fees" && (
            <FeesViewFirebase userId={user?.uid} businessInfo={businessInfo} />
          )}

          {/* STAFF — real Firebase data */}
          {activeView === "staff" && (
            <StaffView
              staff={staff}
              onStatusToggle={handleStaffStatusToggle}
              onAdd={() => setShowStaffModal(true)}
              onDelete={handleDeleteStaff}
            />
          )}

          {/* EVENTS — real Firebase */}
          {activeView === "events" && (
            <EventsView
              events={events}
              onAdd={() => setShowEventModal(true)}
              onDelete={handleDeleteEvent}
            />
          )}

          {/* CURRICULUM */}
          {activeView === "curriculum" && <Curriculum />}

          {/* ASSESSMENTS — fixed nav ID match */}
          {activeView === "assessment" && <Assessment />}

          {/* REPORT CARDS */}
          {activeView === "reports" && (
            <div style={{ margin: "-24px", height: "calc(100vh - 64px)" }}>
              <Reports />
            </div>
          )}

          {/* BEHAVIOUR LOG */}
          {activeView === "behaviour" && <BehaviourLogView uid={user?.uid} />}

          {/* MARK BOOK */}
          {activeView === "markbook" && <MarkBookView uid={user?.uid} />}

          {/* PERMISSION SLIPS */}
          {activeView === "slips" && <PermissionSlipView uid={user?.uid} />}

          {/* WELFARE FLAGS */}
          {activeView === "welfare" && <WelfareFlagsView uid={user?.uid} />}

          {/* RESOURCE REQUESTS */}
          {activeView === "resources" && (
            <ResourceRequestsView uid={user?.uid} />
          )}

          {/* ATTENDANCE TRENDS */}
          {activeView === "trends" && (
            <AttendanceTrends userId={user?.uid} students={students} />
          )}
          {activeView === "library" && <LibraryView userId={user?.uid} />}
          {/* TEMPLATES */}
          {activeView === "templates" && (
            <div className="h-full overflow-y-auto p-6">
              <Templates user={user} />
            </div>
          )}
{activeView === "marketplace" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceMarketplaceView user={user} businessInfo={businessInfo} />
  </div>
)}

{activeView === "incoming-requests" && (
  <div className="flex-1 overflow-y-auto p-6">
    <ServiceRequestsView user={user} businessInfo={businessInfo} />
  </div>
)}
          {/* OVERVIEW */}
          {activeView === "overview" && (
            <SchoolOverview
              students={students}
              staff={staff}
              attendance={attendance}
              events={events}
              homework={homework}
              notices={notices}
              businessInfo={businessInfo}
            />
          )}
        </main>
      </div>

      {/* ── AI WINDOW ── */}
      {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          industry="education"
          onNavigateTo={(view) => {
            setAiWindowOpen(false);
            setActiveView(view);
          }}
          TemplateRenderer={TemplateRenderer}
        />
      )}

      {/* ── MODALS ── */}
      <NoticeModal
        open={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        onSave={saveNotice}
      />
      <HomeworkModal
        open={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        onSave={saveHomework}
      />
      <AttendanceModal
        open={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        students={students}
        attendance={attendance}
        onToggle={handleAttendanceToggle}
        onSaveAll={saveAllAttendance}
        dateStr={todayISO}
      />
      <EventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={saveEvent}
      />
      <StaffModal
        open={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onSave={saveStaff}
      />
      <StudentModal
        open={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSave={saveStudent}
        initial={selectedStudent}
      />
      <TimetableModal
        open={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
        onSave={saveTimetable}
        timetable={timetable}
      />
      <StudentsListModal
        open={showStudentsListModal}
        onClose={() => setShowStudentsListModal(false)}
        students={students}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
      />
            {/* ── Mobile bottom nav ── */}
<div
  className="lg:hidden"
  style={{
    flexShrink: 0,
    display: "flex",
    alignItems: "stretch",
    background: "#fff",
    borderTop: "1px solid #e2e8f0",
    zIndex: 40,
  }}
>
  {bottomNavItems.map(({ id, icon: Icon, label }) => (
    <button
      key={id}
      onClick={() => navigate(id)}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 4px 10px",
        gap: 3,
        fontSize: 10,
        fontWeight: 600,
        border: "none",
        background: "none",
        cursor: "pointer",
        color: activeView === id ? "var(--brand)" : "#94a3b8",
        position: "relative",
        transition: "color .15s",
      }}
    >
      {activeView === id && (
        <span style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 28,
          height: 2,
          background: "var(--brand)",
          borderRadius: "0 0 4px 4px",
        }} />
      )}
      <Icon style={{ width: 20, height: 20 }} />
      <span>{label}</span>
    </button>
  ))}
</div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENTS VIEW — full CRUD with real Firebase data
// ═══════════════════════════════════════════════════════════════════════════════
const StudentsView = ({
  students,
  loading,
  onAdd,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
}) => {
  const [filterGrade, setFilterGrade] = useState("All");

  const grades = [
    "All",
    ...Array.from(new Set(students.map((s) => s.grade).filter(Boolean))).sort(),
  ];

  const filtered = students.filter((s) => {
    const matchGrade = filterGrade === "All" || s.grade === filterGrade;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.parent?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q);
    return matchGrade && matchSearch;
  });

  const feeStatusColor = (status) => {
    if (status === "paid") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "partial") return { bg: "#fef9c3", color: "#b45309" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
        }}
      >
        <div style={{ fontSize: 14, color: "#94a3b8" }}>Loading students…</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
            Students
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled
          </div>
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: "#94a3b8",
            }}
          />
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder="Search by name, parent or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setFilterGrade(g)}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: filterGrade === g ? "var(--brand)" : "#f1f5f9",
                color: filterGrade === g ? "#fff" : "#475569",
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Enrolled", value: students.length, color: "#6366f1" },
          { label: "Grades", value: grades.length - 1, color: "#0ea5e9" },
          {
            label: "Fees Paid",
            value: students.filter((s) => s.fees?.status === "paid").length,
            color: "#10b981",
          },
          {
            label: "Fees Owing",
            value: students.filter((s) => s.fees?.status !== "paid").length,
            color: "#ef4444",
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Student list */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎒</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
            No students found
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            {students.length === 0
              ? "Add your first student to get started."
              : "Try adjusting your search or filter."}
          </div>
          {students.length === 0 && (
            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={onAdd}
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {[
                  "Student",
                  "Grade",
                  "Parent / Guardian",
                  "Contact",
                  "Fees",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const feeStatus =
                  s.fees?.status ||
                  (s.fees?.paid >= s.fees?.total
                    ? "paid"
                    : s.fees?.paid > 0
                      ? "partial"
                      : "unpaid");
                const fc = feeStatusColor(feeStatus);
                return (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom:
                        i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                    }}
                  >
                    {/* Name + avatar */}
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            flexShrink: 0,
                            background: s.photo
                              ? "transparent"
                              : `hsl(${(s.name?.charCodeAt(0) || 0) * 47},70%,88%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color: `hsl(${(s.name?.charCodeAt(0) || 0) * 47},50%,35%)`,
                            overflow: "hidden",
                          }}
                        >
                          {s.photo ? (
                            <img
                              src={s.photo}
                              alt={s.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            s.name
                              ?.split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "?"
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {s.name}
                          </div>
                          {s.age && (
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>
                              Age {s.age}
                            </div>
                          )}
                          <MedicalAlert student={s} />
                        </div>
                      </div>
                    </td>
                    {/* Grade */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          background: "#eef2ff",
                          color: "#4f46e5",
                          padding: "3px 10px",
                          borderRadius: 99,
                        }}
                      >
                        {s.grade || "—"}
                      </span>
                    </td>
                    {/* Parent */}
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      {s.parent || "—"}
                    </td>
                    {/* Contact */}
                    <td style={{ padding: "12px 16px" }}>
                      {s.phone && (
                        <a
                          href={`tel:${s.phone}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "#64748b",
                            textDecoration: "none",
                          }}
                        >
                          <Phone className="w-3 h-3" />
                          {s.phone}
                        </a>
                      )}
                      {s.email && (
                        <a
                          href={`mailto:${s.email}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "#64748b",
                            textDecoration: "none",
                            marginTop: 2,
                          }}
                        >
                          <Mail className="w-3 h-3" />
                          {s.email}
                        </a>
                      )}
                    </td>
                    {/* Fees */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        className="pill"
                        style={{ background: fc.bg, color: fc.color }}
                      >
                        {feeStatus.charAt(0).toUpperCase() + feeStatus.slice(1)}
                      </span>
                      {s.fees?.paid != null && s.fees?.total != null && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#94a3b8",
                            marginTop: 3,
                          }}
                        >
                          R{Number(s.fees.paid).toLocaleString()} / R
                          {Number(s.fees.total).toLocaleString()}
                        </div>
                      )}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex gap-2">
                        <button
                          className="btn-ghost"
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          onClick={() => onEdit(s)}
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => onDelete(s.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════════════════════════════
const HomeView = ({
  dayName,
  presentCount,
  absentCount,
  lateCount,
  totalStudents,
  collectedFees,
  totalFees,
  unreadNotices,
  notices,
  events,
  homework,
  staff,
  navigate,
  businessInfo,
  students,
}) => {
  const feePercent =
    totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0;
  const attendPercent =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const upcomingEvents = [...events]
    .filter((e) => !e._placeholder)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  const urgentHomework = homework.filter((h) => h.priority === "high");
  const absentStaff = staff.filter(
    (s) => !s._placeholder && s.status === "absent",
  );

  const StatCard = ({ label, value, sub, color, icon: Icon, onClick }) => (
    <div
      className="card p-5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
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
              fontSize: 28,
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
          <Icon style={{ color }} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div
        style={{
          background: "#7ca6ab",
          borderRadius: 2,
          padding: "24px 28px",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 13,
            opacity: 0.75,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Good morning 👋
        </div>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24 }}>
          Happy {dayName}!
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
          Here's what's happening at school today.
        </div>
        {absentStaff.length > 0 && (
          <div
            style={{
              marginTop: 12,
              background: "rgba(255,255,255,.15)",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            ⚠️ {absentStaff.map((s) => s.name).join(", ")}{" "}
            {absentStaff.length === 1 ? "is" : "are"} absent today
          </div>
        )}
        {businessInfo?.portalSlug && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            {/* Parent Portal */}
            <div
              style={{
                flex: 1,
                minWidth: 220,
                background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                border: "1.5px solid #c7d2fe",
                borderRadius: 14,
                padding: "14px 16px",
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
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCap
                    style={{ width: 16, height: 16, color: "#fff" }}
                  />
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#3730a3" }}
                  >
                    Parent Portal
                  </div>
                  <div style={{ fontSize: 11, color: "#6366f1" }}>
                    Share with parents
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #c7d2fe",
                  borderRadius: 9,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4338ca",
                  wordBreak: "break-all",
                  marginBottom: 10,
                }}
              >
                {window.location.origin}/parents/{businessInfo.portalSlug}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/parents/${businessInfo.portalSlug}`,
                    );
                    alert("Parent portal link copied!");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Copy Link
                </button>
                <button
                  onClick={() =>
                    window.open(`/parents/${businessInfo.portalSlug}`, "_blank")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#4f46e5",
                    border: "1.5px solid #c7d2fe",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
            {/* Staff Portal */}
            <div
              style={{
                flex: 1,
                minWidth: 220,
                background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                border: "1.5px solid #86efac",
                borderRadius: 14,
                padding: "14px 16px",
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
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users style={{ width: 16, height: 16, color: "#fff" }} />
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}
                  >
                    Staff Portal
                  </div>
                  <div style={{ fontSize: 11, color: "#16a34a" }}>
                    Share with teachers
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #86efac",
                  borderRadius: 9,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#15803d",
                  wordBreak: "break-all",
                  marginBottom: 10,
                }}
              >
                {window.location.origin}/staff/{businessInfo.portalSlug}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/staff/${businessInfo.portalSlug}`,
                    );
                    alert("Staff portal link copied!");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Copy Link
                </button>
                <button
                  onClick={() =>
                    window.open(`/staff/${businessInfo.portalSlug}`, "_blank")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#16a34a",
                    border: "1.5px solid #86efac",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Present Today"
          value={`${presentCount}/${totalStudents}`}
          sub={`${attendPercent}% attendance`}
          color="#10b981"
          icon={UserCheck}
          onClick={() => navigate("attendance")}
        />
        <StatCard
          label="Absent"
          value={absentCount}
          sub={lateCount > 0 ? `${lateCount} late` : "All others on time"}
          color="#ef4444"
          icon={AlertCircle}
          onClick={() => navigate("attendance")}
        />
        <StatCard
          label="Fees Collected"
          value={`${feePercent}%`}
          sub={`R${Number(collectedFees).toLocaleString()} / R${Number(totalFees).toLocaleString()}`}
          color="#f59e0b"
          icon={CreditCard}
          onClick={() => navigate("fees")}
        />
        <StatCard
          label="New Notices"
          value={unreadNotices}
          sub="unread by parents"
          color="#6366f1"
          icon={Megaphone}
          onClick={() => navigate("notices")}
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's timetable preview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              Today's Schedule
            </div>
            <button
              style={{
                fontSize: 12,
                color: "var(--brand)",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => navigate("timetable")}
            >
              View full →
            </button>
          </div>
          <div className="space-y-2">
            {TIME_SLOTS.slice(0, 4).map((time, i) => {
              const subject = MOCK_TIMETABLE["Grade 2"]?.[dayName]?.[i] || "—";
              const Icon = SUBJECT_ICONS[subject] || BookOpen;
              return (
                <div
                  key={time}
                  className="flex items-center gap-3 p-2 rounded-xl"
                  style={{ background: "#f8fafc" }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      width: 38,
                      flexShrink: 0,
                    }}
                  >
                    {time}
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: "#eef2ff",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--brand)" }}
                    />
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}
                  >
                    {subject}
                  </div>
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      color: "#94a3b8",
                    }}
                  >
                    Grade 2
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              Upcoming Events
            </div>
            <button
              style={{
                fontSize: 12,
                color: "var(--brand)",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => navigate("events")}
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                No upcoming events.
              </div>
            ) : (
              upcomingEvents.map((ev) => {
                const d = new Date(ev.date + "T12:00:00");
                const daysAway = Math.round((d - new Date()) / 86400000);
                const colorMap = {
                  emerald: "#10b981",
                  blue: "#3b82f6",
                  purple: "#8b5cf6",
                  red: "#ef4444",
                  amber: "#f59e0b",
                  slate: "#64748b",
                };
                const c = colorMap[ev.color] || "#6366f1";
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 p-2 rounded-xl"
                    style={{ background: "#f8fafc" }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: c + "15",
                        borderRadius: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: c,
                          lineHeight: 1,
                        }}
                      >
                        {d.getDate()}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: c,
                          letterSpacing: ".06em",
                        }}
                      >
                        {d
                          .toLocaleDateString("en", { month: "short" })
                          .toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                        className="truncate"
                      >
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {ev.time}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: daysAway <= 2 ? "#ef4444" : "#64748b",
                        background: daysAway <= 2 ? "#fee2e2" : "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {daysAway === 0
                        ? "Today"
                        : daysAway === 1
                          ? "Tomorrow"
                          : `${daysAway}d`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            🚨 Urgent Homework Due
          </div>
          {urgentHomework.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>
              No urgent tasks — all good!
            </div>
          ) : (
            urgentHomework.map((hw) => (
              <div key={hw.id} className="flex items-start gap-3 mb-3">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    background: "#ef4444",
                    borderRadius: "50%",
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                  >
                    {hw.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {hw.grade} · Due {hw.dueDate}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="card p-5">
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            📢 Latest Notice
          </div>
          {notices.slice(0, 2).map((n) => (
            <div
              key={n.id}
              style={{
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: 10,
                marginBottom: 10,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                >
                  {n.title}
                </div>
                {!n.read && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      background: "#6366f1",
                      borderRadius: "50%",
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
              <div
                style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}
                className="line-clamp-2"
              >
                {n.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE VIEW — real students + real Firebase attendance
// ═══════════════════════════════════════════════════════════════════════════════
const AttendanceView = ({
  students,
  attendance,
  onToggle,
  onSaveRegister,
  presentCount,
  absentCount,
  lateCount,
  selectedClass,
  setSelectedClass,
  dateStr,
}) => {
  const classOptions = [
    "All Classes",
    ...Array.from(new Set(students.map((s) => s.grade).filter(Boolean))).sort(),
  ];

  const filtered =
    selectedClass === "All Classes"
      ? students
      : students.filter((s) => s.grade === selectedClass);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Present",
            count: presentCount,
            color: "#10b981",
            bg: "#dcfce7",
          },
          {
            label: "Absent",
            count: absentCount,
            color: "#ef4444",
            bg: "#fee2e2",
          },
          { label: "Late", count: lateCount, color: "#f59e0b", bg: "#fef9c3" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>
              {s.count}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          {dateStr}
        </div>
        <div className="flex gap-2 flex-wrap ml-auto">
          {classOptions.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: selectedClass === c ? "var(--brand)" : "#f1f5f9",
                color: selectedClass === c ? "#fff" : "#475569",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14, color: "#94a3b8" }}>
            No students in this class yet.
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {["Student", "Grade", "Parent", "Status", "Mark"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const status = attendance[s.id] || "present";
                return (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom:
                        i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: `hsl(${(s.name?.charCodeAt(0) || 0) * 47},70%,88%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color: `hsl(${(s.name?.charCodeAt(0) || 0) * 47},50%,35%)`,
                          }}
                        >
                          {s.name
                            ?.split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "?"}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {s.name}
                          </div>
                          <MedicalAlert student={s} />
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      {s.grade}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      {s.parent || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className={`pill status-${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex gap-1.5">
                        {["present", "absent", "late"].map((st) => (
                          <button
                            key={st}
                            onClick={() => onToggle(s.id, st)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 600,
                              border: "none",
                              cursor: "pointer",
                              background:
                                status === st
                                  ? st === "present"
                                    ? "#10b981"
                                    : st === "absent"
                                      ? "#ef4444"
                                      : "#f59e0b"
                                  : "#f1f5f9",
                              color: status === st ? "#fff" : "#64748b",
                            }}
                          >
                            {st.charAt(0).toUpperCase() + st.slice(1)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <button className="btn-primary" onClick={onSaveRegister}>
          <Save className="w-4 h-4" /> Save Attendance Register
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIMETABLE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
const TimetableView = ({
  selectedClass,
  setSelectedClass,
  selectedDay,
  setSelectedDay,
}) => {
  const subjectColors = {
    Maths: "#eef2ff",
    English: "#f0fdf4",
    Afrikaans: "#fff7ed",
    Art: "#fdf4ff",
    Music: "#fff1f2",
    PE: "#ecfdf5",
    "PE/Movement": "#ecfdf5",
    "Natural Science": "#f0f9ff",
    Phonics: "#fefce8",
    Numbers: "#eef2ff",
    "Circle Time": "#fdf4ff",
    "Story Time": "#f0fdf4",
    "Life Skills": "#fff1f2",
    "Social Studies": "#fff7ed",
    Technology: "#eef2ff",
    "Free Play": "#f0fdf4",
    Library: "#f0f9ff",
    "Show & Tell": "#fdf4ff",
    Reading: "#f0fdf4",
    Snack: "#fff7ed",
    "Art & Craft": "#fdf4ff",
    Break: "#f8fafc",
    "Pack Up": "#f8fafc",
    "Goodbye Circle": "#fdf4ff",
    "Creative Writing": "#fefce8",
    "Creative Project": "#fdf4ff",
  };
  const timetable = MOCK_TIMETABLE[selectedClass] || {};

  return (
    <div className="space-y-5">
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          Class:
        </div>
        {CLASSES.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedClass(c)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              fontSize: 12.5,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: selectedClass === c ? "var(--brand)" : "#f1f5f9",
              color: selectedClass === c ? "#fff" : "#475569",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: ".06em",
                  borderBottom: "1px solid #e2e8f0",
                  width: 60,
                }}
              >
                TIME
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    borderBottom: "1px solid #e2e8f0",
                    cursor: "pointer",
                    color: selectedDay === d ? "var(--brand)" : "#475569",
                    background:
                      selectedDay === d ? "var(--brand-light)" : "transparent",
                  }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, ti) => (
              <tr key={time} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td
                  style={{
                    padding: "8px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                  }}
                >
                  {time}
                </td>
                {DAYS.map((day) => {
                  const subject = timetable[day]?.[ti] || "—";
                  const bg = subjectColors[subject] || "#f8fafc";
                  const Icon = SUBJECT_ICONS[subject];
                  return (
                    <td
                      key={day}
                      style={{ padding: "6px 8px", textAlign: "center" }}
                    >
                      <div
                        className="timetable-cell"
                        style={{
                          background: selectedDay === day ? bg : "#fafafa",
                          border:
                            selectedDay === day
                              ? `1px solid ${bg}`
                              : "1px solid transparent",
                        }}
                      >
                        {Icon && (
                          <Icon
                            className="w-3 h-3"
                            style={{ color: "#6366f1", opacity: 0.7 }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 500,
                            color: "#374151",
                          }}
                        >
                          {subject}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          {selectedDay} — {selectedClass}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {TIME_SLOTS.map((time, ti) => {
            const subject = timetable[selectedDay]?.[ti] || "Free";
            const Icon = SUBJECT_ICONS[subject] || BookOpen;
            return (
              <div key={time} className="card p-3 text-center">
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94a3b8",
                    marginBottom: 6,
                  }}
                >
                  {time}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "#eef2ff",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 6px",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--brand)" }} />
                </div>
                <div
                  style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}
                >
                  {subject}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOMEWORK VIEW — real Firebase handlers
// ═══════════════════════════════════════════════════════════════════════════════
const HomeworkView = ({
  homework,
  newHomework,
  setNewHomework,
  showForm,
  setShowForm,
  onAdd,
  onDelete,
}) => {
  const handleAdd = () => {
    if (!newHomework.title || !newHomework.subject) return;
    onAdd(newHomework);
    setNewHomework({
      subject: "",
      grade: "Grade 1",
      title: "",
      dueDate: "",
      priority: "medium",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
            Homework & Assignments
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {homework.length} tasks across all grades
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {showForm && (
        <div
          className="card p-5 border-2"
          style={{ borderColor: "var(--brand)", borderStyle: "dashed" }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 14,
            }}
          >
            New Homework Task
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Subject *
              </label>
              <input
                className="input"
                placeholder="e.g. Maths"
                value={newHomework.subject}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, subject: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Grade *
              </label>
              <select
                className="input"
                value={newHomework.grade}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, grade: e.target.value }))
                }
              >
                {["Grade R", "Grade 0", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map(
                  (g) => (
                    <option key={g}>{g}</option>
                  ),
                )}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Task Description *
              </label>
              <input
                className="input"
                placeholder="e.g. Complete worksheet pages 14-15"
                value={newHomework.title}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Due Date
              </label>
              <input
                className="input"
                type="date"
                value={newHomework.dueDate}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Priority
              </label>
              <select
                className="input"
                value={newHomework.priority}
                onChange={(e) =>
                  setNewHomework((p) => ({ ...p, priority: e.target.value }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High / Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={handleAdd}>
              <Check className="w-4 h-4" />
              Save Task
            </button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {["high", "medium", "low"].map((priority) => {
          const items = homework.filter(
            (h) => !h._placeholder && h.priority === priority,
          );
          if (!items.length) return null;
          const labels = {
            high: "🚨 Urgent",
            medium: "📋 Medium Priority",
            low: "✅ Low Priority",
          };
          return (
            <div key={priority}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                {labels[priority]}
              </div>
              <div className="space-y-2">
                {items.map((hw) => (
                  <div key={hw.id} className="card p-4 flex items-start gap-3">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "#eef2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <BookOpen
                        className="w-4 h-4"
                        style={{ color: "var(--brand)" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {hw.title}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}
                      >
                        {hw.subject} · {hw.grade} ·{" "}
                        {hw.assignedBy || "Unassigned"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hw.dueDate && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#64748b",
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: 99,
                          }}
                        >
                          Due {hw.dueDate}
                        </span>
                      )}
                      <span className={`pill priority-${priority}`}>
                        {priority}
                      </span>
                      <button
                        onClick={() => onDelete(hw.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {homework.filter((h) => !h._placeholder).length === 0 && (
          <div className="card p-10 text-center">
            <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>
              No homework tasks yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTICES VIEW — real Firebase handlers
// ═══════════════════════════════════════════════════════════════════════════════
const NoticesView = ({
  notices,
  showForm,
  setShowForm,
  noticeForm,
  setNoticeForm,
  students,
  businessInfo,
  onSend,
  onMarkRead,
  onDelete,
}) => {
  const handleSend = () => {
    if (!noticeForm.title || !noticeForm.message) return;
    onSend(noticeForm);
    setNoticeForm({
      title: "",
      message: "",
      recipient: "All Parents",
      type: "info",
    });
    setShowForm(false);
  };

  const typeConfig = {
    important: { label: "Important", bg: "#fee2e2", color: "#dc2626" },
    action: { label: "Action Required", bg: "#fef9c3", color: "#ca8a04" },
    fee: { label: "Fee Notice", bg: "#ede9fe", color: "#7c3aed" },
    info: { label: "Info", bg: "#dbeafe", color: "#2563eb" },
  };

  const sendWhatsApp = (targets, message) => {
    if (!targets.length) {
      alert("No parents with saved phone numbers.");
      return;
    }
    targets.forEach((student, i) => {
      setTimeout(() => {
        const cleaned = student.phone
          .replace(/\s+/g, "")
          .replace(/-/g, "")
          .replace(/^\+/, "")
          .replace(/^0/, "27");
        window.open(`https://wa.me/${cleaned}?text=${message}`, "_blank");
      }, i * 600);
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
            Parent Notices
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {notices.filter((n) => !n.read).length} unread notices
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Megaphone className="w-4 h-4" />
          New Notice
        </button>
      </div>

      {showForm && (
        <div
          className="card p-5 border-2"
          style={{ borderColor: "#6366f1", borderStyle: "dashed" }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 14,
            }}
          >
            Compose Notice
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Notice Type
                </label>
                <select
                  className="input"
                  value={noticeForm.type}
                  onChange={(e) =>
                    setNoticeForm((p) => ({ ...p, type: e.target.value }))
                  }
                >
                  <option value="info">Info</option>
                  <option value="important">Important</option>
                  <option value="action">Action Required</option>
                  <option value="fee">Fee Notice</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Send To
                </label>
                <select
                  className="input"
                  value={noticeForm.recipient}
                  onChange={(e) =>
                    setNoticeForm((p) => ({ ...p, recipient: e.target.value }))
                  }
                >
                  {[
                    "All Parents",
                    "Pre-School Parents",
                    "Grade R Parents",
                    "Grade 0 Parents",
                    "Grade 1 Parents",
                    "Grade 2 Parents",
                    "Grade 3 Parents",
                    "Grade 4 Parents",
                    "Grade 5 Parents",
                    "Grade 6 Parents",
                    "Grade 7 Parents",
                    "Selected Parents",
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Subject / Title *
              </label>
              <input
                className="input"
                placeholder="Notice subject"
                value={noticeForm.title}
                onChange={(e) =>
                  setNoticeForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Message *
              </label>
              <textarea
                className="input"
                rows={4}
                placeholder="Type your message to parents…"
                value={noticeForm.message}
                onChange={(e) =>
                  setNoticeForm((p) => ({ ...p, message: e.target.value }))
                }
                style={{ resize: "vertical" }}
              />
            </div>

            {/* WhatsApp delivery */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1.5px solid #86efac",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#15803d",
                  marginBottom: 8,
                }}
              >
                📱 WhatsApp Delivery
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: !noticeForm.title || !noticeForm.message ? 0.5 : 1,
                  }}
                  disabled={!noticeForm.title || !noticeForm.message}
                  onClick={() => {
                    let targets = students.filter((s) => s.phone);
                    if (noticeForm.recipient === "Grade 1 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 1");
                     else if (noticeForm.recipient === "Grade R Parents")
                      targets = targets.filter((s) => s.grade === "Grade R");
                     else if (noticeForm.recipient === "Grade 0 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 0");
                    else if (noticeForm.recipient === "Grade 2 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 2");
                    else if (noticeForm.recipient === "Grade 3 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 3");
                     else if (noticeForm.recipient === "Grade 4 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 4");
                     else if (noticeForm.recipient === "Grade 5 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 5");
                     else if (noticeForm.recipient === "Grade 6 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 6");
                     else if (noticeForm.recipient === "Grade 7 Parents")
                      targets = targets.filter((s) => s.grade === "Grade 7");
                    const msg = encodeURIComponent(
                      `📚 *${noticeForm.title}*\n\n${noticeForm.message}\n\n_Sent by ${businessInfo?.name || "the school"}_`,
                    );
                    sendWhatsApp(targets, msg);
                  }}
                >
                  Send to {noticeForm.recipient} via WhatsApp
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#16a34a",
                    border: "1.5px solid #86efac",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: !noticeForm.title || !noticeForm.message ? 0.5 : 1,
                  }}
                  disabled={!noticeForm.title || !noticeForm.message}
                  onClick={() => {
                    const raw = window.prompt("Enter parent WhatsApp number:");
                    if (!raw) return;
                    const cleaned = raw
                      .replace(/\s+/g, "")
                      .replace(/-/g, "")
                      .replace(/^\+/, "")
                      .replace(/^0/, "27");
                    const msg = encodeURIComponent(
                      `📚 *${noticeForm.title}*\n\n${noticeForm.message}\n\n_Sent by ${businessInfo?.name || "the school"}_`,
                    );
                    window.open(
                      `https://wa.me/${cleaned}?text=${msg}`,
                      "_blank",
                    );
                  }}
                >
                  Send to One Number
                </button>
              </div>
              <div style={{ fontSize: 10, color: "#86efac", marginTop: 8 }}>
                ℹ️ Opens WhatsApp for each parent. Allow popups for bulk
                sending.
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={handleSend}>
              <Send className="w-4 h-4" />
              Save Notice
            </button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notices
          .filter((n) => !n._placeholder)
          .map((n) => {
            const tc = typeConfig[n.type] || typeConfig.info;
            return (
              <div
                key={n.id}
                className="card p-4"
                style={{
                  borderLeft: `4px solid ${tc.color}`,
                  opacity: n.read ? 0.65 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="pill"
                        style={{ background: tc.bg, color: tc.color }}
                      >
                        {tc.label}
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {n.recipient}
                      </span>
                      {!n.read && (
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            background: "var(--brand)",
                            borderRadius: "50%",
                            display: "inline-block",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {n.message}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}
                    >
                      Sent: {n.date}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {!n.read && (
                      <button
                        className="btn-ghost"
                        style={{ padding: "5px 10px", fontSize: 11 }}
                        onClick={() => onMarkRead(n.id)}
                      >
                        <Check className="w-3 h-3" />
                        Mark read
                      </button>
                    )}
                    <button
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                      onClick={() => onDelete(n.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        {notices.filter((n) => !n._placeholder).length === 0 && (
          <div className="card p-10 text-center">
            <div style={{ fontSize: 32, marginBottom: 8 }}>📢</div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>
              No notices yet. Create your first notice above.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF VIEW — real Firebase data + delete + status toggle
// ═══════════════════════════════════════════════════════════════════════════════
const StaffView = ({ staff, onStatusToggle, onAdd, onDelete }) => {
  const realStaff = staff.filter((s) => !s._placeholder);
  const presentCount = realStaff.filter((s) => s.status !== "absent").length;
  const absentCount = realStaff.filter((s) => s.status === "absent").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          Staff Management
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Staff",
            count: realStaff.length,
            color: "var(--brand)",
          },
          { label: "Present", count: presentCount, color: "#10b981" },
          { label: "Absent", count: absentCount, color: "#ef4444" },
          {
            label: "Classes Today",
            count: realStaff.reduce((s, t) => s + (t.classes?.length || 0), 0),
            color: "#f59e0b",
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
              {s.count}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {realStaff.length === 0 ? (
        <div className="card p-10 text-center">
          <div style={{ fontSize: 32, marginBottom: 8 }}>👩‍🏫</div>
          <div style={{ fontSize: 14, color: "#94a3b8" }}>
            No staff added yet.
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: 16 }}
            onClick={onAdd}
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {realStaff.map((s) => (
            <div key={s.id} className="card p-5 flex items-start gap-4">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: s.status === "present" ? "#dcfce7" : "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: s.status === "present" ? "#16a34a" : "#dc2626",
                  }}
                >
                  {s.name?.split(" ").slice(-1)[0]?.[0] || "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}
                >
                  {s.name}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
                  {s.role} · {s.subject}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(s.classes || []).map((c) => (
                    <span
                      key={c}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        background: "#eef2ff",
                        color: "var(--brand)",
                        padding: "2px 8px",
                        borderRadius: 99,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                {s.phone && (
                  <a
                    href={`tel:${s.phone}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      color: "#64748b",
                      marginTop: 8,
                      textDecoration: "none",
                    }}
                  >
                    <Phone className="w-3 h-3" />
                    {s.phone}
                  </a>
                )}
                {/* Status toggle */}
                <div className="flex gap-2 mt-3">
                  {["present", "absent"].map((st) => (
                    <button
                      key={st}
                      onClick={() => onStatusToggle(s.id, st)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background:
                          s.status === st
                            ? st === "present"
                              ? "#10b981"
                              : "#ef4444"
                            : "#f1f5f9",
                        color: s.status === st ? "#fff" : "#64748b",
                      }}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                  <button
                    className="btn-danger"
                    style={{ marginLeft: "auto" }}
                    onClick={() => onDelete(s.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <span className={`pill status-${s.status || "present"}`}>
                {(s.status || "present").charAt(0).toUpperCase() +
                  (s.status || "present").slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS VIEW — real Firebase data + delete
// ═══════════════════════════════════════════════════════════════════════════════
const EventsView = ({ events, onAdd, onDelete }) => {
  const realEvents = events.filter((e) => !e._placeholder);
  const sorted = [...realEvents].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  const colorMap = {
    emerald: { bg: "#dcfce7", color: "#16a34a" },
    blue: { bg: "#dbeafe", color: "#2563eb" },
    purple: { bg: "#ede9fe", color: "#7c3aed" },
    red: { bg: "#fee2e2", color: "#dc2626" },
    amber: { bg: "#fef9c3", color: "#b45309" },
    slate: { bg: "#f1f5f9", color: "#475569" },
  };
  const typeIcons = {
    event: Star,
    meeting: Users,
    concert: Music,
    deadline: AlertCircle,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          School Calendar & Events
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-10 text-center">
          <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
          <div style={{ fontSize: 14, color: "#94a3b8" }}>No events yet.</div>
          <button
            className="btn-primary"
            style={{ marginTop: 16 }}
            onClick={onAdd}
          >
            <Plus className="w-4 h-4" />
            Add First Event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ev) => {
            const d = new Date((ev.date || "") + "T12:00:00");
            const daysAway = Math.round((d - new Date()) / 86400000);
            const c = colorMap[ev.color] || colorMap.slate;
            const Icon = typeIcons[ev.type] || Calendar;
            return (
              <div key={ev.id} className="card p-4 flex items-center gap-4">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: c.bg,
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: c.color,
                      lineHeight: 1,
                    }}
                  >
                    {d.getDate()}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: c.color,
                      letterSpacing: ".06em",
                    }}
                  >
                    {d
                      .toLocaleDateString("en", { month: "short" })
                      .toUpperCase()}
                  </div>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: c.bg,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: c.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}
                  >
                    {ev.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {ev.time} · {ev.description}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 99,
                    background:
                      daysAway < 0
                        ? "#f1f5f9"
                        : daysAway <= 2
                          ? "#fee2e2"
                          : c.bg,
                    color:
                      daysAway < 0
                        ? "#94a3b8"
                        : daysAway <= 2
                          ? "#dc2626"
                          : c.color,
                    flexShrink: 0,
                  }}
                >
                  {daysAway < 0
                    ? "Past"
                    : daysAway === 0
                      ? "Today"
                      : daysAway === 1
                        ? "Tomorrow"
                        : `In ${daysAway} days`}
                </div>
                <button className="btn-danger" onClick={() => onDelete(ev.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default EducationDashboard;
